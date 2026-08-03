# Unifitz Landing — RECON + STRATEGY GATE

> Deliverable for §1 + §2 of the redesign brief. **No code written.** Awaiting approval before build (§8).

---

## §1 — RECON (current live page: `src/pages/Landing.jsx`)

Current page = the US-oriented orange/amber build from earlier this session. Judged against the real buyer: a 38-year-old Indian(-origin) woman who has already quit a gym and a YouTube plan.

| Section | Current job | What it actually communicates | Conversion leak | Verdict |
|---|---|---|---|---|
| Hero | Sell the $19 trial | "Cheerful US workout app, on sale" | Orange gradient text + "Popular/$19 trial" reads discount-app, not a real live studio. No instructor face, no proof it's live. | **Rebuild** |
| Stat band (count-up) | Impress with numbers | "800+/1200+/4.9" animated | Unproven vanity metrics + hype motion; erodes trust with a skeptic. | **Cut / TODO:PROOF** |
| Programs (5 icon cards) | List class types | "We do Zumba/Yoga/…" | Four+ identical icon cards = banlist. Says nothing about who each suits. | **Rebuild (alternating)** |
| Membership grid | List included features | Generic feature list | Feature-dump, no objection answered. | **Fold into Why-live** |
| How it works | Explain onboarding | 4 steps | Fine but generic; not the differentiator. | **Keep, demote** |
| Diet spotlight | Show diet value | US meals (Greek yogurt/salmon) | Wrong food for Indian buyer; not the core sell. | **Reframe (Indian food)** |
| Results (Supabase) | Social proof | Live testimonials IF present | No photo/city/specific-number structure; India seed names on a US page. | **Rebuild w/ structure** |
| Why / Pricing / Join / Reviews / FAQ / Final | Convert | Toggle + 5 scroll cards, lead form | Pricing not market-aware; no goal-tracks; no timetable; no instructors; no market switch; secondary CTA competes. | **Rebuild** |
| — MISSING — | — | — | No **live timetable**, no **instructor faces**, no **goal tracks**, no **problem/objection blocks**, no **market/currency switch**. These are the trust spine. | **Add** |

**Current implied positioning (1 sentence):** "An affordable, cheerful subscription app for women's home workouts."

**Why a 38-yo woman bounces in 5s:** She can't tell it's *live with real instructors* (no faces, no real schedule in her timezone), the orange "$19 / Popular" framing pattern-matches to every app she's already quit, and nothing signals it's for *her* body/age/PCOD — so she concludes "another thing I'll drop in two weeks" and leaves.

---

## §2 — STRATEGY GATE

### 1. Message hierarchy — the ONE claim
> **"A live class where the instructor knows your name — so you actually show up."**

Accountability *is* the product. Every section supports one of: it's **live** (not a library), someone **notices you** (small cohort, named), it's **for your body** (age/PCOD tracks). Price, formats, FAQ all ladder to this.

### 2. Awareness stage → how the hero opens
She is **solution-aware, brand-unaware**: convinced exercise works, burned twice, skeptical *this* is different. So the hero does **not** sell outcomes or hype — it opens on the **mechanism + proof it's real**: accountability claim + a real class-in-progress frame + a micro-proof line, with the **live weekly timetable strip directly beneath** (kills "is it real?" and "my timings?" in one move).

### 3. Three hero directions (strategically distinct)
- **A — Accountability.** H1: *"The class that notices when you're not there."* Sub names home + her timezone + small cohort. CTA **"See this week's classes."** Visual: real Zoom class grid, instructor mid-cue. → attacks objection #1 (I'll quit).
- **B — Timetable-first / proof-of-real.** The hero *is* this week's live schedule auto-set to her timezone; H1: *"Real instructors. Real classes. Live at times that fit your day."* CTA **"See this week's classes."** → attacks #2 + #3 (real business? my timings?). Most trust-forward.
- **C — For-your-body.** H1 names the 38–50 body + PCOD/post-40 directly; visual = instructor portrait + condition tracks. CTA **"Find your track."** → attacks #4 (will it help *my* body?).

**Recommendation:** **A as the spine**, with **B's timetable strip** as the immediate next block, and **C's condition language** living in Goal Tracks. One coherent flow: claim → proof it runs → who it's for.

### 4. Free-trial tension — resolved per market
- **IN → paid from day one.** ₹1,700 is low enough that friction matters less than intent; free-trial traffic here skews tire-kicker + support load. Secondary CTA = **WhatsApp inquiry** (human, low-commitment) for unaware traffic — never a free class that devalues the product. Quarterly pre-selected (~12% off).
- **US → paid primary, ONE free live masterclass seat as secondary.** She's comparing to a $150/mo studio and is culturally skeptical; a *single, seat-limited, real* live class de-risks without the "free-forever non-payer" trap. Primary CTA stays plan-select (**$89 Complete anchor**). Masterclass CTA never sits above the primary above the fold.
- **Net:** paid-first both markets; secondary = WhatsApp (IN) / one masterclass seat (US).

### 5. Art direction — ADOPT warm-editorial
The buyer is 38–50 and her comparison set is a premium studio + failed churny apps. Whitespace + warm serif + cream + hairline borders reads **established, calm, premium** — the opposite of what she quit. The current orange/gradient/count-up treatment codes *discount app + younger*, which actively fights trust here. Ground hue: **deep clay / terracotta** (warm, Indian-resonant; avoids the sage cliché) + **one reserved conversion accent**. No pure black/white, no gradient text, no hype motion.

---

## Open decisions I need before building (§8)

1. **Two markets confirmed?** Brief reintroduces **India (₹, Hinglish)** as a market alongside US/NRI — this reverses the US-only pivot we just shipped. Confirm both + a market/currency switch (default by geo/IP, manual override).
2. **Tooling:** repo is **Vite + JSX — no TypeScript, no react-hook-form, no Zod** (brief assumes all three). Recommend building in **JS to match the repo** (fast, no migration). Adding TS+RHF+Zod is a separate, larger workstream. Pick one.
3. **Hero direction:** confirm **A (accountability) + timetable strip** — or pick B/C.

Approve these three and I build section-by-section per §8.
