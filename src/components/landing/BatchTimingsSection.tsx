import { FC, useState } from 'react';
import WhatsAppIcon from './WhatsAppIcon';

const morningSlots = ['6:00 – 7:00 AM', '7:00 – 8:00 AM', '8:00 – 9:00 AM', '9:00 – 10:00 AM'];
const eveningSlots = ['4:00 – 5:00 PM', '5:00 – 6:00 PM', '6:00 – 7:00 PM', '7:00 – 8:00 PM', '8:00 – 9:00 PM'];

const MorningSlotCard: FC<{ time: string }> = ({ time }) => {
  const [selected, setSelected] = useState(false);
  return (
    <button
      onClick={() => setSelected(!selected)}
      className={`relative glass-card rounded-xl sm:rounded-2xl p-3 sm:p-5 text-left w-full transition-all duration-200 active:scale-95 border ${
        selected ? 'border-primary-container/60 bg-primary-container/10 glow-pink' : 'border-white/10'
      }`}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
        </div>
      )}
      <span className={`material-symbols-outlined text-base sm:text-lg mb-1 sm:mb-3 block ${selected ? 'text-primary-container' : 'text-white/30'}`}
        style={{ fontVariationSettings: "'FILL' 1" }}>wb_sunny</span>
      <div className={`font-lexend font-bold text-xs sm:text-base ${selected ? 'text-white' : 'text-white/70'}`}>{time}</div>
      <div className="font-jakarta text-[9px] sm:text-xs text-white/40 mt-0.5">Mon – Sat · Live</div>
    </button>
  );
};

const EveningSlotCard: FC<{ time: string }> = ({ time }) => {
  const [selected, setSelected] = useState(false);
  return (
    <button
      onClick={() => setSelected(!selected)}
      className={`relative glass-card rounded-xl sm:rounded-2xl p-3 sm:p-5 text-left w-full transition-all duration-200 active:scale-95 border ${
        selected ? 'border-secondary-container/60 bg-secondary-container/10 glow-blue' : 'border-white/10'
      }`}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-secondary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
        </div>
      )}
      <span className={`material-symbols-outlined text-base sm:text-lg mb-1 sm:mb-3 block ${selected ? 'text-secondary-container' : 'text-white/30'}`}
        style={{ fontVariationSettings: "'FILL' 1" }}>nights_stay</span>
      <div className={`font-lexend font-bold text-xs sm:text-base ${selected ? 'text-white' : 'text-white/70'}`}>{time}</div>
      <div className="font-jakarta text-[9px] sm:text-xs text-white/40 mt-0.5">Mon – Sat · Live</div>
    </button>
  );
};

const BatchTimingsSection: FC = () => (
  <section className="py-12 sm:py-xl px-4 sm:px-6 lg:px-xl bg-surface-container-low relative overflow-hidden">
    <div className="absolute top-0 right-0 w-48 h-48 sm:w-[400px] sm:h-[400px] bg-primary-container/5 blur-[100px] sm:blur-[200px] rounded-full pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-[300px] sm:h-[300px] bg-secondary-container/5 blur-[100px] sm:blur-[200px] rounded-full pointer-events-none" />

    <div className="max-w-7xl mx-auto relative z-10">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-14 gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-primary-container/10 text-primary-container border border-primary-container/20 font-lexend text-[9px] sm:text-[10px] font-bold tracking-widest uppercase mb-3 sm:mb-4">
            Live Sessions
          </span>
          <h2 className="font-lexend text-2xl sm:text-3xl lg:text-h1 font-bold text-white mb-2">Pick Your Batch</h2>
          <p className="font-jakarta text-sm text-on-surface-variant max-w-md">
            Monday to Saturday. Join live with your coach.
          </p>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary-container" />
            <span className="font-lexend text-[10px] sm:text-xs text-white/50 uppercase tracking-widest">Morning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-secondary-container" />
            <span className="font-lexend text-[10px] sm:text-xs text-white/50 uppercase tracking-widest">Evening</span>
          </div>
        </div>
      </div>

      {/* Morning */}
      <div className="mb-6 sm:mb-10">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5">
          <span className="material-symbols-outlined text-primary-container text-base sm:text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>wb_sunny</span>
          <h3 className="font-lexend text-[10px] sm:text-sm font-bold tracking-widest uppercase text-primary-container">Morning Batches</h3>
          <div className="flex-1 h-px bg-primary-container/20" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          {morningSlots.map((slot) => <MorningSlotCard key={slot} time={slot} />)}
        </div>
      </div>

      {/* Evening */}
      <div className="mb-6 sm:mb-12">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5">
          <span className="material-symbols-outlined text-secondary-container text-base sm:text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>nights_stay</span>
          <h3 className="font-lexend text-[10px] sm:text-sm font-bold tracking-widest uppercase text-secondary-container">Evening Batches</h3>
          <div className="flex-1 h-px bg-secondary-container/20" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
          {eveningSlots.map((slot) => <EveningSlotCard key={slot} time={slot} />)}
        </div>
      </div>

      {/* CTA strip */}
      <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <span className="material-symbols-outlined text-primary-container text-2xl sm:text-3xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>live_tv</span>
          <div>
            <div className="font-lexend font-bold text-sm sm:text-base text-white mb-0.5">Can&apos;t find your slot?</div>
            <div className="font-jakarta text-xs sm:text-sm text-on-surface-variant">Recorded sessions available 24/7.</div>
          </div>
        </div>
        <a
          href="https://wa.me/yournumber?text=Hi,%20I%20want%20to%20book%20a%20batch%20at%20Unifitz"
          target="_blank"
          rel="noreferrer"
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-container text-white px-6 py-3 rounded-full font-lexend text-xs font-bold tracking-widest uppercase glow-pink hover:brightness-110 transition-all"
        >
          <WhatsAppIcon size={16} />
          Book via WhatsApp
        </a>
      </div>
    </div>
  </section>
);

export default BatchTimingsSection;
