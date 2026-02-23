(function () {
  const STORAGE_KEY = 'cookieConsent';

  function getConsent() {
    return localStorage.getItem(STORAGE_KEY);
  }

  function setConsent(value) {
    localStorage.setItem(STORAGE_KEY, value);
  }

  function getBanner() {
    return document.getElementById('cookie-banner');
  }

  function showBanner() {
    const banner = getBanner();
    if (!banner) return;
    banner.hidden = false;
    banner.setAttribute('aria-hidden', 'false');
  }

  function hideBanner() {
    const banner = getBanner();
    if (!banner) return;
    banner.hidden = true;
    banner.setAttribute('aria-hidden', 'true');
  }

  function renderAdSlot() {
    const cfg = window.APP_CONFIG?.adsense;
    const container = document.getElementById('adsense-container');
    if (!container || container.childElementCount > 0 || !cfg?.slotHomeTop) return;

    const ad = document.createElement('ins');
    ad.className = 'adsbygoogle';
    ad.style.display = 'block';
    ad.dataset.adClient = cfg.clientId;
    ad.dataset.adSlot = cfg.slotHomeTop;
    ad.dataset.adFormat = 'auto';
    ad.dataset.fullWidthResponsive = 'true';
    ad.setAttribute('aria-label', 'Publicité');

    container.appendChild(ad);
  }

  window.injectAdsense = function injectAdsense() {
    const cfg = window.APP_CONFIG?.adsense;
    if (!cfg?.clientId) return;

    renderAdSlot();

    const alreadyLoaded = document.querySelector('script[data-adsense="1"]');
    if (alreadyLoaded) {
      if (window.adsbygoogle && window.adsbygoogle.push) {
        window.adsbygoogle.push({});
      }
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.dataset.adsense = '1';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${cfg.clientId}`;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      if (window.adsbygoogle && window.adsbygoogle.push) {
        window.adsbygoogle.push({});
      }
    };

    document.head.appendChild(script);
  };

  document.addEventListener('DOMContentLoaded', () => {
    const consent = getConsent();
    const acceptButton = document.getElementById('cookie-accept');
    const rejectButton = document.getElementById('cookie-reject');
    const manageLinks = document.querySelectorAll('[data-manage-cookies]');

    if (consent === 'accepted') {
      hideBanner();
      window.injectAdsense();
    } else if (consent === 'refused') {
      hideBanner();
    } else {
      showBanner();
    }

    acceptButton?.addEventListener('click', () => {
      setConsent('accepted');
      hideBanner();
      window.injectAdsense();
    });

    rejectButton?.addEventListener('click', () => {
      setConsent('refused');
      hideBanner();
    });

    manageLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        localStorage.removeItem(STORAGE_KEY);
        showBanner();
      });
    });
  });
})();
