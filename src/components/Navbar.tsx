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
  Cloud,
  CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stats: {
    batchesCount: number;
    linksCount: number;
    rulesCount: number;
    servicesCount: number;
  };
  isOnline: boolean;
  onSync: () => void;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  stats,
  isOnline,
  onSync,
  isSyncing
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/20">
              <Zap className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight">
                  مركز سرعة إنجاز
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                  منظومة تيليجرام والأدوات الذكية
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                مراقبة وإرسال ذكي • ردود آلية • تعلم اصطناعي • تحليلات أكاديمية
              </p>
            </div>
          </div>

          {/* Status & Stats Badges */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60 shadow-inner text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-slate-400">الحالة:</span>
                <strong className="text-emerald-400">متصل وجاهز</strong>
              </div>
              <div className="h-3.5 w-px bg-slate-700"></div>
              <div className="text-slate-300">
                <span className="text-slate-400">الدفعات:</span> <strong className="text-white">{stats.batchesCount}</strong>
              </div>
              <div className="h-3.5 w-px bg-slate-700"></div>
              <div className="text-slate-300">
                <span className="text-slate-400">المحفوظات:</span> <strong className="text-cyan-400">{stats.linksCount}</strong>
              </div>
              <div className="h-3.5 w-px bg-slate-700"></div>
              <div className="text-slate-300">
                <span className="text-slate-400">الخدمات:</span> <strong className="text-indigo-400">{stats.servicesCount}</strong>
              </div>
            </div>

            {/* Cloud Sync Button */}
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95 disabled:opacity-50"
              title="مزامنة سحابية مع قاعدة البيانات"
            >
              <Cloud className={`h-4 w-4 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'جارِ المزامنة...' : 'مزامنة سحابية'}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
