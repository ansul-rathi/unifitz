// src/components/Programs/Programs.js
import React from 'react';
import { ChevronRight } from 'lucide-react';

const Programs = () => {
  const programs = [
    {
      title: "Zumba",
      description: "High-energy dance workouts that feel like a party. Burn calories while having fun!",
      image: "/program/zumba.png"
    },
    {
      title: "Yoga",
      description: "Find balance, flexibility, and inner peace through our yoga sessions.",
      image: "/program/yoga.png"
    },
    {
      title: "Bodyweight Training",
      description: "Build strength and endurance using just your bodyweight. No equipment needed!",
      image: "/program/weight.png"
    }
  ];

  return (
    <section id="programs" className="py-20 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-extrabold mb-12 text-center">Our Programs</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {programs.map((program, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded-lg overflow-hidden shadow-lg transform transition-transform hover:scale-105"
            >
              <img
                src={program.image}
                alt={program.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-3 text-orange-400">{program.title}</h3>
                <p className="text-gray-300 leading-relaxed">{program.description}</p>
                <button
                  className="mt-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white py-2 px-4 rounded-lg flex items-center hover:from-orange-400 hover:to-pink-400 transition-all"
                >
                  Learn More <ChevronRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Programs;
