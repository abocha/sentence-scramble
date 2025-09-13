import React, { useState, useEffect } from 'react';
import type { Assignment } from './types';
import { parseAssignmentFromHash } from './utils/encoding';
import TeacherApp from './components/TeacherApp';
import GameApp from './components/GameApp';

export type AppMode = 'practice' | 'homework' | 'teacher';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('practice');
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#A=')) {
        const payload = hash.substring(3);
        const loadedAssignment = parseAssignmentFromHash(payload);
        if (loadedAssignment) {
          setAssignment(loadedAssignment);
          setMode('homework');
        } else {
          setAssignment(null);
          setMode('practice');
        }
      } else if (hash === '#teacher') {
        setMode('teacher');
        setAssignment(null);
      } else {
        setAssignment(null);
        setMode('practice');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (mode === 'teacher') {
    return <TeacherApp />;
  }

  return <GameApp mode={mode} assignment={assignment} />;
};

export default App;
