import { motion } from 'framer-motion';
import { Users, Heart, Award, Clock, Target, CheckCircle2, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navigation/Header';
import Button from '../components/common/Button';

const AboutUs = () => {
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

  // Team members data
  const teamMembers = [
    {
      name: "Ansul Rathi",
      role: "Founder & CEO",
      bio: "Certified Zumba and dance fitness instructor with over 5 years of experience, Ansul created UNIFITZ to revolutionize how families approach fitness together.",
      image: "/team-1.jpg"
    },
    {
      name: "Rohan Verma",
      role: "Head of Yoga Programs",
      bio: "A dedicated yoga practitioner for 15 years, Rohan brings traditional techniques and mindfulness practices to families across India.",
      image: "/team-2.jpg"
    },
    {
      name: "Prachi Sharma",
      role: "Fitness Director",
      bio: "Former national athlete and weight training specialist, Prachi develops programs that are both challenging and accessible for all family members.",
      image: "/team-3.jpg"
    }
  ];

  // Core values data
  const coreValues = [
    {
      title: "21-Minute Daily Focus",
      description: "All our classes are designed to deliver maximum benefits in just 21 minutes—perfect for busy professionals.",
      icon: <Clock className="h-6 w-6 text-pink-400" />
    },
    {
      title: "Family-Centered Approach",
      description: "We believe fitness should bring families together, with workouts designed for all ages and ability levels.",
      icon: <Users className="h-6 w-6 text-purple-400" />
    },
    {
      title: "Holistic Wellness",
      description: "Beyond physical fitness, we emphasize mental wellbeing, nutrition, and creating sustainable healthy habits.",
      icon: <Heart className="h-6 w-6 text-blue-400" />
    },
    {
      title: "Accessibility & Inclusion",
      description: "Our programs are designed to be accessible from home with minimal equipment, breaking down barriers to fitness.",
      icon: <Target className="h-6 w-6 text-orange-400" />
    }
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-indigo-900 via-purple-900 to-violet-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full md:w-1/2 h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-br-[100px] -z-10"></div>
        <div className="absolute -top-24 left-0 w-96 h-96 bg-gradient-to-br from-purple-500 to-blue-400 rounded-full filter blur-3xl opacity-20 -z-10"></div>
        <div className="absolute top-1/3 -right-24 w-80 h-80 bg-gradient-to-tr from-pink-500 to-orange-500 rounded-full filter blur-3xl opacity-20 -z-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                <span className="text-pink-300 font-medium">Our Story</span>
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse ml-2"></span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8">
                <span className="block text-white">Welcome to </span>
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-transparent bg-clip-text">UNIFITZ</span>
              </h1>

              <p className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto">
                Your daily dose of wellness, made simple, energizing, and absolutely doable.
                We believe in the power of <span className="text-pink-300 font-medium">just 21 minutes a day</span>, from the comfort of your home.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 to-indigo-900/50 -z-10"></div>
        
        <div className="container mx-auto px-4">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">
                Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Mission</span>
              </h2>
              
              <p className="text-xl text-gray-300 mb-6">
                We know how hard it is to stay consistent when you are juggling a full-time job, long hours, and family responsibilities. Thats why we created a smarter way to stay fit.
              </p>
              
              <p className="text-xl text-gray-300 mb-6">
                Founded by a certified Zumba and dance fitness instructor (and full-time professional!), UNIFITZ is built for busy families who want to feel healthier, move better, and build routines that actually stick.
              </p>
              
              <p className="text-xl text-gray-300 mb-8">
                No overwhelming 60-minute workouts. No gym guilt. Just real, joyful movement that brings the whole family together — every day.
              </p>
              
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-pink-400 mr-3" />
                  <span className="text-white font-medium">Premium Quality</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-purple-400 mr-3" />
                  <span className="text-white font-medium">21-Min Sessions</span>
                </div>
                
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-400 mr-3" />
                  <span className="text-white font-medium">Family Focused</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="lg:w-1/2 relative mb-12 lg:mb-0"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                {/* Main image with gradient border */}
                <div className="relative p-2 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-2xl">
                  <img 
                    src="/mission-image.jpg" 
                    alt="Family working out together at home" 
                    className="rounded-2xl w-full h-full object-cover"
                    style={{ height: '500px' }}
                  />
                </div>
                
                {/* Floating badges */}
                <motion.div 
                  className="absolute -bottom-8 -right-8 bg-white rounded-2xl shadow-xl p-4 flex items-center"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <div className="rounded-full bg-purple-100 p-3 mr-3">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Just</p>
                    <p className="text-gray-900 font-bold">21 Minutes Daily</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 -z-10"></div>
        {/* Decorative circles */}
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full filter blur-3xl opacity-20 -z-5"></div>
        <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full filter blur-3xl opacity-20 -z-5"></div>
        
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              What We <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400">Offer</span>
            </motion.h2>
            
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              We bring you a powerful mix of programs designed for the whole family
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-gradient-to-br from-pink-500 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">Live Daily Sessions</h3>
              <p className="text-gray-300 mb-6">
                Join our energetic instructors for live Zoom classes that keep you motivated and accountable. Perfect for establishing a consistent routine.
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-pink-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Morning, afternoon and evening slots</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-pink-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Interactive sessions with real-time feedback</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-pink-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Community support and accountability</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">On-Demand Library</h3>
              <p className="text-gray-300 mb-6">
                Access our growing collection of pre-recorded workouts anytime, anywhere. Perfect for fitting fitness into your busy schedule.
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-blue-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Hundreds of 21-minute sessions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-blue-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Filter by workout type, intensity, and focus area</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-blue-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">New content added weekly</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-gradient-to-br from-orange-500 to-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">Diverse Programs</h3>
              <p className="text-gray-300 mb-6">
                Choose from a variety of fitness styles to keep your routine fresh and engaging for everyone in the family.
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-orange-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Dance Fitness & Zumba</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-orange-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Yoga & Meditation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-orange-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Weight Training & Pilates</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-orange-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Nutrition & Lifestyle Coaching (Coming Soon)</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="bg-gradient-to-br from-green-500 to-teal-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">Personalized Approach</h3>
              <p className="text-gray-300 mb-6">
                Our programs meet you where you are, with options for every fitness level and age group.
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Beginner, intermediate, and advanced options</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Kid-friendly modifications</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Low-impact alternatives for all exercises</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Progress tracking and personalized recommendations</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900 to-indigo-900 -z-10"></div>
        
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">
                Our Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Values</span>
              </h2>
              
              <p className="text-xl text-gray-300 mb-10">
                At UNIFITZ, we are on a mission to make health and fitness efficient, fun, and holistic for the whole family.
              </p>
              
              <motion.div 
                className="space-y-8"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {coreValues.map((value, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-start"
                    variants={itemVariants}
                  >
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mr-6 flex-shrink-0">
                      {value.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{value.title}</h3>
                      <p className="text-gray-300">{value.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="lg:w-1/2 relative mt-12 lg:mt-0"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-7">
                  <div className="rounded-3xl bg-gradient-to-r from-pink-500 to-purple-500 p-1.5 shadow-xl h-full">
                    <img 
                      src="/values-1.jpg" 
                      alt="Family doing yoga together" 
                      className="rounded-2xl w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="col-span-5">
                  <div className="rounded-3xl bg-gradient-to-r from-blue-500 to-indigo-500 p-1.5 shadow-xl h-full">
                    <img 
                      src="/values-2.jpg" 
                      alt="Mother and daughter exercising" 
                      className="rounded-2xl w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="col-span-5">
                  <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-red-500 p-1.5 shadow-xl h-full">
                    <img 
                      src="/values-3.jpg" 
                      alt="Family fitness fun" 
                      className="rounded-2xl w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="col-span-7">
                  <div className="rounded-3xl bg-gradient-to-r from-green-500 to-teal-500 p-1.5 shadow-xl h-full">
                    <img 
                      src="/values-4.jpg" 
                      alt="Parents and kids stretching" 
                      className="rounded-2xl w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-900 -z-10"></div>
        
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400">Team</span>
            </motion.h2>
            
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              The passionate experts behind UNIFITZ who are dedicated to transforming your familys fitness journey
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={member.name}
                className="bg-white/10 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/20"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="relative h-80">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 w-full p-6">
                    <h3 className="text-2xl font-bold text-white">{member.name}</h3>
                    <p className="text-pink-300">{member.role}</p>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-300">{member.bio}</p>
                </div>
              </motion.div>
            ))}
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
                Join Our <span className="text-yellow-300">Fitness Family</span> Today
              </h2>
              
              <p className="text-xl text-white mb-10 max-w-3xl mx-auto">
                Start your 21-minute daily wellness journey and experience the transformation that thousands of families are already enjoying with UNIFITZ.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button 
                  to="/plans" 
                  variant="white" 
                  size="lg"
                >
                  View Our Plans
                </Button>
                
                <Button 
                  to="/enroll" 
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

    </div>
  );
};

export default AboutUs;