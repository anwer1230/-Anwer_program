import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Terminal,
  Layers,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Code2,
  Radio,
  Sparkles,
  Lock,
  Phone,
  Users,
  Compass,
  Bookmark,
} from 'lucide-react';
import { ConnectionsManager, MessagesController } from '../lib/ConnectionsManager';
import { TLRPC } from '../lib/TLRPC';

interface TLRPCConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'ar' | 'en';
}

interface RPCMethodTemplate {
  name: string;
  category: string;
  description: string;
  descriptionEn: string;
  defaultParams: string;
}

const RPC_TEMPLATES: RPCMethodTemplate[] = [
  // 1. Auth
  {
    name: 'auth.sendCode',
    category: 'المصادقة (Auth)',
    description: 'طلب إرسال كود تحقق لهاتف المستخدم عبر خوادم تليجرام',
    descriptionEn: 'Request authentication code from Telegram servers',
    defaultParams: JSON.stringify({ phone_number: '+9647701234567', api_id: 22043994, api_hash: '56f64582b363d367280db96586b97801' }, null, 2),
  },
  {
    name: 'auth.signIn',
    category: 'المصادقة (Auth)',
    description: 'تسجيل الدخول والتحقق من الكود المرسل',
    descriptionEn: 'Sign in with phone code',
    defaultParams: JSON.stringify({ phone_number: '+9647701234567', phone_code: '12345', phone_code_hash: 'mock_hash' }, null, 2),
  },
  // 2. Messages & Dialogs
  {
    name: 'messages.getDialogs',
    category: 'المحادثات والرسائل (Messages)',
    description: 'جلب قائمة المحادثات والحوارات النشطة مع Pagination',
    descriptionEn: 'Fetch active dialogs with unread counts',
    defaultParams: JSON.stringify({ limit: 50, offset_date: 0, offset_id: 0 }, null, 2),
  },
  {
    name: 'messages.getHistory',
    category: 'المحادثات والرسائل (Messages)',
    description: 'جلب سجل الرسائل داخل محادثة معينة',
    descriptionEn: 'Get message history for peer',
    defaultParams: JSON.stringify({ peer: { chat_id: 1 }, limit: 20 }, null, 2),
  },
  {
    name: 'messages.sendMessage',
    category: 'المحادثات والرسائل (Messages)',
    description: 'إرسال رسالة نصية واستقبال تحديثات Updates الفورية',
    descriptionEn: 'Send text message and receive real-time updates',
    defaultParams: JSON.stringify({ peer: { chat_id: 1 }, message: 'مرحبا عبر بروتوكول MTProto TLRPC!' }, null, 2),
  },
  {
    name: 'messages.sendReaction',
    category: 'المحادثات والرسائل (Messages)',
    description: 'إرسال تفاعل (Reaction Emoji) على رسالة',
    descriptionEn: 'Send reaction emoji on message',
    defaultParams: JSON.stringify({ peer: { chat_id: 1 }, msg_id: 1, reaction: '❤️' }, null, 2),
  },
  // 3. Channels & Groups
  {
    name: 'channels.createChannel',
    category: 'المجموعات والقنوات (Channels)',
    description: 'إنشاء قناة عامة أو سوبر جروب',
    descriptionEn: 'Create new channel or supergroup',
    defaultParams: JSON.stringify({ title: 'قناة تليجرام جديدة MTProto', about: 'قناة اختبار بروتوكول TL', broadcast: true }, null, 2),
  },
  {
    name: 'channels.getParticipants',
    category: 'المجموعات والقنوات (Channels)',
    description: 'جلب قائمة الأعضاء والمشرفين في القناة',
    descriptionEn: 'Get participants and admins of channel',
    defaultParams: JSON.stringify({ channel: { channel_id: 1 }, limit: 50 }, null, 2),
  },
  // 4. Contacts & Users
  {
    name: 'contacts.getContacts',
    category: 'جهات الاتصال والمستخدمين (Contacts & Users)',
    description: 'مزامنة جهات الاتصال ودفتر العناوين السحابي',
    descriptionEn: 'Sync phone contacts with cloud',
    defaultParams: JSON.stringify({ hash: 0 }, null, 2),
  },
  {
    name: 'users.getFullUser',
    category: 'جهات الاتصال والمستخدمين (Contacts & Users)',
    description: 'جلب الملف الشخصي الكامل (السيرة، الصورة، الإعدادات)',
    descriptionEn: 'Fetch full profile details and bio',
    defaultParams: JSON.stringify({ id: { user_id: 'me' } }, null, 2),
  },
  // 5. Stories
  {
    name: 'stories.getAllStories',
    category: 'القصص والحالات (Stories)',
    description: 'جلب قصص وتحديثات الأصدقاء والقنوات',
    descriptionEn: 'Fetch stories from contacts and channels',
    defaultParams: JSON.stringify({}, null, 2),
  },
  {
    name: 'stories.sendStory',
    category: 'القصص والحالات (Stories)',
    description: 'نشر قصة مصورة أو فيديو لمدة 24 ساعة',
    descriptionEn: 'Post photo/video story for 24h',
    defaultParams: JSON.stringify({ caption: 'قصتي عبر MTProto!', period: 86400 }, null, 2),
  },
  // 6. Calls
  {
    name: 'phone.requestCall',
    category: 'المكالمات المشفرة (Calls)',
    description: 'طلب بدء مكالمة صوتية مشفرة E2EE',
    descriptionEn: 'Request E2EE encrypted voice call',
    defaultParams: JSON.stringify({ user_id: { user_id: 101 } }, null, 2),
  },
];

