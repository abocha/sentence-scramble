import React from 'react';

interface ResumePromptProps {
  onResume: () => void;
  onStartOver: () => void;
}

const ResumePrompt: React.FC<ResumePromptProps> = ({ onResume, onStartOver }) => {
  return (
    <div className="text-center flex flex-col items-center justify-center h-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-3">Welcome Back!</h2>
      <p className="text-gray-600 mb-6">We found a previous attempt in progress. What would you like to do?</p>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onResume}
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all transform hover:scale-105"
        >
          Resume
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="px-8 py-3 bg-gray-300 text-gray-800 font-bold rounded-lg shadow-sm hover:bg-gray-400 transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

export default ResumePrompt;
