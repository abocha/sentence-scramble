import { useEffect, useMemo, useRef, useState } from 'react';

import { SHARE_HISTORY_LIMIT } from '../../constants/teacher';
import type { ShareHistoryEntry, TeacherFeedbackMessage } from '../../types';
import { cloneHistoryEntries } from '../../utils/teacherAssignment';
import { loadShareHistory, saveShareHistory } from '../../utils/teacherStorage';

export interface UseShareHistoryResult {
  history: ShareHistoryEntry[];
  filteredHistory: ShareHistoryEntry[];
  isLoaded: boolean;
  historyFeedback: TeacherFeedbackMessage | null;
  setHistoryFeedback: (feedback: TeacherFeedbackMessage | null) => void;
  historySearchQuery: string;
  setHistorySearchQuery: (value: string) => void;
  addEntry: (entry: ShareHistoryEntry) => void;
  removeEntry: (id: string, createdAt: string) => void;
  clearHistory: () => boolean;
  undoClear: () => void;
}

export const useShareHistory = (): UseShareHistoryResult => {
  const [history, setHistory] = useState<ShareHistoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [historyFeedback, setHistoryFeedback] = useState<TeacherFeedbackMessage | null>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const lastClearedRef = useRef<ShareHistoryEntry[] | null>(null);

  useEffect(() => {
    const historyEntries = loadShareHistory();
    if (historyEntries.length > 0) {
      setHistory(historyEntries);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    saveShareHistory(history);
  }, [history, isLoaded]);

  const undoClear = () => {
    const snapshot = lastClearedRef.current;
    if (!snapshot || snapshot.length === 0) {
      setHistoryFeedback({ text: 'Nothing to restore.', tone: 'error' });
      return;
    }

    setHistory(cloneHistoryEntries(snapshot));
    lastClearedRef.current = null;
    setHistoryFeedback({ text: 'Recent shares restored.', tone: 'success' });
  };

  const clearHistory = () => {
    if (history.length === 0) {
      setHistoryFeedback({ text: 'No recent shares to clear.', tone: 'error' });
      return false;
    }

    const snapshot = cloneHistoryEntries(history);
    lastClearedRef.current = snapshot;
    setHistory([]);
    setHistorySearchQuery('');
    setHistoryFeedback({
      text: 'Recent shares cleared.',
      tone: 'success',
      actionLabel: 'Undo',
      onAction: undoClear,
    });
    return true;
  };

  const addEntry = (entry: ShareHistoryEntry) => {
    setHistory((prev) => {
      const next = [entry, ...prev];
      return next.slice(0, SHARE_HISTORY_LIMIT);
    });
    lastClearedRef.current = null;
    setHistoryFeedback(null);
  };

  const removeEntry = (id: string, createdAt: string) => {
    setHistory((prev) => prev.filter((entry) => !(entry.id === id && entry.createdAt === createdAt)));
    setHistoryFeedback({ text: 'Removed from recent shares.', tone: 'success' });
    if (lastClearedRef.current) {
      lastClearedRef.current = lastClearedRef.current.filter(
        (entry) => !(entry.id === id && entry.createdAt === createdAt),
      );
    }
  };

  const normalizedHistorySearch = useMemo(() => (
    historySearchQuery.trim().toLowerCase()
  ), [historySearchQuery]);

  const filteredHistory = useMemo(() => {
    if (!normalizedHistorySearch) return history;
    return history.filter((entry) => {
      const haystack = [
        entry.id,
        entry.title,
        entry.sentences.join(' '),
        entry.instructions,
      ].join(' ').toLowerCase();
      return haystack.includes(normalizedHistorySearch);
    });
  }, [history, normalizedHistorySearch]);

  return {
    history,
    filteredHistory,
    isLoaded,
    historyFeedback,
    setHistoryFeedback,
    historySearchQuery,
    setHistorySearchQuery,
    addEntry,
    removeEntry,
    clearHistory,
    undoClear,
  };
};

export type UseShareHistoryReturn = ReturnType<typeof useShareHistory>;
