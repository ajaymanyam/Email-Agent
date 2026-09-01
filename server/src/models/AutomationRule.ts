import mongoose, { Document, Schema } from 'mongoose';

export type ConditionField = 'from' | 'subject' | 'body' | 'priority';
export type ConditionOperator = 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'greater_than';
export type ActionType = 'set_priority' | 'star' | 'mark_read' | 'add_label' | 'create_action_item';

export interface IRuleCondition {
  field: ConditionField;
  operator: ConditionOperator;
  value: string;
}

export interface IRuleAction {
  type: ActionType;
  value?: string;
}

export interface IAutomationRule extends Document {
  _id: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  isEnabled: boolean;
  conditionMatch: 'all' | 'any';
  conditions: IRuleCondition[];
  actions: IRuleAction[];
  executionCount: number;
  lastExecutedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ruleConditionSchema = new Schema<IRuleCondition>(
  {
    field: {
      type: String,
      enum: ['from', 'subject', 'body', 'priority'],
      required: true,
    },
    operator: {
      type: String,
      enum: ['contains', 'equals', 'starts_with', 'ends_with', 'greater_than'],
      required: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const ruleActionSchema = new Schema<IRuleAction>(
  {
    type: {
      type: String,
      enum: ['set_priority', 'star', 'mark_read', 'add_label', 'create_action_item'],
      required: true,
    },
    value: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const automationRuleSchema = new Schema<IAutomationRule>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Rule name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    isEnabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    conditionMatch: {
      type: String,
      enum: ['all', 'any'],
      default: 'all',
    },
    conditions: {
      type: [ruleConditionSchema],
      default: [],
    },
    actions: {
      type: [ruleActionSchema],
      default: [],
    },
    executionCount: {
      type: Number,
      default: 0,
    },
    lastExecutedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

automationRuleSchema.index({ owner: 1, isEnabled: 1, createdAt: -1 });

export const AutomationRule = mongoose.model<IAutomationRule>(
  'AutomationRule',
  automationRuleSchema
);
