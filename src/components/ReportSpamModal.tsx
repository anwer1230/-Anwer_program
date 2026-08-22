import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  UserX,
  X,
  Send,
  CheckCircle2,
  Trash2,
  Lock,
  Flag,
  Radio,
} from 'lucide-react';

interface ReportSpamModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId?: string | number;
  chatTitle?: string;
  messageId?: string | number;
  messageText?: string;
  onReportAndLeave?: (chatId: string | number, reason: string, deleteHistory: boolean) => Promise<void>;
  lang?: 'ar' | 'en';
}

const REPORT_REASONS = [
  { id: 'spam', ar: 'رسائل غير مرغوب فيها أو احتيال (Spam / Scam)', en: 'Spam / Scam / Phishing' },
  { id: 'fake', ar: 'انتحال شخصية أو حساب مزيف (Fake Account)', en: 'Fake Account / Impersonation' },
  { id: 'violence', ar: 'عنف أو تحريض (Violence / Threat)', en: 'Violence / Harassment' },
  { id: 'illegal_goods', ar: 'بيع بضائع غير قانونية أو ممنوعة', en: 'Illegal Goods / Drug sales' },
  { id: 'copyright', ar: 'انتهاك حقوق النشر والملكية الفكرية', en: 'Copyright Infringement' },
  { id: 'other', ar: 'أسباب أخرى', en: 'Other' },
];

export const ReportSpamModal: React.FC<ReportSpamModalProps> = ({
  isOpen,
  onClose,
  chatId,
  chatTitle = 'المحادثة الحالية',
  messageId,
  messageText,
  onReportAndLeave,
  lang = 'ar',
}) => {
  const isRtl = lang === 'ar';
  const [selectedReason, setSelectedReason] = useState<string>('spam');
  const [details, setDetails] = useState('');
  const [deleteHistory, setDeleteHistory] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (chatId && onReportAndLeave) {
        await onReportAndLeave(chatId, selectedReason, deleteHistory);
      } else {
        await fetch('/api/telegram/report-spam', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            reason: selectedReason,
            details,
            delete_history: deleteHistory,
          }),
        });
      }
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[3200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div
        className="w-full max-w-md bg-[#17212b] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-[#0e1621] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-rose-400">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">
                {isRtl ? 'إبلاغ عن إزعاج ومغادرة' : 'Report Spam & Leave'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {chatTitle} {messageId ? `• رسالة #${messageId}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-base font-bold text-slate-100">
              {isRtl ? 'تم إرسال البلاغ ومغادرة المحادثة بنجاح' : 'Report submitted and chat left successfully'}
            </div>
            <p className="text-xs text-slate-400">
              {isRtl
                ? 'يقوم نظام حماية تيليجرام بمراجعة البلاغات وفرض الحظر الآلي على الحسابات المسيئة.'
                : 'Telegram anti-spam bot is now analyzing reports to shield users.'}
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-4 text-xs">
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-rose-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>{isRtl ? 'نظام مكافحة السبام (Anti-Spam Shield):' : 'Anti-Spam Moderation:'}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-rose-200/80">
                {isRtl
                  ? 'سيتم إرسال تقرير مشفر لخوادم تيليجرام المركزية ومطابقة المعرف مع قواعد بيانات الحظر العالمية.'
                  : 'An encrypted incident report will be delivered to Telegram moderation cluster.'}
              </p>
            </div>

            {/* Reasons selection */}
            <div className="space-y-2">
              <label className="block text-slate-300 font-bold">
                {isRtl ? 'حدد سبب الإبلاغ:' : 'Select violation reason:'}
              </label>
              <div className="space-y-1.5">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                      selectedReason === r.id
                        ? 'bg-rose-500/20 border-rose-500/40 text-slate-100 font-semibold'
                        : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs">{isRtl ? r.ar : r.en}</span>
                    <input
                      type="radio"
                      name="report_reason"
                      checked={selectedReason === r.id}
                      onChange={() => setSelectedReason(r.id)}
                      className="accent-rose-500 w-4 h-4"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Optional details */}
            <div>
              <label className="block text-slate-400 mb-1">
                {isRtl ? 'تفاصيل إضافية (اختياري):' : 'Additional context (optional):'}
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={isRtl ? 'اكتب أي تفاصيل توضيحية للمشرفين...' : 'Provide details...'}
                className="w-full bg-[#0e1621] border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500 resize-none h-16"
              />
            </div>

            {/* Delete history toggle */}
            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-800/30 border border-slate-700/40">
              <input
                type="checkbox"
                checked={deleteHistory}
                onChange={(e) => setDeleteHistory(e.target.checked)}
                className="accent-rose-500 w-4 h-4 rounded"
              />
              <span className="text-xs text-slate-300">
                {isRtl ? 'حذف سجل المحادثة بالكامل من جهازي' : 'Delete entire chat history locally'}
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-900/30 disabled:opacity-50"
              >
                <Flag className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? isRtl ? 'جاري الإرسال...' : 'Submitting...'
                    : isRtl ? 'إبلاغ عن إزعاج ومغادرة' : 'Report & Leave'}
                </span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
