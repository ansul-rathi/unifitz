import { FC, useState } from 'react';
import WhatsAppIcon from './WhatsAppIcon';
import { WA_GENERAL } from '../../constants/contact';

const linkGroups = [
  {
    title: 'Explore',
    links: [
      { label: 'Workouts', href: '#workouts' },
      { label: 'Coaches', href: '#coaches' },
      { label: 'Community', href: '#community' },
      { label: 'Pricing', href: '#pricing' },
      { label: '21-Day Challenge', href: '/21-days' },
    ],
  },
  {
    title: 'Programs',
    links: [
      { label: 'Zumba', href: '#' },
      { label: 'Yoga & Meditation', href: '#' },
      { label: 'Strength Training', href: '#' },
      { label: 'Breathwork', href: '#' },
      { label: 'Nutrition', href: '#' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Contact Us', href: '#' },
    ],
  },
];

const Footer: FC = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <footer className="bg-[#0a0514] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 sm:pt-16 pb-6 sm:pb-10">

        {/* top — logo + social + newsletter */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 sm:gap-12 mb-6 sm:mb-10 pb-6 sm:pb-10 border-b border-white/5">
          <div className="flex items-center justify-between sm:flex-col sm:items-start sm:gap-4">
            <div className="text-xl sm:text-2xl font-black tracking-tighter text-pink-500 uppercase font-lexend">Unifitz</div>
            <div className="flex gap-2">
              <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-pink-400 transition-all">
                <span className="material-symbols-outlined text-sm">photo_camera</span>
              </a>
              <a href="#" aria-label="YouTube" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-pink-400 transition-all">
                <span className="material-symbols-outlined text-sm">movie</span>
              </a>
              <a href={WA_GENERAL} target="_blank" rel="noreferrer" aria-label="WhatsApp"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-[#25D366] transition-all focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:outline-none">
                <WhatsAppIcon size={14} />
              </a>
            </div>
          </div>

          <div className="flex-1 max-w-sm sm:max-w-md">
            <p className="font-lexend text-[9px] font-bold tracking-widest uppercase text-white/40 mb-2">Stay in the Loop</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-full px-3 py-2 text-xs font-jakarta text-white placeholder:text-neutral-600 focus:outline-none focus:border-pink-500/50 transition-all"
              />
              <button className="bg-primary-container text-white px-4 py-2 rounded-full font-lexend text-[10px] font-bold tracking-widest uppercase glow-pink hover:brightness-110 transition-all whitespace-nowrap">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* links — accordion on mobile, grid on desktop */}
        <div className="mb-6 sm:mb-10">
          {/* mobile accordion */}
          <div className="sm:hidden divide-y divide-white/5 border-t border-white/5">
            {linkGroups.map((group, i) => (
              <div key={group.title}>
                <button
                  className="w-full flex justify-between items-center py-3.5 text-left focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:outline-none rounded-lg"
                  aria-expanded={open === i}
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span className="font-lexend text-xs font-bold tracking-widest uppercase text-white/60">{group.title}</span>
                  <span className={`material-symbols-outlined text-white/30 text-lg transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                {open === i && (
                  <ul className="pb-4 space-y-3 pl-1">
                    {group.links.map(({ label, href }) => (
                      <li key={label}>
                        <a href={href} className="font-jakarta text-xs text-neutral-400 hover:text-white transition-colors">{label}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* desktop grid */}
          <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-8">
            {linkGroups.map((group) => (
              <div key={group.title}>
                <h5 className="font-lexend text-[9px] font-bold tracking-widest uppercase text-white/40 mb-4">{group.title}</h5>
                <ul className="space-y-2">
                  {group.links.map(({ label, href }) => (
                    <li key={label}>
                      <a href={href} className="font-jakarta text-sm text-neutral-500 hover:text-white transition-colors">{label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {/* trust col — desktop only */}
            <div>
              <h5 className="font-lexend text-[9px] font-bold tracking-widest uppercase text-white/40 mb-4">Trust</h5>
              <div className="space-y-3">
                {[['verified','5,000+ Members'],['star','4.9 Rated'],['emoji_events','Free 3-Day Trial']].map(([icon,label]) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">{icon}</span>
                    <span className="font-jakarta text-sm text-neutral-500">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* bottom bar */}
        <div className="border-t border-white/5 pt-4 sm:pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="font-lexend text-[9px] text-neutral-600 uppercase tracking-widest">
            © 2025 Unifitz. Empowered Transformation.
          </p>
          <div className="flex items-center gap-3 sm:hidden">
            {[['verified','5k+'],['star','4.9'],['emoji_events','Free Trial']].map(([icon,label]) => (
              <div key={label} className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-sm">{icon}</span>
                <span className="font-lexend text-[8px] text-neutral-600 uppercase">{label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
