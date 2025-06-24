/* eslint-disable no-unused-vars */
// src/pages/AIFitnessHub.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Target, 
  Activity, 
  TrendingUp, 
  Eye,
  Mic,
  Camera,
  BarChart3,
  Users,
  Sparkles,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  Settings,
  Shield,
  Rocket
} from 'lucide-react';
import Navbar from '../components/Navigation/Header';
import AIFitnessCoach from '../components/FuturisticFeatures/AIFitnessCoach';
import SmartNutritionAI from '../components/FuturisticFeatures/SmartNutritionAI';
import VoiceAssistant from '../components/AI/VoiceAssistant';
import RealTimeAnalytics from '../components/Analytics/RealTimeAnalytics';
import UserDashboard from '../components/Analytics/UserDashboard';

const AIFitnessHub = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const aiFeatures = [
    {
      id: 'coach',
      title: 'AI Fitness Coach',
      description: 'Real-time form analysis and personalized coaching',
      icon: <Brain className="w-8 h-8" />,
      gradient: 'from-cyan-400 via-blue-500 to-purple-600',
      stats: { accuracy: '94%', users: '2.3K', sessions: '15.7K' }
    },
    {
      id: 'nutrition',
      title: 'Smart Nutrition AI',
      description: 'Personalized meal planning powered by machine learning',
      icon: <Target className="w-8 h-8" />,
      gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
      stats: { plans: '500+', success: '89%', calories: '2.1M' }
    },
    {
      id: 'voice',
      title: 'Voice Assistant',
      description: 'Hands-free workout guidance and motivation',
      icon: <Mic className="w-8 h-8" />,
      gradient: 'from-pink-400 via-purple-500 to-indigo-600',
      stats: { commands: '10K+', accuracy: '96%', languages: '5' }
    },
    {
      id: 'analytics',
      title: 'Predictive Analytics',
      description: 'AI-powered insights for optimal performance',
      icon: <BarChart3 className="w-8 h-8" />,
      gradient: 'from-orange-400 via-red-500 to-pink-600',
      stats: { predictions: '1.8K', accuracy: '92%', insights: '450' }
    }
  ];

  const tabs = [
    { id: 'overview', name: 'AI Overview', icon: <Brain className="w-5 h-5" /> },
    { id: 'coach', name: 'AI Coach', icon: <Camera className="w-5 h-5" /> },
    { id: 'nutrition', name: 'Nutrition AI', icon: <Target className="w-5 h-5" /> },
    { id: 'analytics', name: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'coach':
        return <AIFitnessCoach />;
      case 'nutrition':
        return <SmartNutritionAI />;
      case 'analytics':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <UserDashboard />
          </div>
        );
      default:
        return (
          <div className="space-y-12">
            {/* AI Overview Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {aiFeatures.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  className="group relative"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500 rounded-3xl`}></div>
                  
                  {/* Card */}
                  <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all duration-500 group-hover:transform group-hover:scale-105">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-4`}>
                      {feature.icon}
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    {/* Stats */}
                    <div className="space-y-2">
                      {Object.entries(feature.stats).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-gray-400 capitalize">{key}:</span>
                          <span className="text-white font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                    
                    <motion.button
                      className={`w-full mt-4 bg-gradient-to-r ${feature.gradient} text-white font-semibold py-2 px-4 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2`}
                      onClick={() => setActiveTab(feature.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Explore {feature.title.split(' ').pop()}
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Real-time AI Status */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">AI System Status</h3>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-green-400 font-medium">All Systems Operational</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">AI Processing Power</span>
                    <span className="text-cyan-400 font-bold">94%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div 
                      className="h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "94%" }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    ></motion.div>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Model Accuracy</span>
                    <span className="text-emerald-400 font-bold">96.7%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div 
                      className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "96.7%" }}
                      transition={{ duration: 1.5, delay: 0.7 }}
                    ></motion.div>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Response Time</span>
                    <span className="text-purple-400 font-bold">0.3s</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div 
                      className="h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "85%" }}
                      transition={{ duration: 1.5, delay: 0.9 }}
                    ></motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Capabilities Showcase */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                <h4 className="text-xl font-bold mb-6 flex items-center">
                  <Eye className="w-6 h-6 text-cyan-400 mr-3" />
                  Computer Vision
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Form Analysis</span>
                    <span className="text-cyan-400">Real-time</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Pose Detection</span>
                    <span className="text-green-400">33 Points</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Movement Tracking</span>
                    <span className="text-purple-400">3D Space</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                <h4 className="text-xl font-bold mb-6 flex items-center">
                  <Brain className="w-6 h-6 text-purple-400 mr-3" />
                  Machine Learning
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Neural Networks</span>
                    <span className="text-purple-400">Deep Learning</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Training Data</span>
                    <span className="text-emerald-400">2.3M Sessions</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Prediction Models</span>
                    <span className="text-orange-400">15 Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <Navbar />
      
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>
        <motion.div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139,92,246,0.15) 0%, transparent 50%)`,
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => (
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
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto mb-16"
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
              <Brain className="w-5 h-5 text-cyan-400 mr-2" />
              <span className="text-cyan-300 font-medium">Powered by Advanced AI</span>
              <div className="w-2 h-2 bg-cyan-400 rounded-full ml-2 animate-pulse"></div>
            </motion.div>

            <h1 className="text-6xl md:text-7xl font-black leading-none mb-8">
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
                AI Fitness
              </span>
              <span className="block text-white">
                Revolution
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Experience the future of fitness with our revolutionary AI-powered platform. 
              <span className="text-cyan-400"> Personalized coaching, real-time analysis, and predictive insights</span> 
              that adapt to your unique fitness journey.
            </p>

            {/* AI Status Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { label: 'AI Models', value: '15+', icon: <Brain className="w-5 h-5" /> },
                { label: 'Accuracy', value: '96.7%', icon: <Target className="w-5 h-5" /> },
                { label: 'Real-time', value: '<0.3s', icon: <Zap className="w-5 h-5" /> },
                { label: 'Users', value: '10K+', icon: <Users className="w-5 h-5" /> }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div className="text-cyan-400 mb-2 flex justify-center">{stat.icon}</div>
                  <div className="text-xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div 
            className="flex flex-wrap justify-center gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {renderActiveTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Voice Assistant Integration */}
      <VoiceAssistant />
      
      {/* Real-time Analytics Overlay */}
      <RealTimeAnalytics />

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/50 via-purple-900/50 to-pink-900/50"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black mb-8">
              Ready to Experience <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 text-transparent bg-clip-text">AI Fitness</span>?
            </h2>
            
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Join thousands who are already experiencing the future of fitness with our AI-powered platform.
            </p>

            <motion.button
              className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold py-4 px-8 rounded-2xl hover:shadow-[0_0_50px_rgba(59,130,246,0.8)] transition-all duration-300 flex items-center justify-center gap-3 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Rocket className="w-6 h-6" />
              Start Your AI Journey
              <Sparkles className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default AIFitnessHub;