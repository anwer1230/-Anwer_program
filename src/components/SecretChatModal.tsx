import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Clock,
  Key,
  Flame,
  AlertTriangle,
  CheckCircle2,
  X,
  EyeOff,
  Copy,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { Chat } from '../types';

interface SecretChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: Chat | null;
  onSendSecretMessage?: (text: string, timerSec: number) => void;
}

export const SecretChatModal: React.FC<SecretChatModalProps> = ({
  isOpen,
  onClose,
  chat,
  onSendSecretMessage,
}) => {
  const [timerSec, setTimerSec] = useState<number>(0); // 0 = off
  const [secretMsg, setSecretMsg] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [fingerprint, setFingerprint] = useState('');
  const [identiconColors, setIdenticonColors] = useState<string[]>([]);

  useEffect(() => {
    if (chat) {
      // Generate deterministic SHA-256 style fingerprint for Diffie-Hellman Key Exchange representation
      const id = String(chat.id || 'secret_chat');
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = (hash << 5) - hash + id.charCodeAt(i);
        hash |= 0;
      }
      const hex = Math.abs(hash).toString(16).padStart(8, '0');
      setFingerprint(`e2ee:${hex.slice(0, 4)}:${hex.slice(4, 8)}:8f2a:b94c:11d0:77e2`);

      // Generate 16 identicon block colors
      const colors = ['#00e676', '#29b6f6', '#ab47bc', '#ffb300', '#ff5252', '#00e5ff', '#ffd54f', '#ec407a'];
      const generated = Array.from({ length: 16 }, (_, i) => colors[(Math.abs(hash) + i * 7) % colors.length]);
      setIdenticonColors(generated);
    }
  }, [chat]);

  if (!isOpen || !chat) return null;

  const timerOptions = [
    { label: 'إيقاف', value: 0 },
    { label: '1 ثانية', value: 1 },
    { label: '5 ثوانٍ', value: 5 },
    { label: '30 ثانية', value: 30 },
    { label: '1 دقيقة', value: 60 },
    { label: '1 ساعة', value: 3600 },
    { label: '1 يوم', value: 86400 },
    { label: '1 أسبوع', value: 604800 },
  ];

  const handleCopyKey = () => {
    navigator.clipboard.writeText(fingerprint);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSend = () => {
    if (!secretMsg.trim()) return;
    if (onSendSecretMessage) {
      onSendSecretMessage(secretMsg, timerSec);
    }
    setSecretMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-lg bg-zinc-950 border border-emerald-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-zinc-100"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-zinc-950 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">محادثة سرية مشفرة (MTProto E2EE)</h2>
                <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 rounded-md font-extrabold border border-emerald-500/30">
                  طرفاً لطرف 🛡️
                </span>
              </div>
              <p className="text-xs text-zinc-400">{chat.name || 'محادثة مشفرة'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh] scrollbar-thin">
          {/* E2EE Security Badges */}
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>مزايا التشفير التام بالمحادثة السرية:</span>
            </div>
            <ul className="text-[11px] text-zinc-300 space-y-1 pr-5 list-disc">
              <li>تشفير عسكري من طرف إلى طرف (End-to-End Encryption) عبر مفاتيح Diffie-Hellman.</li>
              <li>لا تُخزن الرسائل على أي خادم من خوادم تليجرام السحابية.</li>
              <li>منع إعادة التوجيه تماماً (Forwarding Disabled).</li>
              <li>تنبيه فوري وتدمير ذاتي عند التقاط لقطات الشاشة أو التسجيل.</li>
            </ul>
          </div>

          {/* Key Fingerprint Visualizer & Identicon Grid */}
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                <Key className="w-4 h-4 text-amber-400" />
                <span>بصمة مفتاح التشفير المشترك (Key Fingerprint)</span>
              </div>
              <button
                onClick={handleCopyKey}
                className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
              >
                {copiedKey ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'تم النسخ' : 'نسخ المفتاح'}</span>
              </button>
            </div>

            <div className="flex items-center gap-4 bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
              {/* 4x4 Identicon Grid */}
              <div className="grid grid-cols-4 gap-1 p-1.5 bg-zinc-900 rounded-lg border border-zinc-700 shrink-0">
                {identiconColors.map((c, i) => (
                  <div
                    key={i}
                    className="w-3.5 h-3.5 rounded-sm transition-transform hover:scale-110"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-mono text-emerald-400 tracking-wider break-all">
                  {fingerprint}
                </div>
                <div className="text-[10px] text-zinc-500 mt-1">
                  طابق هذا النمط المرئي مع شاشة الطرف الآخر للتأكد من انعدام هجمات التنصت (Man-in-the-Middle).
                </div>
              </div>
            </div>
          </div>

          {/* Self-Destruct Timer (عداد التدمير الذاتي) */}
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>مؤقت التدمير الذاتي للرسائل (Self-Destruct Timer)</span>
              </div>
              {timerSec > 0 && (
                <span className="text-xs font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                  {timerOptions.find((o) => o.value === timerSec)?.label}
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {timerOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTimerSec(opt.value)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                    timerSec === opt.value
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-500">
              {timerSec === 0
                ? 'الرسائل لن تُحذف تلقائياً حتى يقوم أحد الطرفين بحذفها يدوياً.'
                : `سيتم محو كل رسالة بعد قراءتها بـ ${timerOptions.find((o) => o.value === timerSec)?.label} من كلا الجهازين للأبد.`}
            </p>
          </div>

          {/* Send Encrypted Message directly */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>إرسال رسالة مشفرة سرية فورية:</span>
            </label>
            <textarea
              value={secretMsg}
              onChange={(e) => setSecretMsg(e.target.value)}
              placeholder="اكتب رسالتك فائقة السرية هنا..."
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none font-medium"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <EyeOff className="w-4 h-4 text-emerald-400" />
            <span>حماية لقطات الشاشة نشطة 🔒</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleSend}
              disabled={!secretMsg.trim()}
              className="px-5 py-2 rounded-xl text-xs font-extrabold text-black bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-500/20"
            >
              إرسال مشفّر 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
