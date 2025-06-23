
// src/components/PWA/InstallPrompt.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';

const InstallPrompt = ({ isVisible, onInstall, onDismiss }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto"
        >
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-white/20 rounded-lg p-2 mr-3">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Install UNIFITZ</h3>
                  <p className="text-white/80 text-sm">Get the app for better experience</p>
                </div>
              </div>
              <button
                onClick={onDismiss}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onInstall}
                className="flex-1 bg-white text-purple-600 font-bold py-2 px-4 rounded-lg flex items-center justify-center hover:bg-white/90 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Install
              </button>
              <button
                onClick={onDismiss}
                className="px-4 py-2 text-white/80 hover:text-white transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;