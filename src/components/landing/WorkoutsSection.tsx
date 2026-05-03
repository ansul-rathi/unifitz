import { FC, useState } from 'react';
import WhatsAppIcon from './WhatsAppIcon';

interface Tab {
  id: string;
  label: string;
  icon: string;
  bg: string;
  accentColor: string;
  accentBg: string;
  glowClass: string;
  orb: string;
  tag: string;
  headline: string;
  headlineAccent: string;
  desc: string;
  points: string[];
  img: string;
  imgAlt: string;
  primaryBtn: string;
  light?: boolean;
}

const tabs: Tab[] = [
  {
    id: 'zumba',
    label: 'Zumba',
    icon: 'music_note',
    bg: 'bg-[#1A0F2E]',
    accentColor: 'text-primary-container',
    accentBg: 'bg-primary-container',
    glowClass: 'glow-pink',
    orb: 'bg-primary-container/20',
    tag: 'Energizing Zumba Sessions',
    headline: 'Dance Your Way to',
    headlineAccent: 'Fitness',
    desc: 'Fun. Energy. Fat Loss. All from home. A daily dance party designed for women aged 30–50.',
    points: [
      'Burn 400–600 calories per session',
      'Latin & Bollywood routines — no steps to memorise',
      'Live instructor-led classes, Mon–Sat',
    ],
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLMMzQ8Ye0Iz_EGZql8bijblji-zpJs7rLAYgqJpk84osQPcnzVo3Wvo9vPezuk933JEHKO_z4I2ep5dO0g9wZodNDb3ZtOyMjkpSYXJaLPB51fmrItFYA84g4T5fxKZU_h5uR0KGXI9D3rwwhHPLgnwWz0Qy5BsQAMGLmOOv3JSoVtdGn0ettX-QIjFLhWVdB6PCabSw6iichI1ORJ24eRqyKV8IgX_Aa-o3G8DxtuHjjeiEt6h6AxGAsczICSy1fOkJEBvaHdPwz',
    imgAlt: 'Joyful woman dancing Zumba in vibrant pink fitness wear',
    primaryBtn: 'Join Free Trial',
  },
  {
    id: 'yoga',
    label: 'Yoga',
    icon: 'self_improvement',
    bg: 'bg-[#F5F1EA]',
    accentColor: 'text-[#484742]',
    accentBg: 'bg-[#484742]',
    glowClass: '',
    orb: 'bg-[#c9c6c0]/30',
    tag: 'Yoga & Meditation',
    headline: 'Find Balance.',
    headlineAccent: 'Breathe. Relax.',
    desc: 'Guided yoga and meditation for mind and body. Reclaim your inner peace at your own pace.',
    points: [
      'Soul-centering flow — low-impact, high reward',
      'Breathwork mastery — lower cortisol naturally',
      'Restorative rest — deep sleep protocols',
    ],
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpj8BwO_QzMC7RgehZiKT-ftzS5UjVD_aid7ZHMr8hKucM9ukCnL_XfMUbcP1-EkZ2ZLgidPX9LIAyBb_cuqfZylW7O8z8JmV0eUW_p3DrIBiVYe7VVFkbTFOj4zCb-krpxchsZ9yrwxZb8GYI_GoSKZjGENoK9O7_C7jepsaseQzPviTauaWcWLyo-qQ3LxxFnwsk8qxBxEkNdeibJRfBGzSLo4qkeniNNCRtqvf7utXIBFllsveLfYbpTq1StMdhPK1vz1RisbuK',
    imgAlt: 'Serene Indian yoga instructor in peaceful morning pose',
    primaryBtn: 'Explore Yoga',
    light: true,
  },
  {
    id: 'strength',
    label: 'Strength',
    icon: 'fitness_center',
    bg: 'bg-[#0B0F1A]',
    accentColor: 'text-secondary-container',
    accentBg: 'bg-secondary-container',
    glowClass: 'glow-blue',
    orb: 'bg-secondary-container/15',
    tag: 'Strength Training',
    headline: 'Build Strength.',
    headlineAccent: 'Transform Your Body.',
    desc: 'Functional strength training for women. Tone muscles and boost metabolism with expert-led sessions.',
    points: [
      'No heavy equipment needed at home',
      'Metabolic conditioning for effective fat loss',
      'Joint-friendly exercises for long-term health',
    ],
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwK4QczIHnq9kQ7Tps9H9WeY0IIeN0Bz1LIp8DoXZ3NtqTfsc8pQS6x4eDTUrcXssSZryBI636cqGeeM3hpezpYbbX4Q6g6DcxOcluPxjdfiJEWMEFXuPvj3aj1_1fZRdxqMZFvcpRJWn-P4E4JiB8w4Zmyy2rMRINrgfGubU8nBjn3LH9OJ9z4DC6j6BOwgJHOSi-rBKAwefqSDdjfHVR7a7Tr2n1FpBhEkUytnpV-YUQ2LFzyTrDFy6YzukCdyaAymMyooDhqbbz',
    imgAlt: 'Fit woman performing strength training with kettlebells',
    primaryBtn: 'Explore Program',
  },
];

