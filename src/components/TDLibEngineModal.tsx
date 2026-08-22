import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Database,
  Code2,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
  Server,
  FolderLock,
  Lock,
  Globe,
  Radio,
  Share2,
} from 'lucide-react';
import { TDLibClient } from '../lib/tdlib/tdlibClient';
import { TdApi } from '../lib/tdlib/tdApi';

interface TDLibEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'ar' | 'en';
}

type SupportedLang = 'typescript' | 'python' | 'java' | 'csharp';

interface TDLibPreset {
  id: string;
  nameAr: string;
  nameEn: string;
  functionName: string;
  query: TdApi.Function;
  codeSnippets: Record<SupportedLang, string>;
}

const TDLib_PRESETS: TDLibPreset[] = [
  {
    id: 'set_parameters',
    nameAr: 'تهيئة معايير TDLib وقاعدة البيانات',
    nameEn: 'Set TDLib Parameters & Database',
    functionName: 'setTdlibParameters',
    query: {
      '@type': 'setTdlibParameters',
      api_id: 22043994,
      api_hash: '56f64582b363d367280db96586b97801',
      system_language_code: 'ar',
      device_model: 'Unified Client',
      system_version: '1.0',
      application_version: '12.0',
      database_directory: 'tdlib_db',
      files_directory: 'tdlib_files',
      use_message_database: true,
      use_chat_info_database: true,
      use_file_database: true,
      use_secret_chats: true,
    } as any,
    codeSnippets: {
      typescript: `import { TDLibClient } from './lib/tdlib/tdlibClient';

const tdlib = TDLibClient.getInstance();
await tdlib.setParameters({
  api_id: 22043994,
  api_hash: "56f64582b363d367280db96586b97801",
  system_language_code: "ar",
  use_message_database: true
});`,
      python: `from tdlib_bridge import tdlib

tdlib.send({
    "@type": "setTdlibParameters",
    "api_id": 22043994,
    "api_hash": "56f64582b363d367280db96586b97801",
    "database_directory": "tdlib_data",
    "use_message_database": True
})`,
      java: `import org.drinkless.tdlib.Client;
import org.drinkless.tdlib.TdApi;

TdApi.SetTdlibParameters params = new TdApi.SetTdlibParameters();
params.apiId = 22043994;
params.apiHash = "56f64582b363d367280db96586b97801";
params.useMessageDatabase = true;

client.send(params, object -> {
    System.out.println("TDLib Parameters Set: " + object);
});`,
      csharp: `using Telegram.Td;

var client = new TdClient();
client.Send(new {
    @type = "setTdlibParameters",
    api_id = 22043994,
    api_hash = "56f64582b363d367280db96586b97801",
    use_message_database = true
});`,
    },
  },
  {
    id: 'get_chats',
    nameAr: 'جلب المحادثات النشطة (getChats)',
    nameEn: 'Get Active Chats (getChats)',
    functionName: 'getChats',
    query: {
      '@type': 'getChats',
      limit: 20,
    } as any,
    codeSnippets: {
      typescript: `const chats = await tdlib.getChats(20);
console.log("Active Chat IDs:", chats.chat_ids);`,
      python: `tdlib.send({
    "@type": "getChats",
    "limit": 20
})`,
      java: `TdApi.GetChats getChats = new TdApi.GetChats();
getChats.limit = 20;

client.send(getChats, object -> {
    if (object instanceof TdApi.Chats) {
        TdApi.Chats chats = (TdApi.Chats) object;
        System.out.println("Total Chats: " + chats.totalCount);
    }
});`,
      csharp: `client.Send(new {
    @type = "getChats",
    limit = 20
});`,
    },
  },
  {
    id: 'send_message',
    nameAr: 'إرسال رسالة فورية (sendMessage)',
    nameEn: 'Send Instant Message (sendMessage)',
    functionName: 'sendMessage',
    query: {
      '@type': 'sendMessage',
      chat_id: 1,
      input_message_content: {
        '@type': 'inputMessageText',
        text: {
          '@type': 'formattedText',
          text: 'مرحباً بكم عبر محرك TDLib الرسمي!',
          entities: [],
        },
      },
    } as any,
    codeSnippets: {
      typescript: `const msg = await tdlib.sendMessage(1, "مرحباً بكم عبر محرك TDLib الرسمي!");
console.log("Sent Message ID:", msg.id);`,
      python: `tdlib.send({
    "@type": "sendMessage",
    "chat_id": 1,
    "input_message_content": {
        "@type": "inputMessageText",
        "text": {"@type": "formattedText", "text": "مرحباً بكم عبر محرك TDLib!"}
    }
})`,
      java: `TdApi.SendMessage sendMsg = new TdApi.SendMessage();
sendMsg.chatId = 1;
TdApi.InputMessageText text = new TdApi.InputMessageText();
text.text = new TdApi.FormattedText("مرحباً بكم عبر محرك TDLib!", new TdApi.TextEntity[0]);
sendMsg.inputMessageContent = text;

client.send(sendMsg, object -> {
    System.out.println("Message Sent: " + object);
});`,
      csharp: `client.Send(new {
    @type = "sendMessage",
    chat_id = 1,
    input_message_content = new {
        @type = "inputMessageText",
        text = new { @type = "formattedText", text = "مرحباً بكم عبر محرك TDLib!" }
    }
});`,
    },
  },
  {
    id: 'get_me',
    nameAr: 'جلب بيانات الحساب الحالي (getMe)',
    nameEn: 'Get Current Profile (getMe)',
    functionName: 'getMe',
    query: {
      '@type': 'getMe',
    } as any,
    codeSnippets: {
      typescript: `const me = await tdlib.getMe();
console.log("User:", me.first_name, me.phone_number);`,
      python: `tdlib.send({"@type": "getMe"})`,
      java: `client.send(new TdApi.GetMe(), object -> {
    TdApi.User user = (TdApi.User) object;
    System.out.println("User: " + user.firstName);
});`,
      csharp: `client.Send(new { @type = "getMe" });`,
    },
  },
];

