import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AppShell } from '@/components/AppShell';
import { templateApi } from '@/services/templateApi';
import { EmailTemplate, TemplateCategory } from '@/types/template';
import {
  FileText,
  Plus,
  Star,
  Search,
  Send,
  Trash2,
  Edit3,
  Copy,
  Tag,
  Sparkles,
  Layers,
  ArrowUpRight,
  Loader2,
  X,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    subject: string;
    bodyText: string;
    category: TemplateCategory;
    isFavorite: boolean;
  }>({
    name: '',
    subject: '',
    bodyText: '',
    category: 'general',
    isFavorite: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await templateApi.listTemplates({
        category: categoryFilter,
        search: searchQuery,
        favorite: favoritesOnly,
      });
      setTemplates(data);
    } catch {
      toast.error('Failed to load templates.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [categoryFilter, favoritesOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTemplates();
  };

  const handleToggleFavorite = async (template: EmailTemplate) => {
    try {
      const updated = await templateApi.updateTemplate(template._id, {
        isFavorite: !template.isFavorite,
      });
      setTemplates(templates.map((t) => (t._id === template._id ? updated : t)));
      toast.success(updated.isFavorite ? 'Added to favorites ⭐' : 'Removed from favorites.');
    } catch {
      toast.error('Failed to update favorite status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await templateApi.deleteTemplate(id);
      setTemplates(templates.filter((t) => t._id !== id));
      toast.success('Template deleted.');
    } catch {
      toast.error('Failed to delete template.');
    }
  };

  const handleUseInComposer = async (template: EmailTemplate) => {
    try {
      await templateApi.useTemplate(template._id);
      router.push(
        `/compose?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(
          template.bodyText
        )}`
      );
    } catch {
      router.push(
        `/compose?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(
          template.bodyText
        )}`
      );
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      subject: '',
      bodyText: '',
      category: 'general',
      isFavorite: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      bodyText: template.bodyText,
      category: template.category,
      isFavorite: template.isFavorite,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.subject.trim() || !formData.bodyText.trim()) {
      toast.error('Please complete all required fields.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingTemplate) {
        const updated = await templateApi.updateTemplate(editingTemplate._id, formData);
        setTemplates(templates.map((t) => (t._id === editingTemplate._id ? updated : t)));
        toast.success('Template updated successfully.');
      } else {
        const created = await templateApi.createTemplate(formData);
        setTemplates([created, ...templates]);
        toast.success('Template created successfully.');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save template.');
    } finally {
      setIsSaving(false);
    }
  };

  const insertVariable = (varName: string) => {
    setFormData((prev) => ({
      ...prev,
      bodyText: prev.bodyText + ` {{${varName}}}`,
    }));
  };

  // Detected variables in current form
  const detectedFormVars = Array.from(
    new Set(
      (`${formData.subject} ${formData.bodyText}`.match(/{{\s*([a-zA-Z0-9_-]+)\s*}}/g) || []).map(
        (m) => m.replace(/[{}]/g, '').trim()
      )
    )
  );

  const getCategoryColor = (cat: TemplateCategory) => {
    switch (cat) {
      case 'sponsorship':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'outreach':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'follow_up':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'meeting':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  const totalTemplates = templates.length;
  const favoriteCount = templates.filter((t) => t.isFavorite).length;
  const mostUsed = [...templates].sort((a, b) => b.usageCount - a.usageCount)[0];

  return (
    <AppShell>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Title & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
              <FileText className="w-6 h-6 text-blue-500" />
              <span>Email Templates & Snippets</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Reusable templates with dynamic placeholder variables and instant 1-click composer insertion.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center space-x-1.5 shadow-lg shadow-blue-600/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Template</span>
            </button>
          </div>
        </div>

        {/* Stats Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-1">
            <span className="text-[11px] font-semibold text-slate-400">Total Templates</span>
            <div className="text-2xl font-bold text-white">{totalTemplates}</div>
            <p className="text-[10px] text-slate-500">Ready to use</p>
          </div>

          <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-1">
            <span className="text-[11px] font-semibold text-amber-400 flex items-center space-x-1">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>Starred Templates</span>
            </span>
            <div className="text-2xl font-bold text-amber-300">{favoriteCount}</div>
            <p className="text-[10px] text-slate-500">Quick-access favorites</p>
          </div>

          <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-1">
            <span className="text-[11px] font-semibold text-purple-400 flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Categories</span>
            </span>
            <div className="text-2xl font-bold text-purple-300">5</div>
            <p className="text-[10px] text-slate-500">Sponsorship, Outreach, etc.</p>
          </div>

          <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-1">
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Top Template</span>
            </span>
            <div className="text-xs font-bold text-emerald-300 truncate mt-1">
              {mostUsed ? mostUsed.name : 'None yet'}
            </div>
            <p className="text-[10px] text-slate-500">
              {mostUsed ? `Used ${mostUsed.usageCount} time(s)` : 'Start composing'}
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 text-xs">
            {['all', 'sponsorship', 'outreach', 'follow_up', 'meeting', 'general'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition capitalize ${
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Search & Favorites Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition ${
                favoritesOnly
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-amber-400' : ''}`} />
              <span>Favorites</span>
            </button>

            <form onSubmit={handleSearchSubmit} className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </form>
          </div>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
            <p className="text-xs">Loading templates library...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Templates Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create your own custom email templates with dynamic placeholders to streamline your outreach.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
            >
              Create Your First Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tmpl) => (
              <div
                key={tmpl._id}
                className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 backdrop-blur-xl shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                {/* Top: Category & Favorite */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getCategoryColor(
                        tmpl.category
                      )}`}
                    >
                      {tmpl.category.replace('_', ' ')}
                    </span>
                    <h3 className="text-sm font-bold text-white leading-snug">{tmpl.name}</h3>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleToggleFavorite(tmpl)}
                      className={`p-1.5 rounded-lg border transition ${
                        tmpl.isFavorite
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'border-slate-800 text-slate-500 hover:text-amber-400 hover:bg-slate-800'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${tmpl.isFavorite ? 'fill-amber-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(tmpl)}
                      className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tmpl._id)}
                      className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subject Preview */}
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Subject Line:
                  </span>
                  <p className="text-xs font-semibold text-slate-200 truncate">{tmpl.subject}</p>
                </div>

                {/* Body Text Snippet */}
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 font-sans">
                  {tmpl.bodyText}
                </p>

                {/* Placeholders Variables */}
                {tmpl.placeholders && tmpl.placeholders.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tmpl.placeholders.map((ph) => (
                      <span
                        key={ph}
                        className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-mono"
                      >
                        {`{{${ph}}}`}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom Action Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-500">
                    Used {tmpl.usageCount} time{tmpl.usageCount === 1 ? '' : 's'}
                  </span>

                  <button
                    onClick={() => handleUseInComposer(tmpl)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center space-x-1.5 shadow-md shadow-blue-600/20"
                  >
                    <span>Use in Composer</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
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
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., MUN Sponsorship Deck Outreach"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value as TemplateCategory })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="sponsorship">Sponsorship</option>
                      <option value="outreach">Outreach</option>
                      <option value="follow_up">Follow-Up</option>
                      <option value="meeting">Meeting</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Sponsorship & Partnership: {{conference_name}}"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-400 font-semibold">
                      Email Body Content *
                    </label>
                    <span className="text-[10px] text-slate-500">
                      Use <code className="text-blue-400">{`{{variable_name}}`}</code> for dynamic placeholders
                    </span>
                  </div>

                  <textarea
                    rows={8}
                    value={formData.bodyText}
                    onChange={(e) => setFormData({ ...formData, bodyText: e.target.value })}
                    placeholder="Dear {{recipient_name}},\n\nI am writing to..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                    required
                  />
                </div>

                {/* Quick Variable Insert Helper */}
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400">
                    Quick Insert Placeholders:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['recipient_name', 'company_name', 'sender_name', 'deadline', 'topic'].map(
                      (v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => insertVariable(v)}
                          className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono transition"
                        >
                          + {`{{${v}}}`}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Detected Placeholders Preview */}
                {detectedFormVars.length > 0 && (
                  <div className="text-[11px] text-slate-400 space-x-1">
                    <span className="font-semibold text-slate-300">Detected Variables:</span>
                    {detectedFormVars.map((v) => (
                      <span
                        key={v}
                        className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono text-[10px]"
                      >
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFavorite}
                      onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0"
                    />
                    <span>Mark as Favorite ⭐</span>
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
                      <span>{isSaving ? 'Saving...' : 'Save Template'}</span>
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
