import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Button from '../common/Button';
import ClassCard from './ClassCard';
import SectionHeading from '../common/SectionHeading';

/**
 * Component for the Weight Training classes showcase section
 */
const Classes = () => {
  // Classes data
  const classesData = [
    {
      title: "Foundations of Strength",
      level: "Beginner",
      description: "Master proper form and technique with bodyweight and light resistance exercises. Perfect for those new to weight training.",
      days: "Mon, Wed, Fri",
      time: "8:00 AM - 9:00 AM",
      badgeVariant: "emerald"
    },
    {
      title: "Progressive Overload",
      level: "Intermediate",
      description: "Take your strength to the next level with structured programs focused on building muscle and increasing performance.",
      days: "Tue, Thu",
      time: "6:00 PM - 7:15 PM",
      badgeVariant: "slate"
    },
    {
      title: "Family Strength",
      level: "All Levels",
      description: "A fun, interactive strength session designed for the whole family with exercises that can be modified for all ages.",
      days: "Saturday",
      time: "10:00 AM - 11:00 AM",
      badgeVariant: "teal"
    },
    {
      title: "Advanced Training",
      level: "Advanced",
      description: "Complex movements and periodized training for experienced lifters looking to break through plateaus and maximize gains.",
      days: "Mon, Wed, Fri",
      time: "7:00 PM - 8:15 PM",
      badgeVariant: "gray"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-emerald-900 to-slate-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-gradient-to-br from-slate-500 to-gray-600 rounded-full filter blur-3xl opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-start justify-between gap-16">
          <motion.div 
            className="md:w-1/2 lg:w-2/5"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="mb-8 sticky top-24">
              <SectionHeading
                badge="Our Training Programs"
                badgeVariant="teal"
                title="Find Your Perfect Training Program"
                highlight="Perfect Training"
                centered={false}
              />
              
              <p className="text-white/80 mb-8">
                Whether you are just starting out or looking to push your limits, our 
                structured weight training programs are designed to help you reach your 
                goals efficiently and safely, all from the comfort of your home.
              </p>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mr-4">
                    <span className="text-white font-bold">15+</span>
                  </div>
                  <p className="text-white">Training programs for all levels</p>
                </div>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-slate-500 to-gray-500 flex items-center justify-center mr-4">
                    <span className="text-white font-bold">4+</span>
                  </div>
                  <p className="text-white">Certified strength coaches</p>
                </div>
              </div>
              
              <Button 
                to="/weight-training/all-classes" 
                variant="primary" 
                size="lg" 
                icon={<ArrowRight />}
                iconPosition="right"
              >
                View All Programs
              </Button>
            </div>
          </motion.div>
          
          <motion.div 
            className="md:w-1/2 lg:w-3/5 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            {classesData.map((classItem, index) => (
              <ClassCard
                key={classItem.title}
                title={classItem.title}
                level={classItem.level}
                description={classItem.description}
                days={classItem.days}
                time={classItem.time}
                badgeVariant={classItem.badgeVariant}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              />
            ))}
            
            <div className="p-6 rounded-3xl border border-white/20 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-white text-center md:text-left mb-4 md:mb-0">
                  Not sure which program is right for you?
                </p>
                <Button 
                  to="/weight-training/assessment" 
                  variant="white" 
                  size="sm"
                >
                  Take the Fitness Assessment
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Classes;