import { FC, useState, useEffect } from 'react';
import WhatsAppIcon from './WhatsAppIcon';
import { WA_TRIAL } from '../../constants/contact';

const links = [
  { label: 'Workouts', href: '#workouts' },
  { label: 'Coaches', href: '#coaches' },
  { label: 'Community', href: '#community' },
  { label: 'Programs', href: '#programs' },
  { label: '21-Day Challenge', href: '/21-days', highlight: true },
];

const NavBar: FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-[#0d0820]/95 backdrop-blur-2xl shadow-[0_4px_30px_rgba(255,46,159,0.15)] border-b border-white/8'
        : 'bg-transparent backdrop-blur-md border-b border-white/5'
    }`}>
      <nav className="flex justify-between items-center w-full px-4 sm:px-6 py-3 sm:py-4 max-w-7xl mx-auto">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary-container flex items-center justify-center glow-pink group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-white text-sm sm:text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              fitness_center
            </span>
          </div>
          <span className="text-lg sm:text-xl font-black tracking-tighter text-white uppercase font-lexend">
            Uni<span className="text-primary-container">fitz</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1">
          {links.map(({ label, href, highlight }) =>
            highlight ? (
              <a key={label} href={href} className="ml-2 font-lexend font-bold text-xs tracking-widest uppercase px-4 py-2 rounded-full border border-primary-container/40 text-primary-container hover:bg-primary-container/10 transition-all">
                {label}
              </a>
            ) : (
              <a key={label} href={href} className="font-lexend font-medium text-sm px-4 py-2 rounded-full text-white/60 hover:text-white hover:bg-white/5 transition-all">
                {label}
              </a>
            )
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={WA_TRIAL}
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex items-center gap-1.5 text-white/60 hover:text-white font-lexend text-xs font-bold tracking-widest uppercase transition-colors focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:outline-none rounded-full px-2 py-1"
          >
            <WhatsAppIcon size={15} />
            <span className="hidden lg:inline">WhatsApp</span>
          </a>
          <button className="bg-primary-container text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-lexend text-[10px] sm:text-xs font-bold tracking-widest uppercase glow-pink hover:brightness-110 active:scale-95 transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-container focus-visible:ring-offset-[#0d0820] focus-visible:outline-none">
            Free Trial
          </button>
          <button
            className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-lg">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0d0820]/98 backdrop-blur-2xl border-t border-white/10 px-4 py-4 flex flex-col gap-1">
          {links.map(({ label, href, highlight }) => (
            <a
              key={label}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`font-lexend text-sm font-medium px-4 py-3 rounded-xl transition-colors ${
                highlight
                  ? 'text-primary-container bg-primary-container/10 border border-primary-container/20'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </a>
          ))}
          <a
            href={WA_TRIAL}
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-lexend text-xs font-bold tracking-widest uppercase focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <WhatsAppIcon size={16} />
            Join Free Trial on WhatsApp
          </a>
        </div>
      )}
    </header>
  );
};

export default NavBar;
