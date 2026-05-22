// eslint-disable-next-line import/no-unused-modules
export const WA_NUMBER = 'yournumber'; // replace with actual WhatsApp number
// eslint-disable-next-line import/no-unused-modules
export const WA_BASE = `https://wa.me/${WA_NUMBER}`;
export const WA_TRIAL = `${WA_BASE}?text=Hi,%20I%20want%20to%20join%20Unifitz%20free%20trial`;
export const WA_BATCH = `${WA_BASE}?text=Hi,%20I%20want%20to%20book%20a%20batch%20at%20Unifitz`;
export const WA_GENERAL = `${WA_BASE}?text=Hi,%20I%20want%20to%20join%20Unifitz`;
export const WA_PROGRAM = (name: string) =>
  `${WA_BASE}?text=Hi,%20I%20want%20to%20know%20more%20about%20${encodeURIComponent(name)}`;
