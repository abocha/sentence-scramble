import { describe, it, expect } from 'vitest';
import { computeSummary } from '../summary';
import type { Result } from '../../types';

describe('computeSummary', () => {
  const maxAttempts = 3;

  it('handles empty results', () => {
    const summary = computeSummary([], maxAttempts);
    expect(summary).toEqual({
      total: 0,
      solvedWithinMax: 0,
      firstTry: 0,
      reveals: 0,
      avgAttempts: 0,
    });
  });

  it('computes statistics correctly', () => {
    const results: Result[] = [
      { index: 0, ok: true, revealed: false, attempts: 1 },
      { index: 1, ok: true, revealed: false, attempts: 2 },
      { index: 2, ok: false, revealed: true, attempts: maxAttempts },
    ];
    const summary = computeSummary(results, maxAttempts);
    expect(summary.total).toBe(3);
    expect(summary.solvedWithinMax).toBe(2);
    expect(summary.firstTry).toBe(1);
    expect(summary.reveals).toBe(1);
    expect(summary.avgAttempts).toBeCloseTo(1.5);
  });

  it('defaults missing attempts to 1', () => {
    const results = [
      { index: 0, ok: true, revealed: false, attempts: 2 },
      { index: 1, ok: true, revealed: false } as Result,
    ] as Result[];
    const summary = computeSummary(results, maxAttempts);
    expect(summary.avgAttempts).toBeCloseTo(1.5);
  });
});
