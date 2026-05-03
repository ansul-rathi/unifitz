import { FC } from 'react';

const rows = [
  { feature: 'Personalized Diet Plan', gym: false, yt: false, unifitz: true },
  { feature: 'Supportive Community', gym: false, yt: false, unifitz: true },
  { feature: 'Expert Indian Coaches', gym: true, yt: false, unifitz: true },
  { feature: 'Zero Equipment Needed', gym: false, yt: true, unifitz: true },
];

const Check: FC<{ yes: boolean; best?: boolean }> = ({ yes, best }) => {
  if (!yes) return <span className="material-symbols-outlined text-white/30 text-base sm:text-xl">close</span>;
  if (best) return <span className="material-symbols-outlined text-primary-container text-base sm:text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>done_all</span>;
  return <span className="material-symbols-outlined text-white/50 text-base sm:text-xl">check</span>;
};

const WhyUnifitzSection: FC = () => (
  <section className="py-12 sm:py-xl px-4 sm:px-6 lg:px-xl bg-surface-container-highest/30">
    <div className="max-w-5xl mx-auto">
      <h2 className="font-lexend text-2xl sm:text-3xl lg:text-h2 font-bold mb-6 sm:mb-12 text-center text-on-surface">Why Unifitz?</h2>
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <table className="w-full border-collapse min-w-[320px]">
          <thead>
            <tr className="text-left">
              <th className="p-3 sm:p-6 font-lexend text-sm sm:text-xl text-white">Feature</th>
              <th className="p-3 sm:p-6 font-lexend text-[9px] sm:text-xs text-white/50 tracking-widest uppercase">Gym</th>
              <th className="p-3 sm:p-6 font-lexend text-[9px] sm:text-xs text-white/50 tracking-widest uppercase">YouTube</th>
              <th className="p-3 sm:p-6 font-lexend text-[9px] sm:text-xs text-primary-container tracking-widest uppercase">Unifitz</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row) => (
              <tr key={row.feature}>
                <td className="p-3 sm:p-6 font-jakarta text-xs sm:text-base text-on-surface font-medium">{row.feature}</td>
                <td className="p-3 sm:p-6"><Check yes={row.gym} /></td>
                <td className="p-3 sm:p-6"><Check yes={row.yt} /></td>
                <td className="p-3 sm:p-6"><Check yes={row.unifitz} best /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

export default WhyUnifitzSection;
