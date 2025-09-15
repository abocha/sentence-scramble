import { describe, it, expect } from 'vitest';
import { computeSummary } from '../summary';
import type { Result } from '../../types';

describe('computeSummary', () => {
  it('handles empty results', () => {
    const summary = computeSummary([]);
    expect(summary).toEqual({ total: 0, solved: 0, firstTry: 0, reveals: 0, avgAttempts: 0 });
  });

  it('computes statistics correctly', () => {
    const results: Result[] = [
      { index: 0, ok: true, revealed: false, attempts: 1 },
      { index: 1, ok: true, revealed: false, attempts: 2 },
      { index: 2, ok: false, revealed: true, attempts: 0 },
    ];
    const summary = computeSummary(results);
    expect(summary.total).toBe(3);
    expect(summary.solved).toBe(2);
    expect(summary.firstTry).toBe(1);
    expect(summary.reveals).toBe(1);
    expect(summary.avgAttempts).toBeCloseTo(1.5);
  });
});
