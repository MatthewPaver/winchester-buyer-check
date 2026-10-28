const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const { assessBudget, buyingCosts, calculateAffordability, calculatePurchase, moneyOnTheDay, offerRange } = require("../calculator.js");

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

// The example plan from app.js. Buying costs: £5,000 plus stamp duty at the price.
const examplePlan = {
  askingPrice: 425000,
  salary: 72000,
  deposit: 85000,
  lisaContribution: 4000,
  useLisa: true,
  firstTimeBuyer: true,
  conveyancing: 2000,
  survey: 800,
  lenderFee: 1000,
  moving: 1200,
  reserve: 12000,
  works: 15000,
  multiple: 4.5,
  rate: 4.5,
  term: 30,
};

test("affordability keeps the LISA cap, reserves and stamp duty explicit", () => {
  const result = calculateAffordability(examplePlan);
  assert.equal(result.lisaBonus, 1000);
  assert.equal(result.borrowingCapacity, 324000);
  // £378,000 left for price and stamp duty; price + 5% of (price - £300,000) must fit.
  assert.equal(result.modelledMaxPrice, 374285);
  assert.equal(result.headroom, -50715);
  assert.equal(result.costs.stampDuty, 6250);
  assert.equal(result.cashForPrice, 47750);
  assert.equal(result.mortgageRequired, 377250);
  assert.ok(result.monthly > 1600);
});

test("the most you can pay is the highest price whose price plus costs still fits", () => {
  const { modelledMaxPrice } = calculateAffordability(examplePlan);
  const fits = (price) => price + buyingCosts(examplePlan, price).total <= 324000 + 86000 - 27000;
  assert.equal(fits(modelledMaxPrice), true);
  assert.equal(fits(modelledMaxPrice + 1), false);
});

test("money on the day adds the deposit and every buying cost", () => {
  const day = moneyOnTheDay(examplePlan, 365000);
  assert.equal(day.costs.stampDuty, 3250);
  assert.equal(day.costs.total, 8250);
  assert.equal(day.depositPaid, 50750);
  assert.equal(day.total, 59000);
  assert.equal(day.cashAvailable, 86000);
  assert.equal(day.leftAfter, 27000);
  assert.equal(day.mortgageRequired, 314250);
  assert.equal(day.mortgageShortfall, 0);

  const tooDear = moneyOnTheDay(examplePlan, 400000);
  assert.equal(tooDear.mortgageRequired, 351000);
  assert.equal(tooDear.mortgageShortfall, 27000);
});

test("the older single fees figure still counts as a buying cost", () => {
  const costs = buyingCosts({ fees: 5500, firstTimeBuyer: true }, 300000);
  assert.equal(costs.otherFees, 5500);
  assert.equal(costs.stampDuty, 0);
  assert.equal(costs.total, 5500);
});

test("review finance check judges each home against the plan, not only the Lifetime ISA limit", () => {
  const over = assessBudget(examplePlan, 400000);
  assert.equal(over.modelledMaxPrice, 374285);
  assert.equal(over.level, "over");
  assert.equal(over.tone, "danger");
  assert.equal(over.withinPlan, false);
  assert.equal(over.headroom, -25715);
  assert.equal(over.atLisaLimit, false);

  const tight = assessBudget(examplePlan, 365000);
  assert.equal(tight.level, "tight");
  assert.equal(tight.tone, "attention");
  assert.equal(tight.withinPlan, true);
  assert.equal(tight.headroom, 9285);

  const within = assessBudget({ ...examplePlan, salary: 90000 }, 365000);
  assert.equal(within.level, "within");
  assert.equal(within.tone, "success");
  assert.equal(within.modelledMaxPrice, 450000);
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
  assert.match(
    html,
    /buying-rules\.js"><\/script>\s*<script src="calculator\.js"><\/script>\s*<script src="scoring\.js"><\/script>\s*<script src="market-data\.js"><\/script>\s*<script src="app\.js/,
  );
  assert.match(html, /Nothing you enter leaves this browser/);
  // No requests to other sites: fonts are self-hosted and nothing loads from a CDN.
  assert.doesNotMatch(html, /(src|href)="https?:\/\/(?!github\.com\/MatthewPaver|matthewpaver\.github\.io)/);
  const css = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");
  assert.doesNotMatch(css, /url\(["']?https?:/);
});

test("offer range never goes above what the plan allows", () => {
  const home = { price: 400000, evidence: 82 };
  const open = offerRange(home, Infinity);
  assert.deepEqual([open.opening, open.offerTarget, open.walkAway], [380500, 390000, 405000]);
  assert.equal(open.cappedAtBudget, false);

  const capped = offerRange(home, 395000);
  assert.equal(capped.outOfReach, false);
  assert.equal(capped.walkAway, 395000);
  assert.equal(capped.offerTarget, 390000);
  assert.equal(capped.cappedAtBudget, true);

  const outOfReach = offerRange(home, assessBudget(examplePlan, 400000).modelledMaxPrice);
  assert.equal(outOfReach.outOfReach, true);
  assert.equal(outOfReach.budgetMax, 374285);
  assert.equal(outOfReach.suggestedOpening, 380500);
});
