import type { Assignment } from '../types';
import { deflate, inflate } from 'pako';

// Using pako for compression to keep URL lengths manageable.

export const encodeAssignmentToHash = (assignment: Assignment): string => {
  try {
    const jsonString = JSON.stringify(assignment);
    let compressed: string;
    try {
      compressed = deflate(jsonString, { to: 'string' });
    } catch (err) {
      console.error('Compression failed', err);
      compressed = jsonString;
    }
    const base64 = btoa(compressed);
    // URL-safe Base64
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) {
    console.error('Encoding failed', e);
    return '';
  }
};

export const parseAssignmentFromHash = (hash: string): Assignment | null => {
  try {
    let base64 = hash.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    let jsonString: string;
    try {
      jsonString = inflate(binary, { to: 'string' });
    } catch (err) {
      console.error('Decompression failed', err);
      jsonString = binary;
    }
    const assignment = JSON.parse(jsonString);
    // Basic validation
    if (assignment.id && assignment.title && Array.isArray(assignment.sentences)) {
      return assignment as Assignment;
    }
    return null;
  } catch (e) {
    console.error('Parsing failed', e);
    return null;
  }
};
