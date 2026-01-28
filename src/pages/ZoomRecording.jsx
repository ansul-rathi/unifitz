import { Music, Heart, Users, Play, Flame } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function BollywoodDanceFitness() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  // Replace this with your actual Zoom shareable link
const zoomRecordingUrl = "https://us06web.zoom.us/rec/share/-2zaOwx6reliLVWW0mIeLDn_VhP4NYsXnJvjdMiePm2th_dN-3keT9zYlj7VM30.2PSNRuMSRWBecewH";

  const benefits = [
    { icon: Heart, title: "Cardio Blast", desc: "500+ calories per session" },
    { icon: Music, title: "Latest Hits", desc: "Bollywood chart-toppers" },
    { icon: Users, title: "Community", desc: "250+ active dancers" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="absolute top-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute top-1/4 right-0 w-72 h-72 md:w-[500px] md:h-[500px] bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute bottom-0 left-1/3 w-64 h-64 md:w-96 md:h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Hero Section */}
        <div className={`text-center space-y-6 md:space-y-8 mb-12 md:mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 md:gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-900 px-4 py-2 md:px-6 md:py-3 rounded-full font-black text-xs md:text-sm shadow-2xl">
            <Flame className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">MOST POPULAR DANCE FITNESS</span>
            <span className="sm:hidden">POPULAR CLASS</span>
            <Flame className="w-4 h-4 md:w-5 md:h-5" />
          </div>

          {/* Main Heading */}
          <div className="space-y-4 md:space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black leading-tight">
              <span className="block bg-gradient-to-r from-yellow-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-2xl">
                Bollywood
              </span>
              <span className="block text-3xl sm:text-4xl md:text-6xl lg:text-7xl bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mt-2 md:mt-4">
                Dance Fitness
              </span>
            </h1>
            
            <div className="inline-flex items-center gap-2 md:gap-3 bg-white/10 backdrop-blur-xl border-2 border-white/30 px-4 py-2 md:px-6 md:py-3 rounded-full shadow-xl">
              <Music className="w-4 h-4 md:w-6 md:h-6 text-yellow-300 animate-pulse" />
              <span className="text-sm md:text-xl font-bold">Dance Your Way to Fitness!</span>
              <Music className="w-4 h-4 md:w-6 md:h-6 text-yellow-300 animate-pulse" />
            </div>
          </div>

          {/* Tagline */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed font-medium text-purple-100 px-4">
            Transform your fitness with high-energy Bollywood dance routines. Burn calories while having fun!
          </p>
        </div>

        {/* Video Section */}
        <div className={`mb-12 md:mb-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-4xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-500 rounded-2xl md:rounded-3xl blur-xl md:blur-2xl opacity-75 group-hover:opacity-100 transition duration-1000 animate-pulse"></div>
              
              <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border-2 md:border-4 border-white/20">
                <div className="bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-600 px-4 py-3 md:px-6 md:py-4 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 md:gap-3">
                    <Play className="w-4 h-4 md:w-6 md:h-6 text-white" />
                    <h2 className="text-lg md:text-2xl font-black text-white">Sample Class</h2>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1 md:px-4 md:py-2 rounded-full">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                    <span className="text-xs md:text-sm font-bold">PREVIEW</span>
                  </div>
                </div>
                
                <div className="relative bg-black" style={{ paddingBottom: '56.25%', height: 0 }}>
                  <iframe
                    src={zoomRecordingUrl}
                    className="absolute top-0 left-0 w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    style={{ border: 'none' }}
                    title="Bollywood Dance Fitness Sample Class"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className={`mb-12 md:mb-16 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="relative bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl md:rounded-3xl p-6 md:p-8 hover:bg-white/20 transition-all duration-500 transform hover:scale-105 cursor-pointer"
              >
                <div className="absolute -top-4 md:-top-6 left-1/2 transform -translate-x-1/2">
                  <div className="p-3 md:p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl md:rounded-2xl shadow-xl">
                    <benefit.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                </div>
                
                <div className="mt-6 md:mt-8 text-center space-y-2 md:space-y-3">
                  <h3 className="text-xl md:text-2xl font-black text-white">{benefit.title}</h3>
                  <p className="text-sm md:text-base text-purple-100 font-medium">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className={`text-center space-y-6 md:space-y-8 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-600 rounded-2xl md:rounded-3xl p-8 md:p-12 shadow-2xl transform hover:scale-105 transition-all duration-500">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 md:mb-6">
              Ready to Dance?
            </h2>
            <p className="text-base md:text-xl text-white/90 mb-6 md:mb-10 max-w-2xl mx-auto font-semibold px-4">
              Join our vibrant community and start your fitness journey today!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center">
              <a
                href="https://wa.me/918107505074?text=I'm%20interested%20in%20Bollywood%20Dance%20Fitness%20classes"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-white text-purple-600 font-black text-base md:text-xl px-8 py-4 md:px-12 md:py-6 rounded-xl md:rounded-2xl shadow-2xl transform hover:scale-110 transition-all duration-300 overflow-hidden w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-indigo-100 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <span className="relative flex items-center justify-center gap-2 md:gap-3">
                  <svg className="w-5 h-5 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="text-sm md:text-base">Join via WhatsApp</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}