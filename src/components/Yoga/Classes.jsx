import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Button from '../common/Button';
import ClassCard from './ClassCard';
import SectionHeading from '../common/SectionHeading';

/**
 * Component for the Yoga classes showcase section
 */
const Classes = () => {
  // Classes data
  const classesData = [
    {
      title: "Gentle Flow",
      level: "Beginner",
      description: "A slow-paced class focused on basic poses, breathing techniques, and relaxation. Perfect for newcomers to yoga.",
      days: "Mon, Wed, Fri",
      time: "8:00 AM - 9:00 AM",
      badgeVariant: "blue"
    },
    {
      title: "Vinyasa Flow",
      level: "Intermediate",
      description: "A dynamic practice that links movement with breath, creating a flowing sequence of poses that builds strength and flexibility.",
      days: "Tue, Thu",
      time: "6:00 PM - 7:15 PM",
      badgeVariant: "purple"
    },
    {
      title: "Family Yoga",
      level: "All Levels",
      description: "A fun, interactive session for the whole family with poses that encourage cooperation, trust, and joy.",
      days: "Saturday",
      time: "10:00 AM - 11:00 AM",
      badgeVariant: "teal"
    },
    {
      title: "Restorative Yoga",
      level: "All Levels",
      description: "A therapeutic style of yoga that uses props to support the body in positions of comfort and ease, promoting deep relaxation.",
      days: "Sunday",
      time: "7:00 PM - 8:15 PM",
      badgeVariant: "indigo"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-indigo-900 to-blue-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-500 to-teal-600 rounded-full filter blur-3xl opacity-20"></div>
      
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
                badge="Our Yoga Classes"
                badgeVariant="blue"
                title="Find Your Perfect Practice"
                highlight="Perfect Practice"
                centered={false}
              />
              
              <p className="text-white/80 mb-8">
                Our classes cater to all levels and intentions, from gentle, meditative sessions to 
                more vigorous, strength-building practices. Find the perfect match for your body, 
                mind, and schedule.
              </p>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mr-4">
                    <span className="text-white font-bold">10+</span>
                  </div>
                  <p className="text-white">Unique class styles to explore</p>
                </div>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center mr-4">
                    <span className="text-white font-bold">5+</span>
                  </div>
                  <p className="text-white">Certified yoga instructors</p>
                </div>
              </div>
              
              <Button 
                to="/yoga/all-classes" 
                variant="secondary" 
                size="lg" 
                icon={<ArrowRight />}
                iconPosition="right"
              >
                View All Classes
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
            
            <div className="p-6 rounded-3xl border border-white/20 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 backdrop-blur-sm">
              <p className="text-white text-center font-medium">
                Cant find what you are looking for? <span className="text-blue-300">Request a class style</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Classes;