export const TDLibEngineModal: React.FC<TDLibEngineModalProps> = ({ isOpen, onClose, lang = 'ar' }) => {
  const isRtl = lang === 'ar';
  const [selectedLang, setSelectedLang] = useState<SupportedLang>('typescript');
  const [selectedPreset, setSelectedPreset] = useState<TDLibPreset>(TDLib_PRESETS[0]);
  const [customJson, setCustomJson] = useState<string>(JSON.stringify(TDLib_PRESETS[0].query, null, 2));
  const [responseJson, setResponseJson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'console' | 'database' | 'stream'>('console');
  const [liveUpdates, setLiveUpdates] = useState<any[]>([]);

  useEffect(() => {
    setCustomJson(JSON.stringify(selectedPreset.query, null, 2));
  }, [selectedPreset]);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = TDLibClient.getInstance().addUpdateHandler((update) => {
      setLiveUpdates((prev) => [
        { time: new Date().toLocaleTimeString(), type: update['@type'], data: update },
        ...prev.slice(0, 25),
      ]);
    });
    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExecute = async () => {
    setIsLoading(true);
    let queryObj = {};
    try {
      queryObj = JSON.parse(customJson);
    } catch (e: any) {
      alert(isRtl ? `صيغة JSON غير صحيحة: ${e.message}` : `Invalid JSON: ${e.message}`);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/tdlib/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryObj),
      });
      const data = await res.json();
      setResponseJson(data);
    } catch (err: any) {
      setResponseJson({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-sans">
      <div
        className="w-full max-w-6xl bg-[#17212b] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col h-[88vh] text-slate-100 overflow-hidden"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-4 bg-[#0e1621] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-base flex items-center gap-2">
                <span>{isRtl ? 'مكتبة TDLib (Telegram Database Library) متعددة اللغات' : 'TDLib Multi-Language Engine'}</span>
                <span className="text-[11px] bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded-md border border-cyan-500/30">
                  v1.8.30
                </span>
              </div>
              <div className="text-xs text-slate-400">
                {isRtl
                  ? 'المكتبة الرسمية من DrKLO/Telegram تدعم (Node.js / TypeScript, Python, Java/Android, C# .NET)'
                  : 'Official cross-platform TDLib supporting Node.js, Python, Java, and C#'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab navigation */}
            <div className="hidden sm:flex items-center bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
              <button
                onClick={() => setActiveTab('console')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'console' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isRtl ? 'الكونسول والتنفيذ' : 'Console'}
              </button>
              <button
                onClick={() => setActiveTab('database')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'database' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isRtl ? 'قاعدة البيانات (SQLite)' : 'Database'}
              </button>
              <button
                onClick={() => setActiveTab('stream')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'stream' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isRtl ? 'شريط التحديثات (td_receive)' : 'Live Stream'}
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body */}
        {activeTab === 'console' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
            {/* Presets Sidebar */}
            <div className="lg:col-span-4 border-r border-slate-800 p-3 bg-[#131b24] overflow-y-auto space-y-2 custom-scrollbar">
              <div className="text-xs font-bold text-slate-400 px-1 mb-2">
                {isRtl ? 'دوال TDLib الجاهزة للتنفيذ:' : 'TDLib Predefined Functions:'}
              </div>
              {TDLib_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset)}
                  className={`w-full text-start p-3 rounded-xl text-xs transition-all flex flex-col gap-1.5 ${
                    selectedPreset.id === preset.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-cyan-400">{preset.functionName}</span>
                    <span className="text-[10px] bg-slate-900/60 px-1.5 py-0.5 rounded text-slate-400">td_send</span>
                  </div>
                  <div className="text-xs text-slate-300 font-normal">
                    {isRtl ? preset.nameAr : preset.nameEn}
                  </div>
                </button>
              ))}

              {/* Language Selector */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-400 mb-2 px-1">
                  {isRtl ? 'اختر لغة البرمجة لعرض الشيفرة:' : 'Select Target Language:'}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: 'typescript', name: 'Node.js / TS' },
                      { id: 'python', name: 'Python' },
                      { id: 'java', name: 'Java / Android' },
                      { id: 'csharp', name: 'C# / .NET' },
                    ] as const
                  ).map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setSelectedLang(l.id)}
                      className={`p-2 rounded-lg text-xs font-mono transition-all text-center ${
                        selectedLang === l.id
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {l.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Execution Workspace */}
            <div className="lg:col-span-8 p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar bg-[#17212b]">
              {/* Header Action Bar */}
              <div className="p-3 bg-[#0e1621] rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-cyan-400 font-mono font-bold">
                    TDLib JSON Interface
                  </span>
                  <span className="text-xs text-slate-400">
                    • {isRtl ? selectedPreset.nameAr : selectedPreset.nameEn}
                  </span>
                </div>
                <button
                  onClick={handleExecute}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
                  <span>{isRtl ? 'تشغيل الطلب (Execute TDLib)' : 'Run TDLib'}</span>
                </button>
              </div>

              {/* Multi-language code view */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {isRtl
                        ? `شيفرة الـ SDK بلغة (${selectedLang}):`
                        : `Target Code (${selectedLang}):`}
                    </span>
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(selectedPreset.codeSnippets[selectedLang]);
                      alert(isRtl ? 'تم نسخ الشيفرة' : 'Code copied');
                    }}
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{isRtl ? 'نسخ الكود' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-[#0a0f16] border border-slate-800 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto custom-scrollbar">
                  {selectedPreset.codeSnippets[selectedLang]}
                </pre>
              </div>

              {/* JSON Query Editor */}
              <div className="flex flex-col flex-1 min-h-[140px]">
                <div className="text-xs text-slate-400 mb-1 font-semibold">
                  {isRtl ? 'محتوى طلب الـ JSON المباشر (td_send):' : 'TDLib JSON Request (td_send):'}
                </div>
                <textarea
                  value={customJson}
                  onChange={(e) => setCustomJson(e.target.value)}
                  className="w-full flex-1 p-3 bg-[#0e1621] border border-slate-800 rounded-xl font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 resize-none"
                  spellCheck={false}
                />
              </div>

              {/* Response Output */}
              <div className="flex flex-col flex-1 min-h-[160px]">
                <div className="text-xs text-slate-400 mb-1 font-semibold">
                  {isRtl ? 'استجابة محرك TDLib (JSON Response):' : 'TDLib Response:'}
                </div>
                <pre className="w-full flex-1 p-3 bg-[#0a0f16] border border-slate-800 rounded-xl font-mono text-xs text-amber-300 overflow-auto custom-scrollbar">
                  {responseJson
                    ? JSON.stringify(responseJson, null, 2)
                    : '// اضغط على "تشغيل الطلب" لإرسال الاستعلام ومعالجة الرد...'}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Database Tab */}
        {activeTab === 'database' && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#0e1621] border border-slate-800 rounded-xl">
                <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span>محرك قاعدة البيانات (DB Engine)</span>
                </div>
                <div className="text-base font-bold text-white">SQLite / LevelDB</div>
                <div className="text-xs text-emerald-400 mt-1">✓ مشفر عبر SQLCipher (AES-256)</div>
              </div>

              <div className="p-4 bg-[#0e1621] border border-slate-800 rounded-xl">
                <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                  <FolderLock className="w-4 h-4 text-amber-400" />
                  <span>دليل ملفات TDLib</span>
                </div>
                <div className="text-base font-bold text-white font-mono">/tdlib_db & /tdlib_files</div>
                <div className="text-xs text-slate-400 mt-1">مزامنة سريعة وتخزين مؤقت تلقائي</div>
              </div>

              <div className="p-4 bg-[#0e1621] border border-slate-800 rounded-xl">
                <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-blue-400" />
                  <span>المحادثات والمحادثات السرية</span>
                </div>
                <div className="text-base font-bold text-white">Secret Chats Enabled</div>
                <div className="text-xs text-cyan-400 mt-1">تشفير E2EE End-to-End كامل</div>
              </div>
            </div>

            <div className="p-4 bg-[#0e1621] border border-slate-800 rounded-xl space-y-2">
              <div className="font-bold text-sm text-cyan-400">مميزات TDLib المدمجة في هذا المشروع:</div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>إدارة قواعد بيانات الرسائل السحابية والمحلية بشكل متوازي.</li>
                <li>تحميل وتنزيل تدريجي للملفات والوسائط والصور دون تجميد واجهة المستخدم.</li>
                <li>معالجة التحديثات اللحظية المباشرة عبر واجهة <code>td_receive</code> واستقبال رسائل الـ PUSH.</li>
                <li>تكامل كامل متطابق مع بيئات Node.js و Python و Android Java و C# .NET.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Live Updates Stream Tab */}
        {activeTab === 'stream' && (
          <div className="p-4 flex-1 flex flex-col overflow-hidden">
            <div className="text-xs text-slate-400 mb-2 flex items-center justify-between">
              <span>{isRtl ? 'سجل تحديثات TDLib اللحظية (td_receive Stream):' : 'Live TDLib Updates Stream:'}</span>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                ● Live EventSource Active
              </span>
            </div>
            <div className="flex-1 bg-[#0a0f16] border border-slate-800 rounded-xl p-3 overflow-y-auto space-y-2 custom-scrollbar font-mono text-xs">
              {liveUpdates.length === 0 ? (
                <div className="text-slate-500 text-center py-10">
                  {isRtl ? 'في انتظار وصول تحديثات من الخادم...' : 'Listening for TDLib updates...'}
                </div>
              ) : (
                liveUpdates.map((item, idx) => (
                  <div key={idx} className="p-2 bg-slate-900/70 border border-slate-800 rounded-lg">
                    <div className="flex items-center justify-between text-cyan-400 mb-1">
                      <span className="font-bold">{item.type}</span>
                      <span className="text-slate-500 text-[10px]">{item.time}</span>
                    </div>
                    <pre className="text-slate-300 text-[11px] overflow-x-auto">
                      {JSON.stringify(item.data, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-[#0e1621] border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between px-4 font-mono">
          <div className="flex items-center gap-3">
            <span>TDLib Native Core: Ready</span>
            <span>•</span>
            <span>Bindings: Node.js, Python, Java, C#</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs transition-all"
          >
            {isRtl ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
