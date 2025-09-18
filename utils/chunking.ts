import { tokenizeSentence, normalizeTokenForMatch } from './tokenization';

// Relative pronouns that indicate a new chunk should start.
const RELATIVE_PRONOUNS = new Set(['who', 'that', 'which', 'where', 'when']);

// Common prepositions used when enforcing maximum chunk length.
const PREPOSITIONS = new Set([
  'in', 'on', 'at', 'with', 'for', 'to', 'from', 'by', 'about', 'as',
  'into', 'like', 'through', 'after', 'over', 'between', 'out',
  'against', 'during', 'without', 'before', 'under', 'around', 'among',
]);

const CONJUNCTIONS = new Set([
  'and', 'but', 'so', 'because', 'while', 'although', 'though', 'since',
  'unless', 'yet', 'however', 'whereas', 'until',
]);

const PREPOSITION_BREAK_FOLLOWERS = new Set([
  'the', 'a', 'an', 'this', 'that', 'these', 'those',
  'another', 'other', 'each', 'every', 'any', 'some',
]);

// Maximum number of word tokens allowed in a chunk before attempting a split.
const MAX_CHUNK_WORDS = 9;
const MIN_CHUNK_WORDS = 3;

/**
 * Automatically chunk a sentence when the teacher does not provide explicit chunks.
 * Attempts to keep chunks between 3 and 8 words and to split on meaningful boundaries.
 */
export const chunkSentence = (sentence: string): string[] => {
  const tokens = mergeProperNouns(tokenizeSentence(sentence));
  if (countWords(tokens) <= 12) {
    return [sentence.trim()];
  }

  const chunkTokens: string[][] = [];
  let current: string[] = [];
  let currentWordCount = 0;

  const resetCurrent = () => {
    current = [];
    currentWordCount = 0;
  };

  const pushCurrentChunk = () => {
    if (current.length === 0) return;
    chunkTokens.push(current);
    resetCurrent();
  };

  const addToken = (token: string) => {
    current.push(token);
    if (isWordToken(token)) {
      currentWordCount += 1;
    }
  };

const attemptSplitCurrentAt = (index: number): boolean => {
    if (index <= 0 || index >= current.length) {
      return false;
    }

    const before = current.slice(0, index);
    const after = current.slice(index);
    const beforeWords = countWords(before);
    const afterWords = countWords(after);

    const isBreakToken = (token: string) => /[,:;—–]$/.test(token);
    const beforeEndsWithBreak = before.length > 0 && isBreakToken(before[before.length - 1]);

    if (
      beforeWords < MIN_CHUNK_WORDS ||
      (afterWords < MIN_CHUNK_WORDS && !beforeEndsWithBreak)
    ) {
      return false;
    }

    chunkTokens.push(before);
    current = after;
    currentWordCount = afterWords;
    return true;
  };

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const normalized = normalizeTokenForMatch(token);

    if (currentWordCount >= MIN_CHUNK_WORDS && RELATIVE_PRONOUNS.has(normalized)) {
      pushCurrentChunk();
    }

    addToken(token);

    if (/[,.;!?—–]$/.test(token) && currentWordCount >= MIN_CHUNK_WORDS) {
      pushCurrentChunk();
      continue;
    }

    if (currentWordCount > MAX_CHUNK_WORDS) {
      const trySplit = (predicate: (token: string) => boolean): boolean => {
        const index = findSplitIndex(current, predicate);
        return index !== undefined && index > 0 && attemptSplitCurrentAt(index);
      };

      let didSplit = trySplit(candidate => PREPOSITIONS.has(normalizeTokenForMatch(candidate)));
      if (!didSplit) {
        didSplit = trySplit(candidate => CONJUNCTIONS.has(normalizeTokenForMatch(candidate)));
      }

      if (didSplit) {
        if (current.length && /[,.;!?—–]$/.test(current[current.length - 1])) {
          pushCurrentChunk();
        }
        continue;
      }

      if (currentWordCount > MAX_CHUNK_WORDS + 3) {
        pushCurrentChunk();
        continue;
      }
    }

    const nextIndex = i + 1;
    if (currentWordCount >= MIN_CHUNK_WORDS && shouldStartNewChunkBefore(tokens, nextIndex)) {
      pushCurrentChunk();
    }
  }

  pushCurrentChunk();

  if (chunkTokens.length > 1) {
    const last = chunkTokens[chunkTokens.length - 1];
    if (countWords(last) < MIN_CHUNK_WORDS) {
      const previous = chunkTokens[chunkTokens.length - 2];
      chunkTokens.splice(chunkTokens.length - 2, 2, [...previous, ...last]);
    }
  }

  return chunkTokens
    .map(formatChunk)
    .map(chunk => chunk.trim())
    .filter(Boolean);
};

const shouldStartNewChunkBefore = (tokens: string[], nextIndex: number): boolean => {
  if (nextIndex >= tokens.length) return false;

  const nextToken = tokens[nextIndex];
  const nextCanonical = normalizeTokenForMatch(nextToken);
  if (!nextCanonical) return false;

  if (CONJUNCTIONS.has(nextCanonical)) {
    const remainingWords = countWords(tokens.slice(nextIndex));
    return remainingWords > MIN_CHUNK_WORDS + 1;
  }

  if (PREPOSITIONS.has(nextCanonical)) {
    const followerToken = tokens[nextIndex + 1];
    const followerCanonical = followerToken ? normalizeTokenForMatch(followerToken) : '';
    if (followerCanonical && PREPOSITION_BREAK_FOLLOWERS.has(followerCanonical)) {
      return true;
    }
  }

  return false;
};

const mergeProperNouns = (tokens: string[]): string[] => {
  const merged: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const previous = merged[merged.length - 1];

    if (
      i > 0 &&
      /^[A-Z]/.test(token) &&
      previous && /^[A-Z]/.test(previous)
    ) {
      merged[merged.length - 1] = `${previous} ${token}`;
    } else {
      merged.push(token);
    }
  }
  return merged;
};

const findSplitIndex = (tokens: string[], predicate: (token: string) => boolean): number | undefined => {
  for (let i = tokens.length - 1; i > 0; i--) {
    if (!predicate(tokens[i])) continue;
    if (countWords(tokens.slice(0, i)) >= MIN_CHUNK_WORDS) {
      return i;
    }
  }
  return undefined;
};

const isWordToken = (token: string): boolean => normalizeTokenForMatch(token) !== '';

const countWords = (tokens: string[]): number => tokens.reduce<number>((acc, token) => {
  return acc + (isWordToken(token) ? 1 : 0);
}, 0);

const formatChunk = (tokens: string[]): string => {
  return tokens.reduce<string>((acc, token, index) => {
    const trimmed = token.trim();
    if (!trimmed) return acc;

    if (index === 0) {
      return trimmed;
    }

    const startsWithPunctuation = /^[,.;!?)]/.test(trimmed) || /^[”'’»›]/.test(trimmed);
    const endsWithOpening = /[([{“"']$/.test(acc);

    if (startsWithPunctuation || endsWithOpening) {
      return acc + trimmed;
    }

    return `${acc} ${trimmed}`;
  }, '');
};

