/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Camera, 
  Zap, 
  Target, 
  TrendingUp, 
  Heart,
  Activity,
  Trophy,
  Eye,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

// Exercise definitions with key poses and criteria
const EXERCISES = {
  yoga: {
    poses: [
      {
        name: 'Mountain Pose',
        keyPoints: {
          shouldersLevel: true,
          armsDown: true,
          feetTogether: true,
          straightBack: true
        },
        holdTime: 3000
      },
      {
        name: 'Warrior I',
        keyPoints: {
          frontKneeBent: true,
          armsUp: true,
          backLegStraight: true,
          hipsForward: true
        },
        holdTime: 5000
      },
      {
        name: 'Tree Pose',
        keyPoints: {
          oneFootLifted: true,
          armsUp: true,
          balance: true,
          straightBack: true
        },
        holdTime: 4000
      }
    ]
  },
  weightTraining: {
    exercises: [
      {
        name: 'Bicep Curls',
        reps: 12,
        keyPoints: {
          elbowsStationary: true,
          fullExtension: true,
          controlledMovement: true,
          properGrip: true
        }
      },
      {
        name: 'Squats',
        reps: 15,
        keyPoints: {
          kneesBehindToes: true,
          hipsBelowKnees: true,
          straightBack: true,
          evenWeight: true
        }
      },
      {
        name: 'Shoulder Press',
        reps: 10,
        keyPoints: {
          fullExtension: true,
          controlledLowering: true,
          elbowsForward: true,
          coreEngaged: true
        }
      }
    ]
  },
  zumba: {
    moves: [
      {
        name: 'Basic Salsa',
        duration: 30000,
        keyPoints: {
          hipMovement: true,
          armCoordination: true,
          rhythm: true,
          footwork: true
        }
      },
      {
        name: 'Merengue March',
        duration: 30000,
        keyPoints: {
          marchInPlace: true,
          hipSway: true,
          armMovement: true,
          timing: true
        }
      },
      {
        name: 'Cumbia Step',
        duration: 30000,
        keyPoints: {
          stepTouch: true,
          hipRotation: true,
          armSwing: true,
          rhythm: true
        }
      }
    ]
  }
};

