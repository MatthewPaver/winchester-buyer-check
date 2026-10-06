#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const sourcePath = resolve(process.argv[2] || resolve(ROOT, "data/price-paid-source.json"));
const jsonPath = resolve(ROOT, "data/market-summary.json");
const jsPath = resolve(ROOT, "market-data.js");

const raw = await readFile(sourcePath);
const source = JSON.parse(raw.toString("utf8"));
const typeLabels = {
  detached: "Detached",
  "semi-detached": "Semi-detached",
  terraced: "Terraced",
  "flat-maisonette": "Flat",
};

function quantile(sorted, probability) {
  if (sorted.length === 1) return sorted[0];
  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position);
  const fraction = position - lower;
  return Math.round(sorted[lower] + (sorted[Math.min(lower + 1, sorted.length - 1)] - sorted[lower]) * fraction);
}

const accepted = source.records.filter((record) => {
  const area = String(record.postcode || "").split(/\s+/)[0];
  return (
    source.coverage.postcodePrefixes.includes(area) &&
    record.category === "A" &&
    record.recordStatus === "A" &&
    Object.hasOwn(typeLabels, record.propertyType) &&
    Number.isFinite(Number(record.price)) &&
    Number(record.price) >= 50_000 &&
    Number(record.price) <= 3_000_000
  );
});

const groups = new Map();
for (const record of accepted) {
  const area = record.postcode.split(/\s+/)[0];
  const type = typeLabels[record.propertyType];
  const key = `${area}|${type}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(Number(record.price));
}

const rows = [...groups.entries()]
  .map(([key, prices]) => {
    prices.sort((a, b) => a - b);
    const [area, type] = key.split("|");
    return {
      area,
      type,
      sales: prices.length,
      p25: quantile(prices, 0.25),
      median: quantile(prices, 0.5),
      p75: quantile(prices, 0.75),
    };
  })
  .sort((a, b) => a.area.localeCompare(b.area) || a.type.localeCompare(b.type));

const output = {
  schemaVersion: 1,
  generatedAt: source.source.fetchedAt,
  source: {
    ...source.source,
    inputSha256: createHash("sha256").update(raw).digest("hex"),
  },
  coverage: {
    ...source.coverage,
    sourceRecords: source.records.length,
    includedRecords: accepted.length,
    excludedRecords: source.records.length - accepted.length,
    groupedRecords: rows.reduce((total, row) => total + row.sales, 0),
  },
  filters: {
    postcodePrefixes: source.coverage.postcodePrefixes,
    category: "A (standard-price-paid transactions)",
    recordStatus: "A (addition in the retained yearly file; not a live status check)",
    propertyTypes: Object.keys(typeLabels),
    priceRangeGbp: [50_000, 3_000_000],
  },
  statistics: {
    band: "25th to 75th percentile",
    quantileMethod: "linear interpolation on sorted observed prices",
  },
  caveats: source.caveats,
  rows,
};

await mkdir(dirname(jsonPath), { recursive: true });
await writeFile(jsonPath, `${JSON.stringify(output, null, 2)}\n`);
await writeFile(jsPath, `window.WINCHESTER_MARKET_DATA = ${JSON.stringify(output, null, 2)};\n`);
console.log(`Wrote ${rows.length} groups from ${accepted.length}/${source.records.length} source records.`);
