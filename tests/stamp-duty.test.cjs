const assert = require("node:assert/strict");
const test = require("node:test");

const rates = require("../data/sdlt-rates.json");
const { stampDuty, stampDutyDetail, SDLT_RELIEF_LIMIT } = require("../calculator.js");

test("rates file records its GOV.UK sources, start date and check date", () => {
  assert.equal(rates.effectiveFrom, "2025-04-01");
  assert.match(rates.lastVerified, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(rates.sources.length >= 2);
  for (const source of rates.sources) assert.match(source.url, /^https:\/\/www\.gov\.uk\//);
  assert.equal(rates.firstTimeBuyerRelief.maxPrice, 500000);
  assert.equal(SDLT_RELIEF_LIMIT, 500000);
});

test("matches the worked examples published on GOV.UK", () => {
  for (const example of rates.workedExamplesFromSource) {
    assert.equal(stampDuty(example.price, example.firstTimeBuyer), example.tax, `${example.price}`);
  }
});

test("standard rates at each band edge", () => {
  const cases = [
    [0, 0],
    [125000, 0],
    [125001, 0.02],
    [250000, 2500],
    [250001, 2500.05],
    [925000, 36250],
    [925001, 36250.1],
    [1500000, 93750],
    [1500001, 93750.12],
  ];
  for (const [price, tax] of cases) assert.equal(stampDuty(price, false), tax, `standard ${price}`);
});

test("first-time buyer relief: nothing to £300,000, 5% to £500,000, none above", () => {
  assert.equal(stampDuty(300000, true), 0);
  assert.equal(stampDuty(300001, true), 0.05);
  assert.equal(stampDuty(450000, true), 7500);
  assert.equal(stampDuty(500000, true), 10000);

  // £1 over the limit loses the relief on the whole price.
  const over = stampDutyDetail(500001, true);
  assert.equal(over.reliefApplies, false);
  assert.equal(over.reliefLost, true);
  assert.equal(over.tax, stampDuty(500001, false));
  assert.equal(over.tax, 15000.05);
});

test("ignores pence and bad input", () => {
  assert.equal(stampDuty(300000.99, true), 0);
  assert.equal(stampDuty(-5, false), 0);
  assert.equal(stampDuty("not a price", true), 0);
});
