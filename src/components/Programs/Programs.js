import { Brain, Dumbbell, Zap, Waves, Target, Star, Trophy } from 'lucide-react';

const JourneyItem = ({ title, description, bulletPoints, position, icon: Icon, step }) => (
  <div className={`relative flex flex-col lg:flex-row items-start lg:items-center gap-8 group`}>
    {/* Large Watermark Number */}
    <div className={`absolute -right-4 lg:${position === 'right' ? '-right-0' : '-left-0'} top-0 lg:top-1/2 lg:-translate-y-1/2 
      text-[120px] lg:text-[200px] font-bold text-yellow-500/10 select-none z-0 opacity-50 lg:opacity-100`}>
      {step}
    </div>

    {/* Content Box */}
    <div className={`w-full lg:w-1/2 relative z-10 ${position === 'left' ? 'lg:ml-auto' : ''}`}>
      <div className="relative">
        {/* Curved Connector - Hidden on Mobile */}
        <div className="hidden lg:block absolute top-1/2 -translate-y-1/2
          w-8 h-16 border-2 border-yellow-500/30 
          right-0 border-l-0 rounded-r-full">
        </div>
        
        {/* Content Box */}
        <div className="relative group">
          {/* Glowing Background Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-lg blur-lg group-hover:opacity-75 transition duration-500"></div>
          
          {/* Main Content */}
          <div className="relative bg-black/80 backdrop-blur-xl rounded-lg p-6 lg:p-8 border border-yellow-500/20 
            transform transition-all duration-500 hover:border-yellow-500/40 group-hover:translate-y-[-5px]">
            
            {/* Header with Icon */}
            <div className="flex items-center gap-4 lg:gap-6 mb-6">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-yellow-500/20 rounded-xl blur-lg"></div>
                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl bg-gradient-to-br from-black to-gray-900 border border-yellow-500 
                  flex items-center justify-center relative shadow-lg">
                  <Icon className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-500" />
                </div>
              </div>
              <div>
                <div className="text-yellow-500 text-sm font-semibold mb-1">Step {step}</div>
                <h3 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                  {title}
                </h3>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed text-base lg:text-lg mb-6 border-l-2 border-yellow-500/30 pl-4">
              {description}
            </p>

            <div className="space-y-3">
              {bulletPoints.map((point, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0 mt-2"></div>
                  <span className="text-sm lg:text-base">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const JourneyPath = () => {
  const journeyItems = [
    {
      step: "01",
      title: "Foundation Building",
      description: "Begin your transformation with a solid foundation that sets you up for long-term success.",
      icon: Brain,
      position: 'right',
      bulletPoints: [
        "Complete fitness assessment and goal setting",
        "Learn proper form and technique basics",
        "Establish baseline measurements",
        "Create a personalized nutrition plan",
        "Set realistic milestones"
      ]
    },
    {
      step: "02",
      title: "Mindset Mastery",
      description: "Develop the mental strength and habits that will drive your fitness journey forward.",
      icon: Target,
      position: 'left',
      bulletPoints: [
        "Build sustainable daily routines",
        "Practice positive self-talk and visualization",
        "Learn stress management techniques",
        "Develop growth mindset strategies",
        "Create accountability systems"
      ]
    },
    {
      step: "03",
      title: "Physical Excellence",
      description: "Transform your body through progressive strength training and mobility work.",
      icon: Dumbbell,
      position: 'right',
      bulletPoints: [
        "Master fundamental movement patterns",
        "Build functional strength progressively",
        "Enhance flexibility and mobility",
        "Improve posture and alignment",
        "Develop core stability"
      ]
    },
    {
      step: "04",
      title: "Energy Optimization",
      description: "Maximize your vitality and maintain high energy levels throughout the day.",
      icon: Zap,
      position: 'left',
      bulletPoints: [
        "Optimize sleep patterns and recovery",
        "Fine-tune nutrition timing",
        "Enhance cardiovascular endurance",
        "Balance work and rest periods",
        "Implement energy management strategies"
      ]
    },
    {
      step: "05",
      title: "Complete Integration",
      description: "Bring together all elements of your transformation into a harmonious lifestyle.",
      icon: Waves,
      position: 'right',
      bulletPoints: [
        "Balance strength and flexibility",
        "Maintain consistent energy levels",
        "Practice mindful movement",
        "Achieve performance goals",
        "Inspire others on their journey"
      ]
    }
  ];

  return (
    <section className="bg-black py-12 lg:py-20 min-h-screen relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_#222_1px,_transparent_1px)] bg-[size:20px_20px] opacity-20" />

      {/* Content Container */}
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12 lg:mb-20">
          <div className="flex justify-center gap-2 mb-4">
            <Star className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-500" />
            <Trophy className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-500" />
            <Star className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-500" />
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
              Your Transformation Journey
            </span>
          </h2>
          <p className="text-gray-400 text-base lg:text-lg max-w-2xl mx-auto px-4">
            Follow our proven path to becoming your strongest, most energetic self.
            Each step brings you closer to your ultimate fitness goals.
          </p>
        </div>

        {/* Journey Path Content */}
        <div className="relative">
          {/* Center Line - Hidden on Mobile */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-yellow-500/20 via-yellow-500 to-yellow-500/20 transform -translate-x-1/2"></div>

          {/* Journey Items */}
          <div className="space-y-16 lg:space-y-32 relative">
            {journeyItems.map((item, index) => (
              <JourneyItem
                key={index}
                {...item}
              />
            ))}
            
            {/* Final Result */}
            <div className="text-center relative pt-8 lg:pt-16">
              <div className="relative inline-block group">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg blur-lg opacity-75 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-lg p-6 lg:p-8">
                  <h3 className="text-2xl lg:text-3xl font-bold text-black mb-2">
                    Your Best Self Awaits
                  </h3>
                  <p className="text-black/80 text-sm lg:text-base">
                    Emerge stronger, more flexible, and filled with unstoppable energy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JourneyPath;

// // src/components/Programs/Programs.js
// import { ChevronRight } from 'lucide-react';

// const Programs = () => {
//   const programs = [
//     {
//       title: "Zumba",
//       description: "High-energy dance workouts that feel like a party. Burn calories while having fun!",
//       image: "/program/zumba.png"
//     },
//     {
//       title: "Yoga",
//       description: "Find balance, flexibility, and inner peace through our yoga sessions.",
//       image: "/program/yoga.png"
//     },
//     {
//       title: "Bodyweight Training",
//       description: "Build strength and endurance using just your bodyweight. No equipment needed!",
//       image: "/program/weight.png"
//     }
//   ];

//   return (
//     <section id="programs" className="py-20 bg-black text-white">
//       <div className="container mx-auto px-4">
//         <h2 className="text-5xl font-extrabold mb-12 text-center">Our Programs</h2>
//         <div className="grid md:grid-cols-3 gap-8">
//           {programs.map((program, index) => (
//             <div
//               key={index}
//               className="bg-gray-900 rounded-lg overflow-hidden shadow-lg transform transition-transform hover:scale-105"
//             >
//               <img
//                 src={program.image}
//                 alt={program.title}
//                 className="w-full h-48 object-cover"
//               />
//               <div className="p-6">
//                 <h3 className="text-2xl font-bold mb-3 text-orange-400">{program.title}</h3>
//                 <p className="text-gray-300 leading-relaxed">{program.description}</p>
//                 <button
//                   className="mt-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white py-2 px-4 rounded-lg flex items-center hover:from-orange-400 hover:to-pink-400 transition-all"
//                 >
//                   Learn More <ChevronRight className="ml-2 w-5 h-5" />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Programs;
