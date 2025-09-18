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

  it('locks default phrasal verbs', () => {
    expect(tokenizeSentence('We will pick up the kids')).toEqual([
      'We',
      'will',
      'pick up',
      'the',
      'kids',
    ]);
  });

  it('locks phrasal verbs regardless of case', () => {
    expect(tokenizeSentence('We will Pick Up the kids')).toEqual([
      'We',
      'will',
      'Pick Up',
      'the',
      'kids',
    ]);
  });

  it('locks phrases even when punctuation is attached', () => {
    expect(tokenizeSentence('They will drop off, then head home.')).toEqual([
      'They',
      'will',
      'drop off,',
      'then',
      'head',
      'home.',
    ]);
  });

  it('matches phrases with accented characters', () => {
    const sentence = 'Café owners look after customers with care.';
    expect(tokenizeSentence(sentence)).toEqual([
      'Café',
      'owners',
      'look after',
      'customers',
      'with',
      'care.'
    ]);
  });
});

