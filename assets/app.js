(function () {
  const cfg = window.APP_CONFIG;
  if (!cfg) return;

  const $ = (id) => document.getElementById(id);

  function n(id, fallback = 0) {
    const v = Number($(id)?.value);
    return Number.isFinite(v) ? v : fallback;
  }

  function getResale(price, resaleType, resaleValue) {
    return resaleType === 'percent' ? price * (resaleValue / 100) : resaleValue;
  }

  function energyCost(km, conso, unitPrice, increase, years) {
    let total = 0;
    let p = unitPrice;
    for (let i = 0; i < years; i += 1) {
      total += (km / 100) * conso * p;
      p *= (1 + increase / 100);
    }
    return total;
  }

  function total(data, years) {
    const resale = getResale(data.price, data.resaleType, data.resaleValue);
    const energy = energyCost(data.km, data.conso, data.energyPrice, data.increase, years);
    const maintenance = data.maintenance * years;
    return {
      energy,
      maintenance,
      total: data.price + data.adjustment + data.oneshot + energy + maintenance - resale
    };
  }

  function findBreakEven(ev, th) {
    for (let y = 1; y <= 10; y += 1) {
      if (total(ev, y).total <= total(th, y).total) {
        return { years: y, km: ev.km * y };
      }
    }
    return null;
  }

  function drawBars(evTotal, thTotal) {
    const canvas = $('result-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const max = Math.max(evTotal, thTotal) || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const top = 30;
    const bottom = 220;
    const h = bottom - top;

    const evH = (evTotal / max) * h;
    const thH = (thTotal / max) * h;

    ctx.fillStyle = '#F6F8FA';
    ctx.fillRect(20, top, 400, h);

    ctx.fillStyle = '#1E2A78';
    ctx.fillRect(90, bottom - evH, 100, evH);
    ctx.fillStyle = '#007BFF';
    ctx.fillRect(250, bottom - thH, 100, thH);

    ctx.fillStyle = '#111';
    ctx.font = '600 14px Inter, sans-serif';
    ctx.fillText('Électrique', 98, 245);
    ctx.fillText('Thermique', 260, 245);
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(`${Math.round(evTotal).toLocaleString('fr-FR')} €`, 95, bottom - evH - 8);
    ctx.fillText(`${Math.round(thTotal).toLocaleString('fr-FR')} €`, 255, bottom - thH - 8);
  }

  function getData() {
    const years = Math.min(10, Math.max(1, n('years', cfg.defaults.years)));
    $('years').value = years;

    const commonKm = n('annual-km', cfg.defaults.annualKm);

    const ev = {
      price: n('ev-price', 32000),
      adjustment: -n('ev-bonus', cfg.defaults.ecologicalBonus),
      energyPrice: n('electricity-price', cfg.defaults.electricityPrice),
      conso: n('ev-consumption', 16),
      km: commonKm,
      maintenance: n('ev-maintenance', 350),
      resaleType: $('ev-resale-type').value,
      resaleValue: n('ev-resale', 45),
      oneshot: n('charger-cost', cfg.defaults.chargerInstallCost),
      increase: n('electricity-increase', cfg.defaults.annualElectricityIncrease)
    };

    const th = {
      price: n('th-price', 26000),
      adjustment: n('th-malus', cfg.defaults.ecologicalMalus),
      energyPrice: n('fuel-price', cfg.defaults.fuelPrice),
      conso: n('th-consumption', 6.2),
      km: commonKm,
      maintenance: n('th-maintenance', 700),
      resaleType: $('th-resale-type').value,
      resaleValue: n('th-resale', 45),
      oneshot: 0,
      increase: n('fuel-increase', cfg.defaults.annualFuelIncrease)
    };

    return { years, ev, th };
  }

  function renderResults() {
    const { years, ev, th } = getData();
    const evRes = total(ev, years);
    const thRes = total(th, years);

    const isEvWinner = evRes.total <= thRes.total;
    const eco = Math.abs(evRes.total - thRes.total);

    $('result-line').textContent = `Sur ${years} ans, Électrique : ${Utils.toCurrency(evRes.total)}, Thermique : ${Utils.toCurrency(thRes.total)}, Économie : ${Utils.toCurrency(eco)} (${isEvWinner ? 'avantage VE' : 'avantage thermique'}).`;

    const be = findBreakEven(ev, th);
    $('breakeven').textContent = be
      ? `L’électrique devient rentable après ~${be.years} an(s) (~${be.km.toLocaleString('fr-FR')} km).`
      : 'Pas rentable dans la limite de 10 ans avec ces hypothèses.';

    $('ev-total').textContent = Utils.toCurrency(evRes.total);
    $('th-total').textContent = Utils.toCurrency(thRes.total);
    $('ev-energy').textContent = Utils.toCurrency(evRes.energy);
    $('th-energy').textContent = Utils.toCurrency(thRes.energy);
    $('ev-maint').textContent = Utils.toCurrency(evRes.maintenance);
    $('th-maint').textContent = Utils.toCurrency(thRes.maintenance);
    $('ev-monthly').textContent = Utils.toCurrency(evRes.total / (years * 12));
    $('th-monthly').textContent = Utils.toCurrency(thRes.total / (years * 12));

    drawBars(evRes.total, thRes.total);
  }

  function resetForm() {
    $('years').value = cfg.defaults.years;
    $('annual-km').value = cfg.defaults.annualKm;
    $('ev-price').value = 32000;
    $('th-price').value = 26000;
    $('ev-bonus').value = cfg.defaults.ecologicalBonus;
    $('th-malus').value = cfg.defaults.ecologicalMalus;
    $('electricity-price').value = cfg.defaults.electricityPrice;
    $('ev-consumption').value = 16;
    $('fuel-price').value = cfg.defaults.fuelPrice;
    $('th-consumption').value = 6.2;
    $('ev-maintenance').value = 350;
    $('th-maintenance').value = 700;
    $('ev-resale-type').value = 'percent';
    $('th-resale-type').value = 'percent';
    $('ev-resale').value = 45;
    $('th-resale').value = 45;
    $('electricity-increase').value = cfg.defaults.annualElectricityIncrease;
    $('fuel-increase').value = cfg.defaults.annualFuelIncrease;
    $('charger-cost').value = cfg.defaults.chargerInstallCost;
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!$('simulator-form')) return;

    resetForm();

    $('quick-estimate-btn').addEventListener('click', renderResults);
    $('recalculate-btn').addEventListener('click', renderResults);

    $('reset-btn').addEventListener('click', () => {
      resetForm();
      renderResults();
    });

    $('toggle-advanced-btn').addEventListener('click', () => {
      const panel = $('advanced-fields');
      const expanded = panel.hidden;
      panel.hidden = !expanded;
      $('toggle-advanced-btn').setAttribute('aria-expanded', String(expanded));
      $('toggle-advanced-btn').textContent = expanded ? 'Masquer les options avancées' : 'Affiner';
    });

    renderResults();
  });
})();
