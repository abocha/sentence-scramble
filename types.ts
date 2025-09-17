export interface Word {
  id: string;
  text: string;
}

export interface Feedback {
  type: 'success' | 'error';
  message: string;
  detail?: string;
}

export interface SentenceWithOptions {
  text: string;
  alts?: string[];
  lock?: string[];
  chunks?: string[];
}

export interface AssignmentOptions {
  attemptsPerItem?: number | 'unlimited';
  revealAfterMax?: boolean;
  revealAnswerAfterMaxAttempts?: boolean;
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
  attempts: number;
  revealed: boolean;
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
  summary: Summary;
  results: Result[];
  current?: {
    index: number;
    attemptsUsed: number;
    revealed: boolean;
  };
}
