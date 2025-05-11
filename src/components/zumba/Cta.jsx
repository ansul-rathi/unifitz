import { motion } from 'framer-motion';
import Button from '../common/Button';

/**
 * Call-to-action section to encourage sign-ups
 */
const Cta = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient with animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-700 to-orange-600 opacity-90"></div>
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-400 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
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
            Ready to <span className="text-yellow-300">Dance Your Way</span> to a Healthier You?
          </motion.h2>
          
          <motion.p 
            className="text-xl text-white mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Join our Zumba community today and transform your fitness routine into an exciting dance party that you will actually look forward to!
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Button to="/join" variant="white" size="lg">
              Join Now
            </Button>
            <Button to="/tryclass" variant="outline" size="lg">
              Try a Free Class
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Cta;