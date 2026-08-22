import React from 'react';
import { 
  Send, 
  Layers, 
  Zap, 
  Bookmark, 
  MessageSquareReply, 
  RefreshCw, 
  BrainCircuit, 
  GraduationCap, 
  FileText,
  Activity,
  Radio,
  Rocket
} from 'lucide-react';

export interface TabItem {
  id: string;
  name: string;
  shortName: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
  description: string;
}

export const TABS_CONFIG: TabItem[] = [
  {
    id: 'auto_monitor',
    name: 'المراقبة والرادار',
    shortName: 'المراقبة',
    icon: Radio,
    description: 'رصد الكلمات المفتاحية في المجموعات والقنوات وإرسال تنبيهات لحظية'
  },
  {
    id: 'auto_send',
    name: 'الإرسال والجدولة',
    shortName: 'الإرسال',
    icon: Rocket,
    description: 'إرسال ونشر رسائل وصور مجدولة للمجموعات والقنوات مع حماية ضد الحظر'
  },
  {
    id: 'batches',
    name: 'رسائلي (الدفعات)',
    shortName: 'رسائلي',
    icon: Layers,
    description: 'سجل الرسائل المرسلة مع إمكانية التعديل والحذف الجماعي'
  },
  {
    id: 'autojoin',
    name: 'الانضمام التلقائي',
    shortName: 'الانضمام',
    icon: Zap,
    description: 'انضمام ذكي متقدم للمجموعات والقنوات مع تجاوز قيود الحظر'
  },
  {
    id: 'links',
    name: 'روابطي المحفوظة',
    shortName: 'محفوظاتي',
    icon: Bookmark,
    description: 'قاعدة بيانات الروابط المصنفة والتصدير والمزامنة السحابية'
  },
  {
    id: 'autoreply',
    name: 'الرد التلقائي',
    shortName: 'الردود',
    icon: MessageSquareReply,
    description: 'قواعد الردود الذكية بالمطابقة التامة والاحتواء والتعبيرات النمطية'
  },
  {
    id: 'rotating',
    name: 'الإرسال المتسلسل',
    shortName: 'المتسلسل',
    icon: RefreshCw,
    description: 'نشر دوري متناوب حتى 5 رسائل بفترات زمنية دقيقة'
  },
  {
    id: 'learning',
    name: 'نظام التعلم الذكي',
    shortName: 'التعلم الذكي',
    icon: BrainCircuit,
    description: 'بوت ذكاء اصطناعي تفاعلي باللهجة الخليجية وذاكرة دائمة واقتراحات'
  },
  {
    id: 'academic',
    name: 'التحليل الأكاديمي',
    shortName: 'التحليل الأكاديمي',
    icon: GraduationCap,
    description: 'تحليل إحصائي شامل ورسوم بيانية وتلخيص أكاديمي ذكي بـ Gemini'
  },
  {
    id: 'formatter',
    name: 'منسق المستندات',
    shortName: 'المنسق',
    icon: FileText,
    description: 'محرر ومحول HTML إلى Word و PPTX و Excel بتنسيق عربي كامل'
  },
  {
    id: 'logs',
    name: 'سجل النشاط',
    shortName: 'السجلات',
    icon: Activity,
    description: 'سجلات الأحداث المباشرة والعمليات المنفذة'
  }
];

interface NavigationTabsProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
  badges?: { [tabId: string]: number | string };
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  setActiveTab,
  badges = {}
}) => {
  return (
    <nav className="bg-slate-900/60 border-b border-slate-800/80 px-2 sm:px-6 py-2.5 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 min-w-max">
        {TABS_CONFIG.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const badgeVal = badges[tab.id];

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-indigo-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 border border-transparent'
              }`}
            >
              <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
              <span>{tab.name}</span>
              
              {badgeVal !== undefined && Number(badgeVal) > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-indigo-900/80 text-indigo-300 border border-indigo-700/50'
                }`}>
                  {badgeVal}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
