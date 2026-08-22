import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
  Music,
  Mic,
  MessageSquare,
  Calendar,
  User,
  ArrowRight,
} from 'lucide-react';
import { MessageItem, ChatItem } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  chats: ChatItem[];
  messages: Record<string, MessageItem[]>;
  onSelectChat: (chatId: string | number) => void;
  lang?: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  chats,
  messages,
  onSelectChat,
  lang = 'ar',
}) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'chats' | 'media' | 'links' | 'files' | 'music' | 'voice'>('all');

  const tabs = [
    { id: 'all', label: lang === 'ar' ? 'الكل' : 'All', icon: Search },
    { id: 'chats', label: lang === 'ar' ? 'المحادثات' : 'Chats', icon: MessageSquare },
    { id: 'media', label: lang === 'ar' ? 'الوسائط' : 'Media', icon: ImageIcon },
    { id: 'links', label: lang === 'ar' ? 'الروابط' : 'Links', icon: LinkIcon },
    { id: 'files', label: lang === 'ar' ? 'الملفات' : 'Files', icon: FileText },
    { id: 'music', label: lang === 'ar' ? 'الموسيقى' : 'Music', icon: Music },
    { id: 'voice', label: lang === 'ar' ? 'الصوتيات' : 'Voice', icon: Mic },
  ];

  // Flatten all messages for searching
  const allMessages = useMemo(() => {
    const list: (MessageItem & { chatTitle?: string })[] = [];
    Object.entries(messages).forEach(([chatId, msgs]) => {
      const chat = chats.find((c) => String(c.id) === String(chatId));
      msgs.forEach((m) => {
        list.push({ ...m, chatTitle: chat?.title || chat?.name || 'محادثة' });
      });
    });
    return list;
  }, [messages, chats]);

  // Filtered chats
  const filteredChats = useMemo(() => {
    if (!query.trim()) return chats.slice(0, 8);
    const q = query.toLowerCase();
    return chats.filter(
      (c) =>
        (c.title || '').toLowerCase().includes(q) ||
        (c.name || '').toLowerCase().includes(q) ||
        (c.username || '').toLowerCase().includes(q)
    );
  }, [chats, query]);

  // Filtered messages by tab & query
  const filteredMessages = useMemo(() => {
    if (!query.trim() && activeTab === 'all') return [];
    const q = query.toLowerCase();
    return allMessages.filter((m) => {
      // Tab filter
      if (activeTab === 'media' && m.type !== 'photo' && !m.media) return false;
      if (activeTab === 'links' && (!m.text || !m.text.includes('http'))) return false;
      if (activeTab === 'files' && m.type !== 'document' && !(m.media && !m.media.endsWith('.jpg') && !m.media.endsWith('.png'))) return false;
      if (activeTab === 'music' && m.type !== 'audio') return false;
      if (activeTab === 'voice' && m.type !== 'voice') return false;

      // Query filter
      if (!query.trim()) return true;
      return (
        (m.text || '').toLowerCase().includes(q) ||
        (m.sender_name || '').toLowerCase().includes(q) ||
        (m.chatTitle || '').toLowerCase().includes(q)
      );
    });
  }, [allMessages, query, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9995] flex items-start justify-center bg-black/70 backdrop-blur-md animate-fadeIn p-0 sm:p-4" dir="rtl">
      <div className="w-full max-w-2xl h-full sm:h-[88vh] bg-zinc-950 sm:border sm:border-zinc-800 sm:rounded-3xl shadow-2xl flex flex-col text-zinc-100 overflow-hidden">
        {/* Top Search Bar (Telegram Android Material Search) */}
        <div className="p-3 sm:p-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-2.5 bg-zinc-950 border border-zinc-700/70 focus-within:border-[#2AABEE] rounded-2xl px-3.5 py-2 transition-all">
            <Search className="w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder={lang === 'ar' ? 'بحث في الرسائل، الوسائط، الروابط، والمحادثات...' : 'Search messages, media, links...'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="bg-transparent border-none text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none w-full"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Telegram Android Filter Tabs */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900/50 border-b border-zinc-800 overflow-x-auto scrollbar-thin">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#2AABEE] text-white shadow-md shadow-blue-500/25'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 scrollbar-thin">
          {/* Chats Section */}
          {(activeTab === 'all' || activeTab === 'chats') && filteredChats.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider px-2">
                {lang === 'ar' ? 'المحادثات وجهات الاتصال' : 'Chats & Contacts'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      onSelectChat(chat.id);
                      onClose();
                    }}
                    className="p-2.5 bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800/80 rounded-2xl flex items-center gap-3 cursor-pointer transition-all hover:border-zinc-700"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center shrink-0">
                      {chat.photo ? <img src={chat.photo} alt="" className="w-full h-full rounded-full object-cover" /> : (chat.title || chat.name || 'TG')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{chat.title || chat.name}</div>
                      <div className="text-[10px] text-zinc-400 truncate">{chat.username ? `@${chat.username}` : (chat.type || 'chat')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages & Media Section */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider px-2">
              {lang === 'ar' ? `الرسائل والنتائج (${filteredMessages.length})` : `Messages (${filteredMessages.length})`}
            </span>

            {filteredMessages.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                {query ? 'لا توجد رسائل مطابقة لبحثك' : 'ابدأ بكتابة كلمة للبحث عنها في كافة المحادثات'}
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => {
                      onSelectChat(msg.chat_id);
                      onClose();
                    }}
                    className="p-3 bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800/80 rounded-2xl cursor-pointer transition-all hover:border-zinc-700 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#2AABEE]">{msg.chatTitle}</span>
                      <span className="text-zinc-500">{new Date(msg.date * 1000).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs text-zinc-200 line-clamp-2">
                      <span className="font-semibold text-zinc-400">{msg.sender_name}: </span>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
