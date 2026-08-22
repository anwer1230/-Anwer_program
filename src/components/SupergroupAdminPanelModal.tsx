import React, { useState } from 'react';
import {
  Users,
  Shield,
  Sliders,
  Clock,
  Link,
  UserCheck,
  UserX,
  Lock,
  Sparkles,
  Copy,
  CheckCircle2,
  X,
  Share2,
  Plus,
  MessageSquare,
  Image,
  FileText,
  UserPlus,
  Pin,
  ExternalLink,
} from 'lucide-react';

interface SupergroupAdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: any;
  onUpdatePermissions?: (permissions: any) => Promise<void>;
  lang?: 'ar' | 'en';
}

interface PendingJoinRequest {
  id: string | number;
  name: string;
  username: string;
  avatar?: string;
  date: string;
  bio?: string;
}

export const SupergroupAdminPanelModal: React.FC<SupergroupAdminPanelModalProps> = ({
  isOpen,
  onClose,
  chat,
  onUpdatePermissions,
  lang = 'ar',
}) => {
  const isRtl = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'permissions' | 'slow_mode' | 'invite_links' | 'join_requests'>('permissions');

  // Supergroup Member Permissions Matrix
  const [permissions, setPermissions] = useState({
    can_send_messages: true,
    can_send_media: true,
    can_send_stickers: true,
    can_send_polls: true,
    can_add_web_page_previews: true,
    can_invite_users: true,
    can_pin_messages: false,
    can_change_info: false,
  });

  // Slow mode settings
  const [slowModeSeconds, setSlowModeSeconds] = useState<number>(0);

  // Invite Links
  const [requireApproval, setRequireApproval] = useState(true);
  const [inviteLink, setInviteLink] = useState(`https://t.me/+${chat?.id || 'group'}_sec_${Math.random().toString(36).substring(7)}`);
  const [copiedLink, setCopiedLink] = useState(false);

  // Pending Join Requests Queue
  const [joinRequests, setJoinRequests] = useState<PendingJoinRequest[]>([
    {
      id: 201,
      name: 'عبدالله السبيعي',
      username: '@abdullah_sb',
      date: 'منذ دقيقتين',
      bio: 'مهتم بالمجموعات التقنية والسيارات',
    },
    {
      id: 202,
      name: 'سارة القحطاني',
      username: '@sara_qa',
      date: 'منذ 10 دقائق',
      bio: 'عضو مجتمع الطائف',
    },
    {
      id: 203,
      name: 'خالد العمري',
      username: '@khaled_om',
      date: 'منذ نصف ساعة',
      bio: 'الرياض - السعودية',
    },
  ]);

  if (!isOpen) return null;

  const chatTitle = chat?.title || chat?.name || (isRtl ? 'المجموعة الكبرى (Supergroup)' : 'Supergroup');

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleApprove = (id: string | number) => {
    setJoinRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDecline = (id: string | number) => {
    setJoinRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div
      className="fixed inset-0 z-[3200] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in font-sans"
      onClick={onClose}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div
        className="w-full max-w-2xl bg-[#17212b] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-[#0e1621] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-100">{chatTitle}</h3>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded-md border border-blue-500/30">
                  Supergroup • 200,000 Max
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isRtl ? 'إدارة الصلاحيات والروابط العميقة وطلبات الانضمام' : 'Manage Rights, Deep Links & Join Queue'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-[#131b24] p-1.5 border-b border-slate-800 text-xs overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'permissions' ? 'bg-blue-500 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isRtl ? 'صلاحيات الأعضاء' : 'Permissions'}</span>
          </button>
          <button
            onClick={() => setActiveTab('slow_mode')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'slow_mode' ? 'bg-blue-500 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isRtl ? 'الوضع البطيء (Slow Mode)' : 'Slow Mode'}</span>
          </button>
          <button
            onClick={() => setActiveTab('invite_links')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'invite_links' ? 'bg-blue-500 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>{isRtl ? 'الروابط العميقة (Deep Links)' : 'Invite Links'}</span>
          </button>
          <button
            onClick={() => setActiveTab('join_requests')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'join_requests' ? 'bg-blue-500 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{isRtl ? 'طلبات الانضمام' : 'Join Requests'}</span>
            {joinRequests.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {joinRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Tabs */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4 text-xs">
          {/* TAB 1: Permissions */}
          {activeTab === 'permissions' && (
            <div className="space-y-3">
              <div className="text-slate-400 font-medium">
                {isRtl
                  ? 'ما الذي يمكن للأعضاء العاديين فعله داخل هذه المجموعة الكبرى؟'
                  : 'What can standard members do in this supergroup?'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { key: 'can_send_messages', titleAr: 'إرسال الرسائل النصية', titleEn: 'Send Messages', icon: MessageSquare },
                  { key: 'can_send_media', titleAr: 'إرسال الصور والفيديوهات والملفات', titleEn: 'Send Media', icon: Image },
                  { key: 'can_send_stickers', titleAr: 'إرسال الملصقات وصور GIF', titleEn: 'Send Stickers & GIFs', icon: Sparkles },
                  { key: 'can_send_polls', titleAr: 'إنشاء واستخدام الاستفتاءات', titleEn: 'Send Polls', icon: Sliders },
                  { key: 'can_add_web_page_previews', titleAr: 'تضمين روابط الويب ومعاينتها', titleEn: 'Embed Links', icon: ExternalLink },
                  { key: 'can_invite_users', titleAr: 'إضافة أعضاء جدد عبر الروابط', titleEn: 'Add Members', icon: UserPlus },
                  { key: 'can_pin_messages', titleAr: 'تثبيت الرسائل في الأعلى', titleEn: 'Pin Messages', icon: Pin },
                  { key: 'can_change_info', titleAr: 'تغيير صورة واسم ووصف المجموعة', titleEn: 'Change Chat Info', icon: Shield },
                ].map((item) => {
                  const Icon = item.icon;
                  const isChecked = (permissions as any)[item.key];
                  return (
                    <label
                      key={item.key}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-blue-500/15 border-blue-500/40 text-slate-100 font-semibold'
                          : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isChecked ? 'text-blue-400' : 'text-slate-500'}`} />
                        <span>{isRtl ? item.titleAr : item.titleEn}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermission(item.key as any)}
                        className="w-4 h-4 accent-blue-500 rounded"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Slow Mode */}
          {activeTab === 'slow_mode' && (
            <div className="space-y-4">
              <div className="bg-[#0e1621] p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>{isRtl ? 'الفاصل الزمني بين الرسائل (Slow Mode)' : 'Message Interval'}</span>
                </div>
                <p className="text-slate-400 text-xs">
                  {isRtl
                    ? 'سيضطر العضو للانتظار هذه المدة المحددة بعد كل رسالة يرسلها في المجموعة لتقليل الإزعاج والتكرار.'
                    : 'Members will need to wait this amount of time between consecutive messages.'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { sec: 0, label: isRtl ? 'معطل (Off)' : 'Off' },
                  { sec: 10, label: '10s' },
                  { sec: 30, label: '30s' },
                  { sec: 60, label: '1m' },
                  { sec: 300, label: '5m' },
                  { sec: 900, label: '15m' },
                  { sec: 3600, label: '1h' },
                ].map((item) => (
                  <button
                    key={item.sec}
                    onClick={() => setSlowModeSeconds(item.sec)}
                    className={`p-3 rounded-xl border font-mono text-center transition-all ${
                      slowModeSeconds === item.sec
                        ? 'bg-blue-500 text-white font-bold border-blue-400 shadow-md'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Invite Links / Deep Links */}
          {activeTab === 'invite_links' && (
            <div className="space-y-4">
              <div className="bg-[#0e1621] p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-300">
                  {isRtl ? 'الرابط العميق الأساسي للمجموعة (Deep Link):' : 'Primary Deep Link:'}
                </div>
                <div className="flex items-center gap-2 bg-[#0a0f16] border border-slate-800 p-2.5 rounded-xl font-mono text-cyan-300 text-xs">
                  <span className="flex-1 truncate">{inviteLink}</span>
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-1"
                  >
                    {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[11px]">{copiedLink ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ' : 'Copy')}</span>
                  </button>
                </div>
              </div>

              {/* Approval toggle */}
              <label className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-200">
                    {isRtl ? 'طلب موافقة المشرفين (Join Requests)' : 'Require Admin Approval'}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    {isRtl ? 'لن ينضم العضو مباشرة حتى يوافق أحد المشرفين' : 'Members will wait in the queue'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={(e) => setRequireApproval(e.target.checked)}
                  className="w-4 h-4 accent-blue-500 rounded"
                />
              </label>
            </div>
          )}

          {/* TAB 4: Join Requests Queue */}
          {activeTab === 'join_requests' && (
            <div className="space-y-3">
              <div className="text-slate-400 font-semibold flex items-center justify-between">
                <span>{isRtl ? 'الأعضاء المعلقين في انتظار الموافقة:' : 'Pending Users:'}</span>
                <span className="text-blue-400 font-mono">{joinRequests.length} {isRtl ? 'طلب' : 'Requests'}</span>
              </div>

              {joinRequests.length === 0 ? (
                <div className="p-8 text-center bg-[#0e1621] rounded-xl border border-slate-800 text-slate-500 space-y-2">
                  <UserCheck className="w-8 h-8 mx-auto text-slate-600" />
                  <div>{isRtl ? 'لا توجد طلبات انضمام معلقة حالياً' : 'No pending join requests'}</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {joinRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3 bg-[#0e1621] border border-slate-800 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-bold flex items-center justify-center text-sm shadow">
                          {req.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-200">{req.name}</div>
                          <div className="text-[11px] text-cyan-400 font-mono">{req.username} • {req.date}</div>
                          {req.bio && <div className="text-[10px] text-slate-400">{req.bio}</div>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1 text-xs transition-colors"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{isRtl ? 'قبول' : 'Approve'}</span>
                        </button>
                        <button
                          onClick={() => handleDecline(req.id)}
                          className="p-1.5 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg transition-colors"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0e1621] border-t border-slate-800 flex items-center justify-between">
          <span className="text-slate-500 text-xs font-mono">
            {isRtl ? 'نظام Supergroups المركزي - متصل بـ MTProto' : 'Supergroup Controller Active'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md"
          >
            {isRtl ? 'حفظ وإغلاق' : 'Save & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
