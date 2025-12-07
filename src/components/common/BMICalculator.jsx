import { useState } from "react";
import { motion } from "framer-motion";

export default function BMICalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [heightUnit, setHeightUnit] = useState("ft");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState("");
  const [calories, setCalories] = useState(null);

  const calculate = () => {
    let heightInCm;
    if (heightUnit === "cm") {
      heightInCm = parseFloat(height);
    } else {
      const totalInches = parseFloat(feet || 0) * 12 + parseFloat(inches || 0);
      heightInCm = totalInches * 2.54;
    }
    
    let weightInKg;
    if (weightUnit === "kg") {
      weightInKg = parseFloat(weight);
    } else {
      weightInKg = parseFloat(weight) * 0.453592;
    }
    
    if (!heightInCm || !weightInKg) return;
    
    const h = heightInCm / 100;
    const bmiValue = (weightInKg / (h * h)).toFixed(1);
    setBmi(bmiValue);
    let cat = "";
    if (bmiValue < 18.5) cat = "Underweight";
    else if (bmiValue < 24.9) cat = "Normal";
    else if (bmiValue < 29.9) cat = "Overweight";
    else cat = "Obese";
    setCategory(cat);
    const maintenance = Math.round(weightInKg * 22 * 1.4);
    setCalories(maintenance);
  };

  const getSpeedometerValue = () => {
    if (!bmi) return 0;
    if (bmi < 18.5) return 25;
    if (bmi < 24.9) return 50;
    if (bmi < 29.9) return 75;
    return 100;
  };
  
  const getCategoryColor = () => {
    if (category === "Underweight") return "text-blue-600";
    if (category === "Normal") return "text-green-600";
    if (category === "Overweight") return "text-orange-600";
    return "text-red-600";
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-violet-900 p-3 sm:p-6 flex justify-center items-center overflow-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl p-4 sm:p-6 lg:p-8"
      >
        <motion.h1 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-1 sm:mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
        >
          BMI Calculator
        </motion.h1>
        <p className="text-center text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">Track your health journey</p>
        
        <div className={`${bmi ? 'lg:grid lg:grid-cols-2 lg:gap-8' : ''}`}>
          {/* Left Column - Input Form */}
          <div className="space-y-4 sm:space-y-5">
            {/* Height Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-3 sm:p-4">
              <div className="flex justify-between items-center mb-2 sm:mb-3">
                <label className="block font-semibold text-gray-700 text-sm sm:text-base">Height</label>
                <div className="flex bg-white rounded-full p-1 shadow-sm">
                  <button
                    className={`px-3 sm:px-4 py-1 text-xs sm:text-sm rounded-full transition-all ${
                      heightUnit === "cm" ? "bg-purple-600 text-white" : "text-gray-600"
                    }`}
                    onClick={() => setHeightUnit("cm")}
                  >
                    cm
                  </button>
                  <button
                    className={`px-3 sm:px-4 py-1 text-xs sm:text-sm rounded-full transition-all ${
                      heightUnit === "ft" ? "bg-purple-600 text-white" : "text-gray-600"
                    }`}
                    onClick={() => setHeightUnit("ft")}
                  >
                    ft/in
                  </button>
                </div>
              </div>
              {heightUnit === "cm" ? (
                <input
                  type="number"
                  className="w-full border-2 border-purple-200 rounded-xl p-2 sm:p-3 text-sm sm:text-base focus:border-purple-500 focus:outline-none"
                  placeholder="Enter height in cm"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              ) : (
                <div className="flex gap-2 sm:gap-3">
                  <input
                    type="number"
                    className="flex-1 w-1/2 border-2 border-purple-200 rounded-xl p-2 sm:p-3 text-sm sm:text-base focus:border-purple-500 focus:outline-none"
                    placeholder="Feet"
                    value={feet}
                    onChange={(e) => setFeet(e.target.value)}
                  />
                  <input
                    type="number"
                    className="flex-1 w-1/2 border-2 border-purple-200 rounded-xl p-2 sm:p-3 text-sm sm:text-base focus:border-purple-500 focus:outline-none"
                    placeholder="Inches"
                    value={inches}
                    onChange={(e) => setInches(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Weight Section */}
            <div className="bg-gradient-to-r from-pink-50 to-red-50 rounded-2xl p-3 sm:p-4">
              <div className="flex justify-between items-center mb-2 sm:mb-3">
                <label className="block font-semibold text-gray-700 text-sm sm:text-base">Weight</label>
                <div className="flex bg-white rounded-full p-1 shadow-sm">
                  <button
                    className={`px-3 sm:px-4 py-1 text-xs sm:text-sm rounded-full transition-all ${
                      weightUnit === "kg" ? "bg-pink-600 text-white" : "text-gray-600"
                    }`}
                    onClick={() => setWeightUnit("kg")}
                  >
                    kg
                  </button>
                  <button
                    className={`px-3 sm:px-4 py-1 text-xs sm:text-sm rounded-full transition-all ${
                      weightUnit === "lbs" ? "bg-pink-600 text-white" : "text-gray-600"
                    }`}
                    onClick={() => setWeightUnit("lbs")}
                  >
                    lbs
                  </button>
                </div>
              </div>
              <input
                type="number"
                className="w-full border-2 border-pink-200 rounded-xl p-2 sm:p-3 text-sm sm:text-base focus:border-pink-500 focus:outline-none"
                placeholder={`Enter weight in ${weightUnit}`}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all"
              onClick={calculate}
            >
              Calculate My BMI
            </motion.button>
          </div>

          {/* Right Column - Results */}
          {bmi && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 lg:mt-0 space-y-4"
            >
              {/* BMI Result Card */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 sm:p-6 text-center">
                <p className="text-gray-600 text-xs sm:text-sm mb-1">Your BMI</p>
                <motion.p 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                >
                  {bmi}
                </motion.p>
                <p className={`text-xl sm:text-2xl font-bold mt-1 sm:mt-2 ${getCategoryColor()}`}>
                  {category}
                </p>
              </div>

              {/* Calories Card */}
              <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-2xl p-4 sm:p-6 text-center">
                <p className="text-gray-600 text-xs sm:text-sm mb-1">Daily Calorie Intake</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-600">
                  {calories} <span className="text-base sm:text-xl">kcal/day</span>
                </p>
              </div>

              {/* Speedometer */}
              <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
                <p className="text-center text-gray-600 mb-3 sm:mb-4 font-medium text-sm sm:text-base">Health Meter</p>
                <div className="relative mx-auto w-48 h-24 sm:w-56 sm:h-28 lg:w-64 lg:h-32">
                  <svg className="w-full h-full" viewBox="0 0 200 100">
                    <defs>
                      <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="33%" stopColor="#10b981" />
                        <stop offset="66%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 20 90 A 80 80 0 0 1 180 90"
                      fill="none"
                      stroke="url(#gaugeGradient)"
                      strokeWidth="20"
                      strokeLinecap="round"
                    />
                  </svg>
                  <motion.div
                    className="absolute bottom-0 left-1/2 w-1 h-12 sm:h-14 lg:h-16 bg-gray-800 rounded-full origin-bottom"
                    style={{ transformOrigin: "bottom center" }}
                    initial={{ rotate: -90 }}
                    animate={{ rotate: -90 + (getSpeedometerValue() * 1.8) }}
                    transition={{ type: "spring", stiffness: 60, damping: 10 }}
                  >
                    <div className="absolute -top-2 sm:-top-3 -left-1.5 sm:-left-2 w-4 h-4 sm:w-5 sm:h-5 bg-gray-800 rounded-full border-2 sm:border-4 border-white shadow-lg"></div>
                  </motion.div>
                </div>
                <div className="flex justify-between text-xs font-medium px-2 sm:px-4 mt-2 sm:mt-4 text-gray-600">
                  <span>Underweight</span>
                  <span>Normal</span>
                  <span>Overweight</span>
                  <span>Obese</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}