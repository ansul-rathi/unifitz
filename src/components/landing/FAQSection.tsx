import { FC, useState } from 'react';

const faqs = [
  {
    q: 'Is there an age limit?',
    a: 'Programs designed for women aged 30–50, but we welcome anyone who wants to join a supportive community.',
  },
  {
    q: 'Do I need heavy equipment?',
    a: 'No heavy equipment needed. Most exercises are body-weight based or use simple household items like water bottles.',
  },
  {
    q: 'Can I follow this with a busy job?',
    a: 'Yes! Flexible timings and recorded sessions mean you can fit workouts into any schedule.',
  },
  {
    q: 'What is the 21-Day Challenge?',
    a: 'A structured jump-start to build consistent fitness habits. Start anytime at unifitz.in/21-days.',
  },
];

const FAQSection: FC = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-12 sm:py-xl px-4 sm:px-6 lg:px-xl bg-surface">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-lexend text-2xl sm:text-3xl lg:text-h2 font-bold mb-6 sm:mb-12 text-center text-on-surface">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-card rounded-xl sm:rounded-2xl overflow-hidden">
              <button
                className="w-full flex justify-between items-center p-4 sm:p-6 text-left gap-3"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-lexend font-bold text-sm sm:text-lg text-on-surface">{faq.q}</span>
                <span className={`material-symbols-outlined text-on-surface-variant shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              {open === i && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 font-jakarta text-sm text-on-surface-variant">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
