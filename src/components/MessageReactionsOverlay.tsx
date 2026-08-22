import React from 'react';
import {
  Reply,
  Copy,
  Share2,
  Pin,
  Globe,
  Volume2,
  Star,
  Trash2,
  Check,
} from 'lucide-react';
import { MessageItem } from '../types';

interface MessageReactionsOverlayProps {
  message: MessageItem;
  position: { x: number; y: number };
  onClose: () => void;
  onReact: (emoji: string) => void;
  onReply: () => void;
  onCopy: () => void;
  onForward: () => void;
  onPin: () => void;
  onTranslate: () => void;
  onTTS: () => void;
  onStarReact: () => void;
  onDelete: () => void;
  lang?: string;
}

export const MessageReactionsOverlay: React.FC<MessageReactionsOverlayProps> = ({
  message,
  position,
  onClose,
  onReact,
  onReply,
  onCopy,
  onForward,
  onPin,
  onTranslate,
  onTTS,
  onStarReact,
  onDelete,
  lang = 'ar',
}) => {
  const popularReactions = ['❤️', '👍', '🔥', '🎉', '👏', '😢', '⭐', '🚀', '😍', '⚡', '💯'];

  return (
    <div
      className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-zinc-950 border border-zinc-800 rounded-3xl p-3 shadow-2xl space-y-3 w-80 animate-scaleUp text-zinc-100"
        style={{
          maxWidth: '90vw',
        }}
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Telegram Floating Quick Emoji Reactions Pill Bar */}
        <div className="flex items-center gap-1.5 p-1.5 bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-x-auto scrollbar-thin">
          {popularReactions.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onReact(emoji);
                onClose();
              }}
              className="text-lg hover:scale-125 active:scale-95 transition-transform p-1 rounded-xl hover:bg-zinc-800 shrink-0"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Telegram Android Message Context Actions Menu */}
        <div className="space-y-1 text-xs font-bold">
          <button
            onClick={() => {
              onReply();
              onClose();
            }}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900 text-zinc-200 transition-colors text-right"
          >
            <Reply className="w-4 h-4 text-blue-400" />
            <span>{lang === 'ar' ? 'الرد على الرسالة' : 'Reply'}</span>
          </button>

          <button
            onClick={() => {
              onCopy();
              onClose();
            }}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900 text-zinc-200 transition-colors text-right"
          >
            <Copy className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'ar' ? 'نسخ النص' : 'Copy Text'}</span>
          </button>

          <button
            onClick={() => {
              onForward();
              onClose();
            }}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900 text-zinc-200 transition-colors text-right"
          >
            <Share2 className="w-4 h-4 text-indigo-400" />
            <span>{lang === 'ar' ? 'إعادة توجيه (Forward)' : 'Forward'}</span>
          </button>

          <button
            onClick={() => {
              onPin();
              onClose();
            }}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900 text-zinc-200 transition-colors text-right"
          >
            <Pin className="w-4 h-4 text-amber-400" />
            <span>{lang === 'ar' ? 'تثبيت الرسالة' : 'Pin Message'}</span>
          </button>

          <button
            onClick={() => {
              onTranslate();
              onClose();
            }}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900 text-zinc-200 transition-colors text-right"
          >
            <Globe className="w-4 h-4 text-sky-400" />
            <span>{lang === 'ar' ? 'ترجمة الرسالة فورياً' : 'Translate'}</span>
          </button>

          <button
            onClick={() => {
              onTTS();
              onClose();
            }}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900 text-zinc-200 transition-colors text-right"
          >
            <Volume2 className="w-4 h-4 text-purple-400" />
            <span>{lang === 'ar' ? 'قراءة صوتية (Text-to-Speech)' : 'Read Aloud'}</span>
          </button>

          <button
            onClick={() => {
              onStarReact();
              onClose();
            }}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900 text-amber-300 transition-colors text-right"
          >
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{lang === 'ar' ? 'إرسال نجوم تليجرام (Stars)' : 'Send Stars Reaction'}</span>
          </button>

          <div className="h-px bg-zinc-800/80 my-1" />

          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-rose-500/20 text-rose-400 transition-colors text-right"
          >
            <Trash2 className="w-4 h-4" />
            <span>{lang === 'ar' ? 'حذف الرسالة' : 'Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
