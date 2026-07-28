const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const { calculatePurchase } = require("../calculator.js");

const standard = {
  price: 450000,
  deposit: 67500,
  rate: 4.5,
  term: 30,
  tax: 0,
  legal: 2500,
  survey: 900,
  moving: 1800,
  works: 10000,
  buffer: 350,
};

test("calculates the documented default mortgage and LTV", () => {
  const result = calculatePurchase(standard);
  assert.equal(Math.round(result.monthly), 1938);
  assert.equal(result.ltv, 85);
  assert.equal(result.cash, 82700);
});

test("handles cash purchases and clamps deposits to the price", () => {
  const result = calculatePurchase({ ...standard, deposit: 999999 });
  assert.equal(result.loan, 0);
  assert.equal(result.monthly, 0);
  assert.equal(result.ltv, 0);
});

test("handles a zero-rate mortgage", () => {
  const result = calculatePurchase({ ...standard, rate: 0 });
  assert.equal(Math.round(result.monthly), 1063);
  assert.equal(result.totalInterest, 0);
});

test("static page loads the pure calculator before the UI and scopes live updates", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  assert.match(html, /calculator\.js"><\/script>\s*<script src="app\.js/);
  assert.match(html, /id="result-status"[^>]+aria-live="polite"/);
  assert.doesNotMatch(html, /class="results" aria-live=/);
});
