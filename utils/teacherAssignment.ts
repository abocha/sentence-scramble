import { DEFAULT_INSTRUCTIONS_TEMPLATE, QR_CODE_BASE_URL, QR_CODE_SIZE } from '../constants/teacher';
import type { AssignmentOptions, ShareHistoryEntry } from '../types';

export interface TemplateContext {
  title: string;
  link: string;
  attemptsPerItem: string;
  createdAt: string;
}

export const buildQrFileName = (name: string) => {
  const fallback = 'assignment';
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  return `${normalized || fallback}-qr.png`;
};

export const buildQrUrl = (link: string) => {
  if (!link) return '';
  const trimmed = link.trim();
  if (!trimmed) return '';
  const query = new URLSearchParams({
    size: QR_CODE_SIZE,
    data: trimmed,
  });
  return `${QR_CODE_BASE_URL}?${query.toString()}`;
};

export const generateAssignmentId = () => {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  return `ss-${timestamp}-${randomSuffix}`;
};

export const buildInstructionsFromTemplate = (template: string, context: TemplateContext) => {
  const formattedAttempts = context.attemptsPerItem === 'unlimited'
    ? 'Unlimited'
    : `${context.attemptsPerItem} attempts per item`;

  const replacements: Record<string, string> = {
    '{{title}}': context.title || 'Assignment',
    '{{link}}': context.link,
    '{{attempts}}': formattedAttempts,
    '{{date}}': new Date(context.createdAt).toLocaleDateString(),
  };

  return Object.entries(replacements).reduce((output, [token, value]) => (
    output.split(token).join(value)
  ), template);
};

export const formatHistoryTimestamp = (iso: string) => {
  try {
    return new Date(iso).toLocaleString();
  } catch (error) {
    return iso;
  }
};

export const cloneHistoryEntries = (entries: ShareHistoryEntry[]): ShareHistoryEntry[] => (
  entries.map((entry) => ({
    ...entry,
    sentences: [...entry.sentences],
  }))
);

export const buildOptions = (
  attempts: string,
  revealAfterMaxAttempts: boolean,
): AssignmentOptions => {
  const attemptsSetting = attempts === 'unlimited' ? 'unlimited' : parseInt(attempts, 10);

  return {
    attemptsPerItem: attemptsSetting,
    revealAfterMax: revealAfterMaxAttempts,
    revealAnswerAfterMaxAttempts: revealAfterMaxAttempts,
    hints: 'none',
    feedback: 'show-on-wrong',
    scramble: 'seeded',
  };
};

export const ensureInstructionsTemplate = (template?: string): string => {
  const trimmed = template?.trim();
  if (trimmed && trimmed.length > 0) {
    return template ?? DEFAULT_INSTRUCTIONS_TEMPLATE;
  }
  return DEFAULT_INSTRUCTIONS_TEMPLATE;
};
