'use client';

/**
 * Browser-side structured logger.
 * Same interface as the server-side Pino logger.
 */
function createBrowserLogger(name = `app`) {
  const prefix = `[${name}]`;

  return {
    info: (...args) => console.info(prefix, ...args),    // eslint-disable-line no-console
    warn: (...args) => console.warn(prefix, ...args),
    error: (...args) => console.error(prefix, ...args),
    debug: (...args) => console.debug(prefix, ...args),  // eslint-disable-line no-console
    fatal: (...args) => console.error(prefix, `FATAL:`, ...args),
    child: (bindings) => createBrowserLogger(`${name}:${JSON.stringify(bindings)}`),
  };
}

export const logger = createBrowserLogger();
export { createBrowserLogger as createLogger };
