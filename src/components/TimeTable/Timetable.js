import React, { useState } from 'react';

const classTypes = {
  yoga: {
    name: 'Yoga',
    subtitle: 'Relaxation & Flexibility',
    bgColor: 'bg-blue-100',
  },
  zumba: {
    name: 'Zumba',
    subtitle: 'Dance & Cardio',
    bgColor: 'bg-red-100',
  },
  weightTraining: {
    name: 'Weight Training',
    subtitle: 'Strength & Conditioning',
    bgColor: 'bg-yellow-100',
  },
};

const ClassBlock = ({ type, time, instructor }) => (
  <div className={`p-4 ${type.bgColor} rounded-lg shadow-md`}>
    <div className="font-semibold text-lg text-gray-800">{type.name}</div>
    <div className="text-sm text-gray-700 italic">{type.subtitle}</div>
    <div className="text-sm mt-2 font-medium text-gray-900">{time}</div>
    <div className="text-sm text-gray-700">{instructor}</div>
  </div>
);

const YogaTimetable = () => {
  const [filter, setFilter] = useState('All Events');

  const schedules = {
    yoga: [
      { day: 'Monday', time: '09:00 - 10:00', instructor: 'Lily Carter' },
      { day: 'Wednesday', time: '10:00 - 11:00', instructor: 'Sophia Keat' },
      { day: 'Friday', time: '12:00 - 13:00', instructor: 'Mary Sheldon' },
    ],
    zumba: [
      { day: 'Tuesday', time: '09:00 - 10:00', instructor: 'Grace Dean' },
      { day: 'Thursday', time: '11:00 - 12:00', instructor: 'Daniel Brooks' },
      { day: 'Saturday', time: '10:00 - 11:00', instructor: 'Sophia Keat' },
    ],
    weightTraining: [
      { day: 'Monday', time: '11:00 - 12:00', instructor: 'Daniel Brooks' },
      { day: 'Wednesday', time: '12:00 - 13:00', instructor: 'Mary Sheldon' },
      { day: 'Friday', time: '09:00 - 10:00', instructor: 'Grace Dean' },
    ],
  };

  const allEvents = [
    ...schedules.yoga.map((event) => ({ ...event, type: classTypes.yoga })),
    ...schedules.zumba.map((event) => ({ ...event, type: classTypes.zumba })),
    ...schedules.weightTraining.map((event) => ({ ...event, type: classTypes.weightTraining })),
  ];

  const filteredEvents =
    filter === 'All Events'
      ? allEvents
      : allEvents.filter((event) => event.type.name === filter);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-4xl text-center mb-8 text-gray-800 font-extrabold">Classes Timetable</h1>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {['All Events', 'Yoga', 'Zumba', 'Weight Training'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 whitespace-nowrap rounded-lg font-medium text-sm transition-all focus:outline-none ${
              filter === tab
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Timetable Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Header */}
          <div className="grid grid-cols-8 gap-1 mb-1">
            <div className="p-4"></div>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <div key={day} className="p-4 text-center font-semibold bg-gray-300 rounded-lg text-gray-900">
                {day}
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {['09:00', '10:00', '11:00', '12:00'].map((time) => (
            <div className="grid grid-cols-8 gap-1 mb-2" key={time}>
              <div className="p-4 flex items-center font-medium text-gray-900">{time}</div>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                const event = filteredEvents.find(
                  (e) => e.day === day && e.time.startsWith(time)
                );
                return event ? (
                  <ClassBlock
                    key={`${day}-${time}`}
                    type={event.type}
                    time={event.time}
                    instructor={event.instructor}
                  />
                ) : (
                  <div
                    key={`${day}-${time}`}
                    className="bg-gray-100 h-full flex items-center justify-center rounded-lg border border-gray-300"
                  ></div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YogaTimetable;
