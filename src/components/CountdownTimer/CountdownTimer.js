/* eslint-disable react/prop-types */
/* eslint-disable import/no-unused-modules */
import { useState, useEffect } from 'react';

const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setInterval(calculateTimeLeft, 1000);
        setIsVisible(true); // Trigger animation on mount
        return () => clearInterval(timer);
    }, []);

    const calculateTimeLeft = () => {
        const launchDate = new Date('2025-01-15T00:00:00').getTime();
        const now = new Date().getTime();
        const difference = launchDate - now;

        if (difference > 0) {
            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000)
            });
        }
    };

    const TimeUnit = ({ value, label }) => (
        <div className="flex flex-col items-center">
            <div className="relative">
                <div className="w-16 h-16 min-[320px]:w-16 min-[375px]:w-16 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-700 via-gray-200 to-gray-700 rounded-lg flex items-center justify-center shadow-2xl">
                    <div className="absolute inset-[2px] bg-gradient-to-br from-black via-gray-900 to-black rounded-lg flex items-center justify-center">
                        <span className="text-2xl min-[320px]:text-2xl min-[375px]:text-2xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-500 via-yellow-200 to-yellow-500 bg-clip-text text-transparent">
                            {value.toString().padStart(2, '0')}
                        </span>
                    </div>
                </div>
            </div>
            <span className="text-gray-400 font-semibold mt-2 sm:mt-3 uppercase tracking-widest text-[10px] min-[320px]:text-[10px] min-[375px]:text-[10px] sm:text-sm">{label}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
            <div className="max-w-5xl mx-auto px-4 text-center">
                {/* Logo Space */}
                <div className="">
                    <img 
                        src="/logo/logo.png" 
                        alt="Unifitz Logo" 
                        className="h-64 sm:h-96 mx-auto"
                    />
                </div>

                {/* Enhanced Launch Text */}
                <div className={`relative mb-6 min-[320px]:mb-6 min-[375px]:mb-6 sm:mb-16 transition-all duration-1000 transform ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}>
                    <div className="space-y-2">
                        <div className="flex justify-center items-center gap-2">
                            <div className="h-0.5 w-8 min-[320px]:w-8 min-[375px]:w-8 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
                            <h2 className="text-2xl min-[320px]:text-2xl min-[375px]:text-2xl sm:text-4xl md:text-5xl font-extrabold">
                                <span className="text-white">Where </span>
                                <span className="bg-gradient-to-r from-yellow-500 via-yellow-200 to-yellow-500 bg-clip-text text-transparent">
                                    Strength
                                </span>
                            </h2>
                            <div className="h-0.5 w-8 min-[320px]:w-8 min-[375px]:w-8 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
                        </div>
                        <h2 className="text-2xl min-[320px]:text-2xl min-[375px]:text-2xl sm:text-4xl md:text-5xl font-extrabold">
                            <span className="text-white">Meets </span>
                            <span className="bg-gradient-to-r from-yellow-500 via-yellow-200 to-yellow-500 bg-clip-text text-transparent">
                                Style
                            </span>
                        </h2>
                        <div className="flex justify-center items-center gap-2 mt-4">
                            <span className="h-[1px] w-6 min-[320px]:w-6 min-[375px]:w-6 bg-gray-700"></span>
                            <span className="text-gray-400 uppercase tracking-widest text-xs min-[320px]:text-xs min-[375px]:text-xs font-medium">Coming Soon</span>
                            <span className="h-[1px] w-6 min-[320px]:w-6 min-[375px]:w-6 bg-gray-700"></span>
                        </div>
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 min-[320px]:w-24 min-[375px]:w-24 h-1 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent blur-sm"></div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 min-[320px]:w-24 min-[375px]:w-24 h-1 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent blur-sm"></div>
                </div>

                {/* Countdown Timer */}
                <div className={`flex flex-wrap justify-center gap-2 min-[320px]:gap-2 min-[375px]:gap-2 sm:gap-8 mb-6 min-[320px]:mb-6 min-[375px]:mb-6 sm:mb-16 transition-all duration-1000 delay-500 transform ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}>
                    <TimeUnit value={timeLeft.days} label="Days" />
                    <TimeUnit value={timeLeft.hours} label="Hours" />
                    <TimeUnit value={timeLeft.minutes} label="Minutes" />
                    <TimeUnit value={timeLeft.seconds} label="Seconds" />
                </div>
            </div>
        </div>
    );
};

export default CountdownTimer;