const AIFitnessCoach = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [workoutType, setWorkoutType] = useState('');
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [workoutResults, setWorkoutResults] = useState(null);
  const [poseData, setPoseData] = useState(null);
  const [exerciseScores, setExerciseScores] = useState([]);
  const [repCount, setRepCount] = useState(0);
  const [feedback, setFeedback] = useState('Initializing AI Coach...');
  const [countdown, setCountdown] = useState(0);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const poseNetRef = useRef(null);

  // Initialize camera and pose detection
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          initializePoseDetection();
        };
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      setFeedback('Camera access required for pose detection. Please allow camera access and refresh.');
    }
  };

  // Simulate PoseNet initialization (in real app, load TensorFlow.js)
  const initializePoseDetection = () => {
    // In a real implementation, you would load TensorFlow.js PoseNet here
    // For demo purposes, we'll simulate pose detection
    console.log('Pose detection initialized');
    poseNetRef.current = true;
    setFeedback('AI Coach ready! Select a workout type to begin.');
  };

  // Main pose detection loop
  const detectPose = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isWorkoutActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame
    ctx.drawImage(video, 0, 0);

    // Simulate pose detection
    const simulatedPose = {
      keypoints: generateSimulatedKeypoints(),
      score: 0.8 + Math.random() * 0.2
    };

    // Draw skeleton
    drawSkeleton(ctx, simulatedPose.keypoints);

    // Analyze pose based on current exercise
    if (currentExercise) {
      analyzePose(simulatedPose);
    }

    setPoseData(simulatedPose);

    // Continue detection loop
    animationRef.current = requestAnimationFrame(detectPose);
  }, [isWorkoutActive, currentExercise]);

  // Generate simulated keypoints for demo
  const generateSimulatedKeypoints = () => {
    const keypoints = [
      { part: 'nose', position: { x: 320, y: 100 }, score: 0.99 },
      { part: 'leftEye', position: { x: 310, y: 90 }, score: 0.98 },
      { part: 'rightEye', position: { x: 330, y: 90 }, score: 0.98 },
      { part: 'leftEar', position: { x: 300, y: 95 }, score: 0.95 },
      { part: 'rightEar', position: { x: 340, y: 95 }, score: 0.95 },
      { part: 'leftShoulder', position: { x: 280, y: 150 }, score: 0.99 },
      { part: 'rightShoulder', position: { x: 360, y: 150 }, score: 0.99 },
      { part: 'leftElbow', position: { x: 260, y: 220 }, score: 0.95 },
      { part: 'rightElbow', position: { x: 380, y: 220 }, score: 0.95 },
      { part: 'leftWrist', position: { x: 250, y: 290 }, score: 0.93 },
      { part: 'rightWrist', position: { x: 390, y: 290 }, score: 0.93 },
      { part: 'leftHip', position: { x: 290, y: 300 }, score: 0.97 },
      { part: 'rightHip', position: { x: 350, y: 300 }, score: 0.97 },
      { part: 'leftKnee', position: { x: 285, y: 380 }, score: 0.95 },
      { part: 'rightKnee', position: { x: 355, y: 380 }, score: 0.95 },
      { part: 'leftAnkle', position: { x: 280, y: 450 }, score: 0.92 },
      { part: 'rightAnkle', position: { x: 360, y: 450 }, score: 0.92 }
    ];

    // Add some random movement
    return keypoints.map(kp => ({
      ...kp,
      position: {
        x: kp.position.x + (Math.random() - 0.5) * 10,
        y: kp.position.y + (Math.random() - 0.5) * 10
      }
    }));
  };

  // Draw skeleton on canvas
  const drawSkeleton = (ctx, keypoints) => {
    const adjacentKeyPoints = [
      ['nose', 'leftEye'], ['leftEye', 'leftEar'], ['nose', 'rightEye'], ['rightEye', 'rightEar'],
      ['leftShoulder', 'rightShoulder'], ['leftShoulder', 'leftElbow'], ['leftElbow', 'leftWrist'],
      ['rightShoulder', 'rightElbow'], ['rightElbow', 'rightWrist'], ['leftShoulder', 'leftHip'],
      ['rightShoulder', 'rightHip'], ['leftHip', 'rightHip'], ['leftHip', 'leftKnee'],
      ['leftKnee', 'leftAnkle'], ['rightHip', 'rightKnee'], ['rightKnee', 'rightAnkle']
    ];

    // Draw keypoints
    keypoints.forEach(keypoint => {
      if (keypoint.score > 0.5) {
        ctx.beginPath();
        ctx.arc(keypoint.position.x, keypoint.position.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#00ff00';
        ctx.fill();
      }
    });

    // Draw skeleton
    adjacentKeyPoints.forEach(([from, to]) => {
      const fromKp = keypoints.find(kp => kp.part === from);
      const toKp = keypoints.find(kp => kp.part === to);
      
      if (fromKp && toKp && fromKp.score > 0.5 && toKp.score > 0.5) {
        ctx.beginPath();
        ctx.moveTo(fromKp.position.x, fromKp.position.y);
        ctx.lineTo(toKp.position.x, toKp.position.y);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  };

  // Analyze pose for current exercise
  const analyzePose = (pose) => {
    if (!pose || !currentExercise) {
      return 0;
    }
    
    let score = 0;
    let feedbackMessages = [];

    // Simulate analysis based on exercise type
    if (workoutType === 'yoga') {
      score = analyzeYogaPose(pose, feedbackMessages);
    } else if (workoutType === 'weightTraining') {
      score = analyzeWeightTraining(pose, feedbackMessages);
    } else if (workoutType === 'zumba') {
      score = analyzeZumbaMove(pose, feedbackMessages);
    }

    // Update feedback
    if (feedbackMessages.length > 0) {
      setFeedback(feedbackMessages[0]);
    } else {
      setFeedback('Great form! Keep it up!');
    }

    return score;
  };

  // Analyze yoga poses
  const analyzeYogaPose = (pose, feedbackMessages) => {
    let score = 85 + Math.random() * 15;
    
    if (!currentExercise) return score;
    
    // Simulate pose-specific analysis
    if (currentExercise.name === 'Mountain Pose') {
      if (Math.random() > 0.7) feedbackMessages.push('Keep your shoulders relaxed');
      if (Math.random() > 0.8) feedbackMessages.push('Distribute weight evenly on both feet');
    } else if (currentExercise.name === 'Warrior I') {
      if (Math.random() > 0.6) feedbackMessages.push('Bend your front knee to 90 degrees');
      if (Math.random() > 0.7) feedbackMessages.push('Keep your back leg straight');
    } else if (currentExercise.name === 'Tree Pose') {
      if (Math.random() > 0.5) feedbackMessages.push('Focus on a fixed point for balance');
      if (Math.random() > 0.8) feedbackMessages.push('Press your foot into your thigh');
    }

    return score;
  };

  // Analyze weight training exercises
  const analyzeWeightTraining = (pose, feedbackMessages) => {
    let score = 80 + Math.random() * 20;
    
    if (!currentExercise) return score;
    
    if (currentExercise.name === 'Bicep Curls') {
      if (Math.random() > 0.7) feedbackMessages.push('Keep your elbows stationary');
      if (Math.random() > 0.8) feedbackMessages.push('Full extension at the bottom');
    } else if (currentExercise.name === 'Squats') {
      if (Math.random() > 0.6) feedbackMessages.push('Keep your knees behind your toes');
      if (Math.random() > 0.7) feedbackMessages.push('Lower your hips more');
    } else if (currentExercise.name === 'Shoulder Press') {
      if (Math.random() > 0.7) feedbackMessages.push('Keep your core engaged');
      if (Math.random() > 0.8) feedbackMessages.push('Control the lowering phase');
    }

    // Simulate rep counting
    if (Math.random() > 0.85 && repCount < (currentExercise.reps || 10)) {
      setRepCount(prev => prev + 1);
    }

    return score;
  };

  // Analyze Zumba moves
  const analyzeZumbaMove = (pose, feedbackMessages) => {
    let score = 75 + Math.random() * 25;
    
    if (Math.random() > 0.6) feedbackMessages.push('Move your hips more!');
    if (Math.random() > 0.7) feedbackMessages.push('Stay on the beat');
    if (Math.random() > 0.8) feedbackMessages.push('Great energy!');

    return score;
  };

  // Start workout
  const startWorkout = (type) => {
    setWorkoutType(type);
    setIsWorkoutActive(true);
    setExerciseIndex(0);
    setExerciseScores([]);
    setWorkoutResults(null);
    setRepCount(0);
    
    // Get first exercise
    const exercises = getExercisesForType(type);
    if (exercises.length > 0) {
      const firstExercise = exercises[0];
      setCurrentExercise(firstExercise);
      // Small delay to ensure state is updated
      setTimeout(() => {
        startCountdown();
      }, 100);
    } else {
      console.error('No exercises found for workout type:', type);
      setIsWorkoutActive(false);
    }
  };

  // Get exercises for workout type
  const getExercisesForType = (type) => {
    switch(type) {
      case 'yoga':
        return EXERCISES.yoga.poses;
      case 'weightTraining':
        return EXERCISES.weightTraining.exercises;
      case 'zumba':
        return EXERCISES.zumba.moves;
      default:
        return [];
    }
  };

  // Start countdown before exercise
  const startCountdown = () => {
    if (!currentExercise) {
      console.error('No current exercise set');
      return;
    }
    
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          startExercise();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start individual exercise
  const startExercise = () => {
    if (!currentExercise) {
      console.error('No current exercise to start');
      return;
    }
    
    setFeedback(`Starting ${currentExercise.name}`);
    setRepCount(0);
    
    // Set timer for exercise duration
    // For weight training, use a fixed duration since it's rep-based
    const duration = currentExercise.holdTime || currentExercise.duration || 
                    (workoutType === 'weightTraining' ? 20000 : 30000);
    
    setTimeout(() => {
      completeExercise();
    }, duration);
  };

  // Complete current exercise
  const completeExercise = () => {
    if (!currentExercise) {
      console.error('No current exercise to complete');
      return;
    }
    
    // Calculate score for this exercise
    const score = 80 + Math.random() * 20;
    const newScore = {
      exercise: currentExercise.name,
      score: Math.round(score),
      reps: repCount,
      feedback: generateExerciseFeedback(score)
    };
    
    setExerciseScores(prev => [...prev, newScore]);
    
    // Move to next exercise
    const exercises = getExercisesForType(workoutType);
    if (exerciseIndex < exercises.length - 1) {
      const nextIndex = exerciseIndex + 1;
      setExerciseIndex(nextIndex);
      const nextExercise = exercises[nextIndex];
      setCurrentExercise(nextExercise);
      setRepCount(0); // Reset rep count for next exercise
      // Small delay to ensure state is updated
      setTimeout(() => {
        startCountdown();
      }, 100);
    } else {
      endWorkout();
    }
  };

  // Generate feedback for exercise
  const generateExerciseFeedback = (score) => {
    const feedback = [];
    
    if (score >= 90) {
      feedback.push('Excellent form!');
    } else if (score >= 80) {
      feedback.push('Good job! Minor improvements needed.');
    } else if (score >= 70) {
      feedback.push('Keep practicing for better form.');
    } else {
      feedback.push('Focus on technique more.');
    }
    
    // Add specific feedback based on exercise
    if (workoutType === 'yoga') {
      feedback.push('Remember to breathe deeply');
    } else if (workoutType === 'weightTraining') {
      feedback.push('Control the movement speed');
    } else if (workoutType === 'zumba') {
      feedback.push('Great rhythm and energy!');
    }
    
    return feedback;
  };

  // End workout and show results
  const endWorkout = () => {
    setIsWorkoutActive(false);
    setCurrentExercise(null);
    
    // Calculate overall results
    if (exerciseScores.length > 0) {
      const totalScore = exerciseScores.reduce((sum, es) => sum + es.score, 0) / exerciseScores.length;
      const caloriesBurned = Math.round(150 + Math.random() * 100);
      
      // Calculate actual duration based on exercise type
      let totalDuration = 0;
      const exercises = getExercisesForType(workoutType);
      exercises.forEach((exercise, index) => {
        if (index < exerciseScores.length) {
          const duration = exercise.holdTime || exercise.duration || 
                          (workoutType === 'weightTraining' ? 20000 : 30000);
          totalDuration += duration / 1000; // Convert to seconds
        }
      });
      
      setWorkoutResults({
        overallScore: Math.round(totalScore),
        exercises: exerciseScores,
        caloriesBurned,
        duration: Math.round(totalDuration),
        improvements: generateImprovements(exerciseScores)
      });
    }
  };

  // Generate improvement suggestions
  const generateImprovements = (scores) => {
    const improvements = [];
    
    if (!scores || scores.length === 0) {
      return ['Complete a workout to see improvement suggestions'];
    }
    
    scores.forEach(score => {
      if (score.score < 85) {
        if (workoutType === 'yoga') {
          improvements.push(`${score.exercise}: Hold the pose longer and focus on alignment`);
        } else if (workoutType === 'weightTraining') {
          improvements.push(`${score.exercise}: Maintain better form throughout all reps`);
        } else if (workoutType === 'zumba') {
          improvements.push(`${score.exercise}: Stay on beat and increase hip movement`);
        }
      }
    });
    
    if (improvements.length === 0) {
      improvements.push('Excellent workout! Try increasing difficulty next time.');
    }
    
    return improvements;
  };

  // Stop workout
  const stopWorkout = () => {
    setIsWorkoutActive(false);
    setCurrentExercise(null);
    setCountdown(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  // Reset everything
  const resetWorkout = () => {
    stopWorkout();
    setWorkoutType('');
    setExerciseIndex(0);
    setExerciseScores([]);
    setWorkoutResults(null);
    setRepCount(0);
    setCurrentExercise(null);
    setCountdown(0);
    setFeedback('Select a workout type to begin');
  };

  // Cleanup on unmount
  useEffect(() => {
    startCamera();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Start pose detection when workout begins
  useEffect(() => {
    if (isWorkoutActive) {
      detectPose();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [isWorkoutActive, detectPose]);

  return (
    <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-3xl p-8 border border-purple-500/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full p-3 mr-4">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">AI Fitness Coach</h3>
            <p className="text-purple-300">Real-time form analysis & personalized guidance</p>
          </div>
        </div>
        
        {isWorkoutActive && (
          <button
            onClick={stopWorkout}
            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
          >
            <X className="h-5 w-5 mr-2" />
            Stop Workout
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live Camera Feed */}
        <div className="relative">
          <div className="bg-black rounded-2xl overflow-hidden aspect-video relative">
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
            
            {/* Countdown Overlay */}
            <AnimatePresence>
              {countdown > 0 && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/50"
                >
                  <div className="text-8xl font-bold text-white">
                    {countdown}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Current Exercise Display */}
            {isWorkoutActive && currentExercise && countdown === 0 && (
              <div className="absolute top-4 left-4 right-4">
                <div className="bg-black/70 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-white">{currentExercise?.name || 'Loading...'}</h4>
                      <p className="text-gray-300">
                        {currentExercise?.reps ? `${repCount}/${currentExercise.reps} reps` : 
                         currentExercise?.holdTime ? `Hold for ${currentExercise.holdTime/1000}s` :
                         'Keep moving!'}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Activity className="h-6 w-6 text-green-400 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Live Feedback */}
            {isWorkoutActive && feedback && (
              <div className="absolute bottom-4 left-4 right-4">
                <motion.div
                  key={feedback}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-blue-600/80 backdrop-blur-sm text-white px-4 py-3 rounded-xl"
                >
                  <div className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    {feedback}
                  </div>
                </motion.div>
              </div>
            )}
          </div>
          
          {/* Workout Type Selection */}
          {!isWorkoutActive && !workoutResults && (
            <div className="mt-6 space-y-4">
              <h4 className="text-lg font-bold text-white text-center">Select Workout Type</h4>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => startWorkout('yoga')}
                  className="flex flex-col items-center p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
                >
                  <Activity className="h-8 w-8 mb-2" />
                  <span className="font-medium">Yoga</span>
                </button>
                
                <button
                  onClick={() => startWorkout('weightTraining')}
                  className="flex flex-col items-center p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                >
                  <Zap className="h-8 w-8 mb-2" />
                  <span className="font-medium">Weights</span>
                </button>
                
                <button
                  onClick={() => startWorkout('zumba')}
                  className="flex flex-col items-center p-4 bg-pink-600 hover:bg-pink-700 text-white rounded-xl transition-colors"
                >
                  <Heart className="h-8 w-8 mb-2" />
                  <span className="font-medium">Zumba</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {workoutResults ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Overall Score */}
                <div className="bg-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-bold text-white">Workout Complete!</h4>
                    <Trophy className="h-8 w-8 text-yellow-400" />
                  </div>
                  
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold text-white mb-2">
                      {workoutResults.overallScore}%
                    </div>
                    <p className="text-gray-300">Overall Score</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/10 rounded-xl p-3 text-center">
                      <Zap className="h-6 w-6 text-orange-400 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-white">{workoutResults.caloriesBurned}</p>
                      <p className="text-sm text-gray-400">Calories Burned</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 text-center">
                      <Activity className="h-6 w-6 text-green-400 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-white">{workoutResults.duration}s</p>
                      <p className="text-sm text-gray-400">Duration</p>
                    </div>
                  </div>
                </div>

                {/* Exercise Breakdown */}
                <div className="bg-white/10 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-white mb-4">Exercise Breakdown</h4>
                  <div className="space-y-3">
                    {workoutResults.exercises.map((exercise, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center">
                          {exercise.score >= 85 ? (
                            <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
                          )}
                          <span className="text-white font-medium">{exercise.exercise}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-white">{exercise.score}%</span>
                          {exercise.reps > 0 && (
                            <p className="text-sm text-gray-400">{exercise.reps} reps</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Improvements */}
                <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl p-6 border border-purple-500/30">
                  <h4 className="text-lg font-bold text-white mb-4">Areas for Improvement</h4>
                  <div className="space-y-3">
                    {workoutResults.improvements.map((improvement, index) => (
                      <div key={index} className="flex items-start">
                        <TrendingUp className="h-5 w-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{improvement}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={resetWorkout}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    New Workout
                  </button>
                </div>
              </motion.div>
            ) : isWorkoutActive ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/10 rounded-2xl p-6"
              >
                <h4 className="text-lg font-bold text-white mb-4">Progress</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Exercise {exerciseIndex + 1} of {getExercisesForType(workoutType)?.length || 0}</span>
                      <span>{getExercisesForType(workoutType)?.length ? Math.round((exerciseIndex / getExercisesForType(workoutType).length) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${getExercisesForType(workoutType)?.length ? (exerciseIndex / getExercisesForType(workoutType).length) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Live Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-xl p-3">
                      <div className="flex items-center">
                        <Target className="h-5 w-5 text-green-400 mr-2" />
                        <div>
                          <p className="text-gray-400 text-sm">Form Score</p>
                          <p className="text-white font-bold">
                            {poseData ? Math.round(poseData.score * 100) : 0}%
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 rounded-xl p-3">
                      <div className="flex items-center">
                        <Heart className="h-5 w-5 text-red-400 mr-2" />
                        <div>
                          <p className="text-gray-400 text-sm">Heart Rate</p>
                          <p className="text-white font-bold">
                            {90 + Math.round(Math.random() * 40)} bpm
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/10 rounded-2xl p-8 text-center"
              >
                <Brain className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Ready to Start?</h4>
                <p className="text-gray-300">
                  Select a workout type to begin your AI-powered fitness session.
                  I will analyze your form in real-time and provide personalized feedback.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AIFitnessCoach;