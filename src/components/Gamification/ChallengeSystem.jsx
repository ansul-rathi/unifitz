// src/components/Gamification/ChallengeSystem.jsx
/* eslint-disable import/named */
/* eslint-disable no-unused-vars */
// src/components/Analytics/UserDashboard.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Calendar, 
  Trophy, 
  Target, 
  Flame, 
  Award,
  BarChart3,
  Activity,
  Clock,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, CircularProgressbar } from 'recharts';

const ChallengeSystem = () => {
  const [activeChallenges, setActiveChallenges] = useState([
    {
      id: 1,
      title: "7-Day Streak",
      description: "Complete workouts for 7 days in a row",
      progress: 5,
      total: 7,
      reward: "250 XP + Streak Master Badge",
      category: "consistency",
      timeLeft: "2 days left"
    },
    {
      id: 2,
      title: "Calorie Crusher",
      description: "Burn 1000 calories this week",
      progress: 750,
      total: 1000,
      reward: "300 XP + Calorie Crusher Badge",
      category: "fitness",
      timeLeft: "3 days left"
    },
    {
      id: 3,
      title: "Family Fitness",
      description: "Complete 5 family workouts",
      progress: 2,
      total: 5,
      reward: "400 XP + Family Champion Badge",
      category: "social",
      timeLeft: "1 week left"
    }
  ]);

  const [completedChallenges, setCompletedChallenges] = useState([
    {
      id: 4,
      title: "First Week Complete",
      description: "Complete your first week of workouts",
      reward: "200 XP + Beginner Badge",
      completedDate: "2024-01-15"
    }
  ]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Challenges</h1>
        <p className="text-gray-300">Push your limits and earn amazing rewards</p>
      </div>

      {/* Active Challenges */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Active Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeChallenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${
                  challenge.category === 'consistency' ? 'bg-orange-500' :
                  challenge.category === 'fitness' ? 'bg-purple-500' :
                  'bg-green-500'
                }`}>
                  {challenge.category === 'consistency' && <Flame className="h-5 w-5 text-white" />}
                  {challenge.category === 'fitness' && <Zap className="h-5 w-5 text-white" />}
                  {challenge.category === 'social' && <Trophy className="h-5 w-5 text-white" />}
                </div>
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                  {challenge.timeLeft}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>
              <p className="text-gray-300 text-sm mb-4">{challenge.description}</p>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">Progress</span>
                  <span className="text-white">{challenge.progress}/{challenge.total}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${
                      challenge.category === 'consistency' ? 'bg-orange-500' :
                      challenge.category === 'fitness' ? 'bg-purple-500' :
                      'bg-green-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                  />
                </div>
              </div>
              
              <div className="bg-black/30 rounded-lg p-3">
                <p className="text-yellow-400 text-sm font-medium">🎁 {challenge.reward}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Completed Challenges */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Completed Challenges</h2>
        <div className="space-y-4">
          {completedChallenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              className="bg-green-500/10 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-green-500 p-2 rounded-lg mr-4">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{challenge.title}</h3>
                    <p className="text-gray-300">{challenge.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">Completed!</p>
                  <p className="text-gray-400 text-sm">{challenge.completedDate}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChallengeSystem;