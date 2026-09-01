import axios from 'axios';
import { googleConfig } from '../../config/google';
import { encrypt, decrypt } from '../../utils/encryption';
import { createError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';

/**
 * Generates the Google OAuth 2.0 consent URL.
 * Encrypts userId into state parameter to prevent CSRF and link account back to authenticated user.
 */
export function getAuthorizationUrl(userId: string): string {
  if (!googleConfig.clientId || !googleConfig.clientSecret) {
    throw createError(
      'Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) are not configured in .env',
      500,
      'OAUTH_NOT_CONFIGURED'
    );
  }

  const statePayload = JSON.stringify({
    userId,
    timestamp: Date.now(),
  });

  const state = Buffer.from(encrypt(statePayload)).toString('base64url');

  const params = new URLSearchParams({
    client_id: googleConfig.clientId,
    redirect_uri: googleConfig.redirectUri,
    response_type: 'code',
    scope: googleConfig.scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Validates state param and decrypts the embedded userId.
 */
export function parseAndValidateState(state: string): { userId: string } {
  try {
    let rawEncrypted = state;
    if (!state.includes(':')) {
      rawEncrypted = Buffer.from(state, 'base64url').toString('utf8');
    }
    const decrypted = decrypt(rawEncrypted);
    const parsed = JSON.parse(decrypted);

    // State expires after 15 minutes
    if (!parsed.userId || Date.now() - parsed.timestamp > 15 * 60 * 1000) {
      throw new Error('OAuth state expired or invalid');
    }

    return { userId: parsed.userId };
  } catch (error) {
    logger.error('Failed to validate OAuth state', { error: String(error) });
    throw createError('Invalid or expired OAuth state parameter.', 400, 'OAUTH_FAILED');
  }
}

/**
 * Exchanges authorization code for tokens and fetches Google user profile.
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scopes: string[];
  profile: { email: string; id: string; name?: string };
}> {
  try {
    // 1. Exchange code for access & refresh tokens
    const tokenRes = await axios.post<{
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      scope?: string;
      token_type: string;
    }>(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        code,
        client_id: googleConfig.clientId,
        client_secret: googleConfig.clientSecret,
        redirect_uri: googleConfig.redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const tokens = tokenRes.data;

    if (!tokens.access_token) {
      throw new Error('No access token returned from Google');
    }

    // 2. Fetch user profile (email & sub ID)
    const userRes = await axios.get<{
      id: string;
      email: string;
      name?: string;
      picture?: string;
    }>('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const userInfo = userRes.data;

    if (!userInfo.email || !userInfo.id) {
      throw new Error('Failed to retrieve user email from Google userinfo');
    }

    const expiresInSeconds = tokens.expires_in || 3600;
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    const scopes = tokens.scope ? tokens.scope.split(' ') : googleConfig.scopes;

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || '',
      expiresAt,
      scopes,
      profile: {
        email: userInfo.email.toLowerCase(),
        id: userInfo.id,
        name: userInfo.name || undefined,
      },
    };
  } catch (error: any) {
    const detail = error.response?.data?.error_description || error.response?.data?.error || error.message;
    logger.error('Google OAuth token exchange failed', { error: detail });
    throw createError(
      `Failed to exchange authorization code with Google: ${detail}`,
      400,
      'OAUTH_FAILED'
    );
  }
}

/**
 * Refreshes an expired access token using the encrypted refresh token.
 */
export async function refreshAccessToken(encryptedRefreshToken: string): Promise<{
  accessToken: string;
  expiresAt: Date;
}> {
  const plainRefreshToken = decrypt(encryptedRefreshToken);

  try {
    const res = await axios.post<{
      access_token: string;
      expires_in: number;
      scope?: string;
    }>(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        client_id: googleConfig.clientId,
        client_secret: googleConfig.clientSecret,
        refresh_token: plainRefreshToken,
        grant_type: 'refresh_token',
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    if (!res.data.access_token) {
      throw new Error('No access token returned during token refresh');
    }

    const expiresInSeconds = res.data.expires_in || 3600;
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    return {
      accessToken: res.data.access_token,
      expiresAt,
    };
  } catch (error: any) {
    const errorType = error.response?.data?.error;
    logger.error('Google OAuth token refresh failed', { error: error.message, errorType });

    if (errorType === 'invalid_grant') {
      throw createError(
        'Gmail authorization has expired or was revoked. Please reconnect your account.',
        401,
        'OAUTH_REVOKED'
      );
    }
    throw createError('Failed to refresh Gmail access token.', 500, 'OAUTH_TOKEN_EXPIRED');
  }
}

/**
 * Revokes Google OAuth token when disconnecting an account.
 */
export async function revokeGoogleToken(encryptedToken: string): Promise<void> {
  try {
    const token = decrypt(encryptedToken);
    await axios.post(
      'https://oauth2.googleapis.com/revoke',
      new URLSearchParams({ token }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );
  } catch (error: any) {
    // Non-fatal if token is already revoked
    logger.warn('Failed to revoke Google token at endpoint', { error: error.message });
  }
}
