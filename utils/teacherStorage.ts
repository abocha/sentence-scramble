import {
  DEFAULT_INSTRUCTIONS_TEMPLATE,
  SHARE_HISTORY_LIMIT,
  TEACHER_DRAFT_STORAGE_KEY,
  TEACHER_HISTORY_STORAGE_KEY,
} from '../constants/teacher';
import type { ShareHistoryEntry, SentenceWithOptions, TeacherDraft } from '../types';
import { buildQrFileName, ensureInstructionsTemplate } from './teacherAssignment';

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const sanitizeDraft = (draft: Partial<TeacherDraft>): TeacherDraft => ({
  title: draft.title ?? '',
  sentences: draft.sentences ?? '',
  attemptsPerItem: draft.attemptsPerItem ?? '3',
  revealAfterMaxAttempts: typeof draft.revealAfterMaxAttempts === 'boolean'
    ? draft.revealAfterMaxAttempts
    : true,
  instructionsTemplate: ensureInstructionsTemplate(draft.instructionsTemplate ?? DEFAULT_INSTRUCTIONS_TEMPLATE),
  updatedAt: draft.updatedAt ?? new Date().toISOString(),
});

const sanitizeSentences = (sentences: unknown): string[] => {
  if (!Array.isArray(sentences)) return [];
  return sentences
    .map((sentence) => {
      if (typeof sentence === 'string') return sentence;
      if (sentence && typeof sentence === 'object' && 'text' in sentence) {
        return String((sentence as SentenceWithOptions).text ?? '');
      }
      return '';
    })
    .filter(Boolean);
};

const sanitizeHistoryEntry = (entry: Partial<ShareHistoryEntry>): ShareHistoryEntry | null => {
  if (!entry || typeof entry.link !== 'string') return null;

  const attempts = entry.attemptsPerItem ?? '3';
  const reveal = typeof entry.revealAfterMaxAttempts === 'boolean'
    ? entry.revealAfterMaxAttempts
    : true;
  const template = ensureInstructionsTemplate(entry.template ?? DEFAULT_INSTRUCTIONS_TEMPLATE);
  const sentences = sanitizeSentences(entry.sentences);

  return {
    id: entry.id ?? '',
    title: entry.title ?? '',
    link: entry.link,
    instructions: entry.instructions ?? '',
    createdAt: entry.createdAt ?? new Date().toISOString(),
    attemptsPerItem: attempts,
    revealAfterMaxAttempts: reveal,
    template,
    sentences,
    qrFileName: entry.qrFileName ?? buildQrFileName(entry.title ?? ''),
  };
};

const getStorage = (storage?: StorageLike): StorageLike | null => {
  if (storage) return storage;
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
};

export const loadTeacherDraft = (storage?: StorageLike): TeacherDraft | null => {
  const store = getStorage(storage);
  if (!store) return null;

  try {
    const rawDraft = store.getItem(TEACHER_DRAFT_STORAGE_KEY);
    if (!rawDraft) return null;
    const parsed = JSON.parse(rawDraft) as Partial<TeacherDraft>;
    return sanitizeDraft(parsed);
  } catch (error) {
    console.error('Failed to load teacher draft from storage', error);
    return null;
  }
};

export const saveTeacherDraft = (draft: TeacherDraft, storage?: StorageLike) => {
  const store = getStorage(storage);
  if (!store) return;

  try {
    store.setItem(TEACHER_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch (error) {
    console.error('Failed to save teacher draft to storage', error);
  }
};

export const loadShareHistory = (storage?: StorageLike): ShareHistoryEntry[] => {
  const store = getStorage(storage);
  if (!store) return [];

  try {
    const rawHistory = store.getItem(TEACHER_HISTORY_STORAGE_KEY);
    if (!rawHistory) return [];
    const parsed = JSON.parse(rawHistory) as ShareHistoryEntry[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((entry) => sanitizeHistoryEntry(entry))
      .filter((entry): entry is ShareHistoryEntry => Boolean(entry))
      .slice(0, SHARE_HISTORY_LIMIT);
  } catch (error) {
    console.error('Failed to load share history from storage', error);
    return [];
  }
};

export const saveShareHistory = (history: ShareHistoryEntry[], storage?: StorageLike) => {
  const store = getStorage(storage);
  if (!store) return;

  try {
    store.setItem(TEACHER_HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, SHARE_HISTORY_LIMIT)));
  } catch (error) {
    console.error('Failed to save share history to storage', error);
  }
};
