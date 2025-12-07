/* eslint-disable import/no-duplicates */
/* eslint-disable no-unused-vars */
// src/App.js - Enhanced with futuristic features
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
// import { ErrorBoundary } from 'react-error-boundary';
import { Suspense, lazy, useEffect, useState } from 'react';

// Core components
import Navbar from './components/Navigation/Header';
import Footer from './components/Footer/Footer';
import NotFound from './pages/NotFound';
import ErrorFallback from './components/ErrorBoundary';
import LoadingSpinner from './components/UI/LoadingSpinner';

// PWA components
import { usePWA } from './hooks/usePWA';
import { useAnalytics } from './hooks/useAnalytics';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/21-days'));
const Home2 = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Challenges = lazy(() => import('./pages/Challenges'));
const ChallengeDetails = lazy(() => import('./pages/ChallengeDetails'));
const VideoPlayer = lazy(() => import('./components/programs/VideoPlayer'));
const Recipes = lazy(() => import('./pages/Recipies'));
const RecipeDetail = lazy(() => import('./components/Recipes/RecipeDetail'));
const VideoDisplay = lazy(() => import('./pages/api/video'));

// Performance utilities
import { prefetchRoutes, registerSW } from './utils/performance';
import ErrorBoundary from './components/ErrorBoundary';
import BirthdaySurprise from './pages/Birthday';
import BMICalculator from './components/common/BMICalculator';

const App = () => {
  const { installPrompt, isOnline, installApp } = usePWA();
  const { trackPageView } = useAnalytics();
  
  // Add state to control install prompt visibility
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Register service worker
    registerSW();
    
    // Prefetch critical routes
    prefetchRoutes();
    
    // Track initial page view
    trackPageView('app_loaded');
    
    // Check if install prompt should be shown
    const isDismissed = window.localStorage.getItem('installPromptDismissed');
    if (installPrompt && !isDismissed) {
      setShowInstallPrompt(true);
    }
  }, [trackPageView, installPrompt]);

  // Update visibility when installPrompt changes
  useEffect(() => {
    const isDismissed = window.localStorage.getItem('installPromptDismissed');
    setShowInstallPrompt(!!installPrompt && !isDismissed);
  }, [installPrompt]);

  const handleInstallApp = async () => {
    await installApp();
    setShowInstallPrompt(false);
  };

  const handleDismissPrompt = () => {
    setShowInstallPrompt(false);
    window.localStorage.setItem('installPromptDismissed', 'true');
  };

  return (
    <HelmetProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Router>
          <div className="App bg-gradient-to-b from-indigo-900 via-purple-900 to-violet-900 min-h-screen">
            {/* <Navbar /> */}
            
            {/* PWA Components */}
            {/* <InstallPrompt 
              isVisible={showInstallPrompt} 
              onInstall={handleInstallApp}
              onDismiss={handleDismissPrompt}
            /> */}
            
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Core Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/bmi" element={<BMICalculator />} />
                
                {/* Challenges & Videos */}
                <Route path="/challenges" element={<BirthdaySurprise />} />
                <Route path="/challenges/:challengeId" element={<ChallengeDetails />} />
                <Route path="/challenges/:challengeId/:videoId" element={<VideoPlayer />} />
                <Route path="/videos" element={<VideoDisplay />} />
                
                {/* Nutrition */}
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/recipe/:id" element={<RecipeDetail />} />
                
                <Route path="/birthday/ragini" element={<BirthdaySurprise />} />
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>

            {/* <Footer /> */}
          </div>
        </Router>
      </ErrorBoundary>
    </HelmetProvider>
  );
};

export default App;