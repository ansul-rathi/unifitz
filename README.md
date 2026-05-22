# Unifitz — Empowered Transformation

Live online fitness platform for Indian women & men. Zumba, Yoga, and Strength Training — from home. Built mobile-first, SEO-optimised, and Supabase-powered.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Forms | React Hook Form v7 + Zod v3 |
| Database / Storage | Supabase (Postgres + Storage) |
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
│   ├── ErrorBoundary.tsx
│   └── landing/
│       ├── NavBar.tsx
│       ├── WorkoutsSection.tsx        # Tabbed Zumba/Yoga/Strength (ARIA + keyboard nav)
│       ├── TransformationsSection.tsx
│       ├── BatchTimingsSection.tsx
│       ├── ProgramsSection.tsx
│       ├── WhyUnifitzSection.tsx
│       ├── CoachesSection.tsx
│       ├── CommunitySection.tsx
│       ├── FAQSection.tsx
│       ├── FinalCTA.tsx
│       ├── Footer.tsx
│       ├── StickyCtaBar.tsx           # Mobile-only sticky CTA
│       ├── WhatsAppButton.tsx
│       └── WhatsAppIcon.tsx
├── constants/
│   └── contact.ts                     # WA_LINK, WA_TRIAL, WA_GENERAL, WA_PROGRAM
├── lib/
│   └── supabase.ts                    # Supabase client
├── pages/
│   ├── Home.tsx                       # Landing page (/)
│   ├── 21-days.tsx                    # 21-Day Challenge (/21-days)
│   ├── StrengthChallenge.tsx          # 30-Day Strength Challenge (/30-days-strength-challenge)
│   ├── StrengthChallengeResults.tsx   # Admin results view (/30-days-strength-challenge/results)
│   └── NotFound.tsx                   # 404 page
├── App.tsx
├── index.tsx
└── index.css
public/
├── index.html                         # Meta tags, OG, JSON-LD schema
├── sitemap.xml
├── robots.txt
└── strenght-30days-challenge/
    └── hero-image.png
```

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy env template and fill in Supabase credentials
cp .env.example .env.local

# Start dev server
pnpm start

# Production build
pnpm build
```

---

## Environment Variables

Create `.env.local` in project root:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

---

## Routes

| Path | Page | Notes |
|---|---|---|
| `/` | Landing page | Public |
| `/21-days` | 21-Day Challenge | Public |
| `/30-days-strength-challenge` | 30-Day Strength Challenge | Public — registration form |
| `/30-days-strength-challenge/results` | Admin results dashboard | `noindex` — internal only |
| `/*` | 404 Not Found | Branded fallback |

---

## Supabase Setup

Run this SQL in your Supabase project:

```sql
create table strength_challenge_registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  full_name text not null,
  whatsapp_number text not null,
  age integer not null,
  city text not null,
  batch_timing text not null,
  primary_goal text not null,
  fitness_experience text not null,
  payment_screenshot_url text,
  status text not null default 'pending',
  notes text
);
```

Create a Storage bucket named `payment-screenshots` with public upload policy.

---

## SEO

- `lang="en-IN"` + geo meta tags + hreflang (en-IN, x-default)
- Full Open Graph + Twitter Card on every page
- JSON-LD structured data: `Organization`, `HealthAndBeautyBusiness`, `FAQPage`, `Course`, `WebPage`, `BreadcrumbList`, `AggregateRating`, `Person`
- `sitemap.xml` + `robots.txt`
- Canonical URLs via `react-helmet-async`
- Hero image `fetchPriority="high"`, all others `loading="lazy"`

---

## WhatsApp Integration

All CTA buttons use constants from `src/constants/contact.ts`. Update `WA_NUMBER` once — propagates everywhere.

---

## Deployment

Configured for Vercel. Push to `main` → auto-deploy. Add env vars in Vercel project settings.

For SPA routing, add `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
