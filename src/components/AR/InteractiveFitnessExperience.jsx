/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
// src/components/AR/InteractiveFitnessExperience.jsx
import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Plane, Environment } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
// import * as THREE from 'three';
import { 
  Camera, 
  VolumeX, 
  Volume2, 
  RotateCcw, 
  Maximize, 
  Minimize,
  Activity,
  Target,
  Zap,
  Users,
  Brain,
  Eye,
  Hand,
  Smartphone,
  Monitor,
  Headphones,
  Settings,
  Play,
  Pause,
  SkipForward
} from 'lucide-react';

// 3D Fitness Avatar Component
const FitnessAvatar = ({ exercise, isPlaying, progress }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current && isPlaying) {
      // Animate based on exercise type
      switch (exercise) {
        case 'jumping_jacks':
          meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 4) * 0.1;
          meshRef.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 8)) * 0.5;
          break;
        case 'squats':
          meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.3 - 0.3;
          break;
        case 'push_ups':
          meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 3) * 0.2 - 0.1;
          break;
        default:
          meshRef.current.rotation.y += delta * 0.5;
      }
    }
  });

  return (
    <group ref={meshRef}>
      {/* Body */}
      <Box
        args={[0.8, 1.6, 0.4]}
        position={[0, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={hovered ? '#8B5CF6' : '#3B82F6'}
          metalness={0.3}
          roughness={0.4}
        />
      </Box>
      
      {/* Head */}
      <Sphere args={[0.3]} position={[0, 1.1, 0]}>
        <meshStandardMaterial color="#F59E0B" metalness={0.2} roughness={0.8} />
      </Sphere>
      
      {/* Arms */}
      <Box args={[0.2, 1.2, 0.2]} position={[-0.6, 0.2, 0]}>
        <meshStandardMaterial color="#10B981" />
      </Box>
      <Box args={[0.2, 1.2, 0.2]} position={[0.6, 0.2, 0]}>
        <meshStandardMaterial color="#10B981" />
      </Box>
      
      {/* Legs */}
      <Box args={[0.25, 1.4, 0.25]} position={[-0.3, -1.5, 0]}>
        <meshStandardMaterial color="#DC2626" />
      </Box>
      <Box args={[0.25, 1.4, 0.25]} position={[0.3, -1.5, 0]}>
        <meshStandardMaterial color="#DC2626" />
      </Box>
      
      {/* Progress Ring */}
      <mesh position={[0, 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.6, 32]} />
        <meshBasicMaterial
          color="#8B5CF6"
          opacity={0.6}
          transparent
        />
      </mesh>
      
      {/* Exercise Label */}
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.3}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        {exercise.replace('_', ' ').toUpperCase()}
      </Text>
    </group>
  );
};

// 3D Exercise Environment
const ExerciseEnvironment = ({ environment = 'gym' }) => {
  const environments = {
    gym: {
      color: '#1F2937',
      accent: '#8B5CF6',
      objects: [
        { type: 'box', position: [-5, -2, -3], size: [1, 4, 0.5], color: '#374151' },
        { type: 'box', position: [5, -2, -3], size: [1, 4, 0.5], color: '#374151' },
        { type: 'sphere', position: [3, 0, -2], size: 0.5, color: '#EF4444' },
        { type: 'sphere', position: [-3, 0, -2], size: 0.5, color: '#10B981' }
      ]
    },
    park: {
      color: '#059669',
      accent: '#34D399',
      objects: [
        { type: 'box', position: [-4, -2, -2], size: [0.5, 6, 0.5], color: '#92400E' },
        { type: 'sphere', position: [-4, 1, -2], size: 2, color: '#16A34A' },
        { type: 'box', position: [4, -2, -2], size: [0.5, 6, 0.5], color: '#92400E' },
        { type: 'sphere', position: [4, 1, -2], size: 2, color: '#16A34A' }
      ]
    },
    beach: {
      color: '#0EA5E9',
      accent: '#F59E0B',
      objects: [
        { type: 'sphere', position: [0, 10, -10], size: 3, color: '#F59E0B' },
        { type: 'plane', position: [0, -3, 0], size: [20, 20], color: '#F4A261' }
      ]
    }
  };

  const env = environments[environment];

  return (
    <>
      {/* Environment Objects */}
      {env.objects.map((obj, index) => {
        if (obj.type === 'box') {
          return (
            <Box key={index} args={obj.size} position={obj.position}>
              <meshStandardMaterial color={obj.color} />
            </Box>
          );
        } else if (obj.type === 'sphere') {
          return (
            <Sphere key={index} args={[obj.size]} position={obj.position}>
              <meshStandardMaterial color={obj.color} />
            </Sphere>
          );
        } else if (obj.type === 'plane') {
          return (
            <Plane key={index} args={obj.size} position={obj.position} rotation={[-Math.PI / 2, 0, 0]}>
              <meshStandardMaterial color={obj.color} />
            </Plane>
          );
        }
        return null;
      })}
      
      {/* Ground */}
      <Plane args={[50, 50]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <meshStandardMaterial color={env.color} />
      </Plane>
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 10, 10]} intensity={0.5} color={env.accent} />
    </>
  );
};

