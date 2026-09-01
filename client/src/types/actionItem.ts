export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface ActionItem {
  _id: string;
  owner: string;
  emailId?: string;
  emailAccountId?: string;
  threadId?: string;
  task: string;
  assignee?: string;
  deadline?: string | Date;
  priority: TaskPriority;
  status: TaskStatus;
  sourceEmailSubject?: string;
  sourceEmailSender?: string;
  calendarEventId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActionItemFilterOptions {
  status?: string;
  priority?: string;
  search?: string;
}

export interface CreateActionItemPayload {
  task: string;
  assignee?: string;
  deadline?: string;
  priority?: TaskPriority;
  sourceEmailSubject?: string;
  sourceEmailSender?: string;
  emailId?: string;
  threadId?: string;
}
