import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_INSTRUCTIONS_TEMPLATE } from '../../constants/teacher';
import type { TeacherDraft } from '../../types';
import { loadTeacherDraft, saveTeacherDraft } from '../../utils/teacherStorage';

export type DraftFields = Omit<TeacherDraft, 'updatedAt'>;

const DEFAULT_DRAFT_FIELDS: DraftFields = {
  title: '',
  sentences: '',
  attemptsPerItem: '3',
  revealAfterMaxAttempts: true,
  instructionsTemplate: DEFAULT_INSTRUCTIONS_TEMPLATE,
};

const toDraftFields = (draft: TeacherDraft): DraftFields => ({
  title: draft.title,
  sentences: draft.sentences,
  attemptsPerItem: draft.attemptsPerItem,
  revealAfterMaxAttempts: draft.revealAfterMaxAttempts,
  instructionsTemplate: draft.instructionsTemplate,
});

export const useTeacherDraft = () => {
  const [fields, setFields] = useState<DraftFields>(DEFAULT_DRAFT_FIELDS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const draft = loadTeacherDraft();
    if (draft) {
      setFields(toDraftFields(draft));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const payload: TeacherDraft = {
      ...fields,
      updatedAt: new Date().toISOString(),
    };
    saveTeacherDraft(payload);
  }, [fields, isLoaded]);

  const updateFields = useCallback((patch: Partial<DraftFields>) => {
    setFields((prev) => ({
      ...prev,
      ...patch,
    }));
  }, []);

  const helpers = useMemo(() => ({
    setTitle: (value: string) => updateFields({ title: value }),
    setSentences: (value: string) => updateFields({ sentences: value }),
    setAttemptsPerItem: (value: string) => updateFields({ attemptsPerItem: value }),
    setRevealAfterMaxAttempts: (value: boolean) => updateFields({ revealAfterMaxAttempts: value }),
    setInstructionsTemplate: (value: string) => updateFields({ instructionsTemplate: value }),
    reset: () => setFields(DEFAULT_DRAFT_FIELDS),
  }), [updateFields]);

  return {
    ...fields,
    isLoaded,
    updateFields,
    ...helpers,
  };
};

export type UseTeacherDraftReturn = ReturnType<typeof useTeacherDraft>;
