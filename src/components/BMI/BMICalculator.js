import { useState } from 'react';
import { Info } from 'lucide-react';

const HealthAssessment = () => {
  const [unit, setUnit] = useState('metric');
  const [formData, setFormData] = useState({
    height: '',
    feet: '',
    inches: '',
    weight: '',
    age: '',
    profession: '',
    goal: ''
  });
  const [bmi, setBmi] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);

  const calculateBMI = () => {
    let heightInMeters;
    if (unit === 'metric' && formData.height) {
      heightInMeters = formData.height / 100;
    } else if (unit === 'imperial' && formData.feet && formData.inches) {
      heightInMeters = ((parseInt(formData.feet) * 12) + parseInt(formData.inches)) * 0.0254;
    }

    if (heightInMeters && formData.weight) {
      const bmiValue = (formData.weight / (heightInMeters * heightInMeters)).toFixed(1);
      setBmi(bmiValue);
      setShowRecommendation(true);
    }
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-500' };
    if (bmi < 24.9) return { category: 'Normal weight', color: 'text-green-500' };
    if (bmi < 29.9) return { category: 'Overweight', color: 'text-yellow-500' };
    return { category: 'Obese', color: 'text-red-500' };
  };

  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    setFormData({
      ...formData,
      height: '',
      feet: '',
      inches: ''
    });
    setBmi(null);
    setShowRecommendation(false);
  };

  // const getRecommendation = () => {
  //   const bmiCategory = getBMICategory(bmi).category;
  //   const { goal, profession } = formData;
    
  //   let baseMessage = `Based on your BMI of ${bmi} (${bmiCategory}) and your goal of ${goal}, `;
  //   let recommendations = '';
    
  //   if (profession === 'Desk Job') {
  //     recommendations += "Given your desk job, we'll focus on incorporating regular movement and proper ergonomics. ";
  //   }
    
  //   switch(goal) {
  //     case 'Weight Loss':
  //       recommendations += "We'll create a balanced calorie-deficit program combining HIIT, strength training, and nutrition guidance. ";
  //       break;
  //     case 'Muscle Gain':
  //       recommendations += "Our program will focus on progressive overload, proper nutrition, and recovery techniques. ";
  //       break;
  //     case 'General Fitness':
  //       recommendations += "We'll design a well-rounded program with cardio, strength, and flexibility training. ";
  //       break;
  //     case 'Stress Relief':
  //       recommendations += "Your plan will include stress-reducing activities like yoga, meditation, and low-intensity workouts. ";
  //       break;
  //   }

  //   return baseMessage + recommendations + "Our certified trainers will guide you every step of the way with personalized attention and regular progress tracking.";
  // };

  // Previous imports and code remain the same until getRecommendation function

