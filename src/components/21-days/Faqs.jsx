import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: 'What exactly is included in the 21 Days Fitness Challenge?',
    answer: 'You get access to daily live sessions with 4 international trainers covering Yoga, Zumba, and NLP coaching. This includes personalized workout plans, nutrition guidelines, progress tracking, lifetime recording access, community support, and a certificate upon completion.'
  },
  {
    question: 'Is this really just ₹21 for Indians and 1 AED for UAE residents?',
    answer: 'Yes! This is a special launch offer with 95% discount. The regular price is ₹999, but we are offering it at ₹21 for Indian clients and 1 AED for UAE clients for a limited time only.'
  },
  {
    question: 'Do I need any prior fitness experience?',
    answer: 'Absolutely not! Our program is designed for all fitness levels - from complete beginners to advanced practitioners. Our trainers will guide you step-by-step and provide modifications based on your fitness level.'
  },
  {
    question: 'How much time do I need to dedicate daily?',
    answer: 'Just 30-45 minutes per day. We believe in efficiency and results. Our expertly designed sessions maximize benefits in minimal time so you can fit fitness into your busy schedule.'
  },
  {
    question: 'What if I miss a live session?',
    answer: 'No worries! All sessions are recorded and available for lifetime access. You can catch up anytime at your convenience. However, we recommend attending live sessions for maximum interaction and motivation.'
  },
  {
    question: 'What equipment do I need?',
    answer: 'Minimal equipment required! Most exercises use just your body weight. We recommend a yoga mat for comfort. Any additional equipment needs will be communicated in advance with easy alternatives provided.'
  },
  {
    question: 'Is there a money-back guarantee?',
    answer: 'Yes! We offer a 100% money-back guarantee within 7 days if you are not satisfied. No questions asked. Your satisfaction and results are our priority.'
  },
  {
    question: 'When does the challenge start?',
    answer: 'New batches start every Monday. Once you enroll, you will receive an email with your batch details, schedule, and joining instructions within 24 hours.'
  },
  {
    question: 'Can I get support if I have questions during the program?',
    answer: 'Absolutely! You get 24/7 WhatsApp support from our team. Plus, you will be part of an exclusive community where you can connect with trainers and fellow participants.'
  },
  {
    question: 'What makes this different from other fitness programs?',
    answer: 'We combine physical training (Yoga + Zumba) with mindset coaching (NLP) for complete transformation. Our international trainers, proven 21-day habit formation approach, and unbeatable price make this unique. Plus, our 98% success rate speaks for itself!'
  },
  {
    question: 'Will I really see results in 21 days?',
    answer: 'Yes! Scientific research shows 21 days is the optimal period for habit formation. Our structured program combined with expert guidance ensures visible physical changes and sustainable habit development. Over 5000 members have already achieved remarkable transformations.'
  },
  {
    question: 'Is the payment secure?',
    answer: 'Absolutely! We use Razorpay, India\'s most trusted payment gateway with bank-level security. Your payment information is completely safe and encrypted.'
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about the 21 Days Fitness Challenge
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-transparent hover:border-orange-500 transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-orange-50 transition-colors duration-200"
              >
                <h3 className="text-lg font-bold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <ChevronUp className="w-6 h-6 text-orange-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
                )}
              </button>

              {openIndex === index && (
                <div className="px-6 pb-5 text-gray-700 leading-relaxed border-t border-gray-100 pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-8 md:p-12 text-white text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Still Have Questions?
          </h3>
          <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto">
            Our support team is here to help! Reach out anytime and get instant answers.
          </p>
          <a
            href="https://wa.me/919876543210?text=Hi!%20I%20have%20questions%20about%20the%2021%20Days%20Fitness%20Challenge"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Chat with Us on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
