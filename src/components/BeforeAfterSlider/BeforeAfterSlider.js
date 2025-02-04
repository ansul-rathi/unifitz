/* eslint-disable import/no-unused-modules */
import { useState, useRef, useEffect } from 'react';

const BeforeAfterSlider = () => {
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState(50);
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  const handleMouseMove = (e) => {
    if (isResizing && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const containerWidth = containerRef.current.offsetWidth;
      const newPosition = (x / containerWidth) * 100;
      
      if (newPosition >= 0 && newPosition <= 100) {
        setPosition(newPosition);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isResizing]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div 
        ref={containerRef}
        className="relative w-full h-96 overflow-hidden cursor-col-resize"
        onMouseDown={handleMouseDown}
      >
        {/* Before Image */}
        <div className="absolute inset-0">
          <img
            src="/program/zumba.png"
            alt="Before"
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded">
            Before
          </span>
        </div>

        {/* After Image */}
        <div 
          className="absolute inset-0"
          style={{ 
            clipPath: `inset(0 ${100 - position}% 0 0)` 
          }}
        >
          <img
            src="/program/yoga.png"
            alt="After"
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded">
            After
          </span>
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize"
          style={{ 
            left: `${position}%`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="absolute top-1/2 left-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="w-1 h-4 bg-gray-400 rounded-full mx-0.5" />
            <div className="w-1 h-4 bg-gray-400 rounded-full mx-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;