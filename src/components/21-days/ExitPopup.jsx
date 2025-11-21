/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import { X, Gift, Zap } from 'lucide-react';

const ExitPopup = ({ onClose }) => {
  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    onClose();
  };

  return (
    // <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fadeIn">
    //   <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl transform animate-slideUp relative flex flex-col">
    //     <button
    //       onClick={onClose}
    //       className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors duration-200 z-10"
    //     >
    //       <X className="w-6 h-6 text-gray-600" />
    //     </button>

    //     <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-6 md:p-8 rounded-t-3xl text-center flex-shrink-0">
    //       {/* <Gift className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 animate-bounce" /> */}
    //       <h2 className="text-2xl md:text-4xl font-bold mb-2">
    //         Wait! Don't Miss This!
    //       </h2>
    //       <p className="text-lg md:text-xl">
    //         Special Exit Offer Just for You
    //       </p>
    //     </div>

    //     <div className="p-6 md:p-8 overflow-y-auto flex-1">
    //       <div className="text-center mb-4 md:mb-6">
    //         <div className="inline-block bg-yellow-400 text-black px-4 md:px-6 py-2 md:py-3 rounded-full font-bold text-base md:text-lg mb-3 md:mb-4 animate-pulse">
    //           🔥 EXCLUSIVE BONUS UNLOCKED
    //         </div>
    //         <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
    //           Get FREE Premium Meal Plans Worth ₹499!
    //         </h3>
    //         <p className="text-gray-600 text-base md:text-lg leading-relaxed">
    //           Join now and receive our premium 21-day nutrition guide absolutely FREE. This exclusive meal plan is designed by certified nutritionists to complement your fitness journey.
    //         </p>
    //       </div>

    //       <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl p-4 md:p-6 mb-4 md:mb-6 border-2 border-orange-200">
    //         <h4 className="font-bold text-gray-900 mb-3">This Bonus Includes:</h4>
    //         <ul className="space-y-2 text-gray-700 text-sm md:text-base">
    //           <li className="flex items-center gap-2">
    //             <Zap className="w-4 h-4 md:w-5 md:h-5 text-orange-500 flex-shrink-0" />
    //             21 Days of Complete Meal Plans
    //           </li>
    //           <li className="flex items-center gap-2">
    //             <Zap className="w-4 h-4 md:w-5 md:h-5 text-orange-500 flex-shrink-0" />
    //             Vegetarian & Non-Vegetarian Options
    //           </li>
    //           <li className="flex items-center gap-2">
    //             <Zap className="w-4 h-4 md:w-5 md:h-5 text-orange-500 flex-shrink-0" />
    //             Easy-to-Follow Recipes
    //           </li>
    //           <li className="flex items-center gap-2">
    //             <Zap className="w-4 h-4 md:w-5 md:h-5 text-orange-500 flex-shrink-0" />
    //             Shopping Lists & Prep Guides
    //           </li>
    //         </ul>
    //       </div>

    //       <div className="text-center mb-4 md:mb-6">
    //         <div className="text-gray-500 line-through text-lg md:text-xl mb-1">
    //           Regular Price: ₹999 + ₹499 Bonus
    //         </div>
    //         <div className="text-3xl md:text-4xl font-bold text-orange-600">
    //           Today Only: ₹21 (1 AED for UAE)
    //         </div>
    //         <div className="text-green-600 font-semibold mt-2">
    //           Save ₹1,477 - That's 98% OFF!
    //         </div>
    //       </div>

    //       <button
    //         onClick={scrollToPricing}
    //         className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold text-lg md:text-xl py-4 md:py-5 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-200 mb-3 md:mb-4"
    //       >
    //         Claim Your Bonus & Join Now
    //       </button>

    //       <p className="text-center text-xs md:text-sm text-gray-500">
    //         This bonus is only available through this popup. Once you close it, the offer expires!
    //       </p>
    //     </div>
    //   </div>
    // </div>
    <></>
  );
};

export default ExitPopup;