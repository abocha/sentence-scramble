import React, { useState } from 'react';
import type { Assignment, AssignmentOptions } from '../types';
import { encodeAssignmentToHash } from '../utils/encoding';
import { parseTeacherInput, splitIntoSentences } from '../utils/sentenceSplitter';

const TeacherPanel: React.FC = () => {
  const [title, setTitle] = useState('');
  const [sentences, setSentences] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [titleError, setTitleError] = useState('');
  const [sentencesError, setSentencesError] = useState('');

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

    // Default options for MVP
    const options: AssignmentOptions = {
      attempts: 'unlimited',
      hints: 'none',
      feedback: 'show-on-wrong',
      scramble: 'seeded',
      attemptsPerItem: 3,
      revealAfterMax: true,
    };

    const assignment: Assignment = {
      id: `ss-${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')}`, // e.g., ss-202509131300
      title,
      version: 1,
      seed: Math.random().toString(36).substring(2, 10), // A random seed for this assignment
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
          <label htmlFor="sentences" className="block text-sm font-medium text-gray-700">Sentences (one per line)</label>
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
          <button
            type="button"
            onClick={handleSplitSentences}
            className="mt-2 px-4 py-1 bg-gray-200 text-gray-800 rounded"
          >
            Split into sentences
          </button>
        </div>

        <div className="flex justify-between items-center flex-wrap gap-4">
            <button
                type="button"
                onClick={generateLink}
                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all transform hover:scale-105"
            >
                Generate Link
            </button>
             <a href="#practice" className="px-6 py-2 bg-gray-600 text-white font-bold rounded-lg shadow-md hover:bg-gray-700 transition-all">
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
            <button
              type="button"
              onClick={copyToClipboard}
              className="mt-4 px-6 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-all"
            >
              Copy Instructions for Student
            </button>
            {copySuccess && <p className="mt-2 text-sm text-green-700">{copySuccess}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherPanel;
