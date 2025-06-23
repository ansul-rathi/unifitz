/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// src/components/Social/LiveChat.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, ThumbsUp, Users, MessageCircle, Smile } from 'lucide-react';

const LiveChat = ({ isVisible, onToggle, workoutId }) => {
  const [messages, setMessages] = useState([
    { id: 1, user: 'Sarah M.', message: 'Great workout everyone! 💪', timestamp: Date.now() - 30000, type: 'message' },
    { id: 2, user: 'Mike R.', message: 'Loving this energy!', timestamp: Date.now() - 15000, type: 'message' },
    { id: 3, user: 'UNIFITZ', message: 'Keep pushing! You\'re doing amazing!', timestamp: Date.now() - 5000, type: 'encouragement' }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(156);
  const [reactions, setReactions] = useState({ hearts: 234, thumbs: 89 });
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate live messages
  useEffect(() => {
    const interval = setInterval(() => {
      const encouragements = [
        "You're doing great!",
        "Keep it up everyone!",
        "Almost there!",
        "Feel the burn!",
        "Breathe and focus!"
      ];
      
      const users = ['Alex K.', 'Jenny S.', 'David L.', 'Emma T.', 'Coach Ana'];
      
      const newMsg = {
        id: Date.now(),
        user: users[Math.floor(Math.random() * users.length)],
        message: encouragements[Math.floor(Math.random() * encouragements.length)],
        timestamp: Date.now(),
        type: 'message'
      };
      
      setMessages(prev => [...prev.slice(-9), newMsg]); // Keep last 10 messages
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        user: 'You',
        message: newMessage,
        timestamp: Date.now(),
        type: 'message'
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const sendReaction = (type) => {
    setReactions(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));

    // Add reaction message
    const reactionMessage = {
      id: Date.now(),
      user: 'You',
      message: type === 'hearts' ? '❤️' : '👍',
      timestamp: Date.now(),
      type: 'reaction'
    };
    
    setMessages(prev => [...prev, reactionMessage]);
  };

  const quickMessages = [
    'Great form! 💪',
    'You got this! 🔥',
    'Amazing energy! ⚡',
    'Keep going! 🚀'
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed right-4 top-20 bottom-4 w-80 bg-black/90 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl z-50"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-green-500 w-3 h-3 rounded-full mr-2 animate-pulse"></div>
                <h3 className="text-white font-bold">Live Chat</h3>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center text-gray-300">
                  <Users className="h-4 w-4 mr-1" />
                  <span className="text-sm">{onlineUsers}</span>
                </div>
                <button
                  onClick={onToggle}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                className={`${
                  msg.type === 'encouragement' 
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 p-3 rounded-lg'
                    : msg.type === 'reaction'
                    ? 'text-center'
                    : ''
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {msg.type === 'reaction' ? (
                  <span className="text-2xl">{msg.message}</span>
                ) : (
                  <>
                    <div className="flex items-center mb-1">
                      <span className={`text-xs font-medium ${
                        msg.user === 'You' ? 'text-blue-400' :
                        msg.user === 'UNIFITZ' ? 'text-orange-400' :
                        'text-gray-300'
                      }`}>
                        {msg.user}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-white text-sm">{msg.message}</p>
                  </>
                )}
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reactions */}
          <div className="p-4 border-t border-white/20">
            <div className="flex justify-between mb-3">
              <button
                onClick={() => sendReaction('hearts')}
                className="flex items-center bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded-full transition-colors"
              >
                <Heart className="h-4 w-4 mr-1" />
                <span className="text-xs">{reactions.hearts}</span>
              </button>
              
              <button
                onClick={() => sendReaction('thumbs')}
                className="flex items-center bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1 rounded-full transition-colors"
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                <span className="text-xs">{reactions.thumbs}</span>
              </button>

              <button className="flex items-center bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-3 py-1 rounded-full transition-colors">
                <Smile className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Messages */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {quickMessages.map((msg, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setNewMessage(msg);
                    chatInputRef.current?.focus();
                  }}
                  className="text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-2 py-1 rounded-lg transition-colors"
                >
                  {msg}
                </button>
              ))}
            </div>

            {/* Message Input */}
            <div className="flex space-x-2">
              <input
                ref={chatInputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Send encouragement..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LiveChat;