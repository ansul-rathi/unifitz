import React, { useState } from 'react';
import { Info } from 'lucide-react';

const BMICalculator = () => {
  const [unit, setUnit] = useState('metric');
  const [height, setHeight] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const calculateBMI = () => {
    let heightInMeters;
    if (unit === 'metric' && height) {
      heightInMeters = height / 100;
    } else if (unit === 'imperial' && feet && inches) {
      heightInMeters = ((parseInt(feet) * 12) + parseInt(inches)) * 0.0254;
    }

    if (heightInMeters && weight) {
      const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
      setBmi(bmiValue);
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
    setHeight('');
    setFeet('');
    setInches('');
    setWeight('');
    setBmi(null);
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-900 p-6 rounded-lg shadow-lg flex flex-col md:flex-row items-center md:items-start gap-8">
      {/* Info Section */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-3xl font-bold text-orange-500">BMI Calculator</h3>
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
              <strong>BMI Categories:</strong>
              <ul className="mt-2 space-y-1">
                <li>
                  <span className="font-bold text-blue-500">Underweight:</span> BMI &lt; 18.5
                </li>
                <li>
                  <span className="font-bold text-green-500">Normal weight:</span> BMI 18.5–24.9
                </li>
                <li>
                  <span className="font-bold text-yellow-500">Overweight:</span> BMI 25–29.9
                </li>
                <li>
                  <span className="font-bold text-red-500">Obese:</span> BMI ≥ 30
                </li>
              </ul>
              <p className="mt-2">
                BMI is a general guide and may not accurately reflect health for athletes, elderly,
                or pregnant individuals.
              </p>
            </p>
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="flex-1 w-full">
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

        <div className="space-y-4">
          {unit === 'metric' ? (
            <div>
              <label className="block text-gray-300 mb-2">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
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
                  value={feet}
                  onChange={(e) => setFeet(e.target.value)}
                  placeholder="ft"
                  className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-300 mb-2">Inches</label>
                <input
                  type="number"
                  value={inches}
                  onChange={(e) => setInches(e.target.value)}
                  placeholder="in"
                  className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-gray-300 mb-2">Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter weight in kg"
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <button
            onClick={calculateBMI}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition-colors"
          >
            Calculate BMI
          </button>

          {bmi && (
            <div className="mt-4 text-center">
              <p className="text-xl">
                Your BMI: <span className="font-bold">{bmi}</span>
              </p>
              <p className={`${getBMICategory(bmi).color} font-semibold`}>
                {getBMICategory(bmi).category}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BMICalculator;
