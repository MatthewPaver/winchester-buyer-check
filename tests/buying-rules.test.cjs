const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, "data", name), "utf8"));

test("the browser copy of the rules is generated from the checked data files", () => {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, "buying-rules.js"), "utf8"), sandbox);
  const rules = sandbox.window.WINCHESTER_BUYING_RULES;
  assert.deepEqual(JSON.parse(JSON.stringify(rules.sdlt)), readJson("sdlt-rates.json"));
  assert.deepEqual(JSON.parse(JSON.stringify(rules.lifetimeIsa)), readJson("lifetime-isa.json"));
  assert.deepEqual(JSON.parse(JSON.stringify(rules.materialInformation)), readJson("material-information.json"));
});

test("Lifetime ISA rules match GOV.UK and record when they were checked", () => {
  const lisa = readJson("lifetime-isa.json");
  assert.equal(lisa.priceLimit, 450000);
  assert.equal(lisa.monthsAfterFirstPayment, 12);
  assert.equal(lisa.bonusRatePercent, 25);
  assert.equal(lisa.maxContributionPerYear, 4000);
  assert.equal(lisa.maxBonusPerYear, lisa.maxContributionPerYear * (lisa.bonusRatePercent / 100));
  assert.equal(lisa.withdrawalChargePercent, 25);
  assert.match(lisa.lastVerified, /^\d{4}-\d{2}-\d{2}$/);
  for (const source of lisa.sources) assert.match(source.url, /^https:\/\/www\.gov\.uk\//);
  const { LISA_PRICE_LIMIT } = require("../calculator.js");
  assert.equal(LISA_PRICE_LIMIT, lisa.priceLimit);
});

test("checklist covers National Trading Standards Parts A, B and C", () => {
  const info = readJson("material-information.json");
  assert.deepEqual(info.groups.map((group) => group.id), ["A", "B", "C"]);
  const labels = info.groups.flatMap((group) => group.items.map((item) => item.label.toLowerCase())).join(" | ");
  for (const topic of [
    "council tax",
    "asking price",
    "tenure",
    "lease",
    "property type",
    "built",
    "room",
    "electricity",
    "water",
    "sewerage",
    "heating",
    "broadband",
    "mobile",
    "parking",
    "building safety",
    "restrictions",
    "rights and easements",
    "flood",
    "coastal erosion",
    "mining",
    "planning permission",
    "accessibility",
  ]) {
    assert.ok(labels.includes(topic), `missing ${topic}`);
  }
  const ids = info.groups.flatMap((group) => group.items.map((item) => item.id));
  assert.equal(new Set(ids).size, ids.length);
  assert.match(info.lastVerified, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(info.sources.some((source) => source.url.startsWith("https://www.gov.uk/")));
});
