// src/components/PWA/OfflineIndicator.jsx
import { motion, AnimatePresence } from 'framer-motion';

const OfflineIndicator = ({ isOnline }) => {
  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center">
            <div className="w-3 h-3 bg-white rounded-full mr-3 animate-pulse"></div>
            You are offline - Some features may be limited
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;