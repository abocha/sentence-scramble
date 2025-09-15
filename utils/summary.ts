import type { Result, Summary } from '../types';

export const computeSummary = (results: Result[]): Summary => {
  const total = results.length;
  const solvedResults = results.filter(r => r.ok);
  const solved = solvedResults.length;
  const firstTry = solvedResults.filter(r => r.attempts === 1).length;
  const reveals = results.filter(r => r.revealed).length;
  const avgAttempts = solved > 0
    ? solvedResults.reduce((sum, r) => sum + (r.attempts ?? 1), 0) / solved
    : 0;

  return { total, solved, firstTry, reveals, avgAttempts };
};
