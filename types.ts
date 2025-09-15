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
  attemptsPerItem?: number; // default 3
  revealAfterMax?: boolean; // default true
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
  attempts: number;
  revealed: boolean;
  attempts: number;
}

export interface Summary {
  total: number;
  solvedWithinMax: number;
  firstTry: number;
  reveals: number;
  avgAttempts: number;
}

export interface StudentProgress {
  assignmentId: string;
  version: number;
  student: { name: string };
  summary: {
    correct: number;
    total: number;
    reveals: number;
  };
  attemptsUsed: number;

  results: Result[];
}
