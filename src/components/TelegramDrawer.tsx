import React from 'react';
import {
  X,
  Users,
  Lock,
  Radio,
  UserCheck,
  Phone,
  Compass,
  Bookmark,
  Star,
  Settings,
  UserPlus,
  Sparkles,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  Rocket,
  Eye,
  Mail,
  Zap,
  Bot,
  Brain,
  Search,
} from 'lucide-react';
import { UserProfile } from '../types';

interface TelegramDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onOpenProfile: () => void;
  onOpenSavedMessages?: () => void;
  onOpenContacts?: () => void;
  onOpenVoiceCall?: () => void;
  onOpenSettings?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onOpenTelegramStars?: () => void;
  onOpenSecretChat?: () => void;
  onOpenAppLock?: () => void;
  onOpenPeopleNearby?: () => void;
  onOpenLogin: () => void;
  onNewGroup?: () => void;
  onNewChannel?: () => void;
  onInviteFriends?: () => void;
  onOpenFeatures?: () => void;
  onOpenInstallPwa?: () => void;
  onOpenAutomationAI?: (tab?: any) => void;
  onOpenAcademic?: () => void;
  onOpenLinkFinder?: () => void;
  onOpenMediaGallery?: () => void;
  onOpenPrivacy?: () => void;
  onOpenActiveSessions?: () => void;
  onOpenSync?: () => void;
  onOpenMTProtoSync?: () => void;
  onOpenArchiveSync?: () => void;
  onOpenMonitor?: () => void;
  onNewFolder?: () => void;
  onOpenArchive?: () => void;
  onCheckUpdate?: () => void;
  onOpenSupergroupManager?: () => void;
  onOpenSpamReport?: () => void;
  // 🌟 The 7 Advanced Automation & Intelligence Functions
  onOpenSender?: () => void;
  onOpenMonitoring?: () => void;
  onOpenMyMessages?: () => void;
  onOpenAutoJoiner?: () => void;
  onOpenAutoResponder?: () => void;
  onOpenSmartLearning?: () => void;
  onOpenLiveRadar?: () => void;
  lang?: 'ar' | 'en';
}