const getRecommendation = () => {
  const bmiCategory = getBMICategory(bmi).category;
  const { goal, profession, age } = formData;
  
  return (
    <div className="space-y-6">
      {/* Health Status */}
      <div>
        <h4 className="text-xl font-semibold text-orange-500 mb-3">Your Health Status</h4>
        <p className="text-gray-300">
          Based on your BMI of {bmi} ({bmiCategory}), age {age}, and {profession.toLowerCase()} lifestyle, 
          here is your personalized fitness journey towards {goal.toLowerCase()}.
        </p>
      </div>

      {/* Recommended Program */}
      <div>
        <h4 className="text-xl font-semibold text-orange-500 mb-3">Your Customized Program Includes</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg">💪</span>
              </div>
              <div>
                <h5 className="font-semibold text-white">Personalized Workouts</h5>
                <p className="text-sm text-gray-300">Tailored exercise routines updated weekly based on your progress</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg">🥗</span>
              </div>
              <div>
                <h5 className="font-semibold text-white">Nutrition Planning</h5>
                <p className="text-sm text-gray-300">Custom meal plans with grocery lists and recipes</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg">👥</span>
              </div>
              <div>
                <h5 className="font-semibold text-white">Dedicated Coach</h5>
                <p className="text-sm text-gray-300">1-on-1 guidance from certified fitness experts</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg">📚</span>
              </div>
              <div>
                <h5 className="font-semibold text-white">Education Sessions</h5>
                <p className="text-sm text-gray-300">Weekly workshops on fitness, nutrition, and wellness</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg">📱</span>
              </div>
              <div>
                <h5 className="font-semibold text-white">Daily Support</h5>
                <p className="text-sm text-gray-300">Workout reminders, progress tracking, and motivation messages</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg">📊</span>
              </div>
              <div>
                <h5 className="font-semibold text-white">Progress Tracking</h5>
                <p className="text-sm text-gray-300">Detailed weekly reports and measurements</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Benefits */}
      <div>
        <h4 className="text-xl font-semibold text-orange-500 mb-3">Additional Benefits</h4>
        <ul className="list-none grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-300">
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Access to fitness app
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Nutrition consultation
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Community support
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Monthly assessments
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Recipe database
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            24/7 support chat
          </li>
        </ul>
      </div>

      {/* Call to Action Note */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <p className="text-white text-center">
          Ready to transform your fitness journey? Book a free demo class now and experience our 
          premium services firsthand!
        </p>
      </div>
    </div>
  );
};


  return (
    <div className="max-w-4xl mx-auto bg-gray-900 p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-3xl font-bold text-orange-500">Discover Your Fitness Potential</h3>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-gray-400 hover:text-orange-500"
        >
          <Info size={24} />
        </button>
      </div>

      {showInfo && (
        <div className="mb-6 p-4 bg-gray-800 border border-orange-500 rounded-lg text-gray-300">
          <p className="text-sm">
            Complete your health assessment to receive personalized recommendations and start your fitness journey with us.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Unit Toggle */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => handleUnitChange('metric')}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                unit === 'metric'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Metric (cm)
            </button>
            <button
              onClick={() => handleUnitChange('imperial')}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                unit === 'imperial'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Imperial (ft)
            </button>
          </div>

          {/* Height Input */}
          {unit === 'metric' ? (
            <div>
              <label className="block text-gray-300 mb-2">Height (cm)</label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({...formData, height: e.target.value})}
                placeholder="Enter height in cm"
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>
          ) : (
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-300 mb-2">Feet</label>
                <input
                  type="number"
                  value={formData.feet}
                  onChange={(e) => setFormData({...formData, feet: e.target.value})}
                  placeholder="ft"
                  className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-300 mb-2">Inches</label>
                <input
                  type="number"
                  value={formData.inches}
                  onChange={(e) => setFormData({...formData, inches: e.target.value})}
                  placeholder="in"
                  className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          )}

          {/* Weight Input */}
          <div>
            <label className="block text-gray-300 mb-2">Weight (kg)</label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({...formData, weight: e.target.value})}
              placeholder="Enter weight in kg"
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          {/* Age Input */}
          <div>
            <label className="block text-gray-300 mb-2">Age</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: e.target.value})}
              placeholder="Enter your age"
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Profession Dropdown */}
          <div>
            <label className="block text-gray-300 mb-2">Profession</label>
            <select
              value={formData.profession}
              onChange={(e) => setFormData({...formData, profession: e.target.value})}
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            >
              <option value="">Select your profession</option>
              <option value="Desk Job">Desk Job</option>
              <option value="Active Job">Active Job</option>
              <option value="Student">Student</option>
              <option value="Homemaker">Homemaker</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* Fitness Goal Dropdown */}
          <div>
            <label className="block text-gray-300 mb-2">Fitness Goal</label>
            <select
              value={formData.goal}
              onChange={(e) => setFormData({...formData, goal: e.target.value})}
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            >
              <option value="">Select your goal</option>
              <option value="Weight Loss">Weight Loss</option>
              <option value="Muscle Gain">Muscle Gain</option>
              <option value="General Fitness">General Fitness</option>
              <option value="Stress Relief">Stress Relief</option>
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={calculateBMI}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg transition-colors mt-6"
      >
        Analyze My Health
      </button>

      {/* {showRecommendation && (
        <div className="mt-6 p-6 bg-gray-800 rounded-lg border border-orange-500">
          <div className="mb-4">
            <p className="text-xl text-white">
              Your BMI: <span className="font-bold">{bmi}</span>
              <span className={`ml-2 ${getBMICategory(bmi).color} font-semibold`}>
                ({getBMICategory(bmi).category})
              </span>
            </p>
          </div>
          
          <p className="text-gray-300 mb-6">{getRecommendation()}</p>
          
          <button
            onClick={() => alert('Demo class booking request sent! Our team will contact you shortly.')}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors"
          >
            Book a Free Demo Class
          </button>
        </div>
      )} */}


{showRecommendation && (
  <div className="mt-6 p-6 bg-gray-800 rounded-lg border border-orange-500">
    <div className="mb-4">
      <p className="text-xl text-white">
        Your BMI: <span className="font-bold">{bmi}</span>
        <span className={`ml-2 ${getBMICategory(bmi).color} font-semibold`}>
          ({getBMICategory(bmi).category})
        </span>
      </p>
    </div>
    
    {getRecommendation()}
    
    <button
      onClick={() => alert('Demo class booking request sent! Our team will contact you shortly.')}
      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors mt-6"
    >
      Book a Free Demo Class
    </button>
  </div>
)}
    </div>
  );
};

export default HealthAssessment;