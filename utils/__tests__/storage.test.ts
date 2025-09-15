import { describe, it, expect, vi } from 'vitest';
import { saveProgress, loadProgress, clearProgress } from '../storage';
import type { StudentProgress } from '../../types';

describe('saveProgress', () => {
  const key = 'progress';
  const progress: StudentProgress = {
    assignmentId: 'a1',
    version: 1,
    student: { name: 'Alice' },
    summary: { total: 1, solvedWithinMax: 0, firstTry: 0, reveals: 0, avgAttempts: 0 },
    results: []
  };

  it('saves data to localStorage', () => {
    const setItem = vi.fn();
    (globalThis as any).localStorage = { setItem };
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    saveProgress(key, progress);

    expect(setItem).toHaveBeenCalledWith(key, JSON.stringify(progress));
    expect(errorSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
    delete (globalThis as any).localStorage;
  });

  it('logs error when localStorage throws', () => {
    const setItem = vi.fn(() => { throw new Error('fail'); });
    (globalThis as any).localStorage = { setItem };
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    saveProgress(key, progress);

    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
    delete (globalThis as any).localStorage;
  });
});

describe('loadProgress', () => {
  const key = 'progress';
  const progress: StudentProgress = {
    assignmentId: 'a1',
    version: 1,
    student: { name: 'Alice' },
    summary: { total: 1, solvedWithinMax: 0, firstTry: 0, reveals: 0, avgAttempts: 0 },
    results: []
  };

  it('loads data from localStorage', () => {
    const getItem = vi.fn(() => JSON.stringify(progress));
    (globalThis as any).localStorage = { getItem };
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = loadProgress(key);

    expect(getItem).toHaveBeenCalledWith(key);
    expect(result).toEqual(progress);
    expect(errorSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
    delete (globalThis as any).localStorage;
  });

  it('returns null and logs error on failure', () => {
    const getItem = vi.fn(() => 'not-json');
    (globalThis as any).localStorage = { getItem };
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = loadProgress(key);

    expect(result).toBeNull();
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
    delete (globalThis as any).localStorage;
  });
});

describe('clearProgress', () => {
  const key = 'progress';

  it('removes data from localStorage', () => {
    const removeItem = vi.fn();
    (globalThis as any).localStorage = { removeItem };
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    clearProgress(key);

    expect(removeItem).toHaveBeenCalledWith(key);
    expect(errorSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
    delete (globalThis as any).localStorage;
  });

  it('logs error when localStorage throws', () => {
    const removeItem = vi.fn(() => { throw new Error('fail'); });
    (globalThis as any).localStorage = { removeItem };
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    clearProgress(key);

    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
    delete (globalThis as any).localStorage;
  });
});

