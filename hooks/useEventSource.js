'use client';

import { useEffect, useRef } from 'react';

/**
 * SSE (Server-Sent Events) hook with automatic reconnection.
 *
 * @param {string} url - SSE endpoint URL (e.g. `/api/sse`)
 * @param {Object} opts
 * @param {(event: MessageEvent) => void} opts.onMessage - Called for each SSE message
 * @param {(event: Event) => void}        [opts.onError]  - Called on connection error
 * @param {boolean}                       [opts.enabled=true] - Toggle connection on/off
 */
export function useEventSource(url, { onMessage, onError, enabled = true } = {}) {
  const sourceRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);

  // Keep callback refs current without triggering reconnect
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!enabled || !url) return;

    let closed = false;

    function connect() {
      if (closed) return;

      const es = new EventSource(url, { withCredentials: true });
      sourceRef.current = es;

      es.onmessage = (event) => {
        onMessageRef.current?.(event);
      };

      es.onerror = (event) => {
        onErrorRef.current?.(event);

        // EventSource auto-reconnects on network errors, but if the
        // connection is fully closed we schedule our own reconnect.
        if (es.readyState === EventSource.CLOSED && !closed) {
          sourceRef.current = null;
          reconnectTimerRef.current = setTimeout(connect, 3000);
        }
      };
    }

    connect();

    return () => {
      closed = true;

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      if (sourceRef.current) {
        sourceRef.current.close();
        sourceRef.current = null;
      }
    };
  }, [url, enabled]);
}
