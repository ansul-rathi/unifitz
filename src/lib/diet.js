import { supabase } from './supabase';
import { calcBMI, calcTDEE } from './calc';

// Pure client-side numbers for the "Your Numbers" card (no AI needed).
export function dietNumbers(profile) {
  const w = profile.starting_weight_kg, h = profile.height_cm;
  const tdee = calcTDEE({
    weightKg: w, heightCm: h, age: profile.age,
    gender: profile.gender, activityLevel: profile.activity_level,
  });
  const target = !tdee ? null
    : profile.fitness_goal === 'lose_weight' ? tdee - 500
    : profile.fitness_goal === 'gain_muscle' ? tdee + 300
    : tdee;
  return {
    bmi: calcBMI(w, h),
    tdee,
    target,
    protein_g: target ? Math.round((target * 0.30) / 4) : null,
    carbs_g: target ? Math.round((target * 0.40) / 4) : null,
    fat_g: target ? Math.round((target * 0.30) / 9) : null,
  };
}

export const DIET_REQUIRED = ['age', 'gender', 'height_cm', 'starting_weight_kg', 'activity_level', 'fitness_goal'];

export function profileComplete(profile) {
  return profile?.onboarding_complete && DIET_REQUIRED.every(f => profile[f] != null && profile[f] !== '');
}

export async function generateDietPlan(userId) {
  const { data, error } = await supabase.functions.invoke('generate-diet-plan', { body: { user_id: userId } });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data; // { plan } | { premium: true }
}
