const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..");
const summary = JSON.parse(fs.readFileSync(path.join(root, "data", "market-summary.json"), "utf8"));

test("market summary is traced, filtered and internally reconciled", () => {
  assert.equal(summary.source.name, "HM Land Registry Price Paid Data");
  assert.match(summary.source.inputSha256, /^[a-f0-9]{64}$/);
  assert.equal(summary.coverage.groupedRecords, summary.coverage.includedRecords);
  assert.equal(
    summary.rows.reduce((total, row) => total + row.sales, 0),
    summary.coverage.includedRecords,
  );
  assert.ok(summary.coverage.includedRecords < summary.coverage.sourceRecords);
  assert.ok(summary.rows.every((row) => row.p25 <= row.median && row.median <= row.p75));
});

test("public market data does not publish address fields", () => {
  assert.doesNotMatch(fs.readFileSync(path.join(root, "market-data.js"), "utf8"), /"address"\s*:/);
  assert.doesNotMatch(JSON.stringify(summary), /"address"\s*:/);
});

test("committed summary reconciles with the retained public source snapshot", () => {
  const sourcePath = path.join(root, "data", "price-paid-source.json");
  const raw = fs.readFileSync(sourcePath);
  assert.equal(crypto.createHash("sha256").update(raw).digest("hex"), summary.source.inputSha256);
  const source = JSON.parse(raw);
  assert.equal(source.records.length, summary.coverage.sourceRecords);
  assert.match(source.source.downloadUrl, /^https:\/\/price-paid-data\.publicdata\.landregistry\.gov\.uk\//);
  assert.ok(Date.parse(source.source.fetchedAt));
  assert.equal(source.records.length + source.coverage.excludedByGeography, source.coverage.downloadRecords);
  const included = source.records.filter(record => record.category === "A" && record.recordStatus === "A" &&
    summary.filters.propertyTypes.includes(record.propertyType) && record.price >= 50000 && record.price <= 3000000);
  assert.equal(included.length, summary.coverage.includedRecords);
  const labels = { detached: "Detached", "semi-detached": "Semi-detached", terraced: "Terraced", "flat-maisonette": "Flat" };
  for (const group of summary.rows) {
    const prices = included.filter(record => record.postcode === group.area && labels[record.propertyType] === group.type)
      .map(record => record.price).sort((a, b) => a - b);
    assert.equal(group.sales, prices.length);
    for (const [field, probability] of [["p25", .25], ["median", .5], ["p75", .75]]) {
      const position = (prices.length - 1) * probability;
      const lower = Math.floor(position);
      assert.equal(group[field], Math.round(prices[lower] + (prices[Math.ceil(position)] - prices[lower]) * (position - lower)));
    }
  }
  assert.equal(summary.coverage.sourceRecords, summary.coverage.includedRecords + summary.coverage.excludedRecords);
  for (const record of source.records) {
    assert.deepEqual(Object.keys(record).sort(), ["category", "date", "id", "postcode", "price", "propertyType", "recordStatus"].sort());
    assert.match(record.postcode, /^SO2[123]$/); // no full postcode or street address
  }
});

test("browser entry point has a local favicon", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(html, /rel="icon"[^>]+href="favicon.svg"/);
  assert.ok(fs.existsSync(path.join(root, "favicon.svg")));
});

test("public aggregates regenerate byte-for-byte without private inputs", () => {
  const before = ["data/market-summary.json", "market-data.js"].map(file => fs.readFileSync(path.join(root, file), "utf8"));
  require("node:child_process").execFileSync(process.execPath, ["scripts/build-market-summary.mjs"], { cwd: root });
  assert.deepEqual(["data/market-summary.json", "market-data.js"].map(file => fs.readFileSync(path.join(root, file), "utf8")), before);
});
