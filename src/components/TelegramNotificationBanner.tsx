import React, { useEffect, useState, useRef } from 'react';
import { X, ExternalLink, BellOff, Volume2, ShieldAlert, PhoneCall, Pin, Send, Megaphone, Users, MessageSquare } from 'lucide-react';
import { ChatAvatar } from './ChatAvatar';

export interface TelegramNotificationItem {
  id: string;
  chat_id: string | number;
  title: string;
  sender_name?: string;
  sender_avatar?: string;
  chat_avatar?: string;
  text: string;
  type?: 'private' | 'group' | 'channel' | 'system' | 'security' | 'call' | 'pinned' | string;
  chat_type?: string;
  is_group?: boolean;
  is_channel?: boolean;
  date?: number;
  action_label?: string;
}

interface TelegramNotificationBannerProps {
  notification: TelegramNotificationItem | null;
  onOpenChat: (chatId: string | number) => void;
  onMuteChat?: (chatId: string | number) => void;
  onQuickReply?: (chatId: string | number, text: string) => void;
  onDismiss: () => void;
  lang?: 'ar' | 'en';
}

// Telegram Synthetic Audio Chime (Web Audio API)
function playTelegramChime(type: string = 'private') {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'call') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(480, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'security' || type === 'system') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.1); // A5
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      // Classic Telegram Chime: High crisp tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.12); // A6
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    }
  } catch (e) {
    // Ignore audio autoplay policy errors
  }
}

