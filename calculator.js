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
      values.useLisa ? 450000 : Number.POSITIVE_INFINITY,
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

  return { calculateAffordability, calculatePurchase, monthlyPayment };
});
