import { FC, useEffect, useState } from 'react';
import WhatsAppIcon from './WhatsAppIcon';
import { WA_TRIAL } from '../../constants/contact';

const StickyCtaBar: FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden px-4 pb-4 pt-2 bg-gradient-to-t from-[#0a0514] to-transparent pointer-events-none">
      <a
        href={WA_TRIAL}
        target="_blank"
        rel="noreferrer"
        className="pointer-events-auto flex items-center justify-center gap-2 w-full bg-[#25D366] text-white px-6 py-4 rounded-full font-lexend text-xs font-bold tracking-widest uppercase shadow-[0_4px_24px_rgba(37,211,102,0.4)] hover:brightness-110 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:outline-none"
      >
        <WhatsAppIcon size={18} />
        Join Free Trial — Chat on WhatsApp
      </a>
    </div>
  );
};

export default StickyCtaBar;
