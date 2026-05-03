import { FC } from 'react';

const features = [
  { icon: 'self_improvement', label: 'Soul-Centering Flow', desc: 'Low-impact movements to release physical tension and restore your inner glow.' },
  { icon: 'air', label: 'Breathwork Mastery', desc: 'Ancient breathing techniques to calm your nervous system and lower cortisol.' },
  { icon: 'bedtime', label: 'Restorative Rest', desc: 'Guided evening sessions to quiet the mind and prepare your body for deep sleep.' },
];

const YogaSection: FC = () => (
  <section className="bg-[#F5F1EA] py-xl px-6 lg:px-xl">
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

      <div className="relative order-2 lg:order-1">
        <div className="absolute -inset-4 bg-tertiary/20 blur-[80px] rounded-full pointer-events-none" />
        <img
          className="rounded-3xl relative z-10 w-full object-cover aspect-[4/5] shadow-2xl"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpj8BwO_QzMC7RgehZiKT-ftzS5UjVD_aid7ZHMr8hKucM9ukCnL_XfMUbcP1-EkZ2ZLgidPX9LIAyBb_cuqfZylW7O8z8JmV0eUW_p3DrIBiVYe7VVFkbTFOj4zCb-krpxchsZ9yrwxZb8GYI_GoSKZjGENoK9O7_C7jepsaseQzPviTauaWcWLyo-qQ3LxxFnwsk8qxBxEkNdeibJRfBGzSLo4qkeniNNCRtqvf7utXIBFllsveLfYbpTq1StMdhPK1vz1RisbuK"
          alt="Serene Indian yoga instructor in a peaceful pose"
        />
      </div>

      <div className="order-1 lg:order-2">
        <span className="inline-block px-4 py-1 rounded-full bg-[#484742]/10 text-[#484742] border border-[#484742]/20 font-lexend text-[10px] font-bold tracking-widest uppercase mb-6">
          Yoga &amp; Meditation
        </span>
        <h2 className="font-lexend text-h1 mb-6 text-[#31302c]">
          Find Balance. <span className="text-[#93908b]">Breathe. Relax.</span>
        </h2>
        <p className="font-jakarta text-body-lg text-[#484742] mb-10">
          Guided yoga and meditation sessions for mind and body. Reclaim your inner peace after a busy day.
        </p>

        <ul className="space-y-6 mb-10">
          {features.map((f) => (
            <li key={f.label} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-[#e6e2db] flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[#484742] text-xl">{f.icon}</span>
              </div>
              <div>
                <h4 className="font-lexend font-semibold text-[#31302c] mb-1">{f.label}</h4>
                <p className="font-jakarta text-sm text-[#484742]">{f.desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <button className="bg-[#31302c] text-white px-10 py-4 rounded-full font-lexend text-sm font-bold tracking-widest uppercase hover:brightness-125 transition-all">
          Explore Wellness
        </button>
      </div>

    </div>
  </section>
);

export default YogaSection;
