import { describe, expect, it } from 'vitest';

import {
  TEACHER_DRAFT_STORAGE_KEY,
  TEACHER_HISTORY_STORAGE_KEY,
} from '../../constants/teacher';
import type { ShareHistoryEntry, TeacherDraft } from '../../types';
import {
  loadShareHistory,
  loadTeacherDraft,
  saveShareHistory,
  saveTeacherDraft,
} from '../teacherStorage';

const createMemoryStorage = () => {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
};

describe('teacherStorage', () => {
  it('loads sanitized teacher drafts', () => {
    const storage = createMemoryStorage();
    const draft: Partial<TeacherDraft> = {
      title: 'Module A',
      sentences: 'One sentence',
      attemptsPerItem: 'unlimited',
      revealAfterMaxAttempts: false,
      instructionsTemplate: 'Custom {{title}}',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    storage.setItem(TEACHER_DRAFT_STORAGE_KEY, JSON.stringify(draft));

    const loaded = loadTeacherDraft(storage);
    expect(loaded).toMatchObject({
      title: 'Module A',
      attemptsPerItem: 'unlimited',
      revealAfterMaxAttempts: false,
      instructionsTemplate: 'Custom {{title}}',
    });
  });

  it('saves teacher drafts', () => {
    const storage = createMemoryStorage();
    const draft: TeacherDraft = {
      title: 'Module B',
      sentences: 'First',
      attemptsPerItem: '3',
      revealAfterMaxAttempts: true,
      instructionsTemplate: 'Template',
      updatedAt: '2024-01-02T00:00:00.000Z',
    };

    saveTeacherDraft(draft, storage);
    expect(storage.getItem(TEACHER_DRAFT_STORAGE_KEY)).toBe(JSON.stringify(draft));
  });

  it('loads share history and normalizes sentence shapes', () => {
    const storage = createMemoryStorage();
    const historyPayload = [
      {
        id: 'id-1',
        title: 'History A',
        link: 'https://example.com',
        instructions: '',
        createdAt: '2024-01-01T00:00:00.000Z',
        attemptsPerItem: '3',
        revealAfterMaxAttempts: true,
        template: 'Template',
        sentences: [
          'Sentence one',
          { text: 'Sentence two' },
        ],
      },
    ];

    storage.setItem(TEACHER_HISTORY_STORAGE_KEY, JSON.stringify(historyPayload));
    const loaded = loadShareHistory(storage);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].sentences).toEqual(['Sentence one', 'Sentence two']);
  });

  it('saves share history with limit enforcement', () => {
    const storage = createMemoryStorage();
    const entries: ShareHistoryEntry[] = Array.from({ length: 12 }).map((_, index) => ({
      id: `id-${index}`,
      title: 'Title',
      link: 'https://example.com',
      instructions: '',
      createdAt: '2024-01-01T00:00:00.000Z',
      attemptsPerItem: '3',
      revealAfterMaxAttempts: true,
      template: 'Template',
      sentences: ['Sentence'],
    }));

    saveShareHistory(entries, storage);
    const stored = JSON.parse(storage.getItem(TEACHER_HISTORY_STORAGE_KEY) ?? '[]');
    expect(stored).toHaveLength(10);
  });
});
