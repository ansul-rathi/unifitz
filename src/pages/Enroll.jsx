/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-escape */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Target, Activity, Scale, AlertCircle, Mail, Phone, Utensils } from 'lucide-react';

const EnrollmentForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    fitnessGoal: '',
    currentFitnessLevel: '',
    currentWeight: '',
    injuries: '',
    email: '',
    phone: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fitnessGoals = [
    'Weight Loss',
    'Muscle Gain',
    'General Fitness',
    'Strength Training',
    'Cardiovascular Health',
    'Flexibility & Mobility',
    'Athletic Performance',
    'Rehabilitation'
  ];

  const fitnessLevels = [
    'Beginner (0-6 months)',
    'Intermediate (6 months - 2 years)',
    'Advanced (2+ years)',
    'Professional/Competitive'
  ];

  const dietTypes = [
    'No Restrictions',
    'Vegetarian',
    'Vegan',
    'Keto',
    'Paleo',
    'Mediterranean',
    'Low Carb',
    'High Protein',
    'Gluten Free',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.age || formData.age < 13 || formData.age > 100) newErrors.age = 'Please enter a valid age (13-100)';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.fitnessGoal) newErrors.fitnessGoal = 'Fitness goal is required';
    if (!formData.currentFitnessLevel) newErrors.currentFitnessLevel = 'Current fitness level is required';
    if (!formData.currentWeight.trim()) newErrors.currentWeight = 'Current weight is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation for Indian numbers
    const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
    if (!formData.phone) {
      newErrors.phone = 'Mobile number is required';
    } else if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid Indian mobile number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically send the data to your backend
      console.log('Form submitted:', formData);
      
      // Reset form or redirect user
      alert('Enrollment successful! Welcome to UniFitz!');
    } catch (error) {
      console.error('Submission error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:border-white/60 focus:ring-2 focus:ring-white/30 transition-all duration-200";
  const labelClasses = "block text-sm font-semibold text-white mb-2";
  const errorClasses = "text-red-300 text-sm mt-1 flex items-center gap-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 py-12 px-4">
      <div className="max-w-4xl mx-auto mt-10">
        <motion.div
        initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white py-16 px-8 rounded-2xl shadow-lg"
        >
          <h1 className="text-4xl font-bold mb-4">
            Join <span className="text-white">UniFitz</span>
          </h1>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            Start your fitness journey with us. Fill out this form to get your personalized training plan.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 space-y-8"
        >
          {/* Personal Information Section */}
          <div className="border-b border-white/20 pb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <User className="text-white" size={24} />
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className={labelClasses}>
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={inputClasses}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className={errorClasses}>
                    <AlertCircle size={16} />
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="age" className={labelClasses}>
                  Age *
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className={inputClasses}
                  placeholder="Enter your age"
                  min="13"
                  max="100"
                />
                {errors.age && (
                  <p className={errorClasses}>
                    <AlertCircle size={16} />
                    {errors.age}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="gender" className={labelClasses}>
                  Gender *
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={inputClasses}
                >
                  <option value="">Select your gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
                {errors.gender && (
                  <p className={errorClasses}>
                    <AlertCircle size={16} />
                    {errors.gender}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="currentWeight" className={labelClasses}>
                  Current Weight (kg) *
                </label>
                <input
                  type="number"
                  id="currentWeight"
                  name="currentWeight"
                  value={formData.currentWeight}
                  onChange={handleInputChange}
                  className={inputClasses}
                  placeholder="e.g., 70"
                  min="20"
                  max="300"
                  step="0.1"
                />
                {errors.currentWeight && (
                  <p className={errorClasses}>
                    <AlertCircle size={16} />
                    {errors.currentWeight}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Fitness Information Section */}
          <div className="border-b border-white/20 pb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Target className="text-white" size={24} />
              Fitness Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fitnessGoal" className={labelClasses}>
                  Fitness Goal *
                </label>
                <select
                  id="fitnessGoal"
                  name="fitnessGoal"
                  value={formData.fitnessGoal}
                  onChange={handleInputChange}
                  className={inputClasses}
                >
                  <option value="">Select your primary goal</option>
                  {fitnessGoals.map(goal => (
                    <option key={goal} value={goal}>{goal}</option>
                  ))}
                </select>
                {errors.fitnessGoal && (
                  <p className={errorClasses}>
                    <AlertCircle size={16} />
                    {errors.fitnessGoal}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="currentFitnessLevel" className={labelClasses}>
                  Current Fitness Level *
                </label>
                <select
                  id="currentFitnessLevel"
                  name="currentFitnessLevel"
                  value={formData.currentFitnessLevel}
                  onChange={handleInputChange}
                  className={inputClasses}
                >
                  <option value="">Select your current level</option>
                  {fitnessLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                {errors.currentFitnessLevel && (
                  <p className={errorClasses}>
                    <AlertCircle size={16} />
                    {errors.currentFitnessLevel}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Health Section */}
          <div className="border-b border-white/20 pb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="text-white" size={24} />
              Health Information
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="injuries" className={labelClasses}>
                  Injuries or Medical Conditions
                </label>
                <textarea
                  id="injuries"
                  name="injuries"
                  value={formData.injuries}
                  onChange={handleInputChange}
                  className={`${inputClasses} h-24 resize-none`}
                  placeholder="Please describe any injuries, medical conditions, or physical limitations we should be aware of..."
                />
                <p className="text-sm text-white/70 mt-1">
                  This information helps us create a safe and effective program for you.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Phone className="text-white" size={24} />
              Contact Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className={labelClasses}>
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={inputClasses}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className={errorClasses}>
                    <AlertCircle size={16} />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className={labelClasses}>
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={inputClasses}
                  placeholder="+91 98765 43210 or 9876543210"
                />
                <p className="text-sm text-white/70 mt-1">
                  Indian mobile number (10 digits)
                </p>
                {errors.phone && (
                  <p className={errorClasses}>
                    <AlertCircle size={16} />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <Target size={20} />
                Start My Fitness Journey
              </>
            )}
          </motion.button>

          <p className="text-center text-sm text-white/70 mt-4">
            By submitting this form, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.form>
      </div>
    </div>
  );
};

export default EnrollmentForm;