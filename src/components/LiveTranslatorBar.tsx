import React, { useState } from 'react';
import {
  Languages,
  ArrowRightLeft,
  Sparkles,
  Check,
  X,
  Volume2,
  Mic,
  ChevronDown,
} from 'lucide-react';

interface LiveTranslatorBarProps {
  onTranslateChat?: (targetLang: string) => void;
  onClose?: () => void;
}

export const LiveTranslatorBar: React.FC<LiveTranslatorBarProps> = ({
  onTranslateChat,
  onClose,
}) => {
  const [targetLang, setTargetLang] = useState('ar');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translated, setTranslated] = useState(false);

  const languages = [
    { code: 'ar', label: 'العربية' },
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Русский' },
    { code: 'tr', label: 'Türkçe' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'es', label: 'Español' },
  ];

  const handleTranslate = () => {
    setIsTranslating(true);
    setTimeout(() => {
      setIsTranslating(false);
      setTranslated(true);
      if (onTranslateChat) onTranslateChat(targetLang);
    }, 600);
  };

  return (
    <div className="w-full bg-gradient-to-r from-blue-950/80 via-zinc-900 to-indigo-950/80 border-b border-blue-500/20 px-3 sm:px-4 py-2 flex items-center justify-between text-xs text-zinc-200 shadow-md backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
          <Languages className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-bold text-white shrink-0 hidden sm:inline">الترجمة الفورية للرسائل:</span>
          <span className="text-[11px] text-zinc-400">ترجمة إلى:</span>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 text-blue-300 font-bold rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-zinc-900 text-white">
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleTranslate}
          disabled={isTranslating}
          className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg transition-all shadow-sm"
        >
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>{isTranslating ? 'جاري الترجمة...' : translated ? 'مترجم ✅' : 'ترجمة المحادثة'}</span>
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors"
            title="إخفاء شريط الترجمة"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
