import React, { useState, useEffect } from 'react';
import { Repeat, Play, Square, Save, Clock, Hourglass, CheckCircle2, AlertCircle } from 'lucide-react';

interface RotatingTabProps {
  status: {
    active: boolean;
    messages?: string[];
    groups?: string[];
    interval?: number;
    next_send_in?: number;
    interval_seconds?: number;
    interval_minutes?: number;
    current_index?: number;
    total_messages?: number;
    last_run?: string;
    next_run?: string;
    target_groups_count?: number;
    messages_preview?: any[];
    [key: string]: any;
  };
  onSave: (data: any, groups?: string[], interval?: number) => Promise<void> | void;
  onStart: () => Promise<void> | void;
  onStop: () => Promise<void> | void;
}

export const RotatingTab: React.FC<RotatingTabProps> = ({
  status,
  onSave,
  onStart,
  onStop,
}) => {
  const [messages, setMessages] = useState<string[]>(
    status.messages?.length ? status.messages : ['', '', '', '', '']
  );
  const [groups, setGroups] = useState((status.groups || []).join('\n'));
  const [intervalVal, setIntervalVal] = useState(status.interval_minutes || status.interval || 15);
  const [countdown, setCountdown] = useState<number>(status.next_send_in || 0);

  useEffect(() => {
    if (status.messages?.length) {
      const padded = [...status.messages];
      while (padded.length < 5) padded.push('');
      setMessages(padded.slice(0, 5));
    }
    if (status.groups?.length) setGroups(status.groups.join('\n'));
    if (status.interval || status.interval_minutes) {
      setIntervalVal(status.interval_minutes || status.interval || 15);
    }
  }, [status]);

  useEffect(() => {
    if (status.active && status.next_send_in) {
      setCountdown(status.next_send_in);
      const timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status.active, status.next_send_in]);

  const handleMessageChange = (index: number, val: string) => {
    const updated = [...messages];
    updated[index] = val;
    setMessages(updated);
  };

  const formatCountdown = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSaveClick = () => {
    onSave(
      messages.filter((m) => m.trim()),
      groups.split('\n').map((g) => g.trim()).filter(Boolean),
      intervalVal
    );
  };

  return (
    <div className="space-y-4 text-right" dir="rtl">
      {/* Header Banner */}
      <div className="rounded-xl p-4 text-white bg-gradient-to-r from-emerald-700 via-green-600 to-teal-600 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-xl shadow-inner">
            <i className="fas fa-sync-alt text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base">النشر الدوري المتسلسل (Rotating Auto-Poster)</h3>
            <p className="text-xs text-emerald-100 opacity-90">
              تدوير 5 رسائل بالتناوب لمنع اكتشاف التكرار والنشر الذكي كل فترة محددة
            </p>
          </div>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
          status.active ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200 animate-pulse' : 'bg-white/20 border-white/30 text-white'
        }`}>
          ● {status.active ? 'النشر نشط حالياً' : 'متوقف'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: 5 Messages & Groups */}
        <div className="lg:col-span-8 space-y-3">
          {/* 5 Rotating Messages */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 space-y-2.5">
            <span className="text-xs font-bold text-zinc-200 block">
              نصوص الرسائل الـ 5 (يتم إرسالها بالتناوب):
            </span>
            {messages.map((msg, idx) => (
              <div key={idx} className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-400">
                  الرسالة {idx + 1} {status.current_index === idx && status.active ? '(الرسالة الحالية ▶️)' : ''}:
                </span>
                <textarea
                  rows={2}
                  value={msg}
                  onChange={(e) => handleMessageChange(idx, e.target.value)}
                  placeholder={`نص الرسالة رقم ${idx + 1}...`}
                  className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg p-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                />
              </div>
            ))}
          </div>

          {/* Target Groups */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 space-y-2">
            <span className="text-xs font-bold text-zinc-200 block">
              قائمة المجموعات والقنوات المستهدفة (معرّف أو رابط لكل سطر):
            </span>
            <textarea
              rows={4}
              value={groups}
              onChange={(e) => setGroups(e.target.value)}
              placeholder="https://t.me/group1&#10;@group_username&#10;https://t.me/+join_hash"
              className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg p-2.5 text-xs text-zinc-100 placeholder-zinc-600 font-mono focus:outline-none focus:border-emerald-500 text-left"
              dir="ltr"
            />
          </div>
        </div>

        {/* Right Column: Timing, Status & Actions */}
        <div className="lg:col-span-4 space-y-3">
          {/* Interval Setting */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 space-y-2">
            <span className="text-xs font-bold text-zinc-200 block">
              الفترة الزمنية بين كل رسالة:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="1440"
                value={intervalVal}
                onChange={(e) => setIntervalVal(Number(e.target.value) || 1)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono text-center font-bold focus:outline-none focus:border-emerald-500"
              />
              <span className="text-xs text-zinc-400">دقيقة</span>
            </div>

            <div className="flex gap-1.5 pt-1">
              {[5, 15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setIntervalVal(mins)}
                  className={`flex-1 py-1 text-[11px] font-bold rounded border transition-colors ${
                    intervalVal === mins
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {mins} د
                </button>
              ))}
            </div>
          </div>

          {/* Status Details Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 space-y-3">
            <span className="text-xs font-bold text-zinc-200 block">
              حالة النشر الدوري:
            </span>

            {status.active && countdown > 0 && (
              <div className="bg-zinc-950 border border-emerald-500/30 rounded-lg p-3 text-center space-y-1">
                <span className="text-[11px] text-zinc-400 block">الوقت المتبقي للإرسال القادم:</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">{formatCountdown(countdown)}</span>
              </div>
            )}

            <div className="divide-y divide-zinc-800 text-xs">
              <div className="py-2 flex justify-between">
                <span className="text-zinc-400">الرسائل النشطة:</span>
                <span className="font-bold text-zinc-200 font-mono">
                  {messages.filter((m) => m.trim()).length} / 5
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-zinc-400">المجموعات المحددة:</span>
                <span className="font-bold text-zinc-200 font-mono">
                  {groups.split('\n').filter(Boolean).length}
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-zinc-400">آخر إرسال:</span>
                <span className="text-zinc-300 font-mono text-[11px]">
                  {status.last_run || 'لم يبدأ بعد'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleSaveClick}
              className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold py-2 px-3 rounded-xl border border-zinc-700 text-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>حفظ إعدادات النشر</span>
            </button>

            {!status.active ? (
              <button
                onClick={onStart}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-md text-xs transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                <span>بدء النشر الدوري</span>
              </button>
            ) : (
              <button
                onClick={onStop}
                className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-md text-xs transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                <span>إيقاف النشر الدوري</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
