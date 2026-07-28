(function exposeBuyerCalculator(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.BuyerCalculator = api;
})(typeof window === "undefined" ? globalThis : window, function createBuyerCalculator() {
  const nonNegative = value => Math.max(0, Number(value) || 0);

  function calculatePurchase(values) {
    const price = nonNegative(values.price);
    const deposit = Math.min(nonNegative(values.deposit), price);
    const loan = Math.max(0, price - deposit);
    const annualRate = nonNegative(values.rate) / 100;
    const months = Math.max(12, Math.round(nonNegative(values.term) * 12));
    const monthlyRate = annualRate / 12;
    const monthly =
      loan === 0
        ? 0
        : monthlyRate === 0
          ? loan / months
          : (loan * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
            (Math.pow(1 + monthlyRate, months) - 1);
    const costs =
      nonNegative(values.tax) +
      nonNegative(values.legal) +
      nonNegative(values.survey) +
      nonNegative(values.moving) +
      nonNegative(values.works);
    const cash = deposit + costs;
    const ltv = price ? (loan / price) * 100 : 0;
    const totalInterest = Math.max(0, monthly * months - loan);
    const monthlyTotal = monthly + nonNegative(values.buffer);
    return { price, deposit, loan, monthly, ltv, cash, monthlyTotal, totalInterest };
  }

  return { calculatePurchase };
});
