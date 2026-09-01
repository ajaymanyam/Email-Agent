export interface EmailAttachment {
  attachmentId: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface EmailRecipient {
  name?: string;
  email: string;
}

export interface EmailMessage {
  _id: string;
  owner?: string;
  emailAccountId?: string;
  provider?: 'gmail' | 'outlook';
  providerMessageId: string;
  providerThreadId: string;
  from: EmailRecipient;
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  subject: string;
  snippet: string;
  bodyText: string;
  bodyHtml: string;
  date: string | Date;
  isRead: boolean;
  isStarred: boolean;
  isImportant?: boolean;
  isDraft?: boolean;
  isTrash?: boolean;
  isSpam?: boolean;
  labels: string[];
  attachments?: EmailAttachment[];
  priorityScore?: number;
  priorityReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailThread {
  threadId: string;
  subject: string;
  snippet: string;
  messageCount: number;
  messages: EmailMessage[];
  latestDate?: string | Date;
  isRead: boolean;
  isStarred: boolean;
}

export interface EmailListResponse {
  emails: EmailMessage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
