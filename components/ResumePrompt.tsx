import React from 'react';
import Button from './Button';

interface ResumePromptProps {
  onResume: () => void;
  onStartOver: () => void;
}

const ResumePrompt: React.FC<ResumePromptProps> = ({ onResume, onStartOver }) => {
  return (
    <div className="text-center flex flex-col items-center justify-center h-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-3">Welcome Back!</h2>
      <p className="text-gray-600 mb-6">We found a previous attempt in progress. What would you like to do?</p>
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Button
          onClick={onResume}
          variant="primary"
          fullWidth
        >
          Resume
        </Button>
        <Button
          onClick={onStartOver}
          variant="tertiary"
          fullWidth
        >
          Start Over
        </Button>
      </div>
    </div>
  );
};

export default ResumePrompt;
