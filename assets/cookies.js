(function () {
  const STORAGE_KEY = 'cookieConsent';

  function getConsent() {
    return localStorage.getItem(STORAGE_KEY);
  }

  function saveConsent(value) {
    localStorage.setItem(STORAGE_KEY, value);
  }

  window.injectAdsense = function injectAdsense() {
    const cfg = window.APP_CONFIG?.adsense;
    if (!cfg || !cfg.clientId || document.querySelector('script[data-adsense="1"]')) return;

    const script = document.createElement('script');
    script.async = true;
    script.dataset.adsense = '1';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${cfg.clientId}`;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  };

  function hideBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.hidden = true;
  }

  function showBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.hidden = false;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const consent = getConsent();
    const acceptButton = document.getElementById('cookie-accept');
    const rejectButton = document.getElementById('cookie-reject');
    const manageLink = document.getElementById('manage-cookies');

    if (!consent) {
      showBanner();
    } else if (consent === 'accepted') {
      injectAdsense();
    }

    acceptButton?.addEventListener('click', () => {
      saveConsent('accepted');
      injectAdsense();
      hideBanner();
    });

    rejectButton?.addEventListener('click', () => {
      saveConsent('refused');
      hideBanner();
    });

    manageLink?.addEventListener('click', (event) => {
      event.preventDefault();
      localStorage.removeItem(STORAGE_KEY);
      showBanner();
    });
  });
})();
