/* eslint-disable no-unused-vars */
import { Timer, Users, Award, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

const Hero = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center space-y-8">
          <div className="inline-block bg-yellow-400 text-black px-6 py-2 rounded-full font-bold text-sm mb-4 animate-pulse">
            🔥 LIMITED SPOTS AVAILABLE - Only 50 Left!
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
            21 Days Fitness Challenge
            <span className="block text-yellow-300 mt-2">Habit Building Session</span>
          </h1>

          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-medium">
            Transform Your Body, Mind & Life in Just 21 Days with International Expert Trainers
          </p>

          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg">
              <Users className="w-6 h-6" />
              <div className="text-left">
                <div className="font-bold text-lg">250+</div>
                <div className="text-sm opacity-90">Active Members</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg">
              <Award className="w-6 h-6" />
              <div className="text-left">
                <div className="font-bold text-lg">4 Expert</div>
                <div className="text-sm opacity-90">Trainers</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg">
              <Zap className="w-6 h-6" />
              <div className="text-left">
                <div className="font-bold text-lg">21 Days</div>
                <div className="text-sm opacity-90">Life Changing</div>
              </div>
            </div>
          </div>

          {/* <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-2xl mx-auto mt-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Timer className="w-6 h-6 text-yellow-300" />
              <h3 className="text-xl font-bold">Special Offer Ends In:</h3>
            </div>
            <div className="flex justify-center gap-4">
              <div className="bg-black/30 rounded-lg p-4 min-w-[80px]">
                <div className="text-4xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
                <div className="text-sm opacity-80">Hours</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4 min-w-[80px]">
                <div className="text-4xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div className="text-sm opacity-80">Minutes</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4 min-w-[80px]">
                <div className="text-4xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
                <div className="text-sm opacity-80">Seconds</div>
              </div>
            </div>
          </div> */}

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <button
              onClick={scrollToPricing}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg px-10 py-5 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              Join Now for Just ₹21
            </button>
            <a
              href="https://wa.me/918107505074?text=I'm%20interested%20in%20the%2021%20Days%20Fitness%20Challenge"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white font-bold text-lg px-10 py-5 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp Us
            </a>
          </div>

          {/* <div className="mt-8 text-sm opacity-90">
            ✓ 100% Money-Back Guarantee ✓ Secure Payment ✓ Instant Access
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Hero;
