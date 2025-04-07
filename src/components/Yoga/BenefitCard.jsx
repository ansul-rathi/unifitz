/* eslint-disable react/prop-types */
import { motion } from 'framer-motion';
import { Heart, Brain, Clock, Users } from 'lucide-react';
import SectionHeading from '../common/SectionHeading';

// BenefitCard component for the items
const BenefitCard = ({ icon, title, description, delay = 0, colorClass }) => {
  return (
    <motion.div 
      className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all group hover:shadow-2xl"
      whileHover={{ y: -10, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
    >
      <div className={`bg-gradient-to-br ${colorClass} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4 text-white">{title}</h3>
      <p className="text-white/80">{description}</p>
    </motion.div>
  );
};

/**
 * Benefits section highlighting the advantages of yoga classes
 */
const Benefits = () => {
  // Benefits data
  const benefits = [
    {
      icon: <Heart className="h-8 w-8 text-white" />,
      title: "Physical Wellness",
      description: "Improve flexibility, strength, and balance while enhancing your overall physical health and vitality.",
      colorClass: "from-indigo-500 to-blue-400"
    },
    {
      icon: <Brain className="h-8 w-8 text-white" />,
      title: "Mental Clarity",
      description: "Reduce stress, anxiety and find mental clarity through mindful practices and guided meditation.",
      colorClass: "from-purple-500 to-indigo-400"
    },
    {
      icon: <Clock className="h-8 w-8 text-white" />,
      title: "Flexible Schedule",
      description: "Practice at your own pace with both live and recorded sessions designed to fit your busy lifestyle.",
      colorClass: "from-blue-500 to-teal-400"
    },
    {
      icon: <Users className="h-8 w-8 text-white" />,
      title: "Family Connection",
      description: "Special classes designed for families to practice together, bringing mindfulness to all ages and abilities.",
      colorClass: "from-violet-500 to-purple-400"
    }
  ];

  return (
    <section className="relative py-24 bg-gradient-to-r from-indigo-800 to-purple-800 skew-y-3 transform -mt-12">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-800/50 to-purple-800/50 backdrop-blur-md -skew-y-3 transform"></div>
      
      <div className="container mx-auto px-4 relative -skew-y-3 transform">
        <SectionHeading
          badge="Why Choose UNIFITZ Yoga"
          badgeVariant="purple"
          title="Benefits For Mind & Body"
          highlight="Mind & Body"
          subtitle="Our yoga classes are designed to harmonize your physical, mental, and spiritual wellbeing"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={benefit.title}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
              delay={index * 0.1}
              colorClass={benefit.colorClass}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;