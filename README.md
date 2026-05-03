# Unifitz — Empowered Transformation

Live online fitness platform for Indian women aged 30–50. Zumba, Yoga, and Strength Training — from home.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Icons | Google Material Symbols |
| Fonts | Lexend + Plus Jakarta Sans |
| SEO | react-helmet-async + JSON-LD |
| Package manager | pnpm |
| Deploy | Vercel |

---

## Project Structure

```
src/
├── components/
│   └── landing/          # All landing page sections
│       ├── NavBar.tsx
│       ├── WorkoutsSection.tsx   # Tabbed Zumba/Yoga/Strength hero
│       ├── TransformationsSection.tsx
│       ├── BatchTimingsSection.tsx
│       ├── ProgramsSection.tsx
│       ├── WhyUnifitzSection.tsx
│       ├── CoachesSection.tsx
│       ├── CommunitySection.tsx
│       ├── FAQSection.tsx
│       ├── FinalCTA.tsx
│       ├── Footer.tsx
│       ├── WhatsAppButton.tsx
│       └── WhatsAppIcon.tsx
├── pages/
│   ├── Home.tsx           # Landing page (/)
│   └── 21-days.tsx        # 21-Day Challenge (/21-days)
├── App.tsx
├── index.tsx
└── index.css
public/
├── index.html             # Meta tags, OG, JSON-LD schema
├── sitemap.xml
└── robots.txt
```

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm start

# Production build
pnpm build
```

---

## Routes

| Path | Page |
|---|---|
| `/` | Landing page |
| `/21-days` | 21-Day Challenge |

---

## SEO

- Full Open Graph + Twitter Card meta tags
- JSON-LD structured data: `Organization`, `HealthAndBeautyBusiness`, `FAQPage`
- `sitemap.xml` + `robots.txt`
- Canonical URLs via `react-helmet-async`
- Hero image `fetchPriority="high"`, all others `loading="lazy"`

---

## WhatsApp Integration

All CTA buttons link to `wa.me/yournumber`. Replace `yournumber` with the actual WhatsApp number across:

- `src/components/landing/NavBar.tsx`
- `src/components/landing/HeroSection.tsx`
- `src/components/landing/WorkoutsSection.tsx`
- `src/components/landing/BatchTimingsSection.tsx`
- `src/components/landing/ProgramsSection.tsx`
- `src/components/landing/WhatsAppButton.tsx`
- `src/components/landing/Footer.tsx`

---

## Deployment

Configured for Vercel via `vercel.json`. Push to `main` → auto-deploy.

For SPA routing on Vercel, `vercel.json` rewrites all routes to `index.html`.
