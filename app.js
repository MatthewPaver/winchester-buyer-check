const ids = ['price','deposit','rate','term','tax','legal','survey','moving','works','buffer'];
const inputs = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
const formatMoney = new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0});
const value = (id) => Math.max(0, Number(inputs[id].value) || 0);

function calculate(){
  const result=window.BuyerCalculator.calculatePurchase(Object.fromEntries(ids.map((id)=>[id,value(id)])));
  const {price,deposit,loan,monthly,ltv,cash,monthlyTotal,totalInterest}=result;
  document.getElementById('monthly').textContent=formatMoney.format(monthly);
  document.getElementById('loan').textContent=formatMoney.format(loan);
  document.getElementById('ltv').textContent=`${ltv.toFixed(1)}%`;
  document.getElementById('cash').textContent=formatMoney.format(cash);
  document.getElementById('monthly-total').textContent=formatMoney.format(monthlyTotal);
  document.getElementById('interest').textContent=formatMoney.format(totalInterest);
  const signal=document.getElementById('signal').querySelector('p');
  signal.textContent=ltv>90?'Your LTV is above 90%. A larger deposit could materially change the lending options available.':ltv>75?'Your LTV sits between 75% and 90%. Compare lender bands before fixing the deposit.':'Your LTV is 75% or lower. Keep enough cash aside for costs and post-completion surprises.';
  document.getElementById('result-status').textContent=`Estimate updated. Monthly mortgage ${formatMoney.format(monthly)}. Loan to value ${ltv.toFixed(1)}%.`;
  return result;
}

ids.forEach((id)=>inputs[id].addEventListener('input',calculate));
document.getElementById('copy-summary').addEventListener('click',async()=>{
  const r=calculate();
  const summary=`Winchester Buyer Check\nPurchase price: ${formatMoney.format(r.price)}\nDeposit: ${formatMoney.format(r.deposit)}\nMortgage: ${formatMoney.format(r.loan)} (${r.ltv.toFixed(1)}% LTV)\nEstimated monthly mortgage: ${formatMoney.format(r.monthly)}\nCash needed at completion: ${formatMoney.format(r.cash)}\nMonthly cost with buffer: ${formatMoney.format(r.monthlyTotal)}\n\nIllustrative only — confirm figures with qualified professionals.`;
  try{await navigator.clipboard.writeText(summary);document.getElementById('copy-status').textContent='Summary copied.'}catch{document.getElementById('copy-status').textContent='Copy was blocked by this browser.'}
});
document.getElementById('year').textContent=new Date().getFullYear();
calculate();
