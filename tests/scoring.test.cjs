const assert = require("node:assert/strict");
const test = require("node:test");

const {
  ANCHORS,
  CRITERIA,
  DEFAULT_IMPORTANCE,
  criterionMarks,
  fitScore,
  normaliseWeights,
  rankHomes,
  weightSensitivity,
} = require("../scoring.js");

const context = { budgetMax: 400000, lisaLimit: 450000, bedroomsNeeded: 2 };
const home = (overrides = {}) => ({ id: "a", price: 370000, station: 15, beds: 3, condition: "Cosmetic", evidence: 75, ...overrides });
const sum = (values) => values.reduce((total, value) => total + value, 0);

test("weights are shares that add up to 1, and only their ratios matter", () => {
  const shares = normaliseWeights(DEFAULT_IMPORTANCE);
  assert.ok(Math.abs(sum(Object.values(shares)) - 1) < 1e-12);
  assert.deepEqual(Object.keys(shares), CRITERIA.map((criterion) => criterion.id));
  assert.equal(shares.budget, 0.3);
  assert.equal(shares.walk, 0.25);

  const doubled = normaliseWeights(Object.fromEntries(Object.entries(DEFAULT_IMPORTANCE).map(([id, value]) => [id, value * 2])));
  assert.deepEqual(doubled, shares);

  const allZero = normaliseWeights({ budget: 0, walk: 0, bedrooms: 0, condition: 0, facts: 0 });
  assert.ok(Object.values(allZero).every((share) => share === 0.2));
});

test("each criterion is marked against a fixed anchor, not the other homes", () => {
  assert.equal(ANCHORS.walkFullMarks, 15);
  assert.equal(ANCHORS.walkHalfMarks, 22);
  assert.equal(ANCHORS.factsFullMarks, 75);

  assert.equal(criterionMarks(home({ station: 15 }), context).walk, 1);
  assert.equal(criterionMarks(home({ station: 22 }), context).walk, 0.5);
  assert.equal(criterionMarks(home({ station: 30 }), context).walk, 0);
  assert.equal(criterionMarks(home({ station: 38 }), context).walk, 0);

  assert.equal(criterionMarks(home({ evidence: 75 }), context).facts, 1);
  assert.equal(criterionMarks(home({ evidence: 90 }), context).facts, 1);
  assert.equal(criterionMarks(home({ evidence: 51 }), context).facts, 0.68);

  assert.equal(criterionMarks(home({ beds: 3 }), context).bedrooms, 1);
  assert.equal(criterionMarks(home({ beds: 2 }), context).bedrooms, 0.75);
  assert.equal(criterionMarks(home({ beds: 1 }), context).bedrooms, 0.25);

  assert.equal(criterionMarks(home({ price: 400000 }), context).budget, 0.5);
  assert.equal(criterionMarks(home({ price: 370000 }), context).budget, 1);

  // A home's score does not change when the rest of the list changes.
  const alone = rankHomes([home()], context)[0].exact;
  const withOthers = rankHomes([home(), home({ id: "b", price: 200000 }), home({ id: "c", station: 40 })], context).find((entry) => entry.home.id === "a").exact;
  assert.equal(alone, withOthers);
});

test("a home over budget scores nothing on budget and sorts after the homes that fit", () => {
  const overHome = home({ id: "over", price: 422500, station: 10, evidence: 82 });
  const over = fitScore(overHome, context);
  const budgetPart = over.parts.find((part) => part.id === "budget");
  assert.equal(budgetPart.mark, 0);
  assert.equal(budgetPart.points, 0);
  assert.equal(over.withinPlan, false);

  const overLisa = criterionMarks(home({ price: 460000 }), { ...context, budgetMax: 600000 });
  assert.equal(overLisa.budget, 0);

  const fits = home({ id: "fits", price: 399000, station: 24, evidence: 60 });
  // On fit score alone the over-budget home wins; "within my plan first" puts the affordable one on top.
  assert.deepEqual(rankHomes([overHome, fits], context).map((entry) => entry.home.id), ["over", "fits"]);
  const ranked = rankHomes([overHome, fits], context, DEFAULT_IMPORTANCE, { affordableFirst: true });
  assert.deepEqual(ranked.map((entry) => entry.home.id), ["fits", "over"]);
});

test("the score is the share-weighted sum of the marks, out of 100", () => {
  const result = fitScore(home(), context);
  assert.ok(Math.abs(result.exact - sum(result.parts.map((part) => part.points))) < 1e-9);
  assert.ok(Math.abs(sum(result.parts.map((part) => part.share)) - 1) < 1e-12);
  // Budget 1, walk 1, bedrooms 1, cosmetic 0.7, facts 1 at the default shares.
  assert.equal(result.score, 96);
});

test("sensitivity reports a stable ranking when no single weight change reorders the top", () => {
  const homes = [
    home({ id: "best", price: 350000, station: 10, evidence: 90 }),
    home({ id: "middle", price: 380000, station: 20, evidence: 70 }),
    home({ id: "worst", price: 395000, station: 29, beds: 1, condition: "Tired", evidence: 40 }),
  ];
  const result = weightSensitivity(homes, context);
  assert.equal(result.stable, true);
  assert.deepEqual(result.dependsOn, []);
  assert.deepEqual(result.baseline, ["best", "middle", "worst"]);
  assert.equal(result.change, 0.2);
});

test("sensitivity names the criterion a close ranking depends on", () => {
  // Two homes within a point of each other: one walks better, the other has more confirmed facts.
  const homes = [
    home({ id: "walker", price: 350000, station: 15, evidence: 54 }),
    home({ id: "checked", price: 350000, station: 17, evidence: 75 }),
  ];
  const base = rankHomes(homes, context).map((entry) => entry.home.id);
  const result = weightSensitivity(homes, context, DEFAULT_IMPORTANCE, { top: 2 });
  assert.equal(result.stable, false);
  assert.deepEqual(result.baseline, base);
  assert.ok(result.dependsOn.length >= 1);
  for (const id of result.dependsOn) assert.ok(CRITERIA.some((criterion) => criterion.id === id));
  assert.ok(result.dependsOn.includes("walk") || result.dependsOn.includes("facts"));
});
