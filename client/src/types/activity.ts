export type ActivityAction =
  | 'account_connected'
  | 'account_disconnected'
  | 'email_opened'
  | 'email_searched'
  | 'email_summarized'
  | 'reply_generated'
  | 'reply_edited'
  | 'email_sent'
  | 'email_archived'
  | 'email_deleted'
  | 'priority_classified'
  | 'spam_detected'
  | 'actions_extracted'
  | 'calendar_event_created';

export interface Activity {
  _id: string;
  owner: string;
  accountId?: string;
  messageId?: string;
  threadId?: string;
  action: ActivityAction;
  status: 'success' | 'failed' | 'pending';
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type NotificationType =
  | 'gmail_connected'
  | 'gmail_expired'
  | 'email_sent'
  | 'ai_complete'
  | 'ai_unavailable'
  | 'high_priority'
  | 'phishing_detected'
  | 'calendar_event'
  | 'daily_summary';

export interface Notification {
  _id: string;
  owner: string;
  type: NotificationType;
  title: string;
  message: string;
  messageId?: string;
  isRead: boolean;
  createdAt: string;
}
