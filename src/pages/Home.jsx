/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Users, ChevronRight, CheckCircle2, Heart, Dumbbell, Target, Flame, Zap, Play, Star, Sparkles, Rocket, Shield, Globe } from 'lucide-react';

const Home = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -50]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Enhanced Button Component
  const FuturisticButton = ({ children, variant = 'primary', size = 'md', to, icon, iconPosition = 'left', className = '', ...props }) => {
    const baseClasses = "relative overflow-hidden group transition-all duration-300 transform hover:scale-105 font-bold rounded-2xl flex items-center justify-center gap-3 backdrop-blur-lg border";
    
    const variants = {
      primary: "bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white border-white/20 shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_50px_rgba(59,130,246,0.8)]",
      secondary: "bg-white/10 text-white border-white/30 hover:bg-white/20 shadow-[0_0_20px_rgba(255,255,255,0.2)]",
      outline: "bg-transparent text-white border-white/50 hover:bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.3)]",
      glow: "bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white border-transparent shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:shadow-[0_0_60px_rgba(168,85,247,0.9)]"
    };
    
    const sizes = {
      sm: "px-6 py-3 text-sm",
      md: "px-8 py-4 text-base",
      lg: "px-10 py-5 text-lg",
      xl: "px-12 py-6 text-xl"
    };

    return (
      <motion.button
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        {...props}
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        
        {/* Content */}
        <div className="relative flex items-center gap-3">
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </div>
      </motion.button>
    );
  };

  // Enhanced Program Cards
  const programCards = [
    {
      title: "Ultimate Fitness Program",
      tagline: "Your All-in-One Path to a Healthier, Fitter You",
      icon: <Target className="h-8 w-8" />,
      description: "A balanced fitness journey combining strength, cardio, flexibility, and nutrition. Designed for beginners to intermediate.",
      features: [
        "5-day/week workout plan",
        "Full-body strength & endurance training",
        "Guided warm-up & mobility routines",
        "Meal guidance & lifestyle habits",
        "Weekly challenges & progress tracking"
      ],
      bestFor: "Beginners, busy professionals, anyone seeking consistent long-term fitness",
      ctaText: "Start Your Journey",
      gradient: "from-cyan-400 via-blue-500 to-purple-600",
      glowColor: "cyan",
      path: "/ultimate-fitness"
    },
    {
      title: "Master Weight Loss Program",
      tagline: "Burn Fat, Boost Energy, and Feel Confident Again",
      icon: <Flame className="h-8 w-8" />,
      description: "A science-based fat loss program focused on sustainable calorie burn, metabolism-boosting workouts, and nutrition coaching.",
      features: [
        "4-6 cardio + strength hybrid workouts/week",
        "Daily step + hydration goals",
        "Custom low-calorie meal plans",
        "Weekly accountability check-ins",
        "Fat-burn focused training (HIIT, Tabata, Circuits)"
      ],
      bestFor: "Anyone struggling with weight loss, post-pregnancy moms, office goers",
      ctaText: "Join Fat Loss Mission",
      gradient: "from-orange-400 via-red-500 to-pink-600",
      glowColor: "red",
      path: "/weight-loss"
    },
    {
      title: "Muscle Building Program",
      tagline: "Build Lean Muscle and Sculpt a Stronger Physique",
      icon: <Dumbbell className="h-8 w-8" />,
      description: "Targeted resistance training plan built for hypertrophy and strength development with proper recovery and nutrition.",
      features: [
        "5-6 structured gym workouts/week",
        "Push-Pull-Legs or Upper-Lower split",
        "Advanced strength protocols & tracking",
        "Supplement guidance + high-protein meal support",
        "Monthly strength test & muscle growth assessment"
      ],
      bestFor: "Men & women looking to gain lean muscle, strength athletes, gym lovers",
      ctaText: "Build Muscle Now",
      gradient: "from-emerald-400 via-teal-500 to-cyan-600",
      glowColor: "emerald",
      path: "/muscle-building"
    }
  ];

  const benefits = [
    { 
      title: "Train as a family", 
      description: "Our programs are designed for all ages and fitness levels, so the whole family can join.",
      icon: <Users className="h-6 w-6" />
    },
    { 
      title: "Expert instructors", 
      description: "Learn from certified professionals who are passionate about helping you reach your goals.",
      icon: <Star className="h-6 w-6" />
    },
    { 
      title: "Flexible scheduling", 
      description: "Access classes anytime, anywhere – fitting perfectly into your busy lifestyle.",
      icon: <Globe className="h-6 w-6" />
    },
    { 
      title: "Personalized approach", 
      description: "Workouts designed for all fitness levels with modifications to match your needs.",
      icon: <Target className="h-6 w-6" />
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Working Mom",
      quote: "UNIFITZ has transformed our family routine! My kids love the energy of our workouts, while I prefer the structured programs.",
      rating: 5,
      image: "/avatar-1.jpg"
    },
    {
      name: "Vikram Mehta",
      role: "IT Professional",
      quote: "The Ultimate Fitness Program changed my life! The flexibility of online classes means I can fit training into my schedule.",
      rating: 5,
      image: "/avatar-2.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(168,85,247,0.1)_60deg,transparent_120deg)]"></div>
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20 overflow-hidden">
        {/* Hero background effects */}
        <motion.div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59,130,246,0.3) 0%, transparent 50%)`,
          }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left Content */}
            <motion.div 
              className="lg:w-1/2 text-center lg:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <motion.div 
                className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-lg rounded-full mb-8 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles className="w-5 h-5 text-cyan-400 mr-2" />
                <span className="text-cyan-300 font-medium">Next-Gen Family Fitness</span>
                <div className="w-2 h-2 bg-cyan-400 rounded-full ml-2 animate-pulse"></div>
              </motion.div>

              {/* Main Heading */}
              <motion.h1 
                className="text-6xl md:text-8xl font-black leading-none mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
                  Where
                </span>
                <span className="block text-white">
                  Future
                </span>
                <span className="block bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400 text-transparent bg-clip-text">
                  Meets
                </span>
                <span className="block text-white">
                  Fitness
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p 
                className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Experience revolutionary fitness training powered by cutting-edge technology. 
                <span className="text-cyan-400"> Transform your family's health</span> in the digital age.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <FuturisticButton variant="glow" size="xl" icon={<Rocket className="w-6 h-6" />}>
                  Launch Your Journey
                </FuturisticButton>
                
                <FuturisticButton variant="outline" size="xl" icon={<Play className="w-6 h-6" />}>
                  Watch Demo
                </FuturisticButton>
              </motion.div>
            </motion.div>

            {/* Right Content - Hero Visual */}
            <motion.div 
              className="lg:w-1/2 relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              style={{ y: y1 }}
            >
              <div className="relative">
                {/* Main hero card */}
                <div className="relative p-1 rounded-3xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500">
                  <div className="bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                    <div className="aspect-video bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl mb-6 flex items-center justify-center">
                      <motion.div 
                        className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      >
                        <Play className="w-10 h-10 text-white ml-1" />
                      </motion.div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-2">AI-Powered Training</h3>
                    <p className="text-gray-400">Personalized workouts that adapt to your family's progress in real-time.</p>
                  </div>
                </div>

                {/* Floating stats */}
                <motion.div 
                  className="absolute -top-8 -right-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full flex items-center justify-center mr-4">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Active Users</p>
                      <p className="text-2xl font-bold">10K+</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="absolute -bottom-8 -left-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-6 text-white"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 }}
                >
                  <div className="flex items-center">
                    <Flame className="w-8 h-8 mr-3" />
                    <div>
                      <p className="font-bold text-lg">50% OFF</p>
                      <p className="text-sm opacity-90">Early Access</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 text-transparent bg-clip-text">
                Next-Gen Programs
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Revolutionary fitness experiences powered by advanced AI and personalized coaching
            </p>
          </motion.div>

          {/* Program Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {programCards.map((program, index) => (
              <motion.div
                key={program.title}
                className="group relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                {/* Card glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${program.gradient} opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500 rounded-3xl`}></div>
                
                {/* Main Card */}
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500 group-hover:transform group-hover:scale-105">
                  {/* Header */}
                  <div className="flex items-center mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${program.gradient} rounded-2xl flex items-center justify-center mr-4`}>
                      {program.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{program.title}</h3>
                      <p className="text-cyan-400 text-sm">{program.tagline}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 mb-6 leading-relaxed">{program.description}</p>

                  {/* Features */}
                  <div className="mb-8">
                    <h4 className="text-white font-semibold mb-4 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-cyan-400" />
                      What's Included:
                    </h4>
                    <div className="space-y-3">
                      {program.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-start">
                          <CheckCircle2 className="w-5 h-5 text-cyan-400 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Best For */}
                  <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-cyan-400 font-medium text-sm">
                      <Target className="w-4 h-4 inline mr-2" />
                      Perfect For: <span className="text-white">{program.bestFor}</span>
                    </p>
                  </div>

                  {/* CTA */}
                  <FuturisticButton 
                    variant="glow" 
                    size="md" 
                    className="w-full"
                    icon={<ArrowRight className="w-5 h-5" />}
                    iconPosition="right"
                  >
                    {program.ctaText}
                  </FuturisticButton>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left - Features List */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl font-black mb-8">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
                  Future-Ready
                </span>
                <br />
                Family Fitness
              </h2>
              
              <p className="text-xl text-gray-300 mb-12">
                Experience next-generation fitness technology designed for the modern family.
              </p>

              <div className="space-y-8">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start group"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-400">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right - Visual */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ y: y2 }}
            >
              <div className="relative">
                {/* Main dashboard mockup */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-500/30">
                      <Heart className="w-8 h-8 text-cyan-400 mb-2" />
                      <p className="text-sm text-gray-300">Heart Rate</p>
                      <p className="text-2xl font-bold">142 BPM</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                      <Flame className="w-8 h-8 text-purple-400 mb-2" />
                      <p className="text-sm text-gray-300">Calories</p>
                      <p className="text-2xl font-bold">1,234</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl p-4 border border-emerald-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Weekly Progress</span>
                      <span className="text-emerald-400 font-bold">78%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div 
                        className="h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: "78%" }}
                        viewport={{ once: true }}
                        transition={{ delay: 1, duration: 1 }}
                      ></motion.div>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <motion.div 
                  className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Zap className="w-10 h-10 text-white" />
                </motion.div>

                <motion.div 
                  className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.5 }}
                >
                  <div className="flex items-center">
                    <Shield className="w-6 h-6 text-cyan-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-400">AI Protection</p>
                      <p className="font-bold">Active</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 text-transparent bg-clip-text">
                Success Stories
              </span>
            </h2>
            <p className="text-xl text-gray-300">
              Real families, real transformations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                className="relative group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                
                {/* Testimonial card */}
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 group-hover:border-white/20 transition-all duration-500">
                  {/* Stars */}
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-gray-300 text-lg mb-6 leading-relaxed">"{testimonial.quote}"</p>

                  {/* Author */}
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mr-4 flex items-center justify-center">
                      <span className="text-white font-bold">{testimonial.name[0]}</span>
                    </div>
                    <div>
                      <h4 className="font-bold">{testimonial.name}</h4>
                      <p className="text-cyan-400 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/50 via-purple-900/50 to-pink-900/50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.3)_0%,transparent_70%)]"></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-black mb-8">
              Ready to <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 text-transparent bg-clip-text">Transform</span> Your Future?
            </h2>
            
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Join the fitness revolution and experience the future of family health with our AI-powered programs.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <motion.div 
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Shield className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <p className="text-white font-semibold">No Contracts</p>
                <p className="text-gray-400 text-sm">Cancel anytime</p>
              </motion.div>
              
              <motion.div 
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <Rocket className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <p className="text-white font-semibold">30-Day Guarantee</p>
                <p className="text-gray-400 text-sm">Risk-free trial</p>
              </motion.div>
              
              <motion.div 
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <p className="text-white font-semibold">Instant Access</p>
                <p className="text-gray-400 text-sm">Start immediately</p>
              </motion.div>
            </div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
            >
              <FuturisticButton 
                variant="glow" 
                size="xl" 
                icon={<Rocket className="w-6 h-6" />}
                iconPosition="right"
              >
                Start Your Transformation
              </FuturisticButton>
              
              <FuturisticButton 
                variant="secondary" 
                size="xl" 
                icon={<Target className="w-6 h-6" />}
              >
                Explore Programs
              </FuturisticButton>
            </motion.div>

            {/* Trust indicators */}
            <motion.div 
              className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-60"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.6 }}
              viewport={{ once: true }}
              transition={{ delay: 1 }}
            >
              <div className="flex items-center">
                <Users className="w-5 h-5 text-cyan-400 mr-2" />
                <span className="text-sm">10,000+ Active Members</span>
              </div>
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 mr-2" />
                <span className="text-sm">4.9/5 Rating</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-green-400 mr-2" />
                <span className="text-sm">Certified Trainers</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;