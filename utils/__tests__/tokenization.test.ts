import { describe, it, expect } from 'vitest';
import { tokenizeSentence } from '../tokenization';

describe('tokenizeSentence', () => {
  it('returns empty array for empty input', () => {
    expect(tokenizeSentence('')).toEqual([]);
  });

  it('splits words separated by multiple spaces', () => {
    expect(tokenizeSentence('hello   world')).toEqual(['hello', 'world']);
  });

  it('keeps punctuation attached to words', () => {
    expect(tokenizeSentence('Hello, world!')).toEqual(['Hello,', 'world!']);
  });

  it('respects locked phrases and prefers longer matches', () => {
    const sentence = 'in spite of it all';
    const locked = ['spite of', 'in spite of'];
    expect(tokenizeSentence(sentence, locked)).toEqual([
      'in spite of',
      'it',
      'all',
    ]);
  });
});

