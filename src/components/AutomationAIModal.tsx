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
  HeartPulse,
  Monitor,
  LayoutGrid,
  Shield,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileCode,
  CheckCircle2,
  Radio
} from 'lucide-react';
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
import { PresentationTab } from './tabs/PresentationTab';
import { SystemHealthTab } from './tabs/SystemHealthTab';
import { LiveLogs } from './LiveLogs';
import './automation-github-skin.css';
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
  | 'overview'
  | 'send_monitor'
  | 'batches'
  | 'link_scraper'
  | 'autojoin'
  | 'links'
  | 'autoreply'
  | 'rotating'
  | 'learning'
  | 'academic'
  | 'formatter'
  | 'presentation'
  | 'system_health'
  | 'logs';

interface AutomationAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AutomationTab;
}

export const AutomationAIModal: React.FC<AutomationAIModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'overview',
}) => {
  const [activeTab, setActiveTab] = useState<AutomationTab>(initialTab);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
  const [stats, setStats] = useState({
    sent: 0,
    failed: 0,
    errors: 0,
    discovered_groups: 0,
    active_monitors: 0,
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
      // 1. Settings & Stats
      const resSettings = await fetch('/api/settings').then((r) => r.json()).catch(() => null);
      if (resSettings) {
        if (resSettings.settings) setSettings(resSettings.settings);
        if (resSettings.stats) setStats(resSettings.stats);
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

  useEffect(() => {
    if (isOpen) {
      fetchAllData();
      addLog('تم تشغيل لوحة الأتمتة المتقدمة وتحديث مؤشرات النظام', 'info');

      // Real-time synchronization stream for automation tasks
      let es: EventSource | null = null;
      try {
        es = new EventSource('/api/events');
        es.onmessage = (e) => {
          try {
            const parsed = JSON.parse(e.data);
            if (parsed.type === 'autojoin_progress') {
              setAutoJoinProgress(parsed.data);
              if (parsed.data.reason) {
                addLog(`الانضمام: ${parsed.data.reason}`, 'info');
              }
            } else if (parsed.type === 'autojoin_log') {
              if (parsed.data && parsed.data.message) {
                addLog(parsed.data.message, parsed.data.status === 'success' ? 'success' : 'warning');
              }
            } else if (parsed.type === 'automation_batch_created') {
              setSentBatches((prev) => [parsed.data, ...prev.filter((b) => b.id !== parsed.data.id)]);
              addLog(`📨 دفعة جديدة #${parsed.data.id.slice(-6)} تم إرسالها بنجاح`, 'success');
            } else if (parsed.type === 'sent_batches') {
              if (parsed.data && parsed.data.batches) {
                setSentBatches(parsed.data.batches);
              }
            }
          } catch (err) {
            // Ignore parse errors
          }
        };
      } catch (err) {
        // Fallback gracefully
      }

      return () => {
        if (es) {
          es.close();
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handlers
  const handleSaveSettings = async (newSettings: WhatsAppSettings) => {
    try {
      const res = await fetch('/api/save_settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      }).then((r) => r.json());
      if (res && res.success) {
        setSettings(newSettings);
        addLog('تم حفظ إعدادات المراقبة والإرسال بنجاح 💾', 'success');
      }
    } catch (e) {
      addLog('فشل حفظ الإعدادات', 'error');
    }
  };

  const handleSendNow = async (sendOptions?: any) => {
    try {
      addLog('جاري تنفيذ عملية الإرسال الفوري لجميع المجموعات المحددة...', 'info');
      const res = await fetch('/api/send_now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sendOptions || {}),
      }).then((r) => r.json());
      if (res && res.success) {
        addLog(`✅ اكتمل الإرسال بنجاح! تم إرسال ${res.sent_count || 1} رسالة.`, 'success');
        fetchAllData();
      } else {
        addLog(`خطأ في الإرسال: ${res?.error || 'فشلت العملية'}`, 'error');
      }
    } catch (e) {
      addLog('حدث خطأ في الاتصال بالخادم أثناء الإرسال', 'error');
    }
  };

  const handleStartMonitoring = async () => {
    try {
      const res = await fetch('/api/start_monitoring', { method: 'POST' }).then((r) => r.json());
      if (res && res.success) {
        setIsMonitoring(true);
        addLog('🚀 تم تفعيل محرك المراقبة والجدولة التلقائية بنجاح!', 'success');
      }
    } catch (e) {
      addLog('تعذر بدء المراقبة', 'error');
    }
  };

  const handleStopMonitoring = async () => {
    try {
      const res = await fetch('/api/stop_monitoring', { method: 'POST' }).then((r) => r.json());
      if (res && res.success) {
        setIsMonitoring(false);
        addLog('⏹️ تم إيقاف المراقبة التلقائية', 'warning');
      }
    } catch (e) {
      addLog('تعذر إيقاف المراقبة', 'error');
    }
  };

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
        addLog('تم حذف الدفعة من السجل', 'info');
        setSentBatches((prev) => prev.filter((b) => b.id !== batchId));
      }
    } catch (e) {
      addLog('فشل حذف الدفعة', 'error');
    }
  };

  const handleAddLink = async (link: { url: string; title: string; category: string; notes?: string }) => {
    try {
      const res = await fetch('/api/saved_links/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(link),
      }).then((r) => r.json());
      if (res && res.success) {
        addLog(`تمت إضافة الرابط: ${link.title}`, 'success');
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
        addLog('تم حذف الرابط', 'info');
        setSavedLinks((prev) => prev.filter((l) => l.id !== id));
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

  const handleStartAutoJoin = async (config: { links: string; delay: number; max_retries: number }) => {
    try {
      addLog(`بدء الانضمام التلقائي إلى الروابط المحددة...`, 'info');
      const res = await fetch('/api/autojoin/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      }).then((r) => r.json());
      if (res && res.success) {
        addLog(`🚀 جاري الانضمام إلى ${res.total || 'المجموعات'} بسرعة واستقرار!`, 'success');
      }
    } catch (e) {
      addLog('فشل بدء الانضمام التلقائي', 'error');
    }
  };

  const handleStopAutoJoin = async () => {
    try {
      await fetch('/api/autojoin/stop', { method: 'POST' });
      addLog('تم إيقاف الانضمام التلقائي', 'warning');
    } catch (e) {
      addLog('خطأ أثناء إيقاف الانضمام', 'error');
    }
  };

  const handlePauseAutoJoin = async () => {
    try {
      const res = await fetch('/api/autojoin/pause', { method: 'POST' }).then((r) => r.json());
      addLog(res.message || 'تم تبديل حالة الإيقاف المؤقت للانضمام', 'info');
    } catch (e) {
      addLog('خطأ أثناء الإيقاف المؤقت', 'error');
    }
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

  const handleSaveRotating = async (
    dataOrMessages: any,
    groupsArg?: string[],
    intervalArg?: number
  ) => {
    try {
      let payload: any = {};
      if (Array.isArray(dataOrMessages)) {
        payload = {
          messages: dataOrMessages,
          groups: groupsArg || [],
          interval_minutes: intervalArg || 15,
          interval: intervalArg || 15,
        };
      } else if (typeof dataOrMessages === 'object' && dataOrMessages !== null) {
        payload = dataOrMessages;
      }

      const res = await fetch('/api/rotating/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
      const res = await fetch('/api/learning/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sender_name: senderName }),
      }).then((r) => r.json());
      return res.reply || res.response || 'تم توليد الرد بنجاح';
    } catch (e) {
      return 'حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.';
    }
  };

  const handleAnalyzeAcademic = async (input: string): Promise<AcademicAnalysisResult> => {
    try {
      const res = await fetch('/api/academic/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: input }),
      }).then((r) => r.json());
      return res.result || { stats: { 'اكتمل': 1 }, summary: 'تم إجراء التحليل بنجاح' };
    } catch (e) {
      return {
        stats: { خطأ: 0 },
        summary: 'حدث خطأ في إجراء التحليل',
      };
    }
  };

  const handleExportDoc = async (format: 'docx' | 'xlsx' | 'pptx' | 'pdf', htmlContent: string) => {
    try {
      const res = await fetch('/api/doc/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, html_content: htmlContent }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document.${format === 'pdf' ? 'pdf' : format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      addLog(`تم تصدير المستند بصيغة ${format.toUpperCase()} بنجاح 📄`, 'success');
    } catch (e) {
      addLog('فشل تصدير المستند', 'error');
    }
  };

  // Nav Items definition for the tab bar
  const navTabs = [
    { id: 'overview' as const, label: 'لوحة الوظائف الرئيسية', icon: <LayoutGrid className="w-4 h-4 text-emerald-400" /> },
    { id: 'send_monitor' as const, label: 'الإرسال والمراقبة', icon: <Rocket className="w-4 h-4 text-amber-400" /> },
    { id: 'batches' as const, label: '📨 رسائلي', icon: <Mail className="w-4 h-4 text-sky-400" />, badge: sentBatches.length > 0 ? String(sentBatches.length) : undefined },
    { id: 'link_scraper' as const, label: 'البحث في روابطي', icon: <Search className="w-4 h-4 text-amber-400" /> },
    { id: 'autojoin' as const, label: 'الانضمام المتقدم', icon: <Zap className="w-4 h-4 text-rose-400" /> },
    { id: 'links' as const, label: 'الروابط المحفوظة', icon: <Bookmark className="w-4 h-4 text-blue-400" /> },
    { id: 'autoreply' as const, label: 'الردود التلقائية', icon: <Bot className="w-4 h-4 text-cyan-400" /> },
    { id: 'rotating' as const, label: 'النشر الدوري', icon: <Repeat className="w-4 h-4 text-emerald-400" /> },
    { id: 'learning' as const, label: 'نظام التعلم الذكي', icon: <Brain className="w-4 h-4 text-purple-400" /> },
    { id: 'academic' as const, label: 'التحليل الأكاديمي', icon: <BarChart3 className="w-4 h-4 text-indigo-400" /> },
    { id: 'formatter' as const, label: 'منسّق الملفات', icon: <FileText className="w-4 h-4 text-teal-400" /> },
    { id: 'presentation' as const, label: 'منشئ العروض (PPTX)', icon: <Monitor className="w-4 h-4 text-purple-400" /> },
    { id: 'system_health' as const, label: 'صحة النظام', icon: <HeartPulse className="w-4 h-4 text-rose-400" /> },
    { id: 'logs' as const, label: 'سجلات النظام', icon: <Radio className="w-4 h-4 text-zinc-400" />, badge: 'مباشر ●' },
  ];

  return (
    <div className="automation-github-skin fixed inset-0 z-[2500] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none">
      <div
        className={`automation-shell bg-zinc-950 border border-zinc-800 text-zinc-100 flex flex-col rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden font-['Cairo',sans-serif] ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-7xl h-[94vh]'
        }`}
        dir="rtl"
      >
        {/* Header App Bar */}
        <div className="automation-appbar flex items-center justify-between px-4 sm:px-6 py-3 bg-zinc-900/90 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-zinc-100">
                  لوحة الوظائف والأتمتة المتقدمة
                </span>
                <span className="px-2 py-0.5 text-[10px] rounded-md font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Telegram Automation Pro
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                منظومة متكاملة للنشر الذكي، الردود التلقائية، الانضمام السريع، والأدوات الأكاديمية والتحليلية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
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
              title="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Tabs Bar */}
        <div className="automation-tabs bg-zinc-900/60 border-b border-zinc-800/80 px-3 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none">
            {navTabs.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'automation-tab-active bg-emerald-600 text-white shadow-md border border-emerald-500/50'
                      : 'automation-tab-idle text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 border border-transparent'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 text-[9px] rounded-md font-black ${
                        isActive
                          ? 'bg-zinc-950/40 text-emerald-200 border border-white/10'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Body Content */}
        <div className="automation-content flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-zinc-950/50">
          {/* 1. Overview Hub matching GitHub repo */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Banner */}
              <div className="rounded-2xl p-5 text-white bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-700 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner">
                    <i className="fas fa-cubes text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg">بوابة الوظائف والأتمتة الذكية</h3>
                    <p className="text-xs text-emerald-100 opacity-90 mt-0.5">
                      اختر الوظيفة المطلوبة أدناه أو تنقل عبر التبويبات العلوية للتحكم الفوري
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('send_monitor')}
                    className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold px-4 py-2 rounded-xl text-xs shadow transition-all flex items-center gap-1.5"
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    <span>إعدادات المراقبة والإرسال</span>
                  </button>
                </div>
              </div>

              {/* 9 Core Functions Grid (Matching GitHub repo exact layout) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                    <i className="fas fa-th-large text-emerald-400" />
                    <span>الوظائف والأدوات الأساسية (9 وظائف):</span>
                  </h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3">
                  {/* 1. نظام التعلم الذكي */}
                  <button
                    onClick={() => setActiveTab('learning')}
                    className="p-4 rounded-xl bg-zinc-900 border border-purple-500/30 hover:border-purple-500 hover:bg-purple-950/20 text-center transition-all group shadow-sm flex flex-col items-center justify-center min-h-[110px]"
                  >
                    <i className="fas fa-brain text-2xl mb-2 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-zinc-100">نظام التعلم الذكي</span>
                    <span className="text-[10px] text-purple-300/70 mt-1">تلقين البوت والردود الذكية</span>
                  </button>

                  {/* 2. النشر الدوري */}
                  <button
                    onClick={() => setActiveTab('rotating')}
                    className="p-4 rounded-xl bg-zinc-900 border border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-950/20 text-center transition-all group shadow-sm flex flex-col items-center justify-center min-h-[110px]"
                  >
                    <i className="fas fa-sync-alt text-2xl mb-2 text-emerald-400 group-hover:rotate-180 transition-transform duration-500" />
                    <span className="text-xs font-bold text-zinc-100">النشر الدوري</span>
                    <span className="text-[10px] text-emerald-300/70 mt-1">تدوير 5 رسائل بالتناوب</span>
                  </button>

                  {/* 3. البحث في روابطي */}
                  <button
                    onClick={() => setActiveTab('link_scraper')}
                    className="p-4 rounded-xl bg-zinc-900 border border-amber-500/30 hover:border-amber-500 hover:bg-amber-950/20 text-center transition-all group shadow-sm flex flex-col items-center justify-center min-h-[110px]"
                  >
                    <i className="fas fa-search text-2xl mb-2 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-zinc-100">البحث في روابطي</span>
                    <span className="text-[10px] text-amber-300/70 mt-1">بحث · رسائل · دول</span>
                  </button>

                  {/* 4. الانضمام المتقدم */}
                  <button
                    onClick={() => setActiveTab('autojoin')}
                    className="p-4 rounded-xl bg-zinc-900 border border-rose-500/30 hover:border-rose-500 hover:bg-rose-950/20 text-center transition-all group shadow-sm flex flex-col items-center justify-center min-h-[110px]"
                  >
                    <i className="fas fa-bolt text-2xl mb-2 text-rose-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-zinc-100">الانضمام المتقدم</span>
                    <span className="text-[10px] text-rose-300/70 mt-1">انضمام فوري بدون حظر</span>
                  </button>

                  {/* 5. صحة النظام */}
                  <button
                    onClick={() => setActiveTab('system_health')}
                    className="p-4 rounded-xl bg-zinc-900 border border-teal-500/30 hover:border-teal-500 hover:bg-teal-950/20 text-center transition-all group shadow-sm flex flex-col items-center justify-center min-h-[110px]"
                  >
                    <i className="fas fa-heartbeat text-2xl mb-2 text-teal-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-zinc-100">صحة النظام</span>
                    <span className="text-[10px] text-teal-300/70 mt-1">الذاكرة · المعالج · الجلسات</span>
                  </button>

                  {/* 6. الردود التلقائية */}
                  <button
                    onClick={() => setActiveTab('autoreply')}
                    className="p-4 rounded-xl bg-zinc-900 border border-cyan-500/30 hover:border-cyan-500 hover:bg-cyan-950/20 text-center transition-all group shadow-sm flex flex-col items-center justify-center min-h-[110px]"
                  >
                    <i className="fas fa-reply-all text-2xl mb-2 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-zinc-100">الردود التلقائية</span>
                    <span className="text-[10px] text-cyan-300/70 mt-1">رد فوري بالكلمات المفتاحية</span>
                  </button>

                  {/* 7. رسائلي */}
                  <button
                    onClick={() => setActiveTab('batches')}
                    className="p-4 rounded-xl bg-zinc-900 border border-sky-500/30 hover:border-sky-500 hover:bg-sky-950/20 text-center transition-all group shadow-sm flex flex-col items-center justify-center min-h-[110px]"
                  >
                    <i className="fas fa-envelope text-2xl mb-2 text-sky-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-zinc-100">📨 رسائلي</span>
                    <span className="text-[10px] text-sky-300/70 mt-1">
                      {sentBatches.length} دفعات مسجلة
                    </span>
                  </button>

                  {/* 8. الروابط المحفوظة */}
                  <button
                    onClick={() => setActiveTab('links')}
                    className="p-4 rounded-xl bg-zinc-900 border border-blue-500/30 hover:border-blue-500 hover:bg-blue-950/20 text-center transition-all group shadow-sm flex flex-col items-center justify-center min-h-[110px]"
                  >
                    <i className="fas fa-bookmark text-2xl mb-2 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-zinc-100">الروابط المحفوظة</span>
                    <span className="text-[10px] text-blue-300/70 mt-1">
                      {savedLinks.length} روابط مصنفة
                    </span>
                  </button>

                  {/* 9. سجلات النظام */}
                  <button
                    onClick={() => setActiveTab('logs')}
                    className="p-4 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 text-center transition-all group shadow-sm flex flex-col items-center justify-center min-h-[110px]"
                  >
                    <i className="fas fa-terminal text-2xl mb-2 text-zinc-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-zinc-100">سجلات النظام</span>
                    <span className="text-[10px] text-emerald-400 mt-1 font-bold">● مباشر</span>
                  </button>
                </div>
              </div>

              {/* Academic & Document Tools Section */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                  <i className="fas fa-graduation-cap text-indigo-400" />
                  <span>الأدوات الأكاديمية والتحليلية المتقدمة:</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Academic Analysis */}
                  <div
                    onClick={() => setActiveTab('academic')}
                    className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/50 to-zinc-900 border border-indigo-500/30 hover:border-indigo-500 cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <i className="fas fa-chart-bar" />
                      </div>
                      <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
                        SPSS + AI
                      </span>
                    </div>
                    <h5 className="font-bold text-xs text-zinc-100">التحليل الأكاديمي الذكي</h5>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      تحليل استبانات ليكرت، مصفوفة الارتباط، الانحدار الخطي، والتقرير الإحصائي
                    </p>
                  </div>

                  {/* Document Formatter */}
                  <div
                    onClick={() => setActiveTab('formatter')}
                    className="p-4 rounded-xl bg-gradient-to-br from-teal-950/50 to-zinc-900 border border-teal-500/30 hover:border-teal-500 cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                        <i className="fas fa-file-word" />
                      </div>
                      <span className="text-[10px] font-bold bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded">
                        Word + PDF
                      </span>
                    </div>
                    <h5 className="font-bold text-xs text-zinc-100">منسّق الملفات والمستندات</h5>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      استخراج وتنسيق مستندات Word و PDF وتصديرها بصيغ متعددة
                    </p>
                  </div>

                  {/* Presentation Builder */}
                  <div
                    onClick={() => setActiveTab('presentation')}
                    className="p-4 rounded-xl bg-gradient-to-br from-purple-950/50 to-zinc-900 border border-purple-500/30 hover:border-purple-500 cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                        <i className="fas fa-file-powerpoint" />
                      </div>
                      <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                        PowerPoint PPTX
                      </span>
                    </div>
                    <h5 className="font-bold text-xs text-zinc-100">منشئ العروض التقديمية</h5>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      تصميم عروض بوربوينت احترافية بالذكاء الاصطناعي مع السمات المتنوعة
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Send & Monitor Tab */}
          {activeTab === 'send_monitor' && (
            <SendMonitorTab
              onBack={() => setActiveTab('overview')}
              initialMessage={settings.message}
              initialGroups={settings.groups}
              initialWatchWords={settings.watch_words}
            />
          )}

          {/* 3. Batches Tab */}
          {activeTab === 'batches' && (
            <BatchesTab
              batches={sentBatches}
              onEditBatch={handleEditBatch}
              onDeleteBatch={handleDeleteBatch}
              onRefresh={fetchAllData}
            />
          )}

          {/* 4. Link Scraper & Search */}
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

          {/* 5. Auto Join Tab */}
          {activeTab === 'autojoin' && (
            <AutoJoinTab
              onStartAutoJoin={handleStartAutoJoin}
              onStopAutoJoin={handleStopAutoJoin}
              onPauseAutoJoin={handlePauseAutoJoin}
              progressEvent={autoJoinProgress}
            />
          )}

          {/* 6. Saved Links Tab */}
          {activeTab === 'links' && (
            <SavedLinksTab
              links={savedLinks}
              categories={linkCategories}
              onAddLink={handleAddLink}
              onDeleteLink={handleDeleteLink}
              onSendToAutoJoin={handleSendToAutoJoin}
            />
          )}

          {/* 7. Auto Reply Tab */}
          {activeTab === 'autoreply' && (
            <AutoReplyTab
              enabled={autoReplyEnabled}
              rules={autoReplyRules}
              onToggleEnabled={handleToggleAutoReply}
              onAddRule={handleAddAutoReplyRule}
              onDeleteRule={handleDeleteAutoReplyRule}
            />
          )}

          {/* 8. Rotating Auto-Poster Tab */}
          {activeTab === 'rotating' && (
            <RotatingTab
              status={rotatingStatus}
              onSave={handleSaveRotating}
              onStart={handleStartRotating}
              onStop={handleStopRotating}
            />
          )}

          {/* 9. Smart Learning Tab */}
          {activeTab === 'learning' && (
            <LearningTab
              activePrivate={learningData.active_private}
              activeGroup={learningData.active_group}
              services={learningData.services || {}}
              onToggleActive={handleToggleLearningActive}
              onGenerateAiResponse={handleGenerateAiResponse}
            />
          )}

          {/* 10. Academic Analysis Tab */}
          {activeTab === 'academic' && <AcademicTab onAnalyze={handleAnalyzeAcademic} />}

          {/* 11. Document Formatter Tab */}
          {activeTab === 'formatter' && <DocFormatterTab onExportDoc={handleExportDoc} />}

          {/* 12. Presentation Builder Tab */}
          {activeTab === 'presentation' && <PresentationTab />}

          {/* 13. System Health Tab */}
          {activeTab === 'system_health' && <SystemHealthTab />}

          {/* 14. Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="rounded-xl p-4 text-white bg-gradient-to-r from-zinc-800 to-zinc-900 border border-zinc-700 shadow flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-xl">
                    <i className="fas fa-terminal text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">سجلات النظام المباشرة (System Terminal)</h3>
                    <p className="text-xs text-zinc-400">
                      بث مباشر لكافة الأحداث والعمليات والمهام الخلفية المنفذة
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setLogs([])}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  مسح السجلات
                </button>
              </div>

              <LiveLogs logs={logs} onClearLogs={() => setLogs([])} />
            </div>
          )}

          {/* Live Activity Terminal snippet at the bottom of non-logs tabs */}
          {activeTab !== 'logs' && <LiveLogs logs={logs} onClearLogs={() => setLogs([])} />}
        </div>
      </div>
    </div>
  );
};
