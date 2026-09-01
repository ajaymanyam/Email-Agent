import axios from 'axios';
import { env } from '../../config/env';
import { createError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';

const MS_AUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const MS_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const MS_SCOPES = [
  'openid',
  'profile',
  'email',
  'offline_access',
  'Mail.ReadWrite',
  'Mail.Send',
  'User.Read',
];

export interface OutlookTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scopes: string[];
  profile: {
    id: string;
    email: string;
    name: string;
  };
}

export const outlookAuthApi = {
  /**
   * Generates Microsoft OAuth consent URL
   */
  getAuthorizationUrl(userId: string): string {
    if (!env.MICROSOFT_CLIENT_ID || !env.MICROSOFT_REDIRECT_URI) {
      throw createError(
        'Microsoft OAuth credentials not configured in environment.',
        500,
        'OAUTH_CONFIG_MISSING'
      );
    }

    const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64url');

    const params = new URLSearchParams({
      client_id: env.MICROSOFT_CLIENT_ID,
      response_type: 'code',
      redirect_uri: env.MICROSOFT_REDIRECT_URI,
      response_mode: 'query',
      scope: MS_SCOPES.join(' '),
      state,
      prompt: 'consent',
    });

    return `${MS_AUTH_URL}?${params.toString()}`;
  },

  /**
   * Exchanges authorization code for tokens and user profile
   */
  async exchangeCodeForTokens(code: string): Promise<OutlookTokens> {
    try {
      const body = new URLSearchParams({
        client_id: env.MICROSOFT_CLIENT_ID || '',
        client_secret: env.MICROSOFT_CLIENT_SECRET || '',
        code,
        redirect_uri: env.MICROSOFT_REDIRECT_URI || '',
        grant_type: 'authorization_code',
        scope: MS_SCOPES.join(' '),
      });

      const res = await axios.post(MS_TOKEN_URL, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token, refresh_token, expires_in, scope } = res.data;
      const expiresAt = new Date(Date.now() + expires_in * 1000);

      // Fetch user profile from Microsoft Graph
      const profileRes = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const email = profileRes.data.mail || profileRes.data.userPrincipalName;
      const name = profileRes.data.displayName || email.split('@')[0];

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
        scopes: scope ? scope.split(' ') : MS_SCOPES,
        profile: {
          id: profileRes.data.id,
          email,
          name,
        },
      };
    } catch (err: any) {
      logger.error('Failed to exchange Microsoft OAuth code', { error: err.message });
      throw createError(
        'Failed to authenticate with Microsoft Outlook.',
        400,
        'OUTLOOK_OAUTH_FAILED'
      );
    }
  },

  /**
   * Refreshes expired Microsoft access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: Date }> {
    try {
      const body = new URLSearchParams({
        client_id: env.MICROSOFT_CLIENT_ID || '',
        client_secret: env.MICROSOFT_CLIENT_SECRET || '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        scope: MS_SCOPES.join(' '),
      });

      const res = await axios.post(MS_TOKEN_URL, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token, expires_in } = res.data;
      const expiresAt = new Date(Date.now() + expires_in * 1000);

      return { accessToken: access_token, expiresAt };
    } catch (err: any) {
      logger.error('Failed to refresh Microsoft token', { error: err.message });
      throw createError(
        'Microsoft authorization expired. Please reconnect your account.',
        401,
        'OAUTH_TOKEN_EXPIRED'
      );
    }
  },
};
