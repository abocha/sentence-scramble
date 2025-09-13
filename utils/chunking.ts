import { tokenizeSentence } from './tokenization';

// Relative pronouns that indicate a new chunk should start.
const RELATIVE_PRONOUNS = ['who', 'that', 'which', 'where', 'when'];

// Common prepositions used when enforcing maximum chunk length.
const PREPOSITIONS = [
  'in', 'on', 'at', 'with', 'for', 'to', 'from', 'by', 'about', 'as',
  'into', 'like', 'through', 'after', 'over', 'between', 'out',
  'against', 'during', 'without', 'before', 'under', 'around', 'among'
];

// Maximum number of tokens allowed in a chunk before attempting a split.
const MAX_CHUNK_TOKENS = 8;

/**
 * Automatically chunk a sentence when the teacher does not provide explicit chunks.
 * The algorithm loosely follows the specification provided in the project brief.
 */
export const chunkSentence = (text: string): string[] => {
  const sentences = splitIntoSentences(text);
  const result: string[] = [];

  sentences.forEach(sentence => {
    const tokens = mergeProperNouns(tokenizeSentence(sentence));
    if (tokens.length <= 12) {
      result.push(sentence.trim());
      return;
    }

    let current: string[] = [];

    const pushChunk = () => {
      if (current.length) {
        result.push(current.join(' '));
        current = [];
      }
    };

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const normalized = token.toLowerCase();

      if (RELATIVE_PRONOUNS.includes(normalized) && current.length) {
        pushChunk();
      }

      current.push(token);

      if (current.length > MAX_CHUNK_TOKENS) {
        const lastPrepIdx = findLastIndex(current, t => PREPOSITIONS.includes(t.toLowerCase()));
        if (lastPrepIdx > 0) {
          const before = current.splice(0, lastPrepIdx);
          result.push(before.join(' '));
          if (current.length && /[,:;]$/.test(current[current.length - 1])) {
            pushChunk();
          }
        } else {
          pushChunk();
        }
      }

      if (/[,:;]$/.test(token)) {
        pushChunk();
        continue;
      }
    }

    pushChunk();
  });

  return result;
};

export const needsChunking = (text: string): boolean => {
  const sentences = splitIntoSentences(text);
  return sentences.some(sentence => {
    const tokens = mergeProperNouns(tokenizeSentence(sentence));
    return tokens.length > 12;
  });
};

const splitIntoSentences = (text: string): string[] => {
  const matches = text.match(/[^.!?…]+(?:\.\.\.|[.!?…])?/g);
  return matches ? matches.map(s => s.trim()).filter(Boolean) : [text.trim()];
};

// Merge consecutive capitalized tokens to avoid splitting proper names.
const mergeProperNouns = (tokens: string[]): string[] => {
  const merged: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (i > 0 && /^[A-Z]/.test(token) && /^[A-Z]/.test(tokens[i - 1])) {
      merged[merged.length - 1] = merged[merged.length - 1] + ' ' + token;
    } else {
      merged.push(token);
    }
  }
  return merged;
};

const findLastIndex = <T>(arr: T[], predicate: (t: T) => boolean): number => {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i])) return i;
  }
  return -1;
};

