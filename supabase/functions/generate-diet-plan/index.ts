// generate-diet-plan — calls Gemini to produce a structured 7-day Indian meal
// plan, parses the JSON, saves it to diet_plans (one-free-plan rule enforced).
// Gemini key stays server-side (GEMINI_API_KEY secret).
//
// Body: { user_id }   (preferences + targets read server-side from DB)
// Deploy: supabase functions deploy generate-diet-plan
//
// One-free-plan rule: if the user already has a plan and the global toggle
// diet_regeneration_enabled is false → return { premium: true } (no generate).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ACT = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { user_id } = await req.json();
    if (!user_id) throw new Error('user_id required');

    const db = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    );

    const { data: profile, error: pErr } = await db.from('profiles')
      .select('age, gender, height_cm, starting_weight_kg, activity_level, fitness_goal, onboarding_complete, bmi, calorie_target')
      .eq('id', user_id).single();
    if (pErr || !profile) throw new Error('profile not found');
    if (!profile.onboarding_complete || !profile.height_cm || !profile.starting_weight_kg || !profile.age) {
      throw new Error('profile incomplete');
    }

    // One-free-plan gate.
    const [{ count: planCount }, { data: toggle }] = await Promise.all([
      db.from('diet_plans').select('id', { count: 'exact', head: true }).eq('user_id', user_id),
      db.from('app_settings').select('value').eq('key', 'diet_regeneration_enabled').maybeSingle(),
    ]);
    const regenOn = toggle?.value === true || toggle?.value === 'true';
    if ((planCount ?? 0) >= 1 && !regenOn) {
      return new Response(JSON.stringify({ premium: true }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    // Numbers.
    const w = profile.starting_weight_kg, h = profile.height_cm, age = profile.age;
    const bmr = profile.gender === 'male'
      ? 10 * w + 6.25 * h - 5 * age + 5
      : 10 * w + 6.25 * h - 5 * age - 161;
    const tdee = Math.round(bmr * (ACT[profile.activity_level] ?? 1.2));
    const target = profile.fitness_goal === 'lose_weight' ? tdee - 500
      : profile.fitness_goal === 'gain_muscle' ? tdee + 300 : tdee;
    const protein_g = Math.round((target * 0.30) / 4);
    const carbs_g = Math.round((target * 0.40) / 4);
    const fat_g = Math.round((target * 0.30) / 9);

    const { data: prefs } = await db.from('diet_preferences').select('*').eq('user_id', user_id).maybeSingle();
    const dietType = prefs?.diet_type ?? 'veg';
    const meals = prefs?.meals_per_day ?? 3;
    const allergies = prefs?.allergies_or_dislikes ?? 'none';

    // Gemini call — JSON-only output.
    const apiKey = Deno.env.get('GEMINI_API_KEY')!;
    const prompt = `You are a certified Indian nutritionist. Create a 7-day Indian meal plan.
Daily target: ${target} kcal, protein ${protein_g}g, carbs ${carbs_g}g, fat ${fat_g}g.
Diet type: ${dietType}. Meals per day: ${meals}. Avoid: ${allergies}.
Use common, affordable Indian foods. Hit the daily target within ~5%.
Return ONLY valid JSON (no markdown, no prose) with this exact shape:
{"days":[{"day":"Monday","meals":[{"name":"Breakfast","items":["..."],"approx_calories":0,"protein_g":0,"carbs_g":0,"fat_g":0}]}]}
Exactly 7 days, exactly ${meals} meals per day.`;

    const gemRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
        }),
      },
    );
    if (!gemRes.ok) throw new Error(`Gemini error ${gemRes.status}: ${await gemRes.text()}`);
    const gem = await gemRes.json();
    const text = gem.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    let plan: any;
    try {
      plan = JSON.parse(text);
    } catch {
      // strip accidental code fences then retry
      plan = JSON.parse(text.replace(/```json|```/g, '').trim());
    }
    if (!plan?.days?.length) throw new Error('Gemini returned no plan');

    // Save (first plan is the free one).
    const { data: saved, error: sErr } = await db.from('diet_plans').insert({
      user_id, plan, calorie_target: target,
      generated_count: (planCount ?? 0) + 1,
      is_free_plan: (planCount ?? 0) === 0,
    }).select('*').single();
    if (sErr) throw sErr;

    // Persist computed numbers on the profile.
    await db.from('profiles').update({
      bmi: +(w / ((h / 100) ** 2)).toFixed(1), tdee, calorie_target: target, updated_metrics_at: new Date().toISOString(),
    }).eq('id', user_id);

    return new Response(
      JSON.stringify({ plan: saved, numbers: { tdee, target, protein_g, carbs_g, fat_g } }),
      { headers: { ...cors, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err.message ?? err) }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
