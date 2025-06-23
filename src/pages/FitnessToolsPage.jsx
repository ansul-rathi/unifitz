/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Calculator, 
  Heart, 
  Target, 
  Scale, 
  Activity, 
  Utensils, 
  Clock, 
  TrendingUp, 
  Dumbbell, 
  Users, 
  Brain, 
  Shield, 
  Search,
  Filter,
  ArrowRight,
  Zap,
  Flame,
  Droplets,
  Moon,
  Home,
  Sparkles,
  BarChart3,
  Timer,
  Calendar
} from 'lucide-react';

const FitnessToolsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const categories = [
    { id: 'all', name: 'All Tools', icon: <Sparkles className="w-5 h-5" />, color: 'from-purple-500 to-pink-500' },
    { id: 'body', name: 'Body Composition', icon: <Scale className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
    { id: 'nutrition', name: 'Nutrition', icon: <Utensils className="w-5 h-5" />, color: 'from-green-500 to-emerald-500' },
    { id: 'performance', name: 'Performance', icon: <Activity className="w-5 h-5" />, color: 'from-orange-500 to-red-500' },
    { id: 'strength', name: 'Strength Training', icon: <Dumbbell className="w-5 h-5" />, color: 'from-purple-500 to-violet-500' },
    { id: 'goals', name: 'Goal Setting', icon: <Target className="w-5 h-5" />, color: 'from-pink-500 to-rose-500' },
    { id: 'wellness', name: 'Health & Wellness', icon: <Heart className="w-5 h-5" />, color: 'from-teal-500 to-cyan-500' },
    { id: 'practical', name: 'Practical Tools', icon: <Home className="w-5 h-5" />, color: 'from-indigo-500 to-blue-500' }
  ];

  const tools = [
    // Body Composition Tools
    {
      id: 1,
      name: 'BMI Calculator',
      description: 'Calculate your Body Mass Index with detailed analysis and health recommendations',
      category: 'body',
      icon: <Scale className="w-6 h-6" />,
      gradient: 'from-blue-500 to-cyan-500',
      popular: true,
      features: ['Age/Gender considerations', 'Trend tracking', 'Family comparisons', 'Health ranges']
    },
    {
      id: 2,
      name: 'Body Fat Calculator',
      description: 'Estimate body fat percentage using multiple proven calculation methods',
      category: 'body',
      icon: <BarChart3 className="w-6 h-6" />,
      gradient: 'from-cyan-500 to-blue-500',
      features: ['Multiple methods', 'Lean mass calculation', 'Visual guides', 'Goal setting']
    },
    {
      id: 3,
      name: 'Ideal Weight Calculator',
      description: 'Find your ideal weight range based on height, age, and body frame',
      category: 'body',
      icon: <Target className="w-6 h-6" />,
      gradient: 'from-blue-500 to-indigo-500',
      features: ['Multiple formulas', 'Frame size adjustment', 'Weight ranges', 'Goal setting']
    },
    {
      id: 4,
      name: 'Body Measurement Tracker',
      description: 'Track waist-to-hip ratio and other important body measurements',
      category: 'body',
      icon: <TrendingUp className="w-6 h-6" />,
      gradient: 'from-indigo-500 to-purple-500',
      features: ['Progress tracking', 'Ratio calculations', 'Body shape analysis', 'Measurement guides']
    },

    // Nutrition Tools
    {
      id: 5,
      name: 'Daily Calorie Calculator',
      description: 'Calculate your daily calorie needs based on goals and activity level',
      category: 'nutrition',
      icon: <Flame className="w-6 h-6" />,
      gradient: 'from-orange-500 to-red-500',
      popular: true,
      features: ['BMR calculation', 'Activity adjustments', 'Goal-based calories', 'TDEE analysis']
    },
    {
      id: 6,
      name: 'Macro Calculator',
      description: 'Get personalized macronutrient ratios for your fitness goals',
      category: 'nutrition',
      icon: <Utensils className="w-6 h-6" />,
      gradient: 'from-green-500 to-emerald-500',
      features: ['Custom ratios', 'Goal-specific macros', 'Meal planning', 'Gram breakdowns']
    },
    {
      id: 7,
      name: 'Calorie Burn Calculator',
      description: 'Calculate calories burned during various exercises and activities',
      category: 'nutrition',
      icon: <Zap className="w-6 h-6" />,
      gradient: 'from-yellow-500 to-orange-500',
      features: ['200+ activities', 'Duration/intensity', 'Weight-based', 'Daily tracking']
    },
    {
      id: 8,
      name: 'Water Intake Calculator',
      description: 'Determine your optimal daily water intake for peak performance',
      category: 'nutrition',
      icon: <Droplets className="w-6 h-6" />,
      gradient: 'from-cyan-500 to-blue-500',
      features: ['Activity adjustments', 'Climate factors', 'Health conditions', 'Hydration tracking']
    },

    // Performance Tools
    {
      id: 9,
      name: 'Heart Rate Zone Calculator',
      description: 'Find your optimal training zones for maximum fitness results',
      category: 'performance',
      icon: <Heart className="w-6 h-6" />,
      gradient: 'from-red-500 to-pink-500',
      popular: true,
      features: ['Training zones', 'Age-adjusted', 'Custom zones', 'Real-time guidance']
    },
    {
      id: 10,
      name: 'VO2 Max Calculator',
      description: 'Assess your cardiovascular fitness and track improvements',
      category: 'performance',
      icon: <Activity className="w-6 h-6" />,
      gradient: 'from-emerald-500 to-teal-500',
      features: ['Fitness assessment', 'Multiple protocols', 'Fitness age', 'Progress tracking']
    },
    {
      id: 11,
      name: 'Pace Calculator',
      description: 'Calculate running/walking pace and predict race times',
      category: 'performance',
      icon: <Timer className="w-6 h-6" />,
      gradient: 'from-blue-500 to-purple-500',
      features: ['Pace conversion', 'Split calculations', 'Race predictions', 'Goal setting']
    },

    // Strength Training Tools
    {
      id: 12,
      name: 'One Rep Max Calculator',
      description: 'Estimate your maximum lift capacity for strength training',
      category: 'strength',
      icon: <Dumbbell className="w-6 h-6" />,
      gradient: 'from-purple-500 to-violet-500',
      features: ['Multiple formulas', 'Training percentages', 'Progress tracking', 'PR estimation']
    },
    {
      id: 13,
      name: 'Plate Calculator',
      description: 'Calculate barbell plate combinations for your target weight',
      category: 'strength',
      icon: <Calculator className="w-6 h-6" />,
      gradient: 'from-violet-500 to-purple-500',
      features: ['Plate combinations', 'Equipment customization', 'Unit conversions', 'Warmup weights']
    },
    {
      id: 14,
      name: 'Volume Calculator',
      description: 'Track training volume and optimize your workout intensity',
      category: 'strength',
      icon: <BarChart3 className="w-6 h-6" />,
      gradient: 'from-indigo-500 to-blue-500',
      features: ['Volume tracking', 'Weekly totals', 'Muscle groups', 'Recovery guidance']
    },

    // Goal Setting Tools
    {
      id: 15,
      name: 'Weight Loss Calculator',
      description: 'Plan your weight loss journey with realistic timelines',
      category: 'goals',
      icon: <TrendingUp className="w-6 h-6" />,
      gradient: 'from-pink-500 to-rose-500',
      popular: true,
      features: ['Timeline planning', 'Calorie deficits', 'Safe rates', 'Plateau predictions']
    },
    {
      id: 16,
      name: 'Muscle Gain Calculator',
      description: 'Set realistic muscle building goals and timelines',
      category: 'goals',
      icon: <Target className="w-6 h-6" />,
      gradient: 'from-emerald-500 to-green-500',
      features: ['Gain timeline', 'Calorie surplus', 'Protein needs', 'Progress milestones']
    },
    {
      id: 17,
      name: 'Goal Timeline Calculator',
      description: 'Create realistic timelines for any fitness goal',
      category: 'goals',
      icon: <Calendar className="w-6 h-6" />,
      gradient: 'from-blue-500 to-cyan-500',
      features: ['Milestone setting', 'Progress predictions', 'Success probability', 'Checkpoint creation']
    },

    // Health & Wellness Tools
    {
      id: 18,
      name: 'Sleep Calculator',
      description: 'Optimize your sleep schedule for better recovery',
      category: 'wellness',
      icon: <Moon className="w-6 h-6" />,
      gradient: 'from-indigo-500 to-purple-500',
      features: ['Bedtime optimizer', 'Sleep cycles', 'Recovery sleep', 'Quality assessment']
    },
    {
      id: 19,
      name: 'Recovery Calculator',
      description: 'Determine optimal recovery time between workouts',
      category: 'wellness',
      icon: <Shield className="w-6 h-6" />,
      gradient: 'from-teal-500 to-cyan-500',
      features: ['Recovery estimation', 'Overtraining prevention', 'Rest recommendations', 'Readiness score']
    },
    {
      id: 20,
      name: 'Fitness Age Calculator',
      description: 'Calculate your biological fitness age vs chronological age',
      category: 'wellness',
      icon: <Brain className="w-6 h-6" />,
      gradient: 'from-purple-500 to-pink-500',
      features: ['Biological age', 'Fitness comparison', 'Health span', 'Family comparisons']
    },

    // Practical Tools
    {
      id: 21,
      name: 'Home Gym Calculator',
      description: 'Plan your perfect home gym setup within your space and budget',
      category: 'practical',
      icon: <Home className="w-6 h-6" />,
      gradient: 'from-orange-500 to-red-500',
      features: ['Space requirements', 'Budget planning', 'Equipment compatibility', 'Progressive setup']
    },
    {
      id: 22,
      name: 'Workout Time Calculator',
      description: 'Estimate workout duration and optimize your schedule',
      category: 'practical',
      icon: <Clock className="w-6 h-6" />,
      gradient: 'from-blue-500 to-indigo-500',
      features: ['Duration estimation', 'Time-based workouts', 'Schedule optimization', 'Quick suggestions']
    },
    {
      id: 23,
      name: 'Meal Timing Calculator',
      description: 'Optimize meal timing for maximum workout performance',
      category: 'practical',
      icon: <Calendar className="w-6 h-6" />,
      gradient: 'from-green-500 to-teal-500',
      features: ['Pre/post workout', 'Intermittent fasting', 'Meal frequency', 'Family scheduling']
    },
    {
      id: 24,
      name: 'Supplement Calculator',
      description: 'Calculate optimal supplement dosages and timing',
      category: 'practical',
      icon: <Utensils className="w-6 h-6" />,
      gradient: 'from-purple-500 to-indigo-500',
      features: ['Dosage calculation', 'Timing optimization', 'Cost analysis', 'Serving calculator']
    }
  ];

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularTools = tools.filter(tool => tool.popular);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(168,85,247,0.1)_60deg,transparent_120deg)]"></div>
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
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
      <section className="relative pt-32 pb-20 overflow-hidden">
        <motion.div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59,130,246,0.3) 0%, transparent 50%)`,
          }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-lg rounded-full mb-8 border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Calculator className="w-5 h-5 text-cyan-400 mr-2" />
              <span className="text-cyan-300 font-medium">24+ Premium Fitness Tools</span>
              <div className="w-2 h-2 bg-cyan-400 rounded-full ml-2 animate-pulse"></div>
            </motion.div>

            <h1 className="text-6xl md:text-7xl font-black leading-none mb-8">
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
                Fitness
              </span>
              <span className="block text-white">
                Tools &
              </span>
              <span className="block bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400 text-transparent bg-clip-text">
                Calculators
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Advanced AI-powered tools to calculate, track, and optimize every aspect of your family fitness journey
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {[
                { number: '24+', label: 'Fitness Tools', icon: <Calculator className="w-6 h-6" /> },
                { number: '8', label: 'Categories', icon: <Target className="w-6 h-6" /> },
                { number: 'AI', label: 'Powered', icon: <Brain className="w-6 h-6" /> },
                { number: 'Free', label: 'All Tools', icon: <Sparkles className="w-6 h-6" /> }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div className="text-cyan-400 mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 relative">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Search Bar */}
            <div className="relative mb-8">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for fitness tools and calculators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    selectedCategory === category.id
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category.icon}
                  <span>{category.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Popular Tools Section */}
      {selectedCategory === 'all' && (
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-black mb-4">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
                  Most Popular Tools
                </span>
              </h2>
              <p className="text-gray-300">Start with these essential calculators</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {popularTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  className="group relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Popular badge */}
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full z-10">
                    POPULAR
                  </div>
                  
                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${tool.gradient} opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500 rounded-3xl`}></div>
                  
                  {/* Card */}
                  <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500 group-hover:transform group-hover:scale-105 h-full">
                    <div className={`w-16 h-16 bg-gradient-to-r ${tool.gradient} rounded-2xl flex items-center justify-center mb-6`}>
                      {tool.icon}
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-cyan-400 transition-colors">
                      {tool.name}
                    </h3>
                    
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      {tool.description}
                    </p>
                    
                    <div className="space-y-2 mb-8">
                      {tool.features.slice(0, 2).map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                          <span className="text-gray-400">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <motion.button
                      className={`w-full bg-gradient-to-r ${tool.gradient} text-white font-bold py-3 px-6 rounded-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Use Calculator
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
        </div>
      </section>
      )}

      {/* All Tools Grid */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-black mb-4">
              {selectedCategory === 'all' ? (
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
                  All Fitness Tools
                </span>
              ) : (
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
                  {categories.find(cat => cat.id === selectedCategory)?.name} Tools
                </span>
              )}
            </h2>
            <p className="text-gray-300">
              {filteredTools.length} tools found {searchTerm && `for "${searchTerm}"`}
            </p>
          </motion.div>

          {filteredTools.length === 0 ? (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">No tools found</h3>
              <p className="text-gray-400 mb-8">Try adjusting your search or category filter</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold py-3 px-8 rounded-xl hover:shadow-xl transition-all"
              >
                Reset Filters
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  className="group relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  {tool.popular && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full z-10">
                      HOT
                    </div>
                  )}
                  
                  {/* Hover glow */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${tool.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-2xl`}></div>
                  
                  {/* Card */}
                  <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 group-hover:transform group-hover:scale-105 h-full flex flex-col">
                    <div className={`w-12 h-12 bg-gradient-to-r ${tool.gradient} rounded-xl flex items-center justify-center mb-4`}>
                      {tool.icon}
                    </div>
                    
                    <h3 className="text-lg font-bold mb-3 group-hover:text-cyan-400 transition-colors">
                      {tool.name}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed flex-grow">
                      {tool.description}
                    </p>
                    
                    <div className="space-y-1 mb-6">
                      {tool.features.slice(0, 2).map((feature, idx) => (
                        <div key={idx} className="flex items-center text-xs">
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2"></div>
                          <span className="text-gray-500">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <motion.button
                      className={`w-full bg-gradient-to-r ${tool.gradient} text-white font-semibold py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Calculate Now
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/50 via-purple-900/50 to-pink-900/50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.3)_0%,transparent_70%)]"></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black mb-8">
              Ready to <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 text-transparent bg-clip-text">Optimize</span> Your Fitness?
            </h2>
            
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Join thousands of families who are using our advanced fitness tools to achieve their health goals faster and smarter.
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
                <Calculator className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <p className="text-white font-semibold">24+ Premium Tools</p>
                <p className="text-gray-400 text-sm">All calculators included</p>
              </motion.div>
              
              <motion.div 
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <Brain className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <p className="text-white font-semibold">AI-Powered Results</p>
                <p className="text-gray-400 text-sm">Smart recommendations</p>
              </motion.div>
              
              <motion.div 
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <Users className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <p className="text-white font-semibold">Family Focused</p>
                <p className="text-gray-400 text-sm">Tools for everyone</p>
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
              <motion.button
                className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold py-4 px-8 rounded-2xl hover:shadow-[0_0_50px_rgba(59,130,246,0.8)] transition-all duration-300 flex items-center justify-center gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Target className="w-6 h-6" />
                Start Using Tools Now
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                className="bg-white/10 text-white border border-white/30 font-bold py-4 px-8 rounded-2xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Users className="w-6 h-6" />
                Join UniFitz Family
              </motion.button>
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
                <span className="text-sm">10,000+ Active Users</span>
              </div>
              <div className="flex items-center">
                <Calculator className="w-5 h-5 text-purple-400 mr-2" />
                <span className="text-sm">1M+ Calculations</span>
              </div>
              <div className="flex items-center">
                <Heart className="w-5 h-5 text-pink-400 mr-2" />
                <span className="text-sm">99% Accuracy Rate</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-green-400 mr-2" />
                <span className="text-sm">Privacy Protected</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-900/50 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-black mb-4">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
                  UniFitz
                </span>
              </h3>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                Empowering families worldwide with advanced fitness tools and AI-powered health insights. 
                Your journey to optimal health starts here.
              </p>
              
              {/* Tool categories quick links */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
                {categories.slice(1, 5).map((category, index) => (
                  <motion.div
                    key={category.id}
                    className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className={`w-10 h-10 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                      {category.icon}
                    </div>
                    <p className="text-white text-sm font-medium">{category.name}</p>
                  </motion.div>
                ))}
              </div>

              {/* Social links */}
              <div className="flex justify-center space-x-6 mb-8">
                {['facebook', 'twitter', 'instagram', 'youtube'].map((social, index) => (
                  <motion.div
                    key={social}
                    className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer group"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="w-5 h-5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-sm group-hover:from-pink-400 group-hover:to-cyan-400 transition-all"></div>
                  </motion.div>
                ))}
              </div>

              {/* Bottom text */}
              <motion.div 
                className="border-t border-white/10 pt-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
              >
                <p className="text-gray-400 text-sm mb-4">
                  © 2025 UniFitz. All rights reserved. Powered by AI for your family fitness success.
                </p>
                <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-500">
                  <span className="hover:text-cyan-400 cursor-pointer transition-colors">Privacy Policy</span>
                  <span className="hover:text-cyan-400 cursor-pointer transition-colors">Terms of Service</span>
                  <span className="hover:text-cyan-400 cursor-pointer transition-colors">Cookie Policy</span>
                  <span className="hover:text-cyan-400 cursor-pointer transition-colors">Help Center</span>
                  <span className="hover:text-cyan-400 cursor-pointer transition-colors">Contact Support</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FitnessToolsPage;