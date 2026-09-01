import { api } from './api';
import { EmailTemplate, TemplateFilterOptions, CreateTemplatePayload } from '@/types/template';

export const templateApi = {
  async listTemplates(filters: TemplateFilterOptions = {}): Promise<EmailTemplate[]> {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.favorite) params.append('favorite', 'true');

    const res = await api.get<{ success: boolean; data: EmailTemplate[] }>(
      `/templates?${params.toString()}`
    );
    return res.data.data;
  },

  async getTemplate(id: string): Promise<EmailTemplate> {
    const res = await api.get<{ success: boolean; data: EmailTemplate }>(`/templates/${id}`);
    return res.data.data;
  },

  async createTemplate(payload: CreateTemplatePayload): Promise<EmailTemplate> {
    const res = await api.post<{ success: boolean; data: EmailTemplate }>('/templates', payload);
    return res.data.data;
  },

  async updateTemplate(
    id: string,
    updates: Partial<CreateTemplatePayload>
  ): Promise<EmailTemplate> {
    const res = await api.patch<{ success: boolean; data: EmailTemplate }>(
      `/templates/${id}`,
      updates
    );
    return res.data.data;
  },

  async deleteTemplate(id: string): Promise<void> {
    await api.delete(`/templates/${id}`);
  },

  async useTemplate(id: string): Promise<EmailTemplate> {
    const res = await api.post<{ success: boolean; data: EmailTemplate }>(`/templates/${id}/use`);
    return res.data.data;
  },
};
