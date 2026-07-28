const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const { calculateAffordability, calculatePurchase } = require("../calculator.js");

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

test("calculates the documented mortgage and LTV", () => {
  const result = calculatePurchase(standard);
  assert.equal(Math.round(result.monthly), 1938);
  assert.equal(result.ltv, 85);
  assert.equal(result.cash, 82700);
});

test("handles cash purchases and zero-rate mortgages", () => {
  assert.equal(calculatePurchase({ ...standard, deposit: 999999 }).loan, 0);
  assert.equal(Math.round(calculatePurchase({ ...standard, rate: 0 }).monthly), 1063);
});

test("affordability keeps the LISA cap and reserves explicit", () => {
  const result = calculateAffordability({
    askingPrice: 425000,
    salary: 72000,
    deposit: 85000,
    lisaContribution: 4000,
    useLisa: true,
    fees: 5500,
    reserve: 12000,
    works: 15000,
    multiple: 4.5,
    rate: 4.5,
    term: 30,
  });
  assert.equal(result.lisaBonus, 1000);
  assert.equal(result.modelledMaxPrice, 377500);
  assert.equal(result.headroom, -47500);
  assert.ok(result.monthly > 1600);
});

test("static page exposes the full five-part demo workspace", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  for (const route of ["homes", "market", "plan", "review", "evidence"]) {
    assert.match(html, new RegExp(`data-route="${route}"`));
  }
  assert.match(html, /calculator\.js"><\/script>\s*<script src="app\.js/);
  assert.match(html, /Nothing is uploaded or saved to a server/);
});
