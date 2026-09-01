import { api } from './api';
import { AutomationRule, CreateRulePayload } from '@/types/rule';

export const ruleApi = {
  async listRules(): Promise<AutomationRule[]> {
    const res = await api.get<{ success: boolean; data: AutomationRule[] }>('/rules');
    return res.data.data;
  },

  async getRule(id: string): Promise<AutomationRule> {
    const res = await api.get<{ success: boolean; data: AutomationRule }>(`/rules/${id}`);
    return res.data.data;
  },

  async createRule(payload: CreateRulePayload): Promise<AutomationRule> {
    const res = await api.post<{ success: boolean; data: AutomationRule }>('/rules', payload);
    return res.data.data;
  },

  async updateRule(id: string, updates: Partial<CreateRulePayload>): Promise<AutomationRule> {
    const res = await api.patch<{ success: boolean; data: AutomationRule }>(
      `/rules/${id}`,
      updates
    );
    return res.data.data;
  },

  async toggleRule(id: string, isEnabled: boolean): Promise<AutomationRule> {
    const res = await api.patch<{ success: boolean; data: AutomationRule }>(
      `/rules/${id}/toggle`,
      { isEnabled }
    );
    return res.data.data;
  },

  async deleteRule(id: string): Promise<void> {
    await api.delete(`/rules/${id}`);
  },
};
