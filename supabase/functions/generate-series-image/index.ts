// generate-series-image — Gemini image for a series (challenge) poster.
// Body: { challenge_id, prompt }
// Deploy: supabase functions deploy generate-series-image  (needs GEMINI_API_KEY)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { challenge_id, prompt } = await req.json();
    if (!challenge_id) throw new Error('challenge_id required');

    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
    const { data: c, error } = await db.from('challenges').select('id, name, description').eq('id', challenge_id).single();
    if (error || !c) throw new Error('series not found');

    const fullPrompt = [
      'Create a vibrant, energetic 16:9 fitness program banner image.',
      `Program: ${c.name}.`, c.description ? `About: ${c.description}.` : '',
      prompt ? `Style/extra: ${prompt}.` : '',
      'Bright, motivating, modern. No text, no words, no letters in the image.',
    ].filter(Boolean).join(' ');

    const apiKey = Deno.env.get('GEMINI_API_KEY')!;
    const models = [Deno.env.get('GEMINI_IMAGE_MODEL') ?? 'gemini-3-pro-image-preview', 'gemini-2.5-flash-image', 'gemini-2.5-flash-image-preview'];
    let res: Response | null = null, lastErr = '';
    for (const m of models) {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }], generationConfig: { responseModalities: ['TEXT', 'IMAGE'] } }),
      });
      if (r.ok) { res = r; break; }
      lastErr = `${m} → ${r.status}: ${await r.text()}`;
      if (r.status !== 404) break;
    }
    if (!res) throw new Error(`Gemini image error: ${lastErr}`);
    const data = await res.json();
    const img = (data.candidates?.[0]?.content?.parts ?? []).find((p: any) => p.inlineData?.data);
    if (!img) throw new Error('No image returned');

    const bytes = Uint8Array.from(atob(img.inlineData.data), ch => ch.charCodeAt(0));
    const mime = img.inlineData.mimeType ?? 'image/png';
    const path = `challenge/${c.id}-ai.${mime.includes('png') ? 'png' : 'jpg'}`;
    const { error: upErr } = await db.storage.from('posters').upload(path, bytes, { contentType: mime, upsert: true });
    if (upErr) throw upErr;
    const { data: pub } = db.storage.from('posters').getPublicUrl(path);
    const url = `${pub.publicUrl}?t=${Date.now()}`;
    await db.from('challenges').update({ poster_url: url }).eq('id', challenge_id);

    return new Response(JSON.stringify({ poster_url: url }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err.message ?? err) }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
});
