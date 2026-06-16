// Text-only branded PDF of the personalized plan, with clickable recipe links.
// No images — a styled "UniFit" wordmark only. Uses jsPDF text + link annotations.
import { jsPDF } from 'jspdf';
import { BUSINESS } from '../config';
import { SLOT_LABELS } from './dietEngine';

const ORANGE = [249, 115, 22];
const SLATE = [51, 65, 85];
const MUTED = [120, 130, 145];

export function downloadDietPdf({ profile, track, targets, day, rules, workout }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const M = 48;
  let y = 56;
  const recipeBase = `${BUSINESS.url}/recipes/`;

  const line = (gap = 16) => { y += gap; if (y > 770) { doc.addPage(); y = 56; } };
  const heading = (t) => {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(...ORANGE);
    doc.text(t, M, y); line(20);
  };
  const text = (t, { bold = false, size = 10, color = SLATE, indent = 0 } = {}) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(...color);
    const wrapped = doc.splitTextToSize(t, W - M * 2 - indent);
    doc.text(wrapped, M + indent, y);
    line(14 * wrapped.length);
  };

  // Wordmark
  doc.setFont('helvetica', 'bold'); doc.setFontSize(26); doc.setTextColor(...SLATE);
  doc.text('Uni', M, y);
  const uniW = doc.getTextWidth('Uni');
  doc.setTextColor(...ORANGE); doc.text('Fit', M + uniW, y);
  line(10);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...MUTED);
  doc.text('Your Personalized Diet Plan', M, y); line(22);

  // Header info
  text(`Name: ${profile.full_name || '-'}`, { bold: true });
  text(`Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`);
  text(`Track: ${track === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}`);
  line(6);

  // Daily targets
  heading('Your Daily Targets');
  text(`Calories: ${targets.total_calories} kcal   |   Protein: ${targets.protein_g} g   |   Fat: ${targets.fat_g} g   |   Carbs: ${targets.carbs_g} g   |   Fibre: ${targets.fiber_min}-${targets.fiber_max} g`);
  if (targets.bmi) text(`BMI: ${targets.bmi}`);
  line(8);

  // Meals (each dish name links to its recipe page)
  heading('Your Day');
  day.meals.forEach(m => {
    const slot = SLOT_LABELS[m.slot] ?? m.slot;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...SLATE);
    doc.text(slot.toUpperCase(), M, y); line(14);
    m.options.forEach((o, i) => {
      const prefix = m.options.length > 1 ? `Option ${i + 1}: ` : '';
      // Linked dish line.
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(40, 90, 200);
      const label = `${prefix}${o.description}  (${o.calories} kcal, ${o.protein} g P)`;
      const wrapped = doc.splitTextToSize(label, W - M * 2 - 12);
      doc.text(wrapped, M + 12, y);
      if (o.recipe_code) doc.link(M + 12, y - 9, W - M * 2 - 12, 12 * wrapped.length, { url: recipeBase + o.recipe_code });
      line(13 * wrapped.length + 2);
    });
    line(4);
  });

  text(`Estimated day total: ${day.totalCal} kcal, ${day.totalProtein} g protein`, { bold: true });
  line(8);

  // Rules
  if (rules?.length) {
    heading('Points to follow');
    rules.forEach((r, i) => text(`${i + 1}. ${r.rule}`, { indent: 6 }));
    line(6);
  }

  // Workout
  if (workout?.length) {
    heading('Weekly workout (30-Day Challenge)');
    workout.forEach(w => text(`• ${w.day_label}: ${w.activity}${w.focus ? ` — ${w.focus}` : ''}`, { indent: 6 }));
    line(6);
  }

  // Disclaimer
  doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(...MUTED);
  const disc = doc.splitTextToSize('This plan is a general healthy-eating guide, not medical advice. Consult a doctor or dietician for medical conditions, pregnancy, or allergies.', W - M * 2);
  doc.text(disc, M, y);

  const safeName = (profile.full_name || 'member').replace(/\s+/g, '-');
  const date = new Date().toISOString().slice(0, 10);
  doc.save(`UniFit-Diet-Plan-${safeName}-${date}.pdf`);
}
