import React from 'react';

interface TeacherHistorySummaryProps {
  total: number;
  limit: number;
}

const TeacherHistorySummary: React.FC<TeacherHistorySummaryProps> = ({ total, limit }) => {
  if (total === 0) return null;

  const capped = total >= limit;
  return (
    <p className="text-xs text-gray-500 mt-1">
      Showing {Math.min(total, limit)} of {capped ? `${total}+` : total} recent shares{capped ? ` (keeping the latest ${limit})` : ''}.
    </p>
  );
};

export default TeacherHistorySummary;
