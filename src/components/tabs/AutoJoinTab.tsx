import React, { useState } from 'react';
import {
  Zap,
  Play,
  Pause,
  Square,
  LogOut,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Shield,
  Layers
} from 'lucide-react';
import { AutoJoinItem, AutoJoinProgressEvent } from '../../types';

interface AutoJoinTabProps {
  onStartAutoJoin: (data: {
    links: string;
    delay: number;
    max_retries: number;
    fetch_external?: boolean;
    search_by_name?: boolean;
  }) => Promise<void>;
  onStopAutoJoin: () => Promise<void>;
  onPauseAutoJoin: () => Promise<void>;
  progressEvent: AutoJoinProgressEvent | null;
}

export const AutoJoinTab: React.FC<AutoJoinTabProps> = ({
  onStartAutoJoin,
  onStopAutoJoin,
  onPauseAutoJoin,
  progressEvent,
}) => {
  const [linksText, setLinksText] = useState(
    `https://t.me/group1\nhttps://t.me/+invite_link_hash\n@channel_username`
  );
  const [delay, setDelay] = useState(3);
  const [maxRetries, setMaxRetries] = useState(3);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleStart = async () => {
    setIsRunning(true);
    setIsPaused(false);
    await onStartAutoJoin({
      links: linksText,
      delay,
      max_retries: maxRetries,
    });
  };

  const handlePause = async () => {
    await onPauseAutoJoin();
    setIsPaused(true);
  };

  const handleResume = async () => {
    await onPauseAutoJoin();
    setIsPaused(false);
  };

  const handleStop = async () => {
    await onStopAutoJoin();
    setIsRunning(false);
    setIsPaused(false);
  };

  const counts = progressEvent?.counts || { success: 0, fail: 0, already: 0, done: 0, total: 0 };
  const percent = counts.total > 0 ? Math.round((counts.done / counts.total) * 100) : 0;

  return (
    <div className="space-y-4 text-right" dir="rtl">
      {/* Header Banner */}
      <div className="rounded-xl p-4 text-white bg-gradient-to-r from-red-700 via-rose-600 to-pink-600 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-xl shadow-inner">
            <i className="fas fa-bolt text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base">الانضمام التلقائي المتقدم (Auto Join Advanced)</h3>
            <p className="text-xs text-rose-100 opacity-90">
              انضمام فوري وآمن للمجموعات والقنوات مع تجاوز المجموعات المقفلة وتفادي حظر التليجرام
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 border border-white/30">
          MTProto FloodSafe
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Inputs Section */}
        <div className="lg:col-span-8 space-y-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 space-y-2">
            <label className="block text-xs font-bold text-zinc-200">
              روابط المجموعات (سطر لكل رابط):
            </label>
            <textarea
              rows={7}
              value={linksText}
              onChange={(e) => setLinksText(e.target.value)}
              placeholder="https://t.me/group1&#10;https://t.me/+invite&#10;@channel"
              className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg p-3 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500 leading-relaxed text-left"
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 space-y-1.5">
              <label className="block text-xs font-bold text-zinc-300">
                التأخير بين كل انضمام (ثواني):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={delay}
                  onChange={(e) => setDelay(Number(e.target.value) || 1)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono text-center font-bold focus:outline-none focus:border-rose-500"
                />
                <span className="text-xs text-zinc-400 font-medium">ثواني</span>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 space-y-1.5">
              <label className="block text-xs font-bold text-zinc-300">
                إعادة المحاولة عند تعذر الوصول:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={maxRetries}
                  onChange={(e) => setMaxRetries(Number(e.target.value) || 1)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono text-center font-bold focus:outline-none focus:border-rose-500"
                />
                <span className="text-xs text-zinc-400 font-medium">مرات</span>
              </div>
            </div>
          </div>

          {/* Action Control Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {!isRunning ? (
              <button
                onClick={handleStart}
                disabled={!linksText.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all text-xs disabled:opacity-50"
              >
                <i className="fas fa-bolt text-xs" />
                <span>بدء الانضمام المتقدم</span>
              </button>
            ) : (
              <>
                {!isPaused ? (
                  <button
                    onClick={handlePause}
                    className="flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors"
                    title="إيقاف مؤقت — تبقى الإعدادات"
                  >
                    <i className="fas fa-pause text-xs" />
                    <span>إيقاف مؤقت</span>
                  </button>
                ) : (
                  <button
                    onClick={handleResume}
                    className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors"
                    title="استئناف من حيث توقف"
                  >
                    <i className="fas fa-play text-xs" />
                    <span>استئناف</span>
                  </button>
                )}

                <button
                  onClick={handleStop}
                  className="flex items-center justify-center gap-1.5 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors"
                  title="إيقاف نهائي"
                >
                  <i className="fas fa-stop-circle text-xs" />
                  <span>إيقاف</span>
                </button>

                <button
                  onClick={handleStop}
                  className="flex items-center justify-center gap-1.5 border border-red-500/50 text-red-400 hover:bg-red-500/10 font-bold py-2 px-3 rounded-xl text-xs transition-colors"
                  title="خروج يدوي"
                >
                  <i className="fas fa-sign-out-alt text-xs" />
                  <span>خروج يدوي</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Status & Statistics Section */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 space-y-3">
            <h4 className="text-xs font-bold text-zinc-200 flex items-center justify-between">
              <span>تقرير حالة الانضمام:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isRunning ? (isPaused ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300') : 'bg-zinc-800 text-zinc-400'
              }`}>
                {isRunning ? (isPaused ? '⏸️ متوقف مؤقتاً' : '⚡ جاري العمل...') : 'جاهز'}
              </span>
            </h4>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                <span>التقدم الإجمالي:</span>
                <span className="font-bold text-zinc-200">{percent}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-center">
                <span className="text-[10px] text-zinc-400 block">ناجح</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{counts.success}</span>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-center">
                <span className="text-[10px] text-zinc-400 block">مكرر / منضم سابقاً</span>
                <span className="text-sm font-bold text-sky-400 font-mono">{counts.already}</span>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-center">
                <span className="text-[10px] text-zinc-400 block">فشل / مقفلة</span>
                <span className="text-sm font-bold text-rose-400 font-mono">{counts.fail}</span>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-center">
                <span className="text-[10px] text-zinc-400 block">إجمالي الروابط</span>
                <span className="text-sm font-bold text-zinc-200 font-mono">{counts.total}</span>
              </div>
            </div>

            {/* Live Current Link Status */}
            {progressEvent?.url && (
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-2 text-[11px] space-y-1">
                <span className="text-zinc-500 block">الرابط الحالي:</span>
                <div className="font-mono text-zinc-300 truncate" dir="ltr">
                  {progressEvent.url}
                </div>
                {progressEvent.reason && (
                  <span className="text-xs text-amber-400 block font-semibold">
                    {progressEvent.reason}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
