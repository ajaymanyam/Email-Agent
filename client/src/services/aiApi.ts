import { api } from './api';

export interface AISummaryData {
  executiveSummary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'neutral' | 'urgent' | 'negative';
  urgencyScore: number;
  actionRequired: boolean;
}

export interface AIExplainData {
  simplifiedExplanation: string;
  bulletPoints: string[];
  bottomLine: string;
}

export interface AIReplyData {
  replies: Array<{
    tone: string;
    text: string;
  }>;
}

export interface AIRewriteData {
  rewrittenText: string;
  highlights: string[];
}

export interface AISecurityData {
  riskScore: number;
  riskLevel: 'safe' | 'low' | 'moderate' | 'critical';
  isPhishingSuspect: boolean;
  isSpamSuspect: boolean;
  warningReasons: string[];
  recommendedAction: string;
}

export interface AIActionItem {
  task: string;
  assignee?: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
}

export const aiApi = {
  async summarize(content: string, subject = ''): Promise<AISummaryData> {
    const res = await api.post<{ success: boolean; data: AISummaryData }>('/ai/summarize', {
      content,
      subject,
    });
    return res.data.data;
  },

  async explain(content: string): Promise<AIExplainData> {
    const res = await api.post<{ success: boolean; data: AIExplainData }>('/ai/explain', {
      content,
    });
    return res.data.data;
  },

  async generateReply(content: string, tone = 'Professional', instructions = ''): Promise<AIReplyData> {
    const res = await api.post<{ success: boolean; data: AIReplyData }>('/ai/generate-reply', {
      content,
      tone,
      instructions,
    });
    return res.data.data;
  },

  async rewriteDraft(draft: string, goal = 'polish'): Promise<AIRewriteData> {
    const res = await api.post<{ success: boolean; data: AIRewriteData }>('/ai/rewrite', {
      draft,
      goal,
    });
    return res.data.data;
  },

  async generateSubjectLines(draft: string): Promise<string[]> {
    const res = await api.post<{ success: boolean; data: { suggestions: string[] } }>(
      '/ai/subject-lines',
      { draft }
    );
    return res.data.data.suggestions;
  },

  async securityCheck(email: { sender: string; subject: string; body: string }): Promise<AISecurityData> {
    const res = await api.post<{ success: boolean; data: AISecurityData }>(
      '/ai/security-check',
      email
    );
    return res.data.data;
  },

  async extractActions(content: string): Promise<AIActionItem[]> {
    const res = await api.post<{ success: boolean; data: { actionItems: AIActionItem[] } }>(
      '/ai/extract-actions',
      { content }
    );
    return res.data.data.actionItems;
  },
};
