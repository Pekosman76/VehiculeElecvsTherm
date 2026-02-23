(function () {
  const STORAGE_KEY = 'cookiePreferences';

  function getPrefs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch {
      return null;
    }
  }

  function savePrefs(prefs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    applyPrefs(prefs);
  }

  function applyPrefs(prefs) {
    if (prefs && prefs.advertising) {
      injectAdsense();
    }
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

  function closeModal() {
    const modal = document.getElementById('cookie-modal');
    if (!modal) return;
    modal.hidden = true;
  }

  function openModal() {
    const modal = document.getElementById('cookie-modal');
    if (!modal) return;
    const prefs = getPrefs() || { audience: false, advertising: false };
    document.getElementById('cookie-audience').checked = !!prefs.audience;
    document.getElementById('cookie-advertising').checked = !!prefs.advertising;
    modal.hidden = false;
    modal.focus();
  }

  function hideBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.hidden = true;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const existing = getPrefs();
    if (!existing) {
      document.getElementById('cookie-banner')?.removeAttribute('hidden');
    } else {
      applyPrefs(existing);
    }

    document.getElementById('cookie-accept')?.addEventListener('click', () => {
      savePrefs({ audience: true, advertising: true });
      hideBanner();
    });

    document.getElementById('cookie-reject')?.addEventListener('click', () => {
      savePrefs({ audience: false, advertising: false });
      hideBanner();
    });

    document.getElementById('cookie-settings')?.addEventListener('click', openModal);
    document.getElementById('manage-cookies')?.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });

    document.getElementById('cookie-modal-close')?.addEventListener('click', closeModal);
    document.getElementById('cookie-save')?.addEventListener('click', () => {
      savePrefs({
        audience: document.getElementById('cookie-audience').checked,
        advertising: document.getElementById('cookie-advertising').checked
      });
      hideBanner();
      closeModal();
    });
  });
})();
