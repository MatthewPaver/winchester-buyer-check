(function exposeBuyerCalculator(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.BuyerCalculator = api;
})(typeof window === "undefined" ? globalThis : window, function createBuyerCalculator() {
  const nonNegative = (value) => Math.max(0, Number(value) || 0);

  function monthlyPayment(loan, annualRate, years) {
    const principal = nonNegative(loan);
    const months = Math.max(12, Math.round(nonNegative(years) * 12));
    const monthlyRate = nonNegative(annualRate) / 100 / 12;
    if (!principal) return 0;
    if (!monthlyRate) return principal / months;
    return (
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
      (Math.pow(1 + monthlyRate, months) - 1)
    );
  }

  function calculatePurchase(values) {
    const price = nonNegative(values.price);
    const deposit = Math.min(nonNegative(values.deposit), price);
    const loan = Math.max(0, price - deposit);
    const monthly = monthlyPayment(loan, values.rate, values.term);
    const costs =
      nonNegative(values.tax) +
      nonNegative(values.legal) +
      nonNegative(values.survey) +
      nonNegative(values.moving) +
      nonNegative(values.works);
    const cash = deposit + costs;
    const ltv = price ? (loan / price) * 100 : 0;
    const months = Math.max(12, Math.round(nonNegative(values.term) * 12));
    const totalInterest = Math.max(0, monthly * months - loan);
    const monthlyTotal = monthly + nonNegative(values.buffer);
    return { price, deposit, loan, monthly, ltv, cash, monthlyTotal, totalInterest };
  }

  function calculateAffordability(values) {
    const salary = nonNegative(values.salary);
    const deposit = nonNegative(values.deposit);
    const lisaBonus = values.useLisa ? Math.min(nonNegative(values.lisaContribution), 4000) * 0.25 : 0;
    const fees = nonNegative(values.fees);
    const reserve = nonNegative(values.reserve);
    const works = nonNegative(values.works);
    const multiple = Math.max(1, nonNegative(values.multiple) || 4.5);
    const borrowingCapacity = salary * multiple;
    const cashForPrice = Math.max(0, deposit + lisaBonus - fees - reserve - works);
    const modelledMaxPrice = Math.min(
      values.useLisa ? LISA_PRICE_LIMIT : Number.POSITIVE_INFINITY,
      borrowingCapacity + cashForPrice,
    );
    const askingPrice = nonNegative(values.askingPrice);
    const mortgageRequired = Math.max(0, askingPrice - deposit - lisaBonus);
    const monthly = monthlyPayment(mortgageRequired, values.rate, values.term);
    const headroom = modelledMaxPrice - askingPrice;
    return {
      askingPrice,
      borrowingCapacity,
      cashForPrice,
      headroom,
      lisaBonus,
      modelledMaxPrice,
      monthly,
      mortgageRequired,
    };
  }

  // One budget verdict for a price, shared by the Plan page and each home's review,
  // so both always agree. Below TIGHT_HEADROOM of spare budget counts as "only just".
  const LISA_PRICE_LIMIT = 450000;
  const TIGHT_HEADROOM = 15000;

  function assessBudget(plan, price) {
    const result = calculateAffordability({ ...plan, askingPrice: price });
    const lisaBlocked = Boolean(plan.useLisa) && result.askingPrice > LISA_PRICE_LIMIT;
    const atLisaLimit = Boolean(plan.useLisa) && result.askingPrice === LISA_PRICE_LIMIT;
    const level = lisaBlocked
      ? "over-lisa"
      : result.headroom < 0
        ? "over"
        : result.headroom < TIGHT_HEADROOM
          ? "tight"
          : "within";
    const tone = level === "tight" ? "attention" : level === "within" ? "success" : "danger";
    return { ...result, atLisaLimit, level, lisaBlocked, tone };
  }

  // Illustrative offer range for one home, never above what the buyer's plan allows.
  // home: { price, evidence }; budgetMax: the plan's most you can pay for this home.
  function offerRange(home, budgetMax) {
    const roundTo500 = (value) => Math.round(value / 500) * 500;
    const price = nonNegative(home.price);
    const target = Math.min(price, roundTo500(price * (home.evidence < 65 ? 0.95 : 0.975)));
    const opening = roundTo500(target * 0.975);
    const walkAway = Math.min(LISA_PRICE_LIMIT, price + (price < 430000 ? 5000 : 0));
    const cap = Number.isFinite(budgetMax) ? Math.max(0, Math.floor(budgetMax)) : Infinity;
    if (opening > cap) return { outOfReach: true, budgetMax: cap, suggestedOpening: opening };
    const capped = { opening, offerTarget: Math.min(target, cap), walkAway: Math.min(walkAway, cap) };
    return { ...capped, outOfReach: false, budgetMax: cap, cappedAtBudget: capped.walkAway < walkAway || capped.offerTarget < target };
  }

  return {
    LISA_PRICE_LIMIT,
    TIGHT_HEADROOM,
    assessBudget,
    offerRange,
    calculateAffordability,
    calculatePurchase,
    monthlyPayment,
  };
});
