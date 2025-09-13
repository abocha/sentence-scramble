import { describe, it, expect } from 'vitest';
import { splitIntoSentences, parseTeacherInput } from '../sentenceSplitter';

describe('splitIntoSentences', () => {
  it('splits paragraph into sentences', () => {
    const text = 'For mums and dads who drop their kids off at the school gates in the morning, making friends with other mums can be just as hard. If you fit into one of those, you feel you belong and are accepted. If you don\'t fit, it\'s really difficult to navigate.';
    expect(splitIntoSentences(text)).toEqual([
      'For mums and dads who drop their kids off at the school gates in the morning, making friends with other mums can be just as hard.',
      'If you fit into one of those, you feel you belong and are accepted.',
      "If you don't fit, it's really difficult to navigate."
    ]);
  });

  it('handles abbreviations and decimals', () => {
    const text = 'I spoke to Dr. Smith in the U.S. last week. He said it\'s fine. The recipe uses 2.5 cups of flour. Mix well.';
    expect(splitIntoSentences(text)).toEqual([
      'I spoke to Dr. Smith in the U.S. last week.',
      "He said it's fine.",
      'The recipe uses 2.5 cups of flour.',
      'Mix well.'
    ]);
  });
});

describe('parseTeacherInput', () => {
  it('detects explicit chunks', () => {
    const input = 'can be just as hard / making friends / with other mums / for mums and dads / who drop their kids off / at the school gates / in the morning.';
    const items = parseTeacherInput(input);
    expect(items).toHaveLength(1);
    expect(items[0].chunks).toEqual([
      'can be just as hard',
      'making friends',
      'with other mums',
      'for mums and dads',
      'who drop their kids off',
      'at the school gates',
      'in the morning.'
    ]);
  });

  it('ignores explicit chunking when 3 or fewer chunks', () => {
    const input = 'one / two / three';
    const items = parseTeacherInput(input);
    expect(items).toHaveLength(1);
    expect(items[0].chunks).toBeUndefined();
    expect(items[0].text).toBe('one two three');
  });

  it('splits single paragraph into multiple items', () => {
    const input = 'I spoke to Dr. Smith in the U.S. last week. He said it\'s fine.';
    const items = parseTeacherInput(input);
    expect(items).toHaveLength(2);
    expect(items[0].text).toBe('I spoke to Dr. Smith in the U.S. last week.');
    expect(items[1].text).toBe("He said it's fine.");
  });
});
