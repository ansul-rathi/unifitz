import SectionHeading from '../common/SectionHeading';
import PricingCard from './PricingCard';

/**
 * Pricing section component displaying the Yoga pricing plans
 */
const PricingSection = () => {
  // Pricing plans data
  const pricingPlans = [
    {
      title: "Single Class",
      price: "₹299",
      period: "/class",
      subtitle: "Flexibility for your schedule",
      features: [
        "Access to one yoga class",
        "All class styles available",
        "Live instructor guidance",
        "24-hour replay access"
      ],
      variant: "blue"
    },
    {
      title: "Monthly Unlimited",
      price: "₹1499",
      period: "/month",
      subtitle: "Most popular option",
      features: [
        "Unlimited yoga classes",
        "Access to all class styles",
        "Personal progress tracking",
        "Meditation library access",
        "Priority booking"
      ],
      variant: "indigo",
      featured: true
    },
    {
      title: "Family Package",
      price: "₹2499",
      period: "/month",
      subtitle: "Perfect for the whole family",
      features: [
        "Access for up to 4 family members",
        "Unlimited yoga classes",
        "Family-specific sessions",
        "Personalized guidance"
      ],
      variant: "teal"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full filter blur-3xl opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <SectionHeading
          badge="Mindful Membership Options"
          badgeVariant="blue"
          title="Choose Your Journey"
          highlight="Journey"
          subtitle="Find the perfect plan to support your yoga practice with these flexible membership options"
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
          <h3 className="text-xl font-bold text-white mb-4 text-center">Looking for corporate wellness?</h3>
          <p className="text-white/80 text-center mb-6">
            We offer special packages for companies looking to improve employee wellbeing through yoga. 
            Contact us for custom plans tailored to your organizations needs.
          </p>
          <div className="flex justify-center">
            <a 
              href="/yoga/corporate" 
              className="text-blue-300 font-medium hover:text-blue-200 transition-colors flex items-center"
            >
              Learn more about corporate plans
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