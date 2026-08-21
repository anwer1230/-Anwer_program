import React, { useState } from 'react';
import { Bot, Plus, Trash2, Power, CheckCircle2, MessageSquare, Shield } from 'lucide-react';
import { AutoReplyRule } from '../../types';

interface AutoReplyTabProps {
  enabled: boolean;
  rules: AutoReplyRule[];
  onToggleEnabled: (enabled: boolean) => Promise<void>;
  onAddRule: (rule: { keyword: string; reply: string; scope: 'all' | 'private' | 'groups'; match: 'contains' | 'exact' | 'regex' }) => Promise<void>;
  onDeleteRule: (index: number) => Promise<void>;
}

export const AutoReplyTab: React.FC<AutoReplyTabProps> = ({
  enabled,
  rules,
  onToggleEnabled,
  onAddRule,
  onDeleteRule,
}) => {
  const [keyword, setKeyword] = useState('');
  const [reply, setReply] = useState('');
  const [scope, setScope] = useState<'all' | 'private' | 'groups'>('all');
  const [matchMode, setMatchMode] = useState<'contains' | 'exact' | 'regex'>('contains');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim() || !reply.trim()) return;
    await onAddRule({
      keyword: keyword.trim(),
      reply: reply.trim(),
      scope,
      match: matchMode,
    });
    setKeyword('');
    setReply('');
  };

  return (
    <div className="space-y-4 text-right" dir="rtl">
      {/* Header Banner */}
      <div className="rounded-xl p-4 text-white bg-gradient-to-r from-cyan-700 via-sky-600 to-blue-600 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-xl shadow-inner">
            <i className="fas fa-reply-all text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base">الردود التلقائية الذكية (Auto Replies)</h3>
            <p className="text-xs text-cyan-100 opacity-90">
              الرد الفوري والآلي على الرسائل الواردة بناءً على الكلمات المفتاحية
            </p>
          </div>
        </div>

        {/* Master Switch Toggle */}
        <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-xl border border-white/20 backdrop-blur-sm">
          <span className="text-xs font-bold text-white">الرد التلقائي:</span>
          <button
            onClick={() => onToggleEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              enabled ? 'bg-emerald-500' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-1' : 'translate-x-6'
              }`}
            />
          </button>
          <span className="text-[11px] font-bold text-cyan-200">
            {enabled ? 'مفعل 🟢' : 'معطل 🔴'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Form: Add Rule */}
        <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
          <span className="text-xs font-bold text-zinc-200 block flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>إضافة قاعدة رد تلقائي جديدة:</span>
          </span>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                الكلمة المفتاحية (Keyword):
              </label>
              <input
                type="text"
                required
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="مثال: السلام عليكم أو السعر"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                نص الرد التلقائي:
              </label>
              <textarea
                rows={4}
                required
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="مثال: وعليكم السلام ورحمة الله وبركاته، أهلاً بك! كيف يمكنني مساعدتك؟"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">نوع المطابقة:</label>
                <select
                  value={matchMode}
                  onChange={(e) => setMatchMode(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="contains">تحتوي (Contains)</option>
                  <option value="exact">تطابق تام (Exact)</option>
                  <option value="regex">تعبير نمطي (Regex)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">النطاق المطبق:</label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">🌐 الكل (خاص ومجموعات)</option>
                  <option value="private">👤 الخاص فقط</option>
                  <option value="groups">👥 المجموعات فقط</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <i className="fas fa-plus text-xs" />
              <span>إضافة وتفعيل القاعدة</span>
            </button>
          </form>
        </div>

        {/* Right Column: Rules List */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200">
              قواعد الردود المحفوظة ({rules.length}):
            </span>
            <span className="text-[11px] text-zinc-400">
              يتم فحص الرسائل الواردة فورياً وتطبيق الرد المناسب
            </span>
          </div>

          {rules.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-xs">
              <MessageSquare className="w-8 h-8 text-zinc-600 mx-auto mb-2 opacity-50" />
              <span>لا توجد قواعد ردود مضافة بعد. أضف قاعدتك الأولى من النموذج أعلاه.</span>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 space-y-2 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                        "{rule.keyword}"
                      </span>
                      <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                        {rule.scope === 'all' ? '🌐 الكل' : rule.scope === 'private' ? '👤 الخاص' : '👥 المجموعات'}
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteRule(idx)}
                      className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      title="حذف القاعدة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-zinc-300 bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/50 leading-relaxed font-sans">
                    {rule.reply}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
