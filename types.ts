export interface Word {
  id: string;
  text: string;
}

export interface Feedback {
  type: 'success' | 'error';
  message: string;
}

// --- New Types for Homework Flow ---

export interface SentenceWithOptions {
  text: string;
  alts?: string[];
  lock?: string[];
  chunks?: string[];
}

export interface AssignmentOptions {
  attemptsPerItem: number | 'unlimited';
  revealAnswerAfterMaxAttempts: boolean;
  hints: 'none' | 'first-last' | 'lock';
  feedback: 'show-on-wrong' | 'end-only';
  scramble: 'seeded' | 'random';
}

export interface Assignment {
  id: string;
  title: string;
  version: number;
  seed: string;
  options: AssignmentOptions;
  sentences: SentenceWithOptions[];
}

export interface Result {
  index: number;
  ok: boolean;
  revealed: boolean;
  attempts: number;
}

export interface Summary {
  total: number;
  solved: number;
  firstTry: number;
  reveals: number;
  avgAttempts: number;
}

export interface StudentProgress {
  assignmentId: string;
  version: number;
  student: { name: string };
  summary: Summary;
  results: Result[];
}
