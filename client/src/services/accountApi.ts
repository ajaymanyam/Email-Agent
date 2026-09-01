import { api } from './api';
import { EmailAccount, AccountStatus } from '@/types/account';

export const accountApi = {
  async getGoogleAuthUrl(): Promise<string> {
    const res = await api.get<{ success: boolean; data: { url: string } }>('/gmail/oauth/start');
    return res.data.data.url;
  },

  async getMicrosoftAuthUrl(): Promise<string> {
    const res = await api.get<{ success: boolean; data: { url: string } }>('/accounts/outlook/start');
    return res.data.data.url;
  },

  async listAccounts(): Promise<EmailAccount[]> {
    const res = await api.get<{ success: boolean; data: { accounts: EmailAccount[] } }>('/accounts');
    return res.data.data.accounts;
  },

  async getAccount(id: string): Promise<EmailAccount> {
    const res = await api.get<{ success: boolean; data: { account: EmailAccount } }>(`/accounts/${id}`);
    return res.data.data.account;
  },

  async getAccountStatus(id: string): Promise<{
    id: string;
    email: string;
    provider: string;
    isConnected: boolean;
    status: AccountStatus;
    expiresAt: string;
    isExpired: boolean;
  }> {
    const res = await api.get<{ success: boolean; data: { status: any } }>(`/accounts/${id}/status`);
    return res.data.data.status;
  },

  async disconnectAccount(id: string): Promise<void> {
    await api.post(`/accounts/${id}/disconnect`);
  },
};
