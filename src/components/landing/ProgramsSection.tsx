import { FC } from 'react';
import WhatsAppIcon from './WhatsAppIcon';
import { WA_PROGRAM } from '../../constants/contact';

interface Program {
  icon: string;
  tag: string;
  tagStyle: string;
  title: string;
  tagline: string;
  taglineColor: string;
  borderClass: string;
  iconWrapperBg: string;
  iconColor: string;
  checkColor: string;
  ctaClass: string;
  glowClass: string;
  points: string[];
}

const programs: Program[] = [
  {
    icon: 'monitor_weight',
    tag: 'Most Popular',
    tagStyle: 'bg-primary-container text-white',
    title: 'Weight Loss & Toning',
    tagline: 'Burn fat. Feel lighter. Look defined.',
    taglineColor: 'text-primary-container',
    borderClass: 'border-primary-container/30',
    iconWrapperBg: 'bg-primary-container/15',
    iconColor: 'text-primary-container',
    checkColor: 'text-primary-container',
    ctaClass: 'border-primary-container/40 text-primary-container hover:bg-primary-container/10',
    glowClass: 'glow-pink',
    points: [
      'Targeted fat-burning Zumba & cardio',
      'Daily calorie-conscious meal guidance',
      'Progressive training for high metabolism',
      'Weekly inch-loss tracking with coach',
      'Sustainable, long-term results',
    ],
  },
  {
    icon: 'sports_gymnastics',
    tag: 'All Levels',
    tagStyle: 'bg-secondary-container text-[#001f27]',
    title: 'Full Body Fitness',
    tagline: 'Move better. Feel stronger. Live fully.',
    taglineColor: 'text-secondary-container',
    borderClass: 'border-secondary-container/30',
    iconWrapperBg: 'bg-secondary-container/15',
    iconColor: 'text-secondary-container',
    checkColor: 'text-secondary-container',
    ctaClass: 'border-secondary-container/40 text-secondary-container hover:bg-secondary-container/10',
    glowClass: 'glow-blue',
    points: [
      'Balanced cardio, strength & mobility',
      'Zumba, yoga, and bodyweight combined',
      'Builds stamina and daily energy',
      'Beginner and intermediate friendly',
      'Holistic wellness — body and mind',
    ],
  },
  {
    icon: 'fitness_center',
    tag: 'Advanced',
    tagStyle: 'bg-tertiary text-[#1c1c18]',
    title: 'Strength & Flexibility',
    tagline: 'Build power. Move freely. Age gracefully.',
    taglineColor: 'text-tertiary',
    borderClass: 'border-tertiary/30',
    iconWrapperBg: 'bg-tertiary/15',
    iconColor: 'text-tertiary',
    checkColor: 'text-tertiary',
    ctaClass: 'border-tertiary/40 text-tertiary hover:bg-tertiary/10',
    glowClass: '',
    points: [
      'Functional strength — zero heavy equipment',
      'Joint-safe resistance for lasting tone',
      'Deep stretching and flexibility flows',
      'Improves posture & reduces chronic pain',
      'Hormone-friendly for women 30–50',
    ],
  },
];


const ProgramsSection: FC = () => (
  <section id="programs" className="py-12 sm:py-xl px-4 sm:px-6 lg:px-xl bg-surface relative overflow-hidden">
    <div className="absolute top-0 left-0 w-48 h-48 sm:w-[400px] sm:h-[400px] bg-primary-container/5 blur-[100px] sm:blur-[200px] rounded-full pointer-events-none" />
    <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-[300px] sm:h-[300px] bg-secondary-container/5 blur-[100px] sm:blur-[200px] rounded-full pointer-events-none" />

    <div className="max-w-7xl mx-auto relative z-10">
      <div className="text-center mb-8 sm:mb-16">
        <span className="inline-block px-3 py-1 rounded-full bg-primary-container/10 text-primary-container border border-primary-container/20 font-lexend text-[9px] sm:text-[10px] font-bold tracking-widest uppercase mb-3 sm:mb-4">
          Our Programs
        </span>
        <h2 className="font-lexend text-2xl sm:text-3xl lg:text-h1 font-bold text-white mb-3">Choose Your Journey</h2>
        <p className="font-jakarta text-sm sm:text-base text-on-surface-variant max-w-xl mx-auto">
          Every woman is different. Pick the program that matches your goal.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {programs.map((p) => (
          <div
            key={p.title}
            className={`glass-card rounded-2xl sm:rounded-[2rem] border ${p.borderClass} flex flex-col overflow-hidden active:scale-[0.98] transition-transform duration-200`}
          >
            {/* header */}
            <div className="p-5 sm:p-8 pb-4 sm:pb-6 border-b border-white/5">
              <div className="flex items-start justify-between mb-4 sm:mb-5">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${p.iconWrapperBg} flex items-center justify-center`}>
                  <span className={`material-symbols-outlined ${p.iconColor} text-xl sm:text-2xl`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {p.icon}
                  </span>
                </div>
                <span className={`${p.tagStyle} font-lexend text-[8px] sm:text-[9px] font-bold tracking-widest uppercase px-2 sm:px-3 py-1 rounded-full`}>
                  {p.tag}
                </span>
              </div>
              <h3 className="font-lexend text-base sm:text-xl font-bold text-white mb-1.5 sm:mb-2">{p.title}</h3>
              <p className={`font-jakarta text-xs sm:text-sm font-medium ${p.taglineColor}`}>{p.tagline}</p>
            </div>

            {/* points */}
            <div className="p-5 sm:p-8 flex-1">
              <ul className="space-y-2 sm:space-y-3">
                {p.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 sm:gap-3">
                    <span className={`material-symbols-outlined ${p.checkColor} text-sm sm:text-base mt-0.5 shrink-0`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                    <span className="font-jakarta text-xs sm:text-sm text-on-surface-variant leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="px-5 sm:px-8 pb-5 sm:pb-8">
              <a
                href={WA_PROGRAM(p.title)}
                target="_blank"
                rel="noreferrer"
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-full font-lexend text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all border ${p.ctaClass} ${p.glowClass}`}
              >
                <WhatsAppIcon size={14} />
                Know More
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ProgramsSection;
