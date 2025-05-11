import { motion } from 'framer-motion';
import { Dumbbell, Heart, Trophy, User } from 'lucide-react';
import SectionHeading from '../common/SectionHeading';
import PropTypes from 'prop-types';

// At the bottom of the file, add:
BenefitCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  delay: PropTypes.number,
  colorClass: PropTypes.string
};

// Optional: Add default props
BenefitCard.defaultProps = {
  delay: 0,
  colorClass: ''
};
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
 * Benefits section highlighting the advantages of weight training classes
 */
const Benefits = () => {
  // Benefits data
  const benefits = [
    {
      icon: <Dumbbell className="h-8 w-8 text-white" />,
      title: "Build Real Strength",
      description: "Develop functional strength that translates to daily activities while building lean muscle mass and improving your physique.",
      colorClass: "from-emerald-500 to-teal-400"
    },
    {
      icon: <Heart className="h-8 w-8 text-white" />,
      title: "Boost Metabolism",
      description: "Increase your resting metabolic rate, burn more calories throughout the day, and improve your body composition.",
      colorClass: "from-slate-500 to-slate-400"
    },
    {
      icon: <Trophy className="h-8 w-8 text-white" />,
      title: "Structured Programs",
      description: "Follow progressive, science-based training programs designed to maximize results while minimizing risk of injury.",
      colorClass: "from-teal-500 to-emerald-400"
    },
    {
      icon: <User className="h-8 w-8 text-white" />,
      title: "Expert Guidance",
      description: "Learn proper form and technique from certified trainers who will modify exercises for your specific needs and equipment.",
      colorClass: "from-gray-500 to-slate-400"
    }
  ];

  return (
    <section className="relative py-24 bg-gradient-to-r from-slate-800 to-emerald-800 skew-y-3 transform -mt-12">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-800/50 to-emerald-800/50 backdrop-blur-md -skew-y-3 transform"></div>
      
      <div className="container mx-auto px-4 relative -skew-y-3 transform">
        <SectionHeading
          badge="Why Choose UNIFITZ Weight Training"
          badgeVariant="teal"
          title="Benefits That Build More Than Muscle"
          highlight="More Than Muscle"
          subtitle="Our weight training programs deliver comprehensive benefits for your physical and mental wellbeing"
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