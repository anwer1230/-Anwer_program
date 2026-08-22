import React, { useState } from 'react';
import {
  Image as ImageIcon,
  FileText,
  MapPin,
  BarChart2,
  User,
  Music,
  Star,
  Lock,
  Camera,
  X,
  Check,
  Send,
} from 'lucide-react';

interface AttachmentSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto: (file: File) => void;
  onSelectFile: (file: File) => void;
  onOpenLocation: () => void;
  onOpenPoll: () => void;
  onOpenContactShare: () => void;
  onOpenStars: () => void;
  onOpenSecretChat: () => void;
  lang?: string;
}

export const AttachmentSheetModal: React.FC<AttachmentSheetModalProps> = ({
  isOpen,
  onClose,
  onSelectPhoto,
  onSelectFile,
  onOpenLocation,
  onOpenPoll,
  onOpenContactShare,
  onOpenStars,
  onOpenSecretChat,
  lang = 'ar',
}) => {
  const [selectedGalleryImages, setSelectedGalleryImages] = useState<number[]>([]);

  if (!isOpen) return null;

  const demoGallery = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300',
  ];

  const attachmentOptions = [
    {
      id: 'gallery',
      label: lang === 'ar' ? 'المعرض' : 'Gallery',
      sub: lang === 'ar' ? 'صور وفيديو' : 'Photos & Videos',
      icon: ImageIcon,
      color: '#2AABEE',
      bg: 'rgba(42, 171, 238, 0.15)',
      isInput: true,
      accept: 'image/*,video/*',
    },
    {
      id: 'file',
      label: lang === 'ar' ? 'الملفات' : 'Files',
      sub: lang === 'ar' ? 'حتى 4 جيجابايت' : 'Up to 4GB',
      icon: FileText,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.15)',
      isInput: true,
      accept: '*/*',
    },
    {
      id: 'location',
      label: lang === 'ar' ? 'الموقع' : 'Location',
      sub: lang === 'ar' ? 'GPS حي ومباشر' : 'Live GPS',
      icon: MapPin,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
      action: onOpenLocation,
    },
    {
      id: 'poll',
      label: lang === 'ar' ? 'استطلاع' : 'Poll',
      sub: lang === 'ar' ? 'تصويت واختبار' : 'Create Poll',
      icon: BarChart2,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.15)',
      action: onOpenPoll,
    },
    {
      id: 'contact',
      label: lang === 'ar' ? 'جهة اتصال' : 'Contact',
      sub: lang === 'ar' ? 'مشاركة بطاقة' : 'Share Contact',
      icon: User,
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.15)',
      action: onOpenContactShare,
    },
    {
      id: 'music',
      label: lang === 'ar' ? 'صوتيات' : 'Music',
      sub: lang === 'ar' ? 'ملفات صوتية' : 'Audio files',
      icon: Music,
      color: '#ec4899',
      bg: 'rgba(236, 72, 153, 0.15)',
      isInput: true,
      accept: 'audio/*',
    },
    {
      id: 'stars',
      label: lang === 'ar' ? 'نجوم تليجرام' : 'Stars Gift',
      sub: lang === 'ar' ? 'إهداء رصيد' : 'Send Stars',
      icon: Star,
      color: '#fbbf24',
      bg: 'rgba(251, 191, 36, 0.15)',
      action: onOpenStars,
    },
    {
      id: 'secret',
      label: lang === 'ar' ? 'محادثة سرية' : 'Secret Chat',
      sub: lang === 'ar' ? 'تشفير كامل' : 'E2EE Encrypted',
      icon: Lock,
      color: '#00e676',
      bg: 'rgba(0, 230, 118, 0.15)',
      action: onOpenSecretChat,
    },
  ];

  const toggleGallerySelect = (idx: number) => {
    if (selectedGalleryImages.includes(idx)) {
      setSelectedGalleryImages((prev) => prev.filter((i) => i !== idx));
    } else {
      setSelectedGalleryImages((prev) => [...prev, idx]);
    }
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      {/* Bottom Sheet Container (Telegram Android Material 3 Design) */}
      <div
        className="w-full max-w-xl bg-zinc-950 border-t border-x border-zinc-800 rounded-t-3xl p-5 shadow-2xl flex flex-col space-y-4 animate-slideUp text-zinc-100 max-h-[85vh] overflow-y-auto scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Handle Bar */}
        <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto -mt-1 mb-1 opacity-60" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-white">
              {lang === 'ar' ? 'إرفاق وسائط ومستندات' : 'Attach Media & Files'}
            </span>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">
              Telegram 12.x
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Recent Gallery Carousel (Android Telegram Style) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 px-1">
            <span>{lang === 'ar' ? 'الصور الأخيرة من الجهاز' : 'Recent Photos'}</span>
            {selectedGalleryImages.length > 0 && (
              <span className="text-blue-400 font-extrabold">
                {selectedGalleryImages.length} {lang === 'ar' ? 'محددة' : 'selected'}
              </span>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {/* Live Camera Button */}
            <label className="w-24 h-24 rounded-2xl bg-zinc-900 border border-dashed border-zinc-700 hover:border-blue-500 flex flex-col items-center justify-center gap-1 shrink-0 cursor-pointer transition-all hover:bg-zinc-800/80">
              <Camera className="w-6 h-6 text-blue-400" />
              <span className="text-[10px] text-zinc-300 font-bold">
                {lang === 'ar' ? 'الكاميرا' : 'Camera'}
              </span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    onSelectPhoto(e.target.files[0]);
                    onClose();
                  }
                }}
              />
            </label>

            {/* Quick Gallery Thumbnails */}
            {demoGallery.map((img, idx) => {
              const isSelected = selectedGalleryImages.includes(idx);
              return (
                <div
                  key={idx}
                  onClick={() => toggleGallerySelect(idx)}
                  className={`relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 cursor-pointer border-2 transition-all group ${
                    isSelected ? 'border-blue-500 scale-95 shadow-md shadow-blue-500/30' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div
                    className={`absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                      isSelected
                        ? 'bg-blue-500 border-white text-white'
                        : 'bg-black/50 border-white/70 text-transparent'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Grid of Telegram Attachment Options */}
        <div className="grid grid-cols-4 gap-3 pt-2">
          {attachmentOptions.map((opt) => {
            const Icon = opt.icon;
            if (opt.isInput) {
              return (
                <label
                  key={opt.id}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-zinc-900 cursor-pointer transition-all active:scale-95 group text-center"
                >
                  <div
                    className="w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                    style={{ backgroundColor: opt.bg, color: opt.color }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-zinc-200 truncate w-full">{opt.label}</span>
                  <span className="text-[9px] text-zinc-500 truncate w-full -mt-1">{opt.sub}</span>
                  <input
                    type="file"
                    accept={opt.accept}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        if (opt.id === 'gallery') onSelectPhoto(e.target.files[0]);
                        else onSelectFile(e.target.files[0]);
                        onClose();
                      }
                    }}
                  />
                </label>
              );
            }

            return (
              <button
                key={opt.id}
                onClick={() => {
                  onClose();
                  if (opt.action) opt.action();
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-zinc-900 cursor-pointer transition-all active:scale-95 group text-center"
              >
                <div
                  className="w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                  style={{ backgroundColor: opt.bg, color: opt.color }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-zinc-200 truncate w-full">{opt.label}</span>
                <span className="text-[9px] text-zinc-500 truncate w-full -mt-1">{opt.sub}</span>
              </button>
            );
          })}
        </div>

        {/* Multi-Select Action Bar if images selected */}
        {selectedGalleryImages.length > 0 && (
          <div className="pt-2">
            <button
              onClick={() => {
                // simulate send selected
                onClose();
              }}
              className="w-full py-3 bg-[#2AABEE] hover:bg-[#1E96D6] text-white font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>
                {lang === 'ar'
                  ? `إرسال ${selectedGalleryImages.length} صور محددة`
                  : `Send ${selectedGalleryImages.length} Selected Photos`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
