import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SENTENCES as defaultSentences } from './constants/sentences';
import type { Word, Feedback, Assignment, StudentProgress, Result, SentenceWithOptions } from './types';
import Header from './components/Header';
import DropZone from './components/DropZone';
import SpinnerIcon from './components/icons/SpinnerIcon';
import TeacherPanel from './components/TeacherPanel';
import ResultsModal from './components/ResultsModal';
import ResumePrompt from './components/ResumePrompt';

import { parseAssignmentFromHash } from './utils/encoding';
import TeacherApp from './components/TeacherApp';
import GameApp from './components/GameApp';

export type AppMode = 'practice' | 'homework' | 'teacher';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('practice');
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#A=')) {
        const payload = hash.substring(3);
        const loadedAssignment = parseAssignmentFromHash(payload);
        if (loadedAssignment) {
          setAssignment(loadedAssignment);
          setMode('homework');
        }
      } else if (hash === '#teacher') {
        setMode('teacher');
        setAssignment(null);
      } else {
        setAssignment(null);
        setMode('practice');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
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
  }, [mode, assignment]);
  // --- Core Game Logic & State Setup ---
  // Prepare the list of sentences, ensuring each entry conforms to SentenceWithOptions
  const sentences = useMemo<SentenceWithOptions[]>(() => assignment?.sentences ?? defaultSentences.map(s => ({ text: s })), [assignment]);
  const correctSentenceText = useMemo(() => sentences[currentSentenceIndex]?.text, [sentences, currentSentenceIndex]);

  /**
   * Initialize game state for a new sentence by tokenizing and scrambling
   * the sentence into draggable word objects.
   */
  const setupNewSentence = useCallback((index: number = currentSentenceIndex) => {
    setIsLoading(true);
    setFeedback(null);
    setUserSentence([]);

    setTimeout(() => {
      const sentenceConf = sentences[index];
      if (!sentenceConf) return;

      const words = tokenizeSentence(sentenceConf.text, sentenceConf.lock);
      const wordObjects = words.map((text, i) => ({
        id: `${i}-${text}`,
        text,
      }));

      const seed = assignment?.seed || 'default';
      const scrambleType = assignment?.options?.scramble || 'seeded';
      const finalWords = scrambleType === 'seeded' 
        ? seededShuffle(wordObjects, `${seed}-${index}`) 
        : wordObjects.sort(() => Math.random() - 0.5);

      setAvailableWords(finalWords);
      setIsLoading(false);
    }, 300);
  }, [sentences, currentSentenceIndex, assignment]);

  useEffect(() => {
    if (mode === 'practice' || (mode === 'homework' && progress)) {
      setupNewSentence(currentSentenceIndex);
    }
  }, [currentSentenceIndex, setupNewSentence, mode, progress]);

  const startNewAttempt = () => {
    const initialProgress = { 
      assignmentId: assignment!.id,
      version: assignment!.version,
      student: { name: studentName },
      summary: { correct: 0, total: assignment!.sentences.length, reveals: 0 },
      results: [] 
    };
    setProgress(initialProgress);
    setCurrentSentenceIndex(0);
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
    if (sourceZoneId === 'available-words') {
      setAvailableWords(prev => prev.filter(w => w.id !== wordId));
      setUserSentence(prev => [...prev, word]);
    } else {
      setUserSentence(prev => prev.filter(w => w.id !== wordId));
      setAvailableWords(prev => [...prev, word]);
    }
  };

  const handleUndo = () => {
    if (userSentence.length === 0) return;
    const lastWord = userSentence[userSentence.length - 1];
    setUserSentence(prev => prev.slice(0, -1));
    setAvailableWords(prev => [...prev, lastWord]);
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
    const userAnswer = userSentence.map(w => w.text).join(' ').trim();
    const isCorrect = userAnswer === correctSentenceText;
    
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
    // Debounced save could be better, but this is fine for MVP
    localStorage.setItem('ss::studentName', newName); 
    setStudentName(newName);
  };
  
  // --- Render Logic ---

  if (mode === 'teacher') {
    return <TeacherApp />;
  }

  return <GameApp mode={mode} assignment={assignment} />;
};

export default App;
