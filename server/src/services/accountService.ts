import { EmailAccount, IEmailAccount } from '../models/EmailAccount';
import { EmailMessage } from '../models/EmailMessage';
import {
  getAuthorizationUrl,
  parseAndValidateState,
  exchangeCodeForTokens,
  refreshAccessToken,
  revokeGoogleToken,
} from '../integrations/gmail/gmailAuth';
import { outlookAuthApi } from '../integrations/outlook/outlookAuth';
import { encrypt, decrypt } from '../utils/encryption';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export const accountService = {
  /**
   * Generates Google OAuth consent URL for user.
   */
  getGoogleAuthUrl(userId: string): string {
    return getAuthorizationUrl(userId);
  },

  /**
   * Generates Microsoft OAuth consent URL for user.
   */
  getMicrosoftAuthUrl(userId: string): string {
    return outlookAuthApi.getAuthorizationUrl(userId);
  },

  /**
   * Processes Microsoft OAuth callback, encrypts tokens, and upserts EmailAccount.
   */
  async handleMicrosoftCallback(code: string, state: string): Promise<IEmailAccount> {
    const rawState = Buffer.from(state, 'base64url').toString('utf8');
    const { userId } = JSON.parse(rawState);
    const { accessToken, refreshToken, expiresAt, scopes, profile } =
      await outlookAuthApi.exchangeCodeForTokens(code);

    const encryptedAccessToken = encrypt(accessToken);
    let encryptedRefreshToken = '';

    if (refreshToken) {
      encryptedRefreshToken = encrypt(refreshToken);
    } else {
      const existing = await EmailAccount.findOne({
        owner: userId,
        email: profile.email,
        provider: 'outlook',
      }).select('+encryptedRefreshToken');

      if (existing && existing.encryptedRefreshToken) {
        encryptedRefreshToken = existing.encryptedRefreshToken;
      }
    }

    const account = await EmailAccount.findOneAndUpdate(
      {
        owner: userId,
        email: profile.email,
        provider: 'outlook',
      },
      {
        $set: {
          providerAccountId: profile.id,
          encryptedAccessToken,
          encryptedRefreshToken,
          scopes,
          expiresAt,
          isConnected: true,
          status: 'connected',
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    logger.info('Microsoft Outlook account connected successfully', {
      userId,
      email: profile.email,
      accountId: account._id.toString(),
    });

    return account;
  },

  /**
   * Processes Google OAuth callback, encrypts tokens, and upserts EmailAccount.
   */
  async handleGoogleCallback(code: string, state: string): Promise<IEmailAccount> {
    const { userId } = parseAndValidateState(state);
    const { accessToken, refreshToken, expiresAt, scopes, profile } =
      await exchangeCodeForTokens(code);

    const encryptedAccessToken = encrypt(accessToken);
    let encryptedRefreshToken = '';

    if (refreshToken) {
      encryptedRefreshToken = encrypt(refreshToken);
    } else {
      // If Google did not return a new refresh token, preserve existing one if present
      const existing = await EmailAccount.findOne({
        owner: userId,
        email: profile.email,
        provider: 'gmail',
      }).select('+encryptedRefreshToken');

      if (existing && existing.encryptedRefreshToken) {
        encryptedRefreshToken = existing.encryptedRefreshToken;
      } else {
        throw createError(
          'Google did not provide a refresh token. Please revoke access in Google Account Settings and retry.',
          400,
          'OAUTH_MISSING_REFRESH_TOKEN'
        );
      }
    }

    const account = await EmailAccount.findOneAndUpdate(
      {
        owner: userId,
        email: profile.email,
        provider: 'gmail',
      },
      {
        $set: {
          providerAccountId: profile.id,
          encryptedAccessToken,
          encryptedRefreshToken,
          scopes,
          expiresAt,
          isConnected: true,
          status: 'connected',
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    logger.info('Gmail account connected successfully', {
      userId,
      email: profile.email,
      accountId: account._id.toString(),
    });

    return account;
  },

  /**
   * Lists all connected accounts for an authenticated user.
   */
  async getAccountsForUser(userId: string): Promise<IEmailAccount[]> {
    return EmailAccount.find({ owner: userId }).sort({ createdAt: -1 });
  },

  /**
   * Retrieves an account by ID and verifies user ownership.
   */
  async getAccountById(userId: string, accountId: string): Promise<IEmailAccount> {
    const account = await EmailAccount.findOne({ _id: accountId, owner: userId });
    if (!account) {
      throw createError('Email account not found.', 404, 'ACCOUNT_NOT_FOUND');
    }
    return account;
  },

  /**
   * Checks the health and status of an email account.
   */
  async getAccountStatus(userId: string, accountId: string) {
    const account = await this.getAccountById(userId, accountId);
    const isExpired = new Date(account.expiresAt) <= new Date();

    return {
      id: account._id.toString(),
      email: account.email,
      provider: account.provider,
      isConnected: account.isConnected,
      status: account.status,
      expiresAt: account.expiresAt,
      isExpired,
    };
  },

  /**
   * Disconnects and revokes an account.
   */
  async disconnectAccount(userId: string, accountId: string): Promise<void> {
    const account = await EmailAccount.findOne({
      _id: accountId,
      owner: userId,
    }).select('+encryptedAccessToken +encryptedRefreshToken');

    if (!account) {
      throw createError('Email account not found.', 404, 'ACCOUNT_NOT_FOUND');
    }

    if (account.provider === 'gmail' && account.encryptedAccessToken) {
      await revokeGoogleToken(account.encryptedAccessToken);
    }

    account.isConnected = false;
    account.status = 'disconnected';
    account.encryptedAccessToken = '';
    account.encryptedRefreshToken = '';
    await account.save();

    // Wipe all cached synchronized emails for this account immediately upon disconnection
    await EmailMessage.deleteMany({
      owner: userId,
      emailAccountId: accountId,
    });

    logger.info('Email account disconnected and cached emails purged', {
      userId,
      accountId,
      email: account.email,
    });
  },

  /**
   * Retrieves a valid plaintext access token for making email API calls.
   * Auto-refreshes using the encrypted refresh token if expired or expiring within 5 minutes.
   */
  async getValidAccessToken(accountId: string): Promise<string> {
    const account = await EmailAccount.findById(accountId).select(
      '+encryptedAccessToken +encryptedRefreshToken'
    );

    if (!account || !account.isConnected) {
      throw createError(
        'Email account is not connected.',
        400,
        'EMAIL_ACCOUNT_NOT_CONNECTED'
      );
    }

    const bufferMinutes = 5 * 60 * 1000;
    const isExpiringSoon =
      new Date(account.expiresAt).getTime() - Date.now() < bufferMinutes;

    if (!isExpiringSoon && account.encryptedAccessToken) {
      return decrypt(account.encryptedAccessToken);
    }

    // Refresh token
    if (!account.encryptedRefreshToken) {
      account.isConnected = false;
      account.status = 'expired';
      await account.save();
      throw createError(
        `${account.provider === 'outlook' ? 'Microsoft Outlook' : 'Gmail'} authorization expired. Please reconnect your account.`,
        401,
        'OAUTH_TOKEN_EXPIRED'
      );
    }

    let refreshed: { accessToken: string; expiresAt: Date };
    if (account.provider === 'outlook') {
      const decryptedRefresh = decrypt(account.encryptedRefreshToken);
      refreshed = await outlookAuthApi.refreshAccessToken(decryptedRefresh);
    } else {
      refreshed = await refreshAccessToken(account.encryptedRefreshToken);
    }

    account.encryptedAccessToken = encrypt(refreshed.accessToken);
    account.expiresAt = refreshed.expiresAt;
    account.status = 'connected';
    await account.save();

    logger.info('Access token refreshed successfully', {
      accountId: account._id.toString(),
      email: account.email,
    });

    return refreshed.accessToken;
  },

  /**
   * Permanently deletes an email account and all associated synchronized emails.
   */
  async deleteAccount(userId: string, accountId: string): Promise<void> {
    const account = await EmailAccount.findOne({ _id: accountId, owner: userId }).select(
      '+encryptedAccessToken'
    );

    if (!account) {
      throw createError('Email account not found.', 404, 'ACCOUNT_NOT_FOUND');
    }

    if (account.provider === 'gmail' && account.encryptedAccessToken) {
      await revokeGoogleToken(account.encryptedAccessToken).catch(() => {});
    }

    await Promise.all([
      EmailAccount.deleteOne({ _id: accountId, owner: userId }),
      EmailMessage.deleteMany({ owner: userId, emailAccountId: accountId }),
    ]);

    logger.info('Email account and all cached emails permanently removed', {
      userId,
      accountId,
      email: account.email,
    });
  },
};
