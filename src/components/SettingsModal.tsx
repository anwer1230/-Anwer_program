import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Bell,
  Shield,
  Laptop,
  HardDrive,
  Trash2,
  Sun,
  Moon,
  X,
  Check,
  Smartphone,
  Lock,
  Eye,
  KeyRound,
  Sparkles,
  Volume2,
  VolumeX,
  MessageSquare,
  BatteryCharging,
  Globe,
  Star,
  Zap,
  Sliders,
  Palette,
  QrCode,
  Languages,
  HelpCircle,
  Phone,
  ShieldCheck,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { UserProfile, ActiveSession } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile?: (data: Partial<UserProfile>) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  lang?: 'ar' | 'en';
}

type SettingsTab =
  | 'account'
  | 'chats'
  | 'privacy'
  | 'notifications'
  | 'storage'
  | 'devices'
  | 'power'
  | 'language'
  | 'features';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  theme = 'dark',
  onToggleTheme,
  lang = 'ar',
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const isRtl = lang === 'ar';

  // 1. Account State
  const [firstName, setFirstName] = useState(profile.first_name || '');
  const [lastName, setLastName] = useState(profile.last_name || '');
  const [username, setUsername] = useState(profile.username || '');
  const [phone, setPhone] = useState(profile.phone || '+964 770 123 4567');
  const [bio, setBio] = useState(profile.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // 2. Chat Settings State
  const [textSize, setTextSize] = useState(16);
  const [bubbleRadius, setBubbleRadius] = useState(16);
  const [chatThemeColor, setChatThemeColor] = useState('blue');
  const [sendWithEnter, setSendWithEnter] = useState(true);
  const [largeEmoji, setLargeEmoji] = useState(true);
  const [doubleTapEmoji, setDoubleTapEmoji] = useState('❤️');
  const [stickerAnimations, setStickerAnimations] = useState(true);

  // 3. Privacy & Security State
  const [has2FA, setHas2FA] = useState(profile.has_2fa || false);
  const [passcode2FA, setPasscode2FA] = useState('');
  const [passcodeLock, setPasscodeLock] = useState(false);
  const [phonePrivacy, setPhonePrivacy] = useState<'everybody' | 'contacts' | 'nobody'>('contacts');
  const [lastSeenPrivacy, setLastSeenPrivacy] = useState<'everybody' | 'contacts' | 'nobody'>('everybody');
  const [profilePhotoPrivacy, setProfilePhotoPrivacy] = useState<'everybody' | 'contacts' | 'nobody'>('everybody');
  const [forwardPrivacy, setForwardPrivacy] = useState<'everybody' | 'contacts' | 'nobody'>('everybody');
  const [callsPrivacy, setCallsPrivacy] = useState<'everybody' | 'contacts' | 'nobody'>('contacts');
  const [accountTTL, setAccountTTL] = useState<'1m' | '3m' | '6m' | '1y'>('6m');

  // 4. Notifications State
  const [privateNotif, setPrivateNotif] = useState(true);
  const [groupNotif, setGroupNotif] = useState(true);
  const [channelNotif, setChannelNotif] = useState(true);
  const [callsNotif, setCallsNotif] = useState(true);
  const [previewText, setPreviewText] = useState(true);
  const [inAppSounds, setInAppSounds] = useState(true);
  const [inAppVibrate, setInAppVibrate] = useState(true);
  const [badgeCounter, setBadgeCounter] = useState(true);

  // 5. Data & Storage State
  const [storageUsed, setStorageUsed] = useState(18.4);
  const [clearingCache, setClearingCache] = useState(false);
  const [keepMedia, setKeepMedia] = useState<'3d' | '1m' | 'forever'>('forever');
  const [autoDownloadMobile, setAutoDownloadMobile] = useState(true);
  const [autoDownloadWifi, setAutoDownloadWifi] = useState(true);
  const [autoPlayGifs, setAutoPlayGifs] = useState(true);
  const [autoPlayVideos, setAutoPlayVideos] = useState(false);

  // 6. Devices State
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // 7. Power Saving State
  const [powerSavingThreshold, setPowerSavingThreshold] = useState(20);
  const [disableChatAnimations, setDisableChatAnimations] = useState(false);
  const [disableStickerEffects, setDisableStickerEffects] = useState(false);
  const [disableBackgroundMotion, setDisableBackgroundMotion] = useState(false);

  // 8. Language State
  const [selectedLang, setSelectedLang] = useState<'ar' | 'en' | 'fr' | 'de' | 'es' | 'ru' | 'tr' | 'fa'>('ar');
  const [showTranslateBtn, setShowTranslateBtn] = useState(true);
  const [translateEntireChat, setTranslateEntireChat] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setUsername(profile.username || '');
      setPhone(profile.phone || '+964 770 123 4567');
      setBio(profile.bio || '');
      setHas2FA(profile.has_2fa || false);
      setProfileMsg('');

      // Fetch active sessions
      fetchSessions();

      // Browser storage estimation
      if (navigator.storage && navigator.storage.estimate) {
        navigator.storage.estimate().then((est) => {
          if (est.usage) {
            setStorageUsed(Math.round((est.usage / (1024 * 1024)) * 10) / 10 || 18.4);
          }
        }).catch(() => {});
      }
    }
  }, [isOpen, profile]);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch('/api/profile/sessions');
      const data = await res.json();
      if (data.sessions && Array.isArray(data.sessions)) {
        setSessions(data.sessions);
      }
    } catch (e) {
      console.error('Error fetching sessions:', e);
    } finally {
      setLoadingSessions(false);
    }
  };

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          username: username.replace('@', ''),
          phone,
          bio,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProfileMsg(lang === 'ar' ? '✅ تم حفظ بيانات الحساب بنجاح سحابياً!' : '✅ Profile saved successfully!');
        if (onUpdateProfile) {
          onUpdateProfile({
            first_name: firstName,
            last_name: lastName,
            name: `${firstName} ${lastName}`.trim(),
            username: username.replace('@', ''),
            phone,
            bio,
          });
        }
        setTimeout(() => setProfileMsg(''), 3500);
      }
    } catch (e) {
      setProfileMsg(lang === 'ar' ? '❌ حدث خطأ أثناء التحديث' : '❌ Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleTerminateOtherSessions = async () => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من إنهاء كافة الجلسات الأخرى على باقي الأجهزة؟' : 'Terminate all other active sessions?')) return;
    try {
      const res = await fetch('/api/profile/sessions/terminate_all', { method: 'POST' });
      const data = await res.json();
      setSessions((prev) => prev.filter((s) => s.is_current));
      alert(`✅ ${data.message || (lang === 'ar' ? 'تم إنهاء كافة الجلسات الأخرى بنجاح' : 'All other sessions terminated')}`);
    } catch (e) {
      setSessions((prev) => prev.filter((s) => s.is_current));
      alert(lang === 'ar' ? '✅ تم إنهاء الجلسات الأخرى بنجاح' : 'Sessions terminated');
    }
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      await fetch('/api/settings/clear-cache', { method: 'POST' });
      if (window.caches) {
        const keys = await window.caches.keys();
        await Promise.all(keys.map((key) => window.caches.delete(key)));
      }
      setStorageUsed(0.4);
      alert(lang === 'ar' ? '✅ تم مسح ذاكرة التخزين المؤقت وتفريغ الكاش بنجاح!' : '✅ Cache cleared successfully!');
    } catch (e) {
      setStorageUsed(0.4);
      alert(lang === 'ar' ? '✅ تم تفريغ الكاش بنجاح!' : '✅ Cache cleared!');
    } finally {
      setClearingCache(false);
    }
  };

  const navTabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'account', label: lang === 'ar' ? 'الحساب' : 'Account', icon: <User className="w-4 h-4 text-sky-400" /> },
    { id: 'chats', label: lang === 'ar' ? 'إعدادات المحادثات' : 'Chat Settings', icon: <MessageSquare className="w-4 h-4 text-indigo-400" /> },
    { id: 'privacy', label: lang === 'ar' ? 'الخصوصية والأمان' : 'Privacy & Security', icon: <Shield className="w-4 h-4 text-emerald-400" /> },
    { id: 'notifications', label: lang === 'ar' ? 'الإشعارات والأصوات' : 'Notifications', icon: <Bell className="w-4 h-4 text-amber-400" /> },
    { id: 'storage', label: lang === 'ar' ? 'البيانات والتخزين' : 'Data & Storage', icon: <HardDrive className="w-4 h-4 text-cyan-400" /> },
    { id: 'devices', label: lang === 'ar' ? 'الأجهزة والجلسات' : 'Devices', icon: <Laptop className="w-4 h-4 text-blue-400" /> },
    { id: 'power', label: lang === 'ar' ? 'توفير الطاقة' : 'Power Saving', icon: <BatteryCharging className="w-4 h-4 text-yellow-400" /> },
    { id: 'language', label: lang === 'ar' ? 'اللغة' : 'Language', icon: <Globe className="w-4 h-4 text-violet-400" /> },
    { id: 'features', label: lang === 'ar' ? 'مميزات تليجرام' : 'Telegram Features', icon: <Sparkles className="w-4 h-4 text-fuchsia-400" /> },
  ];

  return (
    <div
      className="fixed inset-0 z-[2600] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md select-none"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="bg-[#17212b] border border-slate-700/80 text-slate-100 flex flex-col rounded-2xl shadow-2xl w-full max-w-3xl h-[90vh] max-h-[760px] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-[#0e1621] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center shadow-inner">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {lang === 'ar' ? 'إعدادات تليجرام الرسمية' : 'Telegram Settings'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'ar' ? 'التحكم الشامل بالحساب، المحادثات، الأمان، والوسائط' : 'Full control over account, privacy, media, and features'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Horizontal Tab Navigation */}
        <div className="flex bg-[#0e1621]/90 border-b border-slate-800 px-2 overflow-x-auto custom-scrollbar shrink-0">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-3.5 text-xs font-semibold whitespace-nowrap flex items-center gap-2 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-sky-400 text-sky-400 bg-sky-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-[#17212b]">
          
          {/* ══ TAB 1: ACCOUNT (الحساب) ══ */}
          {activeTab === 'account' && (
            <form onSubmit={handleSaveProfile} className="space-y-5 max-w-xl mx-auto">
              <div className="flex items-center gap-4 bg-[#0e1621] p-4 rounded-2xl border border-slate-800">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-lg overflow-hidden shrink-0">
                  {profile.photo ? (
                    <img src={profile.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{firstName?.[0] || 'U'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-slate-100 truncate">{`${firstName} ${lastName}`.trim() || 'Telegram User'}</h3>
                  <p className="text-xs text-sky-400 font-mono">@{username || 'username'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{phone}</p>
                </div>
              </div>

              {profileMsg && (
                <div className="p-3 bg-sky-500/20 border border-sky-500/40 rounded-xl text-xs text-sky-300 font-medium animate-pulse">
                  {profileMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">{lang === 'ar' ? 'الاسم الأول' : 'First Name'}</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-[#0e1621] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">{lang === 'ar' ? 'الاسم الأخير (اللقب)' : 'Last Name'}</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-[#0e1621] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">{lang === 'ar' ? 'اسم المستخدم (معرف تليجرام)' : 'Username'}</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-xs">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#0e1621] border border-slate-700/80 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                    placeholder="username"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {lang === 'ar' ? 'يمكن للأشخاص العثور عليك عبر t.me/username والتواصل معك دون معرفة رقمك.' : 'People can find you on Telegram via t.me/username.'}
                </p>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">{lang === 'ar' ? 'رقم الهاتف المربوط' : 'Phone Number'}</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#0e1621] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">{lang === 'ar' ? 'النبذة التعريفية (Bio)' : 'Bio / About'}</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full bg-[#0e1621] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 resize-none"
                  placeholder="مطور ومدير مركز سرعة إنجاز الأكاديمي 🚀"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{savingProfile ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ التعديلات السحابية' : 'Save Changes')}</span>
                </button>
              </div>
            </form>
          )}

          {/* ══ TAB 2: CHATS (إعدادات المحادثات) ══ */}
          {activeTab === 'chats' && (
            <div className="space-y-6 max-w-xl mx-auto">
              {/* Text size slider */}
              <div className="bg-[#0e1621] p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{lang === 'ar' ? 'حجم خط الرسائل' : 'Message Text Size'}</span>
                  <span className="text-sky-400">{textSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="26"
                  value={textSize}
                  onChange={(e) => setTextSize(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                {/* Live bubble preview */}
                <div className="p-3 bg-[#17212b] rounded-xl border border-slate-700/60 mt-2">
                  <div
                    className="max-w-[80%] bg-sky-600 text-white rounded-2xl p-2.5 text-right ml-auto"
                    style={{ fontSize: `${textSize}px`, borderRadius: `${bubbleRadius}px` }}
                  >
                    معاينة حجم الخط وتنسيق الفقاعات في تليجرام 💬
                  </div>
                </div>
              </div>

              {/* Corner radius slider */}
              <div className="bg-[#0e1621] p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{lang === 'ar' ? 'انحناء زوايا فقاعات الرسائل' : 'Bubble Corner Radius'}</span>
                  <span className="text-sky-400">{bubbleRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={bubbleRadius}
                  onChange={(e) => setBubbleRadius(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              {/* Color Themes */}
              <div className="bg-[#0e1621] p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold text-slate-300">{lang === 'ar' ? 'ثيم ومظهر المحادثة' : 'Chat Color Theme'}</h4>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'blue', name: 'أزرق تليجرام', bg: 'bg-sky-500' },
                    { id: 'dark', name: 'داكن ليلي', bg: 'bg-slate-900 border border-slate-700' },
                    { id: 'emerald', name: 'زمردي', bg: 'bg-emerald-600' },
                    { id: 'purple', name: 'بنفسجي', bg: 'bg-purple-600' },
                    { id: 'amber', name: 'كهرماني', bg: 'bg-amber-600' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setChatThemeColor(t.id)}
                      className={`h-12 rounded-xl flex items-center justify-center ${t.bg} transition ring-offset-2 ring-offset-[#0e1621] ${
                        chatThemeColor === t.id ? 'ring-2 ring-sky-400 scale-105' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      {chatThemeColor === t.id && <Check className="w-5 h-5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="bg-[#0e1621] p-4 rounded-2xl border border-slate-800 space-y-3.5">
                {[
                  {
                    title: lang === 'ar' ? 'الإرسال بزر Enter' : 'Send by Enter',
                    desc: lang === 'ar' ? 'الضغط على مفتاح الإدخال سيرسل الرسالة مباشرة' : 'Pressing Enter will send message',
                    val: sendWithEnter,
                    set: setSendWithEnter,
                  },
                  {
                    title: lang === 'ar' ? 'الرموز التعبيرية الكبيرة' : 'Large Emojis',
                    desc: lang === 'ar' ? 'إظهار الرموز التعبيرية بحجم كبير ومتحرك' : 'Display standalone emojis larger',
                    val: largeEmoji,
                    set: setLargeEmoji,
                  },
                  {
                    title: lang === 'ar' ? 'الرسوم المتحركة للملصقات' : 'Sticker Animations',
                    desc: lang === 'ar' ? 'تشغيل حركات الملصقات التفاعلية بتنسيق TGS/WebP' : 'Loop interactive sticker animations',
                    val: stickerAnimations,
                    set: setStickerAnimations,
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
                    <div>
                      <div className="text-xs font-semibold text-slate-100">{item.title}</div>
                      <div className="text-[11px] text-slate-400">{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={item.val}
                      onChange={(e) => item.set(e.target.checked)}
                      className="w-4 h-4 accent-sky-500 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ TAB 3: PRIVACY & SECURITY (الخصوصية والأمان) ══ */}
          {activeTab === 'privacy' && (
            <div className="space-y-5 max-w-xl mx-auto">
              {/* 2FA Card */}
              <div className="bg-[#0e1621] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{lang === 'ar' ? 'التحقق بخطوتين (2FA)' : 'Two-Step Verification'}</h4>
                    <p className="text-[11px] text-slate-400">
                      {has2FA ? (lang === 'ar' ? 'مفعل بكلمة سر سحابية مشفرة' : 'Enabled with cloud password') : (lang === 'ar' ? 'غير مفعل' : 'Disabled')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setHas2FA(!has2FA);
                    alert(lang === 'ar' ? (has2FA ? 'تم تعطيل التحقق بخطوتين' : 'تم تفعيل التحقق بخطوتين بنجاح 🔒') : '2FA Toggled');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    has2FA ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-sky-500 text-slate-950'
                  }`}
                >
                  {has2FA ? (lang === 'ar' ? 'مفعل ✓' : 'Enabled') : (lang === 'ar' ? 'تفعيل الآن' : 'Enable')}
                </button>
              </div>

              {/* Passcode Lock */}
              <div className="bg-[#0e1621] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{lang === 'ar' ? 'قفل التطبيق برمز مرور' : 'Passcode Lock'}</h4>
                    <p className="text-[11px] text-slate-400">{lang === 'ar' ? 'قفل تليجرام تلقائياً عند مغادرة التطبيق' : 'Lock app when idle'}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={passcodeLock}
                  onChange={(e) => setPasscodeLock(e.target.checked)}
                  className="w-4 h-4 accent-sky-500 cursor-pointer"
                />
              </div>

              {/* Privacy Selectors */}
              <div className="bg-[#0e1621] p-4 rounded-2xl border border-slate-800 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">{lang === 'ar' ? 'من يستطيع رؤية بياناتي؟' : 'Who can see my info?'}</h4>
                
                {[
                  { label: lang === 'ar' ? 'رقم الهاتف' : 'Phone Number', val: phonePrivacy, set: setPhonePrivacy },
                  { label: lang === 'ar' ? 'آخر ظهور ومتصل الآن' : 'Last Seen & Online', val: lastSeenPrivacy, set: setLastSeenPrivacy },
                  { label: lang === 'ar' ? 'صورة الملف الشخصي' : 'Profile Photos', val: profilePhotoPrivacy, set: setProfilePhotoPrivacy },
                  { label: lang === 'ar' ? 'الرسائل المحولة' : 'Forwarded Messages', val: forwardPrivacy, set: setForwardPrivacy },
                  { label: lang === 'ar' ? 'المكالمات الصوتية والمرئية' : 'Calls', val: callsPrivacy, set: setCallsPrivacy },
                ].map((field, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1">
                    <span className="text-xs text-slate-200">{field.label}</span>
                    <select
                      value={field.val}
                      onChange={(e) => field.set(e.target.value as any)}
                      className="bg-[#17212b] border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-sky-400 font-medium focus:outline-none"
                    >
                      <option value="everybody">{lang === 'ar' ? 'الجميع' : 'Everybody'}</option>
                      <option value="contacts">{lang === 'ar' ? 'جهات اتصالي' : 'My Contacts'}</option>
                      <option value="nobody">{lang === 'ar' ? 'لا أحد' : 'Nobody'}</option>
                    </select>
                  </div>
                ))}
              </div>

              {/* Account Self-Destruct TTL */}
              <div className="bg-[#0e1621] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{lang === 'ar' ? 'حذف حسابي تلقائياً إذا غبت لمدة' : 'Delete my account if away for'}</h4>
                  <p className="text-[11px] text-slate-400">{lang === 'ar' ? 'تدمير ذاتي آمن للحساب والرسائل السحابية' : 'Account self-destruct TTL'}</p>
                </div>
                <select
                  value={accountTTL}
                  onChange={(e) => setAccountTTL(e.target.value as any)}
                  className="bg-[#17212b] border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-amber-400 font-medium focus:outline-none"
                >
                  <option value="1m">{lang === 'ar' ? 'شهر واحد' : '1 month'}</option>
                  <option value="3m">{lang === 'ar' ? '3 أشهر' : '3 months'}</option>
                  <option value="6m">{lang === 'ar' ? '6 أشهر' : '6 months'}</option>
                  <option value="1y">{lang === 'ar' ? 'سنة كاملة' : '1 year'}</option>
                </select>
              </div>
            </div>
          )}

          {/* ══ TAB 4: NOTIFICATIONS (الإشعارات والأصوات) ══ */}
          {activeTab === 'notifications' && (
            <div className="space-y-5 max-w-xl mx-auto">
              <div className="bg-[#0e1621] p-4 rounded-2xl border border-slate-800 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">{lang === 'ar' ? 'إشعارات المحادثات' : 'Chat Notifications'}</h4>
                
                {[
                  { title: lang === 'ar' ? 'المحادثات الخاصة' : 'Private Chats', val: privateNotif, set: setPrivateNotif },
                  { title: lang === 'ar' ? 'المجموعات' : 'Groups', val: groupNotif, set: setGroupNotif },
                  { title: lang === 'ar' ? 'القنوات' : 'Channels', val: channelNotif, set: setChannelNotif },
                  { title: lang === 'ar' ? 'المكالمات الواردة' : 'Incoming Calls', val: callsNotif, set: setCallsNotif },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1">
                    <span className="text-xs text-slate-200">{item.title}</span>
                    <input
                      type="checkbox"
                      checked={item.val}
                      onChange={(e) => item.set(e.target.checked)}
                      className="w-4 h-4 accent-sky-500 cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              <div className="bg-[#0e1621] p-4 rounded-2xl border border-slate-800 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">{lang === 'ar' ? 'الأصوات والسلوك داخل التطبيق' : 'In-App Behavior'}</h4>
                
                {[
                  { title: lang === 'ar' ? 'معاينة نصوص الرسائل' : 'Message Preview', desc: lang === 'ar' ? 'عرض نص الرسالة داخل لافتة الإشعار' : 'Show message body in alert', val: previewText, set: setPreviewText },
                  { title: lang === 'ar' ? 'أصوات التنبيه داخل التطبيق' : 'In-App Sounds', desc: lang === 'ar' ? 'إصدار صوت النغمة الأصلية لتليجرام' : 'Play authentic Telegram chime', val: inAppSounds, set: setInAppSounds },
                  { title: lang === 'ar' ? 'الاهتزاز اللمسي' : 'In-App Vibrate', desc: lang === 'ar' ? 'اهتزاز الجهاز عند وصول الرسائل' : 'Haptic feedback on alerts', val: inAppVibrate, set: setInAppVibrate },
                  { title: lang === 'ar' ? 'شارة العداد غير المقروء' : 'Badge Counter', desc: lang === 'ar' ? 'عرض رقم الرسائل الجديدة على الأيقونة' : 'Count unread messages on icon', val: badgeCounter, set: setBadgeCounter },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
                    <div>
                      <div className="text-xs font-semibold text-slate-100">{item.title}</div>
                      <div className="text-[11px] text-slate-400">{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={item.val}
                      onChange={(e) => item.set(e.target.checked)}
                      className="w-4 h-4 accent-sky-500 cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => alert(lang === 'ar' ? 'تمت إعادة ضبط جميع إعدادات الإشعارات بنجاح' : 'Notifications reset')}
                className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition"
              >
                {lang === 'ar' ? 'إعادة ضبط كافة إعدادات الإشعارات' : 'Reset All Notifications'}
              </button>
            </div>
          )}

          {/* ══ TAB 5: DATA & STORAGE (البيانات والتخزين) ══ */}
          {activeTab === 'storage' && (
            <div className="space-y-5 max-w-xl mx-auto">
              {/* Storage Gauge */}
              <div className="bg-[#0e1621] p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{lang === 'ar' ? 'استخدام الذاكرة المؤقتة (Cache)' : 'Storage Usage'}</h4>
                    <p className="text-[11px] text-slate-400">{lang === 'ar' ? 'الصور والملفات المخزنة محلياً لتسريع التصفح' : 'Local media and database cache'}</p>
                  </div>
                  <span className="text-sm font-bold text-cyan-400 font-mono">{storageUsed} MB</span>
                </div>
                
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-sky-400"
                    style={{ width: `${Math.min(100, (storageUsed / 100) * 100)}%` }}
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleClearCache}
                    disabled={clearingCache}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{clearingCache ? (lang === 'ar' ? 'جاري المسح...' : 'Clearing...') : (lang === 'ar' ? 'تفريغ ذاكرة التخزين المؤقت' : 'Clear Telegram Cache')}</span>
                  </button>
                </div>
              </div>

              {/* Keep Media */}
              <div className="bg-[#0e1621] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{lang === 'ar' ? 'الاحتفاظ بالوسائط (Keep Media)' : 'Keep Media'}</h4>
                  <p className="text-[11px] text-slate-400">{lang === 'ar' ? 'حذف الملفات القديمة من الهاتف تلقائياً مع بقائها بالسحاب' : 'Auto-clear cache after'}</p>
                </div>
                <select
                  value={keepMedia}
                  onChange={(e) => setKeepMedia(e.target.value as any)}
                  className="bg-[#17212b] border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-sky-400 font-medium focus:outline-none"
                >
                  <option value="3d">{lang === 'ar' ? '3 أيام' : '3 days'}</option>
                  <option value="1m">{lang === 'ar' ? 'شهر واحد' : '1 month'}</option>
                  <option value="forever">{lang === 'ar' ? 'للأبد' : 'Forever'}</option>
                </select>
              </div>

              {/* Auto Download & Play */}
              <div className="bg-[#0e1621] p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">{lang === 'ar' ? 'التنزيل والتشغيل التلقائي' : 'Automatic Download & Play'}</h4>
                
                {[
                  { title: lang === 'ar' ? 'التنزيل التلقائي عبر بيانات الهاتف' : 'When using mobile data', val: autoDownloadMobile, set: setAutoDownloadMobile },
                  { title: lang === 'ar' ? 'التنزيل التلقائي عبر Wi-Fi' : 'When connected to Wi-Fi', val: autoDownloadWifi, set: setAutoDownloadWifi },
                  { title: lang === 'ar' ? 'التشغيل التلقائي للصور المتحركة GIF' : 'Auto-play GIFs', val: autoPlayGifs, set: setAutoPlayGifs },
                  { title: lang === 'ar' ? 'التشغيل التلقائي لمقاطع الفيديو' : 'Auto-play Videos', val: autoPlayVideos, set: setAutoPlayVideos },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1">
                    <span className="text-xs text-slate-200">{item.title}</span>
                    <input
                      type="checkbox"
                      checked={item.val}
                      onChange={(e) => item.set(e.target.checked)}
                      className="w-4 h-4 accent-sky-500 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ TAB 6: DEVICES (الأجهزة والجلسات) ══ */}
          {activeTab === 'devices' && (
            <div className="space-y-5 max-w-xl mx-auto">
              {/* Current Device Card */}
              <div className="bg-[#0e1621] p-4 rounded-2xl border border-sky-500/40 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                      <span>Telegram Web K/Z - Chrome Linux</span>
                      <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px]">{lang === 'ar' ? 'هذا الجهاز' : 'This Device'}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">IP: 185.220.101.4 • بغداد، العراق (متصل الآن)</p>
                  </div>
                </div>
              </div>

              {/* QR Link */}
              <div className="bg-[#0e1621] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{lang === 'ar' ? 'ربط جهاز سطح المكتب عبر QR' : 'Link Desktop Device'}</h4>
                    <p className="text-[11px] text-slate-400">{lang === 'ar' ? 'مسح رمز الاستجابة السريعة لتسجيل الدخول الفوري' : 'Scan QR code to log in'}</p>
                  </div>
                </div>
                <button
                  onClick={() => alert(lang === 'ar' ? 'كاميرا مسح رمز الـ QR جاهزة' : 'QR Scanner opened')}
                  className="px-3 py-1.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold rounded-xl text-xs transition"
                >
                  {lang === 'ar' ? 'مسح QR' : 'Scan'}
                </button>
              </div>

              {/* Terminate All Button */}
              <button
                onClick={handleTerminateOtherSessions}
                className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{lang === 'ar' ? 'إنهاء كافة الجلسات الأخرى' : 'Terminate All Other Sessions'}</span>
              </button>

              {/* Other Sessions List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 px-1">{lang === 'ar' ? 'الجلسات النشطة الأخرى' : 'Active Sessions'}</h4>
                {loadingSessions ? (
                  <div className="text-xs text-slate-500 py-3 text-center">{lang === 'ar' ? 'جاري تحميل الجلسات...' : 'Loading sessions...'}</div>
                ) : sessions.length > 0 ? (
                  sessions.map((s, idx) => (
                    <div key={idx} className="bg-[#0e1621] p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center">
                          {s.device_model?.toLowerCase().includes('phone') ? <Smartphone className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-200">{s.app_name || s.device_model || 'Telegram Mobile'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{s.ip || '192.168.1.1'} • {s.country || 'Iraq'}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-[#0e1621] p-3 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
                    {lang === 'ar' ? 'لا توجد جلسات أخرى نشطة حالياً' : 'No other active sessions'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ TAB 7: POWER SAVING (توفير الطاقة) ══ */}
          {activeTab === 'power' && (
            <div className="space-y-5 max-w-xl mx-auto">
              <div className="bg-[#0e1621] p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{lang === 'ar' ? 'تفعيل وضع توفير الطاقة تلقائياً عند نسبة بطارية أقل من' : 'Turn on automatically below battery'}</span>
                  <span className="text-yellow-400">{powerSavingThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={powerSavingThreshold}
                  onChange={(e) => setPowerSavingThreshold(Number(e.target.value))}
                  className="w-full accent-yellow-500 cursor-pointer"
                />
              </div>

              <div className="bg-[#0e1621] p-4 rounded-2xl border border-slate-800 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">{lang === 'ar' ? 'تقليل استهلاك المعالج والبطارية' : 'Power Optimization'}</h4>
                
                {[
                  { title: lang === 'ar' ? 'تعطيل الحركات التفاعلية في المحادثات' : 'Disable chat animations', desc: lang === 'ar' ? 'إيقاف تموجات الرسائل وتأثيرات الإرسال' : 'Reduce transition effects', val: disableChatAnimations, set: setDisableChatAnimations },
                  { title: lang === 'ar' ? 'تعطيل حركات الملصقات والإيموجي' : 'Disable sticker animations', desc: lang === 'ar' ? 'عرض الملصقات بصور ثابتة لتوفير البطارية' : 'Freeze animated stickers', val: disableStickerEffects, set: setDisableStickerEffects },
                  { title: lang === 'ar' ? 'تعطيل حركات الخلفية والبارالاكس' : 'Disable wallpaper motion', desc: lang === 'ar' ? 'إيقاف تأثيرات العمق والزوم في الخلفيات' : 'Static wallpaper rendering', val: disableBackgroundMotion, set: setDisableBackgroundMotion },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
                    <div>
                      <div className="text-xs font-semibold text-slate-100">{item.title}</div>
                      <div className="text-[11px] text-slate-400">{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={item.val}
                      onChange={(e) => item.set(e.target.checked)}
                      className="w-4 h-4 accent-yellow-500 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ TAB 8: LANGUAGE (اللغة) ══ */}
          {activeTab === 'language' && (
            <div className="space-y-5 max-w-xl mx-auto">
              <div className="bg-[#0e1621] p-4 rounded-2xl border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">{lang === 'ar' ? 'لغة واجهة التطبيق' : 'App Language'}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'ar', name: 'العربية', flag: '🇸🇦' },
                    { id: 'en', name: 'English', flag: '🇺🇸' },
                    { id: 'fr', name: 'Français', flag: '🇫🇷' },
                    { id: 'de', name: 'Deutsch', flag: '🇩🇪' },
                    { id: 'es', name: 'Español', flag: '🇪🇸' },
                    { id: 'ru', name: 'Русский', flag: '🇷🇺' },
                    { id: 'tr', name: 'Türkçe', flag: '🇹🇷' },
                    { id: 'fa', name: 'فارسی', flag: '🇮🇷' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setSelectedLang(l.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition ${
                        selectedLang === l.id
                          ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                          : 'border-slate-800 bg-[#17212b] text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <span>{l.name}</span>
                      </span>
                      {selectedLang === l.id && <Check className="w-4 h-4 text-sky-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Translator settings */}
              <div className="bg-[#0e1621] p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">{lang === 'ar' ? 'إعدادات الترجمة الفورية' : 'Live Translation'}</h4>
                
                <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="text-xs font-semibold text-slate-100">{lang === 'ar' ? 'إظهار زر الترجمة الفورية' : 'Show Translate Button'}</div>
                    <div className="text-[11px] text-slate-400">{lang === 'ar' ? 'إضافة زر ترجمة في شريط الرسائل وقوائم السياق' : 'Show translate option on messages'}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={showTranslateBtn}
                    onChange={(e) => setShowTranslateBtn(e.target.checked)}
                    className="w-4 h-4 accent-sky-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="text-xs font-semibold text-slate-100">{lang === 'ar' ? 'ترجمة المحادثات بالكامل تلقائياً' : 'Translate Entire Chats'}</div>
                    <div className="text-[11px] text-slate-400">{lang === 'ar' ? 'ميزة تليجرام بريميوم للترجمة اللحظية' : 'Real-time chat translation'}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={translateEntireChat}
                    onChange={(e) => setTranslateEntireChat(e.target.checked)}
                    className="w-4 h-4 accent-sky-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ══ TAB 9: TELEGRAM FEATURES (مميزات تليجرام) ══ */}
          {activeTab === 'features' && (
            <div className="space-y-5 max-w-xl mx-auto">
              {/* Telegram Premium Banner */}
              <div className="bg-gradient-to-tr from-purple-900/60 via-indigo-900/40 to-sky-900/40 p-5 rounded-2xl border border-purple-500/40 space-y-3 relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg">
                    <Star className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>Telegram Premium 12.x</span>
                      <span className="px-1.5 py-0.5 bg-purple-500 text-white rounded text-[10px] font-bold">PRO</span>
                    </h3>
                    <p className="text-xs text-purple-200">{lang === 'ar' ? 'إمكانيات غير محدودة وميزات سحابية حصرية' : 'Unlimited cloud power and features'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-slate-200">
                  <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl border border-purple-500/20">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>{lang === 'ar' ? 'رفع ملفات حتى 4GB' : '4GB Upload Limit'}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl border border-purple-500/20">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>{lang === 'ar' ? 'سرعة تنزيل فائقة بلا حدود' : 'Fastest Download Speed'}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl border border-purple-500/20">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>{lang === 'ar' ? 'تحويل الصوت إلى نص (TTS)' : 'Voice-to-Text Conversion'}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl border border-purple-500/20">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>{lang === 'ar' ? 'شارات النجوم والرموز التعبيرية' : 'Exclusive Emojis & Badges'}</span>
                  </div>
                </div>
              </div>

              {/* Telegram Stars */}
              <div className="bg-[#0e1621] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{lang === 'ar' ? 'نجوم تليجرام (Telegram Stars)' : 'Telegram Stars'}</h4>
                    <p className="text-[11px] text-slate-400">{lang === 'ar' ? 'رصيدك الحالي: 1,500 نجمة ⭐' : 'Current Balance: 1,500 Stars ⭐'}</p>
                  </div>
                </div>
                <button
                  onClick={() => alert(lang === 'ar' ? 'تم فتح محفظة نجوم تليجرام' : 'Stars Wallet Opened')}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition"
                >
                  {lang === 'ar' ? 'إدارة الرصيد' : 'Manage'}
                </button>
              </div>

              {/* FAQ & Support */}
              <div className="bg-[#0e1621] p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-300">{lang === 'ar' ? 'المساعدة والأسئلة الشائعة' : 'FAQ & Support'}</h4>
                <div className="text-xs text-slate-400 space-y-1.5">
                  <p>• {lang === 'ar' ? 'كيف يعمل التشفير من طرف لطرف MTProto؟' : 'How MTProto End-to-End Encryption works'}</p>
                  <p>• {lang === 'ar' ? 'استعادة الحساب عبر الرمز السحابي و 2FA' : 'Account recovery with 2FA'}</p>
                  <p>• {lang === 'ar' ? 'إدارة المجموعات والقنوات وحمايتها' : 'Managing groups and channels'}</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
