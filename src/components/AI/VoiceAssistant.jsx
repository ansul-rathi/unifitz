/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
// src/components/AI/VoiceAssistant.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Brain, 
  Zap, 
  MessageCircle, 
  Volume2,
  VolumeX,
  Settings,
  Sparkles,
  Activity,
  Heart,
  Target,
  TrendingUp
} from 'lucide-react';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [assistantVisible, setAssistantVisible] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [userProfile, setUserProfile] = useState({
    fitnessLevel: 'intermediate',
    goals: ['weight_loss', 'muscle_gain'],
    preferences: ['morning_workouts', 'high_intensity']
  });

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const currentTranscript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript) {
          processVoiceCommand(transcript);
        }
      };
    }

    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [transcript]);

  // Advanced AI command processing
  const processVoiceCommand = async (command) => {
    setIsProcessing(true);
    
    // Simulate AI processing with contextual responses
    const aiResponse = await generateAIResponse(command);
    
    setConversationHistory(prev => [...prev, 
      { type: 'user', message: command, timestamp: Date.now() },
      { type: 'assistant', message: aiResponse, timestamp: Date.now() }
    ]);
    
    setResponse(aiResponse);
    
    if (audioEnabled) {
      speak(aiResponse);
    }
    
    setIsProcessing(false);
    setTranscript('');
  };

  // Advanced AI response generation
  const generateAIResponse = async (command) => {
    const lowerCommand = command.toLowerCase();
    
    // Workout recommendations
    if (lowerCommand.includes('workout') || lowerCommand.includes('exercise')) {
      if (lowerCommand.includes('quick') || lowerCommand.includes('short')) {
        return "I recommend our 21-minute HIIT circuit! It's perfect for busy schedules and burns maximum calories. Would you like me to start the workout?";
      }
      if (lowerCommand.includes('strength') || lowerCommand.includes('muscle')) {
        return "Based on your profile, I suggest our Advanced Muscle Building program. It includes progressive overload training. Should I create today's routine?";
      }
      if (lowerCommand.includes('cardio')) {
        return "Great choice! Our Zumba or HIIT sessions are excellent for cardio. Your heart rate zone should be 140-160 BPM for optimal fat burning.";
      }
      return "I can recommend the perfect workout based on your goals. What type of training are you interested in today?";
    }
    
    // Nutrition advice
    if (lowerCommand.includes('nutrition') || lowerCommand.includes('diet') || lowerCommand.includes('food')) {
      return "For your weight loss goals, I recommend 1,800 calories with 40% protein, 35% carbs, 25% fats. Would you like me to generate today's meal plan?";
    }
    
    // Progress tracking
    if (lowerCommand.includes('progress') || lowerCommand.includes('stats')) {
      return "Your progress is amazing! You've completed 15 workouts this month and burned 3,200 calories. You're 73% towards your monthly goal!";
    }
    
    // Motivation and encouragement
    if (lowerCommand.includes('motivate') || lowerCommand.includes('encourage')) {
      const motivationalQuotes = [
        "You're stronger than you think! Every workout brings you closer to your goals.",
        "Remember, champions train when they don't feel like it. You've got this!",
        "Your body can do it. It's your mind you need to convince. Let's crush today's session!"
      ];
      return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    }
    
    // Schedule management
    if (lowerCommand.includes('schedule') || lowerCommand.includes('plan')) {
      return "Your next session is Tomorrow at 7 AM - Morning Yoga Flow. Would you like me to set a reminder or modify your schedule?";
    }
    
    // Default intelligent response
    return "I'm here to help with your fitness journey! Ask me about workouts, nutrition, progress tracking, or motivation. What would you like to know?";
  };

  // Text-to-speech function
  const speak = (text) => {
    if (synthRef.current && audioEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      synthRef.current.speak(utterance);
    }
  };

  // Start/stop voice recognition
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript('');
      }
    }
  };

  // Quick action buttons
  const quickActions = [
    { 
      label: "Start Workout", 
      icon: <Activity className="w-4 h-4" />, 
      action: () => processVoiceCommand("start my daily workout")
    },
    { 
      label: "Check Progress", 
      icon: <TrendingUp className="w-4 h-4" />, 
      action: () => processVoiceCommand("show my progress stats")
    },
    { 
      label: "Nutrition Plan", 
      icon: <Heart className="w-4 h-4" />, 
      action: () => processVoiceCommand("create today's nutrition plan")
    },
    { 
      label: "Motivate Me", 
      icon: <Zap className="w-4 h-4" />, 
      action: () => processVoiceCommand("motivate me for today's workout")
    }
  ];

  return (
    <>
      {/* Floating AI Assistant Button */}
      <motion.button
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 rounded-full shadow-2xl z-50 flex items-center justify-center"
        onClick={() => setAssistantVisible(!assistantVisible)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ 
          boxShadow: assistantVisible 
            ? "0 0 30px rgba(139, 92, 246, 0.8)" 
            : "0 0 20px rgba(139, 92, 246, 0.4)" 
        }}
      >
        <Brain className="w-8 h-8 text-white" />
        {isProcessing && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-white border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
      </motion.button>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {assistantVisible && (
          <motion.div
            className="fixed bottom-24 right-6 w-96 bg-black/90 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl z-40 overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500/20 via-purple-600/20 to-pink-500/20 p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mr-3">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">AI Fitness Coach</h3>
                    <p className="text-cyan-300 text-sm">Your intelligent training companion</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {audioEnabled ? 
                      <Volume2 className="w-4 h-4 text-cyan-400" /> : 
                      <VolumeX className="w-4 h-4 text-gray-400" />
                    }
                  </button>
                </div>
              </div>
            </div>

            {/* Conversation Area */}
            <div className="p-4 max-h-60 overflow-y-auto">
              {conversationHistory.length === 0 && (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                  <p className="text-gray-300 text-sm">
                    Hi! I'm your AI fitness coach. Ask me anything about workouts, nutrition, or motivation!
                  </p>
                </div>
              )}
              
              {conversationHistory.slice(-6).map((msg, index) => (
                <motion.div
                  key={index}
                  className={`mb-4 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div
                    className={`inline-block p-3 rounded-2xl max-w-xs ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                        : 'bg-white/10 text-gray-100'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Voice Input Area */}
            <div className="p-4 border-t border-white/10">
              {transcript && (
                <div className="mb-3 p-2 bg-white/5 rounded-lg">
                  <p className="text-cyan-300 text-sm">"{transcript}"</p>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-3">
                <motion.button
                  onClick={toggleListening}
                  className={`flex-1 mr-2 py-3 px-4 rounded-xl font-medium transition-all ${
                    isListening
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                      : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-lg'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isProcessing}
                >
                  <div className="flex items-center justify-center">
                    {isListening ? (
                      <>
                        <MicOff className="w-5 h-5 mr-2" />
                        Listening...
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5 mr-2" />
                        Speak
                      </>
                    )}
                  </div>
                </motion.button>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={index}
                    onClick={action.action}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center text-sm text-gray-300 hover:text-white"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {action.icon}
                    <span className="ml-1">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceAssistant;