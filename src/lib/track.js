// ══════════════════════════════════════════════════════════════
// Analytics. GA4 loads only when VITE_GA4_ID is set (e.g. G-XXXXXXX), so
// local/dev and preview builds never pollute production data. Events also
// fan out to GTM's dataLayer / Plausible if either is present instead.
//
// Consent Mode v2: denied by default for EEA/UK/CH visitors (no cookies until
// a banner grants it), granted elsewhere (US/IN — opt-out regimes).
// ══════════════════════════════════════════════════════════════

const GA4_ID = import.meta.env.VITE_GA4_ID;
const CONSENT_REGIONS = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT',
  'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH',
];

let started = false;
export function initAnalytics() {
  if (started || typeof window === 'undefined' || !GA4_ID) return;
  started = true;
  window.dataLayer = window.dataLayer || [];
  // gtag must push the `arguments` object itself, not an array.
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  const denied = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' };
  window.gtag('consent', 'default', { ...denied, region: CONSENT_REGIONS, wait_for_update: 500 });
  window.gtag('consent', 'default', { ...denied, analytics_storage: 'granted' });
  window.gtag('js', new Date());
  // page_view is sent manually on every route change (SPA) — see trackPageView.
  window.gtag('config', GA4_ID, { send_page_view: false });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(s);
}

export function track(event, props = {}) {
  try {
    if (typeof window !== 'undefined') {
      if (typeof window.gtag === 'function') window.gtag('event', event, props);
      else if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event, ...props });
      if (typeof window.plausible === 'function') window.plausible(event, { props });
    }
  } catch { /* analytics must never break the page */ }
  if (import.meta?.env?.DEV) console.debug('[track]', event, props);
}

export function trackPageView(path) {
  track('page_view', { page_path: path, page_location: window.location.href, page_title: document.title });
}

// Read utm_* + a couple of ad-click ids off the current URL, once.
export function getUtmParams() {
  if (typeof window === 'undefined') return {};
  const p = new URLSearchParams(window.location.search);
  const out = {};
  for (const [k, v] of p.entries()) {
    if (/^utm_/.test(k) || k === 'gclid' || k === 'fbclid') out[k] = v;
  }
  return out;
}

// Persist utm across the session so it survives the scroll to checkout.
export function captureUtm() {
  if (typeof window === 'undefined') return {};
  const fromUrl = getUtmParams();
  try {
    const stored = JSON.parse(sessionStorage.getItem('uf_utm') || '{}');
    const merged = { ...stored, ...fromUrl };
    if (Object.keys(fromUrl).length) sessionStorage.setItem('uf_utm', JSON.stringify(merged));
    return merged;
  } catch {
    return fromUrl;
  }
}
