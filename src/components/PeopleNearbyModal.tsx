import React, { useState } from 'react';
import {
  Compass,
  Users,
  MapPin,
  Shield,
  Eye,
  EyeOff,
  Plus,
  MessageCircle,
  X,
  Radio,
  CheckCircle2,
} from 'lucide-react';

interface NearbyUser {
  id: string;
  name: string;
  avatar: string;
  distance: string;
  bio: string;
}

interface NearbyGroup {
  id: string;
  title: string;
  avatar: string;
  distance: string;
  membersCount: number;
}

interface PeopleNearbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: NearbyUser) => void;
  onSelectGroup: (group: NearbyGroup) => void;
  lang?: string;
}

export const PeopleNearbyModal: React.FC<PeopleNearbyModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  onSelectGroup,
  lang = 'ar',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!isOpen) return null;

  const nearbyUsers: NearbyUser[] = [
    {
      id: 'nearby_1',
      name: 'د. أحمد الشمري',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      distance: 'على بعد 150 متراً',
      bio: 'باحث أكاديمي في علوم البيانات والذكاء الاصطناعي',
    },
    {
      id: 'nearby_2',
      name: 'سارة المهندس',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      distance: 'على بعد 400 متراً',
      bio: 'مطور برمجيات ومهتم بتقنيات تليجرام السحابية',
    },
    {
      id: 'nearby_3',
      name: 'م. فهد العتيبي',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      distance: 'على بعد 850 متراً',
      bio: 'مستشار تقني وإداري',
    },
  ];

  const nearbyGroups: NearbyGroup[] = [
    {
      id: 'group_nearby_1',
      title: 'ملتقى مطوري الرياض والتقنية 💻',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150',
      distance: 'على بعد 250 متراً',
      membersCount: 1420,
    },
    {
      id: 'group_nearby_2',
      title: 'نادي رواد الأعمال والابتكار 🚀',
      avatar: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=150',
      distance: 'على بعد 600 متراً',
      membersCount: 850,
    },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-zinc-100 max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-950/60 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '12s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">الأشخاص والمجموعات القريبة (People Nearby)</h2>
                <span className="px-2 py-0.5 text-[10px] bg-blue-500/20 text-blue-300 rounded-md font-bold">
                  رادار GPS 📍
                </span>
              </div>
              <p className="text-xs text-zinc-400">العثور على جهات الاتصال والمجتمعات المحيطة بموقعك الجغرافي</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-5 overflow-y-auto scrollbar-thin">
          {/* Visibility Banner */}
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                {isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-100">
                  {isVisible ? 'أنت مرئي الآن للمستخدمين القريبين' : 'جعل نفسي مرئياً للآخرين'}
                </div>
                <div className="text-[10px] text-zinc-400">
                  {isVisible
                    ? 'يمكن للأشخاص القريبين رؤية ملفك وإرسال الرسائل إليك'
                    : 'اسمح للمستخدمين حولك بالعثور على حسابك ومراسلتك'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsVisible(!isVisible)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                isVisible
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/25'
              }`}
            >
              {isVisible ? 'إيقاف الظهور' : 'تفعيل الظهور'}
            </button>
          </div>

          {/* Users Nearby Section */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5 px-1">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>مستخدمون بالقرب منك ({nearbyUsers.length})</span>
            </span>

            <div className="space-y-1.5">
              {nearbyUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user);
                    onClose();
                  }}
                  className="p-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800/80 rounded-2xl flex items-center justify-between cursor-pointer transition-all hover:border-zinc-700"
                >
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt="" className="w-11 h-11 rounded-full object-cover border border-zinc-700" />
                    <div>
                      <div className="text-xs font-bold text-white">{user.name}</div>
                      <div className="text-[10px] text-emerald-400 font-medium mt-0.5">{user.distance}</div>
                      <div className="text-[10px] text-zinc-400 truncate max-w-[220px]">{user.bio}</div>
                    </div>
                  </div>
                  <button className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white transition-colors">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Groups Nearby Section */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5 px-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>مجموعات محلية في منطقتك ({nearbyGroups.length})</span>
            </span>

            <div className="space-y-1.5">
              {nearbyGroups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => {
                    onSelectGroup(group);
                    onClose();
                  }}
                  className="p-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800/80 rounded-2xl flex items-center justify-between cursor-pointer transition-all hover:border-zinc-700"
                >
                  <div className="flex items-center gap-3">
                    <img src={group.avatar} alt="" className="w-11 h-11 rounded-2xl object-cover border border-zinc-700" />
                    <div>
                      <div className="text-xs font-bold text-white">{group.title}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        <span className="text-amber-400 font-medium">{group.distance}</span> • {group.membersCount.toLocaleString()} عضو
                      </div>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 text-xs font-bold hover:bg-emerald-600 hover:text-white transition-colors">
                    انضمام
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
