import React, { useEffect, useMemo, useRef, useState } from 'react';
import type {
  Assignment,
  AssignmentOptions,
  ShareHistoryEntry,
  TeacherFeedbackMessage,
} from '../types';
import { DEFAULT_INSTRUCTIONS_TEMPLATE } from '../constants/teacher';
import { encodeAssignmentToCompactHash, encodeAssignmentToHash } from '../utils/encoding';
import {
  buildInstructionsFromTemplate,
  buildOptions,
  buildQrFileName,
  buildQrUrl,
  generateAssignmentId,
} from '../utils/teacherAssignment';
import { parseTeacherInput, splitIntoSentences } from '../utils/sentenceSplitter';
import Button, { getButtonClasses } from './Button';
import { useTeacherDraft } from './teacher/useTeacherDraft';
import { useShareHistory } from './teacher/useShareHistory';
import TeacherInstructionsCard from './teacher/TeacherInstructionsCard';
import TeacherShareOutput from './teacher/TeacherShareOutput';
import { useTeacherShareActions } from './teacher/useTeacherShareActions';
import TeacherShareHistory from './teacher/TeacherShareHistory';

const TeacherPanel: React.FC = () => {
  const {
    title,
    sentences,
    attemptsPerItem,
    revealAfterMaxAttempts,
    instructionsTemplate,
    isLoaded: isDraftLoaded,
    setTitle,
    setSentences,
    setAttemptsPerItem,
    setRevealAfterMaxAttempts,
    setInstructionsTemplate,
  } = useTeacherDraft();

  const {
    history,
    filteredHistory,
    historyFeedback,
    setHistoryFeedback,
    historySearchQuery,
    setHistorySearchQuery,
    addEntry,
    removeEntry,
    clearHistory: clearShareHistory,
    undoClear,
  } = useShareHistory();

  const [generatedLink, setGeneratedLink] = useState('');
  const [shareFeedback, setShareFeedback] = useState<TeacherFeedbackMessage | null>(null);
  const [titleError, setTitleError] = useState('');
  const [sentencesError, setSentencesError] = useState('');
  const [showInstructionsEditor, setShowInstructionsEditor] = useState(false);
  const hasAutoOpenedInstructions = useRef(false);

  const {
    copyText,
    downloadQrCode,
    isDownloadingQr,
    qrLoadError,
    setQrLoadError,
  } = useTeacherShareActions();

  const qrCodeUrl = useMemo(() => buildQrUrl(generatedLink), [generatedLink]);
  const instructionsPreview = useMemo(() => {
    const previewLink = generatedLink || '[Link will appear after you generate it]';

    return buildInstructionsFromTemplate(instructionsTemplate, {
      title: title || 'Assignment',
      link: previewLink,
      attemptsPerItem,
      createdAt: new Date().toISOString(),
    });
  }, [instructionsTemplate, title, generatedLink, attemptsPerItem]);
  const isUsingDefaultTemplate = useMemo(() => (
    instructionsTemplate.trim() === DEFAULT_INSTRUCTIONS_TEMPLATE.trim()
  ), [instructionsTemplate]);
  useEffect(() => {
    if (!isDraftLoaded || hasAutoOpenedInstructions.current) return;
    hasAutoOpenedInstructions.current = true;
    if (instructionsTemplate.trim() !== DEFAULT_INSTRUCTIONS_TEMPLATE.trim()) {
      setShowInstructionsEditor(true);
    }
  }, [isDraftLoaded, instructionsTemplate]);

  const handleSplitSentences = () => {
    const lines = splitIntoSentences(sentences);
    setSentences(lines.join('\n'));
  };

  const copyWithFeedback = async (
    text: string,
    messages: { success: string; unavailable: string; failed: string },
    target: 'share' | 'history' = 'share',
  ) => {
    if (!text) return;
    const setFeedback = target === 'share' ? setShareFeedback : setHistoryFeedback;
    setFeedback(null);
    const result = await copyText(text);

    if (result.ok) {
      setFeedback({ text: messages.success, tone: 'success' });
      return;
    }

    if (result.reason === 'unavailable') {
      setFeedback({ text: messages.unavailable, tone: 'error' });
      return;
    }

    if (result.reason === 'failed') {
      setFeedback({ text: messages.failed, tone: 'error' });
    }
  };

  const downloadQrWithFeedback = async (
    link: string,
    fileName: string,
    target: 'share' | 'history' = 'share',
    options?: { withLoading?: boolean },
  ) => {
    if (!link) return;
    const setFeedback = target === 'share' ? setShareFeedback : setHistoryFeedback;
    setFeedback(null);

    const result = await downloadQrCode(link, fileName, options);
    if (result.ok) {
      setFeedback({ text: `QR code downloaded as ${fileName}!`, tone: 'success' });
    } else {
      setFeedback({ text: 'Failed to download QR code. Try again or share the link directly.', tone: 'error' });
    }
  };

  const generateLink = () => {
    const sentenceArray = parseTeacherInput(sentences);

    let hasError = false;
    if (!title.trim()) {
      setTitleError('Please provide a title.');
      hasError = true;
    } else {
      setTitleError('');
    }

    if (!sentences.trim()) {
      setSentencesError('Please provide at least one sentence.');
      hasError = true;
    } else if (sentenceArray.length === 0) {
      setSentencesError('Please provide at least one valid sentence.');
      hasError = true;
    } else {
      setSentencesError('');
    }

    if (hasError) return;

    const options: AssignmentOptions = buildOptions(attemptsPerItem, revealAfterMaxAttempts);

    const assignment: Assignment = {
      id: generateAssignmentId(),
      title,
      version: 1,
      seed: Math.random().toString(36).substring(2, 10),
      options,
      sentences: sentenceArray,
    };

    const compactHash = encodeAssignmentToCompactHash(assignment);
    const base = window.location.href.split('#')[0];
    const hashPrefix = compactHash ? '#C=' : '#A='; // fall back to legacy format if compact encoding fails
    const hash = compactHash || encodeAssignmentToHash(assignment);
    const link = hash ? `${base}${hashPrefix}${hash}` : '';
    if (!link) {
      setShareFeedback({ text: 'Failed to generate a shareable link. Please try again.', tone: 'error' });
      return;
    }
    const createdAt = new Date().toISOString();
    const instructions = buildInstructionsFromTemplate(instructionsTemplate, {
      title,
      link,
      attemptsPerItem,
      createdAt,
    });
    const qrFileName = buildQrFileName(title);
    const sentenceTexts = sentenceArray.map((sentence) => sentence.text);

    setGeneratedLink(link);
    setShareFeedback(null);
    setQrLoadError(false);

    const entry: ShareHistoryEntry = {
      id: assignment.id,
      title,
      link,
      instructions,
      createdAt,
      attemptsPerItem,
      revealAfterMaxAttempts,
      template: instructionsTemplate,
      sentences: sentenceTexts,
      qrFileName,
    };

    addEntry(entry);
  };

  const copyToClipboard = async () => {
    if (!generatedLink) return;
    const instructions = buildInstructionsFromTemplate(instructionsTemplate, {
      title,
      link: generatedLink,
      attemptsPerItem,
      createdAt: new Date().toISOString(),
    });
    await copyWithFeedback(instructions, {
      success: 'Instructions copied to clipboard!',
      unavailable: 'Clipboard is not available in this browser.',
      failed: 'Failed to copy instructions.',
    });
  };

  const copyLinkToClipboard = async () => {
    if (!generatedLink) return;
    await copyWithFeedback(generatedLink, {
      success: 'Link copied to clipboard!',
      unavailable: 'Clipboard is not available in this browser.',
      failed: 'Failed to copy link.',
    });
  };

  const openLinkInNewTab = () => {
    if (!generatedLink) return;
    window.open(generatedLink, '_blank', 'noopener,noreferrer');
  };

  const downloadShareQr = async () => {
    if (!generatedLink) return;
    const fileName = buildQrFileName(title);
    await downloadQrWithFeedback(generatedLink, fileName, 'share', { withLoading: true });
  };

  const copyHistoryInstructions = async (entry: ShareHistoryEntry) => {
    const instructionsText = entry.instructions && entry.instructions.trim().length > 0
      ? entry.instructions
      : buildInstructionsFromTemplate(entry.template, {
        title: entry.title,
        link: entry.link,
        attemptsPerItem: entry.attemptsPerItem,
        createdAt: entry.createdAt,
      });
    await copyWithFeedback(instructionsText, {
      success: 'Instructions copied to clipboard!',
      unavailable: 'Clipboard is not available in this browser.',
      failed: 'Failed to copy instructions.',
    }, 'history');
  };

  const copyHistoryLink = async (entry: ShareHistoryEntry) => {
    await copyWithFeedback(entry.link, {
      success: 'Link copied to clipboard!',
      unavailable: 'Clipboard is not available in this browser.',
      failed: 'Failed to copy link.',
    }, 'history');
  };

  const openHistoryLink = (entry: ShareHistoryEntry) => {
    if (!entry.link) return;
    window.open(entry.link, '_blank', 'noopener,noreferrer');
  };

  const downloadHistoryQr = async (entry: ShareHistoryEntry) => {
    const fileName = entry.qrFileName || buildQrFileName(entry.title);
    await downloadQrWithFeedback(entry.link, fileName, 'history');
  };

  const restoreFromHistory = (entry: ShareHistoryEntry) => {
    setTitle(entry.title);
    setSentences(entry.sentences.join('\n'));
    setAttemptsPerItem(entry.attemptsPerItem);
    setRevealAfterMaxAttempts(entry.revealAfterMaxAttempts);
    setInstructionsTemplate(entry.template);
    setGeneratedLink(entry.link);
    setQrLoadError(false);
    setHistoryFeedback({ text: 'Assignment restored. Update anything you need, then share again.', tone: 'success' });
    if (entry.template.trim() !== DEFAULT_INSTRUCTIONS_TEMPLATE.trim()) {
      setShowInstructionsEditor(true);
    }
  };

  const removeHistoryEntry = (id: string, createdAt: string) => {
    removeEntry(id, createdAt);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8 mt-6">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Teacher Panel</h2>
        <p className="text-gray-500 mt-1">Create a new homework assignment.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Assignment Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError('');
            }}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., Adverbs of Frequency"
          />
          {titleError && <p className="mt-1 text-sm text-red-600">{titleError}</p>}
        </div>

        <div>
          <label htmlFor="sentences" className="block text-sm font-medium text-gray-700">Sentences</label>
          <p className="text-sm text-gray-500 mt-1">One sentence per line. Or paste a paragraph and click Split into sentences.</p>
          <textarea
            id="sentences"
            rows={10}
            value={sentences}
            onChange={(e) => {
              setSentences(e.target.value);
              if (sentencesError) setSentencesError('');
            }}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="The quick brown fox jumps over the lazy dog.&#10;She sells seashells by the seashore."
          />
          {sentencesError && <p className="mt-1 text-sm text-red-600">{sentencesError}</p>}
          <Button
            onClick={handleSplitSentences}
            variant="neutral"
            fullWidth
            className="mt-2 sm:w-auto px-4 py-2 text-sm font-semibold"
          >
            Split into sentences
          </Button>
        </div>

        <div>
          <label htmlFor="attempts-per-item" className="block text-sm font-medium text-gray-700">Attempts per item</label>
          <select
            id="attempts-per-item"
            value={attemptsPerItem}
            onChange={(e) => setAttemptsPerItem(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="unlimited">Unlimited</option>
          </select>
          <label className="mt-2 inline-flex items-center">
            <input
              type="checkbox"
              checked={revealAfterMaxAttempts}
              onChange={(e) => setRevealAfterMaxAttempts(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">Reveal answer after max attempts</span>
          </label>
        </div>

        <TeacherInstructionsCard
          instructionsTemplate={instructionsTemplate}
          onTemplateChange={setInstructionsTemplate}
          showInstructionsEditor={showInstructionsEditor}
          onToggleEditor={() => setShowInstructionsEditor((prev) => !prev)}
          instructionsPreview={instructionsPreview}
          isUsingDefaultTemplate={isUsingDefaultTemplate}
        />

        <div className="flex justify-between items-center flex-wrap gap-4">
          <Button
            onClick={generateLink}
            variant="primary"
            fullWidth
            className="sm:w-auto"
          >
            Generate Link
          </Button>
          <a
            href="#practice"
            className={getButtonClasses('secondary', { fullWidth: true, extra: 'sm:w-auto text-center' })}
          >
            Back to Practice
          </a>
        </div>

        {generatedLink && (
          <TeacherShareOutput
            generatedLink={generatedLink}
            shareFeedback={shareFeedback}
            onCopyInstructions={() => { void copyToClipboard(); }}
            onCopyLink={() => { void copyLinkToClipboard(); }}
            onOpenLink={openLinkInNewTab}
            onDownloadQr={() => { void downloadShareQr(); }}
            qrCodeUrl={qrCodeUrl}
            qrLoadError={qrLoadError}
            onQrLoadSuccess={() => setQrLoadError(false)}
            onQrLoadError={() => setQrLoadError(true)}
            isDownloadingQr={isDownloadingQr}
          />
        )}

        {(history.length > 0 || historySearchQuery || historyFeedback) && (
          <TeacherShareHistory
            history={history}
            filteredHistory={filteredHistory}
            historyFeedback={historyFeedback}
            historySearchQuery={historySearchQuery}
            onHistorySearchChange={setHistorySearchQuery}
            onClearHistory={clearShareHistory}
            onRestore={restoreFromHistory}
            onRemove={removeHistoryEntry}
            onCopyInstructions={copyHistoryInstructions}
            onCopyLink={copyHistoryLink}
            onOpenLink={openHistoryLink}
            onDownloadQr={downloadHistoryQr}
          />
        )}
      </div>
    </div>
  );
};

export default TeacherPanel;
