import type { Assignment } from '../types';

// --- Base64URL helpers (UTF-8 safe) ---
const toB64Url = (json: unknown): string => {
  const jsonString = JSON.stringify(json);
  const b64 = btoa(unescape(encodeURIComponent(jsonString)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromB64Url = <T = unknown>(b64url: string): T | null => {
  try {
    const pad = (x: string) => x + '==='.slice((x.length + 3) % 4);
    const b64 = pad(b64url).replace(/-/g, '+').replace(/_/g, '/');
    const jsonString = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.error('Failed to decode assignment:', e);
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
  const obj = fromB64Url<Assignment>(hash);
  if (!obj) return null;

  // Defensive normalization of sentences
  obj.sentences = obj.sentences.map((s: any) =>
    typeof s === 'string' ? { text: s } : s
  );

  if (obj.id && obj.title && Array.isArray(obj.sentences)) {
    return obj;
  }

  return null;
};
