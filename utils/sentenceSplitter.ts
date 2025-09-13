export const splitIntoSentences = (text: string): string[] => {
  let normalized = text.replace(/\r\n?/g, '\n').replace(/\s+/g, ' ').trim();
  const ABBREVIATIONS = [
    'Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'St.', 'vs.', 'etc.', 'e.g.', 'i.e.',
    'U.S.', 'U.K.', 'U.N.', 'Jan.', 'Feb.', 'Mar.', 'Apr.', 'Jun.', 'Jul.',
    'Aug.', 'Sep.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'
  ];
  const placeholder = '•';
  ABBREVIATIONS.forEach(abbr => {
    const escaped = abbr.replace(/\./g, '\\.');
    const repl = abbr.replace(/\./g, placeholder);
    normalized = normalized.replace(new RegExp(escaped, 'g'), repl);
  });
  normalized = normalized.replace(/(\d)\.(\d)/g, `$1${placeholder}$2`);
  const parts = normalized.split(/(?<=[.!?])\s+(?=(?:["“‘(]*[A-Z]))/);
  return parts.map(p => p.replace(new RegExp(placeholder, 'g'), '.').trim()).filter(Boolean);
};

import type { SentenceWithOptions } from '../types';

export const parseTeacherInput = (input: string): SentenceWithOptions[] => {
  const normalized = input.replace(/\r\n?/g, '\n').trim();
  if (!normalized) return [];
  const lines = normalized.includes('\n')
    ? normalized.split('\n')
    : splitIntoSentences(normalized);
  return lines
    .map(l => l.trim())
    .filter(l => l)
    .map(line => {
      if (line.includes('/')) {
        const chunks = line.split('/').map(c => c.trim()).filter(Boolean);
        const text = chunks.join(' ');
        if (chunks.length > 3) {
          return { text, chunks };
        }
        return { text };
      }
      return { text: line };
    });
};
