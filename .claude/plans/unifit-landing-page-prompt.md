# UniFit — SEO + Conversion Landing Page: Claude Code Build Prompt

Copy everything below the line into Claude Code. This rebuilds the public landing page of the existing UniFit app (React + Vite + Tailwind + Supabase) into a research-backed, SEO-optimized, lead-converting page. Keep the existing app/auth/dashboards untouched; only rebuild the pre-login landing experience and add the lead/feedback backend.

---

Rebuild the UniFit public landing page as a high-converting, SEO-friendly, mobile-first marketing page for a women's online fitness brand (Zumba, Yoga, Meditation, Strength Training, Weight Training; live on Zoom; currently free 21-Day and 30-Day challenges). Stack: React + Vite + Tailwind, data to Supabase. Apply the conversion and SEO principles below precisely.

## CORE CONVERSION PRINCIPLES (build the whole page around these)
- ONE primary goal: get the visitor to start the free challenge / submit an inquiry. Use ONE primary CTA ("Join the Free Challenge") repeated down the page; never introduce competing primary actions.
- Headline = clear outcome + risk removal (e.g. "Transform Your Body in 30 Days — Free. No Gym. No Credit Card.").
- Strongest social proof ABOVE THE FOLD (member count, star rating, a specific result).
- Lead form short: Name + WhatsApp number + Goal (3 fields). More fields = more abandonment.
- Mobile-first; fast; large tap targets; sticky CTA on mobile.
- Specific, local, real-sounding proof (named members, real numbers, Jaipur/India context) — not generic "great app!".
- Use urgency honestly (current challenge "Day 12 — next batch starts Monday").

## PAGE STRUCTURE (in order)

1. STICKY HEADER: UniFit logo; anchor links (Programs, Challenges, Results, FAQ); a "Login" text link; and a primary "Join Free" button. Collapses to a hamburger on mobile. Primary button always visible.

2. HERO (above the fold):
   - Outcome + risk-removal headline; supportive subheadline.
   - Primary CTA button ("Join the Free Challenge") + secondary ghost link ("Watch how it works").
   - Trust badges row: "500+ women trained", "4.9 rating", "Live daily on Zoom", "Certified trainers".
   - An inline 3-field lead form (Name, WhatsApp number, Goal dropdown) OR a prominent button that opens it in a modal/anchor — test both; default to a visible inline form on desktop, button+anchor on mobile.
   - Strong hero image of women in a live online class (use a tasteful placeholder + descriptive alt text).

3. SOCIAL PROOF BAR: logos/ं press or "As seen in" optional; member avatars + "Join 500+ women getting stronger with UniFit"; star rating with review count.

4. PROGRAMS: cards for Zumba, Yoga, Meditation, Strength Training, Weight Training — icon, 1-line benefit, session timing. Each subtly reinforces the single CTA.

5. THE FREE OFFER (lead magnet, hero of the page): a bold section presenting the free 30-Day Challenge + 21-Day Series — what they get (live sessions, recordings, progress tracking, diet plan, community), "100% free right now", urgency ("next batch starts Monday"), and the primary CTA again.

6. HOW IT WORKS: 3 steps — Sign up free -> Join live Zoom sessions -> Track your transformation. Simple icons, minimal text.

7. RESULTS / TRANSFORMATIONS: 3-6 testimonial cards with name, location (Jaipur etc.), specific result ("Lost 4 kg & 3 inches in 30 days"), short quote, optional before/after placeholder. Pull these LIVE from a Supabase `testimonials` table (seed 6). This is the highest-leverage trust section — place a CTA right after it.

8. TRAINERS: 2-3 trainer cards (photo, name, specialty, 1-line bio, certification) to build trust.

9. WHY UNIFIT: benefit grid — live + recorded, personal progress reports (BMI/TDEE), 54-badge gamification, referral rewards, women-only supportive community, India-friendly timings & Hinglish support.

