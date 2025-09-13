import type { Assignment } from '../types';

// Using pako for compression to keep URL lengths manageable.
// A simple script tag would need to be added to index.html to load it.
// For this environment, we'll simulate it, but in a real build, pako would be imported.
declare const pako: any;

export const encodeAssignmentToHash = (assignment: Assignment): string => {
  try {
    const jsonString = JSON.stringify(assignment);
    // In a real project, we'd import pako. For now, we just encode.
    // const compressed = pako.deflate(jsonString, { to: 'string' });
    const base64 = btoa(jsonString); // btoa(compressed)
    // URL-safe Base64
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) {
    console.error("Encoding failed", e);
    return "";
  }
};

export const parseAssignmentFromHash = (hash: string): Assignment | null => {
  try {
    let base64 = hash.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonString = atob(base64);
    // const decompressed = pako.inflate(jsonString, { to: 'string' });
    const assignment = JSON.parse(jsonString); // JSON.parse(decompressed)
    // Basic validation
    if (assignment.id && assignment.title && Array.isArray(assignment.sentences)) {
      return assignment as Assignment;
    }
    return null;
  } catch (e) {
    console.error("Parsing failed", e);
    return null;
  }
};
