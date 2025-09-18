import { describe, it, expect } from 'vitest';
import { chunkSentence } from '../chunking';

describe('chunkSentence', () => {
  it('splits long sentences into chunks', () => {
    const sentence = 'For mums and dads who drop their kids off at the school gates, making friends can be just as hard in the morning.';
    expect(chunkSentence(sentence)).toEqual([
      'For mums and dads',
      'who drop their kids off',
      'at the school gates,',
      'making friends can be just as hard',
      'in the morning.'
    ]);
  });

  it('splits around conjunctions when chunks grow too long', () => {
    const sentence = 'She loved painting landscapes and capturing the golden light at sunset, but the weather rarely cooperated, so she always carried spare canvases in her bag.';
    expect(chunkSentence(sentence)).toEqual([
      'She loved painting landscapes',
      'and capturing the golden light at sunset,',
      'but the weather rarely cooperated,',
      'so she always carried spare canvases in her bag.'
    ]);
  });

  it('merges very short trailing chunks back into the previous chunk', () => {
    const sentence = 'The students revised their notes carefully before the exam and then quietly waited.';
    expect(chunkSentence(sentence)).toEqual([
      'The students revised their notes carefully',
      'before the exam and then quietly waited.'
    ]);
  });
});
