(function () {
  const cfg = window.APP_CONFIG;
  if (!cfg) return;

  document.querySelectorAll('[data-site-year]').forEach((el) => {
    el.textContent = cfg.SITE_YEAR;
  });
  document.querySelectorAll('[data-next-year]').forEach((el) => {
    el.textContent = cfg.NEXT_YEAR;
  });
  document.querySelectorAll('[data-legal-short]').forEach((el) => {
    el.textContent = cfg.LEGAL_NOTICE_SHORT.replace('{SITE_YEAR}', cfg.SITE_YEAR);
  });
})();
