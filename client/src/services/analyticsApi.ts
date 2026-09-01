import { api } from './api';
import {
  AnalyticsOverview,
  VolumeDataPoint,
  TopContact,
  ProductivityInsights,
} from '@/types/analytics';

export const analyticsApi = {
  async getOverview(days = 30): Promise<AnalyticsOverview> {
    const res = await api.get<{ success: boolean; data: AnalyticsOverview }>(
      `/analytics/overview?days=${days}`
    );
    return res.data.data;
  },

  async getVolumeTrends(days = 14): Promise<VolumeDataPoint[]> {
    const res = await api.get<{ success: boolean; data: VolumeDataPoint[] }>(
      `/analytics/volume?days=${days}`
    );
    return res.data.data;
  },

  async getTopContacts(limit = 6): Promise<TopContact[]> {
    const res = await api.get<{ success: boolean; data: TopContact[] }>(
      `/analytics/contacts?limit=${limit}`
    );
    return res.data.data;
  },

  async getProductivity(): Promise<ProductivityInsights> {
    const res = await api.get<{ success: boolean; data: ProductivityInsights }>(
      '/analytics/productivity'
    );
    return res.data.data;
  },
};
