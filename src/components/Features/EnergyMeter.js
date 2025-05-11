import  { useState, useEffect, useRef } from 'react';
import {  BatteryFull, BatteryLow, BatteryMedium,  SwitchCamera, PartyPopper } from 'lucide-react';

const MotionEnergyMeter = () => {
  const [energy, setEnergy] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [currentMovement, setCurrentMovement] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const [maxEnergyReached, setMaxEnergyReached] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const previousFrameRef = useRef(null);
  const streamRef = useRef(null);

  // Get list of available cameras
  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameras(videoDevices);
      if (videoDevices.length > 0 && !selectedCamera) {
        setSelectedCamera(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error("Error getting cameras:", err);
    }
  };

  // Initialize camera detection
  useEffect(() => {
    getCameras();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endWorkout();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Track maximum energy reached
  useEffect(() => {
    if (energy > maxEnergyReached) {
      setMaxEnergyReached(energy);
    }
  }, [energy]);

  const stopCurrentStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const startCamera = async (deviceId) => {
    stopCurrentStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasCamera(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasCamera(false);
    }
  };

  const handleCameraChange = (deviceId) => {
    setSelectedCamera(deviceId);
    if (isActive) {
      startCamera(deviceId);
    }
  };

  const calculateMovement = (current, previous) => {
    let movement = 0;
    let pixelCount = 0;
    
    for (let i = 0; i < current.length; i += 4) {
      const diff = Math.abs(current[i] - previous[i]) +
                  Math.abs(current[i + 1] - previous[i + 1]) +
                  Math.abs(current[i + 2] - previous[i + 2]);
      if (diff > 30) {
        movement += diff;
        pixelCount++;
      }
    }
    
    return pixelCount > 300 ? (movement / 3000000) : 0;
  };

  const detectMotion = () => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, 640, 480);
    
    const currentFrame = context.getImageData(0, 0, 640, 480);
    
    if (previousFrameRef.current) {
      const movement = calculateMovement(currentFrame.data, previousFrameRef.current.data);
      setCurrentMovement(movement);
      
      if (movement > 0.25) {
        const energyIncrease = Math.min(movement * 0.3, 0.4);
        setEnergy(prev => Math.min(100, prev + energyIncrease));
      }
    }
    
    previousFrameRef.current = currentFrame;
  };

  // Motion detection loop
  useEffect(() => {
    let interval;
    if (isActive && hasCamera) {
      interval = setInterval(detectMotion, 50);
    }
    return () => {
      clearInterval(interval);
      stopCurrentStream();
    };
  }, [isActive, hasCamera]);

  // Energy decay when no movement
  useEffect(() => {
    let decayInterval;
    if (isActive && energy > 0 && currentMovement < 0.25) {
      decayInterval = setInterval(() => {
        setEnergy(prev => {
          const decayRate = (prev > 70) ? 4 :
                           (prev > 40) ? 3 :
                           2;
          return Math.max(0, prev - decayRate);
        });
      }, 50);
    }
    return () => clearInterval(decayInterval);
  }, [isActive, energy, currentMovement]);

  const resetWorkout = () => {
    setTimeLeft(30);
    setEnergy(0);
    setMaxEnergyReached(0);
    setWorkoutComplete(false);
    setIsActive(false);
  };

  const endWorkout = () => {
    setIsActive(false);
    setWorkoutComplete(true);
    stopCurrentStream();
  };

  const toggleWorkout = () => {
    if (!isActive) {
      startCamera(selectedCamera);
      setEnergy(0);
    } else {
      stopCurrentStream();
    }
    setIsActive(!isActive);
  };

  const formatTime = (seconds) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const getBatteryIcon = () => {
    if (energy < 30) return <BatteryLow className="w-8 h-8 text-red-500" />;
    if (energy < 70) return <BatteryMedium className="w-8 h-8 text-yellow-500" />;
    return <BatteryFull className="w-8 h-8 text-green-500" />;
  };

  const getEnergyColor = () => {
    if (energy < 30) return 'bg-red-500';
    if (energy < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {!workoutComplete ? (
        <>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Motion Energy Meter</h2>
            <div className="flex items-center justify-center gap-4 mb-4">
              {getBatteryIcon()}
              <span className="ml-2 text-xl font-semibold text-gray-900">{Math.round(energy)}%</span>
              <span className="text-2xl font-bold text-blue-600">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Select Camera
            </label>
            <div className="flex items-center space-x-2">
              <select
                value={selectedCamera}
                onChange={(e) => handleCameraChange(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                disabled={isActive}
              >
                {cameras.map((camera, index) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    Camera {index + 1} - {camera.label || `Device ${index + 1}`}
                  </option>
                ))}
              </select>
              <button
                onClick={getCameras}
                className="p-2 text-gray-900 hover:text-gray-700"
                title="Refresh camera list"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative mb-4 bg-gray-100 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full rounded-lg transform scale-x-[-1]"
              autoPlay
              playsInline
            />
            <canvas
              ref={canvasRef}
              width="640"
              height="480"
              className="hidden"
            />
          </div>

          <div className="w-full h-6 bg-gray-200 rounded-full mb-4">
            <div
              className={`h-full rounded-full transition-all duration-300 ${getEnergyColor()}`}
              style={{ width: `${energy}%` }}
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={toggleWorkout}
              className={`px-8 py-3 rounded-full font-semibold text-white transition-colors
                ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
              disabled={!selectedCamera}
            >
              {isActive ? 'End Workout' : 'Start Workout'}
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          {maxEnergyReached >= 80 ? (
            <div className="space-y-6">
              <PartyPopper className="w-16 h-16 mx-auto text-yellow-500" />
              <h2 className="text-3xl font-bold text-gray-900">Hurreee! 🎉</h2>
              <p className="text-xl text-gray-900">You earned a massive 80% discount!</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Workout Complete!</h2>
              <p className="text-xl text-gray-900">
                You reached {Math.round(maxEnergyReached)}% energy
              </p>
              <p className="text-lg text-gray-700">
                Yopu got {Math.round(maxEnergyReached)}% discount on your enrollment!
              </p>
            </div>
          )}

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={resetWorkout}
              className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
            <button
              className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              onClick={() => alert('Enrollment process would start here')}
            >
              Enroll Now ({Math.round(Math.max(maxEnergyReached, 80))}% OFF)
            </button>
          </div>
        </div>
      )}

      {!workoutComplete && (
        <div className="mt-4 text-center text-gray-900 font-medium">
          {!hasCamera && isActive && (
            <div className="text-red-500">
              Camera access needed for motion detection
            </div>
          )}
          {cameras.length === 0 && (
            <div className="text-red-500">
              No cameras detected. Please connect a camera and refresh.
            </div>
          )}
          {energy < 30 && 'Move more to increase energy!'}
          {energy >= 30 && energy < 70 && 'Good movement, keep it up!'}
          {energy >= 70 && 'Excellent intensity!'}
        </div>
      )}
    </div>
  );
};

export default MotionEnergyMeter;