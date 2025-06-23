/* eslint-disable react/no-unescaped-entities */
// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { ArrowRight, Home, Dumbbell } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-indigo-900 via-purple-900 to-violet-900 relative">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-bl-[100px] -z-10"></div>
      <div className="absolute -top-24 right-0 w-96 h-96 bg-gradient-to-br from-pink-500 to-orange-400 rounded-full filter blur-3xl opacity-20 -z-10"></div>
      <div className="absolute top-1/3 -left-24 w-80 h-80 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full filter blur-3xl opacity-20 -z-10"></div>
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full filter blur-3xl opacity-20 -z-10"></div>
      
      <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-4xl mx-auto relative z-10">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-8xl md:text-9xl font-bold leading-none">
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-transparent bg-clip-text">
                404
              </span>
            </h1>
          </div>
          
          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 text-transparent bg-clip-text">
              Workout
            </span>
            <span className="text-white"> Not Found</span>
          </h2>
          
          {/* Description */}
          <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto leading-relaxed">
            Looks like you've wandered off your fitness path! This page doesn't exist, 
            but your journey doesn't have to end here. Let's get you back on track.
          </p>
          
          {/* Animated Fitness Icon */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full shadow-2xl animate-pulse">
              <Dumbbell className="h-16 w-16 text-white" />
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link 
              to="/"
              className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Home className="mr-3 h-5 w-5 group-hover:animate-bounce" />
              Back to Home
            </Link>
            
            <Link 
              to="/programs"
              className="group inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold text-lg rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              Explore Programs
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {/* Motivational Quote */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-pink-400 opacity-60" fill="currentColor" viewBox="0 0 32 32">
                <path d="M10 8c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S15.5 8 10 8zm0 16c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6zm12-16c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S27.5 8 22 8zm0 16c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"></path>
              </svg>
            </div>
            <p className="text-lg text-gray-200 italic">
              "Remember, every fitness journey has detours. The important thing is to keep moving forward and never give up on your goals."
            </p>
          </div>
          
          {/* Popular Links */}
          <div className="mt-16">
            <h3 className="text-xl font-semibold text-white mb-6">Popular Pages</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/zumba" 
                className="px-4 py-2 bg-gradient-to-r from-pink-500/20 to-orange-500/20 backdrop-blur-sm text-pink-300 rounded-full border border-pink-500/30 hover:bg-pink-500/30 transition-all duration-300"
              >
                Zumba Classes
              </Link>
              <Link 
                to="/yoga" 
                className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm text-purple-300 rounded-full border border-purple-500/30 hover:bg-purple-500/30 transition-all duration-300"
              >
                Yoga Sessions
              </Link>
              <Link 
                to="/weight-training" 
                className="px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm text-emerald-300 rounded-full border border-emerald-500/30 hover:bg-emerald-500/30 transition-all duration-300"
              >
                Weight Training
              </Link>
              <Link 
                to="/enroll" 
                className="px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm text-yellow-300 rounded-full border border-yellow-500/30 hover:bg-yellow-500/30 transition-all duration-300"
              >
                Join UNIFITZ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;