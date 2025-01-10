// import { useState } from 'react';
// import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

// const FitnessSchedule = () => {
//   const today = new Date();
//   const [currentMonth, setCurrentMonth] = useState(
//     new Date(today.getFullYear(), today.getMonth(), 1)
//   );

//   const workouts = {
//     dance: {
//       color: 'bg-purple-500',
//       classes: ['Bollywood Dhamaka', 'Punjabi Tadka', 'South India Special', 'ZUMBA Party', 'Folk Fusion'],
//       image: '/api/placeholder/400/320'
//     },
//     yoga: {
//       color: 'bg-green-500',
//       classes: ['Morning Flow', 'Power Yoga', 'Gentle Restore', 'Meditation Flow', 'Ashtanga Practice'],
//       image: '/api/placeholder/400/320'
//     },
//     strength: {
//       color: 'bg-orange-500',
//       classes: ['Bottle Workout', 'Bodyweight Power', 'Chair Fitness', 'Towel Training', 'Resistance Band'],
//       image: '/api/placeholder/400/320'
//     }
//   };

//   const weeklySchedule = {
//     0: { type: null, name: 'Holiday', description: 'Rest Day' },
//     1: { type: 'dance', name: workouts.dance.classes[0], description: 'Dance Fitness', color: workouts.dance.color },
//     2: { type: 'yoga', name: workouts.yoga.classes[0], description: 'Yoga Session', color: workouts.yoga.color },
//     3: { type: 'strength', name: workouts.strength.classes[0], description: 'Weight Training', color: workouts.strength.color },
//     4: { type: 'dance', name: workouts.dance.classes[1], description: 'Dance Fitness', color: workouts.dance.color },
//     5: { type: 'yoga', name: workouts.yoga.classes[1], description: 'Yoga Session', color: workouts.yoga.color },
//     6: { type: 'strength', name: workouts.strength.classes[1], description: 'Weight Training', color: workouts.strength.color }
//   };

//   const getClassForDate = (day) => {
//     const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
//     const weekInMonth = Math.floor((day - 1) / 7);
//     const baseSchedule = weeklySchedule[date.getDay()];
    
//     if (!baseSchedule?.type) return baseSchedule;

//     const workoutType = baseSchedule.type;
//     const classIndex = (weekInMonth % workouts[workoutType].classes.length);
    
//     return {
//       ...baseSchedule,
//       name: workouts[workoutType].classes[classIndex]
//     };
//   };

//   const getDaysInMonth = (date) => {
//     return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
//   };

//   const getFirstDayOfMonth = (date) => {
//     return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
//   };

//   const isDateDisabled = (day) => {
//     const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
//     return date < today;
//   };

//   const getMonthYear = (date) => {
//     return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
//   };

//   const changeMonth = (offset) => {
//     setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
//   };

//   return (
//     <div className="w-full p-6 bg-gray-900">
//       <div className="bg-gray-800 rounded-lg p-6">
//         <div className="mb-6 bg-gray-700 p-4 rounded-lg flex items-center justify-center gap-2">
//           <Clock className="text-orange-500" />
//           <span className="text-white font-semibold">Morning Session: 7:00 AM - 8:00 AM</span>
//           <span className="text-gray-400">(Sunday Holiday)</span>
//         </div>

//         <div className="flex justify-between items-center mb-6">
//           <button 
//             onClick={() => changeMonth(-1)}
//             className="p-2 hover:bg-gray-700 rounded-full"
//           >
//             <ChevronLeft className="text-orange-500" />
//           </button>
//           <h2 className="text-2xl font-bold text-white">{getMonthYear(currentMonth)}</h2>
//           <button 
//             onClick={() => changeMonth(1)}
//             className="p-2 hover:bg-gray-700 rounded-full"
//           >
//             <ChevronRight className="text-orange-500" />
//           </button>
//         </div>

//         <div className="grid grid-cols-7 gap-2 mb-4">
//           {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
//             <div key={day} className="text-center text-gray-400 font-medium p-2">
//               {day}
//             </div>
//           ))}
//         </div>

//         <div className="grid grid-cols-7 gap-2">
//           {Array(getFirstDayOfMonth(currentMonth)).fill(null).map((_, idx) => (
//             <div key={`empty-${idx}`} className="h-28" />
//           ))}
          
//           {Array(getDaysInMonth(currentMonth)).fill(null).map((_, idx) => {
//             const day = idx + 1;
//             const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
//             const disabled = isDateDisabled(day);
//             const classInfo = getClassForDate(day);
//             const isSunday = date.getDay() === 0;
            
//             return (
//               <div
//                 key={day}
//                 className={`h-28 rounded-lg p-2 flex flex-col relative overflow-hidden ${
//                   isSunday 
//                     ? 'bg-gray-700'
//                     : disabled
//                       ? `${classInfo.color} opacity-40`
//                       : classInfo.color
//                 } transition-all`}
//               >
//                 {!isSunday && (
//                   <img 
//                     src={workouts[classInfo.type]?.image} 
//                     alt="" 
//                     className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
//                   />
//                 )}
//               >
//                 <span className={`text-sm font-medium ${disabled || isSunday ? 'text-gray-500' : 'text-white'}`}>
//                   {day}
//                 </span>
//                 {!disabled && (
//                   <>
//                     <span className="text-sm mt-1 font-medium text-white truncate">
//                       {classInfo.name}
//                     </span>
//                     <span className="text-xs text-gray-100 truncate">
//                       {classInfo.description}
//                     </span>
//                   </>
//                 )}
//               </div>
//             );
//           })}
//         </div>

//         <div className="mt-6 flex flex-wrap gap-4">
//           <div className="flex items-center gap-2">
//             <div className={`w-3 h-3 rounded-full ${workouts.dance.color}`}></div>
//             <span className="text-sm text-gray-300">Dance Fitness</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className={`w-3 h-3 rounded-full ${workouts.yoga.color}`}></div>
//             <span className="text-sm text-gray-300">Yoga</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className={`w-3 h-3 rounded-full ${workouts.strength.color}`}></div>
//             <span className="text-sm text-gray-300">Weight Training</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FitnessSchedule;