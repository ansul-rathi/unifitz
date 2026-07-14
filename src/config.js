// Single source of truth for business contact + social links.
// Update these once and the landing page, WhatsApp button, footer and
// SEO/JSON-LD all pick them up.

// Auth: allow brand-new accounts to be created on first email OTP.
// Flip to false for invite-only / login-only mode.
export const ALLOW_SIGNUP_VIA_OTP = true;

export const BUSINESS = {
  name: 'UniFit',
  // wa.me needs digits only, country code first, no + or spaces.
  whatsappNumber: '917387846841',
  phoneDisplay: '+91 73878 46841',
  email: 'hello@unifit.in',
  area: 'Jaipur',
  region: 'Rajasthan',
  country: 'India',
  addressLine: 'Jaipur, Rajasthan, India',
  url: 'https://www.unifitz.in',
  socials: {
    instagram: 'https://instagram.com/unifit',
    facebook: 'https://facebook.com/unifit',
    youtube: 'https://youtube.com/@unifit',
  },
};

export const WA_PREFILL = "Hi UniFit! I'd like to book a free demo class.";

export function waLink(text = WA_PREFILL) {
  return `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

// api.whatsapp.com form (used for the custom diet-plan handoff + reusable).
export function waSendLink(text = WA_PREFILL) {
  return `https://api.whatsapp.com/send?phone=${BUSINESS.whatsappNumber}&text=${encodeURIComponent(text)}`;
}

// Message a SPECIFIC member's number (admin follow-ups) — distinct from the
// business-number links above. Normalizes to wa.me digits: strips non-digits and
// assumes India (91) when no country code is present. Returns null if unusable.
export function waTo(phone, text = '') {
  const digits = String(phone ?? '').replace(/\D/g, '');
  if (digits.length < 10) return null;
  const withCc = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${withCc}?text=${encodeURIComponent(text)}`;
}
