import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { actionItemApi } from '@/services/actionItemApi';
import { ActionItem, TaskPriority, TaskStatus } from '@/types/actionItem';
import {
  CheckSquare,
  Square,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  Mail,
  Search,
  Sparkles,
  CheckCircle2,
  Calendar,
  User,
  Filter,
  Loader2,
  X,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ActionItemsPage() {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ActionItem | null>(null);
  const [taskForm, setTaskForm] = useState<{
    task: string;
    assignee: string;
    deadline: string;
    priority: TaskPriority;
    status: TaskStatus;
  }>({
    task: '',
    assignee: '',
    deadline: '',
    priority: 'medium',
    status: 'pending',
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await actionItemApi.listActionItems({
        status: statusFilter,
        priority: priorityFilter,
        search: searchQuery,
      });
      setItems(data);
    } catch {
      toast.error('Failed to load action items.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems();
  };

  const handleToggleStatus = async (item: ActionItem) => {
    const newStatus: TaskStatus = item.status === 'completed' ? 'pending' : 'completed';
    try {
      const updated = await actionItemApi.updateActionItem(item._id, { status: newStatus });
      setItems(items.map((i) => (i._id === item._id ? updated : i)));
      toast.success(newStatus === 'completed' ? 'Task completed! 🎉' : 'Task marked as pending.');
    } catch {
      toast.error('Failed to update task.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await actionItemApi.deleteActionItem(id);
      setItems(items.filter((i) => i._id !== id));
      toast.success('Action item deleted.');
    } catch {
      toast.error('Failed to delete task.');
    }
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setTaskForm({
      task: '',
      assignee: '',
      deadline: '',
      priority: 'medium',
      status: 'pending',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ActionItem) => {
    setEditingItem(item);
    setTaskForm({
      task: item.task,
      assignee: item.assignee || '',
      deadline: item.deadline ? new Date(item.deadline).toISOString().split('T')[0] : '',
      priority: item.priority,
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleSyncToCalendar = async (item: ActionItem) => {
    if (!confirm(`Add "${item.task}" to your Google Calendar?`)) return;
    try {
      toast.loading('Creating Google Calendar event...', { id: 'cal-sync' });
      await actionItemApi.syncToCalendar(item._id);
      toast.success('Successfully added to Google Calendar!', { id: 'cal-sync' });
      fetchItems();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to sync with Google Calendar.', { id: 'cal-sync' });
    }
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.task.trim()) {
      toast.error('Please enter a task description.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem) {
        const updated = await actionItemApi.updateActionItem(editingItem._id, {
          task: taskForm.task,
          assignee: taskForm.assignee,
          deadline: taskForm.deadline || undefined,
          priority: taskForm.priority,
          status: taskForm.status,
        });
        setItems(items.map((i) => (i._id === editingItem._id ? updated : i)));
        toast.success('Task updated successfully.');
      } else {
        const created = await actionItemApi.createActionItem({
          task: taskForm.task,
          assignee: taskForm.assignee || undefined,
          deadline: taskForm.deadline ? taskForm.deadline : undefined,
          priority: taskForm.priority,
        });
        setItems([created, ...items]);
        toast.success('Action item created.');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save task.');
    } finally {
      setIsSaving(false);
    }
  };

  // Stats
  const totalTasks = items.length;
  const completedTasks = items.filter((i) => i.status === 'completed').length;
  const pendingTasks = items.filter((i) => i.status === 'pending').length;
  const highPriorityTasks = items.filter((i) => i.priority === 'high' && i.status !== 'completed').length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const isOverdue = (deadline?: string | Date) => {
    if (!deadline) return false;
    return new Date(deadline).getTime() < Date.now();
  };

  return (
    <AppShell>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
              <CheckSquare className="w-6 h-6 text-blue-500" />
              <span>Action Items & Deadlines</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              AI-extracted commitments, deliverables, and deadline tracking across your email inbox.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center space-x-1.5 shadow-lg shadow-blue-600/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Action Item</span>
            </button>
          </div>
        </div>

        {/* Stats Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-1">
            <span className="text-[11px] font-semibold text-slate-400">Total Action Items</span>
            <div className="text-2xl font-bold text-white">{totalTasks}</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-1">
            <span className="text-[11px] font-semibold text-rose-400 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>High Priority</span>
            </span>
            <div className="text-2xl font-bold text-rose-300">{highPriorityTasks}</div>
            <p className="text-[10px] text-slate-500">Requires urgent attention</p>
          </div>

          <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-1">
            <span className="text-[11px] font-semibold text-amber-400 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Tasks</span>
            </span>
            <div className="text-2xl font-bold text-amber-300">{pendingTasks}</div>
            <p className="text-[10px] text-slate-500">Awaiting completion</p>
          </div>

          <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-1">
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completion Rate</span>
            </span>
            <div className="text-2xl font-bold text-emerald-300">{completionPercentage}%</div>
            <p className="text-[10px] text-slate-500">{completedTasks} tasks done</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 text-xs">
            {['all', 'pending', 'in_progress', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition capitalize ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Priority Filter & Search Box */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-slate-500 font-semibold mr-1 flex items-center space-x-1">
                <Filter className="w-3 h-3" />
                <span>Priority:</span>
              </span>
              {['all', 'high', 'medium', 'low'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase transition ${
                    priorityFilter === p
                      ? p === 'high'
                        ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                        : p === 'medium'
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                        : 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search action items..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </form>
          </div>
        </div>

        {/* Task Items List */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
            <p className="text-xs">Loading action items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center space-y-3">
            <CheckSquare className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Action Items Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You're all caught up! Click &quot;New Action Item&quot; to add a task, or open any email thread to extract tasks with AI.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
            >
              Add Your First Task
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const isDone = item.status === 'completed';
              const overdue = !isDone && isOverdue(item.deadline);

              return (
                <div
                  key={item._id}
                  className={`p-4 rounded-2xl border transition-all duration-200 backdrop-blur-xl flex items-start justify-between gap-4 ${
                    isDone
                      ? 'bg-slate-900/30 border-slate-800/40 opacity-70'
                      : overdue
                      ? 'bg-rose-950/10 border-rose-500/30 shadow-lg shadow-rose-950/10'
                      : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 shadow-md'
                  }`}
                >
                  {/* Left: Checkbox & Task Info */}
                  <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className="mt-0.5 text-slate-400 hover:text-blue-400 transition shrink-0"
                    >
                      {isDone ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                      )}
                    </button>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold leading-snug break-words ${
                          isDone ? 'line-through text-slate-500' : 'text-slate-100'
                        }`}
                      >
                        {item.task}
                      </p>

                      {/* Metadata Badges */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {/* Priority Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            item.priority === 'high'
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : item.priority === 'medium'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {item.priority} priority
                        </span>

                        {/* Deadline Badge */}
                        {item.deadline && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center space-x-1 ${
                              overdue
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            <span>
                              {overdue ? 'Overdue: ' : 'Due: '}
                              {new Date(item.deadline).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </span>
                        )}

                        {/* Assignee Badge */}
                        {item.assignee && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-medium flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{item.assignee}</span>
                          </span>
                        )}

                        {/* Source Email Origin Link */}
                        {item.threadId && (
                          <Link
                            href={`/emails/${item.threadId}`}
                            className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:text-white hover:bg-purple-500/20 text-[10px] font-medium flex items-center space-x-1 transition"
                          >
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">
                              {item.sourceEmailSubject || 'View Email'}
                            </span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleSyncToCalendar(item)}
                      className={`p-1.5 rounded-lg transition ${
                        item.calendarEventId
                          ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20'
                          : 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
                      }`}
                      title={item.calendarEventId ? 'Synced with Google Calendar' : 'Sync to Google Calendar'}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Edit Task"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">
                  {editingItem ? 'Edit Action Item' : 'New Action Item'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveTask} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Task Description *
                  </label>
                  <textarea
                    rows={3}
                    value={taskForm.task}
                    onChange={(e) => setTaskForm({ ...taskForm, task: e.target.value })}
                    placeholder="e.g., Send updated sponsorship deck to sponsor committee..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Priority</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Due Date</label>
                    <input
                      type="date"
                      value={taskForm.deadline}
                      onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Assignee</label>
                  <input
                    type="text"
                    value={taskForm.assignee}
                    onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                    placeholder="e.g., John Doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
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
                    <span>{isSaving ? 'Saving...' : 'Save Task'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
