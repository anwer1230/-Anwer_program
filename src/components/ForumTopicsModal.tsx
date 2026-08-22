import React, { useState } from 'react';
import {
  MessageSquare,
  Hash,
  Plus,
  Pin,
  Lock,
  Search,
  X,
  Sparkles,
  ChevronLeft,
  Bell,
  BellOff,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { Chat } from '../types';

export interface ForumTopic {
  id: number;
  title: string;
  iconEmoji: string;
  iconColor: string;
  messagesCount: number;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
  isPinned?: boolean;
  isClosed?: boolean;
}

interface ForumTopicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: Chat | null;
  onSelectTopic?: (topic: ForumTopic) => void;
}

export const ForumTopicsModal: React.FC<ForumTopicsModalProps> = ({
  isOpen,
  onClose,
  chat,
  onSelectTopic,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newEmoji, setNewEmoji] = useState('💬');
  const [newColor, setNewColor] = useState('#29b6f6');

  const [topics, setTopics] = useState<ForumTopic[]>([
    {
      id: 1,
      title: '📌 الإعلانات والتعليمات الرسمية',
      iconEmoji: '📢',
      iconColor: '#ffb300',
      messagesCount: 142,
      lastMessage: 'تم تحديث سياسة المجموعة وضوابط المشاركة الأكاديمية.',
      lastMessageTime: '10:45 ص',
      unreadCount: 0,
      isPinned: true,
    },
    {
      id: 2,
      title: '💬 النقاش العام والاستفسارات',
      iconEmoji: '💬',
      iconColor: '#29b6f6',
      messagesCount: 890,
      lastMessage: 'هل يمكن الاستفسار عن طريقة تصدير الملفات المنسقة؟',
      lastMessageTime: '11:15 ص',
      unreadCount: 4,
      isPinned: true,
    },
    {
      id: 3,
      title: '🎓 الأبحاث والرسائل العلمية',
      iconEmoji: '🎓',
      iconColor: '#ab47bc',
      messagesCount: 412,
      lastMessage: 'تم رفع نموذج دراسة الجدوى ومخطط الإحصاء.',
      lastMessageTime: 'أمس',
      unreadCount: 1,
    },
    {
      id: 4,
      title: '💡 الاقتراحات والتطوير',
      iconEmoji: '💡',
      iconColor: '#00e676',
      messagesCount: 78,
      lastMessage: 'نقترح إضافة دعم للمزيد من صيغ التحليل.',
      lastMessageTime: '14/08',
      unreadCount: 0,
    },
    {
      id: 5,
      title: '🔒 مواضيع مخصصة للمشرفين',
      iconEmoji: '🛡️',
      iconColor: '#ff5252',
      messagesCount: 35,
      lastMessage: 'سجل حظر الحسابات المشبوهة وحماية السيرفر.',
      lastMessageTime: '12/08',
      unreadCount: 0,
      isClosed: true,
    },
  ]);

  if (!isOpen || !chat) return null;

  const emojiList = ['💬', '📢', '🎓', '💡', '🛡️', '⚡', '🚀', '📊', '🔥', '🌟', '📚', '🤖'];
  const colorList = ['#29b6f6', '#ffb300', '#00e676', '#ab47bc', '#ff5252', '#00e5ff', '#ec407a', '#7c4dff'];

  const filteredTopics = topics.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTopic = () => {
    if (!newTitle.trim()) return;
    const newTopicItem: ForumTopic = {
      id: Date.now(),
      title: `${newEmoji} ${newTitle.trim()}`,
      iconEmoji: newEmoji,
      iconColor: newColor,
      messagesCount: 0,
      lastMessage: 'موضوع جديد تم إنشاؤه للتو.',
      lastMessageTime: 'الآن',
      unreadCount: 0,
    };
    setTopics((prev) => [newTopicItem, ...prev]);
    setNewTitle('');
    setIsCreatingTopic(false);
  };

  const handleSelect = (topic: ForumTopic) => {
    if (onSelectTopic) onSelectTopic(topic);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-zinc-100 max-h-[85vh]"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">موضوعات المنتدى (Topics)</h2>
                <span className="px-2 py-0.5 text-[10px] bg-blue-500/20 text-blue-300 rounded-md font-bold">
                  {topics.length} موضوعاً
                </span>
              </div>
              <p className="text-xs text-zinc-400">{chat.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingTopic(!isCreatingTopic)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>موضوع جديد</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Create Topic Drawer */}
        {isCreatingTopic && (
          <div className="p-4 bg-zinc-900/90 border-b border-zinc-800 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>إنشاء موضوع جديد داخل المجموعة:</span>
              </span>
              <button
                onClick={() => setIsCreatingTopic(false)}
                className="text-[11px] text-zinc-400 hover:text-white"
              >
                إلغاء
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="عنوان الموضوع (مثال: بحوث الماجستير...)"
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleCreateTopic}
                disabled={!newTitle.trim()}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-extrabold text-xs rounded-xl transition-all"
              >
                إنشاء
              </button>
            </div>

            {/* Emoji and Color Selectors */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1 overflow-x-auto py-1">
                {emojiList.map((em) => (
                  <button
                    key={em}
                    onClick={() => setNewEmoji(em)}
                    className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                      newEmoji === em ? 'bg-zinc-700 scale-110 shadow' : 'hover:bg-zinc-800'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {colorList.map((col) => (
                  <button
                    key={col}
                    onClick={() => setNewColor(col)}
                    className={`w-4 h-4 rounded-full transition-transform ${
                      newColor === col ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-zinc-900' : ''
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="p-3 bg-zinc-900/40 border-b border-zinc-800">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث في موضوعات المنتدى..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
            />
          </div>
        </div>

        {/* Topics List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-zinc-800/40 scrollbar-thin">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              onClick={() => handleSelect(topic)}
              className="pt-2 first:pt-0 group flex items-start gap-3 p-3 rounded-2xl hover:bg-zinc-900 cursor-pointer transition-all border border-transparent hover:border-zinc-800"
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 shadow-inner border"
                style={{
                  backgroundColor: `${topic.iconColor}15`,
                  borderColor: `${topic.iconColor}35`,
                }}
              >
                {topic.iconEmoji}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {topic.isPinned && <Pin className="w-3 h-3 text-amber-400 shrink-0" />}
                    {topic.isClosed && <Lock className="w-3 h-3 text-rose-400 shrink-0" />}
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-100 truncate group-hover:text-blue-400 transition-colors">
                      {topic.title}
                    </h3>
                  </div>
                  <span className="text-[10px] text-zinc-500 shrink-0">{topic.lastMessageTime}</span>
                </div>

                <p className="text-[11px] text-zinc-400 truncate mt-0.5">{topic.lastMessage}</p>

                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-zinc-500 font-medium">
                  <span>{topic.messagesCount} رسالة</span>
                  {topic.unreadCount !== undefined && topic.unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[9px]">
                      {topic.unreadCount} جديدة
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
