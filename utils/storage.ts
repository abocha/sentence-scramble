import type { StudentProgress } from '../types';

export const saveProgress = (key: string, data: StudentProgress): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save progress to localStorage", error);
  }
};

export const loadProgress = (key: string): StudentProgress | null => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;

    const parsed = JSON.parse(data) as StudentProgress & { summary?: any };

    if (parsed?.summary) {
      const s = parsed.summary as any;
      parsed.summary = {
        total: s.total ?? 0,
        solvedWithinMax: s.solvedWithinMax ?? s.correct ?? 0,
        firstTry: s.firstTry ?? 0,
        reveals: s.reveals ?? 0,
        avgAttempts: s.avgAttempts ?? 0,
      };
    }

    return parsed;
  } catch (error) {
    console.error("Failed to load progress from localStorage", error);
    return null;
  }
};

export const clearProgress = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to clear progress from localStorage", error);
  }
};
