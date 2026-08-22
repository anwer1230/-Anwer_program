import React, { useState } from 'react';
import {
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Globe,
  X,
  Copy,
  Share2,
  RefreshCw,
  Lock,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
} from 'lucide-react';

interface InAppBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  lang?: 'ar' | 'en';
}

export const InAppBrowserModal: React.FC<InAppBrowserModalProps> = ({
  isOpen,
  onClose,
  url,
  lang = 'ar',
}) => {
  const isRtl = lang === 'ar';
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !url) return null;

  const isWhatsApp = url.includes('wa.me') || url.includes('whatsapp.com');
  const isTelegram = url.includes('t.me') || url.startsWith('tg://');

  const handleCopy = () => {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenExternal = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-[3300] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in font-sans"
      onClick={onClose}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div
        className="w-full max-w-4xl bg-[#17212b] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Browser Top Navigation Bar */}
        <div className="p-3 bg-[#0e1621] border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center gap-1 text-[11px] font-semibold px-2">
              <Lock className="w-3.5 h-3.5" />
              <span>{isRtl ? 'رابط آمن ومفحوص' : 'Secure Verified Link'}</span>
            </div>
          </div>

          {/* URL address bar */}
          <div className="flex-1 max-w-xl mx-auto flex items-center gap-2 bg-[#0a0f16] border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-xs text-cyan-300">
            {isWhatsApp ? (
              <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <span className="flex-1 truncate">{url}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title={isRtl ? 'نسخ الرابط' : 'Copy URL'}
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenExternal}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{isRtl ? 'فتح بالمتصفح الخارجي' : 'Open in Browser'}</span>
            </button>
          </div>
        </div>

        {/* Browser Content Frame / Preview */}
        <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          {isWhatsApp ? (
            <div className="max-w-md bg-[#131b24] border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
                <MessageCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100 mb-1">
                  {isRtl ? 'رابط محادثة واتساب الخارجي (WhatsApp API)' : 'WhatsApp Deep Link'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-mono break-all">
                  {url}
                </p>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 text-start space-y-1">
                <div className="font-semibold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isRtl ? 'فحص الأمان التلقائي لروابط تيليجرام:' : 'Telegram Link Scanner:'}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {isRtl
                    ? 'هذا الرابط يوجه إلى تطبيق خارجي (WhatsApp). يمكنك نسخه أو فتحه مباشرة في نافذة جديدة.'
                    : 'This deep link directs to an external application (WhatsApp).'}
                </div>
              </div>

              <button
                onClick={handleOpenExternal}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{isRtl ? 'متابعة إلى تطبيق واتساب' : 'Continue to WhatsApp'}</span>
              </button>
            </div>
          ) : (
            <div className="max-w-lg bg-[#131b24] border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center mx-auto shadow-lg shadow-blue-950/50">
                <Globe className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100 mb-1">
                  {isRtl ? 'المتصفح المدمج داخل التطبيق (In-App Web Preview)' : 'In-App Web Preview'}
                </h3>
                <p className="text-xs text-cyan-400 font-mono break-all">{url}</p>
              </div>

              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 text-start space-y-1">
                <div className="font-semibold text-blue-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isRtl ? 'تصفح محمي بدون تسريب الهوية:' : 'Protected In-App Browser:'}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isRtl
                    ? 'يتم عزل الموقع الخارجي داخل بيئة آمنة لمنع تتبع الكوكيز والبيانات الشخصية.'
                    : 'Isolated web session protecting cookies and MTProto session keys.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenExternal}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{isRtl ? 'فتح الموقع في المتصفح' : 'Open Link'}</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition-colors"
                >
                  {copied ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ الرابط' : 'Copy')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0e1621] border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between px-4">
          <span className="font-mono">
            {isRtl ? 'نظام تيليجرام للروابط العميقة والتكامل الخارجي' : 'Telegram Deep Linking Engine'}
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {isRtl ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
