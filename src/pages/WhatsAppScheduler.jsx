import { useState, useEffect, useRef } from 'react';
import { Upload, FileText, X, Pause, Play, Copy, Check } from 'lucide-react';

const WhatsAppScheduler = () => {
  const [messageText, setMessageText] = useState('🔥 Garmi mein thakaan, laziness aur zero energy?\nTu akela nahi hai! 💪\nAajao UNIFITZ Summer Fit Squad mein –\n🏋️ Fun Zoom workouts\n🥗 Cool diet tips\n🧘 Mind-body refresh\nChalo iss garmi ko fitness wali vibe dete hain! 🔥💯');
  const [messageLink, setMessageLink] = useState('https://chat.whatsapp.com/J0pyJLdDsAuDLV9NTIrUNv');
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [logs, setLogs] = useState([]);
  const fileInputRef = useRef(null);
  const intervalRef = useRef(null);
  const [emojiPreview, setEmojiPreview] = useState(true);
  const [copied, setCopied] = useState(false);

  // Handle CSV file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target.result;
        const lines = content.split('\n');
        
        const extractedNumbers = lines
          .filter(line => line.trim())
          .map(line => line.trim())
          .filter(number => /^\+?\d+$/.test(number)); // Basic validation for phone numbers
        
        setPhoneNumbers(extractedNumbers);
        addLog(`Loaded ${extractedNumbers.length} phone numbers from CSV`);
      };
      
      reader.onerror = () => {
        addLog('Error reading file');
      };
      
      reader.readAsText(file);
    }
  };

  // Add a log entry
  const addLog = (message) => {
    setLogs(prevLogs => [
      `[${new Date().toLocaleTimeString()}] ${message}`, 
      ...prevLogs.slice(0, 49)
    ]);
  };

  // Start sending messages
  const startScheduler = () => {
    if (phoneNumbers.length === 0) {
      addLog('No phone numbers loaded. Please upload a CSV file first.');
      return;
    }

    if (!messageText.trim()) {
      addLog('Please enter a message to send.');
      return;
    }

    setIsRunning(true);
    addLog('Started sending messages');
  };

  // Stop sending messages
  const stopScheduler = () => {
    setIsRunning(false);
    addLog('Stopped sending messages');
  };

  // Reset the scheduler
  const resetScheduler = () => {
    stopScheduler();
    setCurrentIndex(0);
    setTimeLeft(15);
    addLog('Reset scheduler');
  };

  // Copy message to clipboard
  const copyMessageToClipboard = async () => {
    const fullMessage = messageLink ? `${messageText}\n\n${messageLink}` : messageText;
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addLog('Message copied to clipboard');
    } catch (err) {
      addLog('Failed to copy message');
    }
  };

  // Handle sending message to WhatsApp
  const sendWhatsAppMessage = (phoneNumber) => {
    const fullMessage = messageLink ? `${messageText}\n\n${messageLink}` : messageText;
    
    // Using the api.whatsapp.com URL format as requested
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${phoneNumber.replace(/\+/g, '')}&text=${encodeURIComponent(fullMessage)}`;
    window.open(whatsappUrl, '_blank');
    
    addLog(`Sent message to ${phoneNumber}`);
  };

  // Effect for the timer and sending messages
  useEffect(() => {
    if (!isRunning) return;

    if (currentIndex >= phoneNumbers.length) {
      addLog('Completed sending messages to all numbers');
      setIsRunning(false);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          const phoneNumber = phoneNumbers[currentIndex];
          sendWhatsAppMessage(phoneNumber);
          setCurrentIndex(prevIndex => prevIndex + 1);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, currentIndex, phoneNumbers, messageText, messageLink]);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">WhatsApp Message Scheduler</h1>
      
      {/* File Upload Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-gray-700 font-medium">Upload Phone Numbers (CSV)</label>
          <span className="text-sm text-gray-500">{phoneNumbers.length} numbers loaded</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            <Upload size={16} />
            Upload CSV
          </button>
          
          {phoneNumbers.length > 0 && (
            <button 
              onClick={() => {
                setPhoneNumbers([]);
                addLog('Cleared phone numbers');
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="flex items-center gap-2 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
            >
              <X size={16} />
              Clear
            </button>
          )}
          
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
        
        <div className="mt-2 text-sm text-gray-500">
          * CSV should contain one phone number per line (with country code)
        </div>
      </div>
      
      {/* Using api.whatsapp.com URL format */}
      <div className="mb-6">
        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <div className="flex items-center text-blue-800 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Using the Official WhatsApp API</span>
          </div>
          <p className="text-sm text-blue-600">
            Messages will be sent using the official api.whatsapp.com URL format which should handle emojis correctly.
          </p>
        </div>
      </div>
      
      {/* Message Composition */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-gray-700 font-medium">Message Text</label>
          <div className="flex items-center gap-3">
            <label className="flex items-center text-sm">
              <input 
                type="checkbox" 
                checked={emojiPreview} 
                onChange={() => setEmojiPreview(!emojiPreview)}
                className="mr-2"
              />
              Show Preview
            </label>
            <button
              onClick={copyMessageToClipboard}
              className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded text-sm"
            >
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="6"
          placeholder="Enter your message here..."
          disabled={isRunning}
        />
      </div>
      
      {emojiPreview && messageText && (
        <div className="mb-6 p-4 bg-white rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium mb-2 text-gray-700">Message Preview:</h3>
          <div className="whitespace-pre-wrap bg-green-50 p-3 rounded max-h-64 overflow-y-auto">
            {messageText}
            {messageLink && (
              <div className="mt-2 text-blue-600 underline break-all">{messageLink}</div>
            )}
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Link (Optional)
        </label>
        <input
          type="text"
          value={messageLink}
          onChange={(e) => setMessageLink(e.target.value)}
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com"
          disabled={isRunning}
        />
      </div>
      
      {/* Control Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          {!isRunning ? (
            <button
              onClick={startScheduler}
              disabled={phoneNumbers.length === 0 || !messageText.trim()}
              className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Play size={16} />
              Start
            </button>
          ) : (
            <button
              onClick={stopScheduler}
              className="flex items-center gap-2 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
            >
              <Pause size={16} />
              Pause
            </button>
          )}
          
          <button
            onClick={resetScheduler}
            className="flex items-center gap-2 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
            disabled={isRunning}
          >
            <X size={16} />
            Reset
          </button>
        </div>
        
        <div className="text-center">
          {isRunning && (
            <div className="text-xl font-mono">
              <span className="mr-2">Next message in:</span>
              <span className="font-bold">{timeLeft}s</span>
            </div>
          )}
          <div className="text-sm text-gray-500">
            {currentIndex}/{phoneNumbers.length} sent
          </div>
        </div>
      </div>
      
      {/* Logs Section */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
          <FileText size={18} />
          Activity Log
        </h3>
        <div className="bg-gray-900 text-gray-200 p-3 rounded h-48 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <div className="text-gray-500 italic">No activity yet</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))
          )}
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-500 text-center">
        <p>💡 Tip: If emojis are not displaying correctly, try using the Copy button and paste manually into WhatsApp</p>
      </div>
    </div>
  );
};

export default WhatsAppScheduler;