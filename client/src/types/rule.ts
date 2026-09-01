export type ConditionField = 'from' | 'subject' | 'body' | 'priority';
export type ConditionOperator = 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'greater_than';
export type ActionType = 'set_priority' | 'star' | 'mark_read' | 'add_label' | 'create_action_item';

export interface RuleCondition {
  field: ConditionField;
  operator: ConditionOperator;
  value: string;
}

export interface RuleAction {
  type: ActionType;
  value?: string;
}

export interface AutomationRule {
  _id: string;
  owner: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  conditionMatch: 'all' | 'any';
  conditions: RuleCondition[];
  actions: RuleAction[];
  executionCount: number;
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRulePayload {
  name: string;
  description?: string;
  isEnabled?: boolean;
  conditionMatch?: 'all' | 'any';
  conditions: RuleCondition[];
  actions: RuleAction[];
}
