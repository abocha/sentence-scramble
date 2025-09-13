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

  it('processes multiple sentences separately', () => {
    const text = 'Short one. This second sentence is considerably longer and should be split into manageable chunks, keeping things clear. Last bit.';
    expect(chunkSentence(text)).toEqual([
      'Short one.',
      'This second sentence is considerably longer and should be',
      'split into manageable chunks,',
      'keeping things clear.',
      'Last bit.'
    ]);
  });
});

