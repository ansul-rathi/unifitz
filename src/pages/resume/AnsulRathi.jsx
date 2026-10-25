import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight, Award, Building2, CalendarDays, Camera, ChevronLeft, ChevronRight,
  Dumbbell, Flag, Gamepad2, Instagram, Languages, Mail, MapPin, MessageCircle, Mic,
  Music, PartyPopper, Phone, Play, Printer, Quote, Sparkles, X, Youtube,
} from 'lucide-react';
import { RESUME as R } from '../../content/resume-ansul-rathi';

// Public profile / resume page — /resume/ansul-rathi.
// All content comes from src/content/resume-ansul-rathi.js; this file is layout only.

// ── Helpers ─────────────────────────────────────────────────────────────────
const PH_RE = /(\[ADD[^\]]*\])/g;
const isAdd = (v) => typeof v === 'string' && v.includes('[ADD');
const isFilled = (v) => typeof v === 'string' && v.trim() !== '' && !isAdd(v);
const digits = (v) => (isFilled(v) ? v.replace(/\D/g, '') : '');
const isUrl = (v) => isFilled(v) && /^https?:\/\//.test(v);
const absUrl = (p) => (/^https?:\/\//.test(p) ? p : `${R.siteUrl.replace(/\/$/, '')}${p}`);
const prettyUrl = (u) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

const C = R.contact;
const LINKS = {
  whatsapp: digits(C.whatsapp).length >= 10
    ? `https://wa.me/${digits(C.whatsapp)}?text=${encodeURIComponent(C.whatsappMessage)}`
    : null,
  call: digits(C.phone).length >= 10 ? `tel:+${digits(C.phone)}` : null,
  email: isFilled(C.email) && C.email.includes('@') ? `mailto:${C.email}` : null,
  instagram: isUrl(C.instagram) ? C.instagram : null,
  youtube: isUrl(C.youtube) ? C.youtube : null,
};

const WRAP = 'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8';
const BTN =
  'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2';
// Dark text on bright fills keeps contrast above WCAG AA.
const VARIANTS = {
  whatsapp: 'bg-[#25D366] text-slate-950 hover:bg-[#3ee27d] shadow-lg shadow-[#25D366]/20',
  primary: 'bg-brand-500 text-slate-950 hover:bg-brand-400 shadow-lg shadow-brand-500/25',
  ghost: 'bg-white/10 text-white border border-white/15 hover:bg-white/20',
};
const CARD =
  'rs-card h-full rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-slate-900/5';
const SERVICE_ICONS = { zumba: Music, corporate: Building2, marathon: Flag, party: PartyPopper, gaming: Gamepad2 };
const NAV = [
  ['About', '#about'], ['Services', '#services'], ['Experience', '#experience'],
  ['Gallery', '#gallery'], ['Contact', '#contact'],
];

const PAGE_CSS = `
.rs-reveal{opacity:0;transform:translateY(18px);transition:opacity .6s cubic-bezier(.16,1,.3,1),transform .6s cubic-bezier(.16,1,.3,1)}
.rs-reveal[data-shown]{opacity:1;transform:none}
.rs-ph{display:inline-block;background:#FEF3C7;color:#78350F;outline:1.5px dashed #D97706;outline-offset:1px;border-radius:6px;padding:0 .4em;font-family:Barlow,system-ui,sans-serif;font-size:.8rem;font-weight:600;line-height:1.5;letter-spacing:0;text-transform:none;vertical-align:middle}
@media print{
  @page{size:A4;margin:12mm}
  html,body{background:#fff!important}
  .rs{font-size:10pt;line-height:1.4;padding-bottom:0!important}
  .rs,.rs *,.rs *::before,.rs *::after{color:#1f2937!important;background:transparent!important;box-shadow:none!important;text-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;border-color:#e5e7eb!important;transition:none!important;animation:none!important}
  .rs-noprint{display:none!important}
  .rs-reveal{opacity:1!important;transform:none!important}
  .rs h1{font-size:22pt!important;color:#111827!important}
  .rs h2{font-size:13pt!important;color:#C2410C!important;border-bottom:1.5px solid #FDBA74!important;padding-bottom:2pt;margin:0!important}
  .rs h3,.rs h4{font-size:11pt!important;color:#111827!important}
  .rs p,.rs li,.rs blockquote{font-size:10pt!important}
  .rs p.rs-stat{font-size:16pt!important;color:#C2410C!important}
  .rs-card{border:1px solid #e5e7eb!important;border-radius:6px!important;padding:6pt 8pt!important;break-inside:avoid;transform:none!important}
  .rs .rs-ph{outline:1px dashed #B45309!important;background:#FEF3C7!important;color:#78350F!important}
}
`;

// ── SEO: title, meta, Open Graph, Twitter, canonical, Person JSON-LD ────────
function useDocumentSeo() {
  useEffect(() => {
    const url = absUrl(R.path);
    const image = absUrl(R.seo.ogImage);
    const restores = [];
    const prevTitle = document.title;
    document.title = R.seo.title;

    const upsert = (selector, create, attr, value) => {
      let el = document.head.querySelector(selector);
      const created = !el;
      if (created) { el = create(); document.head.appendChild(el); }
      const prev = el.getAttribute(attr);
      el.setAttribute(attr, value);
      restores.push(() => (created ? el.remove() : el.setAttribute(attr, prev)));
    };
    const meta = (key, content, attr = 'name') =>
      upsert(`meta[${attr}="${key}"]`, () => {
        const m = document.createElement('meta');
        m.setAttribute(attr, key);
        return m;
      }, 'content', content);

    meta('description', R.seo.description);
    meta('og:type', 'profile', 'property');
    meta('og:url', url, 'property');
    meta('og:title', R.seo.title, 'property');
    meta('og:description', R.seo.description, 'property');
    meta('og:image', image, 'property');
    meta('og:image:alt', `${R.name} — ${R.title}`, 'property');
    meta('twitter:card', 'summary_large_image');
    meta('twitter:title', R.seo.title);
    meta('twitter:description', R.seo.description);
    meta('twitter:image', image);
    upsert('link[rel="canonical"]', () => {
      const l = document.createElement('link');
      l.rel = 'canonical';
      return l;
    }, 'href', url);

    const person = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: R.name,
      jobTitle: R.title,
      description: R.seo.description,
      url,
      image: absUrl(R.photo.src),
      knowsLanguage: R.languages,
      knowsAbout: [...R.services.map((s) => s.title), ...R.skills],
    };
    if (LINKS.email) person.email = C.email;
    if (LINKS.call) person.telephone = `+${digits(C.phone)}`;
    const sameAs = [LINKS.instagram, LINKS.youtube].filter(Boolean);
    if (sameAs.length) person.sameAs = sameAs;
    if (isFilled(C.city)) person.address = { '@type': 'PostalAddress', addressLocality: C.city, addressCountry: 'IN' };
    if (isFilled(C.areas)) person.areaServed = C.areas;
    const creds = R.certifications.filter((c) => isFilled(c.name));
    if (creds.length) {
      person.hasCredential = creds.map((c) => ({
        '@type': 'EducationalOccupationalCredential',
        name: c.name,
        ...(isFilled(c.issuer) && { recognizedBy: { '@type': 'Organization', name: c.issuer } }),
        ...(isFilled(c.year) && { dateCreated: c.year }),
      }));
    }
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify(person);
    document.head.appendChild(ld);
    restores.push(() => ld.remove());

    return () => {
      document.title = prevTitle;
      restores.reverse().forEach((fn) => fn());
    };
  }, []);
}

