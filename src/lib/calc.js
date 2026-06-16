// BMI + TDEE (Mifflin-St Jeor) used by onboarding and progress reports.

export function calcBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  const m = heightCm / 100;
  return +(weightKg / (m * m)).toFixed(1);
}

export function bmiCategory(bmi) {
  if (bmi == null) return '';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LABELS = {
  sedentary: 'Sedentary (desk job, little exercise)',
  light: 'Lightly active (1–3 workouts/week)',
  moderate: 'Moderately active (3–5 workouts/week)',
  active: 'Active (6–7 workouts/week)',
  very_active: 'Very active (physical job + training)',
};

export function calcTDEE({ weightKg, heightCm, age, gender, activityLevel }) {
  if (!weightKg || !heightCm || !age) return null;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = gender === 'male' ? base + 5 : base - 161;
  return Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.2));
}
