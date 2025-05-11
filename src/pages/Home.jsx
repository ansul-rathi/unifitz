import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Users, ChevronRight, CheckCircle2, Heart, Dumbbell, Music } from 'lucide-react';
import Navbar from '../components/Navigation/Header';
import Button from '../components/common/Button';
import Footer from '../components/Footer/Footer';

// Import reusable components

const Home = () => {
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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

  // Program cards data
  const programCards = [
    {
      title: "Zumba",
      icon: <Music className="h-8 w-8 text-white" />,
      description: "High-energy dance workouts that burn calories while having fun with Latin rhythms.",
      color: "from-pink-500 to-orange-500",
      image: "/zumba-card.jpg",
      path: "/zumba"
    },
    {
      title: "Yoga",
      icon: <Heart className="h-8 w-8 text-white" />,
      description: "Find balance and flexibility with mindful practice guided by our expert instructors.",
      color: "from-purple-500 to-blue-500",
      image: "/yoga-card.jpg",
      path: "/yoga"
    },
    {
      title: "Weight Training",
      icon: <Dumbbell className="h-8 w-8 text-white" />,
      description: "Build strength and tone your body with our structured weight training programs.",
      color: "from-emerald-500 to-teal-500",
      image: "/weight-card.jpg",
      path: "/weight-training"
    }
  ];

  // Benefits data
  const benefits = [
    { 
      title: "Train as a family", 
      description: "Our programs are designed for all ages and fitness levels, so the whole family can join."
    },
    { 
      title: "Expert instructors", 
      description: "Learn from certified professionals who are passionate about helping you reach your goals." 
    },
    { 
      title: "Flexible scheduling", 
      description: "Access classes anytime, anywhere – fitting perfectly into your busy lifestyle." 
    },
    { 
      title: "Personalized approach", 
      description: "Workouts designed for all fitness levels with modifications to match your needs." 
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Working Mom",
      quote: "UNIFITZ has transformed our family routine! My kids love the energy of Zumba, while I prefer yoga. We've all become more active together.",
      image: "/avatar-1.jpg"
    },
    {
      name: "Vikram Mehta",
      role: "IT Professional",
      quote: "The flexibility of online classes means I can fit weight training into my schedule no matter how busy work gets. The results speak for themselves!",
      image: "/avatar-2.jpg"
    }
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-indigo-900 via-purple-900 to-violet-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-bl-[100px] -z-10"></div>
        <div className="absolute -top-24 right-0 w-96 h-96 bg-gradient-to-br from-pink-500 to-orange-400 rounded-full filter blur-3xl opacity-20 -z-10"></div>
        <div className="absolute top-1/3 -left-24 w-80 h-80 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full filter blur-3xl opacity-20 -z-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                <span className="text-pink-300 font-medium mr-2">Online Family Fitness</span>
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                <span className="block text-white">Where </span>
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-transparent bg-clip-text">Strength</span>
                <span className="block text-white">Meets </span>
                <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 text-transparent bg-clip-text">Style</span>
              </h1>

              <p className="text-xl text-gray-200 mb-8 max-w-xl">
                Transform your fitness journey with your entire family at UNIFITZ. Experience premium fitness training from the comfort of your home.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  to="/join" 
                  variant="primary" 
                  size="lg" 
                  icon={<ArrowRight />}
                  iconPosition="right"
                >
                  Start Your Journey
                </Button>
                
                <div className="flex items-center cursor-pointer group">
                  <div className="flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full mr-4 group-hover:bg-white/20 transition-all">
                    <Play className="h-5 w-5 text-white fill-white" />
                  </div>
                  <span className="text-white font-medium group-hover:text-pink-300 transition-colors">
                    Watch how it works
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="lg:w-1/2 relative mt-12 lg:mt-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                {/* Main image with gradient border */}
                <div className="relative p-2 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 shadow-2xl">
                  <img 
                    src="/hero-image.jpg" 
                    alt="Family working out together" 
                    className="rounded-2xl w-full object-cover"
                    style={{ height: '550px' }}
                  />
                </div>
                
                {/* Floating badges */}
                <motion.div 
                  className="absolute -bottom-8 -left-8 bg-white rounded-2xl shadow-xl p-4 flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <div className="rounded-full bg-pink-100 p-3 mr-3">
                    <Users className="h-6 w-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Active Members</p>
                    <p className="text-gray-900 font-bold">2,500+</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="absolute -top-6 -right-6 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl shadow-xl p-4 text-white"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  <p className="font-bold">30% OFF</p>
                  <p className="text-sm">First Month</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Program Cards Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 to-indigo-900/50 -z-10"></div>
        
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Discover Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Premium Programs</span>
            </motion.h2>
            
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Choose from our carefully designed fitness programs that cater to all fitness levels and preferences
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {programCards.map((program, index) => (
              <motion.div 
                key={program.title}
                className="relative group overflow-hidden rounded-3xl"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                {/* Card Background Image */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={program.image} 
                    alt={program.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/30"></div>
                </div>
                
                {/* Card Content */}
                <div className="relative z-10 p-8 flex flex-col h-full min-h-[450px]">
                  <div className={`bg-gradient-to-br ${program.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}>
                    {program.icon}
                  </div>
                  
                  <h3 className="text-3xl font-bold text-white mb-4">{program.title}</h3>
                  <p className="text-gray-300 mb-8">{program.description}</p>
                  
                  <div className="mt-auto">
                    <Link 
                      to={program.path}
                      className="flex items-center text-white group-hover:text-pink-300 transition-colors font-medium"
                    >
                      Learn More <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Family Focus Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-indigo-900 -z-10"></div>
        {/* Decorative circles */}
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full filter blur-3xl opacity-20 -z-5"></div>
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full filter blur-3xl opacity-20 -z-5"></div>
        
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              className="lg:w-1/2 relative"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="grid grid-cols-2 gap-4 relative">
                <img 
                  src="/family-1.jpg" 
                  alt="Family yoga" 
                  className="rounded-2xl shadow-xl w-full h-64 object-cover"
                />
                <img 
                  src="/family-2.jpg" 
                  alt="Kids exercising" 
                  className="rounded-2xl shadow-xl w-full h-64 object-cover translate-y-8"
                />
                <img 
                  src="/family-3.jpg" 
                  alt="Parents and children" 
                  className="rounded-2xl shadow-xl w-full h-64 object-cover -translate-y-8"
                />
                <img 
                  src="/family-4.jpg" 
                  alt="Family fitness" 
                  className="rounded-2xl shadow-xl w-full h-64 object-cover"
                />
                
                {/* Stats overlay */}
                <div className="absolute -bottom-8 -right-8 bg-white rounded-2xl shadow-xl p-5 text-center">
                  <p className="text-indigo-900 font-bold text-4xl">98%</p>
                  <p className="text-gray-600 text-sm">Satisfaction Rate</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-8">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                  Fitness for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Whole Family</span>
                </h2>
                <p className="text-xl text-gray-300 mb-6">
                  At UNIFITZ, we believe fitness should be fun and accessible for everyone, regardless of age or ability. Our family-focused approach lets you:
                </p>
              </div>
              
              <motion.div 
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {benefits.map((benefit, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-start"
                    variants={itemVariants}
                  >
                    <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg p-2 mr-4 mt-1">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                      <p className="text-gray-300">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 to-purple-900 -z-10"></div>
        
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400">Members Say</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Hear from families who have transformed their fitness journey with UNIFITZ
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={testimonial.name}
                className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="flex items-start">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-16 h-16 rounded-full object-cover mr-5 border-2 border-pink-500"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-white">{testimonial.name}</h3>
                    <p className="text-pink-300">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <svg className="h-8 w-8 text-pink-400 mb-4 opacity-50" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M10 8c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S15.5 8 10 8zm0 16c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6zm12-16c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S27.5 8 22 8zm0 16c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"></path>
                  </svg>
                  <p className="text-lg text-gray-200">{testimonial.quote}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Button 
              to="/testimonials" 
              variant="outline" 
              size="lg"
            >
              Read More Success Stories
            </Button>
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
                Ready to Transform Your <span className="text-yellow-300">Familys Fitness</span> Journey?
              </h2>
              
              <p className="text-xl text-white mb-10 max-w-3xl mx-auto">
                Join thousands of families who are getting fitter, healthier, and happier together with UNIFITZ is a premium online fitness programs.
              </p>
              
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="flex items-center">
                    <div className="rounded-full bg-pink-500/20 p-3 mr-3">
                      <CheckCircle2 className="h-6 w-6 text-pink-400" />
                    </div>
                    <span className="text-white">No long-term contracts</span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="rounded-full bg-purple-500/20 p-3 mr-3">
                      <CheckCircle2 className="h-6 w-6 text-purple-400" />
                    </div>
                    <span className="text-white">30-day money back guarantee</span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="rounded-full bg-blue-500/20 p-3 mr-3">
                      <CheckCircle2 className="h-6 w-6 text-blue-400" />
                    </div>
                    <span className="text-white">Cancel anytime, hassle-free</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button 
                  to="/plans" 
                  variant="white" 
                  size="lg"
                >
                  View Our Plans
                </Button>
                
                <Button 
                  to="/start" 
                  variant="primary" 
                  size="lg" 
                  icon={<ArrowRight />} 
                  iconPosition="right"
                >
                  Start Your Journey Now
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;