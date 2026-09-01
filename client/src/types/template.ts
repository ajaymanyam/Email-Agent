export type TemplateCategory = 'sponsorship' | 'outreach' | 'follow_up' | 'meeting' | 'general';

export interface EmailTemplate {
  _id: string;
  owner: string;
  name: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  category: TemplateCategory;
  placeholders: string[];
  usageCount: number;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateFilterOptions {
  category?: string;
  search?: string;
  favorite?: boolean;
}

export interface CreateTemplatePayload {
  name: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  category?: TemplateCategory;
  isFavorite?: boolean;
}
