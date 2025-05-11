import SectionHeading from '../common/SectionHeading';
import PricingCard from './PricingCard';

/**
 * Pricing section component displaying the Weight Training pricing plans
 */
const PricingSection = () => {
  // Pricing plans data
  const pricingPlans = [
    {
      title: "Single Session",
      price: "₹349",
      period: "/session",
      subtitle: "Pay as you go",
      features: [
        "Access to one training session",
        "Form check and corrections",
        "Personalized modifications",
        "24-hour replay access"
      ],
      variant: "slate"
    },
    {
      title: "Strength Builder",
      price: "₹1699",
      period: "/month",
      subtitle: "Most popular option",
      features: [
        "Unlimited training sessions",
        "Custom workout plan",
        "Progress tracking dashboard",
        "Nutrition guidance",
        "Weekly check-ins with trainer"
      ],
      variant: "emerald",
      featured: true
    },
    {
      title: "Family Plan",
      price: "₹2699",
      period: "/month",
      subtitle: "Train together, grow together",
      features: [
        "Access for up to 4 family members",
        "Customized family workouts",
        "Individual progress tracking",
        "Equipment recommendations"
      ],
      variant: "teal"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-emerald-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-gradient-to-r from-slate-500 to-gray-500 rounded-full filter blur-3xl opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <SectionHeading
          badge="Strength Building Plans"
          badgeVariant="teal"
          title="Invest in Your Strength"
          highlight="Your Strength"
          subtitle="Choose from our flexible membership options designed to fit your fitness goals and budget"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <PricingCard
              key={plan.title}
              title={plan.title}
              price={plan.price}
              period={plan.period}
              subtitle={plan.subtitle}
              features={plan.features}
              variant={plan.variant}
              featured={plan.featured}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            />
          ))}
        </div>
        
        <div className="mt-16 max-w-3xl mx-auto bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4 text-center">Need equipment recommendations?</h3>
          <p className="text-white/80 text-center mb-6">
            Our trainers can help you build an effective home gym setup based on your space, budget, and fitness goals.
            We also offer starter kits for new members.
          </p>
          <div className="flex justify-center">
            <a 
              href="/weight-training/equipment" 
              className="text-emerald-300 font-medium hover:text-emerald-200 transition-colors flex items-center"
            >
              View our equipment recommendations
              <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;