import React, { useState } from 'react';
import { Check } from 'lucide-react';

const ClientForm = () => {
    const [step, setStep] = useState(1);
    const [showResults, setShowResults] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        age: '',
        gender: '',
        profession: '',
        height: '',
        weight: '',
        medicalConditions: [],
        otherConditions: '',
        allergies: '',
        fitnessGoal: ''
    });

    const medicalConditionsList = [
        'Diabetes', 'Thyroid', 'High Blood Pressure', 'Heart Disease',
        'Asthma', 'Arthritis', 'Back Pain', 'Joint Pain', 'None'
    ];

    const professions = [
        'Student', 'Housewife', 'Job Professional',
        'Business Professional', 'Self Employed', 'Retired', 'Other'
    ];

    const fitnessGoals = [
        'Weight Loss', 'Muscle Gain', 'General Fitness',
        'Strength Training', 'Flexibility', 'Stress Relief'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/save-to-sheets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    submittedAt: new Date().toISOString()
                })
            });

            if (!response.ok) throw new Error('Failed to submit');
            setShowResults(true);
        } catch (error) {
            alert('Failed to submit form. Please try again.');
        }
    };

    const getBMICategory = (bmi) => {
        if (bmi < 18.5) return {
            category: "Underweight",
            color: "text-blue-500",
            message: "Our specialized weight gain program focuses on building healthy muscle mass."
        };
        if (bmi < 24.9) return {
            category: "Normal Weight",
            color: "text-green-500",
            message: "Great! Let's focus on maintaining and improving your overall fitness."
        };
        if (bmi < 29.9) return {
            category: "Overweight",
            color: "text-yellow-500",
            message: "We'll help you achieve your ideal weight through our balanced program."
        };
        return {
            category: "Obese",
            color: "text-red-500",
            message: "Our trainers will help you start your weight loss journey safely."
        };
    };

    const InputField = ({ label, name, type = 'text', ...props }) => (
        <div className="mb-4">
            <label className="block text-gray-300 mb-2 text-sm font-medium">{label}</label>
            <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
                className="w-full px-4 py-3 bg-gradient-to-br from-gray-700 via-gray-200 to-gray-700 text-black rounded-lg focus:outline-none"
                {...props}
            />
        </div>
    );

    const SelectField = ({ label, name, options }) => (
        <div className="mb-4">
            <label className="block text-gray-300 mb-2 text-sm font-medium">{label}</label>
            <select
                name={name}
                value={formData[name]}
                onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
                className="w-full px-4 py-3 bg-gradient-to-br from-gray-700 via-gray-200 to-gray-700 text-black rounded-lg focus:outline-none"
            >
                <option value="">Select {label}</option>
                {options.map((option) => (
                    <option key={option} value={option.toLowerCase()}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white">Personal Information</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="First Name" name="firstName" required />
                            <InputField label="Last Name" name="lastName" required />
                            <InputField label="Email" name="email" type="email" required />
                            <InputField label="Phone" name="phone" type="tel" required />
                            <InputField label="Age" name="age" type="number" required />
                            <SelectField label="Gender" name="gender" options={['Male', 'Female', 'Other']} />
                            <SelectField label="Profession" name="profession" options={professions} />
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white">Health Assessment</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="Height (cm)" name="height" type="number" required />
                            <InputField label="Weight (kg)" name="weight" type="number" required />
                        </div>

                        <div className="mt-6">
                            <label className="block text-gray-300 mb-3">Medical Conditions</label>
                            <div className="grid grid-cols-2 gap-4">
                                {medicalConditionsList.map((condition) => (
                                    <label key={condition} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.medicalConditions.includes(condition)}
                                            onChange={(e) => {
                                                const updatedConditions = e.target.checked
                                                    ? [...formData.medicalConditions, condition]
                                                    : formData.medicalConditions.filter(c => c !== condition);
                                                setFormData({...formData, medicalConditions: updatedConditions});
                                            }}
                                            className="rounded border-gray-600 text-yellow-500"
                                        />
                                        <span className="text-gray-300">{condition}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <InputField label="Other Medical Conditions (if any)" name="otherConditions" />
                        <InputField label="Allergies (if any)" name="allergies" />
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white">Fitness Goals</h2>
                        <SelectField 
                            label="Primary Fitness Goal" 
                            name="fitnessGoal" 
                            options={fitnessGoals} 
                            required 
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    const ResultSection = () => {
        const heightInM = formData.height / 100;
        const bmi = (formData.weight / (heightInM * heightInM)).toFixed(1);
        const bmiInfo = getBMICategory(bmi);

        return (
            <div className="space-y-8">
                <div className="bg-zinc-800 rounded-lg p-6">
                    <h3 className="text-2xl font-bold text-white mb-4">
                        Thank you {formData.firstName}!
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-gray-400">Your BMI:</p>
                            <p className="text-3xl font-bold text-white">{bmi}</p>
                            <p className={`${bmiInfo.color} font-semibold`}>
                                {bmiInfo.category}
                            </p>
                        </div>
                        <p className="text-gray-300">{bmiInfo.message}</p>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-500 via-yellow-200 to-yellow-500 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-black mb-2">Next Steps</h3>
                    <p className="text-black mb-4">
                        Our team will contact you shortly to schedule your first session.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-zinc-900 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {!showResults ? (
                    <div className="bg-zinc-950 rounded-xl p-6 sm:p-8">
                        {/* Stepper */}
                        <div className="flex justify-center mb-8">
                            <div className="flex items-center w-full max-w-xs">
                                {[1, 2, 3].map((stepNumber) => (
                                    <React.Fragment key={stepNumber}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                            step >= stepNumber 
                                                ? 'bg-gradient-to-r from-yellow-500 via-yellow-200 to-yellow-500' 
                                                : 'bg-zinc-700'
                                        }`}>
                                            {step > stepNumber ? (
                                                <Check className="w-5 h-5 text-black" />
                                            ) : (
                                                <span className="text-black">{stepNumber}</span>
                                            )}
                                        </div>
                                        {stepNumber < 3 && (
                                            <div className={`flex-1 h-1 ${
                                                step > stepNumber 
                                                    ? 'bg-gradient-to-r from-yellow-500 via-yellow-200 to-yellow-500' 
                                                    : 'bg-zinc-700'
                                            }`} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {renderStepContent()}

                            <div className="flex justify-between mt-8">
                                {step > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setStep(prev => prev - 1)}
                                        className="px-6 py-2 bg-gradient-to-br from-gray-700 via-gray-200 to-gray-700 text-black rounded-lg hover:opacity-90 transition-opacity"
                                    >
                                        Back
                                    </button>
                                )}
                                {step < 3 ? (
                                    <button
                                        type="button"
                                        onClick={() => setStep(prev => prev + 1)}
                                        className="ml-auto px-6 py-2 bg-gradient-to-r from-yellow-500 via-yellow-200 to-yellow-500 text-black rounded-lg hover:opacity-90 transition-opacity"
                                    >
                                        Next
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        className="ml-auto px-6 py-2 bg-gradient-to-r from-yellow-500 via-yellow-200 to-yellow-500 text-black rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                                    >
                                        Submit
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                ) : (
                    <ResultSection />
                )}
            </div>
        </div>
    );
};

export default ClientForm;