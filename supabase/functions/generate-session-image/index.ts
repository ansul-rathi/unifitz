// generate-session-image — Gemini image generation for a session poster.
// Combines session title + description + the teacher's extra prompt, asks Gemini
// for a 16:9 image, uploads it to the posters bucket, sets sessions.poster_url.
//
// Body: { session_id, prompt }
// Deploy: supabase functions deploy generate-session-image
// Needs the GEMINI_API_KEY secret (same one used by generate-diet-plan).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { session_id, prompt } = await req.json();
    if (!session_id) throw new Error('session_id required');

    const db = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    );

    const { data: s, error } = await db.from('sessions')
      .select('id, challenge_id, title, description').eq('id', session_id).single();
    if (error || !s) throw new Error('session not found');

    const fullPrompt = [
      `Create a vibrant, energetic 16:9 fitness class poster image.`,
      `Class title: ${s.title}.`,
      s.description ? `About: ${s.description}.` : '',
      prompt ? `Style/extra: ${prompt}.` : '',
      `Bright, motivating, modern. No text, no words, no letters in the image.`,
    ].filter(Boolean).join(' ');

    const apiKey = Deno.env.get('GEMINI_API_KEY')!;
    // Nano Banana Pro first (best poster text), fall back to flash image.
    // GEMINI_IMAGE_MODEL secret overrides the primary if Google renames again.
    const primary = Deno.env.get('GEMINI_IMAGE_MODEL') ?? 'gemini-3-pro-image-preview';
    const models = [primary, 'gemini-2.5-flash-image', 'gemini-2.5-flash-image-preview'];

    async function callModel(model: string) {
      return fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
          }),
        },
      );
    }

    let res: Response | null = null;
    let lastErr = '';
    for (const model of models) {
      const r = await callModel(model);
      if (r.ok) { res = r; break; }
      lastErr = `${model} → ${r.status}: ${await r.text()}`;
      if (r.status !== 404) break; // only fall through on "model not found"
    }
    if (!res) throw new Error(`Gemini image error: ${lastErr}`);
    const data = await res.json();

    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const img = parts.find((p: any) => p.inlineData?.data);
    if (!img) throw new Error('No image returned by Gemini');

    const bytes = Uint8Array.from(atob(img.inlineData.data), c => c.charCodeAt(0));
    const mime = img.inlineData.mimeType ?? 'image/png';
    const ext = mime.includes('png') ? 'png' : 'jpg';
    const path = `${s.challenge_id}/${s.id}-ai.${ext}`;

    const { error: upErr } = await db.storage.from('posters').upload(path, bytes, { contentType: mime, upsert: true });
    if (upErr) throw upErr;

    const { data: pub } = db.storage.from('posters').getPublicUrl(path);
    const url = `${pub.publicUrl}?t=${Date.now()}`;
    await db.from('sessions').update({ poster_url: url }).eq('id', session_id);

    return new Response(JSON.stringify({ poster_url: url }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err.message ?? err) }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
