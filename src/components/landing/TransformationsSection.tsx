import { FC } from 'react';

const stories = [
  {
    name: 'Anjali, 42',
    label: 'Low Energy to Radiant',
    labelColor: 'text-primary',
    quote: '"I never thought I could feel this energetic again. Unifitz changed my life!"',
    beforeImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPpVqub3722qic7KOXXe41ywBJtPOKfNc_w7phi2QF5Qm-5FeMdBPdipt86mmW6hkn8jSBbqsDJFc58OCN-iLqs1cQxkohqO2eef50tREo8XwGL1IfUsixaD0lbrUFgtySuYUx3j4JRRR5HCAmbEuELw7cF7WNj2cuei_HftmKJP13AcEHP1l2qR-38Ta5sKTPZpTrDbSzBWg6JT8N4s8o-TtQjV0F_JcSV-Lb2Ad6LePrYU30Gbhx57cZAo_2992hRi8JrjXH9eW_',
    afterImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALP-hnNRRhkqvC-k9J0y2nD6anhEH6qVUKUphzNlq1esMa8310FxVb1CDDmIVDK3TgfXRUZcMz7bzH5QumeaIrE1jDQQBp93ovwQXaeiDKdUvJvmI5bZWOsse_qcjLiX2nQp-ylclQSrjtXHfNoSeIa6rVSqdD745LVnmod0LsJx8iifidVucPsEUz_dxvsJzT0n9aDFmHYNSi5zK1meWXoJXG2B06CIvRHw1ZXchV20MxMnBtm04hZmDj8utPpE7mvtpE0ojMAlzO',
    afterBorder: 'border-primary-container/30',
    afterBadgeBg: 'bg-primary-container',
  },
  {
    name: 'Priya, 35',
    label: 'Lost 12kg in 3 Months',
    labelColor: 'text-secondary',
    quote: '"The supportive community and fun workouts made weight loss feel effortless."',
    beforeImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdgur5YeOxhEDRj28o-7_KI47StgsdXoASe36pbk9_ud2Nv78ltPoEdTsICE8XDI2TEMYOqSHFwLzf4J_BDHCI7DfWf3c9dtIXL6cCAh7eQORkHHXAlqk55FKAh8TOeYMOhtEn89fUM6LI-nilf-j5rQN4PKvH60MRrcTWs3EKp1MpZ_z2g3qdXeUcSIaYC3cQ8IS1iOSC7IGW0uH-lqAf4m72qT2oOZk5czju9FOk0szjQzDylJotFXfnqKqnKIDWW-BqFbiq9Zxa',
    afterImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvdZaYuBO01ltEjWEWFlda7ZWDQ_Q-6vSE_PM6kbV4boVjPTFAnGIwYiGBqCLooxIiFTLuPEPwqi5_LiZFKx7O5P--WDnhlsadzCgnszeqjd5vNgWqIi-OayYpbGom2jpucdvb7TtAmw-KvQ9DqVtIG1GBntHkXUpp9NOxAVKZnHM-ZAyPfdwfuaNGSe50rBJ7z3jsldiEb7zsFFzqBS5_MR-MeIw6PmI9iDs4uYhpwB0e-nQ6zwse_us2EbMlx7jlybwNjWe_TMmM',
    afterBorder: 'border-secondary-container/30',
    afterBadgeBg: 'bg-secondary-container',
  },
];

const TransformationsSection: FC = () => (
  <section className="py-12 sm:py-xl px-4 sm:px-6 lg:px-xl bg-surface">
    <div className="max-w-7xl mx-auto text-center mb-8 sm:mb-16">
      <h2 className="font-lexend text-2xl sm:text-3xl lg:text-h1 font-bold mb-3 text-on-surface">
        Real Women. Real Transformations.
      </h2>
      <p className="font-jakarta text-sm sm:text-base text-on-surface-variant">
        Our community&apos;s success stories are our biggest pride.
      </p>
    </div>

    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
      {stories.map((s) => (
        <div key={s.name} className="glass-card p-3 sm:p-4 rounded-2xl sm:rounded-[2rem]">
          <div className="flex flex-row gap-3 mb-4">
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl w-full">
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] text-white uppercase tracking-wider font-bold z-10">Before</div>
              <img className="w-full h-40 sm:h-56 object-cover" src={s.beforeImg} alt={`${s.name} before`} loading="lazy" decoding="async" />
            </div>
            <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl w-full border-2 ${s.afterBorder}`}>
              <div className={`absolute top-2 left-2 ${s.afterBadgeBg} px-2 py-0.5 rounded-full text-[9px] text-white uppercase tracking-wider font-bold z-10`}>After</div>
              <img className="w-full h-40 sm:h-56 object-cover" src={s.afterImg} alt={`${s.name} after`} />
            </div>
          </div>
          <div className="px-2 pb-2">
            <h4 className="font-lexend text-base sm:text-xl font-semibold mb-0.5 text-on-surface">{s.name}</h4>
            <p className={`${s.labelColor} text-[10px] sm:text-sm font-lexend font-bold tracking-widest uppercase mb-2`}>{s.label}</p>
            <p className="font-jakarta text-on-surface-variant text-xs sm:text-sm italic">{s.quote}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default TransformationsSection;
