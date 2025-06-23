// src/components/Streaming/LiveWorkoutStream.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// src/components/Social/LiveChat.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, ThumbsUp, Users, MessageCircle, Smile } from 'lucide-react';
import LiveChat from './LiveChat';

const LiveWorkoutStream = ({ streamId, isLive = false }) => {
  const [viewerCount, setViewerCount] = useState(1247);
  const [chatVisible, setChatVisible] = useState(false);
  const [streamQuality, setStreamQuality] = useState('1080p');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Simulate viewer count changes
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 10) - 5);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Video Stream */}
        <div className="lg:col-span-3">
          <div className="relative bg-black rounded-2xl overflow-hidden">
            {/* Live Badge */}
            {isLive && (
              <div className="absolute top-4 left-4 z-10">
                <div className="flex items-center bg-red-500 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                  <span className="text-white text-sm font-bold">LIVE</span>
                </div>
              </div>
            )}

            {/* Viewer Count */}
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                <div className="flex items-center text-white text-sm">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{viewerCount.toLocaleString()} watching</span>
                </div>
              </div>
            </div>

            {/* Video Player */}
            <div className="aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full"
                poster="/stream-poster.jpg"
                controls
              >
                <source src="/live-stream.m3u8" type="application/x-mpegURL" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Stream Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                <button
                  onClick={() => setChatVisible(!chatVisible)}
                  className={`p-2 rounded-full transition-colors ${
                    chatVisible ? 'bg-purple-500 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <MessageCircle className="h-5 w-5" />
                </button>
                
                <select
                  value={streamQuality}
                  onChange={(e) => setStreamQuality(e.target.value)}
                  className="bg-transparent text-white text-sm focus:outline-none"
                >
                  <option value="1080p" className="bg-black">1080p</option>
                  <option value="720p" className="bg-black">720p</option>
                  <option value="480p" className="bg-black">480p</option>
                </select>
                
                <button
                  onClick={toggleFullscreen}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {isFullscreen ? '⊞' : '⊡'}
                </button>
              </div>
            </div>
          </div>

          {/* Stream Info */}
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Morning Yoga Flow</h2>
                <p className="text-gray-300">with Coach Sanskriti</p>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">45 minutes</div>
                <div className="text-gray-400 text-sm">Beginner friendly</div>
              </div>
            </div>
            
            <p className="text-gray-300 mb-4">
              Start your day with this energizing yoga flow designed to awaken your body and mind. 
              Perfect for beginners and suitable for all fitness levels.
            </p>
            
            <div className="flex items-center space-x-4">
              <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors">
                Join Workout
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg border border-white/20 transition-colors">
                Add to Calendar
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Live Chat */}
          <LiveChat 
            isVisible={chatVisible || true} 
            onToggle={() => setChatVisible(!chatVisible)}
            workoutId={streamId}
          />

          {/* Upcoming Classes */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">Next Classes</h3>
            <div className="space-y-3">
              {[
                { name: 'HIIT Cardio', time: '2:00 PM', instructor: 'Coach Mike' },
                { name: 'Family Zumba', time: '4:00 PM', instructor: 'Coach Ana' },
                { name: 'Evening Meditation', time: '7:00 PM', instructor: 'Coach Sarah' }
              ].map((class_, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{class_.name}</p>
                    <p className="text-gray-400 text-sm">{class_.instructor}</p>
                  </div>
                  <div className="text-purple-400 text-sm font-bold">
                    {class_.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveWorkoutStream;