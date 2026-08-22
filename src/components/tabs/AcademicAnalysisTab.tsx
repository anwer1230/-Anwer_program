import React, { useState } from 'react';
import { 
  GraduationCap, 
  BarChart3, 
  FileText, 
  Sparkles, 
  Play, 
  FileDown, 
  Layers, 
  CheckCircle2,
  TrendingUp,
  Activity,
  Calculator,
  ChevronDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { StatisticalResult, AcademicSummary } from '../../types';

export const AcademicAnalysisTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'ai_summary'>('stats');

  // Stats State
  const [rawData, setRawData] = useState<string>(
    '88, 92, 75, 84, 90, 95, 68, 77, 85, 89, 94, 78, 82, 88, 91, 86, 79, 93, 87, 85'
  );
  const [statsResult, setStatsResult] = useState<StatisticalResult | null>(null);
  const [isAnalyzingStats, setIsAnalyzingStats] = useState(false);

  // AI Summary State
  const [academicText, setAcademicText] = useState<string>(
    `عنوان البحث: أثر التحول الرقمي على كفاءة الخدمات الأكاديمية والبحثية في الجامعات السعودية.

المقدمة:
يشهد قطاع التعليم العالي في المملكة العربية السعودية تحولاً متسارعاً نحو تبني التقنيات الرقمية وأنظمة الذكاء الاصطناعي لتحسين جودة التعليم والبحث العلمي. تهدف هذه الدراسة إلى قياس الأثر الفعلي للأنظمة الرقمية على سرعة إنجاز البحوث، ودقة التحليل الإحصائي، ورضا الباحثين وطلاب الدراسات العليا.

المنهجية:
تم استخدام المنهج الوصفي التحليلي، وتوزيع استبانة إلكترونية محكمة على عينة عشوائية مكونة من 350 طالباً وباحثاً في 5 جامعات رئيسية. تم تحليل البيانات باستخدام برنامج SPSS، واستخراج المتوسطات الحسابية والانحرافات المعيارية واختبار T-test.

النتائج الرئيسية:
1. أظهرت النتائج وجود أثر إيجابي ذو دلالة إحصائية (p < 0.01) للأنظمة الرقمية في تقليص زمن إعداد البحوث بنسبة 42%.
2. بلغت نسبة الرضا العام عن خدمات الدعم الأكاديمي والتحليل الإحصائي الآلي 89.4%.
3. هناك حاجة مستمرة للتدريب على أدوات فحص الاقتباس العلمي وتوثيق المراجع بنظام APA 7.

التوصيات:
- التوسع في دمج تقنيات الذكاء الاصطناعي التوليدي في منصات الخدمات الطلابية.
- عقد ورش عمل تدريبية دورية حول التحليل الإحصائي المتقدم ومصادر البيانات المفتوحة.`
  );
  const [aiSummary, setAiSummary] = useState<AcademicSummary | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Presets
  const presets = [
    { label: 'درجات الطلاب الأكاديمية', data: '72, 85, 90, 65, 88, 94, 79, 83, 91, 87, 76, 89, 92, 84, 88' },
    { label: 'نتائج استبيان الرضا (1-5)', data: '4, 5, 5, 3, 4, 5, 4, 4, 3, 5, 5, 4, 5, 2, 4, 5, 4, 5, 3, 4' },
    { label: 'زمن الإنجاز بالساعات', data: '12, 18, 24, 15, 30, 22, 14, 28, 36, 19, 21, 26, 16, 32, 20' }
  ];

  // Analyze Numbers
  const handleAnalyzeStats = async () => {
    if (!rawData.trim()) return;
    setIsAnalyzingStats(true);
    try {
      const res = await fetch('/tools/analyze_stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: rawData })
      }).then(r => r.json());

      if (res.success && res.stats) {
        setStatsResult(res.stats);
      } else {
        alert(res.error || 'حدث خطأ أثناء التحليل');
      }
    } catch (e: any) {
      alert(`خطأ: ${e.message}`);
    } finally {
      setIsAnalyzingStats(false);
    }
  };

  // Summarize with Gemini AI
  const handleSummarizeAcademic = async () => {
    if (!academicText.trim()) return;
    setIsSummarizing(true);
    try {
      const res = await fetch('/tools/academic_ai_summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: academicText })
      }).then(r => r.json());

      if (res.success && res.summary) {
        setAiSummary(res.summary);
      } else {
        alert(res.error || 'حدث خطأ أثناء التلخيص');
      }
    } catch (e: any) {
      alert(`خطأ: ${e.message}`);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleExportStatsCSV = () => {
    if (!statsResult) return;
    const content = `المؤشر الإحصائي,القيمة
عدد العينات (N),${statsResult.count}
المجموع (Sum),${statsResult.sum}
المتوسط الحسابي (Mean),${statsResult.mean}
الوسيط (Median),${statsResult.median}
المنوال (Mode),${statsResult.mode}
الانحراف المعياري (Std),${statsResult.std}
التباين (Variance),${statsResult.variance}
أدنى قيمة (Min),${statsResult.min}
أعلى قيمة (Max),${statsResult.max}
المدى (Range),${statsResult.range}
الربيع الأول (Q1),${statsResult.q1}
الربيع الثالث (Q3),${statsResult.q3}
المدى الربيعي (IQR),${statsResult.iqr}
معامل الالتواء (Skewness),${statsResult.skewness}
معامل التفرطح (Kurtosis),${statsResult.kurtosis}
`;
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statistical_analysis_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Subtab Switcher */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-400" />
            <span>منصة التحليل الأكاديمي والإحصائي المتقدم</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            أدوات متكاملة للتحليل الإحصائي الوصفي وتوليد الرسوم البيانية وتلخيص الأبحاث العلمية بالذكاء الاصطناعي.
          </p>
        </div>

        {/* SubTab Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveSubTab('stats')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'stats'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>التحليل الإحصائي (SPSS / Stats)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ai_summary')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'ai_summary'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>التلخيص الأكاديمي الذكي (Gemini)</span>
          </button>
        </div>
      </div>

      {/* Subtab 1: Statistical Analysis */}
      {activeSubTab === 'stats' && (
        <div className="space-y-6">
          
          {/* Input Box */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-indigo-400" />
                <span>أدخل الأرقام أو البيانات الرقمية (مفصولة بفواصل أو مسافات أو أسطر)</span>
              </label>

              {/* Presets */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[11px] text-slate-400">عينات تجريبية:</span>
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRawData(p.data)}
                    className="px-2.5 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600/60 transition"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              value={rawData}
              onChange={(e) => setRawData(e.target.value)}
              placeholder="مثال: 85, 90, 78, 92, 88, 75, 96..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-cyan-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                disabled={isAnalyzingStats || !rawData.trim()}
                onClick={handleAnalyzeStats}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>{isAnalyzingStats ? 'جارِ التحليل...' : 'تشغيل التحليل الإحصائي'}</span>
              </button>

              {statsResult && (
                <button
                  type="button"
                  onClick={handleExportStatsCSV}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <FileDown className="h-4 w-4 text-cyan-400" />
                  <span>تصدير النتائج (CSV)</span>
                </button>
              )}
            </div>
          </div>

          {/* Results Display */}
          {statsResult && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Statistical Metrics Bento Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                
                <div className="bg-slate-850 border border-slate-700/80 rounded-xl p-3 text-center">
                  <div className="text-[11px] text-slate-400 font-semibold">حجم العينة (N)</div>
                  <div className="text-base font-black text-indigo-400 font-mono mt-1">{statsResult.count}</div>
                </div>

                <div className="bg-slate-850 border border-slate-700/80 rounded-xl p-3 text-center">
                  <div className="text-[11px] text-slate-400 font-semibold">المتوسط الحسابي (Mean)</div>
                  <div className="text-base font-black text-white font-mono mt-1">{statsResult.mean}</div>
                </div>

                <div className="bg-slate-850 border border-slate-700/80 rounded-xl p-3 text-center">
                  <div className="text-[11px] text-slate-400 font-semibold">الوسيط (Median)</div>
                  <div className="text-base font-black text-cyan-400 font-mono mt-1">{statsResult.median}</div>
                </div>

                <div className="bg-slate-850 border border-slate-700/80 rounded-xl p-3 text-center">
                  <div className="text-[11px] text-slate-400 font-semibold">المنوال (Mode)</div>
                  <div className="text-base font-black text-amber-400 font-mono mt-1">{statsResult.mode}</div>
                </div>

                <div className="bg-slate-850 border border-slate-700/80 rounded-xl p-3 text-center">
                  <div className="text-[11px] text-slate-400 font-semibold">الانحراف المعياري (Std)</div>
                  <div className="text-base font-black text-emerald-400 font-mono mt-1">{statsResult.std}</div>
                </div>

                <div className="bg-slate-850 border border-slate-700/80 rounded-xl p-3 text-center">
                  <div className="text-[11px] text-slate-400 font-semibold">التباين (Variance)</div>
                  <div className="text-base font-black text-purple-400 font-mono mt-1">{statsResult.variance}</div>
                </div>

                <div className="bg-slate-850 border border-slate-700/80 rounded-xl p-3 text-center">
                  <div className="text-[11px] text-slate-400 font-semibold">المدى (Range)</div>
                  <div className="text-base font-black text-rose-400 font-mono mt-1">{statsResult.range}</div>
                </div>

              </div>

              {/* Second Row: Quartiles & Distribution Shape */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-slate-850 border border-slate-800 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-400">أدنى قيمة (Min)</div>
                  <div className="text-sm font-bold text-slate-200 font-mono">{statsResult.min}</div>
                </div>
                <div className="bg-slate-850 border border-slate-800 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-400">الربيع الأول (Q1)</div>
                  <div className="text-sm font-bold text-slate-200 font-mono">{statsResult.q1}</div>
                </div>
                <div className="bg-slate-850 border border-slate-800 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-400">الربيع الثالث (Q3)</div>
                  <div className="text-sm font-bold text-slate-200 font-mono">{statsResult.q3}</div>
                </div>
                <div className="bg-slate-850 border border-slate-800 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-400">أعلى قيمة (Max)</div>
                  <div className="text-sm font-bold text-slate-200 font-mono">{statsResult.max}</div>
                </div>
                <div className="bg-slate-850 border border-slate-800 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-400">المدى الربيعي (IQR)</div>
                  <div className="text-sm font-bold text-slate-200 font-mono">{statsResult.iqr}</div>
                </div>
              </div>

              {/* Distribution Histogram Chart */}
              {statsResult.distributionData && statsResult.distributionData.length > 0 && (
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-indigo-400" />
                      <span>المدرج التكراري لتوزيع البيانات (Histogram Distribution)</span>
                    </h3>
                    <span className="text-[11px] text-slate-400">تكرار القيم حسب الفئات</span>
                  </div>

                  <div className="h-64 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statsResult.distributionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="binLabel" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                          labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                          formatter={(value: any) => [`${value} تكرار`, 'العدد']}
                        />
                        <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* Subtab 2: AI Document Summarizer */}
      {activeSubTab === 'ai_summary' && (
        <div className="space-y-6">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-400" />
                <span>نص البحث أو الدراسة الأكاديمية المراد تلخيصها</span>
              </label>
              <span className="text-xs text-slate-400">{academicText.length} حرف</span>
            </div>

            <textarea
              rows={8}
              value={academicText}
              onChange={(e) => setAcademicText(e.target.value)}
              placeholder="الصق نص الدراسة أو ملخص البحث هنا..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />

            <button
              type="button"
              disabled={isSummarizing || !academicText.trim()}
              onClick={handleSummarizeAcademic}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>{isSummarizing ? 'جارِ التحليل والتلخيص الذكي...' : 'توليد التلخيص الأكاديمي المنظم'}</span>
            </button>
          </div>

          {/* AI Summary Output Display */}
          {aiSummary && (
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5 animate-fadeIn">
              
              {/* Title */}
              <div className="border-b border-slate-700 pb-4">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                  ملخص أكاديمي محكم
                </span>
                <h3 className="text-lg font-black text-white mt-2 leading-snug">
                  {aiSummary.title}
                </h3>
              </div>

              {/* Comprehensive Summary Paragraph */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 leading-relaxed space-y-1">
                <strong className="text-indigo-400 block font-bold">📌 الخلاصة العامة للدراسة:</strong>
                <p>{aiSummary.full_summary_text}</p>
              </div>

              {/* Objectives & Key Findings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Objectives */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                    <span>الأهداف الرئيسية للدراسة:</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {aiSummary.objectives?.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Findings */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                    <span>أبرز النتائج المستخلصة:</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {aiSummary.key_findings?.map((kf, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{kf}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Recommendations */}
              {aiSummary.recommendations && aiSummary.recommendations.length > 0 && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                    <span>التوصيات والمقترحات التطبيقية:</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {aiSummary.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">✓</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
};
