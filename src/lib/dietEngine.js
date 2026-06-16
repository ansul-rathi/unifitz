// Diet engine — fixed dietician plan, quantities scaled per person. NO AI.
import { calcBMI, calcTDEE } from './calc';

const BASE_KCAL = 1650;          // dietician reference: 55 kg female
const FLOOR = { male: 1500, female: 1200, other: 1200 };

// Daily macro targets from the profile (exact dietician formulas).
export function dietTargets(profile) {
  const w = Number(profile.starting_weight_kg);
  const h = Number(profile.height_cm);
  const age = Number(profile.age);
  const gender = profile.gender || 'female';
  const goal = profile.fitness_goal || 'maintain';
  if (!w || !h || !age) return null;

  const tdee = calcTDEE({ weightKg: w, heightCm: h, age, gender, activityLevel: profile.activity_level });
  let total = goal === 'lose_weight' ? tdee - 500 : goal === 'gain_muscle' ? tdee + 300 : tdee;
  total = Math.max(total, FLOOR[gender] ?? 1200);

  const proteinPerKg = goal === 'gain_muscle' ? 1.6 : goal === 'lose_weight' ? 1.4 : 1.2;
  const protein_g = Math.round(proteinPerKg * w);
  const fat_g = Math.round((0.30 * total) / 9);
  const carbs_g = Math.round((total - protein_g * 4 - fat_g * 9) / 4);

  return {
    total_calories: Math.round(total),
    protein_g, fat_g, carbs_g,
    fiber_min: 30, fiber_max: 40,
    bmi: calcBMI(w, h),
    scale_factor: total / BASE_KCAL,
  };
}

const round5 = n => Math.round(n / 5) * 5;

// Build the personalized day from template rows for a track + targets.
// rows: diet_plan_template rows; track: 'veg' | 'non-veg'.
export function buildDay(rows, track, targets) {
  const sf = targets?.scale_factor ?? 1;
  const slots = ['early_morning', 'breakfast', 'snack1', 'snack2', 'lunch', 'snack3', 'dinner'];

  const meals = slots.map(slot => {
    const opts = rows
      .filter(r => r.meal_slot === slot && (r.track === track || r.track === 'both'))
      .sort((a, b) => a.option_no - b.option_no)
      .map(r => ({
        ...r,
        calories: r.scalable ? round5(r.base_calories * sf) : r.base_calories,
        protein: r.scalable ? Math.round(r.base_protein_g * sf) : r.base_protein_g,
      }));
    return { slot, options: opts };
  }).filter(m => m.options.length);

  // Day total from option 1 of each slot.
  const primary = meals.map(m => m.options[0]);
  const totalCal = primary.reduce((s, o) => s + o.calories, 0);
  const totalProtein = primary.reduce((s, o) => s + o.protein, 0);

  return { meals, totalCal, totalProtein };
}

export const SLOT_LABELS = {
  early_morning: 'Early morning', breakfast: 'Breakfast', snack1: 'Snack 1',
  snack2: 'Snack 2', lunch: 'Lunch', snack3: 'Snack 3', dinner: 'Dinner',
};
