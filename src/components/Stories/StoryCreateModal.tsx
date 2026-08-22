import React, { useState } from 'react';
import {
  Camera,
  Image as ImageIcon,
  Sparkles,
  Smile,
  Clock,
  Lock,
  Globe,
  Users,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  Share2,
} from 'lucide-react';
import { TelegramStory } from '../../types';

interface StoryCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostStory: (story: Omit<TelegramStory, 'id' | 'views_count' | 'reactions_count' | 'is_viewed'>) => void;
}

export const StoryCreateModal: React.FC<StoryCreateModalProps> = ({
  isOpen,
  onClose,
  onPostStory,
}) => {
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState(
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800'
  );
  const [privacy, setPrivacy] = useState<'everyone' | 'contacts' | 'close_friends'>('everyone');
  const [durationHours, setDurationHours] = useState<number>(24);
  const [stealthMode, setStealthMode] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setMediaUrl(url);
    }
  };

  const handlePublish = () => {
    onPostStory({
      user_id: 'current_user',
      user_name: 'أنا (القصة الخاصة بي)',
      user_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      media_url: mediaUrl,
      caption: caption.trim() || 'قصة جديدة عبر تليجرام 🌟',
      date: 'الآن',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-zinc-100">
        {/* Header */}
        <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">نشر قصة جديدة (Telegram Story)</h2>
              <p className="text-[11px] text-zinc-400">قصة مصورة تفاعلية مع خيارات الخصوصية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Preview Box */}
        <div className="relative h-64 bg-zinc-900 flex items-center justify-center overflow-hidden border-b border-zinc-800 group">
          {mediaUrl ? (
            <img src={mediaUrl} alt="Story Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-zinc-500">
              <ImageIcon className="w-10 h-10" />
              <span className="text-xs">اختر صورة أو مقطع فيديو للقصة</span>
            </div>
          )}

          {/* Overlay Change Media Button */}
          <label className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 hover:bg-black/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer backdrop-blur-md border border-white/10 transition-all">
            <Camera className="w-3.5 h-3.5" />
            <span>تغيير الصورة</span>
            <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Story Configuration Form */}
        <div className="p-4 space-y-4 max-h-[50vh] overflow-y-auto scrollbar-thin">
          {/* Caption Input */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">وصف القصة (Caption):</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="اكتب تعليقاً على القصة أو هاشتاقات..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Duration Selector (6h, 12h, 24h, 48h) */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>مدة بقاء القصة:</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[6, 12, 24, 48].map((hrs) => (
                <button
                  key={hrs}
                  onClick={() => setDurationHours(hrs)}
                  className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    durationHours === hrs
                      ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  {hrs} ساعة
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Selector */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">من يستطيع رؤية قصتك؟</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'everyone', label: 'الجميع 🌍' },
                { id: 'contacts', label: 'جهات اتصالي 👥' },
                { id: 'close_friends', label: 'الأصدقاء المقربون ⭐' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPrivacy(p.id as any)}
                  className={`py-1.5 px-1 rounded-xl text-[11px] font-bold border text-center transition-all ${
                    privacy === p.id
                      ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stealth Mode (وضع التخفي) */}
          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-xs font-bold text-zinc-200">وضع التخفي (Stealth Mode)</div>
                <div className="text-[10px] text-zinc-500">إخفاء مشاهدتك لقصص الآخرين لمدة 25 دقيقة</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={stealthMode}
              onChange={(e) => setStealthMode(e.target.checked)}
              className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handlePublish}
            className="px-5 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>نشر القصة الآن</span>
          </button>
        </div>
      </div>
    </div>
  );
};
