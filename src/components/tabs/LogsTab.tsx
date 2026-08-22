import React, { useState } from 'react';
import { 
  Activity, 
  Trash2, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info,
  Clock,
  Search
} from 'lucide-react';
import { SystemLog } from '../../types';

interface LogsTabProps {
  logs: SystemLog[];
  onClearLogs: () => Promise<void>;
}

export const LogsTab: React.FC<LogsTabProps> = ({ logs, onClearLogs }) => {
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLogs = logs.filter(l => {
    const matchLevel = filterLevel === 'all' || l.level === filterLevel;
    const matchSearch = l.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        l.module.toLowerCase().includes(searchTerm.toLowerCase());
    return matchLevel && matchSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            <span>سجل العمليات والنشاط المباشر (System Activity Logs)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            متابعة فورية لجميع عمليات الإرسال، المراقبة، الرد التلقائي، والانضمام.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Level Filter */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
          >
            <option value="all">جميع المستويات</option>
            <option value="success">نجاح فقط (Success)</option>
            <option value="info">معلومات (Info)</option>
            <option value="warning">تنبيهات (Warning)</option>
            <option value="error">أخطاء (Error)</option>
          </select>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            <input
              type="text"
              placeholder="بحث في السجلات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-8 pl-2 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={onClearLogs}
            className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-rose-600 hover:text-white text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
          >
            <Trash2 className="h-4 w-4" />
            <span>مسح السجلات</span>
          </button>
        </div>
      </div>

      {/* Logs Stream */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            لا توجد سجلات مطابقة للشروط الحالية.
          </div>
        ) : (
          <div className="divide-y divide-slate-700/60 font-mono text-xs max-h-[600px] overflow-y-auto">
            {filteredLogs.map((log) => {
              const isSuccess = log.level === 'success';
              const isWarning = log.level === 'warning';
              const isError = log.level === 'error';

              return (
                <div key={log.id} className="p-3.5 hover:bg-slate-750/40 flex items-start justify-between gap-4 transition">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {isSuccess && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                      {isWarning && <AlertTriangle className="h-4 w-4 text-amber-400" />}
                      {isError && <AlertCircle className="h-4 w-4 text-rose-400" />}
                      {!isSuccess && !isWarning && !isError && <Info className="h-4 w-4 text-cyan-400" />}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-700">
                          {log.module}
                        </span>
                        <span className="text-slate-200 font-sans">{log.message}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 shrink-0 whitespace-nowrap">
                    {log.timestamp}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
