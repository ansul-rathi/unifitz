// src/hooks/useAnalytics.js
import { useEffect } from 'react';

export const useAnalytics = () => {
  useEffect(() => {
    // Initialize analytics
    if (typeof window !== 'undefined') {
      // Google Analytics 4
      window.gtag = window.gtag || function() {
        (window.gtag.q = window.gtag.q || []).push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', 'GA_MEASUREMENT_ID');

      // Facebook Pixel
      !(function(f,b,e,v,n,t,s) {
        if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)
      })(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      
      window.fbq('init', 'FACEBOOK_PIXEL_ID');
      window.fbq('track', 'PageView');
    }
  }, []);

  const trackEvent = (eventName, properties = {}) => {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', eventName, properties);
    }

    // Facebook Pixel
    if (window.fbq) {
      window.fbq('track', eventName, properties);
    }

    // Custom analytics
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventName,
        properties,
        timestamp: new Date().toISOString(),
        sessionId: getSessionId(),
        userId: getUserId()
      })
    }).catch(console.error);
  };

  const trackWorkoutStart = (workoutType) => {
    trackEvent('workout_started', {
      workout_type: workoutType,
      timestamp: new Date().toISOString()
    });
  };

  const trackWorkoutComplete = (workoutType, duration, caloriesBurned) => {
    trackEvent('workout_completed', {
      workout_type: workoutType,
      duration_minutes: duration,
      calories_burned: caloriesBurned,
      timestamp: new Date().toISOString()
    });
  };

  const trackPageView = (pageName) => {
    trackEvent('page_view', {
      page_name: pageName,
      timestamp: new Date().toISOString()
    });
  };

  return {
    trackEvent,
    trackWorkoutStart,
    trackWorkoutComplete,
    trackPageView
  };
};

const getSessionId = () => {
  let sessionId = sessionStorage.getItem('unifitz_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('unifitz_session_id', sessionId);
  }
  return sessionId;
};

const getUserId = () => {
  return localStorage.getItem('unifitz_user_id') || 'anonymous';
};