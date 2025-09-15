import { describe, it, expect } from 'vitest';
import { encodeAssignmentToHash, parseAssignmentFromHash } from '../encoding';
import type { Assignment } from '../../types';

describe('encoding utilities', () => {
  it('round-trip encodes and decodes Unicode strings', () => {
    const assignment: Assignment = {
      id: '1',
      title: 'こんにちは世界 😀',
      version: 1,
      seed: 'seed',
      options: {
        attemptsPerItem: 'unlimited',
        revealAnswerAfterMaxAttempts: true,
        hints: 'none',
        feedback: 'show-on-wrong',
        scramble: 'seeded',
      },
      sentences: [
        { text: '🦄 Unicode テキスト' },
      ],
    };

    const encoded = encodeAssignmentToHash(assignment);
    const decoded = parseAssignmentFromHash(encoded);

    expect(decoded).toEqual(assignment);
  });

  it('normalizes sentences provided as plain strings', () => {
    const assignmentLike = {
      id: '1',
      title: 'mixed',
      version: 1,
      seed: 'seed',
      options: {
        attemptsPerItem: 'unlimited',
        revealAnswerAfterMaxAttempts: true,
        hints: 'none',
        feedback: 'show-on-wrong',
        scramble: 'seeded',
      },
      sentences: ['hello', { text: 'world' }],
    };

    const encoded = encodeAssignmentToHash(assignmentLike as unknown as Assignment);
    const decoded = parseAssignmentFromHash(encoded);

    expect(decoded?.sentences).toEqual([
      { text: 'hello' },
      { text: 'world' },
    ]);
  });
});
