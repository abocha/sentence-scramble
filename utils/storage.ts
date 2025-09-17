import type { StudentProgress } from '../types';

export const saveProgress = (key: string, data: StudentProgress): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save progress to localStorage', error);
  }
};

export const loadProgress = (key: string): StudentProgress | null => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;

    const parsed = JSON.parse(data) as StudentProgress & { summary?: any; current?: any };

    const rawSummary = parsed?.summary ?? {};
    parsed.summary = {
      total: Number.isFinite(rawSummary.total) ? rawSummary.total : 0,
      solvedWithinMax: rawSummary.solvedWithinMax ?? rawSummary.correct ?? 0,
      firstTry: rawSummary.firstTry ?? 0,
      reveals: rawSummary.reveals ?? 0,
      avgAttempts: Number.isFinite(rawSummary.avgAttempts) ? rawSummary.avgAttempts : 0,
    };

    if (parsed.current) {
      parsed.current = {
        index: Number.isFinite(parsed.current.index) ? parsed.current.index : parsed.results.length,
        attemptsUsed: Number.isFinite(parsed.current.attemptsUsed) ? parsed.current.attemptsUsed : 0,
        revealed: Boolean(parsed.current.revealed),
      };
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load progress from localStorage', error);
    return null;
  }
};

export const clearProgress = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear progress from localStorage', error);
  }
};
