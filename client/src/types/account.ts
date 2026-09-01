export type EmailProvider = 'gmail' | 'outlook';

export type AccountStatus =
  | 'connected'
  | 'disconnected'
  | 'expired'
  | 'revoked'
  | 'error';

export interface EmailAccount {
  _id: string;
  owner: string;
  provider: EmailProvider;
  email: string;
  providerAccountId: string;
  scopes: string[];
  isConnected: boolean;
  status: AccountStatus;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}
