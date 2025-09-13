import { describe, it, expect } from 'vitest';
import { seededShuffle } from '../prng';

describe('seededShuffle', () => {
  it('returns same result for same seed', () => {
    const arr = [1, 2, 3, 4];
    const shuffled = seededShuffle(arr, 'seed');
    expect(shuffled).toEqual([2, 4, 1, 3]);
    // Ensure original array not mutated
    expect(arr).toEqual([1, 2, 3, 4]);
    const again = seededShuffle(arr, 'seed');
    expect(again).toEqual([2, 4, 1, 3]);
  });

  it('returns different results for different seeds', () => {
    const arr = [1, 2, 3, 4];
    const first = seededShuffle(arr, 'seed');
    const second = seededShuffle(arr, 'another');
    expect(first).not.toEqual(second);
  });
});

