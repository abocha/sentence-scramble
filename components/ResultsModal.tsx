import React, { useState } from 'react';
import type { Assignment, StudentProgress } from '../types';

interface ResultsModalProps {
  assignment: Assignment;
  progress: StudentProgress;
}

const ResultsModal: React.FC<ResultsModalProps> = ({ assignment, progress }) => {
  const { summary, student, results } = progress;
  const score = `${summary.correct}/${summary.total}`;
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const generateShareText = () => {
    const items = results.map(r => {
      let status = r.ok ? '✅' : '❌';
      if (r.revealed) status += '(r)';
      return `${r.index + 1}${status}`;
    }).join(' ');

    return `Homework: ${assignment.title} (v${assignment.version})
Student: ${student.name || 'N/A'}
Result: ${score} correct (${summary.reveals} reveals)
Items: ${items}
ID: ${assignment.id.split('-')[1]}`;
  };

  const shareText = generateShareText();
  const encodedText = encodeURIComponent(shareText);

  const copyToClipboard = () => {
    if (!navigator.clipboard) {
      setCopyMessage('Clipboard not supported');
      setIsError(true);
      return;
    }

    navigator.clipboard
      .writeText(shareText)
      .then(() => {
        setCopyMessage('Results copied to clipboard!');
        setIsError(false);
      })
      .catch(() => {
        setCopyMessage('Failed to copy results');
        setIsError(true);
      });
  };

  return (
    <div className="text-center flex flex-col items-center justify-center h-full">
      <h2 className="text-3xl font-bold text-blue-600 mb-2">Homework Complete!</h2>
      <p className="text-lg text-gray-700 mb-4">Here are your results for "{assignment.title}".</p>
      
      <div className="text-5xl font-bold my-4">
        {score}
        <span className="text-2xl font-medium text-gray-600"> correct</span>
      </div>
      
      <div className="my-4 text-gray-500">
        {summary.reveals > 0 && <span>({summary.reveals} revealed)</span>}
      </div>

      <div className="flex flex-wrap gap-2 justify-center my-4">
        {results.map(r => (
          <span
            key={r.index}
            className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-white ${r.ok ? 'bg-green-500' : 'bg-red-500'}`}
            title={r.revealed ? `Sentence ${r.index + 1}: Revealed` : `Sentence ${r.index + 1}: ${r.ok ? 'Correct' : 'Incorrect'}`}
          >
            {r.index + 1}
            {r.revealed && <sup className="ml-px font-normal">R</sup>}
          </span>
        ))}
      </div>

      <div className="mt-8 w-full max-w-sm">
        <h3 className="font-semibold text-lg mb-3">Send Results to Teacher</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <button
              onClick={copyToClipboard}
              className="p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Copy Results
            </button>
            {copyMessage && (
              <p
                className={`mt-2 text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}
              >
                {copyMessage}
              </p>
            )}
          </div>
          <a
            href={`mailto:?subject=Homework Results: ${encodeURIComponent(assignment.title)}&body=${encodedText}`}
            className="p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors block"
          >
            Email
          </a>
          <a
            href={`https://wa.me/?text=${encodedText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors block"
          >
            WhatsApp
          </a>
          <a
            href={`https://t.me/share/url?url= &text=${encodedText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors block"
          >
            Telegram
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResultsModal;
