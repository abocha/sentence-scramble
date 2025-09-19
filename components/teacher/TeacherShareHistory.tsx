import React, { useEffect, useRef, useState } from 'react';

import type { ShareHistoryEntry, TeacherFeedbackMessage } from '../../types';
import { buildQrFileName, formatHistoryTimestamp } from '../../utils/teacherAssignment';
import Button from '../Button';

interface TeacherShareHistoryProps {
  history: ShareHistoryEntry[];
  filteredHistory: ShareHistoryEntry[];
  historyFeedback: TeacherFeedbackMessage | null;
  historySearchQuery: string;
  onHistorySearchChange: (value: string) => void;
  onClearHistory: () => boolean;
  onRestore: (entry: ShareHistoryEntry) => void;
  onRemove: (id: string, createdAt: string) => void;
  onCopyInstructions: (entry: ShareHistoryEntry) => void | Promise<void>;
  onCopyLink: (entry: ShareHistoryEntry) => void | Promise<void>;
  onOpenLink: (entry: ShareHistoryEntry) => void;
  onDownloadQr: (entry: ShareHistoryEntry) => void | Promise<void>;
}

const TeacherShareHistory: React.FC<TeacherShareHistoryProps> = ({
  history,
  filteredHistory,
  historyFeedback,
  historySearchQuery,
  onHistorySearchChange,
  onClearHistory,
  onRestore,
  onRemove,
  onCopyInstructions,
  onCopyLink,
  onOpenLink,
  onDownloadQr,
}) => {
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const clearConfirmWrapperRef = useRef<HTMLDivElement | null>(null);
  const clearHistoryTriggerRef = useRef<HTMLButtonElement | null>(null);
  const clearConfirmFirstButtonRef = useRef<HTMLButtonElement | null>(null);
  const wasClearConfirmOpen = useRef(false);

  useEffect(() => {
    if (!isClearConfirmOpen) return undefined;

    const handlePointer = (event: MouseEvent | TouchEvent) => {
      if (!clearConfirmWrapperRef.current) return;
      const target = event.target as Node | null;
      if (target && clearConfirmWrapperRef.current.contains(target)) {
        return;
      }
      setIsClearConfirmOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsClearConfirmOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isClearConfirmOpen]);

  useEffect(() => {
    if (isClearConfirmOpen) {
      clearConfirmFirstButtonRef.current?.focus();
    } else if (wasClearConfirmOpen.current) {
      clearHistoryTriggerRef.current?.focus();
    }
    wasClearConfirmOpen.current = isClearConfirmOpen;
  }, [isClearConfirmOpen]);

  const handleClearHistory = () => {
    const cleared = onClearHistory();
    if (cleared || history.length === 0) {
      setIsClearConfirmOpen(false);
    }
  };

  return (
    <div className="mt-6 p-4 bg-white border rounded-lg">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">Recent shares</h3>
          <p className="text-sm text-gray-500 mt-1">Reuse a previous assignment without regenerating it.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="search"
            value={historySearchQuery}
            onChange={(event) => onHistorySearchChange(event.target.value)}
            placeholder="Search by title or sentence"
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
          {history.length > 0 && (
            <div className="relative" ref={clearConfirmWrapperRef}>
              <Button
                ref={clearHistoryTriggerRef}
                onClick={() => setIsClearConfirmOpen((prev) => !prev)}
                variant="tertiary"
                className="sm:w-auto"
                aria-expanded={isClearConfirmOpen}
                aria-controls="clear-history-confirm"
              >
                Clear history
              </Button>
              {isClearConfirmOpen && (
                <div
                  id="clear-history-confirm"
                  className="absolute right-0 top-full mt-2 flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 shadow-lg"
                >
                  <span>Clear all recent shares?</span>
                  <Button
                    ref={clearConfirmFirstButtonRef}
                    onClick={handleClearHistory}
                    variant="danger"
                    className="px-3 py-1 text-xs"
                  >
                    Yes, clear
                  </Button>
                  <Button
                    onClick={() => setIsClearConfirmOpen(false)}
                    variant="tertiary"
                    className="px-3 py-1 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {filteredHistory.length === 0 ? (
          <p className="text-sm text-gray-500">No recent shares match your search yet.</p>
        ) : filteredHistory.map((entry) => {
          const previewSentences = entry.sentences?.slice(0, 2).join('\n') ?? '';
          const remainingCount = Math.max((entry.sentences?.length ?? 0) - 2, 0);
          const attemptsLabel = entry.attemptsPerItem === 'unlimited'
            ? 'Unlimited attempts'
            : `${entry.attemptsPerItem} attempts per item`;

          return (
            <div key={`${entry.id}-${entry.createdAt}`} className="border border-gray-200 rounded-md p-3 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-800">{entry.title || 'Untitled assignment'}</p>
                  <p className="text-xs text-gray-500 flex flex-wrap gap-2">
                    <span>{formatHistoryTimestamp(entry.createdAt)}</span>
                    <span>· {attemptsLabel}</span>
                    <span className="font-mono break-all text-gray-400">ID: {entry.id}</span>
                  </p>
                </div>
                <div className="flex gap-2 sm:flex-1 sm:justify-end">
                  <Button
                    onClick={() => onRestore(entry)}
                    variant="primary"
                    fullWidth
                    className="sm:w-auto"
                  >
                    Restore
                  </Button>
                  <Button
                    onClick={() => onRemove(entry.id, entry.createdAt)}
                    variant="danger"
                    fullWidth
                    className="sm:w-auto"
                  >
                    Remove
                  </Button>
                </div>
              </div>
              <div className="mt-3 bg-white border border-gray-200 rounded-md p-3 overflow-hidden">
                <pre className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-700">
                  {previewSentences || 'Sentences unavailable for this entry.'}
                </pre>
                {remainingCount > 0 && (
                  <p className="mt-1 text-xs text-gray-500">+{remainingCount} more sentence{remainingCount > 1 ? 's' : ''}</p>
                )}
              </div>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                  onClick={() => void onCopyInstructions(entry)}
                  variant="success"
                  fullWidth
                  className="sm:flex-1"
                >
                  Copy Instructions
                </Button>
                <Button
                  onClick={() => void onCopyLink(entry)}
                  variant="secondary"
                  fullWidth
                  className="sm:flex-1"
                >
                  Copy Link
                </Button>
                <Button
                  onClick={() => onOpenLink(entry)}
                  variant="tertiary"
                  fullWidth
                  className="sm:flex-1"
                >
                  Open Link
                </Button>
                <Button
                  onClick={() => void onDownloadQr(entry)}
                  variant="neutral"
                  fullWidth
                  className="sm:flex-1"
                >
                  Download QR
                </Button>
              </div>
              <p className="mt-2 text-xs text-gray-500">Saved as <span className="font-medium">{entry.qrFileName || buildQrFileName(entry.title)}</span></p>
            </div>
          );
        })}
      </div>

      <div className="min-h-[1.25rem] mt-4 text-sm text-center" aria-live="polite">
        {historyFeedback && (
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <span className={historyFeedback.tone === 'success' ? 'text-green-700' : 'text-red-700'}>
              {historyFeedback.text}
            </span>
            {historyFeedback.actionLabel && historyFeedback.onAction && (
              <Button
                onClick={historyFeedback.onAction}
                variant="tertiary"
                className="px-3 py-1 text-xs"
              >
                {historyFeedback.actionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherShareHistory;
