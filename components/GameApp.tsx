import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { SENTENCES as defaultSentences } from '../constants/sentences';
import type { Word, Feedback, Assignment, StudentProgress, Result, SentenceWithOptions } from '../types';
import Header from './Header';
import DropZone from './DropZone';
import SpinnerIcon from './icons/SpinnerIcon';
import ResultsModal from './ResultsModal';
import ResumePrompt from './ResumePrompt';
import { tokenizeSentence } from '../utils/tokenization';
import { seededShuffle } from '../utils/prng';
import { saveProgress, loadProgress } from '../utils/storage';
import { chunkSentence } from '../utils/chunking';

const HISTORY_LIMIT = 50;

interface GameAppProps {
  mode: 'practice' | 'homework';
  assignment: Assignment | null;
}

const GameApp: React.FC<GameAppProps> = ({ mode, assignment }) => {
  // Homework-specific state
  const [studentName, setStudentName] = useState('');
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Game state (used by both modes)
  const [isLoading, setIsLoading] = useState(true);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [availableWords, setAvailableWords] = useState<Word[]>([]);
  const [userSentence, setUserSentence] = useState<Word[]>([]);
  const [isChunkMode, setIsChunkMode] = useState(false);
  const [currentChunks, setCurrentChunks] = useState<string[] | null>(null);
  const [history, setHistory] = useState<Array<{ available: Word[]; sentence: Word[] }>>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Effects for Initialization and Mode Switching ---
  useEffect(() => {
    // Reset any leftover state when switching assignments or modes
    setShowResults(false);
    setShowResumePrompt(false);
    setProgress(null);
    setCurrentSentenceIndex(0);

    if (mode === 'homework' && assignment) {
      const savedName = localStorage.getItem('ss::studentName') || '';
      setStudentName(savedName);
      const storageKey = `ss::${assignment.id}::${savedName}`;
      const savedProgress = loadProgress(storageKey);
      if (savedProgress && savedProgress.results.length > 0) {
        setProgress(savedProgress);
        setShowResumePrompt(true);
      } else {
        startNewAttempt();
      }
    } else if (mode === 'practice') {
      setupNewSentence();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, assignment]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // --- Core Game Logic & State Setup ---
  const sentences = useMemo<SentenceWithOptions[]>(() => assignment?.sentences ?? defaultSentences.map(s => ({ text: s })), [assignment]);
  const correctSentenceText = useMemo(() => sentences[currentSentenceIndex]?.text, [sentences, currentSentenceIndex]);

  const setupNewSentence = useCallback((index: number = currentSentenceIndex) => {
    setIsLoading(true);
    setFeedback(null);
    setUserSentence([]);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const sentenceConf = sentences[index];
      if (!sentenceConf) return;

      const seed = assignment?.seed || 'default';
      const scrambleType = assignment?.options?.scramble || 'seeded';

      let chunks: string[] | null = null;
      if (sentenceConf.chunks && sentenceConf.chunks.length > 3) {
        chunks = sentenceConf.chunks;
      } else {
        const tokens = tokenizeSentence(sentenceConf.text, sentenceConf.lock);
        if (tokens.length > 12) {
          const autoChunks = chunkSentence(sentenceConf.text);
          if (autoChunks.length > 3) {
            chunks = autoChunks;
          }
        }
      }

      if (chunks) {
        setIsChunkMode(true);
        setCurrentChunks(chunks);

        const wordObjects = chunks.map((text, i) => ({ id: `${i}-${text}`, text }));
        const finalWords = scrambleType === 'seeded'
          ? seededShuffle(wordObjects, `${seed}-${index}`)
          : wordObjects.sort(() => Math.random() - 0.5);

        setAvailableWords(finalWords);
        setUserSentence([]);
      } else {
        setIsChunkMode(false);
        setCurrentChunks(null);

        const words = tokenizeSentence(sentenceConf.text, sentenceConf.lock);
        const wordObjects = words.map((text, i) => ({
          id: `${i}-${text}`,
          text,
        }));

        const finalWords = scrambleType === 'seeded'
          ? seededShuffle(wordObjects, `${seed}-${index}`)
          : wordObjects.sort(() => Math.random() - 0.5);

        setAvailableWords(finalWords);
        setUserSentence([]);
      }

      setIsLoading(false);
    }, 300);
  }, [sentences, currentSentenceIndex, assignment]);

  useEffect(() => {
    if (mode === 'practice' || (mode === 'homework' && progress)) {
      setupNewSentence(currentSentenceIndex);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSentenceIndex, setupNewSentence, mode]);

  const startNewAttempt = () => {
    if (!assignment) return;
    const initialProgress = {
      assignmentId: assignment.id,
      version: assignment.version,
      student: { name: studentName },
      summary: { correct: 0, total: assignment.sentences.length, reveals: 0 },
      results: []
    };
    setProgress(initialProgress);
    setCurrentSentenceIndex(0);
    setupNewSentence(0);
    setShowResumePrompt(false);
  };

  const resumeAttempt = () => {
    if (!progress) return;
    const lastCompletedIndex = progress.results.length - 1;
    const nextIndex = lastCompletedIndex + 1;
    if (nextIndex >= sentences.length) {
      setShowResults(true);
    } else {
      setCurrentSentenceIndex(nextIndex);
    }
    setShowResumePrompt(false);
  };

  // --- Word Movement Handlers (DND & Click) ---
  const findWordById = (id: string): Word | undefined => {
    return availableWords.find(w => w.id === id) || userSentence.find(w => w.id === id);
  };

  const handleDrop = (wordId: string, sourceZoneId: string, targetZoneId: string, targetIndex?: number) => {
    const wordToMove = findWordById(wordId);
    if (!wordToMove) return;

    const firstId = isChunkMode && currentChunks ? `0-${currentChunks[0]}` : null;
    const lastId = isChunkMode && currentChunks ? `${currentChunks.length - 1}-${currentChunks[currentChunks.length - 1]}` : null;
    const firstPlaced = firstId ? userSentence.some(w => w.id === firstId) : false;
    const lastPlaced = lastId ? userSentence.some(w => w.id === lastId) : false;
    if (isChunkMode) {
      if (sourceZoneId === 'user-sentence' && (wordId === firstId || wordId === lastId)) {
        return;
      }
      if (targetZoneId === 'user-sentence') {
        if (targetIndex === undefined) {
          targetIndex = userSentence.length;
        }
        if (firstPlaced && targetIndex === 0 && wordId !== firstId) {
          targetIndex = 1;
        }
        if (lastPlaced) {
          const lastIdx = userSentence.findIndex(w => w.id === lastId);
          if (targetIndex > lastIdx) {
            targetIndex = lastIdx;
          }
        }
      }
    }

    setHistory(prev => {
      const newHistory = [...prev, { available: [...availableWords], sentence: [...userSentence] }];
      return newHistory.length > HISTORY_LIMIT ? newHistory.slice(1) : newHistory;
    });

    if (sourceZoneId === 'available-words' && targetZoneId === 'user-sentence') {
      setAvailableWords(prev => prev.filter(w => w.id !== wordId));
      setUserSentence(prev => {
        const newSentence = [...prev];
        newSentence.splice(targetIndex ?? newSentence.length, 0, wordToMove);
        return newSentence;
      });
    } else if (sourceZoneId === 'user-sentence' && targetZoneId === 'available-words') {
      setUserSentence(prev => prev.filter(w => w.id !== wordId));
      setAvailableWords(prev => [...prev, wordToMove]);
    } else if (sourceZoneId === 'user-sentence' && targetZoneId === 'user-sentence') {
      setUserSentence(prev => {
        const originalList = prev.filter(w => w.id !== wordId);
        originalList.splice(targetIndex ?? originalList.length, 0, wordToMove);
        return originalList;
      });
    }
    setIsDragging(false);
  };

  const handleWordClick = (wordId: string, sourceZoneId: string) => {
    const word = findWordById(wordId);
    if (!word) return;

     if (isChunkMode && sourceZoneId === 'user-sentence' && currentChunks) {
       const firstId = `0-${currentChunks[0]}`;
       const lastId = `${currentChunks.length - 1}-${currentChunks[currentChunks.length - 1]}`;
       if (wordId === firstId || wordId === lastId) return;
     }

    setHistory(prev => {
      const newHistory = [...prev, { available: [...availableWords], sentence: [...userSentence] }];
      return newHistory.length > HISTORY_LIMIT ? newHistory.slice(1) : newHistory;
    });
    if (sourceZoneId === 'available-words') {
      setAvailableWords(prev => prev.filter(w => w.id !== wordId));
      setUserSentence(prev => {
        if (isChunkMode && currentChunks) {
          const firstId = `0-${currentChunks[0]}`;
          const lastId = `${currentChunks.length - 1}-${currentChunks[currentChunks.length - 1]}`;
          if (wordId === firstId) {
            return [word, ...prev];
          }
          const lastIndex = prev.findIndex(w => w.id === lastId);
          if (lastIndex !== -1) {
            const beforeLast = [...prev];
            beforeLast.splice(lastIndex, 0, word);
            return beforeLast;
          }
        }
        return [...prev, word];
      });
    } else {
      setUserSentence(prev => prev.filter(w => w.id !== wordId));
      setAvailableWords(prev => [...prev, word]);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastSnapshot = history[history.length - 1];
    setAvailableWords([...lastSnapshot.available]);
    setUserSentence([...lastSnapshot.sentence]);
    setHistory(prev => prev.slice(0, -1));
  };

  // --- Answer Checking & Progression ---
  const updateProgress = (result: Result) => {
    if (!progress || !assignment) return;
    const newProgress: StudentProgress = {
      ...progress,
      results: [...progress.results, result],
      summary: {
        ...progress.summary,
        correct: progress.summary.correct + (result.ok ? 1 : 0),
        reveals: progress.summary.reveals + (result.revealed ? 1 : 0)
      }
    };
    setProgress(newProgress);
    const storageKey = `ss::${assignment.id}::${studentName}`;
    saveProgress(storageKey, newProgress);
  };

  const handleCheckAnswer = () => {
    let isCorrect = false;

    if (isChunkMode && currentChunks) {
      const userChunks = userSentence.map(w => w.text.trim().toLowerCase());
      const target = currentChunks.map(c => c.trim().toLowerCase());
      isCorrect = userChunks.join('|') === target.join('|');
    } else {
      const userAnswer = userSentence.map(w => w.text).join(' ').trim();
      isCorrect = userAnswer === correctSentenceText;
    }

    if (mode === 'homework') {
      updateProgress({ index: currentSentenceIndex, ok: isCorrect, revealed: false });
    }

    setFeedback({
      type: isCorrect ? 'success' : 'error',
      message: isCorrect ? 'Correct! Well done!' : `Not quite. The correct answer is: "${correctSentenceText}"`,
    });
  };

  const handleReveal = () => {
    if (mode === 'homework') {
      updateProgress({ index: currentSentenceIndex, ok: false, revealed: true });
    }
    setFeedback({ type: 'error', message: `The correct answer is: "${correctSentenceText}"` });
  };

  const handleNext = () => {
    const nextIndex = currentSentenceIndex + 1;
    if (nextIndex < sentences.length) {
      setCurrentSentenceIndex(nextIndex);
    } else {
      if (mode === 'homework') {
        setShowResults(true);
      } else { // Practice mode loop
        setCurrentSentenceIndex(0);
      }
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    localStorage.setItem('ss::studentName', newName);
    setStudentName(newName);
  };

  const renderGameContent = () => (
    <>
      {isLoading ? (
        <div className="flex-grow flex items-center justify-center">
          <SpinnerIcon />
        </div>
      ) : (
        <div className="flex flex-col gap-6 flex-grow">
          <DropZone id="available-words" words={availableWords} title="Available Words" onDrop={(wordId, sourceZoneId) => handleDrop(wordId, sourceZoneId, 'available-words')} onWordClick={(wordId) => handleWordClick(wordId, 'available-words')} isDragging={isDragging} setIsDragging={setIsDragging} />
          <DropZone id="user-sentence" words={userSentence} title="Your Sentence" onDrop={(wordId, sourceZoneId, index) => handleDrop(wordId, sourceZoneId, 'user-sentence', index)} onWordClick={(wordId) => handleWordClick(wordId, 'user-sentence')} isDragging={isDragging} setIsDragging={setIsDragging} isSentenceZone={true} />

          {feedback && (
            <div className={`mt-4 p-4 rounded-lg text-center font-semibold text-white ${feedback.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
              {feedback.message}
            </div>
          )}

          <div className="mt-auto pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
            {!feedback ? (
              <>
                {mode === 'homework' && (
                  <>
                    <button type="button" onClick={handleUndo} className="w-full sm:w-auto px-6 py-3 bg-gray-500 text-white font-bold rounded-lg shadow-md hover:bg-gray-600 transition-colors">Undo</button>
                    <button type="button" onClick={() => setupNewSentence()} className="w-full sm:w-auto px-6 py-3 bg-yellow-500 text-white font-bold rounded-lg shadow-md hover:bg-yellow-600 transition-colors">Reset</button>
                  </>
                )}
                <button type="button" onClick={handleCheckAnswer} disabled={userSentence.length === 0} className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 transition-all transform hover:scale-105">Check Answer</button>
                {mode === 'homework' && (
                  <button type="button" onClick={handleReveal} className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition-colors">Reveal</button>
                )}
              </>
            ) : (
              <button type="button" onClick={handleNext} className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-all transform hover:scale-105">
                {currentSentenceIndex < sentences.length - 1 ? 'Next Sentence' : (mode === 'homework' ? 'Finish & See Results' : 'Next Sentence')}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen font-sans text-gray-800 flex flex-col items-center p-4 sm:p-6 md:p-8 bg-gray-100">
      <Header title={assignment?.title} version={assignment?.version} />
      <main className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8 mt-6 flex flex-col flex-grow">
        {mode === 'homework' && !progress && !showResumePrompt && <div className="flex-grow flex items-center justify-center"><SpinnerIcon /></div>}
        {showResumePrompt && <ResumePrompt onResume={resumeAttempt} onStartOver={startNewAttempt} />}
        {mode === 'homework' && progress && showResults && assignment && <ResultsModal assignment={assignment} progress={progress} />}

        {(!showResumePrompt && !showResults) && (
          <>
            {mode === 'homework' ? (
              <div className="mb-6">
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">Your Name</label>
                <input
                  type="text"
                  id="studentName"
                  value={studentName}
                  onChange={handleNameChange}
                  placeholder="Enter your name to save progress"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            ) : (
              <>
                <h2 className="text-xl md:text-2xl font-bold text-center text-blue-600 mb-2">Unscramble the Sentence</h2>
                <p className="text-center text-gray-500 mb-6">Drag words into the box to form a correct sentence. Or click the \"Teacher Panel\" button to create homework.</p>
                <div className="text-center mb-6">
                  <a href="#teacher" className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-all">
                    Go to Teacher Panel
                  </a>
                </div>
              </>
            )}
            {((mode === 'practice') || (mode === 'homework' && progress)) && renderGameContent()}
          </>
        )}
      </main>
      <footer className="text-center mt-8 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Sentence Scramble. Happy Learning!</p>
      </footer>
    </div>
  );
};

export default GameApp;
