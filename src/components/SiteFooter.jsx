import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Mail } from 'lucide-react';
import { BUSINESS, waLink } from '../config';
import { L } from '../content/landing';
import { track } from '../lib/track';
import WhatsAppIcon from './WhatsAppIcon';
import '../pages/landing.css';

// Marketing footer — shared by the landing page and the legal pages so the
// brand frame (and the legal links) is identical everywhere. Render inside `.uf`.
const SOCIAL_ICON = { instagram: [Instagram, 'Instagram'], facebook: [Facebook, 'Facebook'], youtube: [Youtube, 'YouTube'] };
const SOCIALS = Object.entries(BUSINESS.socials).filter(([, href]) => href);
const ICON_BTN = 'grid place-items-center w-11 h-11 rounded-full hover:text-white transition-colors';
const ICON_BG = { background: 'rgba(255,255,255,0.07)' };

export default function SiteFooter() {
  return (
    <footer style={{ background: '#1E1710', color: '#CDBFAD' }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div className="max-w-sm">
          <p className="uf-serif text-2xl" style={{ color: '#FBF6EE' }}>Unifitz</p>
          <p className="mt-2 text-[0.95rem]" style={{ lineHeight: 1.6 }}>{L.footer.tagline}</p>
        </div>
        <div className="flex flex-col md:items-end gap-4">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-1 text-[0.95rem]">
            {L.nav.links.map(l => <a key={l.href} href={`/${l.href}`} className="py-2 hover:text-white">{l.label}</a>)}
            <Link to="/auth" className="py-2 hover:text-white">Login</Link>
          </nav>
          <div className="flex gap-2">
            <a href={waLink()} target="_blank" rel="noopener noreferrer" aria-label="Chat with Unifitz on WhatsApp" onClick={() => track('whatsapp_click', { location: 'footer' })} className={ICON_BTN} style={ICON_BG}><WhatsAppIcon className="w-5 h-5" /></a>
            <a href={`mailto:${BUSINESS.email}`} aria-label={`Email ${BUSINESS.email}`} onClick={() => track('contact_email_click', { location: 'footer' })} className={ICON_BTN} style={ICON_BG}><Mail className="w-5 h-5" /></a>
            {SOCIALS.map(([key, href]) => {
              const [Icon, label] = SOCIAL_ICON[key];
              return <a key={key} href={href} aria-label={`Unifitz on ${label}`} target="_blank" rel="noopener noreferrer" className={ICON_BTN} style={ICON_BG}><Icon className="w-5 h-5" /></a>;
            })}
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-5 text-[0.8rem] flex flex-col md:flex-row md:justify-between gap-3" style={{ color: '#A89A85' }}>
          <p suppressHydrationWarning>
            © {new Date().getFullYear()} {BUSINESS.legalName ? `${BUSINESS.legalName} · ` : ''}Unifitz, {BUSINESS.addressLine}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {L.footer.legalLinks.map(l => <li key={l.to}><Link to={l.to} className="hover:text-white">{l.label}</Link></li>)}
          </ul>
        </div>
        <p className="max-w-6xl mx-auto px-5 md:px-8 pb-6 text-[0.75rem]" style={{ color: '#8E816E' }}>{L.disclaimer}</p>
      </div>
    </footer>
  );
}
