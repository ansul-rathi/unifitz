/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import { Heart, Gift, Sparkles, Music, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BirthdaySurprise = () => {
  const [timeLeft, setTimeLeft] = useState({});
  const [showSurprise, setShowSurprise] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [letterOpen, setLetterOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);

  const birthdayDate = new Date('2025-10-15T00:00:00');

  const photos = [
    { url: '/birthday/1.jpeg', caption: '' },
    { url: '/birthday/2.jpeg', caption: '' },
    { url: '/birthday/3.jpeg', caption: '' },
    { url: '/birthday/4.jpeg', caption: '' },
    { url: '/birthday/5.jpeg', caption: '' },
    { url: '/birthday/6.jpeg', caption: '' },
    { url: '/birthday/7.jpeg', caption: '' },
    { url: '/birthday/8.jpeg', caption: '' },
    { url: '/birthday/9.jpeg', caption: '' },
    { url: '/birthday/10.jpeg', caption: '' },
  ];

  const wishes = [
    "Rasmalai Ragini 💖 hamara romantic night walk under the stars 🌙",
    "Movie date aur mera baar baar soo jana 😘😴",
    "Swimming pool masti aur utha krr feekna 🏊‍♀️😂",
    "Dance, hugs, kisses 💃🫂 kya scene tha yarrr 😍",
    "Game challenges aur laughter 😎 Chamcham, tu hamesha jeet jaati hai",
    "Some more special romentic movemets , jaha koi aata jata nhi , i hope samaj gai hogi😜",
    "Tu meri sabse sweet mithai hai, aur main tera permanent rasgulla 😘 Happy Birthday meri Rasmalai! 🎂💞"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = birthdayDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentImageIndex((prev) => (prev + 1) % photos.length);
  //   }, 4000);
  //   return () => clearInterval(interval);
  // }, []);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % photos.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);

  const FloatingHeart = ({ delay = 0, duration = 3 }) => (
    <motion.div
      initial={{ y: '100vh', x: Math.random() * 100 - 50, opacity: 0 }}
      animate={{ y: '-100vh', x: Math.random() * 100 - 50, opacity: [0, 1, 1, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
      className="absolute"
      style={{ left: `${Math.random() * 100}%` }}
    >
      <Heart className="text-pink-400 fill-pink-400" size={20 + Math.random() * 20} />
    </motion.div>
  );

  const Sparkle = ({ delay = 0 }) => (
    <motion.div
      initial={{ scale: 0, rotate: 0 }}
      animate={{ scale: [0, 1, 0], rotate: [0, 180, 360], opacity: [0, 1, 0] }}
      transition={{ duration: 2, delay, repeat: Infinity, repeatDelay: 1 }}
      className="absolute"
      style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
    >
      <Sparkles className="text-yellow-300" size={16} />
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-rose-900 overflow-hidden relative">
      {[...Array(15)].map((_, i) => <FloatingHeart key={i} delay={i * 0.5} duration={3 + Math.random() * 2} />)}
      {[...Array(20)].map((_, i) => <Sparkle key={i} delay={i * 0.3} />)}

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setMusicPlaying(!musicPlaying)}
        className="fixed top-6 right-6 z-50 bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/30 transition-all"
      >
        {musicPlaying ? <Music size={24} /> : <Music size={24} className="opacity-50" />}
      </motion.button>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <motion.h2 initial={{ scale: 0.8 }} animate={{ scale: [0.8, 1.1, 1] }} transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold text-white mb-8 font-serif">
            Counting Down to Your Special Day Baby 💕
          </motion.h2>

          <div className="flex justify-center gap-4 flex-wrap">
            {Object.entries(timeLeft).map(([unit, value], index) => (
              <motion.div key={unit} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}
                className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 min-w-[100px] border-2 border-white/30">
                <motion.div key={value} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-5xl font-bold text-white">
                  {value}
                </motion.div>
                <div className="text-pink-200 text-sm uppercase mt-2">{unit}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {!showSurprise && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="inline-block mb-8">
              <Gift className="text-yellow-300" size={80} />
            </motion.div>

            <motion.h1 initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
              className="text-6xl md:text-8xl font-bold text-white mb-8 font-serif">
              It's Your Birthday Rasmalai! 🎉
            </motion.h1>

            <motion.button whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(255, 255, 255, 0.5)' }}
              whileTap={{ scale: 0.95 }} onClick={() => setShowSurprise(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-12 py-4 rounded-full text-2xl font-semibold shadow-2xl hover:from-pink-600 hover:to-purple-700 transition-all">
              Click for Your Surprise! 💝
            </motion.button>
          </motion.div>
        )}

        <AnimatePresence>
          {showSurprise && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Birthday Wishes */}
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-center mb-16">
                <motion.h1 initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                  className="text-5xl md:text-7xl font-bold text-white mb-12 font-serif">
                  Happy Birthday Baby! 💖
                </motion.h1>

                <div className="space-y-6 max-w-3xl mx-auto">
                  {wishes.map((wish, index) => (
                    <motion.div key={index} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.3 }}
                      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                      <p className="text-white text-xl md:text-2xl font-light leading-relaxed">
                        {wish}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Photo Carousel */}
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }} className="mb-16 max-w-4xl mx-auto">
                <h2 className="text-4xl font-bold text-white text-center mb-8 font-serif">
                  Our Beautiful Moments 📸
                </h2>
                <div className="relative">
                  <AnimatePresence mode="wait">
                    <motion.div key={currentImageIndex} initial={{ opacity: 0, scale: 0.8, rotateY: 90 }} animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      exit={{ opacity: 0, scale: 0.8, rotateY: -90 }} transition={{ duration: 0.5 }} className="relative">
<img
  src={photos[currentImageIndex].url}
  alt="Memory"
  className="w-full aspect-[9/16] md:aspect-[9/16] object-cover rounded-3xl shadow-2xl"
/>
                      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-3xl">
                        <p className="text-white text-2xl text-center font-light">{photos[currentImageIndex].caption}</p>
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>

                  <motion.button whileHover={{ scale: 1.1, x: -5 }} whileTap={{ scale: 0.9 }} onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/30">
                    <ChevronLeft size={32} />
                  </motion.button>

                  <motion.button whileHover={{ scale: 1.1, x: 5 }} whileTap={{ scale: 0.9 }} onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/30">
                    <ChevronRight size={32} />
                  </motion.button>
                </div>
              </motion.div>

              {/* Final Message */}
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.8 }} className="text-center py-16">
                <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}>
                  <Heart className="text-pink-400 fill-pink-400 mx-auto mb-6" size={80} />
                </motion.div>
                <h2 className="text-3xl font-bold text-white font-serif mb-4">
                  Forever meri Rasmalai Ragini 🌙
                </h2>
                <p className="text-white text-2xl font-light">
                  Always keep smiling Jaan❤️💋
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BirthdaySurprise;
