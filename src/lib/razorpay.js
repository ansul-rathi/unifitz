import { supabase } from './supabase';

// Public Razorpay key for checkout (safe in browser). Set in Vercel env.
const RZP_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

let scriptPromise = null;
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(s);
  });
  return scriptPromise;
}

// Full online flow: create order → open checkout → verify → resolve on success.
export async function payWithRazorpay({ challengeId, profile, email, planId }) {
  await loadCheckout();
  const { data, error } = await supabase.functions.invoke('razorpay-create-order', { body: { challenge_id: challengeId, plan_id: planId } });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: data.key_id || RZP_KEY,
      amount: data.amount,
      currency: data.currency,
      name: 'UniFit',
      description: data.name,
      order_id: data.order_id,
      prefill: { name: profile?.full_name, email, contact: profile?.phone },
      theme: { color: '#F97316' },
      handler: async (resp) => {
        const { data: v, error: vErr } = await supabase.functions.invoke('razorpay-verify', {
          body: {
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
          },
        });
        if (vErr || v?.error) return reject(new Error(v?.error || vErr.message));
        resolve(v);
      },
      modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
    });
    rzp.open();
  });
}

// Cash flow: record a pending-verification payment the admin will approve.
export async function payWithCash({ challengeId, userId, amount, currency, collectorId, accessType, planMonths, planLabel }) {
  const { error } = await supabase.from('payments').insert({
    user_id: userId, challenge_id: challengeId, amount, currency: currency || 'INR',
    method: 'cash', status: 'pending_verification', cash_collector_id: collectorId,
    access_type: accessType || 'live', plan_months: planMonths ?? null, plan_label: planLabel ?? null,
  });
  if (error) throw error;
}
