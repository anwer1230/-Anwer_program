import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  MessageSquare, 
  Send, 
  User, 
  Bot, 
  HelpCircle, 
  Layers, 
  Clock, 
  Tag, 
  X,
  AlertCircle,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { LearningService, UnknownRequest, Suggestion } from '../../types';

interface LearningBotTabProps {
  activePrivate: boolean;
  activeGroup: boolean;
  services: { [name: string]: LearningService };
  unknownRequests: UnknownRequest[];
  suggestions: Suggestion[];
  onToggleLearning: (chatType: 'private' | 'group', active: boolean) => Promise<void>;
  onAddService: (data: { name: string; description: string; keywords: string[]; price_range: string; time_range: string }) => Promise<boolean>;
  onDeleteService: (name: string) => Promise<boolean>;
  onAcceptSuggestion: (id: string) => Promise<boolean>;
  onClearUnknown: () => Promise<void>;
}

export const LearningBotTab: React.FC<LearningBotTabProps> = ({
  activePrivate,
  activeGroup,
  services,
  unknownRequests,
  suggestions,
  onToggleLearning,
  onAddService,
  onDeleteService,
  onAcceptSuggestion,
  onClearUnknown
}) => {
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceKeywords, setServiceKeywords] = useState('');
  const [servicePrice, setServicePrice] = useState('50-200 ريال');
  const [serviceTime, setServiceTime] = useState('2-24 ساعة');

  // Live AI Chat Simulator State
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string; detectedService?: string }>>([
    {
      role: 'assistant',
      text: 'يا هلا والله ومسهلا في مركز سرعة إنجاز للخدمات الأكاديمية والترجمة 🌹 كيف أقدر أساعدك اليوم؟',
      time: '12:00 م'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [senderName, setSenderName] = useState('أحمد القحطاني');
  const [isChatSending, setIsChatSending] = useState(false);

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || !serviceDesc.trim()) return;
    const kwList = serviceKeywords.split(',').map(k => k.trim()).filter(Boolean);
    const ok = await onAddService({
      name: serviceName.trim(),
      description: serviceDesc.trim(),
      keywords: kwList,
      price_range: servicePrice.trim(),
      time_range: serviceTime.trim()
    });
    if (ok) {
      setServiceName('');
      setServiceDesc('');
      setServiceKeywords('');
      setIsAddServiceModalOpen(false);
    }
  };

  const handleSendLiveChat = async () => {
    if (!chatInput.trim() || isChatSending) return;
    const userText = chatInput.trim();
    const nowStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

    setChatMessages(prev => [...prev, { role: 'user', text: userText, time: nowStr }]);
    setChatInput('');
    setIsChatSending(true);

    try {
      const res = await fetch('/api/learning/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_name: senderName,
          text: userText,
          history: chatMessages
        })
      }).then(r => r.json());

      if (res.success) {
        setChatMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: res.reply,
            time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
            detectedService: res.detected_service
          }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsChatSending(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Activation Switches */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-indigo-400" />
            <span>نظام التعلم الذكي والبوت التفاعلي (مركز سرعة إنجاز)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            بوت تفاعلي يتعلم الخدمات الأكاديمية ويرد بالعامية الخليجية الودية، مع تحليل الطلبات المجهولة.
          </p>
        </div>

        {/* Dual Activation Switches */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onToggleLearning('private', !activePrivate)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md ${
              activePrivate
                ? 'bg-purple-600 hover:bg-purple-500 text-white ring-2 ring-purple-400/40'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            <span>{activePrivate ? 'الخاص: مفعل ✅' : 'الخاص: معطل ❌'}</span>
          </button>

          <button
            onClick={() => onToggleLearning('group', !activeGroup)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md ${
              activeGroup
                ? 'bg-blue-600 hover:bg-blue-500 text-white ring-2 ring-blue-400/40'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            <span>{activeGroup ? 'المجموعات: مفعل ✅' : 'المجموعات: معطل ❌'}</span>
          </button>

          <button
            onClick={() => setIsAddServiceModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة خدمة لقاعدة المعرفة</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Knowledge Base (7 cols) + Live AI Simulator (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Knowledge Base Services + Unknown & Suggestions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Services Grid */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-400" />
                <span>قاعدة المعرفة والخدمات المسجلة ({Object.keys(services).length})</span>
              </span>
              <span className="text-[11px] text-slate-400">
                الكلمات المفتاحية والأسعار ومدة الإنجاز
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {(Object.entries(services) as [string, LearningService][]).map(([name, s]) => (
                <div
                  key={name}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2.5 hover:border-indigo-500/50 transition relative group"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
                      <span>{name}</span>
                    </h4>
                    <button
                      onClick={() => onDeleteService(name)}
                      className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition"
                      title="حذف الخدمة"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {s.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1 border-t border-slate-800/80">
                    <span className="text-cyan-400 font-semibold">💰 {s.price_range}</span>
                    <span className="text-amber-400 font-semibold">⏱️ {s.time_range}</span>
                  </div>

                  {/* Keywords pills */}
                  <div className="flex items-center gap-1 flex-wrap pt-0.5">
                    {s.keywords?.slice(0, 4).map((kw, i) => (
                      <span key={i} className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-400 border border-slate-700/60">
                        {kw}
                      </span>
                    ))}
                    {s.keywords && s.keywords.length > 4 && (
                      <span className="text-[9px] text-slate-500">+{s.keywords.length - 4}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Suggestions Box */}
          {suggestions && suggestions.length > 0 && (
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>اقتراحات الذكاء الاصطناعي الذكية ({suggestions.length})</span>
                </span>
                <span className="text-[10px] text-slate-400">بناءً على تكرار استفسارات العملاء</span>
              </div>

              <div className="space-y-2">
                {suggestions.map((sug) => (
                  <div
                    key={sug.id}
                    className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-amber-200">النمط: "{sug.pattern}"</div>
                      <div className="text-slate-300 text-[11px]">الرد المقترح: {sug.suggested_reply}</div>
                    </div>

                    <button
                      onClick={() => onAcceptSuggestion(sug.id)}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] shrink-0 transition"
                    >
                      اعتماد كقاعدة رد ✅
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unknown Customer Requests Queue */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400" />
                <span>طلبات العملاء غير المصنفة ({unknownRequests.length})</span>
              </span>
              {unknownRequests.length > 0 && (
                <button
                  onClick={onClearUnknown}
                  className="text-[11px] text-slate-400 hover:text-rose-400 transition"
                >
                  مسح القائمة
                </button>
              )}
            </div>

            {unknownRequests.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                لا توجد استفسارات مجهولة جديدة. البوت يجيب على جميع الطلبات بسلاسة.
              </div>
            ) : (
              <div className="space-y-2">
                {unknownRequests.map((unk) => (
                  <div
                    key={unk.id}
                    className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-200">{unk.text}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">من: {unk.sender} • {unk.time}</div>
                    </div>
                    <button
                      onClick={() => {
                        setServiceName(unk.text.slice(0, 20));
                        setServiceDesc(unk.text);
                        setIsAddServiceModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-[10px] font-bold transition"
                    >
                      إضافة كخدمة ➕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Interactive Live AI Chat Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-xl flex flex-col h-[600px] overflow-hidden">
            
            {/* Chat Header */}
            <div className="p-3.5 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">محاكي بوت سرعة إنجاز المباشر</h4>
                  <p className="text-[10px] text-emerald-400">● ذكاء اصطناعي باللهجة الخليجية</p>
                </div>
              </div>

              {/* Persona selector */}
              <select
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-[10px] text-slate-300"
              >
                <option value="أحمد القحطاني">أحمد القحطاني (طالب)</option>
                <option value="سارة الشمري">سارة الشمري (باحثة ماجستير)</option>
                <option value="فيصل العتيبي">فيصل العتيبي (مهتم بـ SPSS)</option>
              </select>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/40">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                    msg.role === 'user'
                      ? 'bg-slate-700 text-slate-200'
                      : 'bg-indigo-600 text-white'
                  }`}>
                    {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>

                  <div className={`max-w-[78%] rounded-2xl p-3 text-xs leading-relaxed space-y-1 ${
                    msg.role === 'user'
                      ? 'bg-slate-800 text-slate-100 rounded-tr-none'
                      : 'bg-indigo-950/80 border border-indigo-700/50 text-indigo-100 rounded-tl-none shadow-sm'
                  }`}>
                    <p>{msg.text}</p>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
                      <span>{msg.time}</span>
                      {msg.detectedService && (
                        <span className="text-cyan-300 font-bold bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-800/40">
                          {msg.detectedService}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isChatSending && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 animate-pulse">
                  <Bot className="h-4 w-4" />
                  <span>البوت يكتب رداً ودياً...</span>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="p-2 bg-slate-900/90 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-[10px] text-slate-500 shrink-0">جرّب:</span>
              {[
                'بكم تحلون واجب إدارة الأعمال؟',
                'عندي بحث تخرج 20 صفحة',
                'هل تسوون تحليل استبيان بـ SPSS؟',
                'السلام عليكم كيف حالكم'
              ].map((qp, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setChatInput(qp)}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0 border border-slate-700/50"
                >
                  {qp}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-slate-900 border-t border-slate-700 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendLiveChat()}
                placeholder="اكتب استفسار العميل هنا للاختبار..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                disabled={isChatSending || !chatInput.trim()}
                onClick={handleSendLiveChat}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md disabled:opacity-50 transition active:scale-95"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Modal: Add Service to Knowledge Base */}
      {isAddServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-850 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-indigo-400" />
                <span>إضافة خدمة جديدة لقاعدة المعرفة</span>
              </h3>
              <button onClick={() => setIsAddServiceModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">اسم الخدمة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: إعداد عروض بوربوينت"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">وصف الخدمة والمميزات *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="مثال: تصميم عروض تقديمية احترافية مع حركات وسلايدات تفاعلية..."
                  value={serviceDesc}
                  onChange={(e) => setServiceDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">الكلمات المفتاحية (مفصولة بفواصل)</label>
                <input
                  type="text"
                  placeholder="بوربوينت, عرض, سلايدات, pptx, برزنتيشن"
                  value={serviceKeywords}
                  onChange={(e) => setServiceKeywords(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">نطاق السعر التقديري</label>
                  <input
                    type="text"
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">مدة الإنجاز</label>
                  <input
                    type="text"
                    value={serviceTime}
                    onChange={(e) => setServiceTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  حفظ الخدمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
