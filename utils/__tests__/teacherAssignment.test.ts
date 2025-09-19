import { describe, expect, it } from 'vitest';

import { QR_CODE_BASE_URL, QR_CODE_SIZE } from '../../constants/teacher';
import type { ShareHistoryEntry } from '../../types';
import {
  buildInstructionsFromTemplate,
  buildOptions,
  buildQrFileName,
  buildQrUrl,
  cloneHistoryEntries,
  ensureInstructionsTemplate,
  generateAssignmentId,
} from '../teacherAssignment';

const sampleHistoryEntry = (): ShareHistoryEntry => ({
  id: 'ss-20240101-abc123',
  title: 'Adverbs practice',
  link: 'https://example.com',
  instructions: 'do work',
  createdAt: '2024-01-01T00:00:00.000Z',
  attemptsPerItem: '3',
  revealAfterMaxAttempts: true,
  template: 'template',
  sentences: ['Sentence one', 'Sentence two'],
  qrFileName: 'foo-qr.png',
});

describe('teacherAssignment helpers', () => {
  it('builds deterministic QR filenames', () => {
    expect(buildQrFileName(' Adverbs & Grammar! ')).toBe('adverbs-grammar-qr.png');
    expect(buildQrFileName('')).toBe('assignment-qr.png');
  });

  it('builds QR URLs with encoded data', () => {
    const link = 'https://example.com/#C=test';
    const url = buildQrUrl(link);
    expect(url).toContain(QR_CODE_BASE_URL);
    expect(url).toContain(`size=${QR_CODE_SIZE}`);
    expect(url).toContain(encodeURIComponent(link));
  });

  it('returns empty QR URL when link is missing', () => {
    expect(buildQrUrl('')).toBe('');
    expect(buildQrUrl('   ')).toBe('');
  });

  it('replaces placeholders within instruction templates', () => {
    const template = 'Homework: {{title}} ({{date}}) - {{attempts}} -> {{link}}';
    const instructions = buildInstructionsFromTemplate(template, {
      title: 'Module A',
      link: 'https://app',
      attemptsPerItem: 'unlimited',
      createdAt: '2024-01-01T00:00:00.000Z',
    });

    expect(instructions).toContain('Module A');
    expect(instructions).toContain('Unlimited');
    expect(instructions).toContain('https://app');
  });

  it('builds assignment options from attempt input', () => {
    expect(buildOptions('3', true)).toEqual({
      attemptsPerItem: 3,
      revealAfterMax: true,
      revealAnswerAfterMaxAttempts: true,
      hints: 'none',
      feedback: 'show-on-wrong',
      scramble: 'seeded',
    });

    expect(buildOptions('unlimited', false)).toMatchObject({ attemptsPerItem: 'unlimited' });
  });

  it('clones share history entries deeply', () => {
    const history = [sampleHistoryEntry()];
    const cloned = cloneHistoryEntries(history);

    expect(cloned).not.toBe(history);
    expect(cloned[0]).not.toBe(history[0]);
    expect(cloned[0].sentences).not.toBe(history[0].sentences);
    expect(cloned[0]).toEqual(history[0]);
  });

  it('ensures instructions template falls back to default when empty', () => {
    expect(ensureInstructionsTemplate('')).not.toBe('');
    expect(ensureInstructionsTemplate(' custom ')).toBe(' custom ');
  });

  it('generates unique assignment ids', () => {
    const idA = generateAssignmentId();
    const idB = generateAssignmentId();
    expect(idA).not.toBe(idB);
    expect(idA.startsWith('ss-')).toBe(true);
  });
});
