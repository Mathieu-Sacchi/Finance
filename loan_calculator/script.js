const yearsInput = document.getElementById('yearsInput');
const rateInput = document.getElementById('rateInput');
const annuityInput = document.getElementById('annuityInput');
const amountInput = document.getElementById('amountInput');
const result = document.getElementById('result');
const yearButtons = document.getElementById('yearButtons');

let primaryField = 'annuity';

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function computeAmount(annuity, years, yearlyRatePct) {
  const r = yearlyRatePct / 100;
  if (years <= 0) return 0;
  if (r === 0) return annuity * years;
  return annuity * ((1 - (1 + r) ** -years) / r);
}

function computeAnnuity(amount, years, yearlyRatePct) {
  const r = yearlyRatePct / 100;
  if (years <= 0) return 0;
  if (r === 0) return amount / years;
  return amount * (r / (1 - (1 + r) ** -years));
}

function setActiveYearButton(value) {
  [...yearButtons.querySelectorAll('button')].forEach((btn) => {
    const isMatch = btn.dataset.years === String(value);
    btn.classList.toggle('active', isMatch);
  });
}

function refresh() {
  const years = Math.max(1, Math.round(toNumber(yearsInput.value)));
  const rate = Math.max(0, toNumber(rateInput.value));
  const annuity = Math.max(0, toNumber(annuityInput.value));
  const amount = Math.max(0, toNumber(amountInput.value));

  yearsInput.value = years;

  if (primaryField === 'annuity') {
    amountInput.value = Math.round(computeAmount(annuity, years, rate));
  } else {
    annuityInput.value = Math.round(computeAnnuity(amount, years, rate));
  }

  result.textContent = `Borrowing capacity: ${Math.round(toNumber(amountInput.value)).toLocaleString()}`;

  if ([10, 20, 25].includes(years)) {
    setActiveYearButton(years);
  } else {
    setActiveYearButton('other');
  }
}

annuityInput.addEventListener('input', () => {
  primaryField = 'annuity';
  refresh();
});

amountInput.addEventListener('input', () => {
  primaryField = 'amount';
  refresh();
});

rateInput.addEventListener('input', refresh);
yearsInput.addEventListener('input', refresh);

yearButtons.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const { years } = button.dataset;
  if (years !== 'other') {
    yearsInput.value = years;
  }

  setActiveYearButton(years);
  refresh();
});

refresh();
