import { ArrowRight, Users, Home, Wallet } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden pt-10">
      {/* Full Screen Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src="../../../logo/logo4.png"
          alt="Hero Background" 
          className="w-full h-full object-cover"
        />
        {/* Multiple Overlay Layers for Better Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full min-h-screen flex items-center pt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-black px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Online Family Fitness
                </span>
              </div>
              
              <div className="relative">
                <h1 className="text-6xl md:text-7xl font-bold leading-tight">
                  <span className="block bg-gradient-to-r from-gray-300 via-white to-gray-300 bg-clip-text text-transparent">
                    Where Strength
                  </span>
                  <span className="block bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                    Meets Style
                  </span>
                </h1>
              </div>
              
              <p className="text-xl text-gray-300 max-w-lg border-l-4 border-yellow-500 pl-4">
                Transform your fitness journey with your entire family at UNIFITZ. 
                Experience premium fitness training from the comfort of your home.
              </p>
              
              <button className="group flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-400 hover:to-yellow-500 text-black px-8 py-4 rounded-lg font-bold transition-all duration-300 shadow-lg hover:shadow-yellow-500/20">
                Start Your Journey
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              {/* Key Benefits */}
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                {/* Family Fitness */}
                <div className="bg-black/50 backdrop-blur-sm border border-yellow-500/20 rounded-lg p-6 hover:border-yellow-500/40 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="text-yellow-500" size={24} />
                    <h3 className="text-yellow-500 font-bold">Family Fitness</h3>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Train together, grow together. Perfect for all age groups.
                  </p>
                </div>

                {/* Your Space */}
                <div className="bg-black/50 backdrop-blur-sm border border-yellow-500/20 rounded-lg p-6 hover:border-yellow-500/40 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <Home className="text-yellow-500" size={24} />
                    <h3 className="text-yellow-500 font-bold">Your Space</h3>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Train comfortably without feeling judged. Your home, your rules.
                  </p>
                </div>

                {/* Smart Savings */}
                <div className="bg-black/50 backdrop-blur-sm border border-yellow-500/20 rounded-lg p-6 hover:border-yellow-500/40 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <Wallet className="text-yellow-500" size={24} />
                    <h3 className="text-yellow-500 font-bold">Smart Savings</h3>
                  </div>
                  <p className="text-gray-300 text-sm">
                    One subscription for the whole family. No hidden costs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;