export const TelegramDrawer: React.FC<TelegramDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  onOpenProfile,
  onOpenSavedMessages,
  onOpenContacts,
  onOpenVoiceCall,
  onOpenSettings,
  theme = 'dark',
  onToggleTheme,
  onOpenTelegramStars,
  onOpenSecretChat,
  onOpenPeopleNearby,
  onOpenLogin,
  onNewGroup,
  onNewChannel,
  onInviteFriends,
  onOpenFeatures,
  onOpenSupergroupManager,
  onOpenSpamReport,
  onOpenSender,
  onOpenMonitoring,
  onOpenMyMessages,
  onOpenAutoJoiner,
  onOpenAutoResponder,
  onOpenSmartLearning,
  onOpenLiveRadar,
  lang = 'ar',
}) => {
  const isDarkMode = theme === 'dark';
  const isRtl = lang === 'ar';

  if (!isOpen) return null;

  const handleAction = (action?: () => void) => {
    onClose();
    if (action) action();
  };

  const handleLogout = () => {
    if (window.confirm(isRtl ? 'هل أنت متأكد من تسجيل الخروج من الحساب؟' : 'Log out of your account?')) {
      handleAction(onOpenLogin);
    }
  };

  const handleCreateGroup = () => {
    if (onNewGroup) {
      handleAction(onNewGroup);
    } else {
      handleAction(onOpenContacts);
    }
  };

  const handleCreateChannel = () => {
    if (onNewChannel) {
      handleAction(onNewChannel);
    } else {
      alert(isRtl ? '📢 إنشاء قناة جديدة: يمكنك تحديد اسم القناة وصورتها والبدء في النشر' : 'Create New Channel');
      onClose();
    }
  };

  const handleInvite = () => {
    if (onInviteFriends) {
      handleAction(onInviteFriends);
    } else {
      if (navigator.share) {
        navigator.share({
          title: 'Telegram',
          text: 'تواصل معي عبر تليجرام!',
          url: window.location.origin,
        }).catch(() => {});
      } else {
        navigator.clipboard?.writeText(window.location.origin);
        alert(isRtl ? '📋 تم نسخ رابط الدعوة إلى الحافظة' : 'Invite link copied to clipboard');
      }
      onClose();
    }
  };

  const displayName = profile.first_name || profile.name || (isRtl ? 'مستخدم تليجرام' : 'Telegram User');
  const userInitials = (profile.first_name || profile.name || 'T')[0];

  return (
    <div
      className="fixed inset-0 z-[2500] flex select-none"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Telegram Drawer Panel (DrKLO/Telegram Android Specification) */}
      <div className="relative w-72 sm:w-80 max-w-[85vw] bg-[#17212b] border-r border-slate-800/80 h-full flex flex-col shadow-2xl z-10 text-slate-100 font-sans">
        
        {/* ══ 1. PROFILE HEADER (DrawerProfileCell) ══ */}
        <div className="p-4 bg-[#0e1621] border-b border-slate-800/90 relative">
          {/* Top Actions: Theme Switcher & Close */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onToggleTheme}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800/60 transition-colors"
              title={isDarkMode ? 'تبديل للوضع النهاري' : 'تبديل للوضع الليلي'}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800/60 transition-colors"
              title={isRtl ? 'إغلاق' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div
            onClick={() => handleAction(onOpenProfile)}
            className="cursor-pointer group flex flex-col space-y-2"
          >
            {/* Avatar */}
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold border-2 border-sky-400/30 shadow-md group-hover:scale-105 transition-transform">
              {profile.photo ? (
                <img src={profile.photo} alt={displayName} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span>{userInitials}</span>
              )}
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0e1621] rounded-full" />
            </div>

            <div>
              <div className="font-bold text-[15px] text-slate-100 group-hover:text-sky-400 transition-colors truncate">
                {displayName} {profile.last_name || ''}
              </div>
              <div className="text-xs text-sky-400 font-mono mt-0.5">
                @{profile.username || 'username'}
              </div>
              <div className="text-xs text-slate-400 mt-0.5 font-mono" dir="ltr">
                {profile.phone || '+964 770 123 4567'}
              </div>
            </div>
          </div>
        </div>

        {/* ══ 2. TELEGRAM ANDROID MENU ITEMS (Exact Order & 20px Icons) ══ */}
        <div className="flex-1 p-2 space-y-0.5 overflow-y-auto custom-scrollbar text-[14px]">
          
          {/* 1. مجموعة جديدة (New Group) */}
          <button
            onClick={handleCreateGroup}
            className="w-full px-3.5 py-2.5 rounded-xl hover:bg-slate-800/60 text-slate-200 hover:text-sky-400 flex items-center gap-4 transition-colors group"
          >
            <Users className="w-5 h-5 text-slate-400 group-hover:text-sky-400 shrink-0" />
            <span className="font-medium">{isRtl ? 'مجموعة جديدة' : 'New Group'}</span>
          </button>

          {/* 2. محادثة سرية جديدة (New Secret Chat) */}
          <button
            onClick={() => handleAction(onOpenSecretChat)}
            className="w-full px-3.5 py-2.5 rounded-xl hover:bg-slate-800/60 text-slate-200 hover:text-emerald-400 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-4">
              <Lock className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 shrink-0" />
              <span className="font-medium">{isRtl ? 'محادثة سرية جديدة' : 'New Secret Chat'}</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">E2EE</span>
          </button>

          {/* 3. قناة جديدة (New Channel) */}
          <button
            onClick={handleCreateChannel}
            className="w-full px-3.5 py-2.5 rounded-xl hover:bg-slate-800/60 text-slate-200 hover:text-sky-400 flex items-center gap-4 transition-colors group"
          >
            <Radio className="w-5 h-5 text-slate-400 group-hover:text-sky-400 shrink-0" />
            <span className="font-medium">{isRtl ? 'قناة جديدة' : 'New Channel'}</span>
          </button>

          {/* 4. جهات الاتصال (Contacts) */}
          <button
            onClick={() => handleAction(onOpenContacts)}
            className="w-full px-3.5 py-2.5 rounded-xl hover:bg-slate-800/60 text-slate-200 hover:text-sky-400 flex items-center gap-4 transition-colors group"
          >
            <UserCheck className="w-5 h-5 text-slate-400 group-hover:text-sky-400 shrink-0" />
            <span className="font-medium">{isRtl ? 'جهات الاتصال' : 'Contacts'}</span>
          </button>

          {/* 5. المكالمات (Calls) */}
          <button
            onClick={() => handleAction(onOpenVoiceCall)}
            className="w-full px-3.5 py-2.5 rounded-xl hover:bg-slate-800/60 text-slate-200 hover:text-emerald-400 flex items-center gap-4 transition-colors group"
          >
            <Phone className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 shrink-0" />
            <span className="font-medium">{isRtl ? 'المكالمات' : 'Calls'}</span>
          </button>

          {/* 6. الأشخاص القريبون (People Nearby) */}
          <button
            onClick={() => handleAction(onOpenPeopleNearby)}
            className="w-full px-3.5 py-2.5 rounded-xl hover:bg-slate-800/60 text-slate-200 hover:text-purple-400 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-4">
              <Compass className="w-5 h-5 text-slate-400 group-hover:text-purple-400 shrink-0" />
              <span className="font-medium">{isRtl ? 'الأشخاص القريبون' : 'People Nearby'}</span>
            </div>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono font-bold">GPS</span>
          </button>

          {/* 7. الرسائل المحفوظة (Saved Messages) */}
          <button
            onClick={() => handleAction(onOpenSavedMessages)}
            className="w-full px-3.5 py-2.5 rounded-xl hover:bg-slate-800/60 text-slate-200 hover:text-sky-400 flex items-center gap-4 transition-colors group"
          >
            <Bookmark className="w-5 h-5 text-slate-400 group-hover:text-sky-400 shrink-0" />
            <span className="font-medium">{isRtl ? 'الرسائل المحفوظة' : 'Saved Messages'}</span>
          </button>

          {/* 8. نجوم تليجرام (Telegram Stars) */}
          <button
            onClick={() => handleAction(onOpenTelegramStars)}
            className="w-full px-3.5 py-2.5 rounded-xl hover:bg-slate-800/60 text-slate-200 hover:text-amber-400 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-4">
              <Star className="w-5 h-5 text-slate-400 group-hover:text-amber-400 shrink-0" />
              <span className="font-medium">{isRtl ? 'نجوم تليجرام' : 'Telegram Stars'}</span>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">⭐</span>
          </button>

          {/* 9. الإعدادات (Settings) */}
          <button
            onClick={() => handleAction(onOpenSettings)}
            className="w-full px-3.5 py-2.5 rounded-xl hover:bg-slate-800/60 text-slate-200 hover:text-sky-400 flex items-center gap-4 transition-colors group"
          >
            <Settings className="w-5 h-5 text-slate-400 group-hover:text-sky-400 shrink-0" />
            <span className="font-medium">{isRtl ? 'الإعدادات' : 'Settings'}</span>
          </button>

          {/* Divider */}
          <div className="my-2 border-t border-slate-800/80" />

          {/* ══ 🌟 ENJAZ AUTOMATION & BACKEND TOOLS (7 Core Functions) ══ */}
          <div className="px-3 py-1 text-[11px] font-bold text-sky-400/90 tracking-wide uppercase flex items-center justify-between">
            <span>{isRtl ? 'الأدوات والأتمتة الذكية' : 'Smart Automation Tools'}</span>
            <span className="bg-sky-500/20 text-sky-300 text-[10px] px-1.5 py-0.2 rounded font-mono">7 أدوات</span>
          </div>

          {/* 1. الإرسال المجدول والذكي */}
          <button
            onClick={() => handleAction(onOpenSender)}
            className="w-full px-3.5 py-2 rounded-xl hover:bg-slate-800/60 text-slate-200 hover:text-sky-400 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <Rocket className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="font-medium">{isRtl ? 'الإرسال المجدول والذكي' : 'Smart Scheduled Sender'}</span>
            </div>
            <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono font-bold">🚀 إرسال</span>
          </button>

          {/* 2. مراقبة الكلمات المفتاحية */}
          <button
            onClick={() => handleAction(onOpenMonitoring)}
            className="w-full px-3.5 py-2 rounded-xl hover:bg-slate-800/60 text-slate-200 hover:text-amber-400 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <Eye className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="font-medium">{isRtl ? 'مراقبة الكلمات المفتاحية' : 'Keyword Monitoring'}</span>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">👁️ رادار</span>
          </button>

          {/* 3. رسائلي وإدارة الدفعات */}
          <button
            onClick={() => handleAction(onOpenMyMessages)}
            className="w-full px-3.5 py-2 rounded-xl hover:bg-slate-800/60 text-slate-200 hover:text-cyan-400 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <Mail className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="font-medium">{isRtl ? 'رسائلي وإدارة الدفعات' : 'My Messages & Batches'}</span>
            </div>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-bold">📬 دفعات</span>
          </button>

          {/* 4. الانضمام التلقائي المتقدم */}
          <button
            onClick={() => handleAction(onOpenAutoJoiner)}
            className="w-full px-3.5 py-2 rounded-xl hover:bg-slate-800/60 text-slate-200 hover:text-emerald-400 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <Zap className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="font-medium">{isRtl ? 'الانضمام التلقائي المتقدم' : 'Auto Joiner Pro'}</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">⚡ انضمام</span>
          </button>

          {/* 5. الردود التلقائية الذكية */}
          <button
            onClick={() => handleAction(onOpenAutoResponder)}
            className="w-full px-3.5 py-2 rounded-xl hover:bg-slate-800/60 text-slate-200 hover:text-rose-400 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <Bot className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="font-medium">{isRtl ? 'الردود التلقائية الذكية' : 'Auto Responder'}</span>
            </div>
            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-mono font-bold">🤖 ردود</span>
          </button>

          {/* 6. الذكاء الاصطناعي (Groq) */}
          <button
            onClick={() => handleAction(onOpenSmartLearning)}
            className="w-full px-3.5 py-2 rounded-xl hover:bg-slate-800/60 text-slate-200 hover:text-yellow-400 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <Brain className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="font-medium">{isRtl ? 'الذكاء الاصطناعي (Groq)' : 'Groq AI Learning'}</span>
            </div>
            <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded font-mono font-bold">🧠 خليجي</span>
          </button>

          {/* 7. البحث والانضمام الفوري (الرادار) */}
          <button
            onClick={() => handleAction(onOpenLiveRadar)}
            className="w-full px-3.5 py-2 rounded-xl hover:bg-slate-800/60 text-slate-200 hover:text-violet-400 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <Search className="w-5 h-5 text-violet-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="font-medium">{isRtl ? 'البحث والانضمام الفوري' : 'Live Link Radar'}</span>
            </div>
            <span className="text-[10px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded font-mono font-bold">🔍 رادار</span>
          </button>

          {/* Divider */}
          <div className="my-2 border-t border-slate-800/80" />

          {/* 10. دعوة أصدقاء (Invite Friends) */}
          <button
            onClick={handleInvite}
            className="w-full px-3.5 py-2.5 rounded-xl hover:bg-slate-800/60 text-slate-200 hover:text-sky-400 flex items-center gap-4 transition-colors group"
          >
            <UserPlus className="w-5 h-5 text-slate-400 group-hover:text-sky-400 shrink-0" />
            <span className="font-medium">{isRtl ? 'دعوة أصدقاء' : 'Invite Friends'}</span>
          </button>

          {/* 11. مميزات تليجرام (Telegram Features) */}
          <button
            onClick={() => {
              if (onOpenFeatures) {
                handleAction(onOpenFeatures);
              } else {
                handleAction(onOpenSettings);
              }
            }}
            className="w-full px-3.5 py-2.5 rounded-xl hover:bg-slate-800/60 text-slate-200 hover:text-purple-400 flex items-center gap-4 transition-colors group"
          >
            <Sparkles className="w-5 h-5 text-slate-400 group-hover:text-purple-400 shrink-0" />
            <span className="font-medium">{isRtl ? 'مميزات تليجرام' : 'Telegram Features'}</span>
          </button>

          {/* 12. إدارة المجموعات الكبرى (Supergroups & Permissions) */}
          {onOpenSupergroupManager && (
            <button
              onClick={() => handleAction(onOpenSupergroupManager)}
              className="w-full px-3.5 py-2.5 rounded-xl hover:bg-slate-800/60 text-slate-200 hover:text-blue-400 flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-4">
                <ShieldCheck className="w-5 h-5 text-slate-400 group-hover:text-blue-400 shrink-0" />
                <span className="font-medium">{isRtl ? 'المجموعات الكبرى والصلاحيات' : 'Supergroups & Rights'}</span>
              </div>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono font-bold">200K</span>
            </button>
          )}

          {/* 13. مكافحة الإزعاج والإبلاغ (Anti-Spam Shield) */}
          {onOpenSpamReport && (
            <button
              onClick={() => handleAction(onOpenSpamReport)}
              className="w-full px-3.5 py-2.5 rounded-xl hover:bg-slate-800/60 text-slate-200 hover:text-rose-400 flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-4">
                <Lock className="w-5 h-5 text-slate-400 group-hover:text-rose-400 shrink-0" />
                <span className="font-medium">{isRtl ? 'إبلاغ عن إزعاج (Anti-Spam)' : 'Report Spam'}</span>
              </div>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-mono font-bold">Shield</span>
            </button>
          )}

          {/* Divider */}
          <div className="my-2 border-t border-slate-800/80" />

          {/* 12. تسجيل الخروج (Log Out) */}
          <button
            onClick={handleLogout}
            className="w-full px-3.5 py-2.5 rounded-xl hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 flex items-center gap-4 transition-colors group"
          >
            <LogOut className="w-5 h-5 text-rose-400 shrink-0" />
            <span className="font-medium">{isRtl ? 'تسجيل الخروج' : 'Log Out'}</span>
          </button>

        </div>

        {/* ══ 3. FOOTER (Telegram Official Build Label) ══ */}
        <div className="p-3 bg-[#0e1621] border-t border-slate-800 text-[11px] text-slate-500 text-center font-mono">
          Telegram Web K 12.2.0 (5204)
        </div>

      </div>
    </div>
  );
};
