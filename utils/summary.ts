import type { Result, Summary } from '../types';

export const computeSummary = (results: Result[], maxAttempts: number): Summary => {
  const total = results.length;
  const effectiveMax = Number.isFinite(maxAttempts) && maxAttempts > 0 ? maxAttempts : Number.POSITIVE_INFINITY;

  const solvedResults = results.filter(r => r.ok);
  const solvedWithinMax = results.filter(r => r.ok && r.attempts <= effectiveMax).length;
  const firstTry = solvedResults.filter(r => r.attempts === 1).length;
  const reveals = results.filter(r => r.revealed).length;

  const avgAttempts = solvedResults.length
    ? Number((solvedResults.reduce((sum, r) => sum + (r.attempts ?? 1), 0) / solvedResults.length).toFixed(2))
    : 0;

  return {
    total,
    solvedWithinMax,
    firstTry,
    reveals,
    avgAttempts,
  };
};
