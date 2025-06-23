/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// src/components/Social/LiveChat.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, ThumbsUp, Users, MessageCircle, Smile } from 'lucide-react';

// src/components/Social/CommunityFeed.jsx
const CommunityFeed = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: { name: 'Sarah Johnson', avatar: '/avatars/sarah.jpg', level: 'Intermediate' },
      content: 'Just completed my first 21-day challenge! The transformation is incredible. Feeling stronger and more confident than ever! 💪✨',
      image: '/posts/sarah-transformation.jpg',
      likes: 45,
      comments: 12,
      timestamp: Date.now() - 3600000,
      type: 'achievement'
    },
    {
      id: 2,
      user: { name: 'The Johnson Family', avatar: '/avatars/family.jpg', level: 'Family Pack' },
      content: 'Family yoga Sunday! Our 8-year-old is becoming quite the yogi 🧘‍♀️ Love that UNIFITZ brings us together while keeping us healthy.',
      image: '/posts/family-yoga.jpg',
      likes: 67,
      comments: 8,
      timestamp: Date.now() - 7200000,
      type: 'family'
    },
    {
      id: 3,
      user: { name: 'Mike Rodriguez', avatar: '/avatars/mike.jpg', level: 'Advanced' },
      content: 'Week 3 of strength training and I can already see the difference! The AI coach suggestions are spot on. Thanks UNIFITZ team! 🔥',
      likes: 38,
      comments: 15,
      timestamp: Date.now() - 10800000,
      type: 'progress'
    }
  ]);

  const [newPost, setNewPost] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);

  const likePost = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Community Feed</h2>
        <p className="text-gray-300">Share your journey and get inspired by others</p>
      </div>

      {/* Create Post */}
      <motion.div
        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">U</span>
          </div>
          <button
            onClick={() => setShowNewPost(true)}
            className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-left text-gray-400 hover:bg-white/20 transition-colors"
          >
            Share your fitness journey...
          </button>
        </div>

        {showNewPost && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's your fitness win today?"
              className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white resize-none focus:outline-none focus:border-purple-400"
              rows={3}
            />
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <button className="text-blue-400 hover:text-blue-300 text-sm">📸 Photo</button>
                <button className="text-green-400 hover:text-green-300 text-sm">🏆 Achievement</button>
                <button className="text-yellow-400 hover:text-yellow-300 text-sm">📊 Progress</button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowNewPost(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors">
                  Share
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Posts */}
      <div className="space-y-6">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Post Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{post.user.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{post.user.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-300 text-sm">{post.user.level}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400 text-sm">
                        {new Date(post.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-xs ${
                  post.type === 'achievement' ? 'bg-yellow-500/20 text-yellow-400' :
                  post.type === 'family' ? 'bg-green-500/20 text-green-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {post.type === 'achievement' && '🏆 Achievement'}
                  {post.type === 'family' && '👨‍👩‍👧‍👦 Family'}
                  {post.type === 'progress' && '📈 Progress'}
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-6 pb-4">
              <p className="text-white">{post.content}</p>
            </div>

            {/* Post Image */}
            {post.image && (
              <div className="px-6 pb-4">
                <img 
                  src={post.image} 
                  alt="Post content" 
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Post Actions */}
            <div className="px-6 py-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => likePost(post.id)}
                    className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Heart className="h-5 w-5" />
                    <span>{post.likes}</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors">
                    <MessageCircle className="h-5 w-5" />
                    <span>{post.comments}</span>
                  </button>
                </div>
                
                <button className="text-gray-400 hover:text-white transition-colors">
                  Share
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CommunityFeed;