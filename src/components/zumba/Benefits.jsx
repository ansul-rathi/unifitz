/* eslint-disable react/prop-types */
import { motion } from 'framer-motion';
import { Music, Heart, Users } from 'lucide-react';
import SectionHeading from '../common/SectionHeading';

// BenefitCard component for the items
const BenefitCard = ({ icon, title, description, delay = 0 }) => {
  return (
    <motion.div 
      className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all group hover:shadow-2xl"
      whileHover={{ y: -10, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
    >
      <div className="bg-gradient-to-br from-pink-500 to-orange-400 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4 text-white">{title}</h3>
      <p className="text-white/80">{description}</p>
    </motion.div>
  );
};

/**
 * Benefits section highlighting the advantages of Zumba classes
 */
const Benefits = () => {
  // Benefits data
  const benefits = [
    {
      icon: <Music className="h-8 w-8 text-white" />,
      title: "Vibrant Music",
      description: "Dance to the rhythm of Latin and international beats that keep you motivated and energized throughout your fitness journey.",
      colorClass: "from-pink-500 to-orange-400"
    },
    {
      icon: <Heart className="h-8 w-8 text-white" />,
      title: "Total Body Workout",
      description: "Burn calories, improve cardiovascular health, and tone muscles while having fun with our effective Zumba routines.",
      colorClass: "from-purple-500 to-blue-400"
    },
    {
      icon: <Users className="h-8 w-8 text-white" />,
      title: "Family Friendly",
      description: "Sessions designed for all age groups and fitness levels. Join with your family members and make it a fun bonding activity.",
      colorClass: "from-yellow-400 to-orange-500"
    }
  ];

  return (
    <section className="relative py-24 bg-gradient-to-r from-pink-600 to-purple-800 skew-y-3 transform -mt-12">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-600/50 to-purple-800/50 backdrop-blur-md -skew-y-3 transform"></div>
      
      <div className="container mx-auto px-4 relative -skew-y-3 transform">
        <SectionHeading
          badge="Why Choose UNIFITZ Zumba"
          badgeVariant="orange"
          title="Benefits That Make Us Stand Out"
          highlight="Stand Out"
          subtitle="Our Zumba classes are designed to give you the most enjoyable and effective workout experience"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={benefit.title}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;