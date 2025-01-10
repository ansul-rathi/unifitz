import { useState } from 'react';
import { Copy, Plus, Share2, Trash2, Check } from 'lucide-react';

const WebPollApp = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [showAlert, setShowAlert] = useState(false);
  const [savedPolls, setSavedPolls] = useState([
    {
      id: '1',
      question: "What's for dinner tonight?",
      options: ['Pizza', 'Pasta', 'Salad'],
      date: '2025-01-09'
    }
  ]);

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (indexToRemove) => {
    setOptions(options.filter((_, index) => index !== indexToRemove));
  };

  const updateOption = (text, index) => {
    const newOptions = [...options];
    newOptions[index] = text;
    setOptions(newOptions);
  };

  const savePoll = () => {
    const newPoll = {
      id: Date.now().toString(),
      question,
      options: options.filter(opt => opt.trim()),
      date: new Date().toISOString().split('T')[0]
    };
    setSavedPolls([...savedPolls, newPoll]);
    setQuestion('');
    setOptions(['', '']);
  };

  const copyPollToClipboard = async (pollQuestion, pollOptions) => {
    const pollText = `📊 Family Poll:\n\n${pollQuestion}\n\n${pollOptions
      .filter(opt => opt.trim())
      .map((opt, idx) => `${idx + 1}. ${opt}`)
      .join('\n')}\n\nRespond with your choice number!`;
    
    try {
      await navigator.clipboard.writeText(pollText);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const reusePoll = (poll) => {
    setQuestion(poll.question);
    setOptions([...poll.options, '']);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative">
      {/* Custom Tailwind Alert */}
      {showAlert && (
        <div className="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-out translate-y-0 opacity-100">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 flex items-center shadow-lg rounded">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Poll copied to clipboard successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create Poll Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold mb-6">Create Family Poll</h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Poll Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question..."
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Options</label>
          {options.map((option, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(e.target.value, index)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              />
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(index)}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-md transition-colors duration-200"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          ))}
          
          <button
            onClick={addOption}
            className="flex items-center gap-2 mt-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <Plus size={20} />
            Add Option
          </button>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => copyPollToClipboard(question, options)}
            disabled={!question || options.filter(opt => opt.trim()).length < 2}
            className="flex-1 bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <Copy size={20} />
            Copy Poll
          </button>
          <button
            onClick={savePoll}
            disabled={!question || options.filter(opt => opt.trim()).length < 2}
            className="flex-1 bg-green-600 text-white p-3 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <Share2 size={20} />
            Save Poll
          </button>
        </div>
      </div>

      {/* Saved Polls Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Saved Polls</h2>
        <div className="space-y-4">
          {savedPolls.map((poll) => (
            <div key={poll.id} className="border rounded-md p-4 hover:shadow-md transition-shadow duration-200">
              <h3 className="font-semibold mb-2">{poll.question}</h3>
              <ul className="list-disc list-inside mb-3 text-gray-600">
                {poll.options.map((opt, idx) => (
                  <li key={idx} className="ml-4">{opt}</li>
                ))}
              </ul>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Created: {poll.date}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyPollToClipboard(poll.question, poll.options)}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50 transition-colors duration-200"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    onClick={() => reusePoll(poll)}
                    className="text-green-600 hover:text-green-800 p-2 rounded-md hover:bg-green-50 transition-colors duration-200"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WebPollApp;