import { FC } from 'react';
import { WA_TRIAL } from '../../constants/contact';

const FinalCTA: FC = () => (
  <section className="py-12 sm:py-xl px-4 sm:px-6 lg:px-xl relative overflow-hidden bg-surface">
    <div
      className="max-w-7xl mx-auto rounded-2xl sm:rounded-[3.5rem] p-8 sm:p-16 lg:p-24 text-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #b7006e 0%, #ff45a3 40%, #c0006e 70%, #7a003d 100%)' }}
    >
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />
      <div className="absolute -top-16 -left-16 w-48 sm:w-80 h-48 sm:h-80 bg-white/20 rounded-full blur-[80px] sm:blur-[120px]" />
      <div className="absolute -bottom-16 -right-16 w-48 sm:w-80 h-48 sm:h-80 bg-[#7a003d]/60 rounded-full blur-[80px] sm:blur-[120px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

      <span className="inline-block px-3 sm:px-4 py-1 rounded-full bg-white/15 border border-white/25 font-lexend text-[9px] sm:text-[10px] font-bold tracking-widest uppercase text-white mb-5 sm:mb-8 relative z-10">
        3-Day Free Trial — No Credit Card
      </span>
      <h2 className="font-lexend text-2xl sm:text-4xl lg:text-7xl font-bold mb-4 sm:mb-6 relative z-10 text-white leading-tight">
        Your Transformation<br />Starts Today.
      </h2>
      <p className="font-jakarta text-sm sm:text-lg text-white/80 mb-8 sm:mb-12 max-w-2xl mx-auto relative z-10">
        Stop waiting for the perfect moment. Take the first step towards a healthier, happier you.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center relative z-10">
        <a
          href={WA_TRIAL}
          target="_blank"
          rel="noreferrer"
          className="bg-white text-[#b7006e] px-8 sm:px-12 py-3.5 sm:py-5 rounded-full font-lexend text-xs sm:text-sm font-bold tracking-widest uppercase shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:scale-105 transition-all focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        >
          Start Free Trial
        </a>
        <a
          href="#programs"
          className="bg-white/10 border border-white/30 text-white px-8 sm:px-12 py-3.5 sm:py-5 rounded-full font-lexend text-xs sm:text-sm font-bold tracking-widest uppercase hover:bg-white/20 transition-all focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
        >
          View All Programs
        </a>
      </div>
    </div>
  </section>
);

export default FinalCTA;
