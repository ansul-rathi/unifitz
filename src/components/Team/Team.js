import React from 'react';

const TeamSection = () => {
  const team = [
    {
      name: "Ansul Rathi",
      role: "Zumba Instructor",
      description: "2+ years of dance and fitness experience",
      image: "/trainers/ansul.png"
    },
    {
      name: "Sanskriti Sarda",
      role: "Yoga Master",
      description: "Certified yoga instructor with focus on mindfulness",
      image: "/trainers/sanskriti.png"
    },
    {
      name: "Tusharika Maheshwari",
      role: "Body Weight Training Expert",
      description: "Former athlete specializing in calisthenics",
      image: "/trainers/tusharika.png"
    },
    {
      name: "Tejuna Soodhani",
      role: "Zumba Instructor",
      description: "6+ years of dance and fitness experience",
      image: "/trainers/tejuna.png"
    }
  ];

  return (
    <section id="team" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-12 text-center text-white">Our Expert Team</h2>
        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-8">
          {team.map((member, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-lg shadow-lg bg-gray-800"
            >
              {/* Image */}
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-72 object-cover transition-transform group-hover:scale-105"
              />
              {/* Static Info */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4">
                <h3 className="text-lg font-bold text-orange-500">{member.name}</h3>
                <p className="text-white font-medium">{member.role}</p>
              </div>
              {/* Hover Info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end">
              <h3 className="text-lg font-bold text-orange-500">{member.name}</h3>
              <p className="text-white font-medium">{member.role}</p>
                <p className="text-gray-300 text-sm">{member.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
