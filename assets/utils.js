window.Utils = {
  toCurrency(value) {
    const number = Number(value) || 0;
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(number);
  },
  toDecimal(value, digits = 2) {
    return `${Number(value).toFixed(digits).replace('.', ',')}`;
  },
  byId(id) {
    return document.getElementById(id);
  }
};
