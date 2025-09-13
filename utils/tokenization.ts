/**
 * Tokenizes a sentence into an array of words, handling locked phrases and punctuation.
 * @param sentence The sentence string to tokenize.
 * @param lockedPhrases Optional array of phrases to keep as single tokens.
 * @returns An array of string tokens.
 */
export const tokenizeSentence = (sentence: string, lockedPhrases: string[] = []): string[] => {
  // Create a regex that matches any of the locked phrases.
  // We sort by length descending to match longer phrases first (e.g., "in spite of" before "spite of").
  const sortedLocked = [...lockedPhrases].sort((a, b) => b.length - a.length);

  // This regex will find either a locked phrase or a sequence of non-space characters (a word).
  // It handles punctuation attached to words correctly.
  const lockPattern = sortedLocked.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const pattern = lockPattern ? new RegExp(`(${lockPattern})|\\S+`, 'g') : /\S+/g;

  return sentence.match(pattern) || [];
};
