import { useCallback, useState } from 'react';

import { buildQrUrl } from '../../utils/teacherAssignment';

type CopyFailureReason = 'empty' | 'unavailable' | 'failed';

export type CopyResult =
  | { ok: true }
  | { ok: false; reason: CopyFailureReason };

export type DownloadResult =
  | { ok: true }
  | { ok: false };

interface DownloadOptions {
  withLoading?: boolean;
}

const copyUnavailable: CopyResult = { ok: false, reason: 'unavailable' };
const copyEmpty: CopyResult = { ok: false, reason: 'empty' };
const copyFailed: CopyResult = { ok: false, reason: 'failed' };

export const useTeacherShareActions = () => {
  const [isDownloadingQr, setIsDownloadingQr] = useState(false);
  const [qrLoadError, setQrLoadError] = useState(false);

  const copyText = useCallback(async (text: string): Promise<CopyResult> => {
    if (!text) return copyEmpty;
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return copyUnavailable;
    }

    try {
      await navigator.clipboard.writeText(text);
      return { ok: true };
    } catch (error) {
      console.error('Failed to copy to clipboard', error);
      return copyFailed;
    }
  }, []);

  const downloadQrCode = useCallback(async (
    link: string,
    fileName: string,
    options: DownloadOptions = {},
  ): Promise<DownloadResult> => {
    if (!link) return { ok: false };

    const { withLoading } = options;
    if (withLoading) setIsDownloadingQr(true);

    try {
      const qrUrl = buildQrUrl(link);
      if (!qrUrl) {
        throw new Error('Missing QR code URL');
      }

      const response = await fetch(qrUrl);
      if (!response.ok) {
        throw new Error('QR download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
      return { ok: true };
    } catch (error) {
      console.error('Failed to download QR code', error);
      return { ok: false };
    } finally {
      if (withLoading) setIsDownloadingQr(false);
    }
  }, []);

  return {
    copyText,
    downloadQrCode,
    isDownloadingQr,
    qrLoadError,
    setQrLoadError,
  };
};

export type UseTeacherShareActionsReturn = ReturnType<typeof useTeacherShareActions>;
