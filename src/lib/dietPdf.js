// Branded, consultation-grade PDF of the personalized plan, with clickable
// recipe links. Text + drawn tables only (no images) — a styled "UniFit"
// wordmark. Follows the professional diet-plan spec: cover summary, macro +
// micronutrient targets, full-day meals, 7-day rotation, substitutions,
// grocery list, lifestyle, workout alignment, progress tracking, red flags.
import { jsPDF } from 'jspdf';
import { BUSINESS } from '../config';
import { SLOT_LABELS } from './dietEngine';

const ORANGE = [249, 115, 22];
const SLATE = [51, 65, 85];
const MUTED = [120, 130, 145];
const LINK = [40, 90, 200];
const SHADE = [255, 237, 213]; // orange-100 header fill

const GOAL_LABEL = { lose_weight: 'Fat loss', gain_muscle: 'Muscle gain', maintain: 'Maintenance', stay_fit: 'Maintenance' };

export function downloadDietPdf({ profile, track, targets, day, rules, workout }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const M = 48;
  const CW = W - M * 2; // content width
  let y = 56;
  const recipeBase = `${BUSINESS.url}/recipes/`;
  const isVeg = track !== 'non-veg';
  const goal = GOAL_LABEL[profile.fitness_goal] ?? 'Maintenance';

  // ── low-level helpers ──────────────────────────────────────────────
  const room = (need = 0) => { if (y + need > 800) { doc.addPage(); y = 56; } };
  const line = (gap = 16) => { y += gap; room(); };
  const heading = t => {
    line(6); room(30);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(...ORANGE);
    doc.text(t, M, y); line(20);
  };
  const subheading = t => {
    room(20);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(...SLATE);
    doc.text(t, M, y); line(15);
  };
  const text = (t, { bold = false, size = 10, color = SLATE, indent = 0 } = {}) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(...color);
    const wrapped = doc.splitTextToSize(t, CW - indent);
    room(14 * wrapped.length);
    doc.text(wrapped, M + indent, y);
    line(13.5 * wrapped.length);
  };
  const bullets = (arr, { size = 9.5 } = {}) => arr.forEach(t => text(`•  ${t}`, { size, indent: 6 }));

  const shorten = (t, width, size = 8.5) => {
    doc.setFontSize(size);
    if (doc.getTextWidth(t) <= width) return t;
    let s = t;
    while (s.length > 1 && doc.getTextWidth(s + '…') > width) s = s.slice(0, -1);
    return s + '…';
  };

  // Simple table. cols: [{header, width, align?}]; rows: array of string[].
  const table = (cols, rows) => {
    const rh = 18, pad = 5;
    const drawHeader = () => {
      room(rh);
      doc.setFillColor(...SHADE); doc.rect(M, y - 12, CW, rh, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...SLATE);
      let x = M;
      cols.forEach(c => { doc.text(c.header, x + pad, y); x += c.width; });
      line(rh);
    };
    drawHeader();
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...SLATE);
    rows.forEach((r, ri) => {
      if (y + rh > 800) { doc.addPage(); y = 56; drawHeader(); doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...SLATE); }
      if (ri % 2) { doc.setFillColor(248, 250, 252); doc.rect(M, y - 12, CW, rh, 'F'); }
      let x = M;
      cols.forEach((c, ci) => {
        doc.text(shorten(String(r[ci] ?? ''), c.width - pad * 2), x + pad, y);
        x += c.width;
      });
      line(rh);
    });
    // outer + column borders
    doc.setDrawColor(226, 232, 240);
  };

  // ── Wordmark ───────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold'); doc.setFontSize(26); doc.setTextColor(...SLATE);
  doc.text('Uni', M, y);
  const uniW = doc.getTextWidth('Uni');
  doc.setTextColor(...ORANGE); doc.text('Fit', M + uniW, y);
  line(10);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...MUTED);
  doc.text('Your Personalized Diet Plan — Nutrition Consultation', M, y); line(22);

  // ── Client profile line ────────────────────────────────────────────
  text(`Name: ${profile.full_name || '-'}`, { bold: true });
  const ageSex = [profile.age && `${profile.age} yrs`, profile.gender].filter(Boolean).join(' / ');
  const htWt = [profile.height_cm && `${profile.height_cm} cm`, profile.starting_weight_kg && `${profile.starting_weight_kg} kg`].filter(Boolean).join(' · ');
  text(`Age/Sex: ${ageSex || '-'}   |   Height/Weight: ${htWt || '-'}   |   BMI: ${targets.bmi ?? '-'}`);
  text(`Goal: ${goal}   |   Track: ${isVeg ? 'Vegetarian' : 'Non-Vegetarian'}   |   Activity: ${(profile.activity_level || '-').replace('_', ' ')}`);
  text(`Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, { color: MUTED, size: 9 });

  // ── 1. Cover Summary ───────────────────────────────────────────────
  heading('1. Plan Summary');
  const summary = goal === 'Fat loss'
    ? `This plan runs a moderate calorie deficit while holding protein high (${targets.protein_g} g/day) to protect muscle as you lose fat. The meal structure keeps you full on fibre and lean protein so hunger stays manageable. Followed consistently, expect a steady 0.4–0.6 kg/week drop over 4–6 weeks — visible waist and energy changes without crash dieting.`
    : goal === 'Muscle gain'
      ? `This plan runs a small calorie surplus with elevated protein (${targets.protein_g} g/day) and carbs timed around training to drive lean gains, not fat. Expect gradual strength and size improvement over 4–6 weeks when paired with progressive training and good sleep.`
      : `This plan holds you at maintenance calories with balanced macros (${targets.protein_g} g protein/day) to support energy, recovery and body-composition upkeep. Followed consistently, expect stable weight, steadier energy and better digestion over 4–6 weeks.`;
  text(summary);

  // ── 2. Daily Macro & Micronutrient Targets ────────────────────────
  heading('2. Daily Macro & Micronutrient Targets');
  table(
    [{ header: 'Nutrient', width: 150 }, { header: 'Daily Target', width: 130 }, { header: 'Why it matters', width: CW - 280 }],
    [
      ['Calories', `${targets.total_calories} kcal`, goal === 'Fat loss' ? 'Deficit for fat loss' : goal === 'Muscle gain' ? 'Surplus for lean gain' : 'Maintenance energy'],
      ['Protein', `${targets.protein_g} g`, 'Preserves/builds muscle, keeps you full'],
      ['Carbs', `${targets.carbs_g} g`, 'Training fuel and daily energy'],
      ['Fat', `${targets.fat_g} g`, 'Hormones and vitamin absorption'],
      ['Fibre', `${targets.fiber_min}–${targets.fiber_max} g`, 'Digestion, satiety, blood-sugar control'],
      ['Water', '2.5–3.5 L', 'Metabolism, recovery, appetite control'],
    ],
  );
  line(4);
  subheading('Micronutrients to prioritize');
  bullets([
    isVeg
      ? 'Iron: plant iron absorbs less — pair dal/spinach/jaggery with vitamin-C (lemon, amla, citrus) at the same meal.'
      : 'Iron: keep lean red meat/liver occasional; pair plant sources with vitamin-C for absorption.',
    isVeg
      ? 'Vitamin B12: not reliably in a veg diet — use fortified foods or a B12 supplement (ask your doctor).'
      : 'Vitamin B12: covered by eggs/fish/meat — keep them regular.',
    'Calcium: dairy, ragi, sesame (til), curd — bone health and muscle function.',
    isVeg
      ? 'Omega-3: flaxseed, chia, walnuts daily (1 tbsp) for anti-inflammatory fats.'
      : 'Omega-3: oily fish 2×/week (or flax/walnuts on non-fish days).',
  ]);

  // ── 3. Full Day Meal Plan ──────────────────────────────────────────
  heading('3. Full Day Meal Plan');
  text('Each slot lists rotating options so the week never feels repetitive. Tap any dish name to open its recipe.', { size: 9, color: MUTED });
  line(2);
  day.meals.forEach(m => {
    const slot = SLOT_LABELS[m.slot] ?? m.slot;
    room(24);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...SLATE);
    doc.text(slot.toUpperCase(), M, y); line(14);
    m.options.forEach((o, i) => {
      const prefix = m.options.length > 1 ? `Option ${i + 1}: ` : '';
      const hasRecipe = !!o.recipe_code;
      const label = `${prefix}${o.description}  (${o.calories} kcal, ${o.protein} g protein)${hasRecipe ? '' : '  (recipe coming soon)'}`;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
      doc.setTextColor(...(hasRecipe ? LINK : SLATE));
      const wrapped = doc.splitTextToSize(label, CW - 12);
      room(13 * wrapped.length + 4);
      doc.text(wrapped, M + 12, y);
      if (hasRecipe) doc.link(M + 12, y - 9, CW - 12, 12 * wrapped.length, { url: recipeBase + o.recipe_code });
      line(12.5 * wrapped.length);
      if (o.prep_remarks) text(`Prep: ${o.prep_remarks}`, { size: 8.5, color: MUTED, indent: 12 });
    });
    line(4);
  });
  text(`Estimated day total (Option 1 of each meal): ${day.totalCal} kcal, ${day.totalProtein} g protein.`, { bold: true, size: 9.5 });
  if (day.totalProtein < targets.protein_g) {
    text(`To reach ${targets.protein_g} g protein, add ${isVeg ? '+1 scoop whey or +30 g paneer/tofu' : '+1 egg or +30 g chicken/fish'} to your largest meal.`, { size: 9, color: ORANGE });
  }

  // ── 4. 7-Day Rotation ──────────────────────────────────────────────
  heading('4. 7-Day Rotation');
  text('A no-decision-fatigue schedule — swap freely, just avoid the same main dish two days running.', { size: 9, color: MUTED });
  line(2);
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const pickSlot = keys => day.meals.find(m => keys.includes(m.slot)) ?? null;
  const rotSlots = [
    { label: 'Breakfast', meal: pickSlot(['breakfast']) },
    { label: 'Lunch', meal: pickSlot(['lunch']) },
    { label: 'Snack', meal: pickSlot(['snack2', 'snack1', 'snack3']) },
    { label: 'Dinner', meal: pickSlot(['dinner']) },
  ].filter(s => s.meal);
  const colW = (CW - 44) / rotSlots.length;
  table(
    [{ header: 'Day', width: 44 }, ...rotSlots.map(s => ({ header: s.label, width: colW }))],
    DAYS.map((d, di) => [d, ...rotSlots.map(s => {
      const opts = s.meal.options;
      return opts[di % opts.length]?.description ?? '';
    })]),
  );

  // ── 5. Smart Substitution Guide ────────────────────────────────────
  heading('5. Smart Substitution Guide');
  table(
    [{ header: 'Situation', width: 150 }, { header: 'Swap to (protein-matched)', width: CW - 150 }],
    [
      ['No paneer', isVeg ? 'Tofu 1:1, or soya chunks 30 g dry (~equal protein)' : 'Chicken 60 g or 2 eggs (~equal protein)'],
      ['Eating out', 'Grilled/tandoori + salad + dal; skip fried, creamy gravies, sugary drinks'],
      ['Travel day', 'Roasted chana + banana + curd or a handful of nuts; UHT milk/whey sachet'],
      ['Low-appetite day', 'Milk-banana-peanut-butter smoothie or moong khichdi; small frequent portions'],
      ['No time to cook', 'Curd + fruit + roasted chana, or besan chilla / egg bhurji in 5 min'],
    ],
  );

  // ── 6. Weekly Grocery List ─────────────────────────────────────────
  heading('6. Weekly Grocery List');
  text('Auto-grouped from your plan — buy once, cook all week. Quantities scale to your serving sizes.', { size: 9, color: MUTED });
  line(2);
  const grocery = buildGrocery(day, isVeg);
  Object.entries(grocery).forEach(([cat, items]) => {
    if (!items.length) return;
    subheading(cat);
    text(items.join(', '), { size: 9, indent: 6 });
  });

  // ── 7. Lifestyle & Behavioral Guidelines ──────────────────────────
  heading('7. Lifestyle & Behavioral Guidelines');
  if (rules?.length) rules.forEach((r, i) => text(`${i + 1}. ${r.rule}`, { size: 9.5, indent: 6 }));
  bullets([
    'Finish dinner ~2 hrs before bed — better digestion and deeper sleep, which drive recovery and appetite hormones.',
    'Eat protein at every meal, not all at dinner — steady supply repairs muscle and blunts cravings.',
    'Walk 15 min after your biggest meal — smooths blood-sugar and aids digestion.',
    'Sleep 7–8 hrs — poor sleep raises hunger hormones and stalls fat loss.',
  ], { size: 9.5 });

  // ── 8. Workout Alignment ───────────────────────────────────────────
  heading('8. Workout Alignment');
  if (workout?.length) {
    subheading('Your weekly split');
    workout.forEach(w => text(`• ${w.day_label}: ${w.activity}${w.focus ? ` — ${w.focus}` : ''}`, { size: 9.5, indent: 6 }));
    line(2);
  }
  bullets([
    'Strength days: put your higher-carb meal in the 2 hrs before or after training for energy and recovery.',
    'Add 20–30 g protein within ~1–2 hrs post-workout (shake, curd, eggs, paneer).',
    'Rest days: slightly lighter dinner and carbs — you burn less, so match intake.',
    'Train fasted only for light cardio; strength sessions perform better fed.',
  ], { size: 9.5 });

  // ── 9. Progress Tracking ───────────────────────────────────────────
  heading('9. Progress Tracking');
  subheading('Track weekly (same day, same conditions)');
  bullets([
    'Body weight — once a week, morning, empty stomach (not daily).',
    'Waist circumference — often moves before the scale does.',
    'Energy, sleep and digestion — the real quality-of-life markers.',
    'Progress photos every 2 weeks — front/side, same light.',
  ], { size: 9.5 });
  subheading("Don't over-focus on");
  bullets([
    'Daily weight swings — water, salt and cycle move it 1–2 kg with no fat change.',
    'A single "off" meal — one meal cannot undo a consistent week.',
  ], { size: 9.5 });

  // ── 10. Red Flags / When to Consult ────────────────────────────────
  heading('10. Red Flags — Pause & Consult a Doctor/Dietician');
  bullets([
    'Persistent fatigue, dizziness or fainting.',
    'Rapid unintended weight loss (>1 kg/week sustained).',
    'Ongoing digestive distress — bloating, pain, irregular bowels.',
    'Hair fall, missed periods, or constant cold intolerance.',
    'Any pre-existing condition (diabetes, thyroid, PCOS, kidney, pregnancy) before starting.',
  ], { size: 9.5 });

  // ── 11. Disclaimer ─────────────────────────────────────────────────
  line(6);
  doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(...MUTED);
  const disc = doc.splitTextToSize('Disclaimer: This plan is a general healthy-eating guide, not medical advice. Consult a qualified doctor or dietician before making dietary changes, especially for medical conditions, pregnancy, or allergies. Individual results vary.', CW);
  room(14 * disc.length);
  doc.text(disc, M, y);

  const safeName = (profile.full_name || 'member').replace(/\s+/g, '-');
  const date = new Date().toISOString().slice(0, 10);
  doc.save(`UniFit-Diet-Plan-${safeName}-${date}.pdf`);
}

// Categorize the week's meal items into a shopping list. Keyword-based —
// data has no per-ingredient grams, so we group distinct dishes/foods.
function buildGrocery(day, isVeg) {
  const cats = { Proteins: new Set(), 'Grains & Cereals': new Set(), 'Vegetables & Fruits': new Set(), Dairy: new Set(), 'Pantry & Others': new Set() };
  const KW = {
    Proteins: ['paneer', 'tofu', 'soya', 'chana', 'dal', 'rajma', 'chickpea', 'chole', 'egg', 'chicken', 'fish', 'mutton', 'whey', 'sprout', 'moong', 'lentil'],
    'Grains & Cereals': ['roti', 'rice', 'oats', 'poha', 'upma', 'quinoa', 'bread', 'chilla', 'dosa', 'idli', 'ragi', 'wheat', 'millet', 'paratha'],
    'Vegetables & Fruits': ['sabzi', 'salad', 'vegetable', 'spinach', 'banana', 'apple', 'fruit', 'papaya', 'tomato', 'cucumber', 'bhindi', 'gourd', 'palak'],
    Dairy: ['milk', 'curd', 'yogurt', 'dahi', 'buttermilk', 'chaas', 'cheese'],
  };
  const seen = new Set();
  day.meals.forEach(m => m.options.forEach(o => {
    const name = (o.description || '').trim();
    if (!name || seen.has(name.toLowerCase())) return;
    seen.add(name.toLowerCase());
    const low = name.toLowerCase();
    let placed = false;
    for (const [cat, words] of Object.entries(KW)) {
      if (words.some(w => low.includes(w))) { cats[cat].add(name); placed = true; break; }
    }
    if (!placed) cats['Pantry & Others'].add(name);
  }));
  cats['Pantry & Others'].add('Cooking oil, spices, lemon, jaggery');
  cats.Proteins.add(isVeg ? 'Flaxseed/chia/walnuts (omega-3)' : 'Eggs, oily fish (omega-3)');
  return Object.fromEntries(Object.entries(cats).map(([k, v]) => [k, [...v]]));
}
