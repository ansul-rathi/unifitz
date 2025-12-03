import { Calendar, Video, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';

const Sessions = () => {
  // Array of sessions - easily update this daily
  const sessions = [
    {
      id: 1,
      day: "Day 1",
      title: "Bollywood Fitness Mix",
      trainer: "Ansul Rathi",
      description: "A high-energy workout that blends Bollywood moves with fun",
      date: "2025-11-21",
      zoomLink: "https://us06web.zoom.us/rec/share/kq-aiNPjG8BgWKKYQvjp20Gi2V6a556NNp7MYEnbYvUUYBt9PKWr9SB7x1167GAP.VLL9qrZPA1rHsp_A",
      image: "../21days/day1.svg"
    },
    {
      id: 2,
      day: "Day 2",
      title: "Yoga for Better Digestion",
      trainer: "Mehak Sagatramani",
      description: "Gentle stretches to boost your gut health. Improve metabolism, reduce bloating, and feel lighter from within.",
      date: "2025-11-22",
      zoomLink: "https://us06web.zoom.us/rec/share/N0iL0vJHzqk_A5_duYpDZow-Of_5jsWAgN4pNDR4Dzbl0Hgbx_oZj7G70_3My6bk.tUkZE53ivd7_jo6l",
      image: "../21days/day2.svg"
    },
    {
      id: 3,
      day: "Day 3",
      title: "Punjabi Dance Workout",
      trainer: "Ansul Rathi",
      description: "Full-on Punjabi beats ke saath high-energy fitness — jithe step vi fun, te workout vi done",
      date: "2025-11-23",
      zoomLink: "https://us06web.zoom.us/rec/share/pUrgwwUefVre8u8DJRpohGcL2bqKz2DkuSVCK8O73KLLrOUOUyt9qZhBCzrOuXQl.SxLpdk3xe21He1bp",
      image: "../21days/day3.svg"
    },
    {
      id: 4,
      day: "Day 4",
      title: "Quick Power Yoga",
      trainer: "Mehak Sagatramani",
      description: "Bas few minutes, aur poora day powerful — Perfect for a quick strength + stretch boost.",
      date: "2025-11-24",
      zoomLink: "https://us06web.zoom.us/rec/share/CvjShuMUtG6NQtojF9K7_xjzJkw1QlSrahxNNBLL5fMnx2g1lWWPsBiNHZd_tTk.Ys-iRR-x99W8dl9L",
      image: "../21days/day4.svg"
    },
    {
      id: 5,
      day: "Day 5",
      title: "Reiki Introduction Session",
      trainer: "Neha Jain",
      description: "Experience the basics of Reiki and understand how energy healing can bring calm, balance, and clarity.",
      date: "2025-11-25",
      zoomLink: "https://us06web.zoom.us/rec/share/ZGPP1rbWqGsWfFBpZoi3TVnLYlazNQQeSAcSyvK6wQIEOkErRkImGcz5TGLWT427.4E5Nx6FEzVxAAbpt",
      image: "../21days/day5.png"
    },
    {
      id: 6,
      day: "Day 6",
      title: "Zumba Fitness",
      trainer: "Ansul Rathi",
      description: "We’ll hit powerful upper + lower body moves with music that makes you jump, groove & sweat!",
      date: "2025-11-26",
      zoomLink: "https://us06web.zoom.us/rec/share/BHluJjYQAEm5Gqyi93sfe7txL2xf-hM8BEbSNSKgfU_a_6UglQL5M-gQZx46ag8n.KH94_lMgMzrCgQyk",
      image: "../21days/day6.jpeg"
    },
    {
    id: 7,
    day: "Day 7",
    title: "Yoga for Cervical",
    trainer: "Mehak Sagatramani",
    description: "Neck & shoulder relief with gentle, effective cervical stretches.",
    date: "2025-11-27",
    time: "Morning 08:30",
    zoomLink: "https://us06web.zoom.us/rec/share/2cVZeil0YM1FNueyd1gT0DTzHFNEbGoiXS4FLoW1ikHIEwGlldzk3PSKin24N_Qy.5hbtU_SAGRvuug8C",
    image: "../21days/day7.svg"
  },
  {
    id: 8,
    day: "Day 8",
    title: "Heartfulness Relaxation",
    trainer: "Asha Sharma",
    description: "A soothing session to relax your mind and release emotional tension.",
    date: "2025-11-28",
    time: "Evening 06:30",
    zoomLink: "https://us06web.zoom.us/rec/share/uaxsQCDBilOzWIbfC3z2SqvRqwjdneESqQeBIC4ik2L7y0QKi5F4dzxvhnJx64qv.ZVVyB6yEQ7OpN0ZZ",
    image: "../21days/day8.svg"
  },
  {
    id: 9,
    day: "Day 9",
    title: "Yoga for Balanced Hormones",
    trainer: "Mehak Sagatramani",
    description: "Yoga sequence to support hormonal balance and reduce stress.",
    date: "2025-11-29",
    time: "Morning 08:30",
    zoomLink: "https://us06web.zoom.us/rec/share/y97GT2WNZAlDUi3xeizqKhwjFJpsLN5RUGvzYW0EXQW7X5FAyQcAkWtdLkyLn0RJ.CLXaGSHa4qaj3ecF",
    image: "../21days/day9.svg"
  },
  {
    id: 10,
    day: "Day 10",
    title: "Heartfulness Relaxation",
    trainer: "Asha Sharma",
    description: "A soothing session to relax your mind and release emotional tension.",
    date: "2025-11-30",
    zoomLink: "https://us06web.zoom.us/rec/share/feBmQ8mBKE1ZygazFbuXJ5Tgwv1il6lf6yUgL3kwy0jKzynS1ZQ0x2ARWxl5RWUw.MbrY1dXo4JHv1l3r",
    image: "../21days/day8.svg"
  },
  {
    id: 11,
    day: "Day 11",
    title: "Old Is Gold",
    trainer: "Ansul Rathi",
    description: "Dance fitness on retro hits—nostalgia with full calorie burn!",
    date: "2025-12-01",
    zoomLink: "https://us06web.zoom.us/rec/share/poU9iAauKMRxOXRq1eUP996DdxjIjXD4CaHuIBin4Adnj9wyzqK1R3obBG2YReW6.tqZRU0mDp4LDiTur",
    image: "../21days/day11.png"
  },
  {
    id: 12,
    day: "Day 12",
    title: "Water Manifesting",
    trainer: "Neha Jain",
    description: "A powerful manifestation technique using water intention energy.",
    date: "2025-12-02",
    zoomLink: "https://us06web.zoom.us/rec/share/FUFZsdPmmGLF0S4AGnBp9E4qBK1qQNNgaQFzJga1MHpEjk8n3ndorFD6ZrQMFEjF.ZVRJzMXEaPv53Iiv",
    image: "../21days/day10.svg"
  },
  {
    id: 13,
    day: "Day 13",
    title: "Heartfulness Relaxation",
    trainer: "Asha Sharma",
    description: "A soothing session to relax your mind and release emotional tension.",
    date: "2025-12-03",
    zoomLink: "https://us06web.zoom.us/rec/share/TVQ6RJb4P__etCuc2rzUVdZaVXeM5pRsh_pG6n4tFh5nHvT42kx3Y3LSdMwEwdN4.Uzme739x9nubQNA4",
    image: "../21days/day8.svg"
  },
  // {
  //   id: 12,
  //   day: "Day 12",
  //   title: "Yoga for Knees",
  //   trainer: "Mehak Sagatramani",
  //   description: "Strengthening & mobility-focused yoga routine for knee comfort.",
  //   date: "2025-12-02",
  //   time: "Morning 08:30",
  //   zoomLink: "",
  //   image: "../21days/day12.svg"
  // },
  // {
  //   id: 13,
  //   day: "Day 13",
  //   title: "Heartfulness Relaxation",
  //   trainer: "Asha Sharma",
  //   description: "Deep mind–body relaxation for peace, clarity & inner balance.",
  //   date: "2025-12-03",
  //   time: "Evening 06:30",
  //   zoomLink: "",
  //   image: "../21days/day13.svg"
  // },
  // {
  //   id: 14,
  //   day: "Day 14",
  //   title: "Celebrity Special",
  //   trainer: "Ansul Rathi",
  //   description: "Bollywood celeb-style choreography with high-energy cardio!",
  //   date: "2025-12-04",
  //   time: "Morning 08:30",
  //   zoomLink: "",
  //   image: "../21days/day14.svg"
  // },
  // {
  //   id: 15,
  //   day: "Day 15",
  //   title: "How to Plan Your Workouts",
  //   trainer: "Mehak Sagatramani",
  //   description: "Learn how to plan weekly workouts for consistency & better results.",
  //   date: "2025-12-05",
  //   time: "Morning 08:30",
  //   zoomLink: "",
  //   image: "../21days/day15.svg"
  // },
  // {
  //   id: 16,
  //   day: "Day 16",
  //   title: "Diet and Nutrition",
  //   trainer: "Mehak Sagatramani",
  //   description: "Learn simple nutrition tips to improve energy, metabolism & digestion.",
  //   date: "2025-12-06",
  //   time: "Morning 08:30",
  //   zoomLink: "",
  //   image: "../21days/day16.svg"
  // },
  // {
  //   id: 17,
  //   day: "Day 17",
  //   title: "7 Chakras Workshop",
  //   trainer: "Neha Jain",
  //   description: "Understand all 7 chakras and how to align your internal energy.",
  //   date: "2025-12-07",
  //   time: "Evening 06:30",
  //   zoomLink: "",
  //   image: "../21days/day17.svg"
  // },
  // {
  //   id: 18,
  //   day: "Day 18",
  //   title: "Meditation",
  //   trainer: "Asha Sharma",
  //   description: "A calming meditation experience to deepen awareness & inner peace.",
  //   date: "2025-12-08",
  //   time: "Evening 06:30",
  //   zoomLink: "",
  //   image: "../21days/day18.svg"
  // },
  // {
  //   id: 19,
  //   day: "Day 19",
  //   title: "Surya Namaskar Marathon",
  //   trainer: "Ansul Rathi",
  //   description: "A dynamic morning flow of multiple Surya Namaskars for stamina & strength.",
  //   date: "2025-12-09",
  //   time: "Morning 08:30",
  //   zoomLink: "",
  //   image: "../21days/day19.svg"
  // },
  // {
  //   id: 20,
  //   day: "Day 20",
  //   title: "Mix Dance Workout",
  //   trainer: "Ansul Rathi",
  //   description: "Bollywood + freestyle + cardio dance for maximum sweat & fun!",
  //   date: "2025-12-10",
  //   time: "Morning 08:30",
  //   zoomLink: "",
  //   image: "../21days/day20.svg"
  // },
  // {
  //   id: 21,
  //   day: "Day 21",
  //   title: "Q & A Session",
  //   trainer: "Asha Sharma",
  //   description: "Ask anything about fitness, meditation, lifestyle & well-being.",
  //   date: "2025-12-11",
  //   time: "Evening 06:30",
  //   zoomLink: "",
  //   image: "../21days/day21.svg"
  // }
];

  const formatDate = (dateString) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const joinSession = (session) => {
    if (session.zoomLink && session.zoomLink !== "#") {
      window.open(session.zoomLink, '_blank', 'noopener,noreferrer');
    }
  };

 useEffect(() => {
  if (window.location.hash) {
    const id = window.location.hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
  }
}, []);


  return (
    <div id="session" className="relative bg-gradient-to-b from-slate-50 to-slate-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Daily <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Sessions</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join live sessions with expert trainers. Each day brings new challenges and growth opportunities.
          </p>
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sessions.map((session) => (
            <div 
              key={session.id}
                id={`session-${session.id}`}   // <-- UNIQUE ID
              className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-200"
            >
              {/* Session Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={session.image} 
                  alt={session.title}
                  className="w-full h-full object-cover  transition-transform duration-300"
                />
                
                {/* Day Tag */}
                <div className="absolute top-[-5px] left-[-5px] z-50">
                  <span className="bg-black/80 text-white px-3 py-1 rounded-lg text-sm font-bold backdrop-blur-sm">
                    {session.day}
                  </span>
                </div>
                
                {/* Status Tag */}
                {/* <div className="absolute top-4 right-4">
                  <span className={`${session.tagColor} text-white px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm`}>
                    {session.tag}
                  </span>
                </div> */}
              </div>

              {/* Session Content */}
              <div className="p-6">
                {/* Session Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {session.title}
                </h3>
                
                {/* Session Description */}
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {session.description}
                </p>


                {/* Session Description */}
                <p className="text-gray-600 mb-4 line-clamp-2 font-bold">
                  By : {session.trainer}
                </p>


                {/* Session Details */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">{formatDate(session.date)}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => joinSession(session)}
                  disabled={session?.zoomLink === ""}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                    session.tag === "Completed" 
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                      : session.zoomLink === ""
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                      : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                  }`}
                >
                  {session.tag === "Completed" ? (
                    <>Session Completed</>
                  ) : session.tag === "Live Now" ? (
                    <>
                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                      Join Live Session
                      <ExternalLink className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                  {session.zoomLink ==="" ? "Coming Soon" : "Watch Recording"}
                      <ExternalLink className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Meeting Password */}
                {session.password && session.password !== "Completed" && (
                  <div className="mt-3 text-center">
                    <span className="text-xs text-gray-500">
                      Password: <span className="font-mono font-bold">{session.password}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-2">💡 Session Guidelines</h4>
            <p className="text-gray-600 text-sm">
              Join 5 minutes early • Have water ready • Wear comfortable clothes • 
              Stable internet connection required • Sessions are recorded for later viewing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sessions;