export const TelegramNotificationBanner: React.FC<TelegramNotificationBannerProps> = ({
  notification,
  onOpenChat,
  onMuteChat,
  onQuickReply,
  onDismiss,
  lang = 'ar',
}) => {
  const [visible, setVisible] = useState(false);
  const [quickReplyOpen, setQuickReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const replyInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (notification) {
      setVisible(true);
      setQuickReplyOpen(false);
      setReplyText('');

      // Play authentic sound chime
      playTelegramChime(notification.type);

      // Auto dismiss after 6 seconds unless user is typing a reply
      const timer = setTimeout(() => {
        if (!quickReplyOpen) {
          setVisible(false);
          setTimeout(onDismiss, 300);
        }
      }, 6000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [notification, onDismiss, quickReplyOpen]);

  if (!notification || !visible) return null;

  const isRtl = lang === 'ar';
  const notifType = notification.type || (notification.is_channel ? 'channel' : notification.is_group ? 'group' : 'private');

  // Category Configuration
  const categoryConfig: Record<string, { badge: React.ReactNode; border: string; accent: string; label: string }> = {
    private: {
      badge: <MessageSquare className="w-3 h-3 text-sky-400" />,
      border: 'border-sky-500/30',
      accent: 'from-sky-400 via-blue-500 to-indigo-500',
      label: lang === 'ar' ? 'رسالة خاصة' : 'Direct Message',
    },
    group: {
      badge: <Users className="w-3 h-3 text-emerald-400" />,
      border: 'border-emerald-500/30',
      accent: 'from-emerald-400 via-teal-500 to-cyan-500',
      label: lang === 'ar' ? 'مجموعة' : 'Group',
    },
    channel: {
      badge: <Megaphone className="w-3 h-3 text-purple-400" />,
      border: 'border-purple-500/30',
      accent: 'from-purple-400 via-violet-500 to-indigo-500',
      label: lang === 'ar' ? 'قناة' : 'Channel',
    },
    system: {
      badge: <ShieldAlert className="w-3 h-3 text-amber-400" />,
      border: 'border-amber-500/30',
      accent: 'from-amber-400 via-orange-500 to-rose-500',
      label: lang === 'ar' ? 'إشعار نظام' : 'System Alert',
    },
    security: {
      badge: <ShieldAlert className="w-3 h-3 text-rose-400" />,
      border: 'border-rose-500/40',
      accent: 'from-rose-500 via-red-500 to-amber-500',
      label: lang === 'ar' ? 'تنبيه أمان' : 'Security Alert',
    },
    call: {
      badge: <PhoneCall className="w-3 h-3 text-emerald-300" />,
      border: 'border-emerald-500/50',
      accent: 'from-emerald-400 via-green-500 to-teal-400',
      label: lang === 'ar' ? 'مكالمة واردة' : 'Incoming Call',
    },
    pinned: {
      badge: <Pin className="w-3 h-3 text-yellow-400" />,
      border: 'border-yellow-500/40',
      accent: 'from-yellow-400 via-amber-500 to-orange-400',
      label: lang === 'ar' ? 'رسالة مثبتة' : 'Pinned Message',
    },
  };

  const currentCategory = categoryConfig[notifType] || categoryConfig.private;

  const handleSendQuickReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    if (onQuickReply) {
      onQuickReply(notification.chat_id, replyText.trim());
    }
    setQuickReplyOpen(false);
    setReplyText('');
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-24px)] max-w-[420px] transition-all duration-300 ease-out transform"
      style={{
        animation: 'slideDownTelegramNotif 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div
        className={`bg-[#17212b]/95 backdrop-blur-xl border ${currentCategory.border} rounded-2xl shadow-2xl p-3.5 text-slate-100 flex flex-col gap-2.5 relative overflow-hidden`}
        style={{
          boxShadow: '0 16px 36px -6px rgba(0, 0, 0, 0.75), 0 8px 16px -4px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Animated Progress Accent Bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${currentCategory.accent}`}
          style={{
            animation: quickReplyOpen ? 'none' : 'shrinkNotifBar 6s linear forwards',
          }}
        />

        <div className="flex items-start gap-3">
          {/* Avatar with Status Indicator */}
          <div className="relative shrink-0">
            <ChatAvatar
              id={notification.chat_id}
              title={notification.title || notification.sender_name || 'تليجرام'}
              avatar={notification.chat_avatar || notification.sender_avatar}
              photo={notification.chat_avatar || notification.sender_avatar}
              type={notification.chat_type || (notification.is_channel ? 'channel' : notification.is_group ? 'group' : 'private')}
              size="md"
            />
            <div className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-700 rounded-full p-0.5 shadow-sm">
              {currentCategory.badge}
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 min-w-0 pr-0.5">
            <div className="flex items-center justify-between gap-1.5">
              <div className="font-semibold text-sm text-slate-100 truncate flex items-center gap-1.5">
                <span>{notification.title}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800/90 text-slate-400 font-normal">
                  {currentCategory.label}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-0.5">
                <Volume2 className="w-3 h-3 text-sky-400" />
                {lang === 'ar' ? 'الآن' : 'Now'}
              </span>
            </div>

            {/* Sender and Message Body Preview */}
            <div className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
              {notification.is_group && notification.sender_name && (
                <span className="font-semibold text-sky-300 ml-1">
                  {notification.sender_name}:
                </span>
              )}
              <span>{notification.text || (lang === 'ar' ? 'رسالة جديدة' : 'New message')}</span>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onDismiss, 300);
            }}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800/80 transition"
            title={lang === 'ar' ? 'إغلاق' : 'Dismiss'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Reply Form if Opened */}
        {quickReplyOpen ? (
          <form onSubmit={handleSendQuickReply} className="flex items-center gap-1.5 pt-1.5 border-t border-slate-800">
            <input
              ref={replyInputRef}
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={lang === 'ar' ? 'اكتب رداً سريعاً...' : 'Type a quick reply...'}
              className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-medium rounded-xl text-xs flex items-center gap-1 transition shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'إرسال' : 'Send'}</span>
            </button>
          </form>
        ) : (
          /* Action Buttons Bar */
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5">
              {onMuteChat && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMuteChat(notification.chat_id);
                    setVisible(false);
                    setTimeout(onDismiss, 300);
                  }}
                  className="px-2.5 py-1 text-[11px] rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition flex items-center gap-1"
                >
                  <BellOff className="w-3 h-3" />
                  <span>{lang === 'ar' ? 'كتم' : 'Mute'}</span>
                </button>
              )}

              {onQuickReply && notifType !== 'channel' && notifType !== 'system' && notifType !== 'security' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuickReplyOpen(true);
                  }}
                  className="px-2.5 py-1 text-[11px] rounded-lg text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 transition flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>{lang === 'ar' ? 'رد سريع' : 'Quick reply'}</span>
                </button>
              )}
            </div>

            <button
              onClick={() => {
                onOpenChat(notification.chat_id);
                setVisible(false);
                setTimeout(onDismiss, 300);
              }}
              className="px-3 py-1 text-[11px] font-medium rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition flex items-center gap-1 shadow-sm"
            >
              <ExternalLink className="w-3 h-3" />
              <span>{lang === 'ar' ? 'فتح المحادثة' : 'Open'}</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDownTelegramNotif {
          from {
            opacity: 0;
            transform: translate(-50%, -24px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }
        @keyframes shrinkNotifBar {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};
