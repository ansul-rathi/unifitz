import { useState } from 'react';
import { Info, Activity, Heart, Target, Clock } from 'lucide-react';

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

  // Keep existing functions (calculateBMI, getBMICategory, handleUnitChange, getRecommendation)
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

  const getRecommendation = () => {
    const bmiCategory = getBMICategory(bmi).category;
    const { goal, profession, age } = formData;
    
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-xl">
          <h4 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="text-orange-500" />
            Your Health Profile
          </h4>
          <p className="text-gray-300 leading-relaxed">
            Based on your BMI of <span className="text-orange-500 font-semibold">{bmi}</span> ({bmiCategory}), 
            age {age}, and {profession.toLowerCase()} lifestyle, weve crafted a personalized journey 
            towards your goal of {goal.toLowerCase()}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-xl">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Heart className="text-orange-500" />
              Core Program Features
            </h4>
            <div className="space-y-4">
              {[
                {
                  title: 'Personalized Workouts',
                  desc: 'Custom exercise routines updated weekly',
                  icon: '💪'
                },
                {
                  title: 'Nutrition Planning',
                  desc: 'Tailored meal plans and recipes',
                  icon: '🥗'
                },
                {
                  title: 'Expert Guidance',
                  desc: '1-on-1 coaching and support',
                  icon: '👥'
                }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4 bg-gray-900 bg-opacity-50 p-4 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-orange-500 bg-opacity-20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">{item.icon}</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-white">{item.title}</h5>
                    <p className="text-sm text-gray-300">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-xl">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Target className="text-orange-500" />
              Support Services
            </h4>
            <div className="space-y-4">
              {[
                {
                  title: 'Progress Tracking',
                  desc: 'Weekly measurements and reports',
                  icon: '📊'
                },
                {
                  title: 'Wellness Education',
                  desc: 'Regular workshops and seminars',
                  icon: '📚'
                },
                {
                  title: 'Community Support',
                  desc: '24/7 access to fitness community',
                  icon: '🤝'
                }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4 bg-gray-900 bg-opacity-50 p-4 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-orange-500 bg-opacity-20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">{item.icon}</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-white">{item.title}</h5>
                    <p className="text-sm text-gray-300">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-orange-500 bg-opacity-10 border border-orange-500 p-6 rounded-xl">
          <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="text-orange-500" />
            Getting Started
          </h4>
          <p className="text-gray-300 mb-6">
            Experience our premium services firsthand with a complimentary session. 
            Our expert trainers will guide you through a personalized workout and 
            discuss your fitness journey in detail.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {['Fitness Assessment', 'Goal Setting', 'Program Design', 'Nutrition Guide'].map((step, index) => (
              <div key={index} className="bg-gray-900 bg-opacity-50 p-3 rounded-lg text-center">
                <div className="text-orange-500 font-bold mb-1">Step {index + 1}</div>
                <div className="text-gray-300">{step}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const InputField = ({ label, ...props }) => (
    <div className="space-y-2">
      <label className="block text-gray-300 font-medium">{label}</label>
      <input
        {...props}
        className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-all"
      />
    </div>
  );

  const SelectField = ({ label, ...props }) => (
    <div className="space-y-2">
      <label className="block text-gray-300 font-medium">{label}</label>
      <select
        {...props}
        className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-all"
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-b from-gray-900 to-gray-800 p-8 rounded-xl shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-4xl font-bold text-white">
          <span className="text-orange-500">Fitness</span> Assessment
        </h3>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
        >
          <Info size={24} className="text-orange-500" />
        </button>
      </div>

      {showInfo && (
        <div className="mb-8 p-4 bg-gray-800 border-l-4 border-orange-500 rounded-lg">
          <p className="text-gray-300">
            Complete your health assessment to receive personalized recommendations 
            and begin your transformation journey with us.
          </p>
        </div>
      )}

      <div className="space-y-8">
        <div className="flex gap-4 p-1 bg-gray-800 rounded-lg w-fit">
          {['metric', 'imperial'].map((unitType) => (
            <button
              key={unitType}
              onClick={() => handleUnitChange(unitType)}
              className={`px-6 py-2 rounded-md transition-all ${
                unit === unitType
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {unitType.charAt(0).toUpperCase() + unitType.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {unit === 'metric' ? (
              <InputField
                label="Height (cm)"
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({...formData, height: e.target.value})}
                placeholder="Enter height in cm"
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Feet"
                  type="number"
                  value={formData.feet}
                  onChange={(e) => setFormData({...formData, feet: e.target.value})}
                  placeholder="ft"
                />
                <InputField
                  label="Inches"
                  type="number"
                  value={formData.inches}
                  onChange={(e) => setFormData({...formData, inches: e.target.value})}
                  placeholder="in"
                />
              </div>
            )}
            <InputField
              label="Weight (kg)"
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({...formData, weight: e.target.value})}
              placeholder="Enter weight in kg"
            />
          </div>

          <div className="space-y-6">
            <InputField
              label="Age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: e.target.value})}
              placeholder="Enter your age"
            />
            <SelectField
              label="Profession"
              value={formData.profession}
              onChange={(e) => setFormData({...formData, profession: e.target.value})}
            >
              <option value="">Select your profession</option>
              <option value="Desk Job">Desk Job</option>
              <option value="Active Job">Active Job</option>
              <option value="Student">Student</option>
              <option value="Homemaker">Homemaker</option>
              <option value="Others">Others</option>
            </SelectField>
            <SelectField
              label="Fitness Goal"
              value={formData.goal}
              onChange={(e) => setFormData({...formData, goal: e.target.value})}
            >
              <option value="">Select your goal</option>
              <option value="Weight Loss">Weight Loss</option>
              <option value="Muscle Gain">Muscle Gain</option>
              <option value="General Fitness">General Fitness</option>
              <option value="Stress Relief">Stress Relief</option>
            </SelectField>
          </div>
        </div>

        <button
          onClick={calculateBMI}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
        >
          Generate My Fitness Plan
        </button>
      </div>

      {showRecommendation && (
        <div className="mt-8 space-y-6">
          <div className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl text-white">
            <p className="text-2xl font-bold">
              Your BMI: {bmi}
              <span className="ml-3 text-xl opacity-90">
                ({getBMICategory(bmi).category})
              </span>
            </p>
          </div>
          
          {getRecommendation()}
          
          <button
            onClick={() => alert('Demo class booking request sent! Our team will contact you shortly.')}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            Book Your Free Session Now
          </button>
        </div>
      )}
    </div>
  );
};

export default HealthAssessment;