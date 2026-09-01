export interface AnalyticsOverview {
  totalEmails: number;
  receivedCount: number;
  sentCount: number;
  starredCount: number;
  unreadCount: number;
  avgResponseTimeHours: number;
  inboxHealthScore: number;
  totalActionItems: number;
  completedActionItems: number;
  actionItemCompletionRate: number;
  templatesCount: number;
}

export interface VolumeDataPoint {
  date: string;
  received: number;
  sent: number;
}

export interface TopContact {
  email: string;
  name: string;
  count: number;
  lastDate: string;
}

export interface ProductivityInsights {
  priorityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  hourlyDistribution: Array<{
    hour: number;
    count: number;
  }>;
}
