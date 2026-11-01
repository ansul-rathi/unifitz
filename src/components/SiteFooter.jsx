import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Mail } from 'lucide-react';
import { BUSINESS, waLink } from '../config';
import { L } from '../content/landing';
import { track } from '../lib/track';
import WhatsAppIcon from './WhatsAppIcon';
import '../pages/landing.css';

// Marketing footer — shared by the landing page and the legal pages so the
// brand frame (and the legal links) is identical everywhere. Render inside `.uf`.
// Mobile: brand, then two labelled columns (Explore / Contact), then legal.
// Desktop (md+): brand left, links + icon buttons right.
const SOCIAL_ICON = { instagram: [Instagram, 'Instagram'], facebook: [Facebook, 'Facebook'], youtube: [Youtube, 'YouTube'] };
const SOCIALS = Object.entries(BUSINESS.socials).filter(([, href]) => href);
// Icon + label row on mobile, round icon button on desktop.
const CONTACT = 'flex items-center gap-3 py-1.5 hover:text-white transition-colors md:grid md:place-items-center md:w-11 md:h-11 md:p-0 md:rounded-full md:bg-white/[0.07]';
const ICON_WRAP = 'grid place-items-center w-9 h-9 shrink-0 rounded-full bg-white/[0.07] md:contents';
const HEAD = 'md:hidden text-[0.72rem] font-bold uppercase tracking-[0.14em] mb-2';

export default function SiteFooter({ clearStickyBar = false }) {
  const contacts = [
    { href: waLink(), label: 'WhatsApp', aria: 'Chat with Unifitz on WhatsApp', Icon: WhatsAppIcon, ext: true, onClick: () => track('whatsapp_click', { location: 'footer' }) },
    { href: `mailto:${BUSINESS.email}`, label: 'Email us', aria: `Email ${BUSINESS.email}`, Icon: Mail, onClick: () => track('contact_email_click', { location: 'footer' }) },
    ...SOCIALS.map(([key, href]) => { const [Icon, label] = SOCIAL_ICON[key]; return { href, label, aria: `Unifitz on ${label}`, Icon, ext: true }; }),
  ];

  return (
    <footer style={{ background: '#1E1710', color: '#CDBFAD' }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 pt-10 pb-8 md:py-12 grid grid-cols-2 gap-x-6 gap-y-8 md:flex md:items-center md:justify-between">
        <div className="col-span-2 max-w-sm">
          <p className="uf-serif text-2xl" style={{ color: '#FBF6EE' }}>Unifitz</p>
          <p className="mt-2 text-[0.9rem] md:text-[0.95rem]" style={{ lineHeight: 1.6 }}>{L.footer.tagline}</p>
        </div>

        <div className="contents md:flex md:flex-col md:items-end md:gap-4">
          <nav aria-label="Footer">
            <p className={HEAD} style={{ color: '#8E816E' }}>Explore</p>
            <ul className="flex flex-col md:flex-row md:flex-wrap md:gap-x-6 md:gap-y-1 text-[0.95rem]">
              {L.nav.links.map(l => <li key={l.href}><a href={`/${l.href}`} className="block py-1.5 md:py-2 hover:text-white">{l.label}</a></li>)}
              <li><Link to="/auth" className="block py-1.5 md:py-2 hover:text-white">Login</Link></li>
            </ul>
          </nav>

          <div>
            <p className={HEAD} style={{ color: '#8E816E' }}>Contact</p>
            <ul className="flex flex-col md:flex-row md:gap-2 text-[0.95rem]">
              {contacts.map(({ href, label, aria, Icon, ext, onClick }) => (
                <li key={label}>
                  <a href={href} aria-label={aria} onClick={onClick} className={CONTACT} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                    <span className={ICON_WRAP}><Icon className="w-[18px] h-[18px] md:w-5 md:h-5" /></span>
                    <span className="md:hidden">{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* clearStickyBar: page has a fixed mobile CTA bar — keep the last lines out from under it. */}
      <div className={clearStickyBar ? 'pb-24 lg:pb-0' : undefined} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8 pt-5 pb-3 md:py-5 text-[0.8rem] flex flex-col-reverse md:flex-row md:justify-between gap-3" style={{ color: '#A89A85' }}>
          <p suppressHydrationWarning>
            © {new Date().getFullYear()} {BUSINESS.legalName ? `${BUSINESS.legalName} · ` : ''}Unifitz, {BUSINESS.addressLine}
          </p>
          <ul className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {L.footer.legalLinks.map((l, i) => (
              <li key={l.to} className="flex items-center gap-x-2">
                {i > 0 && <span aria-hidden="true" style={{ color: '#5E5446' }}>·</span>}
                <Link to={l.to} className="py-1 hover:text-white"><span className="md:hidden">{l.short ?? l.label}</span><span className="hidden md:inline">{l.label}</span></Link>
              </li>
            ))}
          </ul>
        </div>
        <p className="max-w-6xl mx-auto px-5 md:px-8 pb-6 text-[0.75rem]" style={{ color: '#8E816E', lineHeight: 1.55 }}>{L.disclaimer}</p>
      </div>
    </footer>
  );
}
