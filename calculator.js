(function exposeBuyerCalculator(root, factory) {
  // Node reads the checked rules from data/; the browser gets the same JSON from buying-rules.js.
  const rules =
    typeof module === "object" && module.exports
      ? { sdlt: require("./data/sdlt-rates.json"), lifetimeIsa: require("./data/lifetime-isa.json") }
      : root.WINCHESTER_BUYING_RULES;
  const api = factory(rules);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.BuyerCalculator = api;
})(typeof window === "undefined" ? globalThis : window, function createBuyerCalculator(rules) {
  if (!rules?.sdlt?.standard?.bands || !rules?.lifetimeIsa?.priceLimit) {
    throw new Error("Buying rules are missing: load buying-rules.js before calculator.js");
  }
  const nonNegative = (value) => Math.max(0, Number(value) || 0);

  const LISA_PRICE_LIMIT = rules.lifetimeIsa.priceLimit;
  const LISA_MAX_CONTRIBUTION = rules.lifetimeIsa.maxContributionPerYear;
  const LISA_BONUS_RATE = rules.lifetimeIsa.bonusRatePercent / 100;
  const SDLT_RELIEF_LIMIT = rules.sdlt.firstTimeBuyerRelief.maxPrice;
  // Below TIGHT_HEADROOM of spare budget counts as "only just".
  const TIGHT_HEADROOM = 15000;

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

  // Tax on each slice of a whole-pound price. Rates are whole percentages, so the
  // sum is exact in pence before the single division.
  function taxOnBands(price, bands) {
    let pencePercent = 0;
    let lower = 0;
    for (const band of bands) {
      const upper = band.upTo === null ? Infinity : band.upTo;
      if (price > lower) pencePercent += (Math.min(price, upper) - lower) * band.ratePercent;
      lower = upper;
    }
    return pencePercent / 100;
  }

  // Stamp Duty Land Tax for one residential home in England, rates from 1 April 2025.
  function stampDutyDetail(price, firstTimeBuyer = false) {
    const wholePrice = Math.floor(nonNegative(price));
    const relief = rules.sdlt.firstTimeBuyerRelief;
    const reliefApplies = Boolean(firstTimeBuyer) && wholePrice <= relief.maxPrice;
    const tax = taxOnBands(wholePrice, reliefApplies ? relief.bands : rules.sdlt.standard.bands);
    return { tax, reliefApplies, reliefLost: Boolean(firstTimeBuyer) && !reliefApplies };
  }

  function stampDuty(price, firstTimeBuyer = false) {
    return stampDutyDetail(price, firstTimeBuyer).tax;
  }

  // Cash costs paid on or before completion, other than the deposit.
  // `fees` is the older single "buying fees" figure, still accepted as an extra cost.
  function buyingCosts(values, price) {
    const duty = stampDutyDetail(price, values.firstTimeBuyer);
    const items = {
      stampDuty: duty.tax,
      conveyancing: nonNegative(values.conveyancing),
      survey: nonNegative(values.survey),
      lenderFee: nonNegative(values.lenderFee),
      moving: nonNegative(values.moving),
      otherFees: nonNegative(values.fees),
    };
    const total = Object.values(items).reduce((sum, value) => sum + value, 0);
    return { ...items, total, reliefApplies: duty.reliefApplies, reliefLost: duty.reliefLost };
  }

  function lisaBonusFor(values) {
    return values.useLisa ? Math.min(nonNegative(values.lisaContribution), LISA_MAX_CONTRIBUTION) * LISA_BONUS_RATE : 0;
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

  // The plan applied to one price. Stamp duty depends on the price, so the most you
  // can pay is the highest whole-pound price whose price plus buying costs fits.
  function calculateAffordability(values) {
    const salary = nonNegative(values.salary);
    const deposit = nonNegative(values.deposit);
    const lisaBonus = lisaBonusFor(values);
    const reserve = nonNegative(values.reserve);
    const works = nonNegative(values.works);
    const multiple = Math.max(1, nonNegative(values.multiple) || 4.5);
    const borrowingCapacity = salary * multiple;
    const cashAvailable = deposit + lisaBonus;
    const keepBack = reserve + works;

    const spendable = borrowingCapacity + cashAvailable - keepBack;
    const fits = (price) => price + buyingCosts(values, price).total <= spendable;
    let low = 0;
    let high = Math.max(0, Math.floor(spendable));
    if (!fits(0)) high = 0;
    while (low < high) {
      const mid = Math.ceil((low + high) / 2);
      if (fits(mid)) low = mid;
      else high = mid - 1;
    }
    const modelledMaxPrice = Math.min(values.useLisa ? LISA_PRICE_LIMIT : Number.POSITIVE_INFINITY, low);

    const askingPrice = nonNegative(values.askingPrice);
    const costs = buyingCosts(values, askingPrice);
    const cashForPrice = Math.max(0, cashAvailable - costs.total - keepBack);
    const mortgageRequired = Math.max(0, askingPrice - cashForPrice);
    const monthly = monthlyPayment(mortgageRequired, values.rate, values.term);
    const headroom = modelledMaxPrice - askingPrice;
    return {
      askingPrice,
      borrowingCapacity,
      cashAvailable,
      cashForPrice,
      costs,
      headroom,
      keepBack,
      lisaBonus,
      modelledMaxPrice,
      monthly,
      mortgageRequired,
    };
  }

  // What leaves your account on completion day for one price, and what is left.
  function moneyOnTheDay(values, price) {
    const result = calculateAffordability({ ...values, askingPrice: price });
    const depositPaid = Math.min(result.askingPrice, result.cashForPrice);
    const total = depositPaid + result.costs.total;
    const mortgageShortfall = Math.max(0, result.mortgageRequired - result.borrowingCapacity);
    return {
      price: result.askingPrice,
      depositPaid,
      costs: result.costs,
      total,
      cashAvailable: result.cashAvailable,
      lisaBonus: result.lisaBonus,
      leftAfter: result.cashAvailable - total,
      keepBack: result.keepBack,
      cashShortfall: Math.max(0, total - result.cashAvailable),
      mortgageRequired: result.mortgageRequired,
      borrowingCapacity: result.borrowingCapacity,
      mortgageShortfall,
    };
  }

  // One budget verdict for a price, shared by the Plan page and each home's review,
  // so both always agree.
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
    return { ...result, atLisaLimit, level, lisaBlocked, tone, withinPlan: level === "tight" || level === "within" };
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
    SDLT_RELIEF_LIMIT,
    TIGHT_HEADROOM,
    rules,
    assessBudget,
    buyingCosts,
    calculateAffordability,
    calculatePurchase,
    moneyOnTheDay,
    monthlyPayment,
    offerRange,
    stampDuty,
    stampDutyDetail,
  };
});
