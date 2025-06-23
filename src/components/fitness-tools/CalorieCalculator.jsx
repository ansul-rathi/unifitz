/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  User, 
  Ruler, 
  Scale, 
  Target, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calculator,
  RefreshCw,
  Share2,
  Info,
  Zap,
  Heart,
  Clock,
  Award,
  BarChart3,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const CalorieCalculator = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    activityLevel: '',
    goal: '',
    unit: 'metric'
  });
  
  const [result, setResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const activityLevels = [
    {
      id: 'sedentary',
      name: 'Sedentary',
      multiplier: 1.2,
      description: 'Little or no exercise',
      icon: <Clock className="w-5 h-5" />,
      examples: ['Desk job', 'Minimal walking', 'No regular exercise']
    },
    {
      id: 'light',
      name: 'Lightly Active',
      multiplier: 1.375,
      description: 'Light exercise 1-3 days/week',
      icon: <Activity className="w-5 h-5" />,
      examples: ['Light jogging', 'Casual cycling', 'Yoga 2-3x/week']
    },
    {
      id: 'moderate',
      name: 'Moderately Active',
      multiplier: 1.55,
      description: 'Moderate exercise 3-5 days/week',
      icon: <Heart className="w-5 h-5" />,
      examples: ['Regular gym visits', 'Sports 3-4x/week', 'Running 30+ min']
    },
    {
      id: 'very',
      name: 'Very Active',
      multiplier: 1.725,
      description: 'Hard exercise 6-7 days/week',
      icon: <Zap className="w-5 h-5" />,
      examples: ['Daily intense workouts', 'Athletic training', 'Physical job']
    },
    {
      id: 'extreme',
      name: 'Extremely Active',
      multiplier: 1.9,
      description: 'Very hard exercise, physical job',
      icon: <Award className="w-5 h-5" />,
      examples: ['Professional athlete', 'Military training', '2x daily workouts']
    }
  ];

  const goals = [
    {
      id: 'lose-2',
      name: 'Lose 2 lbs/week',
      adjustment: -1000,
      description: 'Aggressive weight loss',
      color: 'from-red-500 to-pink-500',
      icon: <TrendingDown className="w-5 h-5" />,
      timeline: '8-12 weeks recommended'
    },
    {
      id: 'lose-1',
      name: 'Lose 1 lb/week',
      adjustment: -500,
      description: 'Moderate weight loss',
      color: 'from-orange-500 to-red-500',
      icon: <TrendingDown className="w-5 h-5" />,
      timeline: '12-24 weeks recommended'
    },
    {
      id: 'lose-half',
      name: 'Lose 0.5 lb/week',
      adjustment: -250,
      description: 'Slow & sustainable loss',
      color: 'from-yellow-500 to-orange-500',
      icon: <Minus className="w-5 h-5" />,
      timeline: '24+ weeks recommended'
    },
    {
      id: 'maintain',
      name: 'Maintain Weight',
      adjustment: 0,
      description: 'Stay at current weight',
      color: 'from-green-500 to-emerald-500',
      icon: <Target className="w-5 h-5" />,
      timeline: 'Ongoing maintenance'
    },
    {
      id: 'gain-half',
      name: 'Gain 0.5 lb/week',
      adjustment: 250,
      description: 'Lean muscle gain',
      color: 'from-blue-500 to-cyan-500',
      icon: <TrendingUp className="w-5 h-5" />,
      timeline: '12-24 weeks recommended'
    },
    {
      id: 'gain-1',
      name: 'Gain 1 lb/week',
      adjustment: 500,
      description: 'Moderate weight gain',
      color: 'from-purple-500 to-blue-500',
      icon: <TrendingUp className="w-5 h-5" />,
      timeline: '8-16 weeks recommended'
    }
  ];

  const calculateCalories = () => {
    if (!formData.age || !formData.weight || !formData.height || !formData.activityLevel || !formData.goal) {
      return;
    }

    setIsCalculating(true);
    
    setTimeout(() => {
      let weight = parseFloat(formData.weight);
      let height = parseFloat(formData.height);
      const age = parseInt(formData.age);
      
      // Convert to metric if needed
      if (formData.unit === 'imperial') {
        weight = weight * 0.453592; // lbs to kg
        height = height * 2.54; // inches to cm
      }
      
      // Calculate BMR using Mifflin-St Jeor Equation
      let bmr;
      if (formData.gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }
      
      // Calculate TDEE
      const activityMultiplier = activityLevels.find(level => level.id === formData.activityLevel).multiplier;
      const tdee = bmr * activityMultiplier;
      
      // Apply goal adjustment
      const goalAdjustment = goals.find(goal => goal.id === formData.goal).adjustment;
      const dailyCalories = tdee + goalAdjustment;
      
      // Calculate macronutrient breakdown (example ratios)
      const protein = Math.round((dailyCalories * 0.25) / 4); // 25% protein
      const carbs = Math.round((dailyCalories * 0.45) / 4); // 45% carbs
      const fats = Math.round((dailyCalories * 0.30) / 9); // 30% fats
      
      // Calculate weekly calorie deficit/surplus
      const weeklyChange = goalAdjustment * 7;
      const estimatedWeightChange = Math.abs(weeklyChange / 3500); // 3500 calories = 1 lb
      
      setResult({
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        dailyCalories: Math.round(dailyCalories),
        goalData: goals.find(goal => goal.id === formData.goal),
        activityData: activityLevels.find(level => level.id === formData.activityLevel),
        macros: { protein, carbs, fats },
        weeklyChange: Math.round(weeklyChange),
        estimatedWeightChange: estimatedWeightChange.toFixed(1)
      });
      
      setIsCalculating(false);
      setShowBreakdown(true);
    }, 2000);
  };

  const resetCalculator = () => {
    setFormData({
      age: '',
      gender: 'male',
      weight: '',
      height: '',
      activityLevel: '',
      goal: '',
      unit: 'metric'
    });
    setResult(null);
    setShowBreakdown(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const selectedActivity = activityLevels.find(level => level.id === formData.activityLevel);
  const selectedGoal = goals.find(goal => goal.id === formData.goal);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-orange-900/20 via-red-900/20 to-pink-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.1)_0%,transparent_50%)]"></div>
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-orange-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-lg rounded-full mb-8 border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Flame className="w-5 h-5 text-orange-400 mr-2" />
            <span className="text-orange-300 font-medium">Calorie Calculator</span>
            <div className="w-2 h-2 bg-orange-400 rounded-full ml-2 animate-pulse"></div>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-black leading-none mb-6">
            <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 text-transparent bg-clip-text">
              Daily Calorie
            </span>
            <br />
            <span className="text-white">Calculator</span>
          </h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Calculate your daily calorie needs based on your goals, activity level, and metabolism
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Calculator Form */}
          <motion.div
            className="xl:col-span-2 relative"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Calorie Calculator</h2>
                  <p className="text-gray-400 text-sm">Enter your details for accurate results</p>
                </div>
              </div>

              {/* Unit Toggle */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-white mb-3">Measurement Unit</label>
                <div className="flex bg-white/5 rounded-xl p-1">
                  {['metric', 'imperial'].map((unit) => (
                    <button
                      key={unit}
                      onClick={() => setFormData(prev => ({ ...prev, unit }))}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                        formData.unit === unit
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {unit === 'metric' ? 'Metric (kg/cm)' : 'Imperial (lbs/in)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-white mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2 text-orange-400" />
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="30"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2 text-orange-400" />
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-3 flex items-center">
                    <Scale className="w-4 h-4 mr-2 text-orange-400" />
                    Weight {formData.unit === 'metric' ? '(kg)' : '(lbs)'}
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder={formData.unit === 'metric' ? '70' : '154'}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-3 flex items-center">
                    <Ruler className="w-4 h-4 mr-2 text-orange-400" />
                    Height {formData.unit === 'metric' ? '(cm)' : '(in)'}
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    placeholder={formData.unit === 'metric' ? '175' : '69'}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all"
                  />
                </div>
              </div>

              {/* Activity Level */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-white mb-4 flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-orange-400" />
                  Activity Level
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activityLevels.map((level) => (
                    <motion.button
                      key={level.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, activityLevel: level.id }))}
                      className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                        formData.activityLevel === level.id
                          ? 'bg-orange-500/20 border-orange-500/50 text-white'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                          formData.activityLevel === level.id ? 'bg-orange-500' : 'bg-white/10'
                        }`}>
                          {level.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold">{level.name}</h4>
                          <p className="text-xs opacity-70">{level.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
                {selectedActivity && (
                  <motion.div 
                    className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h5 className="font-semibold text-orange-300 mb-2">Examples:</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedActivity.examples.map((example, index) => (
                        <span key={index} className="text-xs bg-white/10 px-2 py-1 rounded-lg text-gray-300">
                          {example}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Goals */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-white mb-4 flex items-center">
                  <Target className="w-4 h-4 mr-2 text-orange-400" />
                  Your Goal
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {goals.map((goal) => (
                    <motion.button
                      key={goal.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, goal: goal.id }))}
                      className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                        formData.goal === goal.id
                          ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/50 text-white'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center mb-2">
                        <div className={`w-8 h-8 bg-gradient-to-r ${goal.color} rounded-lg flex items-center justify-center mr-3`}>
                          {goal.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold">{goal.name}</h4>
                          <p className="text-xs opacity-70">{goal.description}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">{goal.timeline}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <motion.button
                  onClick={calculateCalories}
                  disabled={!formData.age || !formData.weight || !formData.height || !formData.activityLevel || !formData.goal || isCalculating}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 px-6 rounded-xl hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isCalculating ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Flame className="w-5 h-5" />
                      Calculate Calories
                    </>
                  )}
                </motion.button>

                <motion.button
                  onClick={resetCalculator}
                  className="bg-white/10 text-white border border-white/30 font-semibold py-4 px-6 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw className="w-5 h-5" />
                  Reset
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-fit"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                      <Info className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">How It Works</h3>
                      <p className="text-gray-400 text-sm">Understanding calorie calculation</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <h4 className="font-semibold text-blue-300 mb-2 flex items-center">
                        <Heart className="w-4 h-4 mr-2" />
                        BMR (Basal Metabolic Rate)
                      </h4>
                      <p className="text-gray-400 text-sm">
                        Calories your body burns at rest for basic functions like breathing and circulation.
                      </p>
                    </div>

                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <h4 className="font-semibold text-green-300 mb-2 flex items-center">
                        <Activity className="w-4 h-4 mr-2" />
                        TDEE (Total Daily Energy Expenditure)
                      </h4>
                      <p className="text-gray-400 text-sm">
                        BMR multiplied by your activity level to account for exercise and daily movement.
                      </p>
                    </div>

                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                      <h4 className="font-semibold text-orange-300 mb-2 flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        Goal Calories
                      </h4>
                      <p className="text-gray-400 text-sm">
                        TDEE adjusted for your specific goal (weight loss, maintenance, or gain).
                      </p>
                    </div>

                    <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                      <h4 className="font-semibold text-purple-300 mb-2 flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Macro Breakdown
                      </h4>
                      <p className="text-gray-400 text-sm">
                        Recommended protein, carbohydrate, and fat distribution for optimal results.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-6"
                >
                  {/* Main Results */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                    <div className="text-center mb-6">
                      <motion.div
                        className="text-5xl font-black text-white mb-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                      >
                        {result.dailyCalories}
                      </motion.div>
                      <p className="text-gray-300">Daily Calories</p>
                      <div className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${result.goalData.color} rounded-full mt-3`}>
                        {result.goalData.icon}
                        <span className="ml-2 font-semibold">{result.goalData.name}</span>
                      </div>
                    </div>

                    {/* BMR & TDEE */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-gray-400 text-sm">BMR</p>
                        <p className="text-2xl font-bold text-white">{result.bmr}</p>
                        <p className="text-xs text-gray-500">calories/day</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-gray-400 text-sm">TDEE</p>
                        <p className="text-2xl font-bold text-white">{result.tdee}</p>
                        <p className="text-xs text-gray-500">calories/day</p>
                      </div>
                    </div>

                    {/* Weekly Change */}
                    {result.weeklyChange !== 0 && (
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
                        <p className="text-orange-300 text-sm">Weekly Calorie {result.weeklyChange > 0 ? 'Surplus' : 'Deficit'}</p>
                        <p className="text-xl font-bold text-white">{Math.abs(result.weeklyChange)} calories</p>
                        <p className="text-xs text-gray-400">≈ {result.estimatedWeightChange} lbs per week</p>
                      </div>
                    )}
                  </div>

                  {/* Macro Breakdown */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-orange-400" />
                      Macronutrient Breakdown
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Protein */}
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-blue-300 font-semibold">Protein</span>
                          <span className="text-white font-bold">{result.macros.protein}g</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <motion.div 
                            className="h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "25%" }}
                            transition={{ delay: 0.5, duration: 1 }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">25% of daily calories</p>
                      </div>

                      {/* Carbohydrates */}
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-green-300 font-semibold">Carbohydrates</span>
                          <span className="text-white font-bold">{result.macros.carbs}g</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <motion.div 
                            className="h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "45%" }}
                            transition={{ delay: 0.7, duration: 1 }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">45% of daily calories</p>
                      </div>

                      {/* Fats */}
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-purple-300 font-semibold">Fats</span>
                          <span className="text-white font-bold">{result.macros.fats}g</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <motion.div 
                            className="h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "30%" }}
                            transition={{ delay: 0.9, duration: 1 }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">30% of daily calories</p>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Analysis */}
                  <AnimatePresence>
                    {showBreakdown && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6"
                      >
                        {/* Activity Level Info */}
                        <div>
                          <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-cyan-400" />
                            Your Activity Level
                          </h4>
                          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                            <div className="flex items-center mb-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                                {result.activityData.icon}
                              </div>
                              <div>
                                <h5 className="font-semibold text-white">{result.activityData.name}</h5>
                                <p className="text-sm text-gray-400">{result.activityData.description}</p>
                              </div>
                            </div>
                            <p className="text-xs text-cyan-300">
                              Multiplier: {result.activityData.multiplier}x BMR
                            </p>
                          </div>
                        </div>

                        {/* Tips and Recommendations */}
                        <div>
                          <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                            <Target className="w-5 h-5 mr-2 text-green-400" />
                            Recommendations
                          </h4>
                          <div className="space-y-3">
                            <motion.div
                              className="flex items-start"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300">Track your daily calorie intake using a food diary or app</span>
                            </motion.div>
                            <motion.div
                              className="flex items-start"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 }}
                            >
                              <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300">Adjust portions based on hunger, energy, and progress</span>
                            </motion.div>
                            <motion.div
                              className="flex items-start"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 }}
                            >
                              <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300">Recalculate every 4-6 weeks as your weight changes</span>
                            </motion.div>
                            <motion.div
                              className="flex items-start"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5 }}
                            >
                              <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300">Focus on whole foods and adequate hydration</span>
                            </motion.div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                          <motion.button
                            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Target className="w-5 h-5" />
                            Create Meal Plan
                          </motion.button>
                          
                          <motion.button
                            className="bg-white/10 text-white border border-white/30 font-semibold py-3 px-6 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Share2 className="w-5 h-5" />
                            Share Results
                          </motion.button>
                        </div>

                        {/* Important Note */}
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                          <div className="flex items-start">
                            <Info className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" />
                            <div>
                              <h5 className="font-semibold text-yellow-300 mb-2">Important Note</h5>
                              <p className="text-gray-400 text-sm">
                                These calculations are estimates. Individual metabolic rates vary. 
                                Consult with a healthcare provider or registered dietitian for personalized nutrition advice.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CalorieCalculator;