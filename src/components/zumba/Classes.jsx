import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Button from '../common/Button';
import ClassCard from './ClassCard';
import SectionHeading from '../common/SectionHeading';

/**
 * Component for the Zumba classes showcase section
 */
const Classes = () => {
  // Classes data
  const classesData = [
    {
      title: "Zumba Fiesta",
      level: "Beginners",
      description: "Feel the rhythm with easy-to-follow moves perfect for newcomers. High energy, low impact, maximum fun!",
      days: "Mon, Wed, Fri",
      time: "9:00 AM - 10:00 AM",
      badgeVariant: "pink"
    },
    {
      title: "Zumba Intensity",
      level: "Intermediate",
      description: "Step up your Zumba game with more complex choreography and higher intensity workouts for serious calorie burning.",
      days: "Tue, Thu",
      time: "6:00 PM - 7:15 PM",
      badgeVariant: "purple"
    },
    {
      title: "Family Zumba Party",
      level: "All Levels",
      description: "A fun-filled session for the whole family. Dance together and create lasting memories with special routines for all ages.",
      days: "Saturday",
      time: "11:00 AM - 12:15 PM",
      badgeVariant: "yellow"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-purple-800 to-fuchsia-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full filter blur-3xl opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-16">
          <motion.div 
            className="md:w-1/2"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="mb-8">
              <SectionHeading
                badge="Our Exciting Classes"
                badgeVariant="orange"
                title="Choose the Perfect Vibe for Your Energy"
                highlight="Perfect Vibe"
                centered={false}
              />
            </div>
            
            <div className="space-y-6">
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
            </div>
            
            <div className="mt-10">
              <Button 
                to="/zumba/all-classes" 
                variant="primary" 
                size="lg" 
                icon={<ArrowRight />}
                iconPosition="right"
              >
                View All Classes
              </Button>
            </div>
          </motion.div>
          
          <motion.div 
            className="md:w-1/2 grid grid-cols-2 gap-4"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="space-y-4">
              <motion.div 
                className="overflow-hidden rounded-3xl shadow-2xl border-4 border-pink-500/50"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <img 
                  src="/zumba-class-1.jpg" 
                  alt="Zumba Class" 
                  className="w-full h-56 object-cover transform hover:scale-110 transition-all duration-700" 
                />
              </motion.div>
              <motion.div 
                className="overflow-hidden rounded-3xl shadow-2xl border-4 border-yellow-400/50 transform translate-x-8"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <img 
                  src="/zumba-class-3.jpg" 
                  alt="Zumba Class" 
                  className="w-full h-72 object-cover transform hover:scale-110 transition-all duration-700" 
                />
              </motion.div>
            </div>
            <div className="space-y-4 mt-8">
              <motion.div 
                className="overflow-hidden rounded-3xl shadow-2xl border-4 border-purple-500/50"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <img 
                  src="/zumba-class-2.jpg" 
                  alt="Zumba Class" 
                  className="w-full h-72 object-cover transform hover:scale-110 transition-all duration-700" 
                />
              </motion.div>
              <motion.div 
                className="overflow-hidden rounded-3xl shadow-2xl border-4 border-orange-500/50 transform -translate-x-8"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <img 
                  src="/zumba-class-4.jpg" 
                  alt="Zumba Class" 
                  className="w-full h-56 object-cover transform hover:scale-110 transition-all duration-700" 
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Classes;