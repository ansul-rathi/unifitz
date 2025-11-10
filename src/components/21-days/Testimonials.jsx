/* eslint-disable react/no-unescaped-entities */
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Ananya Reddy',
    location: 'Mumbai, India',
    rating: 5,
    image: 'https://images.pexels.com/photos/3768894/pexels-photo-3768894.jpeg?auto=compress&cs=tinysrgb&w=400',
    text: 'Lost 5kg in 21 days! The combination of yoga, Zumba, and NLP coaching completely transformed my mindset. Best investment I ever made.',
    result: 'Lost 5kg in 21 days'
  },
  {
    name: 'Ahmed Al Mansoori',
    location: 'Dubai, UAE',
    rating: 5,
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
    text: 'The international trainers are phenomenal! The energy in every session is incredible. My stamina increased dramatically and I feel 10 years younger.',
    result: '10+ years younger feeling'
  },
  {
    name: 'Priya Kapoor',
    location: 'Bangalore, India',
    rating: 5,
    image: 'https://images.pexels.com/photos/3768910/pexels-photo-3768910.jpeg?auto=compress&cs=tinysrgb&w=400',
    text: 'The NLP sessions helped me overcome mental barriers I had for years. Combined with the workouts, I am a completely new person with unshakeable confidence.',
    result: 'Transformed mindset'
  },
  {
    name: 'Sarah Johnson',
    location: 'Abu Dhabi, UAE',
    rating: 5,
    image: 'https://images.pexels.com/photos/3768997/pexels-photo-3768997.jpeg?auto=compress&cs=tinysrgb&w=400',
    text: 'At just 1 AED, I thought it was too good to be true. But the value is insane! Professional trainers, amazing community, and real results. Highly recommended!',
    result: 'Best value ever'
  },
  {
    name: 'Rajesh Kumar',
    location: 'Delhi, India',
    rating: 5,
    image: 'https://images.pexels.com/photos/3760137/pexels-photo-3760137.jpeg?auto=compress&cs=tinysrgb&w=400',
    text: 'The habit-building approach is genius. After 21 days, healthy living became automatic. My family noticed the change in my energy and mood immediately.',
    result: 'Built lasting habits'
  },
  {
    name: 'Fatima Hassan',
    location: 'Sharjah, UAE',
    rating: 5,
    image: 'https://images.pexels.com/photos/3775156/pexels-photo-3775156.jpeg?auto=compress&cs=tinysrgb&w=400',
    text: 'The Zumba sessions are so much fun! I never thought fitness could be this enjoyable. Lost weight while having the time of my life. Thank you to all the trainers!',
    result: 'Fun + fitness combined'
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-600 px-4 py-2 rounded-full font-semibold mb-4">
            <Star className="w-5 h-5 fill-current" />
            5000+ Success Stories
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Real People, Real Results
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands who have transformed their lives in just 21 days
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative"
            >
              <Quote className="absolute top-4 right-4 w-12 h-12 text-orange-200" />

              <div className="flex items-center gap-4 mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-orange-200"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed italic">
                "{testimonial.text}"
              </p>

              <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-lg p-3 border-l-4 border-orange-500">
                <div className="font-bold text-orange-700 text-sm">
                  Result: {testimonial.result}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="text-5xl font-bold text-orange-600 mb-2">5000+</div>
            <div className="text-gray-600 font-semibold">Active Members</div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="text-5xl font-bold text-green-600 mb-2">4.9/5</div>
            <div className="text-gray-600 font-semibold">Average Rating</div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="text-5xl font-bold text-blue-600 mb-2">98%</div>
            <div className="text-gray-600 font-semibold">Success Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
