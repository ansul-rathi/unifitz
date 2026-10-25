import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Timer, Users, MessageSquareText, Sparkles, Sun, Moon } from 'lucide-react';
import { T, SLOTS, START_MS } from '../content/twentyMinutes';
import { track, captureUtm } from '../lib/track';
import LeadForm from '../components/LeadForm';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import SiteFooter from '../components/SiteFooter';
import './landing.css';

// Waitlist page for the 20-minute daily series. Mobile first: short pointers,
// then the form. On desktop the form sits in a sticky right column instead.
// Prerendered, so the countdown only appears after mount (no clock in SSR).
const IST = 'Asia/Kolkata';
const DAY_MS = 86_400_000;
const ICON = { timer: Timer, users: Users, message: MessageSquareText, sparkles: Sparkles };

// [h, m] IST → "5:30" (the AM/PM sits on the group label).
const hm = ([h, m]) => `${h % 12 || 12}:${String(m).padStart(2, '0')}`;

export default function TwentyMinutes() {
  const [tz, setTz] = useState(IST);
  const [daysLeft, setDaysLeft] = useState(null);
  const [showBar, setShowBar] = useState(false);
  const heroRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    document.title = T.meta.title;
    captureUtm();
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || IST);
    setDaysLeft(Math.ceil((START_MS - Date.now()) / DAY_MS));
  }, []);

  // Mobile sticky CTA: visible once the hero is gone, hidden while the form is on screen.
  useEffect(() => {
    const seen = { hero: true, form: false };
    const io = new IntersectionObserver(entries => {
      for (const e of entries) seen[e.target === heroRef.current ? 'hero' : 'form'] = e.isIntersecting;
      setShowBar(!seen.hero && !seen.form);
    });
    if (heroRef.current) io.observe(heroRef.current);
    if (formRef.current) io.observe(formRef.current);
    return () => io.disconnect();
  }, []);

  const cta = location => track('cta_click', { location, page: '20min' });

  return (
    <div className="uf min-h-screen">
      <a href="#main" className="uf-skip">Skip to content</a>
      <header className="sticky top-0 z-40 border-b" style={{ background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderColor: 'var(--line)' }}>
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-5 md:px-8 h-14" aria-label="Main">
          <Link to="/" className="uf-serif text-xl font-semibold" style={{ color: 'var(--ink)' }}>Unifitz</Link>
          <a href="#waitlist" onClick={() => cta('nav')} className="text-[0.95rem] font-bold py-3" style={{ color: 'var(--clay)' }}>Join waitlist</a>
        </nav>
      </header>

      <main id="main" tabIndex={-1} className="outline-none">
        <div className="max-w-6xl mx-auto px-5 md:px-8 grid lg:grid-cols-[1fr_400px] gap-x-16">
          <div className="min-w-0">
            {/* ── Hero ── */}
            <section ref={heroRef} className="pt-10 pb-10 md:pt-16">
              <p className="uf-eyebrow">{T.hero.eyebrow}</p>
              <h1 className="mt-3" style={{ fontSize: 'clamp(2.7rem, 2rem + 4vw, 4.6rem)' }}>{T.hero.h1}</h1>
              <p className="mt-4 uf-lead" style={{ maxWidth: '30ch' }}>{T.hero.sub}</p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a href="#waitlist" onClick={() => cta('hero')} className="uf-btn uf-btn--solid lg:!hidden">{T.hero.cta} <ArrowRight className="w-4.5 h-4.5" /></a>
                {daysLeft > 0 && <span className="uf-chip">{daysLeft === 1 ? 'Starts tomorrow' : `${daysLeft} days to go`}</span>}
              </div>
            </section>

            {/* ── How it works ── */}
            <section className="py-8" style={{ borderTop: '1px solid var(--line)' }}>
              <h2 className="uf-h3">{T.how.heading}</h2>
              <ul className="mt-5 flex flex-col gap-5">
                {T.how.points.map(p => {
                  const Icon = ICON[p.icon];
                  return (
                    <li key={p.t} className="flex items-start gap-4">
                      <span className="grid place-items-center w-11 h-11 shrink-0 rounded-full" style={{ background: 'var(--clay-tint)', color: 'var(--clay-deep)' }}><Icon className="w-5 h-5" /></span>
                      <div>
                        <p className="font-bold leading-snug">{p.t}</p>
                        <p className="text-[0.95rem] uf-ink-soft leading-snug">{p.d}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* ── Slots ── */}
            <section className="py-8" style={{ borderTop: '1px solid var(--line)' }}>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="uf-h3">{T.slots.heading}</h2>
                <span className="text-[0.85rem] uf-ink-soft">{T.slots.note}</span>
              </div>
              {[['morning', Sun, 'AM'], ['evening', Moon, 'PM']].map(([key, Icon, ap]) => (
                <div key={key} className="mt-5">
                  <p className="flex items-center gap-2 text-[0.85rem] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--clay)' }}>
                    <Icon className="w-4 h-4" /> {T.slots[key]} · {ap}
                  </p>
                  <ul className="mt-2.5 grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {SLOTS[key].map(s => (
                      <li key={hm(s)} className="rounded-xl py-2.5 text-center font-bold uf-tabular" style={{ background: 'var(--cream-2)', border: '1px solid var(--line)' }}>{hm(s)}</li>
                    ))}
                  </ul>
                </div>
              ))}
              {tz !== IST && (
                <p className="mt-4 text-[0.85rem] uf-ink-soft">
                  5:00 AM IST = {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short', timeZone: tz }).format(START_MS)} your time
                </p>
              )}
            </section>
          </div>

          {/* ── Form: after the pointers on mobile, sticky beside them on desktop ── */}
          <aside id="waitlist" ref={formRef} className="scroll-mt-16 pt-8 pb-10 lg:pt-16 border-t lg:border-t-0" style={{ borderColor: 'var(--line)' }}>
            <div className="lg:sticky lg:top-24">
              <h2 className="uf-h3">{T.form.heading}</h2>
              <p className="mt-1 text-[0.95rem] uf-ink-soft">{T.form.sub}</p>
              <LeadForm idPrefix="tw" source="20min-waitlist" formName="20min_waitlist" goals={T.form.goals} goalLabel={T.form.goalLabel}
                copy={T.form.copy} tz={tz} solid className="mt-4" onSuccess={() => cta('waitlist_submit')} />
            </div>
          </aside>
        </div>

        {/* ── FAQ: four one-liners, no accordion ── */}
        <section style={{ background: 'var(--cream-2)', borderTop: '1px solid var(--line)' }}>
          <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-14">
            <h2 className="uf-h3">{T.faq.heading}</h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {T.faq.items.map(f => (
                <div key={f.q}>
                  <dt className="font-bold">{f.q}</dt>
                  <dd className="text-[0.95rem] uf-ink-soft">{f.a}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 text-[0.8rem] uf-ink-soft">{T.disclaimer}</p>
          </div>
        </section>
      </main>

      <SiteFooter />

      {showBar && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 p-3" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderTop: '1px solid var(--line)' }}>
          <a href="#waitlist" onClick={() => cta('sticky_mobile')} className="uf-btn uf-btn--solid uf-btn--full">{T.hero.cta} <ArrowRight className="w-4.5 h-4.5" /></a>
        </div>
      )}
      <FloatingWhatsApp />
    </div>
  );
}