10. INQUIRY / LEAD FORM SECTION (anchor target #join): the 3-field form (Name, WhatsApp number, Goal: Lose weight / Get fit / Build strength / Just exploring) + a consent checkbox for WhatsApp updates. On submit -> insert into Supabase `leads`; show a success state ("You're in! We'll WhatsApp you the joining link.") and fire the WhatsApp deep link as confirmation. Validate phone (Indian format friendly, but accept international).

11. FEEDBACK / REVIEWS: display approved reviews from Supabase `reviews` (rating + name + text), with an aggregate star average. Include a simple "Leave a review" form (name, star rating, text) -> inserts to `reviews` with status 'pending' (admin approves before it shows). This spreads awareness + social proof and feeds the testimonials.

12. FAQ: 6-8 Q&As (Is it really free? Do I need equipment? What are the timings? Do I need to be fit already? How do live sessions work? Can I do it from home? Is it women-only?). Mark up with FAQPage structured data for SEO rich results.

13. FINAL CTA BANNER: big closing headline + primary CTA + reassurance ("Free. Cancel anytime. No card needed.").

14. FOOTER: NAP (business name, Jaipur address/area, phone) for local SEO, quick links, social icons, copyright. Include WhatsApp + Instagram links.

## FLOATING WHATSAPP BUTTON (persistent)
- A fixed floating WhatsApp button, bottom-right on all viewports (bottom-left optional on mobile if it overlaps the sticky CTA — ensure no overlap).
- Green WhatsApp circle, subtle entrance animation + gentle pulse to draw attention; accessible (aria-label "Chat on WhatsApp").
- On click opens `https://wa.me/<BUSINESS_NUMBER>?text=<prefilled>` where prefilled = "Hi UniFit! I'd like to know more about the free fitness challenge." URL-encoded.
- Optional small "Chat with us" tooltip/label that appears after a few seconds, dismissible.
- Make the business number a single config constant.

## SEO REQUIREMENTS (implement fully)
- Semantic HTML5 landmarks: <header><main><section><footer>, one <h1> (the hero headline), logical h2/h3 hierarchy per section.
- <title> and <meta name="description"> optimized for "online Zumba & fitness classes for women in Jaipur / India", plus relevant keywords naturally in copy (online zumba classes, women's fitness, yoga at home, weight loss challenge).
- Open Graph + Twitter Card meta (title, description, image, url) so shares on WhatsApp/Instagram/FB render a rich preview (awareness).
- JSON-LD structured data: Organization + LocalBusiness (HealthClub type, name, area served Jaipur, phone, sameAs socials, aggregateRating from reviews) and FAQPage (from the FAQ section). Inject in <head>.
- Performance: lazy-load below-the-fold images, width/height on images to avoid layout shift, compressed/responsive images, preconnect to Supabase, minimal blocking JS. Target good Core Web Vitals (LCP < 2.5s).
- Accessibility: alt text on all images, sufficient color contrast, focus states, keyboard-navigable form and menu.
- Add a sitemap.xml and robots.txt; set canonical URL.
- Mobile responsive from 360px up; no horizontal scroll; sticky mobile CTA bar with the primary action.

## SUPABASE BACKEND (add to migration.sql)
- `leads`: id, name, whatsapp, goal, consent (bool), source (default 'landing'), created_at. RLS: allow anonymous INSERT only (public form), SELECT restricted to admin.
- `reviews`: id, name, rating (1-5), text, status ('pending'|'approved', default 'pending'), created_at. RLS: anonymous INSERT (pending only), public SELECT only where status='approved', admin can update status.
- `testimonials`: id, name, location, result, quote, photo_url, sort_order, is_active. RLS: public SELECT where is_active, admin write. Seed 6.
- Admin dashboard additions (reuse existing admin area): a "Leads" table (view/export CSV) and a "Reviews" moderation screen (approve/reject) and testimonials management.
- Anonymous inserts use the Supabase anon client; ensure RLS policies make public INSERT safe (no SELECT of others' data).

## DESIGN
- Energetic, premium, women's-fitness aesthetic: one strong accent (vibrant orange or coral) on clean light base, bold condensed headings, rounded cards, generous spacing, real-feeling imagery. Consistent with the app's existing brand.
- Reuse the app's color tokens/components where possible so the landing page and dashboard feel like one product.
- Micro-interactions: subtle fade/slide on scroll, button hover, form success animation, WhatsApp pulse.

## DELIVERABLES
1. The rebuilt landing page (componentized: Header, Hero, SocialProof, Programs, Offer, HowItWorks, Results, Trainers, WhyUs, LeadForm, Reviews, FAQ, FinalCTA, Footer, FloatingWhatsApp).
2. SEO: meta + OG/Twitter + JSON-LD (Organization/LocalBusiness/FAQPage) + sitemap.xml + robots.txt + canonical.
3. migration.sql additions (leads, reviews, testimonials) with RLS + seed.
4. Admin: Leads view + CSV export, Reviews moderation, Testimonials manager.
5. Config constants: WhatsApp business number, social links, business NAP.
6. README notes: where to set the WhatsApp number/socials, and how review moderation works.
Keep the existing dashboards, auth, and routes intact; this task only replaces the public landing route and adds the three tables + admin screens.
