import { FC, useState, useEffect } from 'react';
import { Users, Award, Zap, Star, LucideIcon } from 'lucide-react';



interface StatItem {
  icon: LucideIcon;
  number: string;
  label: string;
  sub: string;
}

const Hero: FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Animation trigger
    const timeout = setTimeout(() => setIsVisible(true), 100);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const stats: StatItem[] = [
    { icon: Users, number: "250+", label: "Active Members", sub: "Transforming Lives" },
    { icon: Award, number: "4 Expert", label: "Trainers", sub: "International Certified" },
    { icon: Zap, number: "21 Days", label: "Life Changing", sub: "Proven Results" }
  ];

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-transparent"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute -bottom-8 left-20 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className={`text-center space-y-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* Improved Main Heading */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
              21 Days
              <span className="block text-4xl md:text-6xl lg:text-7xl text-yellow-300 mt-4 font-extrabold">
                Fitness Challenge
              </span>
            </h1>
            
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-lg font-semibold">Habit Building Masterclass</span>
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
            </div>
          </div>

          {/* Enhanced Subheading */}
          <p className="text-xl md:text-2xl lg:text-3xl max-w-4xl mx-auto leading-relaxed font-light bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Transform Your Body, Mind & Life in Just 21 Days with World-Class Expert Trainers
          </p>

          {/* Improved Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mt-12">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 group"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="font-bold text-2xl text-white">{stat.number}</div>
                  <div className="font-semibold text-white">{stat.label}</div>
                  <div className="text-sm text-gray-300">{stat.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mt-12">
            <a
              href="https://wa.me/918107505074?text=I'm%20interested%20in%20the%2021%20Days%20Fitness%20Challenge"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg px-12 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 group-hover:bg-white/0 transition-all duration-300"></div>
              <span className="relative flex items-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Us
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;