-- Add images to the seeded recipes. Safe to re-run. Uses keyword-based
-- placeholder photos (loremflickr, CC) — swap for your own hosted images anytime.
update public.recipes set image_url = 'https://loremflickr.com/800/450/' || x.kw || '?lock=' || x.lk
from (values
  ('Masala Oats',            'oats,breakfast', 11),
  ('Paneer Bhurji',          'paneer,indianfood', 12),
  ('Moong Dal Chilla',       'indianpancake,food', 13),
  ('Grilled Chicken Salad',  'chicken,salad', 14),
  ('Sprouts Chaat',          'sprouts,salad', 15),
  ('Vegetable Daliya',       'porridge,vegetables', 16),
  ('Banana Peanut Smoothie', 'smoothie,banana', 17),
  ('Egg White Omelette',     'omelette,eggs', 18),
  ('Roasted Makhana',        'snack,seeds', 19),
  ('Greek Yogurt Bowl',      'yogurt,berries', 20),
  ('Quinoa Veg Pulao',       'quinoa,rice', 21),
  ('Tofu Stir Fry',          'tofu,stirfry', 22)
) as x(title, kw, lk)
where public.recipes.title = x.title;
