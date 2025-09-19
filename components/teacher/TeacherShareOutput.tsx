import React from 'react';

import Button, { getButtonClasses } from '../Button';
import type { TeacherFeedbackMessage } from '../../types';

interface TeacherShareOutputProps {
  generatedLink: string;
  shareFeedback: TeacherFeedbackMessage | null;
  onCopyInstructions: () => void;
  onCopyLink: () => void;
  onOpenLink: () => void;
  onDownloadQr: () => void;
  qrCodeUrl: string;
  qrLoadError: boolean;
  onQrLoadSuccess: () => void;
  onQrLoadError: () => void;
  isDownloadingQr: boolean;
}

const TeacherShareOutput: React.FC<TeacherShareOutputProps> = ({
  generatedLink,
  shareFeedback,
  onCopyInstructions,
  onCopyLink,
  onOpenLink,
  onDownloadQr,
  qrCodeUrl,
  qrLoadError,
  onQrLoadSuccess,
  onQrLoadError,
  isDownloadingQr,
}) => {
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
      <h3 className="font-semibold">Generated Link:</h3>
      <input
        type="text"
        readOnly
        value={generatedLink}
        className="w-full p-2 mt-2 bg-white border rounded"
        onFocus={(event) => event.target.select()}
      />
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          onClick={onCopyInstructions}
          variant="success"
          fullWidth
          className="sm:flex-1"
        >
          Copy Instructions for Student
        </Button>
        <Button
          onClick={onCopyLink}
          variant="secondary"
          fullWidth
          className="sm:flex-1"
        >
          Copy Link Only
        </Button>
        <Button
          onClick={onOpenLink}
          variant="tertiary"
          fullWidth
          className="sm:flex-1"
        >
          Open Link in New Tab
        </Button>
      </div>
      <div className="mt-2 min-h-[1.25rem] text-sm text-center" aria-live="polite">
        {shareFeedback && (
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <span className={shareFeedback.tone === 'success' ? 'text-green-700' : 'text-red-700'}>
              {shareFeedback.text}
            </span>
            {shareFeedback.actionLabel && shareFeedback.onAction && (
              <Button
                onClick={shareFeedback.onAction}
                variant="tertiary"
                className="px-3 py-1 text-xs"
              >
                {shareFeedback.actionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
      {qrCodeUrl && (
        <div className="mt-6">
          <h4 className="font-semibold text-sm text-gray-700">Share with a QR code</h4>
          <p className="text-sm text-gray-600 mt-1">Students can scan the QR code to open the assignment instantly.</p>
          <div className="mt-4 flex flex-col items-center">
            <img
              src={qrCodeUrl}
              alt="QR code linking to the generated assignment"
              className="h-48 w-48 rounded-lg shadow"
              loading="lazy"
              onLoad={onQrLoadSuccess}
              onError={onQrLoadError}
            />
            {qrLoadError ? (
              <p className="mt-3 text-sm text-red-700 text-center">
                We couldn't load the QR code. Try again or share the link directly.
              </p>
            ) : (
              <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row">
                <a
                  href={qrCodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={getButtonClasses('tertiary', { extra: 'sm:w-auto' })}
                >
                  View Full Size
                </a>
                <Button
                  onClick={onDownloadQr}
                  variant="neutral"
                  className="sm:w-auto"
                  disabled={isDownloadingQr}
                >
                  {isDownloadingQr ? 'Downloading…' : 'Download QR Code'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherShareOutput;
