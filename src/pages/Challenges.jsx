import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navigation/Header';
import challengeData from '../data/challengeData';

const Challenges = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading the data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-violet-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-bl-[100px] -z-10"></div>
        <div className="absolute -top-24 right-0 w-96 h-96 bg-gradient-to-br from-pink-500 to-purple-400 rounded-full filter blur-3xl opacity-20 -z-10"></div>
        <div className="absolute bottom-0 -left-24 w-80 h-80 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full filter blur-3xl opacity-20 -z-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                <span className="text-pink-300 font-medium mr-2">21-Day Transformation</span>
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                <span className="text-white">21-Minute </span>
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-transparent bg-clip-text">Fitness</span>
                <span className="text-white"> Challenges</span>
              </h1>

              <p className="text-xl text-gray-200 mb-10">
                Transform your body and mind with our expertly crafted 21-day fitness journeys. 
                Just 21 minutes a day for 21 days – simple, effective, and designed for busy people.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Challenge Categories Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 to-indigo-900/50 -z-10"></div>
        
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {challengeData.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  className="group"
                  variants={itemVariants}
                >
                  <Link to={`/challenges/${challenge.id}`} className="block">
                    <div className="relative h-full bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 overflow-hidden transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg">
                      {/* Challenge Thumbnail */}
                      <div className="h-64 overflow-hidden">
                        <img 
                          src={challenge.thumbnail} 
                          alt={challenge.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      </div>
                      
                      {/* Challenge Content */}
                      <div className="p-6">
                        <h3 className="text-2xl font-bold text-white mb-3">{challenge.title}</h3>
                        <p className="text-gray-300 mb-4">{challenge.description}</p>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-pink-300 font-medium">{challenge.videos.length} Days</span>
                          <span className="inline-flex items-center text-white group-hover:text-pink-300 font-medium transition-colors">
                            View Challenge 
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 to-purple-900 -z-10"></div>
        
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <motion.h2 
                className="text-4xl md:text-5xl font-bold mb-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Why Choose Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400">21-Day Challenges</span>
              </motion.h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div 
                className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Just 21 Minutes a Day</h3>
                </div>
                <p className="text-gray-300">
                  Our expertly designed workouts deliver maximum results in minimal time. 
                  Each session is precisely 21 minutes – short enough to fit into your busy day, 
                  long enough to be effective.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Expertly Structured Progression</h3>
                </div>
                <p className="text-gray-300">
                  Each 21-day challenge follows a carefully designed progression, building day by day to ensure 
                  you develop skills, strength, and endurance at the perfect pace.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Family-Friendly Modifications</h3>
                </div>
                <p className="text-gray-300">
                  Every session includes modifications for different fitness levels and age groups,
                  making it easy for the whole family to join in and get active together.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Sustainable Results</h3>
                </div>
                <p className="text-gray-300">
                  Our challenges are designed not just for short-term results, but to help you build healthy habits that last. Each program includes a maintenance plan for continued success.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-700 to-indigo-700 opacity-90 -z-10"></div>
        
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-20 -z-5">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-overlay filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Ready to Start Your <span className="text-yellow-300">21-Day Journey</span>?
              </h2>
              
              <p className="text-xl text-white mb-10 max-w-3xl mx-auto">
                Choose a challenge that speaks to your goals and commit to just 21 minutes a day. In three weeks, you will be amazed at what you can achieve.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-8 py-4 bg-white text-purple-900 font-bold rounded-full hover:bg-white/90 transition-colors"
                >
                  Browse Challenges
                </button>
                
                <Link 
                  to="/about"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-colors"
                >
                  Learn More About UNIFITZ
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
    );
}
export default Challenges;
      