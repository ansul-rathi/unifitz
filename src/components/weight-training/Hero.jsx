import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Button from '../common/Button';
import GradientHeading from '../common/GradientHeading';

/**
 * Hero section for the Weight Training page
 */
const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 md:pt-36 md:pb-32">
      {/* Decorative background elements */}
      <div className="absolute -top-24 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-full filter blur-3xl opacity-30"></div>
      <div className="absolute top-1/3 -left-24 w-80 h-80 bg-gradient-to-tr from-gray-500 to-slate-500 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full filter blur-3xl opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <motion.div 
            className="md:w-1/2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-6 shadow-lg">
              <span className="text-white font-medium">Build Strength & Power</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <GradientHeading as="span" variant="blue-purple">
                TRANSFORM
              </GradientHeading> 
              <br/> 
              <GradientHeading as="span" variant="yellow-pink">
                YOUR STRENGTH
              </GradientHeading>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xl text-white mb-8 max-w-xl"
            >
              Build muscle, increase strength, and improve your overall fitness with our 
              professional weight training sessions from the comfort of your home. 
              Perfect for all levels, from beginners to advanced lifters.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button 
                to="/weight-training/enroll" 
                variant="primary" 
                size="lg" 
                icon={<ArrowRight />} 
                iconPosition="right"
              >
                Start Your Training
              </Button>
              <Button 
                to="/weight-training/schedule" 
                variant="outline" 
                size="lg"
              >
                View Workouts
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="md:w-1/2 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Main image with colorful border gradient */}
            <div className="relative p-2 rounded-3xl bg-gradient-to-r from-slate-500 via-emerald-500 to-teal-500 shadow-2xl">
              <img 
                src="/weight-training-hero.jpg" 
                alt="Weight Training at Home" 
                className="rounded-2xl w-full object-cover"
                style={{ height: '500px' }}
              />
              
              {/* Floating badges */}
              <motion.div 
                className="absolute -bottom-10 -left-6 bg-white p-4 rounded-2xl shadow-xl text-center"
                initial={{ opacity: 0, x: -20, rotate: 0 }}
                animate={{ opacity: 1, x: 0, rotate: 3 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <p className="text-emerald-900 font-bold text-lg">Results Driven</p>
                <p className="text-emerald-600 text-sm">Track Your Progress</p>
              </motion.div>
              
              <motion.div 
                className="absolute -top-6 -right-6 bg-gradient-to-r from-emerald-500 to-teal-500 p-4 rounded-2xl shadow-xl text-center"
                initial={{ opacity: 0, x: 20, rotate: 0 }}
                animate={{ opacity: 1, x: 0, rotate: -6 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <p className="text-white font-bold text-lg">Free Starter Kit!</p>
                <p className="text-white/90 text-sm">For New Members</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;