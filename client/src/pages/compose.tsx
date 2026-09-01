import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AppShell } from '@/components/AppShell';
import { emailApi } from '@/services/emailApi';
import { aiApi } from '@/services/aiApi';
import { copilotApi } from '@/services/copilotApi';
import { useAccountStore } from '@/store/accountStore';
import {
  Send,
  Sparkles,
  Paperclip,
  Trash2,
  FileText,
  Wand2,
  CheckCircle,
  Clock,
  ArrowLeft,
  X,
  Plus,
  Loader2,
  ChevronDown,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ComposePage() {
  const router = useRouter();
  const { to: initialTo, subject: initialSubject, body: initialBody, aiPrompt: initialAiPrompt } = router.query;
  const { activeAccount, accounts } = useAccountStore();
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    activeAccount?._id || accounts[0]?._id || ''
  );

  const [toInput, setToInput] = useState('');
  const [toRecipients, setToRecipients] = useState<string[]>([]);
  const [ccRecipients, setCcRecipients] = useState<string[]>([]);
  const [bccRecipients, setBccRecipients] = useState<string[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');

  const [attachments, setAttachments] = useState<
    Array<{ filename: string; mimeType: string; contentBase64: string; size: number }>
  >([]);

  const [isSending, setIsSending] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [customScheduleTime, setCustomScheduleTime] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [subjectSuggestions, setSubjectSuggestions] = useState<string[]>([]);
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);

  const handleScheduleEmail = async (scheduledFor: string) => {
    if (toRecipients.length === 0 && !toInput.trim()) {
      toast.error('Please add at least one recipient email address.');
      return;
    }

    const allTo = [...toRecipients];
    if (toInput.trim() && toInput.includes('@')) {
      allTo.push(toInput.trim().toLowerCase());
    }

    setIsSending(true);
    try {
      await copilotApi.scheduleEmail({
        accountId: selectedAccountId || activeAccount?._id,
        to: allTo,
        cc: ccRecipients,
        bcc: bccRecipients,
        subject: subject.trim() || '(No Subject)',
        bodyText: body,
        bodyHtml: body ? `<div>${body.replace(/\n/g, '<br/>')}</div>` : '',
        scheduledFor,
      });

      toast.success(`Email scheduled for ${new Date(scheduledFor).toLocaleString()}!`);
      setShowScheduleModal(false);
      router.push('/copilot');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to schedule email.');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (initialTo && typeof initialTo === 'string') {
      setToRecipients([initialTo]);
    }
    if (initialSubject && typeof initialSubject === 'string') {
      setSubject(initialSubject);
    }
    if (initialBody && typeof initialBody === 'string') {
      setBody(initialBody);
    }
    if (initialAiPrompt && typeof initialAiPrompt === 'string') {
      setAiPrompt(initialAiPrompt);
    }
  }, [initialTo, initialSubject, initialBody, initialAiPrompt]);

  // Recipient Tag Handlers
  const handleAddRecipient = (type: 'to' | 'cc' | 'bcc', value: string) => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) return;

    if (type === 'to' && !toRecipients.includes(trimmed)) {
      setToRecipients([...toRecipients, trimmed]);
      setToInput('');
    } else if (type === 'cc' && !ccRecipients.includes(trimmed)) {
      setCcRecipients([...ccRecipients, trimmed]);
    } else if (type === 'bcc' && !bccRecipients.includes(trimmed)) {
      setBccRecipients([...bccRecipients, trimmed]);
    }
  };

  const handleRemoveRecipient = (type: 'to' | 'cc' | 'bcc', email: string) => {
    if (type === 'to') setToRecipients(toRecipients.filter((e) => e !== email));
    if (type === 'cc') setCcRecipients(ccRecipients.filter((e) => e !== email));
    if (type === 'bcc') setBccRecipients(bccRecipients.filter((e) => e !== email));
  };

  // AI Draft Generator
  const handleGenerateAiDraft = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please describe what you want the email to say.');
      return;
    }

    setIsGeneratingAi(true);
    try {
      const result = await aiApi.generateReply(
        `Topic: ${subject || 'New Message'}\n\nInstructions: ${aiPrompt}`,
        'Professional'
      );
      if (result.replies && result.replies.length > 0) {
        setBody(result.replies[0].text);
        toast.success('AI draft generated successfully!');
      }
    } catch {
      toast.error('Failed to generate AI draft.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // AI Tone Rewriter
  const handleAiRewrite = async (goal: string) => {
    if (!body.trim()) {
      toast.error('Please write some content first before rewriting.');
      return;
    }

    setIsRewriting(true);
    try {
      const result = await aiApi.rewriteDraft(body, goal);
      setBody(result.rewrittenText);
      toast.success(`Rewritten with "${goal}" tone!`);
    } catch {
      toast.error('Failed to rewrite email.');
    } finally {
      setIsRewriting(false);
    }
  };

  const [isSuggestingSubjects, setIsSuggestingSubjects] = useState(false);

  // AI Subject Line Generator
  const handleGenerateSubjects = async () => {
    const draftContext = body.trim() || aiPrompt.trim() || subject.trim();
    if (!draftContext) {
      toast.error('Please write some email body content, subject, or AI prompt first.');
      return;
    }

    setIsSuggestingSubjects(true);
    try {
      const suggestions = await aiApi.generateSubjectLines(draftContext);
      setSubjectSuggestions(suggestions);
      setShowSubjectSuggestions(true);
      toast.success('Subject line recommendations ready!');
    } catch {
      toast.error('Failed to generate subject lines.');
    } finally {
      setIsSuggestingSubjects(false);
    }
  };

  // Attachment File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setAttachments((prev) => [
          ...prev,
          {
            filename: file.name,
            mimeType: file.type || 'application/octet-stream',
            contentBase64: base64,
            size: file.size,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachment = (filename: string) => {
    setAttachments(attachments.filter((a) => a.filename !== filename));
  };

  // Send Email Action
  const handleSendEmail = async () => {
    if (toRecipients.length === 0 && !toInput.trim()) {
      toast.error('Please add at least one recipient email address.');
      return;
    }

    const allTo = [...toRecipients];
    if (toInput.trim() && toInput.includes('@')) {
      allTo.push(toInput.trim().toLowerCase());
    }

    setIsSending(true);
    try {
      await emailApi.sendEmail({
        accountId: selectedAccountId || activeAccount?._id,
        to: allTo,
        cc: ccRecipients,
        bcc: bccRecipients,
        subject: subject.trim() || '(No Subject)',
        bodyText: body,
        bodyHtml: body ? `<div>${body.replace(/\n/g, '<br/>')}</div>` : '',
        attachments: attachments.map((a) => ({
          filename: a.filename,
          mimeType: a.mimeType,
          contentBase64: a.contentBase64,
        })),
      });

      toast.success('Email sent successfully via Gmail!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send email.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header Toolbar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <span>From:</span>
              {accounts.length > 1 ? (
                <select
                  value={selectedAccountId || activeAccount?._id || ''}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-white font-semibold focus:outline-none focus:border-blue-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.email}
                    </option>
                  ))}
                </select>
              ) : (
                <strong className="text-slate-200">
                  {activeAccount?.email || accounts[0]?.email || 'Gmail'}
                </strong>
              )}
            </div>

            <button
              onClick={() => {
                if (toRecipients.length === 0 && !toInput.trim()) {
                  toast.error('Please add at least one recipient first.');
                  return;
                }
                setShowScheduleModal(true);
              }}
              className="p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center space-x-1.5"
              title="Schedule Send"
            >
              <Clock className="w-4 h-4 text-blue-400" />
            </button>

            <button
              onClick={handleSendEmail}
              disabled={isSending}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs transition flex items-center space-x-2 shadow-lg shadow-blue-600/25 active:scale-95 disabled:opacity-50"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{isSending ? 'Sending...' : 'Send Message'}</span>
            </button>
          </div>
        </div>

        {/* Schedule Send Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-white font-bold text-sm">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Schedule Delivery</span>
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-slate-400 font-medium">Quick Presets:</div>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      d.setHours(9, 0, 0, 0);
                      handleScheduleEmail(d.toISOString());
                    }}
                    className="w-full text-left p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 hover:text-white transition flex items-center justify-between"
                  >
                    <span>Tomorrow Morning</span>
                    <span className="text-slate-400 font-mono">9:00 AM</span>
                  </button>

                  <button
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      d.setHours(14, 0, 0, 0);
                      handleScheduleEmail(d.toISOString());
                    }}
                    className="w-full text-left p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 hover:text-white transition flex items-center justify-between"
                  >
                    <span>Tomorrow Afternoon</span>
                    <span className="text-slate-400 font-mono">2:00 PM</span>
                  </button>

                  <button
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7 || 7));
                      d.setHours(9, 0, 0, 0);
                      handleScheduleEmail(d.toISOString());
                    }}
                    className="w-full text-left p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 hover:text-white transition flex items-center justify-between"
                  >
                    <span>Monday Morning</span>
                    <span className="text-slate-400 font-mono">9:00 AM</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Or pick custom time:</div>
                <input
                  type="datetime-local"
                  value={customScheduleTime}
                  onChange={(e) => setCustomScheduleTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  disabled={!customScheduleTime}
                  onClick={() => {
                    if (customScheduleTime) {
                      handleScheduleEmail(new Date(customScheduleTime).toISOString());
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs transition"
                >
                  Confirm Scheduled Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Quick Drafting Bar */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-blue-950/30 border border-purple-500/20 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs shrink-0">
            <Sparkles className="w-4 h-4" />
            <span>AI Draft Generator:</span>
          </div>

          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateAiDraft()}
            placeholder="e.g., Ask for project milestone updates politely..."
            className="flex-1 bg-slate-950/60 border border-purple-500/20 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
          />

          <button
            onClick={handleGenerateAiDraft}
            disabled={isGeneratingAi}
            className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition shrink-0 flex items-center justify-center space-x-1.5 disabled:opacity-50 shadow-md shadow-purple-600/20"
          >
            {isGeneratingAi ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5" />
            )}
            <span>{isGeneratingAi ? 'Drafting...' : 'Generate Draft'}</span>
          </button>
        </div>

        {/* Main Compose Card */}
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl overflow-hidden divide-y divide-slate-800/60">
          {/* TO Field */}
          <div className="p-4 flex items-start space-x-3 bg-slate-950/20">
            <span className="text-xs font-semibold text-slate-400 w-12 pt-1">To:</span>
            <div className="flex-1 flex flex-wrap items-center gap-1.5">
              {toRecipients.map((email) => (
                <span
                  key={email}
                  className="px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-medium flex items-center space-x-1"
                >
                  <span>{email}</span>
                  <button
                    onClick={() => handleRemoveRecipient('to', email)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <input
                type="text"
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddRecipient('to', toInput);
                  }
                }}
                onBlur={() => handleAddRecipient('to', toInput)}
                placeholder={toRecipients.length === 0 ? 'recipient@example.com' : 'Add more...'}
                className="flex-1 min-w-[160px] bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none py-1"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-400 font-semibold shrink-0">
              {!showCc && (
                <button
                  onClick={() => setShowCc(true)}
                  className="hover:text-slate-200 transition"
                >
                  Cc
                </button>
              )}
              {!showBcc && (
                <button
                  onClick={() => setShowBcc(true)}
                  className="hover:text-slate-200 transition"
                >
                  Bcc
                </button>
              )}
            </div>
          </div>

          {/* CC Field (if toggled) */}
          {showCc && (
            <div className="p-4 flex items-center space-x-3 bg-slate-950/20">
              <span className="text-xs font-semibold text-slate-400 w-12">Cc:</span>
              <div className="flex-1 flex flex-wrap items-center gap-1.5">
                {ccRecipients.map((email) => (
                  <span
                    key={email}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium flex items-center space-x-1"
                  >
                    <span>{email}</span>
                    <button
                      onClick={() => handleRemoveRecipient('cc', email)}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddRecipient('cc', (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  placeholder="Add CC recipient..."
                  className="flex-1 min-w-[160px] bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* BCC Field (if toggled) */}
          {showBcc && (
            <div className="p-4 flex items-center space-x-3 bg-slate-950/20">
              <span className="text-xs font-semibold text-slate-400 w-12">Bcc:</span>
              <div className="flex-1 flex flex-wrap items-center gap-1.5">
                {bccRecipients.map((email) => (
                  <span
                    key={email}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium flex items-center space-x-1"
                  >
                    <span>{email}</span>
                    <button
                      onClick={() => handleRemoveRecipient('bcc', email)}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddRecipient('bcc', (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  placeholder="Add BCC recipient..."
                  className="flex-1 min-w-[160px] bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Subject Field & AI Subject Suggester */}
          <div className="p-4 relative">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-semibold text-slate-400 w-12 shrink-0">
                Subject:
              </span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Message Subject..."
                className="flex-1 bg-transparent text-sm font-semibold text-white placeholder-slate-500 focus:outline-none"
              />

              <button
                onClick={handleGenerateSubjects}
                disabled={isSuggestingSubjects}
                className="px-3 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 text-xs font-medium transition flex items-center space-x-1.5 shrink-0 disabled:opacity-50"
                title="Generate high-impact subject lines"
              >
                {isSuggestingSubjects ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                <span>{isSuggestingSubjects ? 'Suggesting...' : 'Suggest Subjects'}</span>
              </button>
            </div>

            {/* Subject Suggestions Dropdown */}
            {showSubjectSuggestions && subjectSuggestions.length > 0 && (
              <div className="mt-3 p-3 rounded-2xl bg-slate-950/90 border border-purple-500/30 space-y-1.5 shadow-2xl">
                <div className="flex items-center justify-between pb-1 text-[11px] font-bold text-purple-300">
                  <span>AI Subject Recommendations:</span>
                  <button
                    onClick={() => setShowSubjectSuggestions(false)}
                    className="hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {subjectSuggestions.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSubject(s);
                      setShowSubjectSuggestions(false);
                    }}
                    className="p-2 rounded-xl bg-slate-900/80 hover:bg-purple-950/40 hover:border-purple-500/40 border border-slate-800 text-xs text-slate-200 cursor-pointer transition font-medium"
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Email Body Text Area */}
          <div className="p-4">
            <textarea
              rows={12}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email content here..."
              className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed font-sans"
            />
          </div>

          {/* Attachments Section (if present) */}
          {attachments.length > 0 && (
            <div className="p-4 bg-slate-950/30 space-y-2">
              <span className="text-xs font-semibold text-slate-400">
                Attachments ({attachments.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {attachments.map((att) => (
                  <div
                    key={att.filename}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 flex items-center space-x-2"
                  >
                    <Paperclip className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-xs">{att.filename}</span>
                    <span className="text-[10px] text-slate-400">
                      ({Math.round(att.size / 1024)} KB)
                    </span>
                    <button
                      onClick={() => handleRemoveAttachment(att.filename)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom AI Toolbar & Attach Button */}
          <div className="p-4 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40">
            {/* AI Rewrite Tone Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-400 font-semibold mr-1 flex items-center space-x-1">
                <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Rewrite:</span>
              </span>

              <button
                onClick={() => handleAiRewrite('formal')}
                disabled={isRewriting}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition font-medium disabled:opacity-50"
              >
                👔 Professional
              </button>

              <button
                onClick={() => handleAiRewrite('casual')}
                disabled={isRewriting}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition font-medium disabled:opacity-50"
              >
                😊 Warm & Friendly
              </button>

              <button
                onClick={() => handleAiRewrite('shorten')}
                disabled={isRewriting}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition font-medium disabled:opacity-50"
              >
                ⚡ Concise
              </button>

              <button
                onClick={() => handleAiRewrite('fix_grammar')}
                disabled={isRewriting}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition font-medium disabled:opacity-50"
              >
                📝 Fix Grammar
              </button>
            </div>

            {/* Attach Files Trigger */}
            <label className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer flex items-center space-x-1.5 shadow-sm">
              <Paperclip className="w-3.5 h-3.5" />
              <span>Attach File</span>
              <input type="file" multiple onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
