/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react';
import Navbar from '../Navigation/Header';
import Footer from '../Footer/Footer';
import CustomYouTubePlayer from './CustomYouTubePlayer';
import challengeData from '../../data/challengeData';

const VideoPlayer = () => {
  const { challengeId, videoId } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [video, setVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [videoIndex, setVideoIndex] = useState(0);

  useEffect(() => {
    // Find the challenge and video that match the IDs
    const selectedChallenge = challengeData.find(c => c.id === challengeId);
    
    if (selectedChallenge) {
      setChallenge(selectedChallenge);
      
      const selectedVideo = selectedChallenge.videos.find(v => v.id === videoId);
      const index = selectedChallenge.videos.findIndex(v => v.id === videoId);
      
      if (selectedVideo && index !== -1) {
        setVideo(selectedVideo);
        setVideoIndex(index);
        
        // Simulate loading
        const timer = setTimeout(() => {
          setIsLoading(false);
        }, 800);
        
        return () => clearTimeout(timer);
      } else {
        // If no matching video is found, navigate back to challenge page
        navigate(`/challenges/${challengeId}`);
      }
    } else {
      // If no matching challenge is found, navigate back to challenges page
      navigate('/challenges');
    }
  }, [challengeId, videoId, navigate]);

  // Get previous and next videos
  const getPrevNextVideos = () => {
    if (!challenge || videoIndex === undefined) return { prev: null, next: null };
    
    const prev = videoIndex > 0 ? challenge.videos[videoIndex - 1] : null;
    const next = videoIndex < challenge.videos.length - 1 ? challenge.videos[videoIndex + 1] : null;
    
    return { prev, next };
  };

  const { prev, next } = getPrevNextVideos();

  if (isLoading || !challenge || !video) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-violet-900 flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-violet-900 pt-10">
      <Navbar />

      {/* Video Section */}
      <section className="pt-10 pb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 to-purple-900/90 -z-10"></div>
        
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <Link 
                to={`/challenges/${challengeId}`} 
                className="inline-flex items-center text-pink-300 hover:text-pink-400 transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {challenge.title}
              </Link>


      {/* Breadcrumb Navigation */}
      <div className=" border-b border-indigo-800/50">
        <div className="container mx-auto py-4">
          <div className="flex items-center text-sm">
            <Link to="/challenges" className="text-gray-400 hover:text-pink-300 transition-colors">
              Challenges
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link to={`/challenges/${challengeId}`} className="text-gray-400 hover:text-pink-300 transition-colors">
              {challenge.title}
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-pink-300">Day {videoIndex + 1}</span>
          </div>
        </div>
      </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{video.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center text-gray-300">
                  <Calendar className="w-4 h-4 mr-2 text-pink-400" />
                  <span>Day {videoIndex + 1} of {challenge.videos.length}</span>
                </div>
                
                <div className="flex items-center text-gray-300">
                  <Clock className="w-4 h-4 mr-2 text-pink-400" />
                  <span>21 Minutes</span>
                </div>
              </div>
            </div>
            
            
            {/* Video Player */}
            <div className="max-w-5xl mx-auto mb-8">
              <CustomYouTubePlayer 
                videoId={video.videoId || video.videoUrl.split('/').pop()} 
                title={video.title} 
              />
            </div>
            
            {/* Description */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-10">
              <h2 className="text-xl font-bold text-white mb-4">About This Session</h2>
              <p className="text-gray-300 leading-relaxed">{video.description}</p>
            </div>
            
            {/* Navigation Between Videos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prev ? (
                <Link 
                  to={`/challenges/${challengeId}/${prev.id}`}
                  className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4 transition-all hover:bg-white/20"
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center bg-purple-500/20 rounded-full p-2 mr-3">
                      <ArrowLeft className="w-4 h-4 text-purple-300" />
                    </div>
                    <div>
                      <span className="text-purple-300 text-xs block">Previous Day</span>
                      <h3 className="text-white font-medium text-sm md:text-base line-clamp-1">{prev.title}</h3>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="hidden md:block"></div>
              )}
              
              {next ? (
                <Link 
                  to={`/challenges/${challengeId}/${next.id}`}
                  className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4 transition-all hover:bg-white/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-pink-300 text-xs block">Next Day</span>
                      <h3 className="text-white font-medium text-sm md:text-base line-clamp-1">{next.title}</h3>
                    </div>
                    <div className="flex items-center justify-center bg-pink-500/20 rounded-full p-2">
                      <ArrowRight className="w-4 h-4 text-pink-300" />
                    </div>
                  </div>
                </Link>
              ) : (
                <Link 
                  to={`/challenges/${challengeId}`}
                  className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4 transition-all hover:bg-white/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-green-300 text-xs block">Challenge Complete!</span>
                      <h3 className="text-white font-medium text-sm md:text-base">Return to Challenge Overview</h3>
                    </div>
                    <div className="flex items-center justify-center bg-green-500/20 rounded-full p-2">
                      <ArrowRight className="w-4 h-4 text-green-300" />
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* More From This Challenge Section */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 to-indigo-900/50 -z-10"></div>
        
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-8">More From This Challenge</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {challenge.videos
              .filter((_, i) => i !== videoIndex) // Exclude current video
              .slice(0, 4) // Show only 4 videos
              .map((relatedVideo, index) => (
                <Link 
                  key={relatedVideo.id}
                  to={`/challenges/${challengeId}/${relatedVideo.id}`}
                  className="block"
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden transition-all hover:bg-white/20">
                    <div className="relative h-32">
                      <img 
                        src={relatedVideo.thumbnail} 
                        alt={relatedVideo.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30"></div>
                      
                      {/* Day Indicator */}
                      <div className="absolute top-2 left-2 bg-pink-500 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xs">
                          D{challenge.videos.findIndex(v => v.id === relatedVideo.id) + 1}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <h3 className="text-white font-medium text-sm line-clamp-2">{relatedVideo.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
          
          <div className="mt-8 text-center">
            <Link 
              to={`/challenges/${challengeId}`}
              className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-medium hover:bg-white/20 transition-colors"
            >
              View All 21 Days
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Related Challenges Section */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/50 to-purple-900/50 -z-10"></div>
        
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-8">You May Also Like</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {challengeData
              .filter(c => c.id !== challengeId) // Exclude current challenge
              .slice(0, 3) // Show only 3 challenges
              .map((relatedChallenge) => (
                <Link 
                  key={relatedChallenge.id}
                  to={`/challenges/${relatedChallenge.id}`}
                  className="block"
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden transition-all hover:bg-white/20">
                    <div className="relative h-40">
                      <img 
                        src={relatedChallenge.thumbnail} 
                        alt={relatedChallenge.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      
                      <div className="absolute bottom-3 left-3">
                        <h3 className="text-white font-bold">{relatedChallenge.title}</h3>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VideoPlayer;