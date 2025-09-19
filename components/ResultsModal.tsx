import React, { useState } from 'react';
import type { Assignment, StudentProgress } from '../types';
import { encodeAssignmentToCompactHash } from '../utils/encoding';
import Button, { getButtonClasses } from './Button';

interface ResultsModalProps {
  assignment: Assignment;
  progress: StudentProgress;
  onStartNewAttempt?: () => void;
}

const ResultsModal: React.FC<ResultsModalProps> = ({ assignment, progress, onStartNewAttempt }) => {
  const { summary, student, results } = progress;
  const trimmedStudentName = student.name?.trim() ?? '';
  const displayStudentName = trimmedStudentName || 'N/A';
  const shareStudentName = trimmedStudentName || 'N/A';
  const solvedLine = `${summary.solvedWithinMax}/${summary.total}`;
  const firstTryLine = `${summary.firstTry}/${summary.total}`;
  const avgAttemptsValue =
    typeof summary.avgAttempts === 'number' && Number.isFinite(summary.avgAttempts)
      ? summary.avgAttempts
      : null;
  const avgAttemptsText = avgAttemptsValue !== null ? avgAttemptsValue.toFixed(2) : '0.00';
  const hasResults = results.length > 0;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const compactHash = encodeAssignmentToCompactHash(assignment);
  const compactShareUrl = compactHash && typeof window !== 'undefined'
    ? `${window.location.origin}/#C=${compactHash}`
    : '';
  const primaryShareLink = compactShareUrl || shareUrl;

  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const generateShareText = () => {
    const items = results
      .map(r => {
        const status = r.ok ? '✅' : '❌';
        const revealMarker = r.revealed ? '👀' : '';
        return `${r.index + 1}${status}${revealMarker}`;
      })
      .join(' ');

    const legend = results.some(r => r.revealed)
      ? 'Legend: ✅ correct  ❌ incorrect  👀 revealed'
      : 'Legend: ✅ correct  ❌ incorrect';

    return `Homework: ${assignment.title} (v${assignment.version})\n` +
      `Student: ${shareStudentName}\n` +
      `Solved within limit: ${solvedLine}\n` +
      `First try: ${firstTryLine}\n` +
      `Reveals: ${summary.reveals}\n` +
      `Avg attempts (solved): ${avgAttemptsText}\n` +
      `Items: ${items}\n` +
      `${legend}\n` +
      `ID: ${assignment.id}`;
  };

  const shareText = generateShareText();
  const shareTextWithLink = primaryShareLink ? `${shareText}\nLink: ${primaryShareLink}` : shareText;
  const encodedText = encodeURIComponent(shareTextWithLink);
  const telegramHref = primaryShareLink
    ? `https://t.me/share/url?url=${encodeURIComponent(primaryShareLink)}&text=${encodeURIComponent(shareText)}`
    : `https://t.me/share/url?text=${encodeURIComponent(shareText)}`;

  const copyToClipboard = () => {
    if (!navigator.clipboard) {
      setCopyMessage('Clipboard not supported');
      setIsError(true);
      return;
    }

    const textToCopy = shareTextWithLink;

    navigator.clipboard
      .writeText(textToCopy)
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
      <p className="text-lg text-gray-700 mb-2">Here are your results for "{assignment.title}".</p>
      <p className="text-md text-gray-600 mb-4">Student: {displayStudentName}</p>

      <div className="text-4xl font-bold text-gray-800 my-2">
        Solved within limit: {solvedLine}
      </div>
      <div className="text-lg text-gray-700 mb-1">
        First try: {firstTryLine}
        <span className="mx-2 text-gray-400" aria-hidden="true">|</span>
        Reveals: {summary.reveals}
      </div>
      <div className="text-sm text-gray-500 mb-4">
        Avg attempts (solved): {avgAttemptsText}
      </div>

      {hasResults ? (
        <div className="flex flex-wrap gap-3 justify-center my-6">
          {results.map(r => {
            const statusLabel = `Sentence ${r.index + 1}: ${r.ok ? 'correct' : 'incorrect'}${r.revealed ? ', revealed' : ''}`;
            return (
              <span
                key={r.index}
                className={`relative flex items-center justify-center w-12 h-12 rounded-full font-bold text-white text-lg ${r.ok ? 'bg-green-500' : 'bg-red-500'}`}
                title={r.revealed ? `Sentence ${r.index + 1}: Revealed` : `Sentence ${r.index + 1}: ${r.ok ? 'Correct' : 'Incorrect'}`}
                aria-label={statusLabel}
              >
                {r.index + 1}
                {r.revealed && (
                  <span className="absolute -top-1 right-0 text-[0.6rem] font-semibold bg-white text-red-500 rounded-full px-1 py-0.5 leading-none">
                    R
                  </span>
                )}
              </span>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500 my-4">No attempts recorded yet.</p>
      )}

      {hasResults && (
        <div className="mt-8 w-full max-w-md">
          <h3 className="font-semibold text-lg mb-3">Send Results to Teacher</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={copyToClipboard}
              variant="secondary"
              fullWidth
              className="h-full"
            >
              Copy Results
            </Button>
            <a
              href={`mailto:?subject=Homework Results: ${encodeURIComponent(assignment.title)}&body=${encodedText}`}
              className={getButtonClasses('secondary', { fullWidth: true, extra: 'h-full text-center no-underline' })}
            >
              Email
            </a>
            <a
              href={`https://wa.me/?text=${encodedText}`}
              target="_blank"
              rel="noopener noreferrer"
              className={getButtonClasses('whatsapp', { fullWidth: true, extra: 'h-full text-center no-underline' })}
            >
              WhatsApp
            </a>
            <a
              href={telegramHref}
              target="_blank"
              rel="noopener noreferrer"
              className={getButtonClasses('telegram', { fullWidth: true, extra: 'h-full text-center no-underline' })}
            >
              Telegram
            </a>
          </div>
          <div className="mt-2 min-h-[1.25rem] text-sm" aria-live="polite">
            {copyMessage && (
              <span className={isError ? 'text-red-600' : 'text-green-600'}>
                {copyMessage}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-10 w-full max-w-md flex flex-col sm:flex-row gap-3 justify-center">
        {onStartNewAttempt && (
          <Button
            onClick={onStartNewAttempt}
            variant="primary"
            fullWidth
            className="sm:w-auto"
          >
            Start New Attempt
          </Button>
        )}
        <a
          href="#practice"
          className={getButtonClasses('tertiary', { fullWidth: true, extra: 'sm:w-auto text-center no-underline' })}
        >
          Back to Practice Mode
        </a>
      </div>
    </div>
  );
};

export default ResultsModal;

