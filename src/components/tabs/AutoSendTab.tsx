import React, { useState, useEffect, useRef } from 'react';
import { Send, Rocket, Clock, Image as ImageIcon, CheckSquare, Square, RefreshCw, Sparkles, AlertCircle, ShieldAlert, Layers } from 'lucide-react';

interface AutoSendTabProps {
  onBack?: () => void;
}

const STORAGE_KEY = 'telegram_auto_send_settings';

export const AutoSendTab: React.FC<AutoSendTabProps> = ({ onBack }) => {
  // Load saved state from localStorage
  const loadSavedSettings = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return {
      messageText: '',
      groupsInput: '',
      allGroupsSelected: false,
      sendType: 'manual',
      sendSmart: 'smart',
      intervalMinutes: 25,
      scheduleDuration: 0,
      selectedOption: 'salam',
    };
  };

  const initial = loadSavedSettings();
  const [messageText, setMessageText] = useState<string>(initial.messageText || '');
  const [groupsInput, setGroupsInput] = useState<string>(initial.groupsInput || '');
  const [allGroupsSelected, setAllGroupsSelected] = useState<boolean>(initial.allGroupsSelected || false);
  const [sendType, setSendType] = useState<'manual' | 'scheduled'>(initial.sendType || 'manual');
  const [sendSmart, setSendSmart] = useState<'smart' | 'normal'>(initial.sendSmart || 'smart');
  const [intervalMinutes, setIntervalMinutes] = useState<number>(initial.intervalMinutes || 25);
  const [scheduleDuration, setScheduleDuration] = useState<number>(initial.scheduleDuration || 0);
  const [selectedOption, setSelectedOption] = useState<'salam' | 'skip' | 'smart' | 'always' | 'off'>(
    initial.selectedOption || 'salam'
  );
  const [uploadedImages, setUploadedImages] = useState<Array<{ name: string; data: string; type: string }>>([]);
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [logs, setLogs] = useState<Array<{ id: string; time: string; message: string; type?: 'info' | 'success' | 'error' }>>([
    {
      id: 'init',
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      message: '🚀 واجهة الإرسال والجدولة الذكية جاهزة',
      type: 'info',
    },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logBoxRef = useRef<HTMLDivElement>(null);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          messageText,
          groupsInput,
          allGroupsSelected,
          sendType,
          sendSmart,
          intervalMinutes,
          scheduleDuration,
          selectedOption,
        })
      );
    } catch (e) {}
  }, [messageText, groupsInput, allGroupsSelected, sendType, sendSmart, intervalMinutes, scheduleDuration, selectedOption]);

  const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [
      ...prev.slice(-49),
      { id: `${Date.now()}_${Math.random()}`, time, message: msg, type },
    ]);
  };

  // Initial load from backend
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.settings && !localStorage.getItem(STORAGE_KEY)) {
          if (data.settings.message) setMessageText(data.settings.message);
          if (data.settings.groups && data.settings.groups.length > 0) {
            setGroupsInput(data.settings.groups.join('\n'));
          }
          if (data.settings.interval_seconds) {
            setIntervalMinutes(Math.floor(data.settings.interval_seconds / 60) || 25);
          }
          if (data.settings.schedule_duration_hours) {
            setScheduleDuration(data.settings.schedule_duration_hours);
          }
          if (data.settings.sanitize_mode) {
            setSelectedOption(data.settings.sanitize_mode);
          }
          if (data.settings.send_type) {
            setSendType(data.settings.send_type);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Scroll log
  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs]);

  const handleImages = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        addLog(`⚠️ ${file.name} يتجاوز 10 ميجابايت، تم تخطيه`, 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setUploadedImages((prev) => [
            ...prev,
            { name: file.name, data: e.target!.result as string, type: file.type },
          ]);
          addLog(`📷 تم إرفاق الصورة: ${file.name}`, 'info');
        }
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    addLog('🗑️ تم حذف الصورة المرفقة', 'info');
  };

  const saveSettingsToBackend = async () => {
    setIsSaving(true);
    const data = {
      message: messageText,
      groups: groupsInput,
      send_type: sendType,
      interval_seconds: (intervalMinutes || 25) * 60,
      schedule_duration_hours: scheduleDuration || 0,
      sanitize_mode: selectedOption,
      smart_send: sendSmart,
    };

    try {
      const res = await fetch('/api/save_settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        addLog('💾 تم حفظ نص الرسالة والمجموعات والإعدادات بنجاح', 'success');
      } else {
        addLog('❌ فشل الحفظ: ' + (result.message || 'خطأ'), 'error');
      }
    } catch (err: any) {
      addLog('❌ خطأ: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendNow = async () => {
    const msg = messageText.trim();
    const grps = groupsInput.trim();
    const sendToAll = allGroupsSelected;

    if (!msg && uploadedImages.length === 0) {
      addLog('⚠️ يرجى كتابة نص الرسالة أو إرفاق صورة أولاً', 'error');
      return;
    }
    if (!sendToAll && !grps) {
      addLog('⚠️ يرجى تحديد المجموعات المستهدفة أو تفعيل خيار "كل المجموعات"', 'error');
      return;
    }

    setIsSending(true);
    addLog('⏳ جاري بدء الإرسال الفوري لجميع الوجهات...', 'info');

    try {
      const res = await fetch('/api/send_now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          groups: grps,
          send_to_all: sendToAll,
          images: uploadedImages,
          action: selectedOption,
          smart_send: sendSmart,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addLog(`✅ اكتمل الإرسال بنجاح! ${data.message || ''}`, 'success');
      } else {
        addLog(`❌ فشل الإرسال: ${data.message || 'خطأ غير معروف'}`, 'error');
      }
    } catch (err: any) {
      addLog('❌ خطأ في الاتصال بالخادم: ' + err.message, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const groupsCount = groupsInput
    .split('\n')
    .map((g) => g.trim())
    .filter(Boolean).length;

  return (
    <div dir="rtl" className="w-full max-w-4xl mx-auto space-y-5 select-none">
      {/* Top Banner */}
      <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/10">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-zinc-100">
                  الإرسال والجدولة التلقائية الذكية
                </h3>
                <span className="px-2 py-0.5 text-xs rounded-full font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {sendType === 'scheduled' ? '⏰ مجدول دوري' : '⚡ فوري ومباشر'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                إرسال الرسائل الإعلانية والصور للمجموعات والقنوات مع حماية ضد الحظر وتطهير تلقائي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSendNow}
              disabled={isSending}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-lg shadow-blue-600/30 border border-blue-400 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send className={`w-4 h-4 ${isSending ? 'animate-bounce' : ''}`} />
              <span>{isSending ? 'جاري الإرسال...' : 'إرسال الآن 🚀'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Message & Images + Target Groups & Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Column: Message Text & Images (7 cols) */}
        <div className="md:col-span-7 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">📝</span>
              <h4 className="font-bold text-sm text-zinc-200">نص الرسالة المنشورة</h4>
            </div>
            <span className="text-xs text-zinc-400 font-mono">{messageText.length} حرف</span>
          </div>

          <textarea
            rows={6}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="اكتب نص الرسالة أو العرض الإعلاني هنا..."
            className="w-full p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 text-sm leading-relaxed focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-y font-medium"
          />

          {/* Image Attachments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>إرفاق الصور والوسائط ({uploadedImages.length})</span>
              </span>
              {uploadedImages.length > 0 && (
                <button
                  onClick={() => setUploadedImages([])}
                  className="text-[11px] text-rose-400 hover:text-rose-300"
                >
                  حذف الكل
                </button>
              )}
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-700/70 hover:border-blue-500/60 bg-zinc-950/50 hover:bg-blue-500/5 rounded-xl p-3.5 text-center cursor-pointer transition-all"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleImages(e.target.files)}
              />
              <div className="text-xs font-bold text-zinc-300">اضغط لرفع وتضمين الصور في الرسالة</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">يدعم JPG, PNG, WebP حتى 10MB</div>
            </div>

            {uploadedImages.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {uploadedImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="w-16 h-16 rounded-xl overflow-hidden relative border border-zinc-700 bg-zinc-950 group"
                  >
                    <img src={img.data} alt={img.name} className="w-full h-full object-cover" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(idx);
                      }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center shadow opacity-80 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
            <button
              onClick={saveSettingsToBackend}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-bold transition-all border border-zinc-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
              <span>حفظ كمسودة وإعدادات</span>
            </button>
          </div>
        </div>

        {/* Right Column: Groups + Schedule & Sanitize Modes (5 cols) */}
        <div className="md:col-span-5 space-y-5">
          {/* Target Groups */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-zinc-200">👥 المجموعات والقنوات المستهدفة</h4>
              <span className="text-xs text-blue-400 font-mono">{groupsCount} محادثة</span>
            </div>

            <textarea
              rows={4}
              value={groupsInput}
              onChange={(e) => setGroupsInput(e.target.value)}
              disabled={allGroupsSelected}
              placeholder="ضع كل رابط أو معرف في سطر، مثلاً:
https://t.me/example_group
@channel_username"
              className="w-full p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 text-xs leading-relaxed focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-40"
            />

            <div
              onClick={() => setAllGroupsSelected(!allGroupsSelected)}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                allGroupsSelected
                  ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
                  : 'bg-zinc-950/40 border-zinc-800 text-zinc-400'
              }`}
            >
              {allGroupsSelected ? (
                <CheckSquare className="w-4 h-4 text-blue-400" />
              ) : (
                <Square className="w-4 h-4 text-zinc-500" />
              )}
              <span className="text-xs font-bold">
                {allGroupsSelected ? 'تحديد كل المجموعات المشترك بها' : 'اختيار كل المجموعات المسجلة'}
              </span>
            </div>
          </div>

          {/* Scheduling & Interval */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-zinc-200">⏰ نوع الإرسال والجدولة</h4>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSendType('manual')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  sendType === 'manual'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-900/30'
                    : 'bg-zinc-950/50 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                📌 إرسال يدوي / فوري
              </button>
              <button
                type="button"
                onClick={() => setSendType('scheduled')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  sendType === 'scheduled'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-900/30'
                    : 'bg-zinc-950/50 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                ⏱️ جدولة دورية
              </button>
            </div>

            {sendType === 'scheduled' && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">تكرار الإرسال كل:</span>
                  <span className="font-bold text-blue-400 font-mono">{intervalMinutes} دقيقة</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={240}
                  step={5}
                  value={intervalMinutes}
                  onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            )}

            {/* Sanitize Mode Filter */}
            <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
              <span className="text-xs text-zinc-400 block font-medium">🛡️ وضع التنقية وتطهير الرسائل:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'salam', label: 'ذكي (salam)' },
                  { id: 'smart', label: 'تطهير متقدم' },
                  { id: 'skip', label: 'تخطي المخالف' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedOption(opt.id as any)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all ${
                      selectedOption === opt.id
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-zinc-950/40 text-zinc-400 border-zinc-800 hover:bg-zinc-800/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Logs Terminal */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
            <h4 className="font-bold text-sm text-zinc-200">سجل الإرسال المباشر</h4>
          </div>
          <button
            onClick={() => setLogs([])}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 px-2 py-0.5 rounded bg-zinc-800"
          >
            مسح السجل
          </button>
        </div>

        <div
          ref={logBoxRef}
          className="h-36 overflow-y-auto bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 font-mono text-xs space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-700"
        >
          {logs.map((log) => (
            <div
              key={log.id}
              className={`flex items-start gap-2 py-0.5 ${
                log.type === 'success'
                  ? 'text-emerald-400 font-bold'
                  : log.type === 'error'
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
