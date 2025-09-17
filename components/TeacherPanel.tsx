import React, { useState } from 'react';
import type { Assignment, AssignmentOptions } from '../types';
import { encodeAssignmentToHash } from '../utils/encoding';
import { parseTeacherInput, splitIntoSentences } from '../utils/sentenceSplitter';
import Button, { getButtonClasses } from './Button';

const buildOptions = (
  attempts: string,
  revealAfterMaxAttempts: boolean,
): AssignmentOptions => {
  const attemptsSetting = attempts === 'unlimited' ? 'unlimited' : parseInt(attempts, 10);

  return {
    attemptsPerItem: attemptsSetting,
    revealAfterMax: revealAfterMaxAttempts,
    revealAnswerAfterMaxAttempts: revealAfterMaxAttempts,
    hints: 'none',
    feedback: 'show-on-wrong',
    scramble: 'seeded',
  };
};

const TeacherPanel: React.FC = () => {
  const [title, setTitle] = useState('');
  const [sentences, setSentences] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [titleError, setTitleError] = useState('');
  const [sentencesError, setSentencesError] = useState('');
  const [attemptsPerItem, setAttemptsPerItem] = useState('3');
  const [revealAfterMaxAttempts, setRevealAfterMaxAttempts] = useState(true);

  const handleSplitSentences = () => {
    const lines = splitIntoSentences(sentences);
    setSentences(lines.join('\n'));
  };

  const generateLink = () => {
    const sentenceArray = parseTeacherInput(sentences);

    let hasError = false;
    if (!title.trim()) {
      setTitleError('Please provide a title.');
      hasError = true;
    } else {
      setTitleError('');
    }

    if (!sentences.trim()) {
      setSentencesError('Please provide at least one sentence.');
      hasError = true;
    } else if (sentenceArray.length === 0) {
      setSentencesError('Please provide at least one valid sentence.');
      hasError = true;
    } else {
      setSentencesError('');
    }

    if (hasError) return;

    const options: AssignmentOptions = buildOptions(attemptsPerItem, revealAfterMaxAttempts);

    const assignment: Assignment = {
      id: `ss-${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')}`,
      title,
      version: 1,
      seed: Math.random().toString(36).substring(2, 10),
      options,
      sentences: sentenceArray,
    };

    const hash = encodeAssignmentToHash(assignment);
    const base = window.location.href.split('#')[0];
    const link = `${base}#A=${hash}`;
    setGeneratedLink(link);
    setCopySuccess('');
  };

  const copyToClipboard = () => {
    if (!generatedLink) return;
    const instructions = `Homework: ${title}\n\nLink: ${generatedLink}\n\nInstructions: Build each sentence. When you are done, tap 'Finish' and send the results back to me.`;
    navigator.clipboard.writeText(instructions).then(() => {
      setCopySuccess('Instructions copied to clipboard!');
    }, () => {
      setCopySuccess('Failed to copy.');
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8 mt-6">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Teacher Panel</h2>
        <p className="text-gray-500 mt-1">Create a new homework assignment.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Assignment Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError('');
            }}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., Adverbs of Frequency"
          />
          {titleError && <p className="mt-1 text-sm text-red-600">{titleError}</p>}
        </div>

        <div>
          <label htmlFor="sentences" className="block text-sm font-medium text-gray-700">Sentences</label>
          <p className="text-sm text-gray-500 mt-1">One sentence per line. Or paste a paragraph and click Split into sentences.</p>
          <textarea
            id="sentences"
            rows={10}
            value={sentences}
            onChange={(e) => {
              setSentences(e.target.value);
              if (sentencesError) setSentencesError('');
            }}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="The quick brown fox jumps over the lazy dog.&#10;She sells seashells by the seashore."
          />
          {sentencesError && <p className="mt-1 text-sm text-red-600">{sentencesError}</p>}
          <Button
            onClick={handleSplitSentences}
            variant="neutral"
            fullWidth
            className="mt-2 sm:w-auto px-4 py-2 text-sm font-semibold"
          >
            Split into sentences
          </Button>
        </div>

        <div>
          <label htmlFor="attempts-per-item" className="block text-sm font-medium text-gray-700">Attempts per item</label>
          <select
            id="attempts-per-item"
            value={attemptsPerItem}
            onChange={(e) => setAttemptsPerItem(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="unlimited">Unlimited</option>
          </select>
          <label className="mt-2 inline-flex items-center">
            <input
              type="checkbox"
              checked={revealAfterMaxAttempts}
              onChange={(e) => setRevealAfterMaxAttempts(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">Reveal answer after max attempts</span>
          </label>
        </div>

        <div className="flex justify-between items-center flex-wrap gap-4">
          <Button
            onClick={generateLink}
            variant="primary"
            fullWidth
            className="sm:w-auto"
          >
            Generate Link
          </Button>
          <a
            href="#practice"
            className={getButtonClasses('secondary', { fullWidth: true, extra: 'sm:w-auto text-center' })}
          >
            Back to Practice
          </a>
        </div>

        {generatedLink && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-semibold">Generated Link:</h3>
            <input
              type="text"
              readOnly
              value={generatedLink}
              className="w-full p-2 mt-2 bg-white border rounded"
              onFocus={(e) => e.target.select()}
            />
            <Button
              onClick={copyToClipboard}
              variant="success"
              fullWidth
              className="mt-4 sm:w-auto"
            >
              Copy Instructions for Student
            </Button>
            <div className="mt-2 min-h-[1.25rem] text-sm" aria-live="polite">
              {copySuccess && (
                <span className="text-green-700">{copySuccess}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherPanel;
