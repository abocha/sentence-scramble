import type { Assignment, SentenceWithOptions, AssignmentOptions } from '../types';

// --- Base64URL helpers (UTF-8 safe using TextEncoder/TextDecoder) ---
const toB64Url = (json: unknown): string => {
  const jsonString = JSON.stringify(json);
  const bytes = new TextEncoder().encode(jsonString);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  const b64 = btoa(binary);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromB64Url = <T = unknown>(b64url: string): T | null => {
  try {
    const pad = (x: string) => x + '==='.slice((x.length + 3) % 4);
    const b64 = pad(b64url).replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(b64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const jsonString = new TextDecoder().decode(bytes);
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.error('Failed to decode assignment:', e);
    return null;
  }
};

const trimTrailingNulls = <T>(values: T[]): T[] => {
  let end = values.length;
  while (end > 0) {
    const value = values[end - 1];
    if (value === null || value === undefined) {
      end -= 1;
      continue;
    }
    if (Array.isArray(value) && value.length === 0) {
      end -= 1;
      continue;
    }
    break;
  }
  return values.slice(0, end);
};

type CompactOptionsPayload = [
  hints: AssignmentOptions['hints'],
  feedback: AssignmentOptions['feedback'],
  scramble: AssignmentOptions['scramble'],
  attemptsPerItem?: AssignmentOptions['attemptsPerItem'] | null,
  revealAfterMax?: boolean | null,
  revealAnswerAfterMaxAttempts?: boolean | null,
];

type CompactSentencePayload = [
  text: string,
  alts?: string[],
  lock?: string[],
  chunks?: string[],
];

type CompactAssignmentPayload = [
  id: string,
  title: string,
  version: number,
  seed: string,
  options: CompactOptionsPayload,
  sentences: CompactSentencePayload[],
];

const encodeSentenceCompact = (sentence: SentenceWithOptions): CompactSentencePayload => {
  const normalizeArray = (value?: string[]): string[] | undefined => {
    if (!value || value.length === 0) return undefined;
    return value.map(String);
  };

  const payload = trimTrailingNulls([
    sentence.text,
    normalizeArray(sentence.alts),
    normalizeArray(sentence.lock),
    normalizeArray(sentence.chunks),
  ]);

  return payload as CompactSentencePayload;
};

const decodeSentenceCompact = (payload: unknown): SentenceWithOptions => {
  if (typeof payload === 'string') {
    return { text: payload };
  }

  if (Array.isArray(payload)) {
    if (payload.length === 0 || typeof payload[0] !== 'string') {
      throw new Error('Invalid sentence payload');
    }

    const [text, altsRaw, lockRaw, chunksRaw] = payload as [unknown, unknown, unknown, unknown];
    const sentence: SentenceWithOptions = { text: text as string };

    if (Array.isArray(altsRaw) && altsRaw.length > 0) {
      sentence.alts = altsRaw.map(String);
    }

    if (Array.isArray(lockRaw) && lockRaw.length > 0) {
      sentence.lock = lockRaw.map(String);
    }

    if (Array.isArray(chunksRaw) && chunksRaw.length > 0) {
      sentence.chunks = chunksRaw.map(String);
    }

    return sentence;
  }

  if (payload && typeof payload === 'object') {
    const maybeSentence = payload as Partial<SentenceWithOptions>;
    if (typeof maybeSentence.text === 'string') {
      const adapted: SentenceWithOptions = { text: maybeSentence.text };
      if (Array.isArray(maybeSentence.alts) && maybeSentence.alts.length > 0) {
        adapted.alts = maybeSentence.alts.map(String);
      }
      if (Array.isArray(maybeSentence.lock) && maybeSentence.lock.length > 0) {
        adapted.lock = maybeSentence.lock.map(String);
      }
      if (Array.isArray(maybeSentence.chunks) && maybeSentence.chunks.length > 0) {
        adapted.chunks = maybeSentence.chunks.map(String);
      }
      return adapted;
    }
  }

  throw new Error('Unsupported sentence payload');
};

const encodeOptionsCompact = (options: AssignmentOptions): CompactOptionsPayload => {
  const payload = trimTrailingNulls([
    options.hints,
    options.feedback,
    options.scramble,
    options.attemptsPerItem ?? undefined,
    typeof options.revealAfterMax === 'boolean' ? options.revealAfterMax : undefined,
    typeof options.revealAnswerAfterMaxAttempts === 'boolean' ? options.revealAnswerAfterMaxAttempts : undefined,
  ]);

  return payload as CompactOptionsPayload;
};

const decodeOptionsCompact = (payload: unknown): AssignmentOptions => {
  if (!Array.isArray(payload) || payload.length < 3) {
    throw new Error('Invalid options payload');
  }

  const [
    hintsRaw,
    feedbackRaw,
    scrambleRaw,
    attemptsRaw,
    revealAfterRaw,
    revealAfterMaxAttemptsRaw,
  ] = payload as [unknown, unknown, unknown, unknown, unknown, unknown];

  const options: AssignmentOptions = {
    hints: (typeof hintsRaw === 'string' ? hintsRaw : 'none') as AssignmentOptions['hints'],
    feedback: (typeof feedbackRaw === 'string' ? feedbackRaw : 'show-on-wrong') as AssignmentOptions['feedback'],
    scramble: (typeof scrambleRaw === 'string' ? scrambleRaw : 'seeded') as AssignmentOptions['scramble'],
  };

  if (attemptsRaw === 'unlimited' || typeof attemptsRaw === 'number') {
    options.attemptsPerItem = attemptsRaw as AssignmentOptions['attemptsPerItem'];
  }

  if (typeof revealAfterRaw === 'boolean') {
    options.revealAfterMax = revealAfterRaw;
  }

  if (typeof revealAfterMaxAttemptsRaw === 'boolean') {
    options.revealAnswerAfterMaxAttempts = revealAfterMaxAttemptsRaw;
  }

  return options;
};

export const encodeAssignmentToCompactHash = (assignment: Assignment): string => {
  try {
    const payload: CompactAssignmentPayload = [
      assignment.id,
      assignment.title,
      assignment.version,
      assignment.seed,
      encodeOptionsCompact(assignment.options),
      assignment.sentences.map(encodeSentenceCompact),
    ];

    return toB64Url(payload);
  } catch (e) {
    console.error('Compact encoding failed', e);
    return '';
  }
};

export const parseAssignmentFromCompactHash = (hash: string): Assignment | null => {
  const payload = fromB64Url<CompactAssignmentPayload>(hash);
  if (!payload || !Array.isArray(payload) || payload.length < 6) {
    return null;
  }

  try {
    const [idRaw, titleRaw, versionRaw, seedRaw, optionsRaw, sentencesRaw] = payload;

    const id = String(idRaw ?? '');
    const title = String(titleRaw ?? '');
    const versionNumber = Number(versionRaw ?? 0);
    const seed = String(seedRaw ?? '');

    if (!id || !title || Number.isNaN(versionNumber) || !seed) {
      return null;
    }

    const options = decodeOptionsCompact(optionsRaw);
    const sentences = Array.isArray(sentencesRaw)
      ? sentencesRaw.map(decodeSentenceCompact)
      : [];

    if (sentences.length === 0) {
      return null;
    }

    return {
      id,
      title,
      version: versionNumber,
      seed,
      options,
      sentences,
    };
  } catch (e) {
    console.error('Failed to decode compact assignment:', e);
    return null;
  }
};

// Encode an Assignment object into a URL-safe hash payload.
export const encodeAssignmentToHash = (assignment: Assignment): string => {
  try {
    return toB64Url(assignment);
  } catch (e) {
    console.error('Encoding failed', e);
    return '';
  }
};

// Decode a hash payload back into an Assignment object.
export const parseAssignmentFromHash = (hash: string): Assignment | null => {
  const obj = fromB64Url<
    Assignment & { sentences: Array<string | SentenceWithOptions> }
  >(hash);
  if (!obj) return null;

  // Defensive normalization of sentences
  obj.sentences = obj.sentences.map(
    (s: string | SentenceWithOptions): SentenceWithOptions =>
      typeof s === 'string' ? { text: s } : s
  );

  if (obj.id && obj.title && Array.isArray(obj.sentences)) {
    return obj;
  }

  return null;
};
