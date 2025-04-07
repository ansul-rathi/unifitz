import SectionHeading from '../common/SectionHeading';
import PricingCard from './PricingCard';

/**
 * Pricing section component displaying the Zumba pricing plans
 */
const PricingSection = () => {
  // Pricing plans data
  const pricingPlans = [
    {
      title: "Drop-In Session",
      price: "₹299",
      period: "/class",
      subtitle: "No commitment required",
      features: [
        "Single class access",
        "Professional instructor",
        "High-energy routines",
        "Try before you commit"
      ],
      variant: "pink"
    },
    {
      title: "Unlimited Monthly",
      price: "₹1499",
      period: "/month",
      subtitle: "Best value for regulars",
      features: [
        "Unlimited Zumba classes",
        "Access to all schedules",
        "Monthly fitness report",
        "Priority spot reservation",
        "Invite a friend once/month"
      ],
      variant: "rainbow",
      featured: true
    },
    {
      title: "Family Package",
      price: "₹2499",
      period: "/month",
      subtitle: "Perfect for the whole family",
      features: [
        "Access for up to 4 family members",
        "Unlimited Zumba classes",
        "Family-specific sessions",
        "Personalized family routines"
      ],
      variant: "orange"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-fuchsia-900 to-purple-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full filter blur-3xl opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <SectionHeading
          badge="Flexible Pricing Options"
          badgeVariant="orange"
          title="Choose Your Perfect Plan"
          highlight="Perfect Plan"
          subtitle="Join our vibrant Zumba community with these affordable packages designed for everyone"
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
      </div>
    </section>
  );
};

export default PricingSection;