/* eslint-disable no-unused-vars */
// src/pages/LiveStudio.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Users, 
  Calendar, 
  Clock, 
  Camera,
  Mic,
  Settings,
  Heart,
  MessageCircle,
  Star,
  Wifi,
  Radio,
  Video,
  Volume2,
  Share2,
  Bell,
  TrendingUp,
  Zap
} from 'lucide-react';
import Navbar from '../components/Navigation/Header';
import Footer from '../components/Footer/Footer';
import LiveWorkoutStream from '../components/Social/LiveWorkoutStream';
import LiveChat from '../components/Social/LiveChat';

const LiveStudio = () => {
  const [selectedStream, setSelectedStream] = useState(null);
  const [viewMode, setViewMode] = useState('schedule'); // 'schedule', 'live', 'ondemand'
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const liveStreams = [
    {
      id: 1,
      title: "Morning Yoga Flow",
      instructor: "Coach Sanskriti",
      time: "7:00 AM - 7:45 AM",
      participants: 156,
      type: "Yoga",
      difficulty: "Beginner",
      isLive: true,
      thumbnail: "/streams/yoga-morning.jpg",
      description: "Start your day with energizing yoga flow",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: 2,
      title: "HIIT Cardio Blast",
      instructor: "Coach Mike",
      time: "12:00 PM - 12:30 PM",
      participants: 289,
      type: "HIIT",
      difficulty: "Intermediate",
      isLive: true,
      thumbnail: "/streams/hiit-cardio.jpg",
      description: "High-intensity interval training session",
      gradient: "from-orange-500 to-red-500"
    },
    {
      id: 3,
      title: "Family Zumba Party",
      instructor: "Coach Ana",
      time: "4:00 PM - 5:00 PM",
      participants: 342,
      type: "Zumba",
      difficulty: "All Levels",
      isLive: false,
      startsIn: "2h 15m",
      thumbnail: "/streams/zumba-family.jpg",
      description: "Fun dance fitness for the whole family",
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      id: 4,
      title: "Strength & Conditioning",
      instructor: "Coach David",
      time: "6:00 PM - 7:00 PM",
      participants: 198,
      type: "Strength",
      difficulty: "Advanced",
      isLive: false,
      startsIn: "4h 30m",
      thumbnail: "/streams/strength-training.jpg",
      description: "Build muscle and improve endurance",
      gradient: "from-emerald-500 to-teal-500"
    }
  ];

  const upcomingSchedule = [
    {
      day: "Today",
      sessions: [
        { time: "7:00 AM", title: "Morning Yoga", instructor: "Sanskriti", type: "Yoga", live: true },
        { time: "12:00 PM", title: "HIIT Cardio", instructor: "Mike", type: "HIIT", live: true },
        { time: "4:00 PM", title: "Family Zumba", instructor: "Ana", type: "Zumba", upcoming: true },
        { time: "6:00 PM", title: "Strength Training", instructor: "David", type: "Strength", upcoming: true },
        { time: "8:00 PM", title: "Evening Meditation", instructor: "Sarah", type: "Yoga", upcoming: true }
      ]
    },
    {
      day: "Tomorrow",
      sessions: [
        { time: "6:30 AM", title: "Sunrise Yoga", instructor: "Sanskriti", type: "Yoga" },
        { time: "8:00 AM", title: "Morning HIIT", instructor: "Mike", type: "HIIT" },
        { time: "11:00 AM", title: "Pilates Core", instructor: "Emma", type: "Pilates" },
        { time: "3:00 PM", title: "Dance Cardio", instructor: "Ana", type: "Dance" },
        { time: "5:30 PM", title: "Bodyweight Strength", instructor: "David", type: "Strength" }
      ]
    }
  ];

  const liveStats = {
    totalViewers: 1247,
    activeSessions: 4,
    totalMinutes: 15680,
    satisfaction: 4.8
  };

  if (selectedStream) {
    return (
      <div className="min-h-screen bg-black">
        <LiveWorkoutStream streamId={selectedStream.id} isLive={selectedStream.isLive} />
        <button
          onClick={() => setSelectedStream(null)}
          className="fixed top-24 left-4 z-50 bg-black/80 backdrop-blur-lg text-white px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
        >
          ← Back to Studio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <Navbar />
      
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>
        <motion.div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(239,68,68,0.15) 0%, transparent 50%)`,
          }}
        />
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
              className="inline-flex items-center px-6 py-3 bg-red-500/20 backdrop-blur-lg rounded-full mb-8 border border-red-500/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-red-400 font-medium">LIVE NOW</span>
              <Radio className="w-4 h-4 text-red-400 ml-2" />
            </motion.div>

            <h1 className="text-6xl md:text-7xl font-black leading-none mb-8">
              <span className="block bg-gradient-to-r from-red-400 via-pink-500 to-purple-600 text-transparent bg-clip-text">
                Live
              </span>
              <span className="block text-white">
                Fitness
              </span>
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
                Studio
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Join live interactive fitness sessions with world-class instructors. 
              <span className="text-red-400"> Real-time coaching, community support,</span> 
              and personalized feedback.
            </p>

            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { label: 'Live Viewers', value: liveStats.totalViewers.toLocaleString(), icon: <Users className="w-5 h-5" /> },
                { label: 'Active Sessions', value: liveStats.activeSessions, icon: <Video className="w-5 h-5" /> },
                { label: 'Minutes Streamed', value: `${Math.floor(liveStats.totalMinutes/1000)}K+`, icon: <Clock className="w-5 h-5" /> },
                { label: 'Satisfaction', value: `${liveStats.satisfaction}★`, icon: <Star className="w-5 h-5" /> }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div className="text-red-400 mb-2 flex justify-center">{stat.icon}</div>
                  <div className="text-xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* View Mode Toggle */}
          <motion.div 
            className="flex justify-center gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {[
              { id: 'schedule', name: 'Schedule', icon: <Calendar className="w-5 h-5" /> },
              { id: 'live', name: 'Live Now', icon: <Radio className="w-5 h-5" /> },
              { id: 'ondemand', name: 'On Demand', icon: <Play className="w-5 h-5" /> }
            ].map((mode) => (
              <motion.button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                  viewMode === mode.id
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {mode.icon}
                <span>{mode.name}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            {viewMode === 'live' && (
              <motion.div
                key="live"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold mb-8 flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-3 animate-pulse"></div>
                  Live Sessions
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {liveStreams.filter(stream => stream.isLive).map((stream, index) => (
                    <motion.div
                      key={stream.id}
                      className="group relative cursor-pointer"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedStream(stream)}
                    >
                      {/* Glow effect */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${stream.gradient} opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500 rounded-3xl`}></div>
                      
                      {/* Stream Card */}
                      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden group-hover:border-white/20 transition-all duration-500 group-hover:transform group-hover:scale-105">
                        {/* Live Badge */}
                        <div className="absolute top-4 left-4 z-10 bg-red-500 px-3 py-1 rounded-full flex items-center">
                          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                          <span className="text-white text-sm font-bold">LIVE</span>
                        </div>
                        
                        {/* Viewers Count */}
                        <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                          <div className="flex items-center text-white text-sm">
                            <Users className="w-4 h-4 mr-1" />
                            <span>{stream.participants}</span>
                          </div>
                        </div>
                        
                        {/* Thumbnail */}
                        <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                          
                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white">
                              <Play className="w-8 h-8 text-white fill-white ml-1" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-3 py-1 bg-gradient-to-r ${stream.gradient} rounded-full text-white text-sm font-medium`}>
                              {stream.type}
                            </span>
                            <span className="text-gray-400 text-sm">{stream.difficulty}</span>
                          </div>
                          
                          <h3 className="text-xl font-bold mb-2 group-hover:text-red-400 transition-colors">
                            {stream.title}
                          </h3>
                          
                          <p className="text-gray-300 text-sm mb-4">{stream.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mr-3 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">{stream.instructor[0]}</span>
                              </div>
                              <div>
                                <p className="text-white font-medium text-sm">{stream.instructor}</p>
                                <p className="text-gray-400 text-xs">{stream.time}</p>
                              </div>
                            </div>
                            
                            <motion.button
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Radio className="w-4 h-4" />
                              Join Live
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {viewMode === 'schedule' && (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold mb-8 flex items-center">
                  <Calendar className="w-8 h-8 text-cyan-400 mr-3" />
                  Upcoming Schedule
                </h2>
                
                <div className="space-y-8">
                  {upcomingSchedule.map((daySchedule, dayIndex) => (
                    <motion.div
                      key={daySchedule.day}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: dayIndex * 0.1 }}
                    >
                      <h3 className="text-2xl font-bold mb-6 text-cyan-400">{daySchedule.day}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {daySchedule.sessions.map((session, index) => (
                          <motion.div
                            key={index}
                            className={`p-4 rounded-2xl border transition-all duration-300 hover:scale-105 cursor-pointer ${
                              session.live
                                ? 'bg-red-500/20 border-red-500/30 hover:bg-red-500/30'
                                : session.upcoming
                                ? 'bg-yellow-500/20 border-yellow-500/30 hover:bg-yellow-500/30'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-bold">{session.time}</span>
                              {session.live && (
                                <div className="bg-red-500 px-2 py-1 rounded-full">
                                  <span className="text-white text-xs font-bold">LIVE</span>
                                </div>
                              )}
                              {session.upcoming && (
                                <div className="bg-yellow-500 px-2 py-1 rounded-full">
                                  <span className="text-black text-xs font-bold">SOON</span>
                                </div>
                              )}
                            </div>
                            <h4 className="text-white font-semibold mb-1">{session.title}</h4>
                            <p className="text-gray-400 text-sm">{session.instructor}</p>
                            <p className="text-cyan-400 text-xs mt-1">{session.type}</p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {viewMode === 'ondemand' && (
              <motion.div
                key="ondemand"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold mb-8 flex items-center">
                  <Play className="w-8 h-8 text-purple-400 mr-3" />
                  On-Demand Library
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {liveStreams.map((stream, index) => (
                    <motion.div
                      key={stream.id}
                      className="group relative cursor-pointer"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedStream(stream)}
                    >
                      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden group-hover:border-white/20 transition-all duration-500 group-hover:transform group-hover:scale-105">
                        <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative">
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="text-lg font-bold mb-2 group-hover:text-purple-400 transition-colors">
                            {stream.title}
                          </h3>
                          <p className="text-gray-400 text-sm mb-2">{stream.instructor}</p>
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 bg-gradient-to-r ${stream.gradient} rounded-full text-white text-xs`}>
                              {stream.type}
                            </span>
                            <span className="text-gray-400 text-xs">{stream.difficulty}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-4xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black mb-8">
              <span className="bg-gradient-to-r from-red-400 via-pink-500 to-purple-500 text-transparent bg-clip-text">
                Next-Level
              </span>
              <br />
              Live Experience
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Real-Time Interaction",
                description: "Get instant feedback and corrections from instructors during live sessions",
                icon: <MessageCircle className="w-8 h-8" />,
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                title: "Community Energy",
                description: "Workout alongside hundreds of motivated participants from around the world",
                icon: <Users className="w-8 h-8" />,
                gradient: "from-purple-500 to-pink-500"
              },
              {
                title: "Professional Production",
                description: "High-quality streams with multiple camera angles and crystal-clear audio",
                icon: <Camera className="w-8 h-8" />,
                gradient: "from-emerald-500 to-teal-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500 rounded-3xl`}></div>
                
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 group-hover:border-white/20 transition-all duration-500">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6`}>
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4 group-hover:text-cyan-400 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LiveStudio;