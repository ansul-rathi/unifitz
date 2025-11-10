/* eslint-disable react/no-unescaped-entities */
import { Award, Users, Globe, Star } from 'lucide-react';

const trainers = [
  {
    name: 'Priya Sharma',
    specialty: 'Yoga Master',
    experience: '15+ Years',
    certifications: 'International Yoga Alliance (RYT 500)',
    description: 'Specialized in Hatha & Vinyasa Yoga, helping thousands achieve flexibility and inner peace',
    achievements: '10,000+ students trained worldwide',
    image: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    name: 'Dr. Michael Roberts',
    specialty: 'NLP Coach & Mindset Trainer',
    experience: '12+ Years',
    certifications: 'Master Practitioner NLP, Ph.D. Psychology',
    description: 'Expert in behavioral change and habit formation, transforming mindsets for lasting success',
    achievements: 'Featured in Forbes, TEDx Speaker',
    image: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    name: 'Sofia Martinez',
    specialty: 'Zumba & Dance Fitness Expert',
    experience: '10+ Years',
    certifications: 'Zumba Instructor Network (ZIN), ACE Certified',
    description: 'International Zumba specialist bringing energy and fun to every workout session',
    achievements: 'Trained 50,000+ participants globally',
    image: 'https://images.pexels.com/photos/3775566/pexels-photo-3775566.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    name: 'Carlos Mendez',
    specialty: 'Zumba & HIIT Specialist',
    experience: '8+ Years',
    certifications: 'Zumba Gold, HIIT Master Trainer',
    description: 'Combines high-intensity training with dance for maximum fat burning and fun',
    achievements: 'Winner of Best Fitness Instructor 2023',
    image: 'https://images.pexels.com/photos/4944419/pexels-photo-4944419.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
];

const Trainers = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full font-semibold mb-4">
            <Globe className="w-5 h-5" />
            International Expert Team
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Meet Your World-Class Trainers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn from certified international experts who have transformed thousands of lives
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {trainers.map((trainer, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="relative h-80 overflow-hidden">
                <img
                  src={trainer.image}
                  alt={trainer.name}
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-yellow-400 text-black font-bold px-4 py-2 rounded-full flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span>Expert</span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {trainer.name}
                </h3>
                <div className="flex items-center gap-2 text-orange-600 font-semibold mb-4">
                  <Award className="w-5 h-5" />
                  {trainer.specialty}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                    <div className="bg-orange-100 rounded-full p-1 mt-1">
                      <Users className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Experience</div>
                      <div className="text-gray-600">{trainer.experience}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="bg-orange-100 rounded-full p-1 mt-1">
                      <Award className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Certifications</div>
                      <div className="text-gray-600 text-sm">{trainer.certifications}</div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 leading-relaxed">
                  {trainer.description}
                </p>

                <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-3 border-l-4 border-orange-500">
                  <div className="font-semibold text-gray-900 text-sm">Achievement</div>
                  <div className="text-gray-700 text-sm">{trainer.achievements}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 md:p-12 text-white text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Train with the Best, Become Your Best
          </h3>
          <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-6">
            Our team of 4 international experts brings over 45 years of combined experience. They've trained over 65,000 people across 30+ countries, and now they're ready to transform YOUR life!
          </p>
          <div className="flex flex-wrap justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-4xl font-bold">45+</div>
              <div className="text-sm opacity-90">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">65K+</div>
              <div className="text-sm opacity-90">Lives Transformed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">30+</div>
              <div className="text-sm opacity-90">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">4.9/5</div>
              <div className="text-sm opacity-90">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Trainers;
