/* eslint-disable no-unused-vars */
// src/components/FuturisticFeatures/SmartNutritionAI.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Camera, 
  Zap, 
  Target, 
  TrendingUp, 
  Heart,
  Activity,
  Trophy,
  Eye
} from 'lucide-react';

const SmartNutritionAI = () => {
  const [userProfile, setUserProfile] = useState({
    age: 28,
    weight: 65,
    height: 165,
    goal: 'weight_loss',
    activityLevel: 'moderate'
  });
  
  const [mealPlan, setMealPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMealPlan = async () => {
    setIsGenerating(true);
    
    // Simulate AI meal plan generation
    setTimeout(() => {
      setMealPlan({
        dailyCalories: 1800,
        macros: { carbs: 45, protein: 30, fats: 25 },
        meals: [
          {
            name: "Energizing Breakfast",
            calories: 450,
            items: ["Oats with berries", "Greek yogurt", "Almonds"],
            time: "7:00 AM"
          },
          {
            name: "Power Lunch",
            calories: 550,
            items: ["Quinoa salad", "Grilled chicken", "Avocado"],
            time: "12:30 PM"
          },
          {
            name: "Light Dinner",
            calories: 400,
            items: ["Vegetable curry", "Brown rice", "Paneer"],
            time: "7:00 PM"
          }
        ],
        hydrationGoal: "2.5L water",
        supplements: ["Vitamin D", "Omega-3"]
      });
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 rounded-3xl p-8 border border-green-500/30">
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-3 mr-4">
          <Activity className="h-8 w-8 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Smart Nutrition AI</h3>
          <p className="text-green-300">Personalized meal plans powered by AI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Profile Input */}
        <div className="space-y-6">
          <div className="bg-white/10 rounded-2xl p-6">
            <h4 className="text-lg font-bold text-white mb-4">Your Profile</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-green-300 text-sm mb-2">Age</label>
                <input
                  type="number"
                  value={userProfile.age}
                  onChange={(e) => setUserProfile({...userProfile, age: e.target.value})}
                  className="w-full bg-black/30 border border-green-500/30 rounded-lg px-3 py-2 text-white"
                />
              </div>
              
              <div>
                <label className="block text-green-300 text-sm mb-2">Weight (kg)</label>
                <input
                  type="number"
                  value={userProfile.weight}
                  onChange={(e) => setUserProfile({...userProfile, weight: e.target.value})}
                  className="w-full bg-black/30 border border-green-500/30 rounded-lg px-3 py-2 text-white"
                />
              </div>
              
              <div>
                <label className="block text-green-300 text-sm mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={userProfile.height}
                  onChange={(e) => setUserProfile({...userProfile, height: e.target.value})}
                  className="w-full bg-black/30 border border-green-500/30 rounded-lg px-3 py-2 text-white"
                />
              </div>
              
              <div>
                <label className="block text-green-300 text-sm mb-2">Goal</label>
                <select
                  value={userProfile.goal}
                  onChange={(e) => setUserProfile({...userProfile, goal: e.target.value})}
                  className="w-full bg-black/30 border border-green-500/30 rounded-lg px-3 py-2 text-white"
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={generateMealPlan}
              disabled={isGenerating}
              className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Generate AI Meal Plan'}
            </button>
          </div>
        </div>

        {/* Generated Meal Plan */}
        <div className="space-y-6">
          {isGenerating && (
            <div className="text-center">
              <div className="inline-flex items-center px-6 py-3 bg-green-500/20 rounded-full">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-400 border-t-transparent mr-3"></div>
                <span className="text-green-300">AI is creating your personalized meal plan...</span>
              </div>
            </div>
          )}

          {mealPlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Daily Overview */}
              <div className="bg-white/10 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-white mb-4">Daily Overview</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-green-300 text-sm">Calories</p>
                    <p className="text-white text-2xl font-bold">{mealPlan.dailyCalories}</p>
                  </div>
                  <div>
                    <p className="text-green-300 text-sm">Hydration</p>
                    <p className="text-white text-lg font-bold">{mealPlan.hydrationGoal}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-green-300 text-sm mb-2">Macros Distribution</p>
                  <div className="flex space-x-4">
                    <div className="text-center">
                      <p className="text-blue-400 font-bold">{mealPlan.macros.carbs}%</p>
                      <p className="text-xs text-gray-400">Carbs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-red-400 font-bold">{mealPlan.macros.protein}%</p>
                      <p className="text-xs text-gray-400">Protein</p>
                    </div>
                    <div className="text-center">
                      <p className="text-yellow-400 font-bold">{mealPlan.macros.fats}%</p>
                      <p className="text-xs text-gray-400">Fats</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meals */}
              <div className="space-y-3">
                {mealPlan.meals.map((meal, index) => (
                  <div key={index} className="bg-white/10 rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-bold text-white">{meal.name}</h5>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">{meal.calories} cal</p>
                        <p className="text-gray-400 text-sm">{meal.time}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {meal.items.map((item, itemIndex) => (
                        <span
                          key={itemIndex}
                          className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartNutritionAI;