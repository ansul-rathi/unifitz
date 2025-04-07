import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Stars, Sparkles, Music, Gift, Crown, Cake } from 'lucide-react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Soumya = () => {
  const [activeQuote, setActiveQuote] = useState(0);
  const [isExploding, setIsExploding] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const sliderRef = useRef(null);
  
  // SONA's name animation
  const nameLetters = "SONA".split("");
  
  // Friendship quotes
  const friendshipQuotes = [
    "True friendship is a journey where souls meet and hearts connect. Happy Birthday, SONA! 💖",
    "A friend like you is what all of life's beautiful moments are made of. Shine on, SONA! ✨",
    "Best friends are the siblings God forgot to give us. So lucky to have you, SONA! 🌟",
    "Our friendship is like a diamond - precious, strong and forever. Happy Birthday SONA! 💎",
    "Friends become our chosen family. You're the sister I got to choose. Love you, SONA! 💕",
    "Life is better with a friend like you by my side. Cheers to another amazing year, SONA! 🥂"
  ];
  
  // Photo slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: true,
    fade: true
  };
  
  useEffect(() => {
    // Initial animations
    setTimeout(() => setIsExploding(true), 500);
    
    // Cycle through friendship quotes
    const quoteInterval = setInterval(() => {
      setActiveQuote(prev => (prev + 1) % friendshipQuotes.length);
    }, 5000);
    
    // Periodic heart bursts
    const heartBurstInterval = setInterval(() => {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 1500);
    }, 7000);
    
    return () => {
      clearInterval(quoteInterval);
      clearInterval(heartBurstInterval);
    };
  }, []);
  
  // Generate random hearts for explosion
  const generateHearts = (count) => {
    return Array.from({ length: count }).map((_, i) => {
      const size = Math.random() * 30 + 10;
      const angle = Math.random() * 360;
      const distance = Math.random() * 60 + 20;
      const duration = Math.random() * 2 + 1;
      const delay = Math.random() * 0.5;
      
      return (
        <motion.div
          key={i}
          initial={{ scale: 0, x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ 
            scale: [0, 1, 0.8],
            x: Math.cos(angle * Math.PI / 180) * distance,
            y: Math.sin(angle * Math.PI / 180) * distance,
            opacity: [0, 1, 0],
            rotate: angle
          }}
          transition={{ 
            duration: duration,
            delay: delay,
            ease: "easeOut"
          }}
          className="absolute top-1/2 left-1/2"
          style={{ marginLeft: -size/2, marginTop: -size/2 }}
        >
          <Heart fill="#ff3e8e" color="#ff3e8e" size={size} />
        </motion.div>
      );
    });
  };
  
  return (
    <motion.div 
      className="relative w-full min-h-screen bg-gradient-to-b from-purple-900 via-fuchsia-900 to-pink-900 overflow-hidden p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => {
          const icons = [Heart, Stars, Sparkles, Music, Gift, Gift, Crown, Cake];
          const Icon = icons[i % icons.length];
          const size = Math.random() * 20 + 15;
          const top = Math.random() * 100;
          const left = Math.random() * 100;
          const duration = Math.random() * 20 + 10;
          const delay = Math.random() * 5;
          
          return (
            <motion.div
              key={i}
              className="absolute text-pink-300 opacity-70"
              style={{ top: `${top}%`, left: `${left}%` }}
              animate={{
                y: ["-10px", "10px", "-10px"],
                x: ["10px", "-10px", "10px"],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut"
              }}
            >
              <Icon size={size} />
            </motion.div>
          );
        })}
      </div>
      
      {/* SONA's name feature */}
      <div className="relative flex justify-center my-6 pt-6 pb-2">
        {nameLetters.map((letter, index) => (
          <motion.div
            key={index}
            className="inline-block relative"
            initial={{ y: -100, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: 1,
              rotate: [0, -5, 5, 0]
            }}
            transition={{ 
              delay: index * 0.2,
              duration: 0.8,
              rotate: {
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                delay: index * 0.5
              }
            }}
          >
            <div className="relative">
              <h1 className="text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-500 mx-1">
                {letter}
              </h1>
              <div className="absolute top-0 left-0 text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400 mx-1 blur-sm animate-pulse">
                {letter}
              </div>
              
              {/* Individual sparkles around each letter */}
              {Array.from({ length: 5 }).map((_, i) => {
                const size = Math.random() * 10 + 5;
                const top = Math.random() * 120 - 10;
                const left = Math.random() * 120 - 10;
                
                return (
                  <motion.div
                    key={`sparkle-${index}-${i}`}
                    className="absolute text-yellow-300"
                    style={{ top: `${top}%`, left: `${left}%` }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                      repeatDelay: Math.random() * 2
                    }}
                  >
                    <Sparkles size={size} />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
        
        {/* Birthday crown */}
        <motion.div 
          className="absolute text-yellow-400 top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <Crown size={80} fill="#FFD700" />
        </motion.div>
      </div>
      
      {/* Birthday headline */}
      <motion.div
        className="text-center mb-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 1
        }}
      >
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-2">
          <span className="relative">
            H
            <motion.span 
              className="absolute -top-4 -right-1 text-yellow-300"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✦
            </motion.span>
          </span>
          appy Birthday!
        </h2>
      </motion.div>
      
      {/* Heart explosion button */}
      <div className="relative flex justify-center mb-8">
        <motion.button
          className="relative z-10 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-white font-bold text-lg shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowHeartBurst(true);
            setTimeout(() => setShowHeartBurst(false), 1500);
          }}
        >
          Send Birthday Love! 💖
        </motion.button>
        
        {/* Heart burst animation */}
        {showHeartBurst && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
            {generateHearts(30)}
          </div>
        )}
      </div>
      
      {/* Photo carousel */}
      <motion.div
        className="w-full max-w-xl mx-auto mb-10 relative"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <div className="p-2 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-xl shadow-2xl">
          <div className="rounded-lg overflow-hidden">
            <Slider ref={sliderRef} {...sliderSettings}>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="relative">
                  <img 
                    src={`/api/placeholder/${500}/${400}`} 
                    alt={`Photo with SONA ${index + 1}`}
                    className="w-full h-72 md:h-96 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white font-medium">
                      {[
                        "Forever friends, forever memories! 💫",
                        "Sisters by heart, friends by choice! 👑",
                        "Our crazy adventures are the best part of life! 🎉",
                        "Through thick and thin, always together! 💖"
                      ][index]}
                    </p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
        
        {/* Decorative corner elements */}
        <motion.div 
          className="absolute -top-4 -left-4 text-pink-400"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles size={30} />
        </motion.div>
        <motion.div 
          className="absolute -top-4 -right-4 text-pink-400"
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles size={30} />
        </motion.div>
        <motion.div 
          className="absolute -bottom-4 -left-4 text-pink-400"
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles size={30} />
        </motion.div>
        <motion.div 
          className="absolute -bottom-4 -right-4 text-pink-400"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles size={30} />
        </motion.div>
      </motion.div>
      
      {/* Animated friendship quote */}
      <div className="relative w-full max-w-2xl mx-auto mb-10 overflow-hidden rounded-lg bg-white/10 backdrop-blur-sm p-6 border border-pink-500/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeQuote}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="italic text-white text-lg md:text-xl">{friendshipQuotes[activeQuote]}</p>
          </motion.div>
        </AnimatePresence>
        
        <div className="absolute top-0 right-0 p-2">
          <Heart className="text-pink-500" size={24} fill="#ec4899" />
        </div>
        <div className="absolute bottom-0 left-0 p-2">
          <Heart className="text-pink-500" size={24} fill="#ec4899" />
        </div>
      </div>
      
      {/* Gift section with special message */}
      <motion.div
        className="w-full max-w-xl mx-auto mb-10 p-6 bg-gradient-to-r from-purple-800/70 to-pink-800/70 backdrop-blur-sm rounded-xl border-2 border-white/20 shadow-2xl overflow-hidden relative"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <div className="absolute -right-6 -top-6 opacity-30">
          <Gift size={120} className="text-pink-300" />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Why SONA is Amazing:</h3>
        
        <ul className="space-y-3 text-white relative z-10">
          {[
            "Your smile lights up every room you walk into",
            "Your kindness touches everyone around you",
            "Your strength inspires me every single day",
            "Your friendship is the greatest gift I could ask for",
            "Your heart is pure gold, and I treasure you"
          ].map((item, i) => (
            <motion.li 
              key={i}
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.8 + (i * 0.2) }}
            >
              <Heart size={16} className="text-pink-400 flex-shrink-0" fill="#f472b6" />
              <span>{item}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
      
      {/* Final celebration message */}
      <motion.div
        className="text-center w-full max-w-xl mx-auto mb-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.3, duration: 0.8 }}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 drop-shadow-md">
            Celebrating You Today & Always!
          </h2>
        </motion.div>
        <p className="text-white text-lg mt-2">With all my love, today and forever ❤️</p>
      </motion.div>
      
      {/* Confetti explosion */}
      {isExploding && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 100 }).map((_, i) => {
            const size = Math.random() * 15 + 5;
            const shape = Math.random() > 0.5 ? 'circle' : 'rect';
            const angle = Math.random() * 360;
            const distance = Math.random() * 120 + 30;
            const duration = Math.random() * 4 + 4;
            const delay = Math.random() * 1;
            
            const colors = [
              'bg-pink-500', 'bg-purple-500', 'bg-yellow-400', 
              'bg-pink-400', 'bg-indigo-500', 'bg-rose-500',
              'bg-fuchsia-400', 'bg-violet-500'
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            return (
              <motion.div
                key={i}
                className={`absolute top-1/4 left-1/2 ${color} ${shape === 'circle' ? 'rounded-full' : ''}`}
                style={{ width: size, height: size }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{ 
                  x: Math.cos(angle * Math.PI / 180) * distance * (Math.random() > 0.5 ? -1 : 1),
                  y: Math.sin(angle * Math.PI / 180) * distance + 300,
                  opacity: [1, 1, 0],
                  rotate: Math.random() * 720 - 360
                }}
                transition={{ 
                  duration: duration,
                  delay: delay,
                  ease: [0.1, 0.25, 0.3, 1]
                }}
              />
            );
          })}
        </div>
      )}
      
      {/* Audio visualizer-inspired footer */}
      <div className="fixed bottom-0 left-0 right-0 h-12 flex items-end justify-center space-x-1 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2 bg-gradient-to-t ${
              i % 3 === 0 ? 'from-pink-600 to-pink-300' : 
              i % 3 === 1 ? 'from-purple-600 to-purple-300' : 
              'from-fuchsia-600 to-fuchsia-300'
            } rounded-t-md`}
            animate={{ 
              height: [
                Math.random() * 20 + 5,
                Math.random() * 80 + 20,
                Math.random() * 30 + 10
              ]
            }}
            transition={{ 
              duration: Math.random() * 1 + 0.5,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default Soumya;