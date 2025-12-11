/* eslint-disable import/no-unused-modules */
import { useState, useRef } from 'react';
import { Trophy, Users, Play } from 'lucide-react';

export default function PrizeWheel() {
  const [names, setNames] = useState([
  'Aarohi', 'Ananya', 'Diya', 'Ishita', 'Kavya',
  'Meera', 'Nisha', 'Riya', 'Saanvi', 'Tanisha'
]);

  const [newName, setNewName] = useState('');
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const wheelRef = useRef(null);

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B739', '#52B788'
  ];

  const handleAddName = () => {
    if (newName.trim() && names.length < 20) {
      setNames([...names, newName.trim()]);
      setNewName('');
    }
  };

  const handleRemoveName = (index) => {
    if (names.length > 2) {
      setNames(names.filter((_, i) => i !== index));
    }
  };

  const spinWheel = () => {
    if (isSpinning || names.length === 0) return;

    setIsSpinning(true);
    setWinner(null);

    // Random spins between 8-12 full rotations plus random angle
    const spins = 8 + Math.random() * 4;
    const randomDegree = Math.random() * 360;
    const totalRotation = rotation + (spins * 360) + randomDegree;

    setRotation(totalRotation);

    // Calculate winner after spin
    setTimeout(() => {
      const normalizedRotation = totalRotation % 360;
      const segmentAngle = 360 / names.length;
      // Adjust calculation to account for name being in center of segment
      const winningIndex = Math.floor((360 - normalizedRotation) / segmentAngle) % names.length;
      
      setWinner(names[winningIndex]);
      setIsSpinning(false);
    }, 6000);
  };

  const segmentAngle = 360 / names.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-white text-center mb-8 flex items-center justify-center gap-3">
          <Trophy className="text-yellow-400" size={48} />
          Prize Wheel Spinner
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Wheel Section */}
          <div className="flex flex-col items-center">
            <div className="relative mb-8">
              {/* Wheel */}
              <div className="relative w-96 h-96 rounded-full shadow-2xl overflow-visible">
                {/* Center marker - Sharp triangle pointer */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <div className="relative flex items-center justify-center">
                    {/* Sharp triangular pointer pointing upward with gradient */}
                    <svg width="90" height="140" className="absolute" style={{ top: '-115px' }}>
                      <defs>
                        <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#1a1a1a', stopOpacity: 1 }} />
                          <stop offset="100%" style={{ stopColor: '#000000', stopOpacity: 1 }} />
                        </linearGradient>
                        <filter id="pointerShadow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                          <feOffset dx="0" dy="3" result="offsetblur"/>
                          <feComponentTransfer>
                            <feFuncA type="linear" slope="0.5"/>
                          </feComponentTransfer>
                          <feMerge>
                            <feMergeNode/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      {/* Outer glow */}
                      <polygon 
                        points="45,90 25,125 65,125" 
                        fill="rgba(255,215,0,0.3)" 
                        filter="blur(4px)"
                      />
                      {/* Main pointer */}
                      <polygon 
                        points="45,95 28,120 62,120" 
                        fill="url(#pointerGradient)" 
                        stroke="#FFD700"
                        strokeWidth="2.5"
                        strokeLinejoin="miter"
                        filter="url(#pointerShadow)"
                      />
                      {/* Inner highlight */}
                      <polygon 
                        points="45,100 35,115 55,115" 
                        fill="rgba(255,255,255,0.2)" 
                      />
                    </svg>
                    {/* Center circle with "SPIN" text */}
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-900 to-black rounded-full border-4 border-yellow-400 shadow-2xl flex items-center justify-center relative">
                      <div className="absolute inset-1 bg-gradient-to-br from-gray-800 to-black rounded-full"></div>
                      <span className="text-white font-bold text-lg relative z-10 tracking-wider">SPIN</span>
                    </div>
                  </div>
                </div>

                <svg
                  ref={wheelRef}
                  className="w-full h-full"
                  style={{ 
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning ? 'transform 6s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
                  }}
                  viewBox="0 0 100 100"
                >
                  {names.map((name, index) => {
                    const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
                    const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);
                    const largeArc = segmentAngle > 180 ? 1 : 0;

                    const x1 = 50 + 50 * Math.cos(startAngle);
                    const y1 = 50 + 50 * Math.sin(startAngle);
                    const x2 = 50 + 50 * Math.cos(endAngle);
                    const y2 = 50 + 50 * Math.sin(endAngle);

                    // Position text in the CENTER of each segment
                    const textAngle = (index * segmentAngle) + (segmentAngle / 2);
                    const textRadius = 35;
                    const textX = 50 + textRadius * Math.cos((textAngle - 90) * (Math.PI / 180));
                    const textY = 50 + textRadius * Math.sin((textAngle - 90) * (Math.PI / 180));

                    return (
                      <g key={index}>
                        <path
                          d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={colors[index % colors.length]}
                          stroke="white"
                          strokeWidth="0.5"
                        />
                        <text
                          x={textX}
                          y={textY}
                          fill="white"
                          fontSize="4"
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                        >
                          {name}
                        </text>
                      </g>
                    );
                  })}
                  {/* Center circle decoration */}
                  <circle cx="50" cy="50" r="6" fill="#FFD700" stroke="#333" strokeWidth="0.5" />
                </svg>
              </div>

              {/* Spin Button */}
              <button
                onClick={spinWheel}
                disabled={isSpinning || names.length === 0}
                className="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                <Play size={24} />
                {isSpinning ? 'SPINNING...' : 'SPIN THE WHEEL!'}
              </button>
            </div>

            {/* Winner Display */}
            {winner && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-2xl shadow-2xl animate-bounce">
                <h2 className="text-3xl font-bold text-white text-center flex items-center justify-center gap-2">
                  <Trophy size={32} />
                  WINNER: {winner}!
                  <Trophy size={32} />
                </h2>
              </div>
            )}
          </div>

          {/* Names Management Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Users size={28} />
              Manage Participants
            </h2>

            {/* Add Name */}
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddName()}
                placeholder="Enter a name..."
                className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border-2 border-white/30 focus:border-white/60 focus:outline-none"
              />
              <button
                onClick={handleAddName}
                disabled={!newName.trim() || names.length >= 20}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>

            {/* Names List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {names.map((name, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white/20 p-3 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    ></div>
                    <span className="text-white font-medium">{name}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveName(index)}
                    disabled={names.length <= 2}
                    className="text-red-400 hover:text-red-300 font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <p className="text-white/60 text-sm mt-4 text-center">
              {names.length} participants • {20 - names.length} slots remaining
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}