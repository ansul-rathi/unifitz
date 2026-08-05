# Landing page photos — drop your files here

Put your screenshots / photos in **this folder** (`public/landing/`) using the
exact filenames below. Vite serves `public/` at the site root, so a file at
`public/landing/hero.jpg` is used by the page as `/landing/hero.jpg` — no code
change needed. Any file that's missing simply shows a tasteful placeholder, so
you can add them one at a time.

| Filename | Where it appears | Ideal shape / size |
|---|---|---|
| `hero.jpg`      | Hero (top-right frame)        | landscape 4:3, ~1200×900 |
| `gallery-1.jpg` | "Inside the classes" — 1st    | portrait 4:5, ~800×1000 |
| `gallery-2.jpg` | "Inside the classes" — 2nd    | portrait 4:5, ~800×1000 |
| `gallery-3.jpg` | "Inside the classes" — 3rd    | portrait 4:5, ~800×1000 |
| `coach-1.jpg`   | Instructors — Zumba & cardio  | square 1:1, ~600×600 |
| `coach-2.jpg`   | Instructors — Yoga & mobility | square 1:1, ~600×600 |
| `coach-3.jpg`   | Instructors — Strength        | square 1:1, ~600×600 |
| `coach-4.jpg`   | Instructors — Meditation      | square 1:1, ~600×600 |

## Tips
- **Format:** `.jpg` (or convert to `.webp` for smaller size — if you do, also
  update the filename in `src/content/landing.js`).
- **Compress** before adding (e.g. squoosh.app) — aim < 200 KB each so the page
  stays fast. Images are lazy-loaded automatically.
- **Filenames must match exactly** (lowercase, hyphens). To use different names
  or more photos, edit the `img:` paths in `src/content/landing.js`.
- Use **real women 30–50, mid-class, at home** — not stock athleisure.
