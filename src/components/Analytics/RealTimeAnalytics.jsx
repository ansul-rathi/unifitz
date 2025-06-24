/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// src/components/Analytics/RealTimeAnalytics.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Clock, 
  Heart,
  Zap,
  Target,
  BarChart3,
  Eye,
  Mouse,
  Smartphone,
  Monitor,
  Globe,
  Brain,
  Gauge,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';

const RealTimeAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    activeUsers: 0,
    pageViews: 0,
    sessionDuration: 0,
    bounceRate: 0,
    conversions: 0,
    workoutsStarted: 0,
    userEngagement: {
      scrollDepth: 0,
      timeOnPage: 0,
      interactions: 0,
      heatmapData: [] // Initialize as empty array
    },
    realTimeEvents: [], // Initialize as empty array
    deviceMetrics: {
      mobile: 0,
      desktop: 0,
      tablet: 0
    },
    performanceMetrics: {
      loadTime: 0,
      fcp: 0, // First Contentful Paint
      lcp: 0, // Largest Contentful Paint
      cls: 0, // Cumulative Layout Shift
      fid: 0  // First Input Delay
    },
    userBehavior: {
      clicks: [], // Initialize as empty array
      scrollPattern: [], // Initialize as empty array
      navigation: [] // Initialize as empty array
    }
  });

  const [isVisible, setIsVisible] = useState(false);
  const analyticsRef = useRef(null);
  const sessionStartTime = useRef(Date.now());
  const lastActivity = useRef(Date.now());
  const heatmapCanvas = useRef(null);

  // Initialize analytics tracking
  useEffect(() => {
    initializeAnalytics();
    
    return () => {
      // Cleanup
      if (analyticsRef.current) {
        clearInterval(analyticsRef.current);
      }
    };
  }, []);

  const initializeAnalytics = () => {
    // Track page load performance
    measurePerformanceMetrics();
    
    // Initialize user session
    trackUserSession();
    
    // Setup event listeners
    setupEventListeners();
    
    // Start real-time updates
    analyticsRef.current = setInterval(updateAnalytics, 2000);
  };

  const measurePerformanceMetrics = () => {
    // Web Vitals measurement
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            setAnalyticsData(prev => ({
              ...prev,
              performanceMetrics: {
                ...prev.performanceMetrics,
                loadTime: entry.loadEventEnd - entry.loadEventStart
              }
            }));
          }
          
          if (entry.entryType === 'paint') {
            if (entry.name === 'first-contentful-paint') {
              setAnalyticsData(prev => ({
                ...prev,
                performanceMetrics: {
                  ...prev.performanceMetrics,
                  fcp: entry.startTime
                }
              }));
            }
          }
          
          if (entry.entryType === 'largest-contentful-paint') {
            setAnalyticsData(prev => ({
              ...prev,
              performanceMetrics: {
                ...prev.performanceMetrics,
                lcp: entry.startTime
              }
            }));
          }
        }
      });
      
      try {
        observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
      } catch (error) {
        console.warn('Performance observer not supported:', error);
      }
    }
  };

  const trackUserSession = () => {
    const sessionId = generateSessionId();
    const deviceType = getDeviceType();
    
    setAnalyticsData(prev => ({
      ...prev,
      deviceMetrics: {
        ...prev.deviceMetrics,
        [deviceType]: prev.deviceMetrics[deviceType] + 1
      }
    }));
    
    // Track user agent and capabilities
    trackDeviceCapabilities();
  };

  const setupEventListeners = () => {
    // Mouse movement and clicks
    document.addEventListener('mousemove', trackMouseMovement);
    document.addEventListener('click', trackClick);
    document.addEventListener('scroll', trackScroll);
    
    // Keyboard interactions
    document.addEventListener('keydown', trackKeyboard);
    
    // Focus/blur for engagement
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    // Page visibility API
    document.addEventListener('visibilitychange', handleVisibilityChange);
  };

  const trackMouseMovement = useCallback((e) => {
    // Heatmap data collection
    if (heatmapCanvas.current && window.innerWidth && window.innerHeight) {
      const x = ((e.clientX / window.innerWidth) * 100).toFixed(1);
      const y = ((e.clientY / window.innerHeight) * 100).toFixed(1);
      
      setAnalyticsData(prev => ({
        ...prev,
        userEngagement: {
          ...prev.userEngagement,
          // Safely handle array operations with fallback
          heatmapData: [...(prev.userEngagement.heatmapData || []).slice(-100), { x, y, timestamp: Date.now() }]
        }
      }));
    }
    
    lastActivity.current = Date.now();
  }, []);

  const trackClick = useCallback((e) => {
    const element = e.target;
    const clickData = {
      element: element.tagName,
      id: element.id,
      className: element.className,
      x: e.clientX,
      y: e.clientY,
      timestamp: Date.now()
    };
    
    setAnalyticsData(prev => ({
      ...prev,
      userBehavior: {
        ...prev.userBehavior,
        // Safely handle array operations with fallback
        clicks: [...(prev.userBehavior.clicks || []).slice(-50), clickData]
      },
      userEngagement: {
        ...prev.userEngagement,
        interactions: prev.userEngagement.interactions + 1
      }
    }));
    
    lastActivity.current = Date.now();
  }, []);

  const trackScroll = useCallback(() => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );
    
    setAnalyticsData(prev => ({
      ...prev,
      userEngagement: {
        ...prev.userEngagement,
        scrollDepth: Math.max(prev.userEngagement.scrollDepth, scrollPercent),
        // Safely handle array operations with fallback
        scrollPattern: [...(prev.userEngagement.scrollPattern || []).slice(-20), {
          depth: scrollPercent,
          timestamp: Date.now()
        }]
      }
    }));
    
    lastActivity.current = Date.now();
  }, []);

  const trackKeyboard = useCallback((e) => {
    // Track meaningful keyboard interactions
    if (!e.ctrlKey && !e.altKey && !e.metaKey) {
      setAnalyticsData(prev => ({
        ...prev,
        userEngagement: {
          ...prev.userEngagement,
          interactions: prev.userEngagement.interactions + 1
        }
      }));
      
      lastActivity.current = Date.now();
    }
  }, []);

  const handleFocus = () => {
    setAnalyticsData(prev => ({
      ...prev,
      // Safely handle array operations with fallback
      realTimeEvents: [...(prev.realTimeEvents || []).slice(-20), {
        type: 'focus',
        timestamp: Date.now(),
        data: 'User returned to tab'
      }]
    }));
  };

  const handleBlur = () => {
    setAnalyticsData(prev => ({
      ...prev,
      // Safely handle array operations with fallback
      realTimeEvents: [...(prev.realTimeEvents || []).slice(-20), {
        type: 'blur',
        timestamp: Date.now(),
        data: 'User left tab'
      }]
    }));
  };

  const handleVisibilityChange = () => {
    const isVisible = !document.hidden;
    setAnalyticsData(prev => ({
      ...prev,
      // Safely handle array operations with fallback
      realTimeEvents: [...(prev.realTimeEvents || []).slice(-20), {
        type: isVisible ? 'visible' : 'hidden',
        timestamp: Date.now(),
        data: isVisible ? 'Page became visible' : 'Page became hidden'
      }]
    }));
  };

  const updateAnalytics = () => {
    const currentTime = Date.now();
    const sessionDuration = currentTime - sessionStartTime.current;
    const timeOnPage = currentTime - lastActivity.current;
    
    setAnalyticsData(prev => ({
      ...prev,
      activeUsers: Math.floor(Math.random() * 50) + 150, // Simulated
      pageViews: prev.pageViews + Math.floor(Math.random() * 3),
      sessionDuration: sessionDuration / 1000,
      bounceRate: calculateBounceRate(sessionDuration, prev.userEngagement.interactions),
      conversions: prev.conversions + (Math.random() > 0.95 ? 1 : 0),
      workoutsStarted: prev.workoutsStarted + (Math.random() > 0.9 ? 1 : 0),
      userEngagement: {
        ...prev.userEngagement,
        timeOnPage: sessionDuration / 1000
      }
    }));
  };

  const calculateBounceRate = (sessionDuration, interactions) => {
    if (sessionDuration < 10000 && interactions < 2) {
      return Math.min(85, Math.max(15, 60 + Math.random() * 20));
    }
    return Math.max(15, 40 - (interactions * 2));
  };

  const getDeviceType = () => {
    const userAgent = navigator.userAgent;
    if (/Mobi|Android/i.test(userAgent)) return 'mobile';
    if (/Tablet|iPad/i.test(userAgent)) return 'tablet';
    return 'desktop';
  };

  const trackDeviceCapabilities = () => {
    const capabilities = {
      connection: navigator.connection?.effectiveType || 'unknown',
      memory: navigator.deviceMemory || 'unknown',
      cores: navigator.hardwareConcurrency || 'unknown',
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    };
    
    setAnalyticsData(prev => ({
      ...prev,
      deviceCapabilities: capabilities
    }));
  };

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Analytics Dashboard Component
  const AnalyticsDashboard = () => (
    <motion.div
      className="fixed top-4 right-4 w-96 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl z-50 overflow-hidden"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="w-6 h-6 text-cyan-400 mr-2" />
            <h3 className="text-white font-bold">Real-Time Analytics</h3>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Primary Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={<Users className="w-5 h-5" />}
            label="Active Users"
            value={analyticsData.activeUsers}
            color="text-green-400"
            trend="+12%"
          />
          <MetricCard
            icon={<Eye className="w-5 h-5" />}
            label="Page Views"
            value={analyticsData.pageViews}
            color="text-blue-400"
            trend="+8%"
          />
          <MetricCard
            icon={<Clock className="w-5 h-5" />}
            label="Avg. Session"
            value={`${Math.floor(analyticsData.sessionDuration / 60)}m ${Math.floor(analyticsData.sessionDuration % 60)}s`}
            color="text-purple-400"
            format="duration"
          />
          <MetricCard
            icon={<Target className="w-5 h-5" />}
            label="Bounce Rate"
            value={`${analyticsData.bounceRate.toFixed(1)}%`}
            color="text-orange-400"
          />
        </div>

        {/* Performance Metrics */}
        <div className="bg-white/5 rounded-xl p-3">
          <h4 className="text-white font-semibold mb-3 flex items-center">
            <Gauge className="w-4 h-4 mr-2 text-cyan-400" />
            Performance
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">FCP:</span>
              <span className="text-white">{analyticsData.performanceMetrics.fcp.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">LCP:</span>
              <span className="text-white">{analyticsData.performanceMetrics.lcp.toFixed(0)}ms</span>
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-white/5 rounded-xl p-3">
          <h4 className="text-white font-semibold mb-3 flex items-center">
            <Heart className="w-4 h-4 mr-2 text-pink-400" />
            Engagement
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Scroll Depth:</span>
              <span className="text-white">{analyticsData.userEngagement.scrollDepth}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Interactions:</span>
              <span className="text-white">{analyticsData.userEngagement.interactions}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, analyticsData.userEngagement.scrollDepth)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white/5 rounded-xl p-3">
          <h4 className="text-white font-semibold mb-3 flex items-center">
            <Smartphone className="w-4 h-4 mr-2 text-emerald-400" />
            Devices
          </h4>
          <div className="flex justify-between text-sm">
            <div className="text-center">
              <div className="text-white font-medium">{analyticsData.deviceMetrics.mobile}</div>
              <div className="text-gray-400 text-xs">Mobile</div>
            </div>
            <div className="text-center">
              <div className="text-white font-medium">{analyticsData.deviceMetrics.desktop}</div>
              <div className="text-gray-400 text-xs">Desktop</div>
            </div>
            <div className="text-center">
              <div className="text-white font-medium">{analyticsData.deviceMetrics.tablet}</div>
              <div className="text-gray-400 text-xs">Tablet</div>
            </div>
          </div>
        </div>

        {/* Real-time Events */}
        <div className="bg-white/5 rounded-xl p-3">
          <h4 className="text-white font-semibold mb-3 flex items-center">
            <Zap className="w-4 h-4 mr-2 text-yellow-400" />
            Live Events
          </h4>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {/* Safely handle array operations with fallback */}
            {(analyticsData.realTimeEvents || []).slice(-3).reverse().map((event, index) => (
              <div key={index} className="text-xs text-gray-300 flex justify-between">
                <span>{event.data}</span>
                <span className="text-gray-500">
                  {new Date(event.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Metric Card Component
  const MetricCard = ({ icon, label, value, color, trend, format }) => (
    <div className="bg-white/5 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <div className={`${color}`}>{icon}</div>
        {trend && (
          <span className="text-green-400 text-xs font-medium">{trend}</span>
        )}
      </div>
      <div className="text-white font-bold text-lg">{value}</div>
      <div className="text-gray-400 text-xs">{label}</div>
    </div>
  );

  return (
    <>
      {/* Analytics Toggle Button */}
      <motion.button
        className="fixed top-4 right-4 w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg z-50 flex items-center justify-center"
        onClick={() => setIsVisible(!isVisible)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <BarChart3 className="w-6 h-6 text-white" />
      </motion.button>

      {/* Analytics Dashboard */}
      <AnimatePresence>
        {isVisible && <AnalyticsDashboard />}
      </AnimatePresence>

      {/* Hidden heatmap canvas for reference */}
      <canvas
        ref={heatmapCanvas}
        className="fixed inset-0 pointer-events-none opacity-0"
        width={typeof window !== 'undefined' ? window.innerWidth : 1920}
        height={typeof window !== 'undefined' ? window.innerHeight : 1080}
      />
    </>
  );
};

export default RealTimeAnalytics;