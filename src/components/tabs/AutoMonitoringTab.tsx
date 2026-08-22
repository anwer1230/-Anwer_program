import React, { useState, useEffect, useRef } from 'react';
import { Radio, Bell, Play, Square, Volume2, ShieldCheck, RefreshCw, CheckCircle2, AlertTriangle, Info, Sparkles } from 'lucide-react';

interface AutoMonitoringTabProps {
  onBack?: () => void;
}

const STORAGE_KEY = 'telegram_auto_monitoring_settings';

export const AutoMonitoringTab: React.FC<AutoMonitoringTabProps> = ({ onBack }) => {
  // Load saved settings from localStorage or defaults
  const loadSavedSettings = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return {
      watchWords: 'بحث\nأطروحة\nتكليف\nمشروع\nحل واجب\nترجمة\nتدقيق\nاستشارة\nرسالة ماجستير\nدكتوراه',
      notifyTarget: 'me',
      soundEnabled: true,
    };
  };

  const initial = loadSavedSettings();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [watchWords, setWatchWords] = useState<string>(initial.watchWords);
  const [notifyTarget, setNotifyTarget] = useState<string>(initial.notifyTarget || 'me');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(initial.soundEnabled ?? true);
  const [isTestingNotify, setIsTestingNotify] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alertsCount, setAlertsCount] = useState(0);
  const [logs, setLogs] = useState<Array<{ id: string; time: string; message: string; type?: 'info' | 'alert' | 'success' | 'warn' }>>([
    {
      id: 'init',
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      message: '📡 محرك المراقبة الذكية جاهز للرصد اللحظي',
      type: 'info',
    },
  ]);

  const logBoxRef = useRef<HTMLDivElement>(null);

  // Auto-save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          watchWords,
          notifyTarget,
          soundEnabled,
        })
      );
    } catch (e) {}
  }, [watchWords, notifyTarget, soundEnabled]);

  const addLog = (msg: string, type: 'info' | 'alert' | 'success' | 'warn' = 'info') => {
    const time = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [
      ...prev.slice(-49),
      { id: `${Date.now()}_${Math.random()}`, time, message: msg, type },
    ]);
  };

  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 920;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
      setTimeout(() => ctx.close(), 350);
    } catch (e) {}
  };

  // Initial load from backend
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.settings) {
          if (data.settings.watch_words && data.settings.watch_words.length > 0 && !localStorage.getItem(STORAGE_KEY)) {
            setWatchWords(data.settings.watch_words.join('\n'));
          }
          if (data.settings.notify_target) {
            setNotifyTarget(data.settings.notify_target);
          }
        }
        if (data && data.monitoring_active !== undefined) {
          setIsMonitoring(data.monitoring_active);
        }
      })
      .catch(() => {});

    fetch('/api/get_login_status')
      .then((r) => r.json())
      .then((data) => {
        if (data.is_running) {
          setIsMonitoring(true);
        }
      })
      .catch(() => {});

    // Listen to real-time events via EventSource SSE
    const es = new EventSource('/api/events');
    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'log_update' && payload.data?.message) {
          addLog(payload.data.message, 'info');
        } else if (payload.type === 'new_alert' && payload.data) {
          addLog(`🚨 تنبيه فوري: تم رصد "${payload.data.keyword}" في [${payload.data.group || 'مجموعة'}]`, 'alert');
          setAlertsCount((c) => c + 1);
          playBeep();
        } else if (payload.type === 'monitoring_status' && payload.data?.is_running !== undefined) {
          setIsMonitoring(payload.data.is_running);
        }
      } catch (e) {}
    };

    return () => {
      es.close();
    };
  }, []);

  // Scroll logs
  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs]);

  const saveSettingsToBackend = async () => {
    setIsSaving(true);
    const data = {
      watch_words: watchWords,
      notify_target: notifyTarget,
    };

    try {
      const res = await fetch('/api/save_settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        addLog('💾 تم حفظ كلمات المراقبة ووجهة التنبيهات بنجاح', 'success');
      } else {
        addLog('❌ فشل الحفظ: ' + (result.message || 'خطأ'), 'warn');
      }
    } catch (err: any) {
      addLog('❌ خطأ في الاتصال بالخادم: ' + err.message, 'warn');
    } finally {
      setIsSaving(false);
    }
  };

  const startMonitoring = async () => {
    try {
      await saveSettingsToBackend();
      const res = await fetch('/api/start_monitoring', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setIsMonitoring(true);
        addLog('🚀 تم تفعيل الرصد والمراقبة التلقائية للرسائل الحية', 'success');
        playBeep();
      } else {
        addLog('❌ تعذر تشغيل المراقبة: ' + (data.message || 'خطأ'), 'warn');
      }
    } catch (err: any) {
      addLog('❌ خطأ: ' + err.message, 'warn');
    }
  };

  const stopMonitoring = async () => {
    try {
      const res = await fetch('/api/stop_monitoring', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setIsMonitoring(false);
        addLog('⏹️ تم إيقاف المراقبة التلقائية', 'info');
      }
    } catch (err: any) {
      addLog('❌ خطأ: ' + err.message, 'warn');
    }
  };

  const handleTestNotify = async () => {
    setIsTestingNotify(true);
    addLog('🔔 جاري إرسال إشعار تجريبي عبر الخادم...', 'info');
    try {
      const res = await fetch('/api/automation/test_notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: notifyTarget }),
      });
      const result = await res.json();
      if (result.success) {
        addLog(result.message || '✅ تم استلام الإشعار التجريبي بنجاح', 'success');
        playBeep();
      } else {
        addLog('❌ فشل الإشعار التجريبي: ' + (result.message || 'خطأ'), 'warn');
      }
    } catch (e: any) {
      addLog('❌ تعذر إرسال الإشعار التجريبي: ' + e.message, 'warn');
    } finally {
      setIsTestingNotify(false);
    }
  };

  const wordsList = watchWords.split('\n').map((w) => w.trim()).filter(Boolean);

  return (
    <div dir="rtl" className="w-full max-w-4xl mx-auto space-y-5 select-none">
      {/* Top Status & Controls Card */}
      <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
                isMonitoring
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-lg shadow-amber-500/10 animate-pulse'
                  : 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60'
              }`}
            >
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-zinc-100">
                  المراقبة التلقائية الذكية للكلمات المفتاحية
                </h3>
                <span
                  className={`px-2 py-0.5 text-xs rounded-full font-bold border ${
                    isMonitoring
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {isMonitoring ? '🟢 نشطة وتراقب' : '⚪ متوقفة'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                فحص الرسائل الواردة بالمجموعات والقنوات فوراً وتنبيهك عند مطابقة أي كلمة مفتاحية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isMonitoring ? (
              <button
                onClick={stopMonitoring}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-950/40 border border-rose-500 transition-all"
              >
                <Square className="w-4 h-4" />
                <span>إيقاف المراقبة</span>
              </button>
            ) : (
              <button
                onClick={startMonitoring}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm shadow-lg shadow-amber-500/20 border border-amber-400 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-zinc-950" />
                <span>بدء المراقبة اللحظية</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Watch Words + Notification Config */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Column: Watch Words Input (7 cols) */}
        <div className="md:col-span-7 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <h4 className="font-bold text-sm text-zinc-200">الكلمات المفتاحية المستهدفة (Watch Words)</h4>
            </div>
            <span className="px-2 py-0.5 text-xs rounded-md bg-zinc-800 text-zinc-400 font-mono">
              {wordsList.length} كلمة
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            أدخل كل كلمة أو عبارة مراد رصدها في سطر منفصل. سيتم فحص أي رسالة جديدة تطابق هذه الكلمات في أي محادثة.
          </p>

          <textarea
            rows={7}
            value={watchWords}
            onChange={(e) => setWatchWords(e.target.value)}
            placeholder="أدخل الكلمات هنا، مثلاً:
بحث
رسالة ماجستير
دكتوراه
حل تكليف
مشروع تخرج"
            className="w-full p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 text-sm leading-relaxed focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all resize-y font-medium"
          />

          {/* Quick Tag Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {wordsList.slice(0, 12).map((w, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 text-xs rounded-lg bg-zinc-800/90 text-amber-300/90 border border-amber-500/20 font-medium"
              >
                #{w}
              </span>
            ))}
            {wordsList.length > 12 && (
              <span className="px-2 py-1 text-xs rounded-lg bg-zinc-800 text-zinc-400">
                +{wordsList.length - 12} المزيد
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
            <button
              onClick={saveSettingsToBackend}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-bold transition-all border border-zinc-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
              <span>حفظ الكلمات والإعدادات</span>
            </button>
          </div>
        </div>

        {/* Right Column: Notification Target & Sound Options (5 cols) */}
        <div className="md:col-span-5 space-y-5">
          {/* Notification Destination */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-lg">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-sm text-zinc-200">وجهة استلام التنبيهات</h4>
            </div>

            <p className="text-xs text-zinc-400">
              حدد أين تريد استلام إشعار ورابط الرسالة فور رصد الكلمة المفتاحية:
            </p>

            <div className="space-y-2">
              {[
                { id: 'me', label: 'حسابي الخاص / الرسائل المحفوظة', icon: '👤', desc: 'إشعار فوري في المحادثة الشخصية' },
                { id: 'saved', label: 'الرسائل المحفوظة فقط (Saved Messages)', icon: '📥', desc: 'حفظ الرسائل وتثبيتها' },
                { id: 'bot', label: 'بوت الإشعارات المخصص (Telegram Bot)', icon: '🤖', desc: 'إرسال التنبيه عبر توكن البوت' },
              ].map((opt) => {
                const isSelected = notifyTarget === opt.id;
                return (
                  <label
                    key={opt.id}
                    onClick={() => setNotifyTarget(opt.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 text-zinc-100 shadow-sm'
                        : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-400 hover:bg-zinc-800/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="notifyTarget"
                      checked={isSelected}
                      onChange={() => setNotifyTarget(opt.id)}
                      className="mt-1 accent-amber-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200">
                        <span>{opt.icon}</span>
                        <span>{opt.label}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Sound Toggle */}
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>صوت التنبيه الفوري</span>
              </div>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  soundEnabled ? 'bg-amber-500' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    soundEnabled ? '-translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Test Notification Button */}
            <button
              onClick={handleTestNotify}
              disabled={isTestingNotify}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center justify-center gap-2 transition-all mt-2"
            >
              <Volume2 className={`w-4 h-4 ${isTestingNotify ? 'animate-bounce' : ''}`} />
              <span>{isTestingNotify ? 'جاري إرسال الإشعار...' : '🔔 اختبار التنبيه الآن'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Monitoring Feed & Terminal */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h4 className="font-bold text-sm text-zinc-200">سجل الرصد والتنبيهات المباشرة</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">
              إجمالي التنبيهات: <strong className="text-amber-400 font-mono">{alertsCount}</strong>
            </span>
            <button
              onClick={() => setLogs([])}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 px-2 py-0.5 rounded bg-zinc-800"
            >
              مسح السجل
            </button>
          </div>
        </div>

        <div
          ref={logBoxRef}
          className="h-44 overflow-y-auto bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 font-mono text-xs space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-700"
        >
          {logs.map((log) => (
            <div
              key={log.id}
              className={`flex items-start gap-2 py-0.5 ${
                log.type === 'alert'
                  ? 'text-amber-300 font-bold bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20'
                  : log.type === 'success'
                  ? 'text-emerald-400 font-medium'
                  : log.type === 'warn'
                  ? 'text-rose-400'
                  : 'text-zinc-400'
              }`}
            >
              <span className="text-[10px] text-zinc-500 shrink-0 select-none">[{log.time}]</span>
              <span className="flex-1">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
