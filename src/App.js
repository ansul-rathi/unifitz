
// src/App.js - Enhanced with futuristic features
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
// import { ErrorBoundary } from 'react-error-boundary';
import { Suspense, lazy, useEffect } from 'react';

// Core components
import Navbar from './components/Navigation/Header';
import Footer from './components/Footer/Footer';
import NotFound from './pages/NotFound';
import ErrorFallback from './components/ErrorBoundary';
import LoadingSpinner from './components/UI/LoadingSpinner';

// PWA components
import InstallPrompt from './components/PWA/InstallPrompt';
import OfflineIndicator from './components/PWA/OfflineIndicator';
import { usePWA } from './hooks/usePWA';
import { useAnalytics } from './hooks/useAnalytics';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Challenges = lazy(() => import('./pages/Challenges'));
const LiveStudio = lazy(() => import('./pages/LiveStudio'));
const AIFitnessHub = lazy(() => import('./pages/AIFitnessHub'));
const ChallengeDetails = lazy(() => import('./pages/ChallengeDetails'));
const VideoPlayer = lazy(() => import('./components/programs/VideoPlayer'));
const Recipes = lazy(() => import('./pages/Recipies'));
const RecipeDetail = lazy(() => import('./components/Recipes/RecipeDetail'));
const VideoDisplay = lazy(() => import('./pages/api/video'));

// Futuristic features
const UserDashboard = lazy(() => import('./components/Analytics/UserDashboard.jsx'));
const ChallengeSystem = lazy(() => import('./components/Gamification/ChallengeSystem'));
const AIFitnessCoach = lazy(() => import('./components/FuturisticFeatures/AIFitnessCoach'));
const SmartNutritionAI = lazy(() => import('./components/FuturisticFeatures/SmartNutritionAI'));

// Performance utilities
import { prefetchRoutes, registerSW } from './utils/performance';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  const { installPrompt, isOnline, installApp } = usePWA();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    // Register service worker
    registerSW();
    
    // Prefetch critical routes
    prefetchRoutes();
    
    // Track initial page view
    trackPageView('app_loaded');
  }, [trackPageView]);

  return (
    <HelmetProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Router>
          <div className="App bg-gradient-to-b from-indigo-900 via-purple-900 to-violet-900 min-h-screen">
            <Navbar />
            
            {/* PWA Components */}
            <InstallPrompt 
              isVisible={!!installPrompt} 
              onInstall={installApp}
              onDismiss={() => window.localStorage.setItem('installPromptDismissed', 'true')}
            />
            <OfflineIndicator isOnline={isOnline} />
            
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Core Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Challenges & Videos */}
                <Route path="/challenges" element={<Challenges />} />
                <Route path="/challenges/:challengeId" element={<ChallengeDetails />} />
                <Route path="/challenges/:challengeId/:videoId" element={<VideoPlayer />} />
                <Route path="/videos" element={<VideoDisplay />} />
                
                {/* Nutrition */}
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/recipe/:id" element={<RecipeDetail />} />
                
                {/* Futuristic Features */}
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/gamification" element={<ChallengeSystem />} />
                <Route path="/ai-coach" element={<AIFitnessCoach />} />
                <Route path="/nutrition-ai" element={<SmartNutritionAI />} />
                <Route path="/live-studio" element={<LiveStudio />} />
                <Route path="/ai-fitness-hub" element={<AIFitnessHub />} />
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            
            <Footer />
          </div>
        </Router>
      </ErrorBoundary>
    </HelmetProvider>
  );
};

export default App;