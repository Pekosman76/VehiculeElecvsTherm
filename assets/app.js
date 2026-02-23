(function () {
  const cfg = window.APP_CONFIG;
  if (!cfg) return;

  function byId(id) {
    return document.getElementById(id);
  }

  function setByType(prefix, type) {
    const preset = cfg.presets[type];
    if (!preset) return;

    if (prefix === 'ev') {
      byId('ev-consumption').value = preset.evConsumption;
      byId('ev-maintenance').value = preset.evMaintenance;
      byId('ev-resale').value = preset.resalePercent;
    } else {
      byId('th-consumption').value = preset.thermalConsumption;
      byId('th-maintenance').value = preset.thermalMaintenance;
      byId('th-resale').value = preset.resalePercent;
    }
  }

  function computeEnergy(km, consumption, unitPrice, annualIncrease, years) {
    let total = 0;
    let dynamicPrice = Number(unitPrice);
    for (let i = 0; i < years; i += 1) {
      total += (km / 100) * consumption * dynamicPrice;
      dynamicPrice *= 1 + annualIncrease / 100;
    }
    return total;
  }

  function totalCost(data, years) {
    const resale = data.resaleType === 'percent'
      ? data.purchasePrice * (data.resaleValue / 100)
      : data.resaleValue;

    const energy = computeEnergy(
      data.annualKm,
      data.consumption,
      data.energyPrice,
      data.energyIncrease,
      years
    );

    const maintenance = data.maintenance * years;
    return data.purchasePrice + data.adjustment + data.oneshot + energy + maintenance - resale;
  }

  function breakEven(evData, thData) {
    const maxYears = 10;
    for (let year = 1; year <= maxYears; year += 1) {
      const evCost = totalCost(evData, year);
      const thCost = totalCost(thData, year);
      if (evCost <= thCost) {
        return { year, km: year * evData.annualKm };
      }
    }
    return null;
  }

  function renderBarChart(ev, th) {
    const canvas = byId('result-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const max = Math.max(ev, th) || 1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const chartTop = 24;
    const chartBottom = 220;
    const chartHeight = chartBottom - chartTop;

    const evHeight = (ev / max) * (chartHeight - 22);
    const thHeight = (th / max) * (chartHeight - 22);

    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(20, chartTop, canvas.width - 40, chartHeight);

    const gradientEv = ctx.createLinearGradient(0, chartBottom - evHeight, 0, chartBottom);
    gradientEv.addColorStop(0, '#1E2A78');
    gradientEv.addColorStop(1, '#007BFF');
    const gradientTh = ctx.createLinearGradient(0, chartBottom - thHeight, 0, chartBottom);
    gradientTh.addColorStop(0, '#9f1239');
    gradientTh.addColorStop(1, '#ef4444');

    ctx.fillStyle = gradientEv;
    ctx.fillRect(85, chartBottom - evHeight, 90, evHeight);
    ctx.fillStyle = gradientTh;
    ctx.fillRect(235, chartBottom - thHeight, 90, thHeight);

    ctx.fillStyle = '#111';
    ctx.font = '600 14px Inter, sans-serif';
    ctx.fillText('Électrique', 92, 245);
    ctx.fillText('Thermique', 242, 245);

    ctx.font = '500 12px Inter, sans-serif';
    ctx.fillText(`${Math.round(ev).toLocaleString('fr-FR')} €`, 86, chartBottom - evHeight - 8);
    ctx.fillText(`${Math.round(th).toLocaleString('fr-FR')} €`, 236, chartBottom - thHeight - 8);
  }

  function updateDetails(evData, thData, years) {
    const evEnergy = computeEnergy(evData.annualKm, evData.consumption, evData.energyPrice, evData.energyIncrease, years);
    const thEnergy = computeEnergy(thData.annualKm, thData.consumption, thData.energyPrice, thData.energyIncrease, years);

    byId('ev-energy-detail').textContent = Utils.toCurrency(evEnergy);
    byId('th-energy-detail').textContent = Utils.toCurrency(thEnergy);
    byId('ev-maint-detail').textContent = Utils.toCurrency(evData.maintenance * years);
    byId('th-maint-detail').textContent = Utils.toCurrency(thData.maintenance * years);
  }

  function calculateAndRender() {
    const years = Math.min(10, Math.max(1, Number(byId('years').value || cfg.defaults.years)));
    byId('years').value = years;
    const annualKm = Number(byId('annual-km').value || 0);

    const evData = {
      purchasePrice: Number(byId('ev-price').value || 0),
      adjustment: -Number(byId('ev-bonus').value || 0),
      energyPrice: Number(byId('electricity-price').value || 0),
      consumption: Number(byId('ev-consumption').value || 0),
      annualKm,
      maintenance: Number(byId('ev-maintenance').value || 0),
      resaleType: byId('ev-resale-type').value,
      resaleValue: Number(byId('ev-resale').value || 0),
      oneshot: Number(byId('charger-cost').value || 0),
      energyIncrease: Number(byId('electricity-increase').value || 0)
    };

    const thData = {
      purchasePrice: Number(byId('th-price').value || 0),
      adjustment: Number(byId('th-malus').value || 0),
      energyPrice: Number(byId('fuel-price').value || 0),
      consumption: Number(byId('th-consumption').value || 0),
      annualKm,
      maintenance: Number(byId('th-maintenance').value || 0),
      resaleType: byId('th-resale-type').value,
      resaleValue: Number(byId('th-resale').value || 0),
      oneshot: 0,
      energyIncrease: Number(byId('fuel-increase').value || 0)
    };

    const evTotal = totalCost(evData, years);
    const thTotal = totalCost(thData, years);

    byId('ev-total').textContent = Utils.toCurrency(evTotal);
    byId('th-total').textContent = Utils.toCurrency(thTotal);
    byId('ev-monthly').textContent = Utils.toCurrency(evTotal / (years * 12));
    byId('th-monthly').textContent = Utils.toCurrency(thTotal / (years * 12));

    byId('period-label').textContent = `${years} an${years > 1 ? 's' : ''}`;
    byId('difference').textContent = Utils.toCurrency(Math.abs(evTotal - thTotal));
    byId('winner').textContent = evTotal <= thTotal
      ? `Sur ${years} ans, le véhicule électrique est le plus économique.`
      : `Sur ${years} ans, le véhicule thermique reste le plus économique.`;

    const be = breakEven(evData, thData);
    byId('breakeven').textContent = be
      ? `Rentable à partir de ${be.year} an(s), soit environ ${be.km.toLocaleString('fr-FR')} km.`
      : 'Rentable à partir de… non atteint dans la limite de 10 ans avec ces hypothèses.';

    updateDetails(evData, thData, years);
    renderBarChart(evTotal, thTotal);
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('simulator-form')) return;

    byId('years').value = cfg.defaults.years;
    byId('annual-km').value = cfg.defaults.annualKm;
    byId('electricity-price').value = cfg.defaults.electricityPrice;
    byId('fuel-price').value = cfg.defaults.fuelPrice;
    byId('ev-bonus').value = cfg.defaults.ecologicalBonus;
    byId('th-malus').value = cfg.defaults.ecologicalMalus;
    byId('charger-cost').value = cfg.defaults.chargerInstallCost;
    byId('electricity-increase').value = cfg.defaults.annualElectricityIncrease;
    byId('fuel-increase').value = cfg.defaults.annualFuelIncrease;

    setByType('ev', byId('ev-type').value);
    setByType('th', byId('th-type').value);

    document.querySelectorAll('#simulator-form input, #simulator-form select').forEach((field) => {
      field.addEventListener('input', calculateAndRender);
      field.addEventListener('change', (event) => {
        if (event.target.id === 'ev-type') setByType('ev', event.target.value);
        if (event.target.id === 'th-type') setByType('th', event.target.value);
        calculateAndRender();
      });
    });

    calculateAndRender();
  });
})();
