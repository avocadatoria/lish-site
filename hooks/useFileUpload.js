'use client';

import { useState, useCallback } from 'react';
import { apiFetch } from '../lib/api-client.js';

/**
 * File upload hook using pre-signed S3 URLs.
 *
 * Flow:
 * 1. Request a signed upload URL from the API
 * 2. PUT the file directly to S3 via XMLHttpRequest (for progress tracking)
 * 3. Return the public URL on completion
 *
 * @returns {{ upload: (file: File) => Promise<{ key: string, publicUrl: string }>, progress: number, uploading: boolean, error: Error|null, reset: () => void }}
 */
export function useFileUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const reset = useCallback(() => {
    setProgress(0);
    setUploading(false);
    setError(null);
  }, []);

  const upload = useCallback(async (file) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // 1. Get signed URL from API
      const { uploadUrl, key, publicUrl } = await apiFetch(`/api/uploads/signed-url`, {
        method: `POST`,
        body: { filename: file.name, contentType: file.type },
      });

      // 2. Upload directly to S3 with progress tracking
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener(`progress`, (event) => {
          if (event.lengthComputable) {
            const pct = Math.round((event.loaded / event.total) * 100);
            setProgress(pct);
          }
        });

        xhr.addEventListener(`load`, () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setProgress(100);
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener(`error`, () => {
          reject(new Error(`Upload failed — network error`));
        });

        xhr.addEventListener(`abort`, () => {
          reject(new Error(`Upload aborted`));
        });

        xhr.open(`PUT`, uploadUrl);
        xhr.setRequestHeader(`Content-Type`, file.type);
        xhr.send(file);
      });

      return { key, publicUrl };
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  return { upload, progress, uploading, error, reset };
}
