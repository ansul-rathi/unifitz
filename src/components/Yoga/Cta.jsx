import { motion } from 'framer-motion';
import Button from '../common/Button';

/**
 * Call-to-action section to encourage yoga class sign-ups
 */
const Cta = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient with animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-blue-700 to-teal-600 opacity-90"></div>
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-4xl md:text-6xl font-bold mb-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Begin Your <span className="text-teal-300">Yoga Journey</span> Today
          </motion.h2>
          
          <motion.p 
            className="text-xl text-white mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Transform your mind, body, and spirit with our guided yoga sessions. Join our supportive 
            community and experience the benefits of consistent practice from the comfort of your home.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Button to="/yoga/enroll" variant="white" size="lg">
              Start Your Practice
            </Button>
            <Button to="/yoga/trial" variant="outline" size="lg">
              Try a Free Class
            </Button>
          </motion.div>
          
          <motion.div
            className="mt-16 flex flex-col md:flex-row items-center justify-center gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center">
              <img 
                src="/instructor-1.jpg" 
                alt="Yoga Instructor" 
                className="w-12 h-12 rounded-full border-2 border-white -mr-3"
              />
              <img 
                src="/instructor-2.jpg" 
                alt="Yoga Instructor" 
                className="w-12 h-12 rounded-full border-2 border-white -mr-3"
              />
              <img 
                src="/instructor-3.jpg" 
                alt="Yoga Instructor" 
                className="w-12 h-12 rounded-full border-2 border-white"
              />
              <span className="ml-4 text-white">Learn from certified yoga instructors</span>
            </div>
            
            <div className="flex items-center">
              <svg className="h-6 w-6 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white">30-day money-back guarantee</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Cta;