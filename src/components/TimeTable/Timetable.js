import { useState } from 'react';

const classTypes = {
  yoga: {
    name: 'Yoga',
    subtitle: 'Relaxation & Flexibility',
    bgColor: 'bg-blue-800',
  },
  zumba: {
    name: 'Zumba',
    subtitle: 'Dance & Cardio',
    bgColor: 'bg-red-800',
  },
  cardio: {
    name: 'Cardio',
    subtitle: 'Endurance & Fitness',
    bgColor: 'bg-green-800',
  },
  weightTraining: {
    name: 'Weight Training',
    subtitle: 'Strength & Conditioning',
    bgColor: 'bg-yellow-700',
  },
  meditation: {
    name: 'Meditation',
    subtitle: 'Calm & Mental Peace',
    bgColor: 'bg-purple-800',
  },
};

const ClassBlock = ({ type, time, instructor }) => (
  <div className={`p-4 ${type.bgColor} rounded-lg shadow-md text-white`}>
    <div className="font-semibold text-lg">{type.name}</div>
    <div className="text-sm italic">{type.subtitle}</div>
    <div className="text-sm mt-2 font-medium">{time}</div>
    <div className="text-sm">{instructor}</div>
  </div>
);

const YogaTimetable = () => {
  const [filter, setFilter] = useState('All Events');
  const [showFullSchedule, setShowFullSchedule] = useState(true);
  const [userProfile, setUserProfile] = useState({
    age: '',
    gender: '',
    profession: '',
    goal: ''
  });
  const [customSchedule, setCustomSchedule] = useState([]);

  const schedules = {
    yoga: [
      { day: 'Monday', time: '06:00 - 07:00', instructor: 'Lily Carter' },
      { day: 'Wednesday', time: '06:00 - 07:00', instructor: 'Sophia Keat' },
      { day: 'Friday', time: '06:00 - 07:00', instructor: 'Mary Sheldon' },
    ],
    zumba: [
      { day: 'Tuesday', time: '06:00 - 07:00', instructor: 'Grace Dean' },
      { day: 'Thursday', time: '06:00 - 07:00', instructor: 'Daniel Brooks' },
      { day: 'Saturday', time: '06:00 - 07:00', instructor: 'Sophia Keat' },
    ],
    cardio: [
      { day: 'Monday', time: '06:00 - 07:00', instructor: 'John Smith' },
      { day: 'Wednesday', time: '06:00 - 07:00', instructor: 'Daniel Brooks' },
      { day: 'Friday', time: '06:00 - 07:00', instructor: 'Grace Dean' },
    ],
    weightTraining: [
      { day: 'Monday', time: '06:00 - 07:00', instructor: 'Daniel Brooks' },
      { day: 'Wednesday', time: '06:00 - 07:00', instructor: 'Mary Sheldon' },
      { day: 'Friday', time: '06:00 - 07:00', instructor: 'Grace Dean' },
    ],
    meditation: [
      { day: 'Tuesday', time: '06:00 - 07:00', instructor: 'John Smith' },
      { day: 'Thursday', time: '06:00 - 07:00', instructor: 'Lily Carter' },
      { day: 'Saturday', time: '06:00 - 07:00', instructor: 'Sophia Keat' },
    ],
  };

  const allEvents = [
    ...schedules.yoga.map((event) => ({ ...event, type: classTypes.yoga })),
    ...schedules.zumba.map((event) => ({ ...event, type: classTypes.zumba })),
    ...schedules.cardio.map((event) => ({ ...event, type: classTypes.cardio })),
    ...schedules.weightTraining.map((event) => ({ ...event, type: classTypes.weightTraining })),
    ...schedules.meditation.map((event) => ({ ...event, type: classTypes.meditation })),
  ];

  const generateCustomSchedule = () => {
    const schedule = [];
    const { age, goal } = userProfile;

    if (goal === 'Weight Loss') {
      schedule.push(
        { day: 'Monday', type: classTypes.cardio, time: '06:00 - 07:00' },
        { day: 'Tuesday', type: classTypes.zumba, time: '06:00 - 07:00' },
        { day: 'Wednesday', type: classTypes.weightTraining, time: '06:00 - 07:00' },
        { day: 'Thursday', type: classTypes.cardio, time: '06:00 - 07:00' },
        { day: 'Friday', type: classTypes.zumba, time: '06:00 - 07:00' },
        { day: 'Saturday', type: classTypes.yoga, time: '06:00 - 07:00' }
      );
    } else if (goal === 'Weight Gain') {
      schedule.push(
        { day: 'Monday', type: classTypes.weightTraining, time: '06:00 - 07:00' },
        { day: 'Tuesday', type: classTypes.yoga, time: '06:00 - 07:00' },
        { day: 'Wednesday', type: classTypes.weightTraining, time: '06:00 - 07:00' },
        { day: 'Thursday', type: classTypes.cardio, time: '06:00 - 07:00' },
        { day: 'Friday', type: classTypes.weightTraining, time: '06:00 - 07:00' },
        { day: 'Saturday', type: classTypes.yoga, time: '06:00 - 07:00' }
      );
    } else if (goal === 'Fitness') {
      schedule.push(
        { day: 'Monday', type: classTypes.cardio, time: '06:00 - 07:00' },
        { day: 'Tuesday', type: classTypes.zumba, time: '06:00 - 07:00' },
        { day: 'Wednesday', type: classTypes.weightTraining, time: '06:00 - 07:00' },
        { day: 'Thursday', type: classTypes.yoga, time: '06:00 - 07:00' },
        { day: 'Friday', type: classTypes.cardio, time: '06:00 - 07:00' },
        { day: 'Saturday', type: classTypes.zumba, time: '06:00 - 07:00' }
      );
    } else if (goal === 'Mental Peace') {
      schedule.push(
        { day: 'Monday', type: classTypes.meditation, time: '06:00 - 07:00' },
        { day: 'Tuesday', type: classTypes.yoga, time: '06:00 - 07:00' },
        { day: 'Wednesday', type: classTypes.meditation, time: '06:00 - 07:00' },
        { day: 'Thursday', type: classTypes.yoga, time: '06:00 - 07:00' },
        { day: 'Friday', type: classTypes.meditation, time: '06:00 - 07:00' },
        { day: 'Saturday', type: classTypes.yoga, time: '06:00 - 07:00' }
      );
    }

    if (parseInt(age) > 50) {
      schedule.forEach((event) => {
        if (event.type === classTypes.cardio || event.type === classTypes.zumba) {
          event.type = classTypes.yoga;
        }
      });
    }

    setCustomSchedule(schedule);
    setShowFullSchedule(false);
  };

  return (
    <section id="schedule" className="max-w-6xl mx-auto p-6 bg-black rounded-lg shadow-lg">
      <h1 className="text-4xl text-center mb-8 text-white font-extrabold">Classes Timetable</h1>

      {/* User Details Form */}
      <div className="mb-6 bg-gray-800 p-4 rounded-lg">
        <h2 className="text-2xl text-white mb-4">Customize Your Schedule</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="number"
            placeholder="Age"
            value={userProfile.age}
            onChange={(e) => setUserProfile({ ...userProfile, age: e.target.value })}
            className="p-2 rounded-lg bg-gray-700 text-white focus:outline-none"
          />
          <select
            value={userProfile.gender}
            onChange={(e) => setUserProfile({ ...userProfile, gender: e.target.value })}
            className="p-2 rounded-lg bg-gray-700 text-white focus:outline-none"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <select
            value={userProfile.profession}
            onChange={(e) => setUserProfile({ ...userProfile, profession: e.target.value })}
            className="p-2 rounded-lg bg-gray-700 text-white focus:outline-none"
          >
            <option value="">Select Profession</option>
            <option value="Student">Student</option>
            <option value="Housewife">Housewife</option>
            <option value="Working Professional">Working Professional</option>
            <option value="Business">Business</option>
          </select>
          <select
            value={userProfile.goal}
            onChange={(e) => setUserProfile({ ...userProfile, goal: e.target.value })}
            className="p-2 rounded-lg bg-gray-700 text-white focus:outline-none"
          >
            <option value="">Select Goal</option>
            <option value="Weight Loss">Weight Loss</option>
            <option value="Weight Gain">Weight Gain</option>
            <option value="Fitness">Fitness</option>
            <option value="Mental Peace">Mental Peace</option>
          </select>
        </div>
        <div className="mt-4 flex flex-col md:flex-row gap-4">
          <button
            onClick={generateCustomSchedule}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500"
          >
            Generate Schedule
          </button>
          <button
            onClick={() => setShowFullSchedule(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
          >
            View Full Schedule
          </button>
        </div>
        <div className="mt-4">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500"
            onClick={() => alert('Demo class booked successfully!')}
          >
            Book a Demo Class
          </button>
        </div>
      </div>

      {/* Custom Schedule */}
      {!showFullSchedule && customSchedule.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl text-white mb-4">Your Custom Schedule</h2>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-1 mb-2">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <div
                key={day}
                className={`p-4 text-center font-semibold bg-gray-700 text-white rounded-lg ${
                  customSchedule.some((event) => event.day === day) ? '' : 'opacity-50'
                }`}
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-1">
            {customSchedule.map((event, index) => (
              <ClassBlock
                key={index}
                type={event.type}
                time={event.time}
                instructor="Auto-Assigned"
              />
            ))}
          </div>
        </div>
      )}

      {/* Full Schedule */}
      {showFullSchedule && (
        <>
          {/* Filter Tabs */}
          <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
            {['All Events', 'Yoga', 'Zumba', 'Cardio', 'Weight Training', 'Meditation'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 whitespace-nowrap rounded-lg font-medium text-sm transition-all focus:outline-none ${
                  filter === tab
                    ? 'bg-white text-black'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
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
                  <div key={day} className="p-4 text-center font-semibold bg-gray-700 text-white rounded-lg">
                    {day}
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {['06:00'].map((time) => (
                <div className="grid grid-cols-8 gap-1 mb-2" key={time}>
                  <div className="p-4 flex items-center font-medium text-white">{time}</div>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                    const event = allEvents.find(
                      (e) => e.day === day && e.time.startsWith(time)
                    );
                    return event && (filter === 'All Events' || event.type.name === filter) ? (
                      <ClassBlock
                        key={`${day}-${time}`}
                        type={event.type}
                        time={event.time}
                        instructor={event.instructor}
                      />
                    ) : (
                      <div
                        key={`${day}-${time}`}
                        className="bg-gray-800 h-full flex items-center justify-center rounded-lg border border-gray-600"
                      ></div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default YogaTimetable;