// AR Camera Component
const ARCamera = ({ onCameraReady, isARActive }) => {
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    if (isARActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isARActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        onCameraReady?.(true);
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      onCameraReady?.(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  if (!isARActive) return null;

  return (
    <div className="absolute inset-0 z-0">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};

// Motion Tracking Overlay
const MotionTracking = ({ isActive, onPoseDetected }) => {
  const [poses, setPoses] = useState([]);
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    if (isActive) {
      // Simulate pose detection
      const interval = setInterval(() => {
        const mockPose = {
          leftWrist: { x: Math.random() * 640, y: Math.random() * 480, confidence: Math.random() },
          rightWrist: { x: Math.random() * 640, y: Math.random() * 480, confidence: Math.random() },
          leftElbow: { x: Math.random() * 640, y: Math.random() * 480, confidence: Math.random() },
          rightElbow: { x: Math.random() * 640, y: Math.random() * 480, confidence: Math.random() },
          nose: { x: Math.random() * 640, y: Math.random() * 480, confidence: Math.random() }
        };
        
        setPoses([mockPose]);
        setConfidence(Math.random() * 100);
        onPoseDetected?.(mockPose);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isActive, onPoseDetected]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Pose overlay */}
      {poses.map((pose, index) => (
        <div key={index}>
          {Object.entries(pose).map(([joint, position]) => (
            <div
              key={joint}
              className="absolute w-3 h-3 bg-green-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${(position.x / 640) * 100}%`,
                top: `${(position.y / 480) * 100}%`,
                opacity: position.confidence
              }}
            />
          ))}
        </div>
      ))}
      
      {/* Confidence indicator */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
        <div className="text-white text-sm mb-2">Motion Tracking</div>
        <div className="w-32 bg-gray-700 rounded-full h-2">
          <div 
            className="h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full transition-all duration-300"
            style={{ width: `${confidence}%` }}
          />
        </div>
        <div className="text-xs text-gray-300 mt-1">{confidence.toFixed(0)}% confidence</div>
      </div>
    </div>
  );
};

// Main AR/VR Fitness Experience Component
const InteractiveFitnessExperience = () => {
  const [mode, setMode] = useState('3d'); // '3d', 'ar', 'vr'
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentExercise, setCurrentExercise] = useState('jumping_jacks');
  const [environment, setEnvironment] = useState('gym');
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [motionTracking, setMotionTracking] = useState(false);
  const [workoutData, setWorkoutData] = useState({
    duration: 0,
    reps: 0,
    calories: 0,
    form_score: 0
  });

  const exercises = [
    'jumping_jacks',
    'squats',
    'push_ups',
    'lunges',
    'burpees',
    'planks'
  ];

  const environments = ['gym', 'park', 'beach'];

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => (prev + 1) % 100);
        setWorkoutData(prev => ({
          ...prev,
          duration: prev.duration + 1,
          reps: prev.reps + Math.random() > 0.8 ? 1 : 0,
          calories: prev.calories + 0.1,
          form_score: Math.min(100, prev.form_score + Math.random() * 2)
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePoseDetected = (pose) => {
    // Process pose data and provide feedback
    console.log('Pose detected:', pose);
  };

  const nextExercise = () => {
    const currentIndex = exercises.indexOf(currentExercise);
    const nextIndex = (currentIndex + 1) % exercises.length;
    setCurrentExercise(exercises[nextIndex]);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* AR Camera Background */}
      {mode === 'ar' && (
        <ARCamera 
          isARActive={mode === 'ar'} 
          onCameraReady={setCameraReady}
        />
      )}

      {/* Motion Tracking Overlay */}
      {mode === 'ar' && motionTracking && (
        <MotionTracking 
          isActive={motionTracking} 
          onPoseDetected={handlePoseDetected}
        />
      )}

      {/* 3D Scene */}
      <div className={`w-full h-full ${mode === 'ar' ? 'absolute inset-0 z-20' : ''}`}>
        <Canvas
          camera={{ position: [0, 2, 8], fov: 60 }}
          style={{ 
            background: mode === 'ar' ? 'transparent' : 'linear-gradient(to bottom, #1e1b4b, #312e81)' 
          }}
        >
          <Suspense fallback={null}>
            {mode !== 'ar' && <ExerciseEnvironment environment={environment} />}
            
            <FitnessAvatar 
              exercise={currentExercise}
              isPlaying={isPlaying}
              progress={progress}
            />
            
            <OrbitControls 
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              maxPolarAngle={Math.PI / 2}
              minDistance={3}
              maxDistance={15}
            />
            
            {mode === 'vr' && <Environment preset="sunset" />}
          </Suspense>
        </Canvas>
      </div>

      {/* Control Panel */}
      <motion.div
        className="absolute top-4 left-4 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/20 p-4 z-30"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {/* Mode Selector */}
        <div className="flex space-x-2 mb-4">
          {[
            { mode: '3d', icon: <Monitor className="w-4 h-4" />, label: '3D' },
            { mode: 'ar', icon: <Camera className="w-4 h-4" />, label: 'AR' },
            { mode: 'vr', icon: <Headphones className="w-4 h-4" />, label: 'VR' }
          ].map(({ mode: m, icon, label }) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                mode === m
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {icon}
              <span className="ml-2 text-sm">{label}</span>
            </button>
          ))}
        </div>

        {/* Exercise Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white hover:shadow-lg transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isPlaying ? 'Pause' : 'Start'}
            </button>
            
            <button
              onClick={nextExercise}
              className="flex items-center px-3 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Exercise Selector */}
          <select
            value={currentExercise}
            onChange={(e) => setCurrentExercise(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-400 focus:outline-none"
          >
            {exercises.map(exercise => (
              <option key={exercise} value={exercise} className="bg-gray-900">
                {exercise.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>

          {/* Environment Selector (3D mode only) */}
          {mode === '3d' && (
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-400 focus:outline-none"
            >
              {environments.map(env => (
                <option key={env} value={env} className="bg-gray-900">
                  {env.toUpperCase()}
                </option>
              ))}
            </select>
          )}
        </div>
      </motion.div>

      {/* Workout Stats */}
      <motion.div
        className="absolute top-4 right-4 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/20 p-4 z-30"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h3 className="text-white font-bold mb-3 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-cyan-400" />
          Workout Stats
        </h3>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white/10 rounded-lg p-2">
            <div className="text-gray-400">Duration</div>
            <div className="text-white font-bold">{Math.floor(workoutData.duration / 60)}:{(workoutData.duration % 60).toString().padStart(2, '0')}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2">
            <div className="text-gray-400">Reps</div>
            <div className="text-white font-bold">{workoutData.reps}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2">
            <div className="text-gray-400">Calories</div>
            <div className="text-white font-bold">{workoutData.calories.toFixed(1)}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2">
            <div className="text-gray-400">Form Score</div>
            <div className="text-white font-bold">{workoutData.form_score.toFixed(0)}%</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Bottom Controls */}
      <motion.div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/20 p-4 z-30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-4">
          {/* AR Motion Tracking Toggle */}
          {mode === 'ar' && (
            <button
              onClick={() => setMotionTracking(!motionTracking)}
              className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                motionTracking
                  ? 'bg-green-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Eye className="w-4 h-4 mr-2" />
              Motion Tracking
            </button>
          )}

          {/* Audio Toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-2 bg-white/10 rounded-lg text-gray-300 hover:bg-white/20 transition-all"
          >
            {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white/10 rounded-lg text-gray-300 hover:bg-white/20 transition-all"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>

          {/* Reset */}
          <button
            onClick={() => {
              setProgress(0);
              setWorkoutData({ duration: 0, reps: 0, calories: 0, form_score: 0 });
            }}
            className="p-2 bg-white/10 rounded-lg text-gray-300 hover:bg-white/20 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* AR Camera Status */}
      {mode === 'ar' && (
        <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-xl rounded-lg border border-white/20 p-3 z-30">
          <div className="flex items-center text-sm">
            <div className={`w-2 h-2 rounded-full mr-2 ${cameraReady ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-white">
              Camera {cameraReady ? 'Ready' : 'Not Available'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveFitnessExperience;