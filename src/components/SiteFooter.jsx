import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Mail, MessageCircle } from 'lucide-react';
import { BUSINESS, waLink } from '../config';
import { L } from '../content/landing';
import { track } from '../lib/track';
import '../pages/landing.css';

// Marketing footer — shared by the landing page and the legal pages so the
// brand frame (and the legal links) is identical everywhere. Render inside `.uf`.
const SOCIAL_ICON = { instagram: [Instagram, 'Instagram'], facebook: [Facebook, 'Facebook'], youtube: [Youtube, 'YouTube'] };
const SOCIALS = Object.entries(BUSINESS.socials).filter(([, href]) => href);
const HAS_INSTRUCTORS = import.meta.env.DEV || L.instructors.items.some(i => i.name);
const LINKS = L.nav.links.filter(l => l.href !== '#instructors' || HAS_INSTRUCTORS);
const H = { color: '#FBF6EE', fontFamily: 'var(--sans)', letterSpacing: '0.08em' };

export default function SiteFooter() {
  return (
    <footer style={{ background: '#1E1710', color: '#CDBFAD' }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="uf-serif text-2xl" style={{ color: '#FBF6EE' }}>Unifitz</p>
          <p className="mt-4 text-[0.95rem] max-w-xs" style={{ lineHeight: 1.6 }}>{L.footer.tagline}</p>
          {SOCIALS.length > 0 && (
            <div className="mt-5 flex gap-3">
              {SOCIALS.map(([key, href]) => {
                const [Icon, label] = SOCIAL_ICON[key];
                return <a key={key} href={href} aria-label={`Unifitz on ${label}`} target="_blank" rel="noopener noreferrer" className="grid place-items-center w-11 h-11 rounded-lg hover:text-white" style={{ background: 'rgba(255,255,255,0.06)' }}><Icon className="w-5 h-5" /></a>;
              })}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-[0.8rem] font-bold uppercase mb-3" style={H}>{L.footer.explore}</h2>
          <ul className="text-[0.95rem]">
            {LINKS.map(l => <li key={l.href}><a href={`/${l.href}`} className="inline-block py-2 hover:text-white">{l.label}</a></li>)}
            <li><Link to="/auth" className="inline-block py-2 hover:text-white">Login / Sign up</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-[0.8rem] font-bold uppercase mb-3" style={H}>Get in touch</h2>
          <ul className="text-[0.95rem]">
            <li><a href={`mailto:${BUSINESS.email}`} onClick={() => track('contact_email_click', { location: 'footer' })} className="inline-flex items-center gap-2 py-2 hover:text-white"><Mail className="w-4 h-4" /> {BUSINESS.email}</a></li>
            <li><a href={waLink()} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp_click', { location: 'footer' })} className="inline-flex items-center gap-2 py-2 hover:text-white"><MessageCircle className="w-4 h-4" /> WhatsApp {BUSINESS.phoneDisplay}</a></li>
            <li className="text-[0.85rem] pt-1" style={{ color: '#A89A85' }}>{BUSINESS.supportHours} · based in {BUSINESS.addressLine}</li>
            <li className="text-[0.85rem] pt-1" style={{ color: '#A89A85' }}>{L.footer.tzNote}</li>
          </ul>
        </div>
        <div>
          <h2 className="text-[0.8rem] font-bold uppercase mb-3" style={H}>{L.footer.legal}</h2>
          <ul className="text-[0.95rem]">
            {L.footer.legalLinks.map(l => <li key={l.to}><Link to={l.to} className="inline-block py-2 hover:text-white">{l.label}</Link></li>)}
          </ul>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-5 text-[0.8rem] space-y-2" style={{ color: '#A89A85' }}>
          <p>{L.tracks.disclaimer}</p>
          <p suppressHydrationWarning>
            © {new Date().getFullYear()} {BUSINESS.legalName ? `${BUSINESS.legalName}. Unifitz is operated by ${BUSINESS.legalName}, ${BUSINESS.addressLine}.` : `Unifitz, ${BUSINESS.addressLine}.`} Live online fitness for women.
          </p>
        </div>
      </div>
    </footer>
  );
}
