const yearsInput = document.getElementById('yearsInput');
const rateInput = document.getElementById('rateInput');
const monthlyInput = document.getElementById('monthlyInput');
const targetInput = document.getElementById('targetInput');
const yearButtons = document.getElementById('yearButtons');
const loanTypeButtons = document.getElementById('loanTypeButtons');

const resultEl = document.getElementById('result');
const bdLoan = document.getElementById('bdLoan');
const bdMonthly = document.getElementById('bdMonthly');
const bdTotal = document.getElementById('bdTotal');
const bdInterest = document.getElementById('bdInterest');
const bdYears = document.getElementById('bdYears');

const MONTHLY_DEFAULTS = { bank: 700, owner: 1400 };
let loanType = 'bank';

async function fetchFrenchInterestRate() {
  const url = 'https://data-api.ecb.europa.eu/service/data/MIR/M.FR.B.A2C.A.C.A.2250.EUR.N?lastNObservations=1&format=jsondata';
  const fallbackRate = 3.5;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const observations = data.dataSets[0]?.series?.['0:0:0:0:0:0:0:0:0:0']?.observations?.[0];

    if (observations?.[0] !== undefined) {
      return parseFloat(observations[0]);
    }
  } catch (err) {
    console.warn('Failed to fetch interest rate from ECB:', err);
  }

  return fallbackRate;
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function fmt(n) {
  return '€' + Math.round(n).toLocaleString('en-GB');
}

function computeAmount(annuity, years, yearlyRatePct) {
  const r = yearlyRatePct / 100;
  if (years <= 0) return 0;
  if (r === 0) return annuity * years;
  return annuity * ((1 - (1 + r) ** -years) / r);
}

// --- Year buttons ---

function getYearButtonsList() {
  return [...yearButtons.querySelectorAll('button')];
}

function setActiveYearButton(value) {
  getYearButtonsList().forEach((btn) => {
    const active = btn.dataset.years === String(value);
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function focusAdjacentButton(container, current, delta) {
  const buttons = [...container.querySelectorAll('button')];
  const i = buttons.indexOf(current);
  if (i === -1) return;
  const next = buttons[i + delta];
  if (next) next.focus();
}

// --- Loan type toggle ---

function setActiveLoanType(type) {
  loanType = type;
  [...loanTypeButtons.querySelectorAll('button')].forEach((btn) => {
    const active = btn.dataset.type === type;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  monthlyInput.value = MONTHLY_DEFAULTS[type];
}

// --- Core calculation ---

function refresh() {
  const years = Math.max(1, Math.round(toNumber(yearsInput.value)));
  const rate = Math.max(0, toNumber(rateInput.value));
  const monthly = Math.max(0, toNumber(monthlyInput.value));
  const target = Math.max(0, toNumber(targetInput.value));

  yearsInput.value = years;

  const annuity = monthly * 12;
  const loanCapacity = Math.round(computeAmount(annuity, years, rate));
  const familyMoney = Math.max(0, target - loanCapacity);

  const totalPaid = monthly * 12 * years;
  const totalInterest = Math.max(0, totalPaid - loanCapacity);

  resultEl.textContent = fmt(familyMoney);
  bdLoan.textContent = fmt(loanCapacity);
  bdMonthly.textContent = fmt(monthly);
  bdTotal.textContent = fmt(totalPaid);
  bdInterest.textContent = fmt(totalInterest);
  bdYears.textContent = years;

  if ([10, 20, 25].includes(years)) {
    setActiveYearButton(years);
  } else {
    setActiveYearButton('other');
  }
}

// --- Event listeners ---

monthlyInput.addEventListener('input', refresh);
targetInput.addEventListener('input', refresh);
rateInput.addEventListener('input', refresh);
yearsInput.addEventListener('input', refresh);

loanTypeButtons.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  setActiveLoanType(button.dataset.type);
  refresh();
});

yearButtons.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const { years } = button.dataset;
  if (years !== 'other') yearsInput.value = years;
  setActiveYearButton(years);
  refresh();
});

function addArrowKeyNav(container) {
  container.addEventListener('keydown', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      focusAdjacentButton(container, button, 1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      focusAdjacentButton(container, button, -1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      container.querySelector('button')?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      const list = [...container.querySelectorAll('button')];
      list[list.length - 1]?.focus();
    }
  });
}

addArrowKeyNav(yearButtons);
addArrowKeyNav(loanTypeButtons);

(async () => {
  const rate = await fetchFrenchInterestRate();
  rateInput.value = rate;
  rateInput.disabled = true;
  refresh();
})();
