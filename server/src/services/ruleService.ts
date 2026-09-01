import mongoose from 'mongoose';
import {
  AutomationRule,
  IAutomationRule,
  IRuleCondition,
  IRuleAction,
} from '../models/AutomationRule';
import { EmailMessage, IEmailMessage } from '../models/EmailMessage';
import { ActionItem } from '../models/ActionItem';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const DEFAULT_STARTER_RULES = [
  {
    name: 'Auto-Star Sponsorship Proposals',
    description: 'Automatically stars and flags sponsorship inquiries for urgent review.',
    isEnabled: true,
    conditionMatch: 'any' as const,
    conditions: [
      { field: 'subject' as const, operator: 'contains' as const, value: 'sponsorship' },
      { field: 'body' as const, operator: 'contains' as const, value: 'sponsor' },
      { field: 'subject' as const, operator: 'contains' as const, value: 'partnership' },
    ],
    actions: [
      { type: 'star' as const, value: 'true' },
      { type: 'set_priority' as const, value: 'high' },
    ],
  },
  {
    name: 'Urgent Deadlines & Deliverables',
    description: 'Detects urgent deliverables and automatically creates action items.',
    isEnabled: true,
    conditionMatch: 'any' as const,
    conditions: [
      { field: 'subject' as const, operator: 'contains' as const, value: 'urgent' },
      { field: 'subject' as const, operator: 'contains' as const, value: 'deadline' },
      { field: 'subject' as const, operator: 'contains' as const, value: 'action required' },
    ],
    actions: [
      { type: 'set_priority' as const, value: 'high' },
      { type: 'create_action_item' as const, value: 'Follow up on urgent requirement' },
    ],
  },
  {
    name: 'Meeting Invitations & Calendars',
    description: 'Labels and organizes meeting coordination emails.',
    isEnabled: true,
    conditionMatch: 'any' as const,
    conditions: [
      { field: 'subject' as const, operator: 'contains' as const, value: 'meeting' },
      { field: 'subject' as const, operator: 'contains' as const, value: 'invitation' },
    ],
    actions: [{ type: 'add_label' as const, value: 'Meetings' }],
  },
];

