// src/components/UI/LoadingSpinner.jsx
import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-violet-900">
      <div className="text-center">
        <motion.div
          className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.p
          className="text-white text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Loading your fitness journey...
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingSpinner;