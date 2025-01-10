
const TeamSection = () => {
  const team = [
        {
          name: "Ansul Rathi",
          role: "Zumba Instructor",
          specialties: ["Bollywood Dance", "HIIT", "Cardio Dance"],
          image: "/trainers/ansul.png",
          schedule: "Mon, Wed, Fri"
        },
        {
          name: "Sanskriti Sarda",
          role: "Yoga Master",
          specialties: ["Hatha Yoga", "Meditation", "Breathing"],
          image: "/trainers/sanskriti.png",
          schedule: "Tue, Thu, Sat"
        },
        {
          name: "Tusharika Maheshwari",
          role: "Body Weight Training Expert",
          specialties: ["Calisthenics", "Strength", "Mobility"],
          image: "/trainers/tusharika.png",
          schedule: "Mon, Wed, Fri"
        },
        {
          name: "Tejuna Soodhani",
          role: "Zumba Instructor",
          specialties: ["Zumba", "Latin Dance", "Hip Hop"],
          image: "/trainers/tejuna.png",
          schedule: "Tue, Thu, Sat"
        }
      ];

  return (
    <section id="trainers" className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">Meet Our Expert Trainers</h2>
        </div>

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {team.map((member, index) => (
            <div
              key={index}
              className="group relative bg-gray-800 rounded-xl overflow-hidden h-[500px]"
            >
              {/* Image Container */}
              <div className="h-full w-full">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Text Content with Slide-up Effect */}
              <div className="absolute inset-x-0 bottom-0 translate-y-[60px] group-hover:translate-y-0 transition-transform duration-300">
                <div className="bg-gradient-to-t from-black via-black/80 to-transparent p-6">
                  <h3 className="text-2xl font-bold text-orange-500 mb-2">{member.name}</h3>
                  <p className="text-white text-lg">{member.role}</p>

                     {/* Specialties */}
                     {/* <div className="flex flex-wrap gap-2">
                       {member.specialties.map((specialty, idx) => (
                         <span
                           key={idx}
                          className="px-3 py-1 bg-orange-500 bg-opacity-20 text-orange-500 rounded-full text-xs font-medium"
                         >
                           {specialty}
                         </span>
                       ))}
                     </div> */}
                     <p className="text-sm mt-4\">
                       <span className="text-orange-500">Schedule:</span>{' '}
                       <span className="text-gray-300">{member.schedule}</span>
                     </p>
                     {/* <div className="flex gap-4 pt-2">
                       <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                         <Instagram size={20} />
                       </a>
                       <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                         <Facebook size={20} />
                       </a>
                       <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                         <Twitter size={20} />
                       </a>
                     </div> */}
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;