import { EmailMessage } from './email';

export interface AiDraft {
  _id: string;
  emailAccountId: string;
  emailMessageId?: string;
  providerThreadId: string;
  recipientEmail: string;
  recipientName?: string;
  originalSubject: string;
  suggestedSubject: string;
  suggestedBody: string;
  tone: string;
  keyPointsCovered: string[];
  status: 'suggested' | 'accepted' | 'discarded';
  confidenceScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledEmail {
  _id: string;
  emailAccountId: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  providerThreadId?: string;
  scheduledFor: string;
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
  error?: string;
  sentAt?: string;
  createdAt: string;
}

export interface NLSearchResult {
  interpretedQuery: {
    keywords?: string;
    fromEmail?: string;
    view?: string;
    explanation?: string;
  };
  total: number;
  emails: EmailMessage[];
}
