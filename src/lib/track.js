// ══════════════════════════════════════════════════════════════
// Lightweight analytics stub. Nothing is wired yet, so this fans out
// to whatever exists (dataLayer / gtag / plausible) and always logs in
// dev. Swap the body for the real destination later — call sites and
// event names stay the same.
// ══════════════════════════════════════════════════════════════

export function track(event, props = {}) {
  const payload = { event, ...props, ts: Date.now() };
  try {
    if (typeof window !== 'undefined') {
      if (Array.isArray(window.dataLayer)) window.dataLayer.push(payload);
      if (typeof window.gtag === 'function') window.gtag('event', event, props);
      if (typeof window.plausible === 'function') window.plausible(event, { props });
    }
  } catch { /* analytics must never break the page */ }
  if (import.meta?.env?.DEV) console.debug('[track]', event, props);
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
