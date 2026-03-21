const yearsInput   = document.getElementById('yearsInput');
const rateInput    = document.getElementById('rateInput');
const monthlyInput = document.getElementById('monthlyInput');
const amountInput  = document.getElementById('amountInput');
const yearButtons  = document.getElementById('yearButtons');

const resultEl    = document.getElementById('result');
const bdMonthly   = document.getElementById('bdMonthly');
const bdTotal     = document.getElementById('bdTotal');
const bdInterest  = document.getElementById('bdInterest');
const bdYears     = document.getElementById('bdYears');

let primaryField = 'monthly';

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function fmt(n) {
  return '€' + Math.round(n).toLocaleString('en-GB');
}

// Loan amount from yearly annuity
function computeAmount(annuity, years, yearlyRatePct) {
  const r = yearlyRatePct / 100;
  if (years <= 0) return 0;
  if (r === 0) return annuity * years;
  return annuity * ((1 - (1 + r) ** -years) / r);
}

// Yearly annuity from loan amount
function computeAnnuity(amount, years, yearlyRatePct) {
  const r = yearlyRatePct / 100;
  if (years <= 0) return 0;
  if (r === 0) return amount / years;
  return amount * (r / (1 - (1 + r) ** -years));
}

function setActiveYearButton(value) {
  [...yearButtons.querySelectorAll('button')].forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.years === String(value));
  });
}

function refresh() {
  const years   = Math.max(1, Math.round(toNumber(yearsInput.value)));
  const rate    = Math.max(0, toNumber(rateInput.value));
  const monthly = Math.max(0, toNumber(monthlyInput.value));
  const amount  = Math.max(0, toNumber(amountInput.value));

  yearsInput.value = years;

  let resolvedMonthly, resolvedAmount;

  if (primaryField === 'monthly') {
    const annuity = monthly * 12;
    resolvedAmount  = Math.round(computeAmount(annuity, years, rate));
    resolvedMonthly = monthly;
    amountInput.value = resolvedAmount;
  } else {
    const annuity   = computeAnnuity(amount, years, rate);
    resolvedMonthly = Math.round(annuity / 12);
    resolvedAmount  = amount;
    monthlyInput.value = resolvedMonthly;
  }

  const totalPaid    = resolvedMonthly * 12 * years;
  const totalInterest = Math.max(0, totalPaid - resolvedAmount);

  resultEl.textContent = `Borrowing capacity: ${fmt(resolvedAmount)}`;
  bdMonthly.textContent  = fmt(resolvedMonthly);
  bdTotal.textContent    = fmt(totalPaid);
  bdInterest.textContent = fmt(totalInterest);
  bdYears.textContent    = years;

  if ([10, 20, 25].includes(years)) {
    setActiveYearButton(years);
  } else {
    setActiveYearButton('other');
  }
}

monthlyInput.addEventListener('input', () => { primaryField = 'monthly'; refresh(); });
amountInput.addEventListener('input',  () => { primaryField = 'amount';  refresh(); });
rateInput.addEventListener('input', refresh);
yearsInput.addEventListener('input', refresh);

yearButtons.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const { years } = button.dataset;
  if (years !== 'other') yearsInput.value = years;
  setActiveYearButton(years);
  refresh();
});

refresh();
