/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

const CustomYouTubePlayer = ({ videoId, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  
  // Load YouTube API script
  useEffect(() => {
    // Only load YouTube API once
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }
    
    return () => {
      // Clean up YouTube API events when component unmounts
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);
  
  // Initialize the player
  const initializePlayer = () => {
    if (window.YT && window.YT.Player) {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      
      playerRef.current = new window.YT.Player(`youtube-player-${videoId}`, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,       // Hide YouTube controls
          rel: 0,            // Don't show related videos
          showinfo: 0,       // Hide video info
          modestbranding: 1, // Minimal YouTube branding
          iv_load_policy: 3, // Hide annotations
          fs: 0,             // Disable YouTube's fullscreen button
          playsinline: 1,    // Play inline on mobile
          origin: window.location.origin
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange
        }
      });
    } else {
      // Try again in 100ms if YouTube API isn't loaded yet
      setTimeout(initializePlayer, 100);
    }
  };
  
  const onPlayerReady = (event) => {
    setPlayerReady(true);
  };
  
  const onPlayerStateChange = (event) => {
    // Update play/pause state based on player state
    setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
    
    // Re-enable pointer events when video is playing (allowing seeking)
    const wrapperElement = document.querySelector('.hide-youtube-ui');
    if (wrapperElement) {
      if (event.data === window.YT.PlayerState.PLAYING) {
        wrapperElement.classList.add('playing');
      } else {
        wrapperElement.classList.remove('playing');
      }
    }
  };
  
  // Custom controls functions
  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
      } else {
        playerRef.current.mute();
      }
      setIsMuted(!isMuted);
    }
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  // Update fullscreen state when exiting via Escape key
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  return (
    <div className="video-container" ref={containerRef}>
      <div className={`hide-youtube-ui ${isPlaying ? 'playing' : ''}`}>
        <div className="aspect-w-16">
          <div id={`youtube-player-${videoId}`}></div>
          
          {/* Overlay play button for better UX */}
          {!isPlaying && !playerReady && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer"
              onClick={togglePlay}
            >
              <div className="w-20 h-20 bg-pink-500/80 rounded-full flex items-center justify-center">
                <Play className="w-10 h-10 text-white ml-1" />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Custom controls */}
      <div className="custom-video-controls">
        <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        
        <div className="flex-grow mx-4">
          <div className="text-sm text-gray-300 truncate">{title}</div>
        </div>
        
        <button onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        
        <button onClick={toggleFullscreen} className="ml-2" aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default CustomYouTubePlayer;