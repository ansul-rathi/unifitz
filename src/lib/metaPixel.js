// Meta Pixel. Loads only when given a real pixel id (digits), so a
// placeholder id means no script, no fbq, no console errors.
// Every Lead carries an event_id that is also saved on the lead row, so a
// server-side Conversions API call can dedupe against it later.
// TODO(CAPI): edge function that reads new leads and POSTs
//   { event_name: 'Lead', event_id, event_time, action_source: 'website', user_data: { ph: sha256(phone) } }
//   to graph.facebook.com/v19.0/<PIXEL_ID>/events with the CAPI access token.

let activeId = null;

export function loadPixel(id) {
  if (typeof window === 'undefined' || !/^\d{6,20}$/.test(String(id ?? ''))) return false;
  if (activeId === id) return true;
  if (!window.fbq) {
    const fbq = function fbq() { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
    Object.assign(fbq, { push: fbq, loaded: true, version: '2.0', queue: [] });
    window.fbq = fbq;
    if (!window._fbq) window._fbq = fbq;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(s);
  }
  window.fbq('init', id);
  activeId = id;
  return true;
}

export function pixel(event, params, eventId) {
  try {
    if (activeId && typeof window.fbq === 'function') window.fbq('track', event, params ?? {}, eventId ? { eventID: eventId } : undefined);
  } catch { /* tracking must never break the page */ }
  if (import.meta?.env?.DEV) console.debug('[pixel]', event, params, eventId);
}
