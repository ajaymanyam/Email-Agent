import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try loading .env from candidate locations (root workspace or server directory)
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(__dirname, '../../../.env'),
  path.resolve(__dirname, '../../.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

export const env = {
  PORT: parseInt(optionalEnv('PORT', '5000'), 10),
  NODE_ENV: optionalEnv('NODE_ENV', 'development'),
  CLIENT_URL: optionalEnv('CLIENT_URL', 'http://localhost:3000'),

  MONGODB_URI: requireEnv('MONGODB_URI'),

  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: optionalEnv('JWT_EXPIRES_IN', '7d'),

  CREDENTIAL_ENCRYPTION_KEY: requireEnv('CREDENTIAL_ENCRYPTION_KEY'),

  // Gmail / Google OAuth (required in Phase 2)
  GOOGLE_CLIENT_ID: optionalEnv('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: optionalEnv('GOOGLE_CLIENT_SECRET'),
  GOOGLE_REDIRECT_URI: optionalEnv('GOOGLE_REDIRECT_URI'),

  // Microsoft / Outlook OAuth (required in Phase 9)
  MICROSOFT_CLIENT_ID: optionalEnv('MICROSOFT_CLIENT_ID'),
  MICROSOFT_CLIENT_SECRET: optionalEnv('MICROSOFT_CLIENT_SECRET'),
  MICROSOFT_REDIRECT_URI: optionalEnv('MICROSOFT_REDIRECT_URI'),

  // Google Calendar (required in Phase 8)
  GOOGLE_CALENDAR_REDIRECT_URI: optionalEnv('GOOGLE_CALENDAR_REDIRECT_URI'),

  // AI providers (required in Phase 5)
  OPENROUTER_API_KEY: optionalEnv('OPENROUTER_API_KEY'),
  GEMINI_API_KEY: optionalEnv('GEMINI_API_KEY'),
} as const;

export type Env = typeof env;
