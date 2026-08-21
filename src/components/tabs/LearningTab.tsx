import React, { useState } from 'react';
import { Brain, Plus, Trash2, Bot, Sparkles, Send, HelpCircle, CheckCircle2 } from 'lucide-react';
import { LearningService, UnknownRequest } from '../../types';

interface LearningTabProps {
  activePrivate: boolean;
  activeGroup: boolean;
  services: Record<string, LearningService>;
  onToggleActive: (type: 'private' | 'group', active: boolean) => Promise<void>;
  onGenerateAiResponse: (text: string, senderName?: string) => Promise<string>;
}

export const LearningTab: React.FC<LearningTabProps> = ({
  activePrivate,
  activeGroup,
  services,
  onToggleActive,
  onGenerateAiResponse,
}) => {
  const [serviceName, setServiceName] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceKeywords, setServiceKeywords] = useState('');
  const [localServices, setLocalServices] = useState(services);
  const [testMsg, setTestMsg] = useState('سلام عليكم، كم تسوون بحث 10 صفحات باللغة العربية؟');
  const [aiResult, setAiResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || !serviceDesc.trim()) return;
    setLocalServices((prev) => ({
      ...prev,
      [serviceName.trim()]: {
        description: serviceDesc.trim(),
        keywords: serviceKeywords.split(',').map((k) => k.trim()).filter(Boolean),
        price_range: 'حسب المطلوب',
        time_range: 'تسليم سريع',
      },
    }));
    setServiceName('');
    setServiceDesc('');
    setServiceKeywords('');
  };

  const handleTestAi = async () => {
    if (!testMsg.trim()) return;
    setIsGenerating(true);
    const reply = await onGenerateAiResponse(testMsg, 'أحمد');
    setAiResult(reply);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-4 text-right" dir="rtl">
      {/* Header Banner */}
      <div className="rounded-xl p-4 text-white bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-xl shadow-inner">
            <i className="fas fa-brain text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base">نظام التعلم الذكي والمحادثة (Smart AI Learning)</h3>
            <p className="text-xs text-purple-100 opacity-90">
              تدريب الذكاء الاصطناعي على فهم خدماتك والرد التلقائي البشري والذكي باللهجة المناسبة
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 border border-white/30">
          Gemini Pro Engine
        </span>
      </div>

      {/* Activation Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-zinc-200 block">💬 المحادثات الخاصة (Private Chat)</span>
            <span className="text-[11px] text-zinc-400">الرد التلقائي الذكي على الرسائل الفردية</span>
          </div>
          <button
            onClick={() => onToggleActive('private', !activePrivate)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activePrivate
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}
          >
            {activePrivate ? 'مفعل 🟢' : 'معطل 🔴'}
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-zinc-200 block">👥 المجموعات والقنوات (Groups & Channels)</span>
            <span className="text-[11px] text-zinc-400">الرد الذكي عند الإشارة أو استفسار الأعضاء</span>
          </div>
          <button
            onClick={() => onToggleActive('group', !activeGroup)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeGroup
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}
          >
            {activeGroup ? 'مفعل 🟢' : 'معطل 🔴'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Form: Add Knowledge / Service */}
        <div className="lg:col-span-6 bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
          <span className="text-xs font-bold text-zinc-200 block flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-purple-400" />
            <span>إضافة خدمة جديدة لمعرفة البوت:</span>
          </span>

          <form onSubmit={handleAddService} className="space-y-2.5">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">اسم الخدمة أو المادة:</label>
              <input
                type="text"
                required
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="مثال: بحوث تخرج، تحليلات إحصائية، ترجمة"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">تفاصيل وشروط تقديم الخدمة:</label>
              <textarea
                rows={3}
                required
                value={serviceDesc}
                onChange={(e) => setServiceDesc(e.target.value)}
                placeholder="مثال: نقوم بإعداد البحوث الأكاديمية بنسبة أصالة 100% مع التوثيق الكامل APA7"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">الكلمات الدالة (مفصولة بفاصلة):</label>
              <input
                type="text"
                value={serviceKeywords}
                onChange={(e) => setServiceKeywords(e.target.value)}
                placeholder="بحث, تخرج, ماجستير, دكتوراه, استبانة"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <i className="fas fa-plus text-xs" />
              <span>إضافة الخدمة لذاكرة البوت</span>
            </button>
          </form>
        </div>

        {/* Right Section: Test AI Prompt */}
        <div className="lg:col-span-6 bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
          <span className="text-xs font-bold text-zinc-200 block flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>تجربة واختبار أسلوب الرد الذكي:</span>
          </span>

          <div className="space-y-2">
            <textarea
              rows={2}
              value={testMsg}
              onChange={(e) => setTestMsg(e.target.value)}
              placeholder="اكتب رسالة تجريبية لتجربة استجابة البوت الذكي..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
            />

            <button
              type="button"
              onClick={handleTestAi}
              disabled={isGenerating || !testMsg.trim()}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-purple-300 border border-purple-500/30 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <i className="fas fa-spinner fa-spin text-xs" />
                  <span>جاري التفكير والتوليد...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>توليد واختبار الرد الذكي ⚡</span>
                </>
              )}
            </button>
          </div>

          {aiResult && (
            <div className="bg-zinc-950 border border-purple-500/40 rounded-xl p-3 space-y-1">
              <span className="text-[11px] font-bold text-purple-300 block">رد البوت الذكي:</span>
              <p className="text-xs text-zinc-200 leading-relaxed font-sans">{aiResult}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
