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
    const { challenge_id } = await req.json();
    if (!challenge_id) throw new Error('challenge_id required');

    // Identify the caller from their JWT.
    const authed = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const { data: { user } } = await authed.auth.getUser();
    if (!user) throw new Error('not authenticated');

    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
    const { data: ch, error } = await db.from('challenges').select('id, name, price, currency, is_free').eq('id', challenge_id).single();
    if (error || !ch) throw new Error('series not found');
    if (ch.is_free || !ch.price || ch.price <= 0) throw new Error('this series is free — just enroll');

    const keyId = Deno.env.get('RAZORPAY_KEY_ID')!;
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!;
    const basic = btoa(`${keyId}:${keySecret}`);

    const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(ch.price * 100),       // paise
        currency: ch.currency || 'INR',
        receipt: `series_${ch.id}_${user.id}`.slice(0, 40),
        notes: { challenge_id: ch.id, user_id: user.id },
      }),
    });
    if (!orderRes.ok) throw new Error(`Razorpay order failed: ${await orderRes.text()}`);
    const order = await orderRes.json();

    await db.from('payments').insert({
      user_id: user.id, challenge_id: ch.id, amount: ch.price, currency: ch.currency || 'INR',
      method: 'razorpay', status: 'created', razorpay_order_id: order.id,
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
