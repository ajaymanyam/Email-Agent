import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { ruleApi } from '@/services/ruleApi';
import {
  AutomationRule,
  RuleCondition,
  RuleAction,
  ConditionField,
  ConditionOperator,
  ActionType,
} from '@/types/rule';
import {
  Zap,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  Layers,
  ShieldAlert,
  Loader2,
  X,
  Play,
  Sliders,
  Filter,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function RulesPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    conditionMatch: 'all' | 'any';
    conditions: RuleCondition[];
    actions: RuleAction[];
    isEnabled: boolean;
  }>({
    name: '',
    description: '',
    conditionMatch: 'all',
    conditions: [{ field: 'subject', operator: 'contains', value: '' }],
    actions: [{ type: 'star', value: 'true' }],
    isEnabled: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const data = await ruleApi.listRules();
      setRules(data);
    } catch {
      toast.error('Failed to load automation rules.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggleRule = async (rule: AutomationRule) => {
    try {
      const updated = await ruleApi.toggleRule(rule._id, !rule.isEnabled);
      setRules(rules.map((r) => (r._id === rule._id ? updated : r)));
      toast.success(updated.isEnabled ? 'Automation rule enabled.' : 'Automation rule paused.');
    } catch {
      toast.error('Failed to toggle rule.');
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this automation rule?')) return;
    try {
      await ruleApi.deleteRule(id);
      setRules(rules.filter((r) => r._id !== id));
      toast.success('Rule deleted.');
    } catch {
      toast.error('Failed to delete rule.');
    }
  };

  const handleOpenCreateModal = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      description: '',
      conditionMatch: 'all',
      conditions: [{ field: 'subject', operator: 'contains', value: '' }],
      actions: [{ type: 'star', value: 'true' }],
      isEnabled: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rule: AutomationRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      conditionMatch: rule.conditionMatch || 'all',
      conditions: rule.conditions.length
        ? rule.conditions
        : [{ field: 'subject', operator: 'contains', value: '' }],
      actions: rule.actions.length ? rule.actions : [{ type: 'star', value: 'true' }],
      isEnabled: rule.isEnabled,
    });
    setIsModalOpen(true);
  };

  const handleAddCondition = () => {
    setFormData((prev) => ({
      ...prev,
      conditions: [...prev.conditions, { field: 'subject', operator: 'contains', value: '' }],
    }));
  };

  const handleRemoveCondition = (index: number) => {
    if (formData.conditions.length === 1) {
      toast.error('Rule must have at least one condition.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateCondition = (index: number, updates: Partial<RuleCondition>) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.map((c, i) => (i === index ? { ...c, ...updates } : c)),
    }));
  };

  const handleAddAction = () => {
    setFormData((prev) => ({
      ...prev,
      actions: [...prev.actions, { type: 'set_priority', value: 'high' }],
    }));
  };

  const handleRemoveAction = (index: number) => {
    if (formData.actions.length === 1) {
      toast.error('Rule must have at least one action.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateAction = (index: number, updates: Partial<RuleAction>) => {
    setFormData((prev) => ({
      ...prev,
      actions: prev.actions.map((a, i) => (i === index ? { ...a, ...updates } : a)),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a rule name.');
      return;
    }

    const hasEmptyCondition = formData.conditions.some((c) => !c.value.trim());
    if (hasEmptyCondition) {
      toast.error('Please enter a value for all conditions.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingRule) {
        const updated = await ruleApi.updateRule(editingRule._id, formData);
        setRules(rules.map((r) => (r._id === editingRule._id ? updated : r)));
        toast.success('Automation rule updated.');
      } else {
        const created = await ruleApi.createRule(formData);
        setRules([created, ...rules]);
        toast.success('Automation rule created.');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save rule.');
    } finally {
      setIsSaving(false);
    }
  };

  const totalRules = rules.length;
  const activeRules = rules.filter((r) => r.isEnabled).length;
  const totalExecutions = rules.reduce((acc, r) => acc + (r.executionCount || 0), 0);

  const getActionLabel = (act: RuleAction) => {
    switch (act.type) {
      case 'star':
        return '⭐ Star Email';
      case 'set_priority':
        return `🔴 Set Priority: ${act.value || 'High'}`;
      case 'mark_read':
        return '👁️ Mark as Read';
      case 'add_label':
        return `🏷️ Add Label: ${act.value || 'Custom'}`;
      case 'create_action_item':
        return `📋 Extract Task: ${act.value || 'Action Item'}`;
      default:
        return act.type;
    }
  };

  return (
    <AppShell>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
              <Zap className="w-6 h-6 text-blue-500" />
              <span>Smart Automation & Inbox Triage</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Build automated rules to auto-star, prioritize, label, and extract tasks from incoming emails.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center space-x-1.5 shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Automation Rule</span>
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-1">
            <span className="text-[11px] font-semibold text-slate-400">Total Rules</span>
            <div className="text-2xl font-bold text-white">{totalRules}</div>
            <p className="text-[10px] text-slate-500">Configured automations</p>
          </div>

          <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-1">
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active Triggers</span>
            </span>
            <div className="text-2xl font-bold text-emerald-300">{activeRules}</div>
            <p className="text-[10px] text-slate-500">Live & monitoring inbox</p>
          </div>

          <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-1">
            <span className="text-[11px] font-semibold text-purple-400 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Total Executions</span>
            </span>
            <div className="text-2xl font-bold text-purple-300">{totalExecutions}</div>
            <p className="text-[10px] text-slate-500">Emails triaged automatically</p>
          </div>

          <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-1">
            <span className="text-[11px] font-semibold text-blue-400 flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Triage Shield</span>
            </span>
            <div className="text-sm font-bold text-blue-300 mt-1">AI Enabled</div>
            <p className="text-[10px] text-slate-500">Automated inbox protection</p>
          </div>
        </div>

        {/* Rules Grid */}
        {isLoading ? (
          <div className="p-16 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
            <p className="text-xs">Loading automation rules...</p>
          </div>
        ) : rules.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center space-y-3">
            <Zap className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Automation Rules Configured</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create rules to automatically categorize emails, flag urgent deadlines, and extract tasks.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
            >
              Create Your First Rule
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule) => (
              <div
                key={rule._id}
                className={`p-5 rounded-3xl border backdrop-blur-xl transition-all duration-200 flex flex-col justify-between space-y-4 ${
                  rule.isEnabled
                    ? 'bg-slate-900/70 border-slate-800/80 shadow-xl'
                    : 'bg-slate-950/40 border-slate-900/80 opacity-60'
                }`}
              >
                {/* Header & Toggle */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          rule.isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                        }`}
                      />
                      <h3 className="text-sm font-bold text-white leading-snug">{rule.name}</h3>
                    </div>
                    {rule.description && (
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        {rule.description}
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleToggleRule(rule)}
                      className={`text-xs px-2.5 py-1 rounded-xl font-semibold border transition ${
                        rule.isEnabled
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {rule.isEnabled ? 'Active' : 'Paused'}
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(rule)}
                      className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule._id)}
                      className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Conditions Block */}
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      IF ({rule.conditionMatch === 'all' ? 'MATCH ALL' : 'MATCH ANY'}):
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {rule.conditions.map((cond, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-mono"
                      >
                        <span className="capitalize">{cond.field}</span> {cond.operator}{' '}
                        <span className="text-white font-bold">&quot;{cond.value}&quot;</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions Block */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    THEN EXECUTE:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {rule.actions.map((act, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-semibold"
                      >
                        {getActionLabel(act)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Stats */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                  <span>Executed {rule.executionCount || 0} time(s)</span>
                  <span>
                    {rule.lastExecutedAt
                      ? `Last run ${new Date(rule.lastExecutedAt).toLocaleDateString()}`
                      : 'Never executed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">
                  {editingRule ? 'Edit Automation Rule' : 'Create Automation Rule'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Rule Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Star & Triage Sponsorship Inquiries"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Automatically flags and stars sponsorship proposals"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Match Type */}
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span className="block text-slate-300 font-semibold">Condition Logic</span>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="conditionMatch"
                        checked={formData.conditionMatch === 'all'}
                        onChange={() => setFormData({ ...formData, conditionMatch: 'all' })}
                        className="text-blue-600 focus:ring-0"
                      />
                      <span>Match ALL Conditions (AND)</span>
                    </label>
                    <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="conditionMatch"
                        checked={formData.conditionMatch === 'any'}
                        onChange={() => setFormData({ ...formData, conditionMatch: 'any' })}
                        className="text-blue-600 focus:ring-0"
                      />
                      <span>Match ANY Condition (OR)</span>
                    </label>
                  </div>
                </div>

                {/* Conditions Builder */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-400 font-semibold">Conditions (IF)</label>
                    <button
                      type="button"
                      onClick={handleAddCondition}
                      className="text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Condition</span>
                    </button>
                  </div>

                  {formData.conditions.map((cond, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800"
                    >
                      <select
                        value={cond.field}
                        onChange={(e) =>
                          handleUpdateCondition(idx, { field: e.target.value as ConditionField })
                        }
                        className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                      >
                        <option value="subject">Subject</option>
                        <option value="from">Sender / From</option>
                        <option value="body">Email Body</option>
                        <option value="priority">Priority Score</option>
                      </select>

                      <select
                        value={cond.operator}
                        onChange={(e) =>
                          handleUpdateCondition(idx, {
                            operator: e.target.value as ConditionOperator,
                          })
                        }
                        className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                      >
                        <option value="contains">contains</option>
                        <option value="equals">equals</option>
                        <option value="starts_with">starts with</option>
                        <option value="ends_with">ends with</option>
                      </select>

                      <input
                        type="text"
                        value={cond.value}
                        onChange={(e) => handleUpdateCondition(idx, { value: e.target.value })}
                        placeholder="Keyword or value..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        required
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveCondition(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Actions Builder */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-400 font-semibold">Actions (THEN)</label>
                    <button
                      type="button"
                      onClick={handleAddAction}
                      className="text-purple-400 hover:text-purple-300 text-xs font-semibold flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Action</span>
                    </button>
                  </div>

                  {formData.actions.map((act, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800"
                    >
                      <select
                        value={act.type}
                        onChange={(e) =>
                          handleUpdateAction(idx, {
                            type: e.target.value as ActionType,
                            value:
                              e.target.value === 'set_priority'
                                ? 'high'
                                : e.target.value === 'star'
                                ? 'true'
                                : '',
                          })
                        }
                        className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                      >
                        <option value="star">Star Email ⭐</option>
                        <option value="set_priority">Set Priority 🔴</option>
                        <option value="create_action_item">Extract Task 📋</option>
                        <option value="mark_read">Mark as Read 👁️</option>
                        <option value="add_label">Add Custom Label 🏷️</option>
                      </select>

                      {act.type === 'set_priority' ? (
                        <select
                          value={act.value || 'high'}
                          onChange={(e) => handleUpdateAction(idx, { value: e.target.value })}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                        >
                          <option value="high">High Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="low">Low Priority</option>
                        </select>
                      ) : act.type === 'create_action_item' || act.type === 'add_label' ? (
                        <input
                          type="text"
                          value={act.value || ''}
                          onChange={(e) => handleUpdateAction(idx, { value: e.target.value })}
                          placeholder={
                            act.type === 'create_action_item'
                              ? 'Task title...'
                              : 'Label name...'
                          }
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <div className="flex-1 text-slate-500 text-[11px] px-2 italic">
                          Applies automatically
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveAction(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isEnabled}
                      onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0"
                    />
                    <span>Active immediately</span>
                  </label>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>{isSaving ? 'Saving...' : 'Save Rule'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
