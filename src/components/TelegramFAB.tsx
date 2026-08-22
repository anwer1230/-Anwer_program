import React, { useState } from 'react';
import {
  Pencil,
  Users,
  Lock,
  Megaphone,
  UserPlus,
  X,
  Sparkles,
} from 'lucide-react';

interface TelegramFABProps {
  onNewGroup: () => void;
  onNewSecretChat: () => void;
  onNewChannel: () => void;
  onNewContact: () => void;
  lang?: string;
}

export const TelegramFAB: React.FC<TelegramFABProps> = ({
  onNewGroup,
  onNewSecretChat,
  onNewChannel,
  onNewContact,
  lang = 'ar',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (cb: () => void) => {
    setIsOpen(false);
    cb();
  };

  return (
    <div className="absolute bottom-6 left-6 z-40 flex flex-col items-start gap-3 select-none">
      {/* Speed-Dial Menu Items (Sliding from bottom) */}
      {isOpen && (
        <div className="flex flex-col items-start gap-2.5 mb-1 animate-fadeIn" dir="rtl">
          {/* New Channel */}
          <div
            onClick={() => handleAction(onNewChannel)}
            className="flex items-center gap-3 bg-zinc-900/95 hover:bg-zinc-800 border border-zinc-700/80 px-3.5 py-2 rounded-2xl cursor-pointer shadow-xl backdrop-blur-md transition-all transform hover:scale-105 active:scale-95 group text-zinc-100"
          >
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-inner group-hover:bg-amber-500 group-hover:text-black transition-colors">
              <Megaphone className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold whitespace-nowrap">
              {lang === 'ar' ? 'قناة جديدة' : 'New Channel'}
            </span>
          </div>

          {/* New Secret Chat */}
          <div
            onClick={() => handleAction(onNewSecretChat)}
            className="flex items-center gap-3 bg-zinc-900/95 hover:bg-zinc-800 border border-zinc-700/80 px-3.5 py-2 rounded-2xl cursor-pointer shadow-xl backdrop-blur-md transition-all transform hover:scale-105 active:scale-95 group text-zinc-100"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner group-hover:bg-emerald-500 group-hover:text-black transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold whitespace-nowrap">
              {lang === 'ar' ? 'محادثة سرية جديدة (E2EE)' : 'New Secret Chat'}
            </span>
          </div>

          {/* New Group */}
          <div
            onClick={() => handleAction(onNewGroup)}
            className="flex items-center gap-3 bg-zinc-900/95 hover:bg-zinc-800 border border-zinc-700/80 px-3.5 py-2 rounded-2xl cursor-pointer shadow-xl backdrop-blur-md transition-all transform hover:scale-105 active:scale-95 group text-zinc-100"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shadow-inner group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold whitespace-nowrap">
              {lang === 'ar' ? 'مجموعة جديدة' : 'New Group'}
            </span>
          </div>

          {/* New Contact */}
          <div
            onClick={() => handleAction(onNewContact)}
            className="flex items-center gap-3 bg-zinc-900/95 hover:bg-zinc-800 border border-zinc-700/80 px-3.5 py-2 rounded-2xl cursor-pointer shadow-xl backdrop-blur-md transition-all transform hover:scale-105 active:scale-95 group text-zinc-100"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <UserPlus className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold whitespace-nowrap">
              {lang === 'ar' ? 'جهة اتصال جديدة' : 'New Contact'}
            </span>
          </div>
        </div>
      )}

      {/* Main Telegram Android Circular Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-90 ${
          isOpen
            ? 'bg-zinc-800 text-white rotate-90 border border-zinc-600'
            : 'bg-[#2AABEE] hover:bg-[#1E96D6] text-white shadow-blue-500/30'
        }`}
        title={lang === 'ar' ? 'إنشاء محادثة أو مجموعة جديدة' : 'New Chat / Group'}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Pencil className="w-6 h-6" />}
      </button>
    </div>
  );
};
