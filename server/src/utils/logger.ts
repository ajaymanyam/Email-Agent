type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: unknown;
}

const SENSITIVE_KEYS = [
  'password',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'geminikey',
  'clientsecret',
  'secret',
];

function sanitizeMeta(obj: unknown): unknown {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeMeta);

  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.some((sk) => k.toLowerCase().includes(sk))) {
      clean[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null) {
      clean[k] = sanitizeMeta(v);
    } else {
      clean[k] = v;
    }
  }
  return clean;
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const sanitizedMeta = meta ? (sanitizeMeta(meta) as Record<string, unknown>) : {};
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...sanitizedMeta,
  };

  const output = JSON.stringify(entry);

  if (level === 'error') {
    console.error(output);
  } else if (level === 'warn') {
    console.warn(output);
  } else {
    console.log(output);
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (process.env['NODE_ENV'] !== 'production') {
      log('debug', message, meta);
    }
  },
};
