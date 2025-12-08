/* eslint-disable import/no-unused-modules */
import { Trophy, Award, Medal, Users, Calendar,  Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AttendancePage() {
  const attendanceData = [
    { name: "Preeti bang", total: 17 },
    // { name: "UniFitz (Host)", total: 16 },
    { name: "julie", total: 15 },
    { name: "667175", total: 15 },
    { name: "Nidhi", total: 14 },
    { name: "Nitya", total: 14 },
    { name: "Shilpa Jain", total: 14 },
    { name: "Niharika", total: 12 },
    { name: "Harshita Makhija", total: 12 },
    { name: "Kusum Solanki", total: 12 },
    { name: "aneeta", total: 11 },
    { name: "Pooja", total: 11 },
    { name: "NEHA JAIN", total: 11 },
    { name: "Priyanka parmar", total: 11 },
    { name: "priyanka bafna", total: 9 },
    { name: "Jahnvi sangatramani", total: 8 },
    { name: "Rashi", total: 7 },
    { name: "Sapna Jain", total: 7 },
    { name: "Sakshi Rahul Munoyat", total: 6 },
    { name: "carmen", total: 6 },
    { name: "SONAL's iPad", total: 6 },
    // { name: "UniFitz Support ( UniFitz ) (Host)", total: 6 },
    { name: "Vidhi", total: 6 },
    { name: "Minal", total: 5 },
    { name: "Lizy's iPhone", total: 5 },
    { name: "Ranjanajhade ( Rudraa )", total: 5 },
    { name: "naina", total: 5 },
    { name: "yashika", total: 5 },
    { name: "Mag", total: 4 },
    { name: "neha tomar ( Dhyana Tomar🐹 )", total: 8 },
    { name: "Bhavana 1", total: 4 },
    { name: "Preeti Jain", total: 4 },
    // { name: "Meena Spangrud", total: 4 },
    { name: "Ankita", total: 4 },
    { name: "sapna", total: 4 },
    { name: "kanad - Nirmla", total: 4 },
    { name: "Mital", total: 4 },
    { name: "Jivraj", total: 4 },
    { name: "Juhi jain", total: 4 },
    { name: "kusum Malpani", total: 4 },
    { name: "zainab abbas", total: 3 },
    { name: "Shweta Vagrecha", total: 3 },
    { name: "pitchu", total: 3 },
    // { name: "Mehak sagatramani", total: 3 },
    { name: "Shillpa", total: 3 },
    // { name: "COACH RATHI", total: 2 },
    { name: "Reena", total: 2 },
    { name: "pooja bhandare", total: 2 },
    { name: "Sammed Patil", total: 2 },
    { name: "Rudraa", total: 2 },
    { name: "Puja", total: 2 },
    { name: "srp sketchup", total: 2 },
    { name: "Asha", total: 2 },
    { name: "Fazna Haris", total: 2 },
    { name: "Jaishree", total: 2 },
    { name: "chetana", total: 2 },
    { name: "Suma Manjunath Sabale", total: 2 },
    { name: "Aachal Kakani", total: 2 },
    { name: "Monica", total: 2 },
    { name: "Krishna Rathi", total: 2 },
    { name: "Ritu Jain", total: 2 },
    { name: "Komal jain", total: 2 },
    { name: "Rachana", total: 2 },
    { name: "rukaiya", total: 2 },
    { name: "Sangeeta", total: 2 },
    { name: "padma", total: 2 },
    { name: "Sneha Rathi", total: 2 },
    { name: "Madhuri", total: 2 },
    { name: "geetha lakshmi", total: 2 },
    { name: "Noor Imran K", total: 2 },
    { name: "shilpa", total: 1 },
    { name: "Jitin Rathi", total: 1 },
    { name: "Rachna", total: 1 },
    { name: "Admin", total: 1 },
    { name: "iPhone (142)", total: 1 },
    { name: "josep", total: 1 },
    { name: "Meenakshi", total: 1 },
    { name: "iPhone (4)", total: 1 },
    { name: "Lavina's iPhone", total: 1 },
    // { name: "Ansul Rathi ( COACH RATHI )", total: 1 },
    { name: "pavan ostwal", total: 1 },
    { name: "Asha Krishnamurthy", total: 1 },
    { name: "neha sangtani", total: 1 },
    { name: "Sunita's iPhone", total: 1 },
    { name: "leela", total: 1 },
    { name: "kanchan Mala Modani", total: 1 },
    { name: "Subashini Perumal", total: 1 },
    { name: "Fauzia Fareed Fareed", total: 1 },
    { name: "Pallavi", total: 1 },
    { name: "Shilpa Jain ( Niharika )", total: 1 },
    { name: "neha", total: 1 },
    { name: "Palak", total: 1 },
    { name: "Jaishree Rathi", total: 1 },
    { name: "Savita", total: 1 },
    { name: "RS", total: 1 },
    { name: "Kavita Sarda", total: 1 },
    { name: "Pitchu Bahrain", total: 1 },
    { name: "Priyanka Sharma", total: 1 },
    { name: "harshita rathi", total: 1 },
    { name: "Deepti Rashid", total: 1 },
    { name: "sneha", total: 1 },
    { name: "Bhavyansh", total: 1 },
    { name: "Krishnaji", total: 1 },
    { name: "Rama Rathi", total: 1 },
    { name: "Leem's iPhone (2)", total: 1 },
    // { name: "meena", total: 1 },
    // { name: "khyati", total: 1 },
    { name: "Ganwani", total: 1 },
    { name: "ankita Chandel", total: 1 },
    { name: "Priyanka dubey", total: 1 },
    { name: "Bhavani Guttina", total: 1 },
    { name: "Minal oswal", total: 1 },
    { name: "Bhavana Jain", total: 1 },
    { name: "ragini", total: 1 },
    { name: "Afra", total: 1 },
    { name: "Naina", total: 1 },
    { name: "mehak", total: 1 },
    { name: "Diya", total: 1 },
    { name: "iPhone9SeBFF", total: 1 }
  ];

  const totalClasses = 18; // From 21 Nov to 8 Dec
  const totalParticipants = attendanceData.length;

  // Calculate percentage and sort
  const processedData = attendanceData.map(participant => ({
    ...participant,
    percentage: ((participant.total / totalClasses) * 100).toFixed(1)
  })).sort((a, b) => b.total - a.total);

  const topPerformers = processedData.slice(0, 3);

  const getTrophyIcon = (index) => {
    if (index === 0) return <Trophy className="w-16 h-16 sm:w-20 sm:h-20 animate-bounce" />;
    if (index === 1) return <Award className="w-14 h-14 sm:w-16 sm:h-16" />;
    return <Medal className="w-14 h-14 sm:w-16 sm:h-16" />;
  };

  const getCardStyle = (index) => {
    if (index === 0) return {
      gradient: "from-yellow-300 via-yellow-400 to-orange-400",
      shadow: "shadow-yellow-500/50",
      border: "border-yellow-400",
      text: "text-yellow-600"
    };
    if (index === 1) return {
      gradient: "from-gray-200 via-gray-300 to-gray-400",
      shadow: "shadow-gray-400/50",
      border: "border-gray-400",
      text: "text-gray-600"
    };
    return {
      gradient: "from-orange-300 via-orange-400 to-amber-500",
      shadow: "shadow-orange-500/50",
      border: "border-orange-400",
      text: "text-orange-600"
    };
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return "bg-gradient-to-r from-green-500 to-emerald-600";
    if (percentage >= 75) return "bg-gradient-to-r from-blue-500 to-indigo-600";
    if (percentage >= 60) return "bg-gradient-to-r from-yellow-500 to-orange-500";
    return "bg-gradient-to-r from-red-500 to-rose-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-3 flex items-center justify-center gap-3 drop-shadow-2xl">
            <Users className="w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16" />
            Attendance Dashboard
          </h1>
          <p className="text-white/90 text-base sm:text-lg lg:text-xl font-medium">
            Track & Celebrate Excellence • {totalParticipants} Participants
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-semibold text-sm">
              📅 18 Classes
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-semibold text-sm">
              ⏰ Nov 21 - Dec 8
            </div>
          </div>
        </motion.div>

        {/* Top 3 Performers - SUPER CATCHY */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-12 lg:mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white flex items-center justify-center gap-3 mb-2">
              <Star className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-300 animate-pulse" />
              🏆 TOP PERFORMERS 🏆
              <Star className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-300 animate-pulse" />
            </h2>
            <p className="text-white/80 text-lg sm:text-xl font-semibold">Champions of Consistency</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {topPerformers.map((performer, index) => {
              const style = getCardStyle(index);
              return (
                <motion.div
                  key={index}
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.2 }}
                  whileHover={{ scale: 1.05, rotate: index === 0 ? 2 : 0 }}
                  className={`relative bg-white rounded-3xl p-6 sm:p-8 shadow-2xl ${style.shadow} border-4 ${style.border} ${
                    index === 0 ? 'md:scale-110 md:-translate-y-4' : ''
                  }`}
                >
                  {/* Rank Badge */}
                  <div className={`absolute -top-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${style.gradient} rounded-full flex items-center justify-center shadow-xl border-4 border-white`}>
                    <span className="text-2xl sm:text-3xl font-black text-white">#{index + 1}</span>
                  </div>

                  {/* Trophy Icon */}
                  <div className={`flex justify-center mb-4 ${style.text}`}>
                    {getTrophyIcon(index)}
                  </div>
                  
                  {/* Name */}
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-800 mb-4 text-center line-clamp-2 min-h-[3.5rem]">
                    {performer.name}
                  </h3>
                  
                  {/* Stats Container */}
                  <div className="space-y-3">
                    {/* Attendance Count */}
                    <div className={`bg-gradient-to-r ${style.gradient} text-white px-4 py-3 rounded-2xl text-center transform transition-transform hover:scale-105`}>
                      <div className="text-4xl sm:text-5xl font-black mb-1">
                        {performer.total}
                      </div>
                      <div className="text-xs sm:text-sm font-bold opacity-90">
                        Classes Attended
                      </div>
                    </div>
                    
                    {/* Percentage Badge */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full font-black text-xl sm:text-2xl text-center shadow-lg">
                      {performer.percentage}%
                    </div>
                    
                    {/* Out of Total */}
                    <p className="text-gray-600 text-sm font-semibold text-center">
                      Out of {totalClasses} classes
                    </p>
                  </div>

                  {/* Decorative Stars */}
                  {index === 0 && (
                    <>
                      <div className="absolute top-2 left-2 text-yellow-400 text-2xl animate-pulse">⭐</div>
                      <div className="absolute top-2 right-20 text-yellow-400 text-xl animate-pulse delay-100">✨</div>
                      <div className="absolute bottom-2 left-2 text-yellow-400 text-xl animate-pulse delay-200">💫</div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* All Participants Table */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800">
              Complete Leaderboard
            </h2>
          </div>
          
          <div className="overflow-x-auto rounded-2xl">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white">
                  <th className="px-3 sm:px-4 py-3 sm:py-4 text-left rounded-tl-2xl text-sm sm:text-base font-bold">Rank</th>
                  <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-sm sm:text-base font-bold">Name</th>
                  <th className="px-3 sm:px-4 py-3 sm:py-4 text-center text-sm sm:text-base font-bold">Attended</th>
                  <th className="px-3 sm:px-4 py-3 sm:py-4 text-center text-sm sm:text-base font-bold">Total</th>
                  <th className="px-3 sm:px-4 py-3 sm:py-4 text-center rounded-tr-2xl text-sm sm:text-base font-bold">%</th>
                </tr>
              </thead>
              <tbody>
                {processedData.map((participant, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.02 }}
                    className={`border-b hover:bg-purple-50 transition-all ${
                      index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 font-semibold' : ''
                    }`}
                  >
                    <td className="px-3 sm:px-4 py-3 text-sm sm:text-base">
                      <span className={`font-black ${index < 3 ? 'text-lg sm:text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent' : 'text-purple-600'}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 font-semibold text-gray-800 text-sm sm:text-base">
                      {participant.name}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-center">
                      <span className="text-green-600 font-bold text-base sm:text-lg">
                        {participant.total}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-center text-gray-600 font-semibold text-sm sm:text-base">
                      {totalClasses}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-center">
                      <span className={`${getPercentageColor(participant.percentage)} px-3 py-1 rounded-full font-black text-white text-sm sm:text-base shadow-lg`}>
                        {participant.percentage}%
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Stats Footer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-black text-purple-600">{totalParticipants}</div>
              <div className="text-xs sm:text-sm text-gray-600 font-semibold">Total Participants</div>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-black text-green-600">{totalClasses}</div>
              <div className="text-xs sm:text-sm text-gray-600 font-semibold">Total Classes</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-black text-orange-600">{topPerformers[0].percentage}%</div>
              <div className="text-xs sm:text-sm text-gray-600 font-semibold">Highest %</div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-black text-blue-600">
                {processedData.filter(p => parseFloat(p.percentage) >= 75).length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-semibold">Above 75%</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}