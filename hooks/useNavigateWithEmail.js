'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from './useAppContext';

/**
 * Hook that wraps the "stash email in AppContext, then router.push" pattern.
 *
 * @param {() => string} getEmail — returns the current email value to stash
 * @returns {(path: string) => void} navigateWithEmail
 */
export function useNavigateWithEmail(getEmail) {
  const router = useRouter();
  const { set } = useAppContext();

  return useCallback((path) => {
    const email = getEmail()?.trim();
    if (email) set(`prefillEmail`, email);
    router.push(path);
  }, [getEmail, set, router]);
}
