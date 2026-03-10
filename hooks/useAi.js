'use client';

import { useChat } from '@ai-sdk/react';

/**
 * React hook wrapping the Vercel AI SDK's useChat for streaming
 * AI conversations. Points at the Fastify /api/ai/chat endpoint.
 *
 * @param {object} [options] - Additional useChat options to merge
 * @returns {{ messages, input, handleInputChange, handleSubmit, isLoading, error }}
 */
export function useAi(options = {}) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  } = useChat({
    api: `/api/ai/chat`,
    credentials: `include`,
    ...options,
  });

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  };
}
