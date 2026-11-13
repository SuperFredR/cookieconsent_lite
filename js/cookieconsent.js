((Drupal, once) => {
  const COOKIE_NAME = 'cookieconsent_status';
  let analyticsLoaded = false;
  let returnFocusTo = null;

  Drupal.behaviors.cookieconsentLite = {
    attach(context, settings) {
      const opts = settings.cookieconsentLite;
      if (!opts || !once('cookieconsentLite', 'html', context).length) {
        return;
      }

      document.addEventListener('click', (e) => {
        const opener = e.target.closest('[data-cookieconsent-open]');
        if (opener) {
          e.preventDefault();
          showBanner(opts, opener);
        }
      });

      const consent = readConsent();
      if (consent === 'allow') {
        loadAnalytics(opts.measurementId);
      }
      else if (consent === 'deny') {
        removeAnalyticsCookies();
      }
      else {
        showBanner(opts, null);
      }
    },
  };

  function showBanner(opts, opener) {
    returnFocusTo = opener;
    const shown = document.querySelector('.cookieconsent-lite');
    if (shown) {
      shown.focus();
      return;
    }
    const banner = document.createElement('div');
    banner.className = 'cookieconsent-lite';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', Drupal.t('Cookie consent'));
    banner.tabIndex = -1;

    if (opts.title) {
      const title = document.createElement('p');
      title.id = 'cookieconsent-lite-title';
      banner.removeAttribute('aria-label');
      banner.setAttribute('aria-labelledby', title.id);
      title.className = 'cookieconsent-lite__title';
      title.textContent = opts.title;
      banner.append(title);
    }

    const message = document.createElement('p');
    message.className = 'cookieconsent-lite__message';
    message.textContent = `${opts.message} `;
    if (opts.readMoreUrl && opts.readMoreText) {
      const link = document.createElement('a');
      link.className = 'cookieconsent-lite__more';
      link.href = opts.readMoreUrl;
      link.textContent = opts.readMoreText;
      message.append(link);
    }

    const actions = document.createElement('div');
    actions.className = 'cookieconsent-lite__actions';
    actions.append(
      button(opts.acceptText, 'accept', () => {
        saveConsent(opts, 'allow');
        window[`ga-disable-${opts.measurementId}`] = false;
        loadAnalytics(opts.measurementId);
      }),
      button(opts.declineText, 'decline', () => {
        saveConsent(opts, 'deny');
        window[`ga-disable-${opts.measurementId}`] = true;
        removeAnalyticsCookies();
        // An already loaded gtag keeps measuring the current page.
        if (analyticsLoaded) {
          // A GET, not reload(): reloading a POST response would resubmit it.
          window.location.replace(window.location.href.split('#')[0]);
        }
      }),
    );
    banner.append(message, actions);
    // First in the tab order: the choice comes before the page content.
    document.body.prepend(banner);
    if (opener) {
      banner.focus();
    }

    function button(text, modifier, onClick) {
      const element = document.createElement('button');
      element.type = 'button';
      element.className = `cookieconsent-lite__button cookieconsent-lite__button--${modifier}`;
      element.textContent = text;
      element.addEventListener('click', () => {
        banner.remove();
        returnFocusTo?.focus();
        onClick();
      });
      return element;
    }
  }

  function removeAnalyticsCookies() {
    const hostParts = window.location.hostname.split('.');
    const domains = [''];
    for (let i = 0; i < hostParts.length - 1; i++) {
      domains.push(`; domain=.${hostParts.slice(i).join('.')}`);
    }
    document.cookie.split(';').forEach((c) => {
      const name = c.trim().split('=')[0];
      if (name.startsWith('_ga') || name === '_gid') {
        domains.forEach((domain) => {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
        });
      }
    });
  }

  function readConsent() {
    const prefix = `${COOKIE_NAME}=`;
    const cookie = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(prefix));
    return cookie ? cookie.substring(prefix.length) : null;
  }

  function saveConsent(opts, value) {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${COOKIE_NAME}=${value}; max-age=${opts.expiryDays * 86400}; path=/; SameSite=Lax${secure}`;
  }

  function loadAnalytics(measurementId) {
    if (analyticsLoaded) {
      return;
    }
    analyticsLoaded = true;
    if (!window.gtag) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
    }
    window.gtag('config', measurementId);

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.append(script);
  }
})(Drupal, once);
