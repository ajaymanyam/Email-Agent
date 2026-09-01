export type AIOperationType =
  | 'summarize'
  | 'explain'
  | 'generate-reply'
  | 'classify-priority'
  | 'detect-phishing'
  | 'extract-actions'
  | 'extract-dates'
  | 'generate-subject'
  | 'rewrite'
  | 'categorize'
  | 'smart-search'
  | 'daily-summary';

export type ReplyTone = 'professional' | 'friendly' | 'formal' | 'concise';

export interface AISummary {
  topic: string;
  summary: string;
  keyPoints: string[];
  decisions?: string[];
  requests?: string[];
  actionItems: string[];
  dates: string[];
  participants: string[];
}

export interface AIReply {
  draft: string;
  tone: ReplyTone;
  suggestions?: string[];
}

export interface AIExplanation {
  whatItSays: string;
  whatTheyWant: string;
  whyItMatters: string;
  technicalTerms?: Record<string, string>;
  requiredActions: string[];
  deadlines: string[];
}

export interface AIPhishingResult {
  verdict: 'safe' | 'suspicious' | 'likely_spam' | 'likely_phishing';
  confidence: number;
  signals: string[];
  explanation: string;
}

export interface AIActionItem {
  task: string;
  deadline?: string;
  responsiblePerson?: string;
  confidence: number;
}

export interface AIDateItem {
  type: 'meeting' | 'deadline' | 'delivery' | 'follow_up' | 'payment' | 'renewal' | 'other';
  description: string;
  date: string;
  canAddToCalendar: boolean;
}

export interface AISubjectSuggestions {
  subjects: string[];
}

export interface AIResult<T = unknown> {
  _id: string;
  type: AIOperationType;
  content: T;
  model: string;
  confidence?: number;
  createdAt: string;
}