// ── Small building blocks ───────────────────────────────────────────────────

// Renders text; any "[ADD: …]" part gets a visible dashed placeholder style.
function T({ v }) {
  if (!isAdd(v)) return v ?? null;
  return v.split(PH_RE).map((part, i) => (isAdd(part) ? <mark key={i} className="rs-ph">{part}</mark> : part));
}

// Scroll-triggered fade-up, once. Content is visible without JS/observer support.
function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(() => typeof IntersectionObserver === 'undefined');
  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setShown(true); io.disconnect(); }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);
  return (
    <Tag
      ref={ref}
      className={`rs-reveal ${className}`}
      data-shown={shown || undefined}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Image that falls back to a neat "photo coming soon" tile if the file is missing.
function SmartImg({ src, alt, className = '', fallbackClassName, label = 'Photo coming soon', ...rest }) {
  const [failedSrc, setFailedSrc] = useState(null);
  if (!src || failedSrc === src) {
    return (
      <div role="img" aria-label={alt} className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-800 to-slate-900 text-slate-300 ${fallbackClassName ?? className}`}>
        <Camera className="h-6 w-6" aria-hidden="true" />
        <span className="px-2 text-center text-xs font-semibold">{label}</span>
      </div>
    );
  }
  return <img src={src} alt={alt} onError={() => setFailedSrc(src)} className={className} {...rest} />;
}

// Button-styled link; renders a disabled look until its data is filled in.
function ActionLink({ href, icon: Icon, children, label, variant = 'primary', external = false, className = '' }) {
  const cls = `${BTN} ${VARIANTS[variant]} ${className}`;
  const content = (
    <>
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      {children}
    </>
  );
  if (!href) {
    return (
      <span aria-disabled="true" aria-label={label} title="Add this in src/content/resume-ansul-rathi.js" className={`${cls} cursor-not-allowed opacity-50`}>
        {content}
      </span>
    );
  }
  return (
    <a href={href} aria-label={label} className={cls} {...(external && { target: '_blank', rel: 'noopener noreferrer' })}>
      {content}
    </a>
  );
}

function Section({ id, eyebrow, title, tone = 'light', noPrint = false, children }) {
  const dark = tone === 'dark';
  const bg = { light: 'bg-white', soft: 'bg-slate-50', dark: 'bg-slate-950 text-slate-300' }[tone];
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`scroll-mt-14 py-14 sm:py-20 print:py-2 ${bg} ${noPrint ? 'print:hidden' : ''}`}>
      <div className={WRAP}>
        <Reveal className="mb-8 sm:mb-10 print:mb-2">
          <p className={`text-xs font-bold uppercase tracking-[0.2em] sm:text-sm print:hidden ${dark ? 'text-brand-400' : 'text-brand-700'}`}>{eyebrow}</p>
          <h2 id={`${id}-title`} className={`mt-2 font-display text-3xl font-extrabold uppercase leading-none sm:text-4xl lg:text-5xl ${dark ? 'text-white' : 'text-slate-900'}`}>
            {title}
          </h2>
          <span aria-hidden="true" className="mt-4 block h-1 w-14 rounded-full bg-gradient-to-r from-brand-500 to-amber-400 print:hidden" />
        </Reveal>
        {children}
      </div>
    </section>
  );
}

// ── Sections ────────────────────────────────────────────────────────────────

function TopBar() {
  const initials = R.name.split(' ').map((w) => w[0]).join('').slice(0, 2);
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 backdrop-blur-md print:hidden">
      <div className={`${WRAP} flex h-14 items-center justify-between gap-3`}>
        <a href="#top" className="flex min-w-0 items-center gap-2.5 rounded-lg">
          <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-amber-400 font-display text-sm font-extrabold text-slate-950">
            {initials}
          </span>
          <span className="truncate font-display text-lg font-bold uppercase tracking-wide text-white">{R.name}</span>
        </a>
        <nav aria-label="Page sections" className="hidden items-center gap-1 lg:flex">
          {NAV.map(([label, href]) => (
            <a key={href} href={href} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 transition-colors hover:text-white">
              {label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={() => window.print()} className={`${BTN} ${VARIANTS.ghost} px-3 py-2 text-sm focus-visible:ring-offset-slate-950`}>
            <Printer className="h-4 w-4" aria-hidden="true" />
            Save as PDF
          </button>
          <ActionLink href={LINKS.whatsapp} icon={MessageCircle} variant="whatsapp" external className="hidden px-4 py-2 text-sm focus-visible:ring-offset-slate-950 md:inline-flex">
            WhatsApp
          </ActionLink>
        </div>
      </div>
    </header>
  );
}

function Hero({ ctaRef }) {
  const [role, event] = R.title.split('|').map((s) => s.trim());
  const heroBtn = 'flex-col px-2 py-3 text-sm focus-visible:ring-offset-slate-950 sm:flex-row sm:px-6 sm:py-3.5 sm:text-base';
  const printContact = [C.phoneDisplay, C.email, C.city, C.areas, LINKS.instagram && prettyUrl(C.instagram)].filter(Boolean);

  return (
    <section id="top" className="relative overflow-hidden bg-slate-950 text-slate-300">
      <div aria-hidden="true" className="rs-noprint pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-brand-500/25 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
        <div className="absolute -bottom-40 -left-24 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className={`${WRAP} relative grid items-center gap-8 pb-10 pt-10 sm:pt-14 md:grid-cols-[1.15fr_0.85fr] md:gap-12 md:pb-14 md:pt-20 print:flex print:gap-5 print:py-0`}>
        <div className="animate-fade-up md:order-2 print:order-first">
          <div className="relative mx-auto w-40 sm:w-52 md:w-full md:max-w-sm print:mx-0 print:w-24">
            <div aria-hidden="true" className="rs-noprint absolute -inset-1.5 rotate-3 rounded-[1.9rem] bg-gradient-to-br from-brand-500 to-amber-400 opacity-90" />
            <SmartImg
              src={R.photo.src}
              alt={R.photo.alt}
              width="900"
              height="1125"
              fetchpriority="high"
              label="Add profile.jpg"
              className="relative aspect-[4/5] w-full rounded-3xl object-cover"
            />
          </div>
        </div>

        <div className="animate-fade-up text-center [animation-delay:80ms] md:text-left print:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-300 print:hidden">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            Fitness · Dance · Events
          </p>
          <h1 className="mt-4 font-display text-5xl font-extrabold uppercase leading-[0.92] text-white sm:text-6xl lg:text-7xl">
            {R.name}
          </h1>
          <p className="mt-3 font-display text-xl font-bold uppercase tracking-wide text-brand-400 sm:text-2xl">
            <span className="block sm:inline">{role}</span>
            {event && (
              <>
                <span aria-hidden="true" className="mx-2 hidden text-white/40 sm:inline">|</span>
                <span className="block sm:inline">{event}</span>
              </>
            )}
          </p>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-300 sm:text-lg md:mx-0">
            <T v={R.tagline} />
          </p>

          <div ref={ctaRef} className="mt-7 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-3 md:justify-start print:hidden">
            <ActionLink href={LINKS.whatsapp} icon={MessageCircle} variant="whatsapp" external className={heroBtn}>WhatsApp</ActionLink>
            <ActionLink href={LINKS.call} icon={Phone} variant="primary" className={heroBtn}>Call</ActionLink>
            <ActionLink href={LINKS.email} icon={Mail} variant="ghost" className={heroBtn}>Email</ActionLink>
          </div>

          <p className="mt-2 hidden print:block">
            {printContact.map((item, i) => (
              <span key={i}>{i > 0 && ' · '}<T v={item} /></span>
            ))}
          </p>
        </div>
      </div>

      <div className={`${WRAP} relative pb-12 sm:pb-16 print:pb-2`}>
        <ul aria-label="Quick stats" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 print:grid-cols-4 print:gap-2">
          {R.stats.map((s, i) => (
            <Reveal as="li" key={s.label} delay={i * 70} className="rs-card rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center sm:p-6 md:text-left">
              <p className="rs-stat font-display text-4xl font-extrabold leading-none text-brand-400 sm:text-5xl">
                <T v={s.value} />
              </p>
              <p className="mt-2 text-sm font-medium text-slate-300 sm:text-base">{s.label}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function About() {
  const facts = [
    { icon: MapPin, label: 'Based in', value: C.city },
    { icon: Languages, label: 'Languages', value: R.languages.join(' & ') },
    { icon: Flag, label: 'Available in', value: C.areas },
  ];
  return (
    <Section id="about" eyebrow="Who I am" title="About me">
      <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:gap-12 print:block">
        <Reveal>
          <p className="text-lg leading-relaxed text-slate-700 sm:text-xl">
            {R.about.map((line, i) => (
              <span key={i}>{i > 0 && ' '}<T v={line} /></span>
            ))}
          </p>
        </Reveal>
        <Reveal delay={100} className="print:hidden">
          <ul className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
            {facts.map(({ icon: Icon, label, value }) => (
              <li key={label} className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-600">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
                  <span className="block font-semibold text-slate-900"><T v={value} /></span>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}

function Services() {
  return (
    <Section id="services" eyebrow="What I do" title="Services" tone="soft">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-2 print:gap-2">
        {R.services.map((s, i) => {
          const Icon = SERVICE_ICONS[s.icon] ?? Sparkles;
          return (
            <Reveal as="li" key={s.title} delay={i * 60}>
              <div className={`${CARD} group`}>
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-amber-400 text-slate-950 transition-transform duration-300 group-hover:scale-110 print:hidden">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-xl font-bold uppercase leading-tight text-slate-900 print:mt-0">{s.title}</h3>
                <p className="mt-1.5 text-slate-600"><T v={s.text} /></p>
              </div>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}

function getEmbed({ platform, url }) {
  if (!isFilled(url)) return null;
  if (platform === 'instagram' || url.includes('instagram.com')) {
    const m = url.match(/instagram\.com\/(?:[\w.]+\/)?(?:p|reels?|tv)\/([\w-]+)/);
    return m ? { src: `https://www.instagram.com/p/${m[1]}/embed/`, thumb: '', vertical: true } : null;
  }
  const m = url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
  return m
    ? { src: `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0&playsinline=1`, thumb: `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg`, vertical: url.includes('/shorts/') }
    : null;
}

function Showreel() {
  const [playing, setPlaying] = useState(false);
  const embed = getEmbed(R.showreel);
  const thumb = R.showreel.thumbnail || embed?.thumb;
  const frame = `relative mx-auto overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-brand-500/10 ${
    embed?.vertical ? 'aspect-[9/16] max-w-sm' : 'aspect-video max-w-4xl'
  }`;

  return (
    <Section id="showreel" eyebrow="See the energy" title="Showreel" tone="dark" noPrint>
      <Reveal className={frame}>
        {!embed ? (
          <div className="grid h-full place-items-center p-6 text-center">
            <div>
              <Play className="mx-auto h-10 w-10 text-brand-400" aria-hidden="true" />
              <p className="mt-3"><T v={R.showreel.url} /></p>
            </div>
          </div>
        ) : playing ? (
          <iframe
            src={embed.src}
            title={R.showreel.title}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} aria-label={`Play video: ${R.showreel.title}`} className="group absolute inset-0 h-full w-full">
            {thumb ? (
              <img src={thumb} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <span className="block h-full w-full bg-gradient-to-br from-brand-600/40 via-slate-900 to-slate-950" />
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
            <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand-500 text-slate-950 shadow-xl transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20">
              <Play className="ml-1 h-7 w-7 fill-current sm:h-8 sm:w-8" aria-hidden="true" />
            </span>
          </button>
        )}
      </Reveal>
    </Section>
  );
}

function Certifications() {
  return (
    <Section id="certifications" eyebrow="Qualified & licensed" title="Certifications">
      <ul className="grid gap-4 sm:grid-cols-2 print:gap-2">
        {R.certifications.map((c, i) => (
          <Reveal as="li" key={i} delay={i * 60}>
            <div className={`${CARD} flex items-start gap-4`}>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-600 print:hidden">
                <Award className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-xl font-bold uppercase leading-tight text-slate-900"><T v={c.name} /></h3>
                <p className="mt-1 text-slate-600"><T v={c.issuer} /></p>
                <p className="mt-2 inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700"><T v={c.year} /></p>
              </div>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

function Experience() {
  return (
    <Section id="experience" eyebrow="Where I’ve worked" title="Experience" tone="soft">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-8 print:gap-3">
        {R.experience.map((g) => {
          const GroupIcon = g.group.toLowerCase().includes('event') ? Mic : Dumbbell;
          return (
            <div key={g.group}>
              <Reveal>
                <h3 className="flex items-center gap-3 font-display text-2xl font-bold uppercase text-slate-900">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-brand-400 print:hidden">
                    <GroupIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  {g.group}
                </h3>
              </Reveal>
              <ul className="mt-5 space-y-4 print:mt-2 print:space-y-2">
                {g.items.map((e, i) => (
                  <Reveal as="li" key={i} delay={i * 60}>
                    <article className={CARD}>
                      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                        <div className="min-w-0">
                          <h4 className="font-display text-xl font-bold uppercase leading-tight text-slate-900"><T v={e.place} /></h4>
                          <p className="mt-0.5 font-semibold text-brand-700"><T v={e.role} /></p>
                        </div>
                        <p className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                          <T v={e.duration} />
                        </p>
                      </div>
                      <ul className="mt-3 space-y-1.5">
                        {e.highlights.map((h, j) => (
                          <li key={j} className="flex gap-2.5 text-slate-700">
                            <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                            <span><T v={h} /></span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  </Reveal>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function Clients() {
  return (
    <Section id="clients" eyebrow="Trusted by" title="Clients & events">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 print:flex print:flex-wrap print:gap-2">
        {R.clients.map((c, i) => (
          <Reveal as="li" key={i} delay={i * 50}>
            <div className="rs-card grid h-full min-h-20 place-items-center rounded-2xl border border-slate-200 bg-white p-4 text-center transition-colors duration-300 hover:border-brand-300">
              {isFilled(c.logo) ? (
                <img src={c.logo} alt={isFilled(c.name) ? c.name : 'Client logo'} loading="lazy" decoding="async" className="max-h-10 w-auto object-contain" />
              ) : (
                <span className="font-display text-lg font-bold uppercase leading-tight text-slate-800"><T v={c.name} /></span>
              )}
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

function Lightbox({ items, index, onClose, onNav }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const touchX = useRef(null);
  const item = items[index];

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onNav(1);
      else if (e.key === 'ArrowLeft') onNav(-1);
      else if (e.key === 'Tab') {
        // Keep keyboard focus inside the dialog.
        const f = dialogRef.current?.querySelectorAll('button');
        if (!f?.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onNav]);

  const navBtn = 'absolute top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400';

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${items.length}`}
      className="fixed inset-0 z-[60] flex animate-in fade-in items-center justify-center bg-slate-950/95 p-4 duration-200 print:hidden"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) onNav(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
        <X className="h-6 w-6" aria-hidden="true" />
      </button>
      {items.length > 1 && (
        <>
          <button type="button" onClick={() => onNav(-1)} aria-label="Previous photo" className={`${navBtn} left-2 sm:left-4`}>
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => onNav(1)} aria-label="Next photo" className={`${navBtn} right-2 sm:right-4`}>
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
        </>
      )}
      <figure className="flex max-h-full w-full max-w-5xl flex-col items-center">
        <SmartImg
          key={item.full}
          src={item.full}
          alt={item.altText}
          decoding="async"
          label="Add the full-size photo"
          className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain"
          fallbackClassName="aspect-[4/3] w-full max-w-lg rounded-xl"
        />
        <figcaption className="mt-3 text-sm font-semibold text-slate-300">
          {index + 1} / {items.length}
        </figcaption>
      </figure>
    </div>
  );
}

function Gallery() {
  const [index, setIndex] = useState(-1);
  const lastTrigger = useRef(null);
  const items = R.gallery.map((g, i) => ({ ...g, altText: isFilled(g.alt) ? g.alt : `${R.name} — photo ${i + 1}` }));
  const count = items.length;

  const close = useCallback(() => {
    setIndex(-1);
    lastTrigger.current?.focus();
  }, []);
  const nav = useCallback((d) => setIndex((i) => (i + d + count) % count), [count]);

  return (
    <Section id="gallery" eyebrow="In action" title="Gallery" tone="soft" noPrint>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {items.map((g, i) => (
          <Reveal as="li" key={g.thumb} delay={(i % 3) * 60}>
            <button
              type="button"
              onClick={(e) => { lastTrigger.current = e.currentTarget; setIndex(i); }}
              aria-label={`View larger: ${g.altText}`}
              className="group relative block aspect-square w-full overflow-hidden rounded-2xl bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <SmartImg
                src={g.thumb}
                alt={g.altText}
                loading="lazy"
                decoding="async"
                width="600"
                height="600"
                label={`Add gallery photo ${i + 1}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span aria-hidden="true" className="absolute inset-0 bg-slate-950/0 transition-colors duration-300 group-hover:bg-slate-950/20" />
            </button>
          </Reveal>
        ))}
      </ul>
      {index >= 0 && <Lightbox items={items} index={index} onClose={close} onNav={nav} />}
    </Section>
  );
}

function Testimonials() {
  return (
    <Section id="testimonials" eyebrow="Kind words" title="Testimonials">
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-2 print:gap-2">
        {R.testimonials.map((t, i) => (
          <Reveal as="li" key={i} delay={i * 70}>
            <figure className={`${CARD} flex flex-col`}>
              <Quote className="h-8 w-8 text-brand-500 print:hidden" aria-hidden="true" />
              <blockquote className="mt-3 text-lg leading-relaxed text-slate-800">
                {isFilled(t.quote) ? `“${t.quote}”` : <T v={t.quote} />}
              </blockquote>
              <figcaption className="mt-auto border-t border-slate-100 pt-4 print:pt-1">
                <span className="block pt-1 font-bold text-slate-900"><T v={t.name} /></span>
                <span className="block text-sm text-slate-600"><T v={t.company} /></span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

function Skills() {
  const chip = 'inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-800 transition-colors duration-200 hover:border-brand-300 print:px-2 print:py-0.5';
  return (
    <Section id="skills" eyebrow="What I bring" title="Skills & languages" tone="soft">
      <div className="grid gap-8 md:grid-cols-[2fr_1fr] print:gap-2">
        <Reveal>
          <h3 className="font-display text-xl font-bold uppercase text-slate-900">Skills</h3>
          <ul className="mt-4 flex flex-wrap gap-2 print:mt-1">
            {R.skills.map((s) => (
              <li key={s} className={chip}>
                <Sparkles className="h-4 w-4 text-brand-600 print:hidden" aria-hidden="true" />
                {s}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={100}>
          <h3 className="font-display text-xl font-bold uppercase text-slate-900">Languages</h3>
          <ul className="mt-4 flex flex-wrap gap-2 print:mt-1">
            {R.languages.map((l) => (
              <li key={l} className={chip}>
                <Languages className="h-4 w-4 text-brand-600 print:hidden" aria-hidden="true" />
                {l}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}

function ContactRow({ icon: Icon, label, value, href, external }) {
  const inner = (
    <>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-400">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
        <span className="block break-words font-semibold text-white"><T v={value} /></span>
      </span>
      {href && <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-slate-500 transition-colors group-hover:text-brand-400" aria-hidden="true" />}
    </>
  );
  const cls = 'group flex h-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4';
  if (!href) return <div className={cls}>{inner}</div>;
  return (
    <a
      href={href}
      className={`${cls} transition-colors duration-200 hover:border-brand-500/50 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400`}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {inner}
    </a>
  );
}

function Contact() {
  const rows = [
    { icon: MessageCircle, label: 'WhatsApp', value: LINKS.whatsapp ? 'Chat on WhatsApp' : C.whatsapp, href: LINKS.whatsapp, external: true },
    { icon: Phone, label: 'Phone', value: C.phoneDisplay, href: LINKS.call },
    { icon: Mail, label: 'Email', value: C.email, href: LINKS.email },
    { icon: Instagram, label: 'Instagram', value: LINKS.instagram ? prettyUrl(C.instagram) : C.instagram, href: LINKS.instagram, external: true },
    { icon: Youtube, label: 'YouTube', value: LINKS.youtube ? prettyUrl(C.youtube) : C.youtube, href: LINKS.youtube, external: true },
    { icon: MapPin, label: 'City', value: C.city },
  ];
  return (
    <Section id="contact" eyebrow="Let’s work together" title="Contact" tone="dark" noPrint>
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <Reveal>
          <p className="text-lg leading-relaxed text-slate-300 sm:text-xl">
            Planning a class, corporate session or event? Send a message with your date, venue and group size.
          </p>
          <p className="mt-4 flex items-start gap-2 text-slate-300">
            <Flag className="mt-1 h-4 w-4 shrink-0 text-brand-400" aria-hidden="true" />
            <span><span className="font-semibold text-white">Available in:</span> <T v={C.areas} /></span>
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <ActionLink href={LINKS.whatsapp} icon={MessageCircle} variant="whatsapp" external className="px-6 py-3.5 text-base focus-visible:ring-offset-slate-950">
              WhatsApp me
            </ActionLink>
            <ActionLink href={LINKS.call} icon={Phone} variant="primary" className="px-6 py-3.5 text-base focus-visible:ring-offset-slate-950">
              Call now
            </ActionLink>
          </div>
        </Reveal>
        <ul className="grid gap-3 sm:grid-cols-2">
          {rows.map((r, i) => (
            <Reveal as="li" key={r.label} delay={i * 50}>
              <ContactRow {...r} />
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function StickyContactBar({ show }) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/90 px-4 pt-3 backdrop-blur-md transition-all duration-300 md:hidden print:hidden ${
        show ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-full opacity-0'
      }`}
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex gap-2">
        <ActionLink href={LINKS.whatsapp} icon={MessageCircle} variant="whatsapp" external className="flex-1 py-3 text-base focus-visible:ring-offset-slate-950">
          WhatsApp
        </ActionLink>
        <ActionLink href={LINKS.call} icon={Phone} variant="primary" label="Call Ansul" className="w-14 py-3 focus-visible:ring-offset-slate-950" />
        <ActionLink href={LINKS.email} icon={Mail} variant="ghost" label="Email Ansul" className="w-14 py-3 focus-visible:ring-offset-slate-950" />
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function AnsulRathi() {
  useDocumentSeo();
  const ctaRef = useRef(null);
  const [showSticky, setShowSticky] = useState(false);

  // Show the mobile contact bar once the hero buttons scroll out of view.
  useEffect(() => {
    const el = ctaRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([entry]) => {
      setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="rs min-h-screen bg-white font-sans text-slate-800 pb-24 md:pb-0">
      <style>{PAGE_CSS}</style>
      <a href="#main" className="sr-only z-50 rounded-lg bg-brand-500 px-4 py-2 font-bold text-slate-950 focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Skip to content
      </a>
      <TopBar />
      <main id="main">
        <Hero ctaRef={ctaRef} />
        <About />
        <Services />
        <Showreel />
        <Certifications />
        <Experience />
        <Clients />
        <Gallery />
        <Testimonials />
        <Skills />
        <Contact />
      </main>
      <footer className="border-t border-white/10 bg-slate-950 py-8 text-sm text-slate-400 print:hidden">
        <div className={`${WRAP} flex flex-col items-center justify-between gap-3 sm:flex-row`}>
          <p>© {new Date().getFullYear()} {R.name}</p>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg px-2 py-1 font-semibold text-slate-300 transition-colors hover:text-white">
            <Printer className="h-4 w-4" aria-hidden="true" />
            Save as PDF
          </button>
        </div>
      </footer>
      <StickyContactBar show={showSticky} />
    </div>
  );
}
