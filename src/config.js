// Single source of truth for business contact + social links.
// Update these once and the landing page, WhatsApp button, footer and
// SEO/JSON-LD all pick them up.

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
