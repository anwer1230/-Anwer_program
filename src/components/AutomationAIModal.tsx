import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Rocket,
  Mail,
  Zap,
  Bookmark,
  Bot,
  Repeat,
  Brain,
  BarChart3,
  FileText,
  Search,
  Maximize2,
  Minimize2,
  RefreshCw,
  Sparkles,
  Radio,
  ChevronDown,
  LayoutGrid,
} from 'lucide-react';
import { AutoMonitoringTab } from './tabs/AutoMonitoringTab';
import { AutoSendTab } from './tabs/AutoSendTab';
import { BatchesTab } from './tabs/BatchesTab';
import { SendMonitorTab } from './tabs/SendMonitorTab';
import { LinkScraperTab } from './tabs/LinkScraperTab';
import { AutoJoinTab } from './tabs/AutoJoinTab';
import { SavedLinksTab } from './tabs/SavedLinksTab';
import { AutoReplyTab } from './tabs/AutoReplyTab';
import { RotatingTab } from './tabs/RotatingTab';
import { LearningTab } from './tabs/LearningTab';
import { AcademicTab } from './tabs/AcademicTab';
import { DocFormatterTab } from './tabs/DocFormatterTab';
import { LiveLogs } from './LiveLogs';
import {
  WhatsAppSettings,
  SentBatch,
  SavedLink,
  AutoReplyRule,
  AutoJoinProgressEvent,
  AcademicAnalysisResult,
  ActivityLog,
} from '../types';

export type AutomationTab =
  | 'auto_monitor'
  | 'auto_send'
  | 'send_monitor'
  | 'batches'
  | 'link_scraper'
  | 'autojoin'
  | 'links'
  | 'autoreply'
  | 'rotating'
  | 'learning'
  | 'academic'
  | 'formatter';

interface AutomationAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AutomationTab;
}

export const TOOL_DEFINITIONS: Record<
  AutomationTab,
  { title: string; subtitle: string; icon: React.ReactNode; color: string; badge?: string }
> = {
  auto_monitor: {
    title: 'المراقبة التلقائية الذكية',
    subtitle: 'رصد الكلمات المفتاحية بالرسائل الواردة فورياً وتنبيهك تلقائياً',
    icon: <Radio className="w-5 h-5" />,
    color: '#ffb300',
    badge: '📡 رادار',
  },
  auto_send: {
    title: 'الإرسال والجدولة التلقائية',
    subtitle: 'نشر الرسائل والصور للمجموعات والقنوات مع حماية ضد الحظر',
    icon: <Rocket className="w-5 h-5" />,
    color: '#29b6f6',
    badge: '🚀 جدولة',
  },
  send_monitor: {
    title: 'الإرسال والمراقبة الشاملة',
    subtitle: 'مركز الإرسال والمراقبة المدمج',
    icon: <Send className="w-5 h-5" />,
    color: '#ffb300',
  },
  batches: {
    title: 'رسائلي والدفعات المرسلة',
    subtitle: 'سجل الدفعات مع التعديل الجماعي والحذف الفوري من الخادم',
    icon: <Mail className="w-5 h-5" />,
    color: '#00e5ff',
    badge: '📬 سجل',
  },
  link_scraper: {
    title: 'فحص واستخراج وفرز الروابط',
    subtitle: 'استخراج روابط المجموعات وتصديرها بصيغة CSV أو إرسالها للانضمام',
    icon: <Search className="w-5 h-5" />,
    color: '#00e5ff',
    badge: '🔍 جديد',
  },
  autojoin: {
    title: 'الانضمام التلقائي للمجموعات',
    subtitle: 'معالجة متسلسلة لقوائم الروابط مع التحكم اللحظي وحساب فترات الانتظار',
    icon: <Zap className="w-5 h-5" />,
    color: '#00e676',
    badge: '⚡ تلقائي',
  },
  links: {
    title: 'الروابط المحفوظة والمصنفة',
    subtitle: 'إدارة وتصنيف الروابط وإضافتها بدفعات سريعة مع فحص التكرار',
    icon: <Bookmark className="w-5 h-5" />,
    color: '#ab47bc',
    badge: '🔖 مكتبة',
  },
  autoreply: {
    title: 'الردود التلقائية الذكية',
    subtitle: 'قواعد الرد الآلي المخصصة للكلمات المفتاحية في المحادثات',
    icon: <Bot className="w-5 h-5" />,
    color: '#ff5252',
    badge: '🤖 رد آلي',
  },
  rotating: {
    title: 'النشر والإرسال المتسلسل الدوار',
    subtitle: 'نشر رسائل تسويقية متناوبة دورياً للمجموعات بجدول زمني ذكي',
    icon: <Repeat className="w-5 h-5" />,
    color: '#7c4dff',
    badge: '🔄 دوار',
  },
  learning: {
    title: 'التعلم الذكي والمساعد الأكاديمي',
    subtitle: 'الرد الذكي التلقائي وتدريب المساعد على الخدمات والأسعار',
    icon: <Brain className="w-5 h-5" />,
    color: '#ffd54f',
    badge: '🧠 AI',
  },
  academic: {
    title: 'التحليل الأكاديمي الشامل',
    subtitle: 'فحص نسب الاقتباس والسرقة الأدبية وتوليد الكلمات المفتاحية',
    icon: <BarChart3 className="w-5 h-5" />,
    color: '#26a69a',
    badge: '🎓 أكاديمي',
  },
  formatter: {
    title: 'منسق ومعالج المستندات',
    subtitle: 'إعادة صياغة النصوص والترجمة وتصدير المستندات الأكاديمية المنظمة',
    icon: <FileText className="w-5 h-5" />,
    color: '#ec407a',
    badge: '📄 مستندات',
  },
};

