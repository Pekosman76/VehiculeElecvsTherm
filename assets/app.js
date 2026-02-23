(function () {
  const cfg = window.APP_CONFIG;
  if (!cfg) return;

  function setByType(prefix, type) {
    const p = cfg.presets[type];
    if (!p) return;
    if (prefix === 'ev') {
      Utils.byId('ev-consumption').value = p.evConsumption;
      Utils.byId('ev-maintenance').value = p.evMaintenance;
      Utils.byId('ev-resale').value = p.resalePercent;
    } else {
      Utils.byId('th-consumption').value = p.thermalConsumption;
      Utils.byId('th-maintenance').value = p.thermalMaintenance;
      Utils.byId('th-resale').value = p.resalePercent;
    }
  }

  function computeEnergy(km, consumption, unitPrice, annualIncrease, years = cfg.defaults.years) {
    let total = 0;
    let price = Number(unitPrice);
    for (let i = 0; i < years; i += 1) {
      total += (km / 100) * consumption * price;
      price *= (1 + annualIncrease / 100);
    }
    return total;
  }

  function totalCost(data, years = cfg.defaults.years) {
    const resale = data.resaleType === 'percent' ? data.purchasePrice * (data.resaleValue / 100) : data.resaleValue;
    const energy = computeEnergy(data.annualKm, data.consumption, data.energyPrice, data.energyIncrease, years);
    const maintenance = data.maintenance * years;
    return data.purchasePrice + data.adjustment + energy + maintenance + data.oneshot - resale;
  }

  function breakEven(evData, thData) {
    const kmPerYear = evData.annualKm;
    for (let year = 1; year <= 10; year += 1) {
      const ev = totalCost(evData, year);
      const th = totalCost(thData, year);
      if (ev <= th) {
        return { year, km: year * kmPerYear };
      }
    }
    return null;
  }

  function renderBarChart(ev, th) {
    const canvas = Utils.byId('result-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const max = Math.max(ev, th) || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const baseY = 180;
    const h1 = (ev / max) * 140;
    const h2 = (th / max) * 140;
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(70, baseY - h1, 90, h1);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(220, baseY - h2, 90, h2);
    ctx.fillStyle = '#0f172a';
    ctx.font = '14px sans-serif';
    ctx.fillText('Électrique', 72, 200);
    ctx.fillText('Thermique', 222, 200);
  }

  function calculateAndRender() {
    const annualKm = Number(Utils.byId('annual-km').value || 0);
    const evData = {
      purchasePrice: Number(Utils.byId('ev-price').value || 0),
      adjustment: -Number(Utils.byId('ev-bonus').value || 0),
      energyPrice: Number(Utils.byId('electricity-price').value || 0),
      consumption: Number(Utils.byId('ev-consumption').value || 0),
      annualKm,
      maintenance: Number(Utils.byId('ev-maintenance').value || 0),
      resaleType: Utils.byId('ev-resale-type').value,
      resaleValue: Number(Utils.byId('ev-resale').value || 0),
      oneshot: Number(Utils.byId('charger-cost').value || 0),
      energyIncrease: Number(Utils.byId('electricity-increase').value || 0)
    };
    const thData = {
      purchasePrice: Number(Utils.byId('th-price').value || 0),
      adjustment: Number(Utils.byId('th-malus').value || 0),
      energyPrice: Number(Utils.byId('fuel-price').value || 0),
      consumption: Number(Utils.byId('th-consumption').value || 0),
      annualKm,
      maintenance: Number(Utils.byId('th-maintenance').value || 0),
      resaleType: Utils.byId('th-resale-type').value,
      resaleValue: Number(Utils.byId('th-resale').value || 0),
      oneshot: 0,
      energyIncrease: Number(Utils.byId('fuel-increase').value || 0)
    };

    const evTotal = totalCost(evData);
    const thTotal = totalCost(thData);

    Utils.byId('ev-total').textContent = Utils.toCurrency(evTotal);
    Utils.byId('th-total').textContent = Utils.toCurrency(thTotal);
    Utils.byId('ev-monthly').textContent = Utils.toCurrency(evTotal / 60);
    Utils.byId('th-monthly').textContent = Utils.toCurrency(thTotal / 60);
    Utils.byId('difference').textContent = Utils.toCurrency(Math.abs(evTotal - thTotal));
    Utils.byId('winner').textContent = evTotal <= thTotal ? 'L’électrique est plus économique sur 5 ans.' : 'Le thermique est plus économique sur 5 ans.';

    const be = breakEven(evData, thData);
    Utils.byId('breakeven').textContent = be ? `Rentable à partir de ${be.year} an(s), environ ${be.km.toLocaleString('fr-FR')} km.` : 'Non atteint en 10 ans.';

    const summary = Utils.byId('result-summary');
    if (summary) {
      summary.classList.remove('result-summary');
      void summary.offsetWidth;
      summary.classList.add('result-summary');
    }

    renderBarChart(evTotal, thTotal);
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('simulator-form')) return;

    Utils.byId('annual-km').value = cfg.defaults.annualKm;
    Utils.byId('electricity-price').value = cfg.defaults.electricityPrice;
    Utils.byId('fuel-price').value = cfg.defaults.fuelPrice;
    Utils.byId('ev-bonus').value = cfg.defaults.ecologicalBonus;
    Utils.byId('th-malus').value = cfg.defaults.ecologicalMalus;
    Utils.byId('charger-cost').value = cfg.defaults.chargerInstallCost;
    Utils.byId('electricity-increase').value = cfg.defaults.annualElectricityIncrease;
    Utils.byId('fuel-increase').value = cfg.defaults.annualFuelIncrease;

    setByType('ev', Utils.byId('ev-type').value);
    setByType('th', Utils.byId('th-type').value);

    document.querySelectorAll('#simulator-form input, #simulator-form select').forEach((el) => {
      el.addEventListener('input', calculateAndRender);
      el.addEventListener('change', (event) => {
        if (event.target.id === 'ev-type') setByType('ev', event.target.value);
        if (event.target.id === 'th-type') setByType('th', event.target.value);
        calculateAndRender();
      });
    });

    calculateAndRender();
  });
})();
