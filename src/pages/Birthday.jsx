import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Sparkles, Music } from 'lucide-react';

const BirthdayCard = () => {
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  
  // Friendship quotes for a new friend
  const quotes = [
    "New friends can quickly become the best of friends. Happy Birthday SONA!",
    "Sometimes you meet a person and you just click. Happy to have met you!",
    "It's only been days, but it feels like we've known each other forever.",
    "It's amazing how quickly a new friendship can brighten your life!"
  ];
  
  // WhatsApp messages
  const whatsappMessages = [
    "Miss you Ansh 💋💕😘",
    "Thinking of you 😘💋💕",
    "Can't wait to see you! 💋💘😘",
    "Always in my heart 💝💋😘"
  ];
  
  // Photo book pages with simple image descriptions
  const photoPages = [
    {
      title: "Cutiepie",
      imageUrl: "/pic-1.jpeg"
    },
    {
      title: "Sweetheart",
      imageUrl: "/pic-2.jpeg"
    },
    {
      title: "Sona",
      imageUrl: "/pic-3.jpeg"
    },
    {
      title: "Lovebug",
      imageUrl: "/pic-4.jpeg"
    },
    {
      title: "Sweetn",
      imageUrl: "/pic-5.jpeg"
    },
    {
      title: "Cuddlebug",
      imageUrl: "/pic-6.jpeg"
    },
    {
      title: "Angel",
      imageUrl: "/pic-7.jpeg"
    },
    {
      title: "Honeybunch",
      imageUrl: "/pic-8.jpeg"
    },
    {
      title: "Sunshine",
      imageUrl: "/pic-9.jpeg"
    },
    {
      title: "Darling",
      imageUrl: "/pic-10.jpeg"
    }
  ];
  
  
  
  useEffect(() => {
    // Rotate quotes
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Turn page function
  const turnPage = (direction) => {
    if (direction === 'next' && currentPage < photoPages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Send WhatsApp message
  const sendWhatsAppMessage = () => {
    // Show heart burst animation
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 1500);
    
    // Get random message
    const randomIndex = Math.floor(Math.random() * whatsappMessages.length);
    const message = whatsappMessages[randomIndex];
    
    // Create WhatsApp URL and open it
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/918107505074?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
  };
  
  // Generate hearts for explosion
  const generateHearts = () => {
    return Array.from({ length: 20 }).map((_, i) => {
      const angle = (i / 20) * 360;
      const distance = Math.random() * 100 + 50;
      const size = Math.random() * 20 + 10;
      const duration = Math.random() * 1 + 1;
      
      return (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ 
            x: Math.cos(angle * Math.PI / 180) * distance,
            y: Math.sin(angle * Math.PI / 180) * distance,
            scale: [0, 1, 0],
            opacity: [0, 1, 0]
          }}
          transition={{ duration: duration }}
          className="absolute"
          style={{ left: '50%', top: '50%' }}
        >
          <Heart fill="#ff3e8e" size={size} />
        </motion.div>
      );
    });
  };
  
  // Generate floating elements
  const generateFloatingElements = () => {
    const elements = [];
    const components = [Star, Sparkles, Music];
    
    for (let i = 0; i < 10; i++) {
      const ElementComponent = components[i % components.length];
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const size = Math.random() * 15 + 10;
      const delay = Math.random() * 5;
      const duration = Math.random() * 10 + 5;
      
      elements.push(
        <motion.div
          key={`float-${i}`}
          className="absolute text-yellow-300 opacity-70"
          style={{ top: `${top}%`, left: `${left}%` }}
          animate={{
            y: ['-20px', '20px'],
            x: ['10px', '-10px'],
            rotate: [0, 360],
          }}
          transition={{
            y: { duration: duration, repeat: Infinity, repeatType: 'reverse' },
            x: { duration: duration * 0.7, repeat: Infinity, repeatType: 'reverse' },
            rotate: { duration: duration * 2, repeat: Infinity, ease: 'linear' },
            delay: delay
          }}
        >
          <ElementComponent size={size} />
        </motion.div>
      );
    }
    
    return elements;
  };
  
  return (
    <div className="bg-purple-900 min-h-screen relative overflow-hidden">
      {/* Background floating elements */}
      {generateFloatingElements()}
      
      {/* Top string lights */}
      <div className="w-full h-10 relative overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={`light-${i}`}
            className="absolute top-4"
            style={{ left: `${i * 10 + 5}%` }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
              delay: i * 0.2 % 1
            }}
          >
            <div className="w-3 h-3 rounded-full bg-yellow-300 shadow-lg"></div>
            <div className="w-px h-3 bg-yellow-300/50 mx-auto"></div>
          </motion.div>
        ))}
      </div>
      
      
      {/* SONA Name with stars */}
      <div className="relative w-full text-center mb-4 mt-6">
        <motion.div
          className="absolute top-0 left-1/4 text-yellow-300"
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <Star size={24} />
        </motion.div>
        <h1 className="text-7xl font-bold text-pink-300">SONA</h1>
        <motion.div
          className="absolute bottom-0 right-1/4 text-yellow-300"
          animate={{ rotate: -360, scale: [1, 1.2, 1] }}
          transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
        >
          <Star size={24} />
        </motion.div>
      </div>
      
      {/* Happy Birthday text */}
      <div className="text-center mb-4">
        <h2 className="text-2xl text-white">Happy Birthday! 🎂</h2>
      </div>
      
      {/* Separator */}
      <div className="px-4 mb-8">
        <div className="h-8 bg-black/30 w-full rounded-md"></div>
      </div>
      
      {/* Quote Card */}
      <div className="px-4 mb-8">
        <div className="bg-purple-800/50 rounded-lg p-4 relative">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentQuoteIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-white text-center"
            >
              {quotes[currentQuoteIndex]}
            </motion.p>
          </AnimatePresence>
          
          {/* Corner hearts */}
          <Heart 
            className="absolute -top-3 -left-3 text-pink-500" 
            fill="#ec4899" 
            size={24} 
          />
          <Heart 
            className="absolute -bottom-3 -right-3 text-pink-500" 
            fill="#ec4899" 
            size={24} 
          />
        </div>
      </div>
      
      {/* Our memories banner */}
      <div className="px-4 mb-8">
        <div className="bg-purple-950 rounded-lg p-4 relative flex items-center justify-center">
          <p className="text-white font-medium text-center">
            Our talk light up my life in such few days 💖
          </p>
        </div>
      </div>
      
      {/* Photo Album Book - with images instead of text */}
      <div className="px-4 mb-8">
        <div className="w-full flex justify-center">
          <div className="relative w-full max-w-md h-72 perspective">
            {/* Book container with spine */}
            <div className="w-full h-full flex justify-center items-center">
              {/* Book spine */}
              <div className="w-6 h-full bg-gradient-to-r from-purple-950 via-purple-800 to-purple-950 rounded-l-sm z-10"></div>
              
              {/* Page content - now with image */}
              <div className="w-64 h-full bg-white rounded-r-lg p-4 shadow-lg flex flex-col items-center">
                {/* Page label */}
                {/* <div className="w-20 h-6 bg-pink-200 rounded-lg flex items-center justify-center text-xs font-medium mb-2">
                  Memory {currentPage + 1}
                </div> */}
                
                {/* Photo */}
                <div className="w-full h-48 rounded-lg overflow-hidden mb-2 border-2 border-pink-100">
                  <img 
                    src={photoPages[currentPage].imageUrl}
                    alt={photoPages[currentPage].title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Photo title */}
                <h3 className="text-center text-lg font-bold text-pink-700">
                  {photoPages[currentPage].title}
                </h3>
                
                {/* Page number */}
                <div className="absolute bottom-2 right-4 text-gray-600 text-sm">
                  {currentPage + 1} / {photoPages.length}
                </div>
              </div>
            </div>
            
            {/* Navigation controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center justify-between gap-4 z-20">
              <button 
                className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center"
                onClick={() => turnPage('prev')}
                disabled={currentPage === 0}
              >
                ←
              </button>
              
              {/* <span className="text-white bg-purple-700 px-3 py-1 rounded-full text-sm">
                {currentPage + 1} / {photoPages.length}
              </span> */}
              
              <button 
                className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center"
                onClick={() => turnPage('next')}
                disabled={currentPage === photoPages.length - 1}
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Send Birthday Love Button */}
      <div className="px-4 mb-8 relative">
        <button 
          className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white font-bold text-xl shadow-lg"
          onClick={sendWhatsAppMessage}
        >
          Send Birthday Love! 💝
        </button>
        
        {/* Star decoration */}
        <motion.div
          className="absolute -bottom-3 right-8 text-yellow-300"
          animate={{ rotate: 360, opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Star size={16} />
        </motion.div>
        
        {/* Heart burst animation */}
        {showHeartBurst && (
          <div className="absolute inset-0 pointer-events-none">
            {generateHearts()}
          </div>
        )}
      </div>
      
      {/* Birthday Message - Updated for new friendship */}
      <div className="px-4 pb-12">
        <div className="bg-purple-800/50 p-5 rounded-lg">
          <h3 className="text-2xl font-bold text-white mb-3">Dear SONA,</h3>
          <p className="text-white mb-3">
            Even though we have only known each other for a few days, I wanted to wish you a very happy birthday! Its amazing how quickly we connected.
          </p>
          <p className="text-white mb-3">
            I am looking forward to all the fun times ahead and getting to know you better. Here are to many more memories to come!
          </p>
          <p className="text-white font-medium">
            Hope your special day is filled with all the joy and happiness you deserve!
          </p>
          <p className="text-right text-white mt-4">With love, Ansh ❤️</p>
        </div>
      </div>
      
      {/* CSS Styles */}
      <style>{`
        .perspective {
          perspective: 1200px;
        }
        
        .book-container {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
};

export default BirthdayCard;