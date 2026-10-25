// Single source of truth for business contact + social links.
// Update these once and the landing page, WhatsApp button, footer and
// SEO/JSON-LD all pick them up.

// Auth: allow brand-new accounts to be created on first email OTP.
// Flip to false for invite-only / login-only mode.
export const ALLOW_SIGNUP_VIA_OTP = true;

export const BUSINESS = {
  name: 'Unifitz',
  // wa.me needs digits only, country code first, no + or spaces.
  whatsappNumber: '917387846841',
  phoneDisplay: '+91 73878 46841',
  email: 'hello@unifitz.in',
  area: 'Jaipur',
  region: 'Rajasthan',
  country: 'India',
  addressLine: 'Jaipur, Rajasthan, India',
  url: 'https://www.unifitz.in',
  // Only verified Unifitz-owned profiles. A null entry hides its footer icon and
  // keeps it out of structured data. (The old /unifit handles weren't ours.)
  socials: {
    instagram: null,
    facebook: null,
    youtube: null,
  },
  // Legal entity shown in the footer + policy pages. null → "Unifitz, Jaipur…".
  legalName: null,
  // Grievance officer (India DPDP Act / IT Rules). null → falls back to `email`.
  grievanceOfficer: null,
  // Full-refund window for a member's FIRST payment, in days. null → the
  // policy pages state "cancel anytime, no partial refunds" only.
  refundDays: null,
  // Hours WhatsApp/email is answered, shown next to contact links.
  supportHours: 'Replies within 24 hours, Mon–Sat',
};

// Bump when the masterclass consent wording changes; stored with each lead.
export const CONSENT_VERSION = '2026-10-25';

// Country codes offered on public phone fields (US market first, NRI spread).
// `len` = valid national-number lengths, used for validation.
export const DIAL_CODES = [
  { code: '1', label: 'US/CA +1', len: [10] },
  { code: '91', label: 'IN +91', len: [10] },
  { code: '44', label: 'UK +44', len: [10] },
  { code: '971', label: 'UAE +971', len: [9] },
  { code: '61', label: 'AU +61', len: [9] },
  { code: '65', label: 'SG +65', len: [8] },
];

// National number + dial code → E.164 ("+15551234567"), or null if invalid.
export function toE164(dialCode, national) {
  const cc = DIAL_CODES.find(d => d.code === dialCode);
  let digits = String(national ?? '').replace(/\D/g, '');
  if (digits.startsWith('0')) digits = digits.replace(/^0+/, '');       // UK/IN trunk 0
  if (digits.startsWith(dialCode) && digits.length > (cc?.len[0] ?? 0)) digits = digits.slice(dialCode.length);
  if (!cc || !cc.len.includes(digits.length)) return null;
  return `+${dialCode}${digits}`;
}

export const WA_PREFILL = "Hi Unifitz! I'd like to know more about your plans.";

export function waLink(text = WA_PREFILL) {
  return `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

// api.whatsapp.com form (used for the custom diet-plan handoff + reusable).
export function waSendLink(text = WA_PREFILL) {
  return `https://api.whatsapp.com/send?phone=${BUSINESS.whatsappNumber}&text=${encodeURIComponent(text)}`;
}

// Message a SPECIFIC member's number (admin follow-ups) — distinct from the
// business-number links above. Normalizes to wa.me digits: strips non-digits.
// E.164 numbers ("+1…") are used as-is; legacy bare 10-digit numbers (stored
// before the country picker existed) are assumed Indian (91). Null if unusable.
export function waTo(phone, text = '') {
  const raw = String(phone ?? '').trim();
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 8) return null;
  const withCc = raw.startsWith('+') ? digits : digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${withCc}?text=${encodeURIComponent(text)}`;
}
