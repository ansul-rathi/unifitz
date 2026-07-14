// razorpay-create-order — creates a Razorpay order for a paid series and a
// `payments` row (status 'created'). Returns order id + public key for checkout.
//
// Body: { challenge_id }   (caller identified via Authorization JWT)
// Deploy: supabase functions deploy razorpay-create-order
// Secrets: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { challenge_id, plan_id } = await req.json();
    if (!challenge_id) throw new Error('challenge_id required');

    // Identify the caller from their JWT.
    const authed = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const { data: { user } } = await authed.auth.getUser();
    if (!user) throw new Error('not authenticated');

    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
    const { data: ch, error } = await db.from('challenges').select('id, name, price, currency, is_free, access_type').eq('id', challenge_id).single();
    if (error || !ch) throw new Error('series not found');
    if (ch.is_free) throw new Error('this series is free — just enroll');

    // Recorded series sell by plan (server-trusted price/duration); live series
    // use the single challenge price. Never trust a client-sent amount.
    const recorded = ch.access_type === 'recorded';
    let amount = Number(ch.price);
    let planMonths: number | null = null;
    let planLabel: string | null = null;
    if (recorded) {
      if (!plan_id) throw new Error('pick a plan');
      const { data: plan } = await db.from('recorded_plans')
        .select('price, months, label, is_active').eq('id', plan_id).eq('challenge_id', ch.id).single();
      if (!plan || !plan.is_active) throw new Error('plan not available');
      amount = Number(plan.price);
      planMonths = plan.months;
      planLabel = plan.label;
    }
    if (!amount || amount <= 0) throw new Error('nothing to pay for this series');

    const keyId = Deno.env.get('RAZORPAY_KEY_ID')!;
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!;
    const basic = btoa(`${keyId}:${keySecret}`);

    const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(amount * 100),         // paise
        currency: ch.currency || 'INR',
        receipt: `series_${ch.id}_${user.id}`.slice(0, 40),
        notes: { challenge_id: ch.id, user_id: user.id },
      }),
    });
    if (!orderRes.ok) throw new Error(`Razorpay order failed: ${await orderRes.text()}`);
    const order = await orderRes.json();

    await db.from('payments').insert({
      user_id: user.id, challenge_id: ch.id, amount, currency: ch.currency || 'INR',
      method: 'razorpay', status: 'created', razorpay_order_id: order.id,
      access_type: ch.access_type || 'live', plan_months: planMonths, plan_label: planLabel,
    });

    return new Response(JSON.stringify({
      order_id: order.id, amount: order.amount, currency: order.currency,
      key_id: keyId, name: ch.name,
    }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err.message ?? err) }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
