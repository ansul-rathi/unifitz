import { useState, useEffect, useRef } from 'react';
import { Upload, FileText,  X, Pause, Play } from 'lucide-react';

const WhatsAppScheduler = () => {
  const [messageText, setMessageText] = useState('');
  const [messageLink, setMessageLink] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(7);
  const [logs, setLogs] = useState([]);
  const fileInputRef = useRef(null);
  const intervalRef = useRef(null);

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

  // Handle sending message to WhatsApp
  const sendWhatsAppMessage = (phoneNumber) => {
    const fullMessage = messageLink ? `${messageText}\n${messageLink}` : messageText;
    const encodedMessage = encodeURIComponent(fullMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\+/g, '')}?text=${encodedMessage}`;
    
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
          return 7;
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
      
      {/* Message Composition */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Message Text
        </label>
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          placeholder="Enter your message here..."
          disabled={isRunning}
        />
      </div>
      
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
    </div>
  );
};

export default WhatsAppScheduler;