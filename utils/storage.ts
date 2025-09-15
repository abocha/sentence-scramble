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
    const parsed = JSON.parse(data);
    if (typeof parsed.attemptsUsed !== 'number') {
      parsed.attemptsUsed = 0;
    }
    return parsed as StudentProgress;
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
