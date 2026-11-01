# UniFit — Free Personalized Diet Plan Engine (from dietician Excel): Claude Code Prompt

Copy below the line into Claude Code. This replaces the earlier AI-generated diet approach with a FIXED dietician-designed plan (from the uploaded Excel) whose QUANTITIES scale to each person's BMI/TDEE/goal. Dishes become a seeded recipe library with images; the downloadable PDF links each dish to its recipe. Free for everyone (gated only by a complete profile). Extends the existing UniFit React + Vite + Tailwind + Supabase app.

---

Build a free, personalized Diet Plan feature for UniFit. The meal STRUCTURE and DISHES are fixed (a dietician's 30-day plan, seeded below). The QUANTITIES and MACROS are calculated per person from data already in the app (age, gender, height, weight, activity, goal -> BMI, BMR, TDEE) using plain formulas — NO AI is used anywhere in the diet plan flow. The user only chooses Veg or Non-Veg, then downloads a text PDF. Each dish links to a recipe (with image) in a seeded library (recipe pages have images; the PDF does not). Anyone wanting a custom plan for a specific goal is handed off to WhatsApp. Free for everyone (gated only by a complete profile). Extends the existing UniFit React + Vite + Tailwind + Supabase app.

## 1. MACRO CALCULATION ENGINE (use these EXACT dietician formulas)
Inputs come from the profile (already collected): age, gender, height_cm, weight_kg, activity_level, fitness_goal. Compute:
- BMR (Mifflin-St Jeor): male 10*w+6.25*h-5*age+5 ; female 10*w+6.25*h-5*age-161.
- TDEE = BMR * activity multiplier (sedentary 1.2, light 1.375, moderate 1.55, active 1.725, very active 1.9).
- total_calories (target) by goal: lose weight = TDEE - 500 ; maintain = TDEE ; gain/build muscle = TDEE + 300. Never set below 1200 for women / 1500 for men (safety floor).
- protein_g = 1.2 * weight_kg for maintain; 1.4 * weight_kg for lose weight (preserve muscle in deficit); 1.6 * weight_kg for build muscle. (Base sheet uses 1.2; goal-adjust as stated.)
- fat_g = (0.30 * total_calories) / 9.
- carbs_g = (total_calories - (protein_g*4) - (fat_g*9)) / 4.
- fiber_g = 30-40 (show as range).
Show a "Your Daily Targets" card: total_calories, protein_g, fat_g, carbs_g, fiber range, plus BMI and its category. These mirror the dietician's Macros box.

## 2. PORTION SCALING MODEL (dishes fixed, grams scale)
The seeded plan is calibrated to a base of 1650 kcal (the dietician's reference person: 55 kg female). To personalize:
- scale_factor = total_calories / 1650.
- Multiply each dish's SCALABLE component quantities (protein sources, carb sources, nuts/seeds) and its calories/protein by scale_factor; round to practical units (eggs/chapati/bread -> whole numbers; grams -> nearest 5-10 g; nuts -> nearest 5 g). Keep NON-scalable items fixed (water, lemon, tea/coffee, spices, isabgol).
- After scaling, verify daily protein >= target protein_g; if short, increase the largest protein-source portions (e.g. +1 egg, +20 g paneer/chicken/fish) until met, respecting the "20-25 g protein per main meal" rule.
- Display each meal with its personalized quantities and per-meal calories + protein.

## 3. SEED THE DIET PLAN (two tracks: Non-Veg and Veg). Store in `diet_plan_template`.
Each row: meal_slot, option_no, track, time, description, base_calories, base_protein_g, prep_remarks, recipe_code (FK to recipes). Mark scalable components in the description metadata.

EARLY MORNING (After waking up) — both tracks:
- Warm lemon water + 4 almonds + 2 walnuts | ~80 cal | prep: 300-400 ml water. recipe: lemon-water-nuts

BREAKFAST (Option 1):
- Non-Veg: 3 boiled eggs/omelette + 1 bread/roti + 100 g sweet potato + 1 guava | 425-470 cal / P25-28 | roasted on nonstick pan with little oil. recipe: nv-breakfast-eggs
- Veg: 2 besan chilla or moong dal chilla with 50 g paneer or tofu | 455-525 cal / P20-25. recipe: veg-breakfast-chilla
BREAKFAST (Option 2):
- Non-Veg: 2-3 egg bhurji with veggies + 1 wholemeal bread + 100 g curd | 400-470 cal / P25-28. recipe: nv-breakfast-bhurji
- Veg: 150 g vegetable poha/upma/daliya/oats cooked with 30-40 g sprouts | 365-430 cal / P20-22. recipe: veg-breakfast-poha

SNACK 1 (Anytime):
- Non-Veg: 1 fruit (apple/orange/pear) or roasted chana + green tea | 80-100 cal | 1.5% fat milk after workout. recipe: snack-fruit-greentea
- Veg: 100-150 g grilled sweet potato with salt and lemon | 85-100 cal / P2-3. recipe: veg-snack-sweetpotato
SNACK 2 (Anytime):
- Non-Veg: 20 g almond/roasted seeds/nuts + black coffee or tea | 120 cal / P4 | without sugar. recipe: snack-nuts-coffee
- Veg: tea/coffee with a handful of soaked nuts & seeds | 150-200 cal / P5-7. recipe: veg-snack-nuts-seeds
SNACK 3 (Anytime):
- Non-Veg: Greek yogurt 100 g + berries or 20 g roasted seeds/lotus seeds | 90-120 cal / P9-10. recipe: snack-greek-yogurt
- Veg: roasted nuts/lotus seeds/chana with a little jaggery | 90-120 cal / P9-10. recipe: veg-snack-makhana

LUNCH (Option 1):
- Non-Veg: Grilled chicken breast 80 g + 100 g cooked brown rice + medium veg | 250-350 cal / P25-32. recipe: nv-lunch-chicken-rice
- Veg: 1 medium bowl raw salad + 80-100 g paneer or tofu bhurji + 2 medium chapati (add 100 g curd if needed) | 550-690 cal / P27-33. recipe: veg-lunch-paneer
LUNCH (Option 2):
- Non-Veg: Grilled fish 80 g + sweet potato 100 g + 1 chapati + 50 g veg | 350-400 cal / P25-28. recipe: nv-lunch-fish
- Veg: same as raw salad + chapati but with 50 g soya chunks sabji in tomato gravy | 450-500 cal / P20-22. recipe: veg-lunch-soya

DINNER (Option 1):
- Non-Veg: 1 chapati + seasonal sabji/dal + 2 eggs | 300-350 cal / P20. recipe: nv-dinner-chapati-eggs
- Veg: green moong sprouts with veggies + one bowl dal-rice mix + curd | 330-420 cal / P16-20. recipe: veg-dinner-sprouts-dal
DINNER (Option 2):
- Non-Veg: 1 sprout salad with mixed vegetables + 50-60 g grilled fish | 200-215 cal / P18-20. recipe: nv-dinner-sproutsalad-fish
- Veg: mix veg khichdi / 50 g oats with veggies / 50 g millet khichdi | 300-380 cal / P15-18. recipe: veg-dinner-khichdi

## 4. RULES + WORKOUT PLAN (seed as `diet_rules` and `workout_plan`, show on the plan and in the PDF)
Points to follow (8): 20-25 g protein in every meal; max 20 ml oil/day; 15-20 min walk after dinner; dinner 2 hours before bed; 100 steps after breakfast & lunch; 5-8k steps/day; 10-12 min breathing exercises for digestion; half spoon isabgol/psyllium husk in warm water (as advised).
Weekly Workout (30-Day Challenge): 3 days Strength Training (full/upper/lower split — strength, tone, metabolism); 2 days Yoga (flexibility, mobility, recovery, posture, joints); Daily breathing 10-15 min (pranayama — digestion, lung strength, stress); 1 day Cardio/Activity (swimming/badminton/Zumba OR 10-12k steps OR gardening 1 hr); 1 day Rest/active recovery (8-10k steps).
Include the disclaimer: this plan is a general healthy-eating guide, not medical advice; consult a doctor/dietician for medical conditions, pregnancy, or allergies.

## 5. RECIPES LIBRARY WITH IMAGES (`recipes` table)
For every recipe_code above, seed a recipe: code (unique), title, track (veg/non-veg/both), category (breakfast/lunch/dinner/snack), image_url, ingredients (jsonb), steps (jsonb), base_calories, base_protein_g, tips. 
- Generate a clean food image per dish (use the existing Gemini image function, model gemini-3-pro-image-preview, prompt e.g. "Top-down realistic photo of {dish}, Indian home-style plating, bright natural light, on a simple plate") -> upload to Supabase `recipes` storage bucket (public read) -> store image_url. Provide a one-time seed/admin script to generate all images; allow admin to replace any image.
- Recipe detail page: image, ingredients, steps, macros, "part of your diet plan" tag. All free now (keep is_premium flag for later).

## 6. DIET PLAN UI (client tab) — SIMPLE, NO AI
Top of the tab: a banner heading "Free diet plan for everyone". The free plan is the fixed dietician plan with quantities scaled from the person's profile (sections 1-2). DO NOT use AI anywhere in this flow.
Flow:
- Gate: if profile incomplete, show "Complete your profile to unlock your free diet plan" with a link to the missing fields. Else proceed.
- Ask ONE thing: "Veg or Non-Veg?" (a simple two-option toggle). Save as diet_type on the profile so it's remembered.
- Based on that choice + their profile data, render the personalized plan: "Your Daily Targets" card (section 1), the day's meals in order with personalized quantities and per-meal calories+protein, each dish tappable to open its recipe, then the rules + weekly workout.
- Primary button: "Download my diet chart (PDF)" (section 7) — generates the text PDF for their chosen track.

CUSTOM PLAN -> WHATSAPP (no AI, no in-app generation):
- Below the free plan, a card: "Want a customized diet plan for your specific goal?" with a button "Get my custom plan on WhatsApp".
- The button opens the WhatsApp link (section 7a) with the pre-filled message: "Hi UniFit! I want a customized diet plan for my goal." (URL-encoded).
- Do not build any AI/custom-plan generator in the app; this CTA simply hands off to WhatsApp.

## 7. PERSONALIZED PDF — TEXT ONLY, NO IMAGES, WITH CLICKABLE RECIPE LINKS
- Generate a clean, branded, TEXT-ONLY UniFit PDF of the user's personalized plan. NO images anywhere in the PDF (no photos, no logo image) — use a styled text wordmark "UniFit" for branding instead.
- Header (text): "UniFit" wordmark, user name, date, and their daily targets (calories, protein, fat, carbs, fiber).
- Body: the full day's meals for their chosen track (Veg or Non-Veg) with personalized quantities and per-meal calories+protein, then the rules, then the weekly workout.
- EACH DISH name in the PDF is a clickable hyperlink to its recipe page URL (e.g. https://<app-domain>/recipes/{recipe_code}). Use a PDF lib that supports text link annotations (pdf-lib / jsPDF / react-pdf), generated client-side or via an Edge Function. Links only — do not embed the recipe images.
- Include the disclaimer in the footer. File name: UniFit-Diet-Plan-{name}-{date}.pdf.

## 7a. WHATSAPP REDIRECT (single config, used for all WhatsApp links)
- Define one config constant WHATSAPP_BUSINESS_NUMBER (digits only, country code first, no +). Build every WhatsApp link as:
  `https://api.whatsapp.com/send?phone={WHATSAPP_BUSINESS_NUMBER}&text={URL_ENCODED_MESSAGE}`
- Use this exact format for the custom-diet-plan CTA (section 6) and reuse the same constant anywhere else the app links to WhatsApp.
- Open in a new tab/window.

## 8. SCHEMA / DELIVERABLES
- Tables: diet_plan_template, recipes, diet_rules, workout_plan; add diet_type to profiles if absent; store the user's generated targets on profile or a diet_plans row.
- RLS: templates/recipes/rules/workout readable by all authenticated; admin write.
- Admin: manage recipes (edit text + regenerate/replace image), edit template quantities/macros, edit rules/workout.
- Seed: all dishes (section 3), all rules + workout (section 4), all recipes with generated images (section 5).
- Free for everyone; only gate is a complete profile. Keep the existing app/dashboards intact.