const WorkoutsSection: FC = () => {
  const [active, setActive] = useState(0);
  const t = tabs[active];
  const isLight = !!t.light;
  const dark = !isLight;

  return (
    <section id="workouts" className={`relative overflow-hidden transition-colors duration-500 ${t.bg}`}>
      {/* bg orb */}
      <div className={`absolute top-0 right-0 w-72 h-72 sm:w-[500px] sm:h-[500px] ${t.orb} blur-[120px] sm:blur-[180px] rounded-full pointer-events-none`} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-10">

        {/* tab pills */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className={`flex gap-1 p-1 rounded-full ${dark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
            {tabs.map((tab, i) => (
              <button
                key={tab.id}
                onClick={() => setActive(i)}
                className={`flex items-center gap-1.5 px-3 sm:px-5 py-2 rounded-full font-lexend text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all duration-200 ${
                  active === i
                    ? `${tab.accentBg} text-white shadow-md`
                    : dark
                    ? 'text-white/40 hover:text-white'
                    : 'text-[#484742]/50 hover:text-[#484742]'
                }`}
              >
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{tab.icon}</span>
                <span className="hidden xs:inline sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-center">

          {/* text */}
          <div className={`order-2 lg:${active === 1 ? 'order-2' : 'order-1'}`}>
            <span className={`inline-block px-3 py-1 rounded-full font-lexend text-[9px] sm:text-[10px] font-bold tracking-widest uppercase mb-4 ${
              isLight
                ? 'bg-[#484742]/10 text-[#484742] border border-[#484742]/20'
                : `bg-white/5 ${t.accentColor} border border-white/10`
            }`}>
              {t.tag}
            </span>

            <h1 className={`font-lexend text-2xl sm:text-3xl lg:text-5xl font-bold mb-3 leading-tight ${isLight ? 'text-[#31302c]' : 'text-white'}`}>
              {t.headline} <span className={t.accentColor}>{t.headlineAccent}</span>
            </h1>

            <p className={`font-jakarta text-sm sm:text-base mb-5 ${isLight ? 'text-[#484742]' : 'text-white/70'}`}>
              {t.desc}
            </p>

            <ul className="space-y-2 mb-6">
              {t.points.map((p) => (
                <li key={p} className={`flex items-start gap-2.5 font-jakarta text-sm ${isLight ? 'text-[#31302c]' : 'text-white/80'}`}>
                  <span className={`material-symbols-outlined text-base mt-0.5 shrink-0 ${t.accentColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                  {p}
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3">
              <button className={`${t.accentBg} text-white px-6 py-3 rounded-full font-lexend text-xs font-bold tracking-widest uppercase ${t.glowClass} hover:brightness-110 active:scale-95 transition-all`}>
                {t.primaryBtn}
              </button>
              <a
                href="https://wa.me/yournumber?text=Hi,%20I%20want%20to%20join%20Unifitz%20free%20trial"
                target="_blank"
                rel="noreferrer"
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-lexend text-xs font-bold tracking-widest uppercase transition-all border ${
                  isLight
                    ? 'border-[#484742]/20 text-[#484742] hover:bg-[#484742]/10'
                    : 'border-white/15 text-white hover:bg-white/8'
                }`}
              >
                <WhatsAppIcon size={15} />
                WhatsApp Us
              </a>
            </div>
          </div>

          {/* image */}
          <div className={`relative order-1 lg:${active === 1 ? 'order-1' : 'order-2'}`}>
            <div className={`absolute -inset-4 ${t.orb} blur-[60px] rounded-full pointer-events-none`} />
            <img
              key={t.id}
              className="rounded-2xl sm:rounded-3xl relative z-10 w-full object-cover aspect-[4/3] sm:aspect-[4/4] lg:aspect-[4/5] shadow-2xl"
              src={t.img}
              alt={t.imgAlt}
              fetchPriority="high"
              decoding="async"
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default WorkoutsSection;
