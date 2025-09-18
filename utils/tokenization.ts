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

const DIACRITIC_REGEX = /[\u0300-\u036f]/g;
const OUTER_PUNCTUATION_REGEX = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;
const INNER_SEPARATOR_REGEX = /[^\p{L}\p{N}'’]+/gu;

export const normalizeTokenForMatch = (value: string): string => {
  const withoutDiacritics = value
    .normalize('NFKD')
    .replace(DIACRITIC_REGEX, '')
    .replace(/[’‘]/g, "'")
    .replace(/[“”«»„]/g, '"');

  const cleaned = withoutDiacritics.replace(OUTER_PUNCTUATION_REGEX, '');
  if (!cleaned) return '';

  return cleaned
    .replace(INNER_SEPARATOR_REGEX, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
};

type PhraseTokens = {
  canonical: string[];
  key: string;
};

const buildLockedPhraseTokens = (phrases: string[]): PhraseTokens[] => {
  const seen = new Set<string>();

  const collected = phrases
    .map(phrase => {
      const tokens = phrase
        .split(/\s+/)
        .map(normalizeTokenForMatch)
        .filter(Boolean);

      if (tokens.length === 0) {
        return null;
      }

      const key = tokens.join(' ');
      if (seen.has(key)) {
        return null;
      }

      seen.add(key);
      const entry: PhraseTokens = { canonical: tokens, key };
      return entry;
    })
    .filter((entry): entry is PhraseTokens => Boolean(entry));

  collected.sort((a, b) => {
    if (b.canonical.length !== a.canonical.length) {
      return b.canonical.length - a.canonical.length;
    }
    return a.key.localeCompare(b.key);
  });

  return collected;
};

const mergeTokens = (tokens: string[]): string => {
  if (tokens.length === 0) return '';

  return tokens.reduce((acc, token, index) => {
    if (index === 0) {
      return token;
    }

    if (!token) return acc;

    const startsWithPunctuation = /^[^\p{L}\p{N}]+/u.test(token);
    const endsWithOpening = /[([{“"']$/.test(acc);

    if (startsWithPunctuation || endsWithOpening) {
      return acc + token;
    }

    return `${acc} ${token}`;
  }, '');
};

export const tokenizeSentence = (sentence: string, lockedPhrases: string[] = []): string[] => {
  if (!sentence.trim()) return [];

  const rawTokens = sentence.match(/\S+/g) ?? [];
  if (rawTokens.length === 0) return [];

  const canonicalTokens = rawTokens.map(normalizeTokenForMatch);
  const lockedTokenSets = buildLockedPhraseTokens([
    ...DEFAULT_LOCKED_PHRASES,
    ...lockedPhrases,
  ]);

  const result: string[] = [];

  for (let i = 0; i < rawTokens.length; i++) {
    const baseCanonical = canonicalTokens[i];
    if (!baseCanonical) {
      result.push(rawTokens[i]);
      continue;
    }

    let matched = false;

    for (const { canonical } of lockedTokenSets) {
      const span = canonical.length;
      if (span === 0 || i + span > rawTokens.length) {
        continue;
      }

      let fits = true;
      for (let offset = 0; offset < span; offset++) {
        if (canonicalTokens[i + offset] !== canonical[offset]) {
          fits = false;
          break;
        }
      }

      if (fits) {
        const merged = mergeTokens(rawTokens.slice(i, i + span));
        result.push(merged);
        i += span - 1;
        matched = true;
        break;
      }
    }

    if (!matched) {
      result.push(rawTokens[i]);
    }
  }

  return result;
};
