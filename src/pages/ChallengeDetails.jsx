import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Grid, List, ArrowLeft, ArrowRight, Play } from 'lucide-react';
import Navbar from '../components/Navigation/Header';
import Footer from '../components/Footer/Footer';
import challengeData from '../data/challengeData';

const ChallengeDetails = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    // Find the challenge that matches the ID
    const selectedChallenge = challengeData.find(c => c.id === challengeId);
    
    if (selectedChallenge) {
      setChallenge(selectedChallenge);
      
      // Simulate loading
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);
      
      return () => clearTimeout(timer);
    } else {
      // If no matching challenge is found, navigate back to challenges page
      navigate('/challenges');
    }
  }, [challengeId, navigate]);

  // Get next and previous challenges
  const getAdjacentChallenges = () => {
    if (!challenge) return { prev: null, next: null };
    
    const currentIndex = challengeData.findIndex(c => c.id === challengeId);
    const prev = currentIndex > 0 ? challengeData[currentIndex - 1] : null;
    const next = currentIndex < challengeData.length - 1 ? challengeData[currentIndex + 1] : null;
    
    return { prev, next };
  };

  const { prev, next } = getAdjacentChallenges();

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  if (isLoading || !challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-violet-900 flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-violet-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-20 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full md:w-1/2 h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-br-[100px] -z-10"></div>
        <div className="absolute -top-24 left-0 w-96 h-96 bg-gradient-to-br from-purple-500 to-blue-400 rounded-full filter blur-3xl opacity-20 -z-10"></div>
        <div className="absolute top-1/3 -right-24 w-80 h-80 bg-gradient-to-tr from-pink-500 to-orange-500 rounded-full filter blur-3xl opacity-20 -z-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <Link 
                to="/challenges" 
                className="inline-flex items-center text-pink-300 hover:text-pink-400 transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to All Challenges
              </Link>
              
              <motion.h1 
                className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {challenge.title}
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-200 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {challenge.description}
              </motion.p>
              
              <motion.div 
                className="flex items-center gap-4 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                  <span className="text-pink-300 font-medium">{challenge.videos.length} Days</span>
                </div>
                
                <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                  <span className="text-blue-300 font-medium">21 Minutes Daily</span>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              className="lg:w-1/2 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative p-2 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 shadow-2xl">
                <img 
                  src={challenge.thumbnail} 
                  alt={challenge.title} 
                  className="rounded-2xl w-full h-full object-cover"
                  style={{ maxHeight: '400px' }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Videos Section */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 to-indigo-900/50 -z-10"></div>
        
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Your 21-Day Journey
            </h2>
            
            <div className="flex items-center p-1 bg-white/10 backdrop-blur-sm rounded-lg">
              <button 
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white/20' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid View"
              >
                <Grid className={`w-5 h-5 ${viewMode === 'grid' ? 'text-pink-300' : 'text-gray-300'}`} />
              </button>
              
              <button 
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white/20' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List View"
              >
                <List className={`w-5 h-5 ${viewMode === 'list' ? 'text-pink-300' : 'text-gray-300'}`} />
              </button>
            </div>
          </div>
          
          {viewMode === 'grid' ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {challenge.videos.map((video, index) => (
                <motion.div
                  key={video.id}
                  className="group"
                  variants={itemVariants}
                >
                  <Link to={`/challenges/${challengeId}/${video.id}`} className="block">
                    <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg">
                      {/* Video Thumbnail */}
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        
                        {/* Day Indicator */}
                        <div className="absolute top-4 left-4 bg-pink-500 rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-sm">D{index + 1}</span>
                        </div>
                        
                        {/* Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white">
                            <Play className="w-6 h-6 text-white fill-white" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Video Info */}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-white line-clamp-1">{video.title}</h3>
                        <p className="text-gray-300 text-sm mt-2 line-clamp-2">{video.description}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {challenge.videos.map((video, index) => (
                <motion.div
                  key={video.id}
                  variants={itemVariants}
                >
                  <Link to={`/challenges/${challengeId}/${video.id}`} className="block">
                    <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden transition-all duration-300 hover:bg-white/20">
                      <div className="flex items-center p-4">
                        {/* Day Number */}
                        <div className="bg-pink-500 rounded-full w-10 h-10 flex items-center justify-center shadow-lg mr-4 flex-shrink-0">
                          <span className="text-white font-bold text-sm">D{index + 1}</span>
                        </div>
                        
                        {/* Thumbnail */}
                        <div className="relative w-24 h-16 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Play className="w-5 h-5 text-white fill-white" />
                          </div>
                        </div>
                        
                        {/* Info */}
                        <div className="flex-grow">
                          <h3 className="text-white font-bold line-clamp-1">{video.title}</h3>
                          <p className="text-gray-300 text-sm line-clamp-1">{video.description}</p>
                        </div>
                        
                        {/* Arrow */}
                        <ArrowRight className="w-5 h-5 text-pink-300 flex-shrink-0" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Next/Previous Challenge Navigation */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/50 to-purple-900/50 -z-10"></div>
        
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-10 text-center">Explore More Challenges</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {prev && (
              <Link to={`/challenges/${prev.id}`} className="block">
                <div className="relative bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden transition-all duration-300 hover:bg-white/20 p-6">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center bg-purple-500/20 rounded-full p-3 mr-4">
                      <ArrowLeft className="w-5 h-5 text-purple-300" />
                    </div>
                    <div>
                      <span className="text-purple-300 text-sm block">Previous Challenge</span>
                      <h3 className="text-white font-bold">{prev.title}</h3>
                    </div>
                  </div>
                </div>
              </Link>
            )}
            
            {next && (
              <Link to={`/challenges/${next.id}`} className="block">
                <div className="relative bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden transition-all duration-300 hover:bg-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-pink-300 text-sm block">Next Challenge</span>
                      <h3 className="text-white font-bold">{next.title}</h3>
                    </div>
                    <div className="flex items-center justify-center bg-pink-500/20 rounded-full p-3">
                      <ArrowRight className="w-5 h-5 text-pink-300" />
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ChallengeDetails;