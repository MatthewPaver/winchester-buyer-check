const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const { assessBudget, calculateAffordability, calculatePurchase } = require("../calculator.js");

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

// The example plan from app.js: the most it allows is £377,500.
const examplePlan = {
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
};

test("review finance check judges each home against the plan, not only the Lifetime ISA limit", () => {
  const over = assessBudget(examplePlan, 400000);
  assert.equal(over.modelledMaxPrice, 377500);
  assert.equal(over.level, "over");
  assert.equal(over.tone, "danger");
  assert.equal(over.headroom, -22500);
  assert.equal(over.atLisaLimit, false);

  const tight = assessBudget(examplePlan, 365000);
  assert.equal(tight.level, "tight");
  assert.equal(tight.tone, "attention");
  assert.equal(tight.headroom, 12500);

  const within = assessBudget({ ...examplePlan, salary: 90000 }, 365000);
  assert.equal(within.level, "within");
  assert.equal(within.tone, "success");
  assert.equal(within.headroom, 85000);
});

test("review finance check flags the Lifetime ISA limit only at or over it", () => {
  const atLimit = assessBudget({ ...examplePlan, salary: 120000 }, 450000);
  assert.equal(atLimit.atLisaLimit, true);
  assert.equal(atLimit.level, "tight");
  assert.equal(atLimit.headroom, 0);

  const overLimit = assessBudget(examplePlan, 460000);
  assert.equal(overLimit.level, "over-lisa");
  assert.equal(overLimit.tone, "danger");

  const noLisa = assessBudget({ ...examplePlan, useLisa: false, salary: 120000 }, 460000);
  assert.equal(noLisa.lisaBlocked, false);
  assert.equal(noLisa.atLisaLimit, false);
  assert.equal(noLisa.level, "within");
});

test("plan page and review agree for the same price", () => {
  const plan = assessBudget(examplePlan, examplePlan.askingPrice);
  assert.equal(plan.headroom, calculateAffordability(examplePlan).headroom);
  assert.equal(plan.level, "over");
});

test("static page exposes the full five-part demo workspace", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  for (const route of ["homes", "market", "plan", "review", "evidence"]) {
    assert.match(html, new RegExp(`data-route="${route}"`));
  }
  assert.match(html, /calculator\.js"><\/script>\s*<script src="market-data\.js"><\/script>\s*<script src="app\.js/);
  assert.match(html, /Nothing you enter leaves this browser/);
});