export const AutomationAIModal: React.FC<AutomationAIModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'auto_send',
}) => {
  const [activeTab, setActiveTab] = useState<AutomationTab>(initialTab);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToolSwitcher, setShowToolSwitcher] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [settings, setSettings] = useState<WhatsAppSettings>({
    message: '',
    groups: [],
    watch_words: [],
    interval_seconds: 3600,
    send_type: 'manual',
    schedule_duration_hours: 0,
    sanitize_mode: 'salam',
    smart_required_messages: 5,
  });
  const [sentBatches, setSentBatches] = useState<SentBatch[]>([]);
  const [savedLinks, setSavedLinks] = useState<SavedLink[]>([]);
  const [linkCategories] = useState<string[]>(['عام', 'تقنية', 'أكاديمي', 'تسويق', 'وظائف']);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  const [autoReplyRules, setAutoReplyRules] = useState<AutoReplyRule[]>([]);
  const [rotatingStatus, setRotatingStatus] = useState({
    active: false,
    current_index: 0,
    total_messages: 0,
    interval_minutes: 15,
    last_run: 'لم يتم البدء بعد',
    next_run: 'متوقف',
    target_groups_count: 0,
    messages_preview: [],
  });
  const [learningData, setLearningData] = useState<{
    active_private: boolean;
    active_group: boolean;
    services: Record<string, any>;
  }>({
    active_private: true,
    active_group: true,
    services: {},
  });
  const [autoJoinProgress, setAutoJoinProgress] = useState<AutoJoinProgressEvent | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      fetchAllData();
    }
  }, [isOpen, initialTab]);

  const addLog = (msg: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      message: msg,
      timestamp: new Date().toLocaleTimeString('ar-SA'),
      type,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 100)]);
  };

  const fetchAllData = async () => {
    try {
      // 1. Settings
      const resSettings = await fetch('/api/settings').then((r) => r.json()).catch(() => null);
      if (resSettings) {
        if (resSettings.settings) setSettings(resSettings.settings);
        if (resSettings.monitoring_active !== undefined) setIsMonitoring(resSettings.monitoring_active);
      }

      // 2. Sent Batches
      const resBatches = await fetch('/api/sent_batches').then((r) => r.json()).catch(() => null);
      if (resBatches && resBatches.batches) setSentBatches(resBatches.batches);

      // 3. Saved Links
      const resLinks = await fetch('/api/saved_links').then((r) => r.json()).catch(() => null);
      if (resLinks && resLinks.links) setSavedLinks(resLinks.links);

      // 4. Auto Reply
      const resReply = await fetch('/api/get_auto_replies').then((r) => r.json()).catch(() => null);
      if (resReply) {
        setAutoReplyEnabled(resReply.enabled ?? true);
        setAutoReplyRules(resReply.rules || resReply.auto_replies || []);
      }

      // 5. Rotating Status
      const resRot = await fetch('/api/rotating/status').then((r) => r.json()).catch(() => null);
      if (resRot && resRot.status) setRotatingStatus(resRot.status);

      // 6. Learning
      const resLearn = await fetch('/api/learning/status').then((r) => r.json()).catch(() => null);
      if (resLearn && resLearn.data) setLearningData(resLearn.data);
    } catch (e) {
      console.error('Failed to load automation data:', e);
    }
  };

  if (!isOpen) return null;

  const currentTool = TOOL_DEFINITIONS[activeTab] || TOOL_DEFINITIONS.auto_send;

  // Handlers
  const handleEditBatch = async (batchId: string, newText: string) => {
    try {
      const res = await fetch('/api/edit_batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_id: batchId, new_text: newText }),
      }).then((r) => r.json());
      if (res && res.success) {
        addLog('تم تعديل الدفعة بنجاح', 'success');
        fetchAllData();
      }
    } catch (e) {
      addLog('فشل تعديل الدفعة', 'error');
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    try {
      const res = await fetch('/api/delete_batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_id: batchId }),
      }).then((r) => r.json());
      if (res && res.success) {
        addLog('تم حذف الدفعة واستردادها من الخادم', 'info');
        fetchAllData();
      }
    } catch (e) {
      addLog('فشل حذف الدفعة', 'error');
    }
  };

  const handleStartAutoJoin = async (data: {
    links: string;
    delay: number;
    max_retries: number;
    fetch_external?: boolean;
    search_by_name?: boolean;
  }) => {
    try {
      addLog('⚡ بدء مهمة الانضمام التلقائي للقنوات والمجموعات...', 'info');
      const res = await fetch('/api/auto_join/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json());
      if (res && res.success) {
        addLog('تم تشغيل محرك الانضمام التلقائي بنجاح', 'success');
      } else {
        addLog(`خطأ في الانضمام: ${res?.error || 'فشلت العملية'}`, 'error');
      }
    } catch (e) {
      addLog('فشل الاتصال بالخادم لبدء الانضمام', 'error');
    }
  };

  const handleStopAutoJoin = async () => {
    try {
      await fetch('/api/auto_join/stop', { method: 'POST' });
      addLog('⏹️ تم إيقاف عملية الانضمام التلقائي', 'warning');
    } catch (e) {}
  };

  const handlePauseAutoJoin = async () => {
    try {
      await fetch('/api/auto_join/pause', { method: 'POST' });
      addLog('⏸️ تم تعليق/استئناف الانضمام التلقائي مؤقتاً', 'info');
    } catch (e) {}
  };

  const handleAddLink = async (link: { url: string; title: string; category?: string; notes?: string; source?: string }) => {
    try {
      const payload: Omit<SavedLink, 'id' | 'date_saved'> = {
        url: link.url,
        title: link.title,
        category: link.category || 'عام',
        source: link.source || 'أداة الاستخراج',
        notes: link.notes || '',
      };
      const res = await fetch('/api/saved_links/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then((r) => r.json());
      if (res && res.success) {
        addLog(`تم حفظ الرابط في الأرشيف: ${link.title}`, 'success');
        fetchAllData();
      }
    } catch (e) {
      addLog('فشل حفظ الرابط', 'error');
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      const res = await fetch('/api/saved_links/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      }).then((r) => r.json());
      if (res && res.success) {
        addLog('تم حذف الرابط بنجاح', 'info');
        fetchAllData();
      }
    } catch (e) {
      addLog('فشل حذف الرابط', 'error');
    }
  };

  const handleSendToAutoJoin = (urls: string[]) => {
    setActiveTab('autojoin');
    handleStartAutoJoin({
      links: urls.join('\n'),
      delay: 3,
      max_retries: 3,
    });
  };

  const handleToggleAutoReply = async (enabled: boolean) => {
    try {
      const res = await fetch('/api/toggle_auto_reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      }).then((r) => r.json());
      if (res && res.success) {
        setAutoReplyEnabled(enabled);
        addLog(enabled ? '⚡ تم تفعيل الرد التلقائي' : '🔴 تم إيقاف الرد التلقائي', 'info');
      }
    } catch (e) {
      addLog('فشل تغيير حالة الرد التلقائي', 'error');
    }
  };

  const handleAddAutoReplyRule = async (rule: Omit<AutoReplyRule, 'used_count' | 'last_used'>) => {
    try {
      const res = await fetch('/api/add_auto_reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      }).then((r) => r.json());
      if (res && res.success) {
        addLog(`تمت إضافة قاعدة رد لكلمة: ${rule.keyword}`, 'success');
        fetchAllData();
      }
    } catch (e) {
      addLog('فشل إضافة قاعدة الرد', 'error');
    }
  };

  const handleDeleteAutoReplyRule = async (index: number) => {
    try {
      const res = await fetch('/api/delete_auto_reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index }),
      }).then((r) => r.json());
      if (res && res.success) {
        addLog('تم حذف قاعدة الرد', 'info');
        fetchAllData();
      }
    } catch (e) {
      addLog('فشل حذف القاعدة', 'error');
    }
  };

  const handleSaveRotating = async (data: { messages: string[]; groups: string[]; interval_minutes: number }) => {
    try {
      const res = await fetch('/api/rotating/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json());
      if (res && res.success) {
        addLog('تم حفظ إعدادات الإرسال المتسلسل الدوار 🔄', 'success');
        fetchAllData();
      }
    } catch (e) {
      addLog('فشل حفظ إعدادات الإرسال المتسلسل', 'error');
    }
  };

  const handleStartRotating = async () => {
    try {
      const res = await fetch('/api/rotating/start', { method: 'POST' }).then((r) => r.json());
      if (res && res.success) {
        addLog('🚀 تم تشغيل النشر والإرسال المتسلسل الدوار بنجاح!', 'success');
        fetchAllData();
      }
    } catch (e) {
      addLog('فشل تشغيل الإرسال المتسلسل', 'error');
    }
  };

  const handleStopRotating = async () => {
    try {
      const res = await fetch('/api/rotating/stop', { method: 'POST' }).then((r) => r.json());
      if (res && res.success) {
        addLog('⏹️ تم إيقاف الإرسال المتسلسل الدوار', 'warning');
        fetchAllData();
      }
    } catch (e) {
      addLog('فشل إيقاف الإرسال المتسلسل', 'error');
    }
  };

  const handleToggleLearningActive = async (type: 'private' | 'group', active: boolean) => {
    try {
      const payload = type === 'private' ? { active_private: active } : { active_group: active };
      const res = await fetch('/api/learning/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then((r) => r.json());
      if (res && res.success && res.data) {
        setLearningData(res.data);
        addLog(`تم تحديث حالة التعلم الذكي (${type === 'private' ? 'الخاص' : 'المجموعات'})`, 'info');
      }
    } catch (e) {
      addLog('فشل تحديث التعلم الذكي', 'error');
    }
  };

  const handleGenerateAiResponse = async (text: string, senderName?: string): Promise<string> => {
    try {
      const res = await fetch('/api/learning/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sender_name: senderName }),
      }).then((r) => r.json());
      return res.reply || 'مرحباً بك! يسعدنا تقديم الاستشارات والخدمات الأكاديمية المتكاملة.';
    } catch (e) {
      return 'أهلاً بك، تم استلام طلبك وسيقوم فريق العمل بالتواصل معك فوراً.';
    }
  };

  const handleAnalyzeAcademic = async (data: any): Promise<AcademicAnalysisResult> => {
    addLog('جاري فحص وتدقيق النص أكاديمياً وتحليل الاقتباس...', 'info');
    try {
      const res = await fetch('/api/academic/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json());
      addLog('✅ تم إكمال الفحص والتحليل الأكاديمي بنجاح', 'success');
      return res.result;
    } catch (e) {
      addLog('فشل التحليل الأكاديمي', 'error');
      throw e;
    }
  };

  const handleExportDoc = async (data: any) => {
    try {
      addLog('جاري تجهيز وتصدير المستند المنسق بصيغة Word/PDF...', 'info');
      const res = await fetch('/api/doc_formatter/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.blob());

      const url = window.URL.createObjectURL(res);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Enjaz_Formatted_${Date.now()}.${data.format || 'docx'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      addLog('✅ تم تحميل المستند المنسق بنجاح', 'success');
    } catch (e) {
      addLog('فشل تصدير المستند', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl max-h-[92vh] h-[90vh]'
        }`}
        dir="rtl"
      >
        {/* Single Focused Clean Top Bar Header (NO crowded tab row) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-zinc-900 border-b border-zinc-800 shrink-0 relative">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-inner border"
              style={{
                backgroundColor: `${currentTool.color}15`,
                borderColor: `${currentTool.color}35`,
                color: currentTool.color,
              }}
            >
              {currentTool.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-zinc-100 tracking-tight">
                  {currentTool.title}
                </span>
                {currentTool.badge && (
                  <span
                    className="px-2 py-0.5 text-[10px] rounded-md font-black border"
                    style={{
                      backgroundColor: `${currentTool.color}15`,
                      borderColor: `${currentTool.color}30`,
                      color: currentTool.color,
                    }}
                  >
                    {currentTool.badge}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">{currentTool.subtitle}</p>
            </div>
          </div>

          {/* Header Controls & Quick Switcher Dropdown */}
          <div className="flex items-center gap-2">
            {/* Quick Switch Tool Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setShowToolSwitcher(!showToolSwitcher)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold border border-zinc-700/80 transition-all shadow-sm"
                title="تبديل الواجهة"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">تبديل الأداة</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {/* Tool Switcher Popover */}
              {showToolSwitcher && (
                <div className="absolute left-0 mt-2 w-72 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl z-50 p-2 space-y-1 animate-fadeIn">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold text-zinc-400 border-b border-zinc-800">
                    اختر الأداة المطلوبة للانتقال المباشر:
                  </div>
                  <div className="max-h-80 overflow-y-auto space-y-0.5 scrollbar-thin">
                    {(Object.keys(TOOL_DEFINITIONS) as AutomationTab[])
                      .filter((k) => k !== 'send_monitor')
                      .map((key) => {
                        const def = TOOL_DEFINITIONS[key];
                        const isCur = activeTab === key;
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              setActiveTab(key);
                              setShowToolSwitcher(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-right transition-all ${
                              isCur
                                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 border border-transparent'
                            }`}
                          >
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                              style={{
                                backgroundColor: `${def.color}15`,
                                borderColor: `${def.color}30`,
                                color: def.color,
                              }}
                            >
                              {def.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="truncate text-zinc-200">{def.title}</div>
                              <div className="text-[10px] text-zinc-500 truncate">{def.subtitle}</div>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={fetchAllData}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors hidden sm:block"
              title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Content Body (Clean & Dedicated per functional view) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-zinc-950/70">
          {activeTab === 'auto_monitor' && <AutoMonitoringTab onBack={() => setActiveTab('auto_send')} />}

          {activeTab === 'auto_send' && <AutoSendTab onBack={() => setActiveTab('auto_monitor')} />}

          {activeTab === 'send_monitor' && (
            <SendMonitorTab
              onBack={() => setActiveTab('batches')}
              initialMessage={settings.message}
              initialGroups={settings.groups}
              initialWatchWords={settings.watch_words}
            />
          )}

          {activeTab === 'batches' && (
            <BatchesTab
              batches={sentBatches}
              onEditBatch={handleEditBatch}
              onDeleteBatch={handleDeleteBatch}
              onRefresh={fetchAllData}
            />
          )}

          {activeTab === 'link_scraper' && (
            <LinkScraperTab
              onSendToAutoJoin={(urls) => {
                setActiveTab('autojoin');
                handleStartAutoJoin({
                  links: urls.join('\n'),
                  delay: 3,
                  max_retries: 3,
                });
              }}
              onSaveToSavedLinks={(link) => {
                handleAddLink({
                  url: link.url,
                  title: link.title,
                  category: link.category || 'عام',
                  notes: `تم استخراجه من محادثات تليجرام (${link.source || ''})`,
                });
              }}
              onNavigateTab={(tab) => setActiveTab(tab as AutomationTab)}
            />
          )}

          {activeTab === 'autojoin' && (
            <AutoJoinTab
              onStartAutoJoin={handleStartAutoJoin}
              onStopAutoJoin={handleStopAutoJoin}
              onPauseAutoJoin={handlePauseAutoJoin}
              progressEvent={autoJoinProgress}
            />
          )}

          {activeTab === 'links' && (
            <SavedLinksTab
              links={savedLinks}
              categories={linkCategories}
              onAddLink={handleAddLink}
              onDeleteLink={handleDeleteLink}
              onSendToAutoJoin={handleSendToAutoJoin}
            />
          )}

          {activeTab === 'autoreply' && (
            <AutoReplyTab
              enabled={autoReplyEnabled}
              rules={autoReplyRules}
              onToggleEnabled={handleToggleAutoReply}
              onAddRule={handleAddAutoReplyRule}
              onDeleteRule={handleDeleteAutoReplyRule}
            />
          )}

          {activeTab === 'rotating' && (
            <RotatingTab
              status={rotatingStatus}
              onSave={handleSaveRotating}
              onStart={handleStartRotating}
              onStop={handleStopRotating}
            />
          )}

          {activeTab === 'learning' && (
            <LearningTab
              activePrivate={learningData.active_private}
              activeGroup={learningData.active_group}
              services={learningData.services || {}}
              onToggleActive={handleToggleLearningActive}
              onGenerateAiResponse={handleGenerateAiResponse}
            />
          )}

          {activeTab === 'academic' && <AcademicTab onAnalyze={handleAnalyzeAcademic} />}

          {activeTab === 'formatter' && <DocFormatterTab onExportDoc={handleExportDoc} />}

          {/* Live Activity Terminal */}
          <LiveLogs logs={logs} onClearLogs={() => setLogs([])} />
        </div>
      </div>
    </div>
  );
};
