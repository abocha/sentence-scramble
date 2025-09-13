/**
 * Tokenizes a sentence into an array of words, handling locked phrases and punctuation.
 * @param sentence The sentence string to tokenize.
 * @param lockedPhrases Optional array of phrases to keep as single tokens.
 * @returns An array of string tokens.
 */
// Default list of phrasal verbs that should be treated as a single token.
// This list can be extended later as needed.
const DEFAULT_LOCKED_PHRASES = [
  'drop off', 'pick up', 'turn on', 'turn off', 'put on', 'take off',
  'look after', 'give up', 'run into', 'get over', 'come across',
  'work out', 'set up', 'find out', 'figure out', 'go on', 'carry on'
];

export const tokenizeSentence = (sentence: string, lockedPhrases: string[] = []): string[] => {
  // Merge the default phrasal verbs with any teacher-provided locked phrases.
  // Normalize to lowercase for case-insensitive comparison while preserving
  // the original casing in the returned tokens.
  const allLocked = [...DEFAULT_LOCKED_PHRASES, ...lockedPhrases].map(p => p.toLowerCase());

  // Create a regex that matches any of the locked phrases.
  // We sort by length descending to match longer phrases first (e.g., "in spite of" before "spite of").
  const sortedLocked = [...allLocked].sort((a, b) => b.length - a.length);

  // This regex will find either a locked phrase or a sequence of non-space characters (a word).
  // It handles punctuation attached to words correctly.
  const lockPattern = sortedLocked.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const pattern = lockPattern ? new RegExp(`(${lockPattern})|\\S+`, 'gi') : /\S+/gi;

  return sentence.match(pattern) || [];
};