export const ruleService = {
  /**
   * Retrieves all automation rules for a user with starter seeding
   */
  async listRules(userId: string): Promise<IAutomationRule[]> {
    if (!mongoose.isValidObjectId(userId)) return [];
    const ownerId = new mongoose.Types.ObjectId(userId);

    const count = await AutomationRule.countDocuments({ owner: ownerId });
    if (count === 0) {
      await Promise.all(
        DEFAULT_STARTER_RULES.map((r) =>
          AutomationRule.create({
            owner: ownerId,
            name: r.name,
            description: r.description,
            isEnabled: r.isEnabled,
            conditionMatch: r.conditionMatch,
            conditions: r.conditions,
            actions: r.actions,
            executionCount: 0,
          })
        )
      );
    }

    return AutomationRule.find({ owner: ownerId }).sort({ isEnabled: -1, createdAt: -1 }).lean() as any;
  },

  /**
   * Retrieves single rule
   */
  async getRuleById(userId: string, ruleId: string): Promise<IAutomationRule> {
    if (!mongoose.isValidObjectId(ruleId) || !mongoose.isValidObjectId(userId)) {
      throw createError('Invalid rule ID format.', 400, 'INVALID_RULE_ID');
    }

    const rule = await AutomationRule.findOne({
      _id: new mongoose.Types.ObjectId(ruleId),
      owner: new mongoose.Types.ObjectId(userId),
    });

    if (!rule) {
      throw createError('Automation rule not found.', 404, 'RULE_NOT_FOUND');
    }

    return rule;
  },

  /**
   * Creates a new automation rule
   */
  async createRule(
    userId: string,
    payload: {
      name: string;
      description?: string;
      isEnabled?: boolean;
      conditionMatch?: 'all' | 'any';
      conditions: IRuleCondition[];
      actions: IRuleAction[];
    }
  ): Promise<IAutomationRule> {
    if (!mongoose.isValidObjectId(userId)) {
      throw createError('Invalid user ID.', 400, 'INVALID_USER_ID');
    }
    if (!payload.name?.trim()) {
      throw createError('Rule name is required.', 400, 'INVALID_RULE_DATA');
    }
    if (!payload.conditions || payload.conditions.length === 0) {
      throw createError('At least one condition is required.', 400, 'INVALID_RULE_DATA');
    }
    if (!payload.actions || payload.actions.length === 0) {
      throw createError('At least one action is required.', 400, 'INVALID_RULE_DATA');
    }

    const rule = await AutomationRule.create({
      owner: new mongoose.Types.ObjectId(userId),
      name: payload.name.trim(),
      description: payload.description?.trim() || '',
      isEnabled: payload.isEnabled !== false,
      conditionMatch: payload.conditionMatch || 'all',
      conditions: payload.conditions,
      actions: payload.actions,
      executionCount: 0,
    });

    logger.info('Automation rule created', { userId, ruleId: rule._id.toString() });
    return rule;
  },

  /**
   * Updates an existing rule
   */
  async updateRule(
    userId: string,
    ruleId: string,
    updates: Partial<{
      name: string;
      description: string;
      isEnabled: boolean;
      conditionMatch: 'all' | 'any';
      conditions: IRuleCondition[];
      actions: IRuleAction[];
    }>
  ): Promise<IAutomationRule> {
    if (!mongoose.isValidObjectId(ruleId) || !mongoose.isValidObjectId(userId)) {
      throw createError('Invalid rule ID format.', 400, 'INVALID_RULE_ID');
    }

    const rule = await AutomationRule.findOne({
      _id: new mongoose.Types.ObjectId(ruleId),
      owner: new mongoose.Types.ObjectId(userId),
    });

    if (!rule) {
      throw createError('Automation rule not found.', 404, 'RULE_NOT_FOUND');
    }

    if (updates.name !== undefined) rule.name = updates.name.trim();
    if (updates.description !== undefined) rule.description = updates.description.trim();
    if (updates.isEnabled !== undefined) rule.isEnabled = updates.isEnabled;
    if (updates.conditionMatch !== undefined) rule.conditionMatch = updates.conditionMatch;
    if (updates.conditions !== undefined) rule.conditions = updates.conditions;
    if (updates.actions !== undefined) rule.actions = updates.actions;

    await rule.save();
    return rule;
  },

  /**
   * Toggles rule enabled/disabled status
   */
  async toggleRule(userId: string, ruleId: string, isEnabled: boolean): Promise<IAutomationRule> {
    if (!mongoose.isValidObjectId(ruleId) || !mongoose.isValidObjectId(userId)) {
      throw createError('Invalid rule ID format.', 400, 'INVALID_RULE_ID');
    }

    const rule = await AutomationRule.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(ruleId),
        owner: new mongoose.Types.ObjectId(userId),
      },
      { isEnabled },
      { new: true }
    );

    if (!rule) {
      throw createError('Automation rule not found.', 404, 'RULE_NOT_FOUND');
    }

    return rule;
  },

  /**
   * Deletes a rule
   */
  async deleteRule(userId: string, ruleId: string): Promise<void> {
    if (!mongoose.isValidObjectId(ruleId) || !mongoose.isValidObjectId(userId)) {
      throw createError('Invalid rule ID format.', 400, 'INVALID_RULE_ID');
    }

    const result = await AutomationRule.deleteOne({
      _id: new mongoose.Types.ObjectId(ruleId),
      owner: new mongoose.Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw createError('Automation rule not found.', 404, 'RULE_NOT_FOUND');
    }
  },

  /**
  /**
   * Evaluates rule conditions against an email
   */
  evaluateConditions(email: Partial<IEmailMessage>, rule: Partial<IAutomationRule>): boolean {
    if (!rule.conditions || rule.conditions.length === 0) return false;

    const evalCondition = (c: IRuleCondition): boolean => {
      let targetText = '';
      if (c.field === 'from') targetText = `${email.from?.email || ''} ${email.from?.name || ''}`;
      else if (c.field === 'subject') targetText = email.subject || '';
      else if (c.field === 'body') targetText = email.snippet || email.bodyText || '';
      else if (c.field === 'priority') targetText = (email.priorityScore || 0).toString();

      targetText = targetText.toLowerCase();
      const expected = (c.value || '').toLowerCase();

      switch (c.operator) {
        case 'contains':
          return targetText.includes(expected);
        case 'equals':
          return targetText === expected;
        case 'starts_with':
          return targetText.startsWith(expected);
        case 'ends_with':
          return targetText.endsWith(expected);
        case 'greater_than':
          return parseFloat(targetText) > parseFloat(expected);
        default:
          return false;
      }
    };

    if (rule.conditionMatch === 'all') {
      return rule.conditions.every(evalCondition);
    }
    return rule.conditions.some(evalCondition);
  },

  /**
   * Evaluates all active rules against an email and applies actions
   */
  async applyRulesToEmail(userId: string, email: IEmailMessage): Promise<void> {
    if (!mongoose.isValidObjectId(userId)) return;
    const ownerId = new mongoose.Types.ObjectId(userId);

    const rules = await AutomationRule.find({ owner: ownerId, isEnabled: true });
    if (!rules || rules.length === 0) return;

    for (const rule of rules) {
      const isMatch = ruleService.evaluateConditions(email, rule);

      if (isMatch) {
        // Execute Actions
        let modified = false;
        for (const act of rule.actions) {
          if (act.type === 'star') {
            email.isStarred = true;
            modified = true;
          } else if (act.type === 'mark_read') {
            email.isRead = true;
            modified = true;
          } else if (act.type === 'set_priority') {
            email.priorityScore = act.value === 'high' ? 90 : act.value === 'medium' ? 50 : 20;
            email.isImportant = act.value === 'high';
            modified = true;
          } else if (act.type === 'add_label' && act.value) {
            if (!email.labels.includes(act.value)) {
              email.labels.push(act.value);
              modified = true;
            }
          } else if (act.type === 'create_action_item') {
            try {
              await ActionItem.create({
                owner: ownerId,
                task: act.value || `Follow up: ${email.subject}`,
                priority: 'high',
                status: 'pending',
                sourceEmailSubject: email.subject,
                sourceEmailSender: email.from?.name || email.from?.email,
                emailId: email._id,
                threadId: email.providerThreadId,
              });
            } catch {
              // Ignore duplicate action items
            }
          }
        }

        if (modified) {
          await email.save();
        }

        // Increment execution stats
        rule.executionCount = (rule.executionCount || 0) + 1;
        rule.lastExecutedAt = new Date();
        await rule.save();
      }
    }
  },
};
