# Landing page photos — drop your files here

Put photos in **this folder** (`public/landing/`), then switch them on in
`src/content/landing.js` by setting the matching `img:` field (it's `null`
until then). Vite serves `public/` at the site root, so
`public/landing/hero.jpg` is referenced as `'/landing/hero.jpg'`.

Sections without real content stay hidden on the live site (and show labelled
placeholders in `pnpm dev`), so you can add photos one at a time.

| Filename | Set in `landing.js` | Where it appears | Ideal shape / size |
|---|---|---|---|
| `hero.jpg`      | `hero.img`                  | Hero (replaces the "coming up live" card) | landscape 4:3, ~1200×900 |
| `gallery-1.jpg` … `gallery-6.jpg` | `gallery.photos[0..5].img` | "Real women. Real living rooms." carousel — edit each `cap` to describe that photo; add more entries for more slides | portrait 4:5, ~800×1000 |
| `coach-1.jpg`   | `instructors.items[0].img`  | Instructors — Zumba & cardio | square 1:1, ~600×600 |
| `coach-2.jpg`   | `instructors.items[1].img`  | Instructors — Yoga & mobility | square 1:1, ~600×600 |
| `coach-3.jpg`   | `instructors.items[2].img`  | Instructors — Strength | square 1:1, ~600×600 |
| `coach-4.jpg`   | `instructors.items[3].img`  | Instructors — Meditation | square 1:1, ~600×600 |

Instructor cards also need `name` (and ideally `cred` + `years`) — a card with
no name never renders, and the section + its nav link appear once ≥1 is named.

## Tips
- **Format:** `.webp` (or `.avif`) is ~30–50% smaller than `.jpg`:
  `cwebp -q 80 hero.jpg -o hero.webp`, then use the `.webp` path.
- **Compress** to < 200 KB each (hero < 150 KB — it's the first thing that paints).
- The hero image loads eagerly with high priority; all others lazy-load.
- Use **real women 30–50, mid-class, at home** — not stock athleisure. Get
  written permission from anyone recognisable.