export const TLRPCConsoleModal: React.FC<TLRPCConsoleModalProps> = ({ isOpen, onClose, lang = 'ar' }) => {
  const isRtl = lang === 'ar';
  const [selectedTemplate, setSelectedTemplate] = useState<RPCMethodTemplate>(RPC_TEMPLATES[2]);
  const [paramsText, setParamsText] = useState<string>(RPC_TEMPLATES[2].defaultParams);
  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [logHistory, setLogHistory] = useState<Array<{ method: string; time: string; status: 'ok' | 'err'; res: any }>>([]);

  useEffect(() => {
    setParamsText(selectedTemplate.defaultParams);
  }, [selectedTemplate]);

  if (!isOpen) return null;

  const handleExecute = async () => {
    setIsLoading(true);
    let parsedParams = {};
    try {
      parsedParams = JSON.parse(paramsText);
    } catch (e: any) {
      alert(isRtl ? `خطأ في صياغة JSON: ${e.message}` : `Invalid JSON: ${e.message}`);
      setIsLoading(false);
      return;
    }

    const timeStr = new Date().toLocaleTimeString();

    try {
      const res = await fetch('/api/telegram/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: selectedTemplate.name,
          params: parsedParams,
          seq_no: Math.floor(Math.random() * 1000) + 1,
          session_id: 'session_' + Date.now(),
        }),
      });

      const json = await res.json();
      setResponseOutput(json);
      setLogHistory((prev) => [
        { method: selectedTemplate.name, time: timeStr, status: res.ok ? 'ok' : 'err', res: json },
        ...prev.slice(0, 19),
      ]);
    } catch (err: any) {
      const errObj = { error: err.message };
      setResponseOutput(errObj);
      setLogHistory((prev) => [
        { method: selectedTemplate.name, time: timeStr, status: 'err', res: errObj },
        ...prev.slice(0, 19),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2900] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md font-sans">
      <div
        className="w-full max-w-5xl bg-[#17212b] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col h-[85vh] text-slate-100 overflow-hidden"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-4 bg-[#0e1621] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-base flex items-center gap-2">
                <span>{isRtl ? 'محاكي ومستكشف أوامر MTProto TLRPC' : 'MTProto TLRPC Console & Inspector'}</span>
                <span className="text-[11px] bg-sky-500/20 text-sky-300 font-mono px-2 py-0.5 rounded-md">
                  DrKLO/Telegram
                </span>
              </div>
              <div className="text-xs text-slate-400">
                {isRtl ? 'تنفيذ استدعاءات RPC الحقيقية واستقبال كائنات TL_updates المباشرة' : 'Execute live MTProto RPC calls with TL Object responses'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden">
          {/* Left / Methods List */}
          <div className="md:col-span-4 border-r border-slate-800 p-3 overflow-y-auto space-y-1 bg-[#131b24] custom-scrollbar">
            <div className="text-xs font-bold text-slate-400 mb-2 px-2">
              {isRtl ? 'قائمة استدعاءات TLRPC (9 أقسام):' : 'TLRPC Methods (9 Categories):'}
            </div>
            {RPC_TEMPLATES.map((tpl) => (
              <button
                key={tpl.name}
                onClick={() => setSelectedTemplate(tpl)}
                className={`w-full text-start p-2.5 rounded-xl text-xs transition-all flex flex-col gap-1 ${
                  selectedTemplate.name === tpl.name
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono">{tpl.name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-sans ${
                      selectedTemplate.name === tpl.name ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-700/60 text-slate-400'
                    }`}
                  >
                    {tpl.category.split(' ')[0]}
                  </span>
                </div>
                <div
                  className={`text-[11px] truncate ${
                    selectedTemplate.name === tpl.name ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {isRtl ? tpl.description : tpl.descriptionEn}
                </div>
              </button>
            ))}
          </div>

          {/* Right / Request & Response Workspace */}
          <div className="md:col-span-8 p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar bg-[#17212b]">
            {/* Active Method Banner */}
            <div className="p-3 bg-[#0e1621] rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-sky-400 font-mono font-bold block">{selectedTemplate.name}</span>
                <span className="text-xs text-slate-300">
                  {isRtl ? selectedTemplate.description : selectedTemplate.descriptionEn}
                </span>
              </div>
              <button
                onClick={handleExecute}
                disabled={isLoading}
                className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isRtl ? 'تنفيذ الاستدعاء (Run RPC)' : 'Execute RPC'}</span>
              </button>
            </div>

            {/* Request Params JSON Editor */}
            <div className="flex-1 flex flex-col min-h-[140px]">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold">{isRtl ? 'معاملات الطلب (TL Params JSON):' : 'Request Params (JSON):'}</span>
                <button
                  onClick={() => setParamsText(selectedTemplate.defaultParams)}
                  className="text-[11px] text-sky-400 hover:underline"
                >
                  {isRtl ? 'استعادة الافتراضي' : 'Reset'}
                </button>
              </div>
              <textarea
                value={paramsText}
                onChange={(e) => setParamsText(e.target.value)}
                className="w-full flex-1 p-3 bg-[#0e1621] border border-slate-800 rounded-xl font-mono text-xs text-emerald-400 focus:outline-none focus:border-sky-500 resize-none"
                spellCheck={false}
              />
            </div>

            {/* Response Output */}
            <div className="flex-1 flex flex-col min-h-[180px]">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold">{isRtl ? 'استجابة الخادم (TL Response Object):' : 'Server TL Response:'}</span>
                {responseOutput && (
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(JSON.stringify(responseOutput, null, 2));
                      alert(isRtl ? 'تم نسخ النتيجة' : 'Copied');
                    }}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'نسخ' : 'Copy'}</span>
                  </button>
                )}
              </div>
              <pre className="w-full flex-1 p-3 bg-[#0a0f16] border border-slate-800 rounded-xl font-mono text-xs text-sky-300 overflow-auto custom-scrollbar">
                {responseOutput ? JSON.stringify(responseOutput, null, 2) : '// اضغط على "تنفيذ الاستدعاء" لعرض الاستجابة المباشرة...'}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-2.5 bg-[#0e1621] border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between px-4 font-mono">
          <span>ConnectionsManager • Session State: Connected</span>
          <span>TL Schema: v184 (DrKLO/Telegram Android)</span>
        </div>
      </div>
    </div>
  );
};
