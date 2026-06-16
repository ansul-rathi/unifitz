import { useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { waLink } from '../config';

// Persistent floating WhatsApp button — bottom-right, gentle pulse, with a
// dismissible "Chat with us" label that appears after a few seconds.
export default function FloatingWhatsApp() {
  const [showLabel, setShowLabel] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowLabel(true), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed bottom-24 lg:bottom-5 right-5 z-50 flex items-center gap-2">
      {showLabel && !dismissed && (
        <span className="hidden sm:flex items-center gap-2 bg-white shadow-lg rounded-full pl-4 pr-2 py-2 text-sm font-semibold text-slate-700 animate-fade-up">
          Chat with us
          <button onClick={() => setDismissed(true)} aria-label="Dismiss" className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}
      <a
        href={waLink()}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="relative inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl hover:scale-105 transition-transform duration-200"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] motion-safe:animate-ping opacity-30" />
        <MessageCircle className="relative w-7 h-7" />
      </a>
    </div>
  );
}
