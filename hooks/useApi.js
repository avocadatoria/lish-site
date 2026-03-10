'use client';

import { useState, useCallback } from 'react';
import { apiFetch } from '../lib/api-client.js';

/**
 * API fetch hook with loading/error state.
 *
 * @param {string} path - API path
 * @param {RequestInit} [defaultOptions] - Default fetch options
 */
export function useApi(path, defaultOptions = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async (overrides = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFetch(path, { ...defaultOptions, ...overrides });
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [path, defaultOptions]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, error, loading, execute, reset };
}
