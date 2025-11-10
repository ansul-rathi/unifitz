/* eslint-disable react/no-unescaped-entities */
import { Flame, Heart, Zap, Brain, Shield, Smile, TrendingUp, Users, Moon, Clock, Target, Trophy, Battery, Sparkles, Wind, Dumbbell, Activity, Star, Lightbulb, Leaf, Rainbow } from 'lucide-react';

const benefits = [
  { icon: Flame, title: 'Fat Burning', description: 'Accelerate metabolism and burn stubborn fat effectively' },
  { icon: Smile, title: 'Mood Boosting', description: 'Release endorphins and feel happier every day' },
  { icon: Battery, title: 'Stamina Increase', description: 'Build endurance and energy levels naturally' },
  { icon: Heart, title: 'Cardiovascular Health', description: 'Strengthen your heart and improve circulation' },
  { icon: Dumbbell, title: 'Muscle Toning', description: 'Sculpt and define your body with targeted exercises' },
  { icon: Wind, title: 'Flexibility', description: 'Enhance mobility and prevent injuries' },
  { icon: Brain, title: 'Mental Clarity', description: 'Sharpen focus and boost cognitive function' },
  { icon: Shield, title: 'Immunity Boost', description: 'Strengthen your body\'s natural defense system' },
  { icon: Moon, title: 'Better Sleep', description: 'Improve sleep quality and wake up refreshed' },
  { icon: TrendingUp, title: 'Confidence Building', description: 'Transform your self-image and boost confidence' },
  { icon: Target, title: 'Goal Achievement', description: 'Learn to set and accomplish fitness goals' },
  { icon: Users, title: 'Community Support', description: 'Join a motivated community of 5000+ members' },
  { icon: Clock, title: 'Time Efficiency', description: 'Get results with just 30 minutes daily' },
  { icon: Trophy, title: 'Habit Formation', description: 'Build lasting healthy habits in 21 days' },
  { icon: Activity, title: 'Full Body Workout', description: 'Comprehensive training for all muscle groups' },
  { icon: Sparkles, title: 'Stress Relief', description: 'Release tension and find inner peace' },
  { icon: Zap, title: 'Energy Boost', description: 'Feel more energized throughout the day' },
  { icon: Star, title: 'Posture Improvement', description: 'Correct alignment and reduce back pain' },
  { icon: Lightbulb, title: 'NLP Techniques', description: 'Master mindset and motivation strategies' },
  { icon: Leaf, title: 'Holistic Wellness', description: 'Balance mind, body, and spirit' },
  { icon: Rainbow, title: 'Life Transformation', description: 'Experience positive changes in all life areas' },
];

const Benefits = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            21 Life-Changing Benefits
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience complete transformation across physical, mental, and emotional well-being
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-orange-500 group"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg p-3 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-8 md:p-12 text-white text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Why 21 Days?
          </h3>
          <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Scientific research shows it takes 21 days to form a new habit. Our expertly designed program leverages this crucial period to help you build sustainable fitness habits that last a lifetime. You're not just working out—you're rewiring your brain for success!
          </p>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
