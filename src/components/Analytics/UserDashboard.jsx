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

const UserDashboard = () => {
  const [userStats, setUserStats] = useState({
    totalWorkouts: 45,
    streakDays: 12,
    caloriesBurned: 8750,
    minutesExercised: 945,
    currentLevel: 'Intermediate',
    xpPoints: 2840,
    nextLevelXP: 3500,
    achievements: [
      { id: 1, name: 'First Week', icon: '🎯', unlocked: true },
      { id: 2, name: 'Streak Master', icon: '🔥', unlocked: true },
      { id: 3, name: 'Calorie Crusher', icon: '⚡', unlocked: false }
    ]
  });

  const [weeklyProgress, setWeeklyProgress] = useState([
    { day: 'Mon', workouts: 1, calories: 245 },
    { day: 'Tue', workouts: 2, calories: 420 },
    { day: 'Wed', workouts: 1, calories: 180 },
    { day: 'Thu', workouts: 0, calories: 0 },
    { day: 'Fri', workouts: 2, calories: 380 },
    { day: 'Sat', workouts: 1, calories: 220 },
    { day: 'Sun', workouts: 1, calories: 300 }
  ]);

  const progressPercentage = (userStats.xpPoints / userStats.nextLevelXP) * 100;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <motion.h1 
          className="text-4xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Your Fitness Journey
        </motion.h1>
        <p className="text-gray-300">Track your progress and celebrate your achievements</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Workouts"
          value={userStats.totalWorkouts}
          icon={<Activity className="h-8 w-8 text-blue-400" />}
          gradient="from-blue-500 to-blue-600"
          delay={0}
        />
        <StatCard
          title="Current Streak"
          value={`${userStats.streakDays} days`}
          icon={<Flame className="h-8 w-8 text-orange-400" />}
          gradient="from-orange-500 to-red-500"
          delay={0.1}
        />
        <StatCard
          title="Calories Burned"
          value={userStats.caloriesBurned.toLocaleString()}
          icon={<Zap className="h-8 w-8 text-yellow-400" />}
          gradient="from-yellow-500 to-orange-500"
          delay={0.2}
        />
        <StatCard
          title="Minutes Active"
          value={userStats.minutesExercised}
          icon={<Clock className="h-8 w-8 text-green-400" />}
          gradient="from-green-500 to-emerald-500"
          delay={0.3}
        />
      </div>

      {/* Level Progress & Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Level Progress */}
        <motion.div
          className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Level Progress</h3>
            <p className="text-purple-300">Current Level: {userStats.currentLevel}</p>
          </div>
          
          <div className="relative w-48 h-48 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-2">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{Math.round(progressPercentage)}%</div>
                  <div className="text-purple-300 text-sm">to next level</div>
                </div>
              </div>
            </div>
            
            {/* Progress Ring */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="url(#progress-gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${progressPercentage * 5.53} 553`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          <div className="text-center">
            <p className="text-white">
              <span className="font-bold text-purple-400">{userStats.xpPoints}</span> / {userStats.nextLevelXP} XP
            </p>
          </div>
        </motion.div>

        {/* Weekly Progress Chart */}
        <motion.div
          className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-white mb-6">Weekly Progress</h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="calories" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Achievements */}
      <motion.div
        className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-2xl font-bold text-white mb-6">Achievements</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {userStats.achievements.map((achievement, index) => (
            <div
              key={achievement.id}
              className={`p-6 rounded-2xl border-2 transition-all ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
                  : 'bg-gray-800/50 border-gray-600/50'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">{achievement.icon}</div>
                <h4 className={`font-bold ${achievement.unlocked ? 'text-yellow-400' : 'text-gray-400'}`}>
                  {achievement.name}
                </h4>
                {achievement.unlocked ? (
                  <p className="text-green-400 text-sm mt-2">Unlocked!</p>
                ) : (
                  <p className="text-gray-500 text-sm mt-2">Locked</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const StatCard = ({ title, value, icon, gradient, delay }) => (
  <motion.div
    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient}`}>
        {icon}
      </div>
    </div>
    <h3 className="text-2xl font-bold text-white">{value}</h3>
    <p className="text-gray-300">{title}</p>
  </motion.div>
);

export default UserDashboard;