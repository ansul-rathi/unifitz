/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, 
  User, 
  Ruler, 
  TrendingUp, 
  Info, 
  Target, 
  ArrowRight, 
  BarChart3,
  Heart,
  AlertTriangle,
  CheckCircle,
  Calculator,
  RefreshCw,
  Share2,
  Download
} from 'lucide-react';

const BMICalculator = () => {
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: 'male',
    unit: 'metric' // metric or imperial
  });
  
  const [result, setResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // BMI Categories with enhanced data
  const bmiCategories = [
    {
      range: 'Below 18.5',
      category: 'Underweight',
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      icon: <TrendingUp className="w-5 h-5" />,
      description: 'You may need to gain weight for optimal health',
      recommendations: [
        'Consult with a healthcare provider',
        'Focus on nutrient-dense, calorie-rich foods',
        'Consider strength training to build muscle mass',
        'Monitor your health regularly'
      ],
      risks: ['Weakened immune system', 'Osteoporosis risk', 'Anemia risk']
    },
    {
      range: '18.5 - 24.9',
      category: 'Normal Weight',
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      icon: <CheckCircle className="w-5 h-5" />,
      description: 'You have a healthy weight for your height',
      recommendations: [
        'Maintain current healthy lifestyle',
        'Continue regular physical activity',
        'Follow a balanced, nutritious diet',
        'Regular health check-ups'
      ],
      risks: ['Lowest risk for weight-related health issues']
    },
    {
      range: '25.0 - 29.9',
      category: 'Overweight',
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30',
      icon: <AlertTriangle className="w-5 h-5" />,
      description: 'You may benefit from weight management',
      recommendations: [
        'Create a moderate calorie deficit',
        'Increase physical activity gradually',
        'Focus on whole foods and portion control',
        'Set realistic weight loss goals'
      ],
      risks: ['Increased risk of diabetes', 'Heart disease risk', 'High blood pressure']
    },
    {
      range: '30.0 and above',
      category: 'Obese',
      color: 'from-red-400 to-pink-500',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
      icon: <Heart className="w-5 h-5" />,
      description: 'Consider professional guidance for weight management',
      recommendations: [
        'Consult healthcare professionals',
        'Consider structured weight loss programs',
        'Focus on sustainable lifestyle changes',
        'Regular medical monitoring'
      ],
      risks: ['High risk of diabetes', 'Cardiovascular disease', 'Sleep apnea', 'Joint problems']
    }
  ];

  const calculateBMI = () => {
    if (!formData.weight || !formData.height) return;

    setIsCalculating(true);
    
    setTimeout(() => {
      let weight = parseFloat(formData.weight);
      let height = parseFloat(formData.height);
      
      // Convert to metric if needed
      if (formData.unit === 'imperial') {
        weight = weight * 0.453592; // lbs to kg
        height = height * 0.0254; // inches to meters
      } else {
        height = height / 100; // cm to meters
      }
      
      const bmi = weight / (height * height);
      const category = getBMICategory(bmi);
      const idealWeightRange = getIdealWeightRange(height);
      
      setResult({
        bmi: bmi.toFixed(1),
        category,
        idealWeightRange,
        weightToLose: weight > idealWeightRange.max ? (weight - idealWeightRange.max).toFixed(1) : 0,
        weightToGain: weight < idealWeightRange.min ? (idealWeightRange.min - weight).toFixed(1) : 0
      });
      
      setIsCalculating(false);
      setShowDetails(true);
    }, 1500);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return bmiCategories[0];
    if (bmi < 25) return bmiCategories[1];
    if (bmi < 30) return bmiCategories[2];
    return bmiCategories[3];
  };

  const getIdealWeightRange = (heightInMeters) => {
    const heightSquared = heightInMeters * heightInMeters;
    const min = (18.5 * heightSquared);
    const max = (24.9 * heightSquared);
    
    if (formData.unit === 'imperial') {
      return {
        min: (min * 2.20462).toFixed(1), // kg to lbs
        max: (max * 2.20462).toFixed(1),
        unit: 'lbs'
      };
    }
    
    return {
      min: min.toFixed(1),
      max: max.toFixed(1),
      unit: 'kg'
    };
  };

  const resetCalculator = () => {
    setFormData({
      weight: '',
      height: '',
      age: '',
      gender: 'male',
      unit: 'metric'
    });
    setResult(null);
    setShowDetails(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
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
            <Scale className="w-5 h-5 text-blue-400 mr-2" />
            <span className="text-blue-300 font-medium">BMI Calculator</span>
            <div className="w-2 h-2 bg-blue-400 rounded-full ml-2 animate-pulse"></div>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-black leading-none mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-500 to-purple-600 text-transparent bg-clip-text">
              Body Mass Index
            </span>
            <br />
            <span className="text-white">Calculator</span>
          </h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Calculate your BMI and get personalized health insights with our advanced AI-powered analysis
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Calculator Form */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">BMI Calculator</h2>
                  <p className="text-gray-400 text-sm">Enter your details below</p>
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
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {unit === 'metric' ? 'Metric (kg/cm)' : 'Imperial (lbs/in)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Weight */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3 flex items-center">
                    <Scale className="w-4 h-4 mr-2 text-blue-400" />
                    Weight {formData.unit === 'metric' ? '(kg)' : '(lbs)'}
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder={formData.unit === 'metric' ? 'e.g., 70' : 'e.g., 154'}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                  />
                </div>

                {/* Height */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3 flex items-center">
                    <Ruler className="w-4 h-4 mr-2 text-blue-400" />
                    Height {formData.unit === 'metric' ? '(cm)' : '(inches)'}
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    placeholder={formData.unit === 'metric' ? 'e.g., 175' : 'e.g., 69'}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2 text-blue-400" />
                    Age (years)
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="e.g., 30"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2 text-blue-400" />
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <motion.button
                  onClick={calculateBMI}
                  disabled={!formData.weight || !formData.height || isCalculating}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 px-6 rounded-xl hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <Calculator className="w-5 h-5" />
                      Calculate BMI
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
                // BMI Categories Overview
                <motion.div
                  key="categories"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">BMI Categories</h3>
                      <p className="text-gray-400 text-sm">Understanding BMI ranges</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {bmiCategories.map((category, index) => (
                      <motion.div
                        key={category.category}
                        className={`p-4 rounded-xl border ${category.bgColor} ${category.borderColor}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center mr-3`}>
                              {category.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{category.category}</h4>
                              <p className="text-sm text-gray-400">BMI {category.range}</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm">{category.description}</p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-blue-400 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-300 mb-2">Important Note</h4>
                        <p className="text-gray-400 text-sm">
                          BMI is a screening tool and doesn't diagnose health conditions. Consult healthcare professionals for comprehensive assessment.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                // Results Display
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-6"
                >
                  {/* BMI Result Card */}
                  <div className={`relative p-8 rounded-3xl border ${result.category.bgColor} ${result.category.borderColor} overflow-hidden`}>
                    <div className={`absolute inset-0 bg-gradient-to-r ${result.category.color} opacity-10`}></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-3xl font-black text-white">{result.bmi}</h3>
                          <p className="text-gray-300">Your BMI</p>
                        </div>
                        <div className={`w-16 h-16 bg-gradient-to-r ${result.category.color} rounded-2xl flex items-center justify-center`}>
                          {result.category.icon}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-xl font-bold text-white mb-2">{result.category.category}</h4>
                        <p className="text-gray-300">{result.category.description}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-xl p-4">
                          <p className="text-gray-400 text-sm">Ideal Weight Range</p>
                          <p className="text-white font-bold">
                            {result.idealWeightRange.min} - {result.idealWeightRange.max} {result.idealWeightRange.unit}
                          </p>
                        </div>
                        
                        {result.weightToLose > 0 && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                            <p className="text-red-300 text-sm">To reach ideal range</p>
                            <p className="text-white font-bold">Lose {result.weightToLose} {result.idealWeightRange.unit}</p>
                          </div>
                        )}
                        
                        {result.weightToGain > 0 && (
                          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                            <p className="text-green-300 text-sm">To reach ideal range</p>
                            <p className="text-white font-bold">Gain {result.weightToGain} {result.idealWeightRange.unit}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Analysis */}
                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6"
                      >
                        {/* Recommendations */}
                        <div>
                          <h4 className="text-xl font-bold text-white mb-4 flex items-center">
                            <Target className="w-5 h-5 mr-2 text-cyan-400" />
                            Recommendations
                          </h4>
                          <div className="space-y-3">
                            {result.category.recommendations.map((rec, index) => (
                              <motion.div
                                key={index}
                                className="flex items-start"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-300">{rec}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Health Risks */}
                        <div>
                          <h4 className="text-xl font-bold text-white mb-4 flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                            Health Considerations
                          </h4>
                          <div className="space-y-2">
                            {result.category.risks.map((risk, index) => (
                              <motion.div
                                key={index}
                                className="flex items-start"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                              >
                                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3 mt-2"></div>
                                <span className="text-gray-400 text-sm">{risk}</span>
                              </motion.div>
                            ))}
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
                            Set Goals
                          </motion.button>
                          
                          <motion.button
                            className="bg-white/10 text-white border border-white/30 font-semibold py-3 px-6 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Share2 className="w-5 h-5" />
                            Share
                          </motion.button>
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

export default BMICalculator;