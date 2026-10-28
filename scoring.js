// Fit score for each saved home.
// Method after FlatScorer (github.com/Aduneer/FlatScorer, MIT), reimplemented here:
// each criterion is marked from 0 to 1 against a fixed yardstick (never against the
// other homes on the list), the weights are shares that add up to 1, and a
// one-at-a-time weight check says whether the ranking holds.
(function exposeFitScore(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.FitScore = api;
})(typeof window === "undefined" ? globalThis : window, function createFitScore() {
  // Fixed yardsticks. Changing one changes every home's mark the same way.
  const ANCHORS = Object.freeze({
    budgetFullMarksHeadroom: 30000, // £30,000 or more to spare under the plan's maximum
    walkFullMarks: 15, // minutes to the station for full marks
    walkHalfMarks: 22,
    walkNoMarks: 30,
    factsFullMarks: 75, // per cent of listing facts backed by a source
  });

  const CONDITION_MARKS = Object.freeze({ Good: 1, Cosmetic: 0.7, Tired: 0.3 });

  const CRITERIA = Object.freeze([
    { id: "budget", label: "Budget" },
    { id: "walk", label: "Walk to station" },
    { id: "bedrooms", label: "Bedrooms" },
    { id: "condition", label: "Condition" },
    { id: "facts", label: "Facts confirmed" },
  ]);

  // Default importance on a 0 to 10 scale. As shares: 30%, 25%, 15%, 15%, 15%.
  const DEFAULT_IMPORTANCE = Object.freeze({ budget: 6, walk: 5, bedrooms: 3, condition: 3, facts: 3 });

  const clamp01 = (value) => Math.min(1, Math.max(0, value));

  // Turns any non-negative importance values into shares that add up to 1.
  // Only the ratios matter: doubling every value changes nothing.
  function normaliseWeights(importance = DEFAULT_IMPORTANCE) {
    const raw = CRITERIA.map(({ id }) => Math.max(0, Number(importance[id]) || 0));
    const total = raw.reduce((sum, value) => sum + value, 0);
    return Object.fromEntries(CRITERIA.map(({ id }, index) => [id, total ? raw[index] / total : 1 / CRITERIA.length]));
  }

  function budgetMark(home, context) {
    const overLisa = Number.isFinite(context.lisaLimit) && home.price > context.lisaLimit;
    const headroom = (Number(context.budgetMax) || 0) - home.price;
    if (overLisa || headroom < 0) return 0;
    return 0.5 + 0.5 * clamp01(headroom / ANCHORS.budgetFullMarksHeadroom);
  }

  function walkMark(minutes) {
    const { walkFullMarks: full, walkHalfMarks: half, walkNoMarks: none } = ANCHORS;
    if (minutes <= full) return 1;
    if (minutes <= half) return 1 - 0.5 * ((minutes - full) / (half - full));
    if (minutes < none) return 0.5 * ((none - minutes) / (none - half));
    return 0;
  }

  function bedroomsMark(beds, needed) {
    const spare = beds - needed;
    if (spare >= 1) return 1;
    if (spare === 0) return 0.75;
    if (spare === -1) return 0.25;
    return 0;
  }

  // home: { price, station, beds, condition, evidence }
  // context: { budgetMax, lisaLimit (only when a Lifetime ISA is used), bedroomsNeeded }
  function criterionMarks(home, context) {
    return {
      budget: budgetMark(home, context),
      walk: walkMark(home.station),
      bedrooms: bedroomsMark(home.beds, Math.max(1, Number(context.bedroomsNeeded) || 2)),
      condition: CONDITION_MARKS[home.condition] ?? 0.5,
      facts: clamp01(home.evidence / ANCHORS.factsFullMarks),
    };
  }

  function fitScore(home, context, importance = DEFAULT_IMPORTANCE) {
    const shares = normaliseWeights(importance);
    const marks = criterionMarks(home, context);
    const parts = CRITERIA.map(({ id, label }) => ({
      id,
      label,
      share: shares[id],
      mark: marks[id],
      points: 100 * shares[id] * marks[id],
    }));
    const exact = parts.reduce((sum, part) => sum + part.points, 0);
    return { score: Math.round(exact), exact, parts, withinPlan: marks.budget > 0 };
  }

  // Ranked best first. With affordableFirst, homes within the plan come before the rest.
  function rankHomes(homes, context, importance = DEFAULT_IMPORTANCE, { affordableFirst = false } = {}) {
    return homes
      .map((home) => ({ home, ...fitScore(home, context, importance) }))
      .sort(
        (a, b) =>
          (affordableFirst ? Number(b.withinPlan) - Number(a.withinPlan) : 0) ||
          b.exact - a.exact ||
          a.home.price - b.home.price ||
          String(a.home.id).localeCompare(String(b.home.id)),
      );
  }

  // Moves one criterion's importance up and down by `change` (a fifth by default),
  // keeping the others fixed, and reports which moves reorder the top homes.
  function weightSensitivity(homes, context, importance = DEFAULT_IMPORTANCE, { change = 0.2, top = 3, affordableFirst = true } = {}) {
    const topIds = (weights) =>
      rankHomes(homes, context, weights, { affordableFirst })
        .slice(0, top)
        .map((entry) => entry.home.id);
    const baseline = topIds(importance);
    const dependsOn = CRITERIA.filter(({ id }) =>
      [1 - change, 1 + change].some((factor) => {
        const moved = { ...importance, [id]: (Number(importance[id]) || 0) * factor };
        return topIds(moved).join("|") !== baseline.join("|");
      }),
    ).map(({ id }) => id);
    return { stable: dependsOn.length === 0, dependsOn, baseline, change, top };
  }

  return {
    ANCHORS,
    CONDITION_MARKS,
    CRITERIA,
    DEFAULT_IMPORTANCE,
    criterionMarks,
    fitScore,
    normaliseWeights,
    rankHomes,
    weightSensitivity,
  };
});
