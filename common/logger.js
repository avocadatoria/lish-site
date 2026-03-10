const isServer = typeof window === `undefined`;

let pinoModule = null;

async function getPino() {
  if (!pinoModule) {
    pinoModule = (await import(`pino`)).default;
  }
  return pinoModule;
}

/**
 * Creates a Pino logger on the server, structured console wrapper in the browser.
 * Same interface: .info(), .warn(), .error(), .debug(), .fatal()
 */
export function createLogger(name = `app`) {
  if (isServer) {
    return createServerLogger(name);
  }
  return createBrowserLogger(name);
}

function createServerLogger(name) {
  // Return a proxy that lazily initializes pino
  let logger = null;
  let pending = [];

  const isDev = process.env.NODE_ENV !== `production`;

  // Eagerly initialize
  const _init = getPino().then((pino) => {
    const opts = {
      name,
      level: process.env.LOG_LEVEL,
    };

    if (isDev) {
      logger = pino({
        ...opts,
        transport: {
          target: `pino-pretty`,
          options: {
            colorize: true,
          },
        },
      });
    } else {
      logger = pino(opts);
    }

    // Flush pending calls
    for (const { method, args } of pending) {
      logger[method](...args);
    }
    pending = [];
  });

  // Proxy that queues calls until pino is ready
  return new Proxy({}, {
    get(_, method) {
      if (typeof method !== `string`) return undefined;
      return (...args) => {
        if (logger) {
          return logger[method](...args);
        }
        pending.push({ method, args });
      };
    },
  });
}

function createBrowserLogger(name) {
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

export const logger = createLogger();
