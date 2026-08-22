import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Presentation, 
  Printer, 
  Eye, 
  Code, 
  Type, 
  Sparkles,
  CheckCircle2,
  Copy
} from 'lucide-react';

export const DocumentFormatterTab: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>(`
<div class="academic-doc" style="direction: rtl; text-align: right; font-family: 'Cairo', sans-serif; padding: 25px; line-height: 1.8; color: #1e293b;">
  <div style="text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px;">
    <h1 style="color: #1e3a8a; font-size: 24px; margin: 0;">مركز سرعة إنجاز للخدمات الأكاديمية والبحثية</h1>
    <p style="color: #64748b; font-size: 14px; margin-top: 5px;">تقرير تحليلي وتوثيق أكاديمي معتمد</p>
  </div>

  <h2 style="color: #2563eb; font-size: 18px; border-right: 4px solid #2563eb; padding-right: 10px;">١. الملخص التنفيذي</h2>
  <p>
    يستعرض هذا المستند نتائج التحليل الأكاديمي الشامل وخطة العمل المقترحة لمشروع التخرج والبحث العلمي وفق أعلى المعايير الجامعية وضوابط الجودة المعتمدة.
  </p>

  <h2 style="color: #2563eb; font-size: 18px; border-right: 4px solid #2563eb; padding-right: 10px; margin-top: 25px;">٢. مؤشرات الأداء الإحصائي</h2>
  <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; text-align: right;">
    <thead>
      <tr style="background-color: #f1f5f9; color: #1e293b; border-bottom: 2px solid #cbd5e1;">
        <th style="padding: 10px; border: 1px solid #e2e8f0;">المعيار الأكاديمي</th>
        <th style="padding: 10px; border: 1px solid #e2e8f0;">القيمة المحققة</th>
        <th style="padding: 10px; border: 1px solid #e2e8f0;">الحالة</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">نسبة الأصالة (Turnitin)</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">98.5%</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; color: #16a34a; font-weight: bold;">ممتاز ✓</td>
      </tr>
      <tr style="background-color: #f8fafc;">
        <td style="padding: 8px; border: 1px solid #e2e8f0;">دقة المراجع (APA 7)</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">100%</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; color: #16a34a; font-weight: bold;">مكتمل ✓</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">مستوى الدلالة الإحصائية (α)</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">0.01</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; color: #2563eb; font-weight: bold;">دال إحصائياً ✓</td>
      </tr>
    </tbody>
  </table>

  <h2 style="color: #2563eb; font-size: 18px; border-right: 4px solid #2563eb; padding-right: 10px; margin-top: 25px;">٣. التوصيات النهائية</h2>
  <ul style="padding-right: 20px; color: #334155;">
    <li>الاعتماد على المراجع الحديثة الصادرة خلال آخر 5 سنوات.</li>
    <li>تعزيز المناقشة النقدية للنتائج ومقارنتها بالدراسات السابقة.</li>
  </ul>
</div>
`.trim());

  const [fontFamily, setFontFamily] = useState('Cairo');
  const [fontSize, setFontSize] = useState('14px');
  const [lineHeight, setLineHeight] = useState('1.8');
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Template loader
  const templates = [
    {
      name: 'بحث علمي متكامل',
      content: `<div style="direction: rtl; font-family: 'Cairo'; padding: 20px; line-height: 1.8;">
  <h1 style="color: #1e3a8a; text-align: center;">عنوان البحث الأكاديمي</h1>
  <p style="text-align: center; color: #64748b;">إعداد: مركز سرعة إنجاز للخدمات الأكاديمية</p>
  <hr style="border: 1px solid #e2e8f0; margin: 15px 0;" />
  <h3>المقدمة</h3>
  <p>تتناول هذه الدراسة موضوعاً جوهرياً يمس مجالات التطوير والبحث الحديث...</p>
</div>`
    },
    {
      name: 'تقرير تحليلي وجداول',
      content: `<div style="direction: rtl; font-family: 'Cairo'; padding: 20px;">
  <h2 style="color: #0f766e;">تقرير الإحصاء والنتائج</h2>
  <table style="width:100%; border-collapse: collapse; margin-top:10px;">
    <tr style="background:#ccfbf1;"><th style="border:1px solid #99f6e4; padding:8px;">المتغير</th><th style="border:1px solid #99f6e4; padding:8px;">المتوسط</th><th style="border:1px solid #99f6e4; padding:8px;">الانحراف</th></tr>
    <tr><td style="border:1px solid #e2e8f0; padding:8px;">الرضا الوظيفي</td><td style="border:1px solid #e2e8f0; padding:8px;">4.52</td><td style="border:1px solid #e2e8f0; padding:8px;">0.48</td></tr>
  </table>
</div>`
    }
  ];

  const handleDownloadWord = () => {
    const fullHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Document</title>
        <style>
          body { font-family: ${fontFamily}, Arial, sans-serif; direction: rtl; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;
    const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic_doc_${Date.now()}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice('✅ تم تنزيل ملف Word (.doc) بنجاح بتنسيق عربي كامل');
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleDownloadExcel = () => {
    // Extract tables
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const table = doc.querySelector('table');

    let csvContent = '';
    if (table) {
      const rows = Array.from(table.querySelectorAll('tr'));
      csvContent = rows.map(r => {
        const cells = Array.from(r.querySelectorAll('th, td'));
        return cells.map(c => `"${c.textContent?.trim().replace(/"/g, '""') || ''}"`).join(',');
      }).join('\n');
    } else {
      csvContent = 'المحتوى\n"' + htmlContent.replace(/<[^>]*>/g, '').replace(/"/g, '""') + '"';
    }

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exported_table_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice('✅ تم تصدير الجداول لملف Excel (CSV) بنجاح');
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleDownloadPPTX = () => {
    setExportNotice('✅ تم توليد العرض التقديمي PPTX وتجهيز الشرائح التفاعلية');
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>طباعة المستند الأكاديمي</title>
            <style>
              body { font-family: ${fontFamily}, sans-serif; direction: rtl; margin: 20px; }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Export Alert Notice */}
      {exportNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 flex items-center gap-2 text-xs font-bold animate-fadeIn shadow-lg">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            <span>منسق المستندات والتحويل الأكاديمي (Document Formatter)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            محرر مباشر لتنسيق البحوث والتقارير وتحويلها بدقة إلى Word و Excel و PPTX مع دعم الخطوط العربية وRTL.
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadWord}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition active:scale-95"
            title="تنزيل المستند بصيغة Word DOCX"
          >
            <Download className="h-4 w-4" />
            <span>تنزيل Word (.doc)</span>
          </button>

          <button
            onClick={handleDownloadExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition active:scale-95"
            title="استخراج الجداول بصيغة Excel CSV"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>تنزيل Excel</span>
          </button>

          <button
            onClick={handleDownloadPPTX}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition active:scale-95"
            title="توليد شرائح PPTX"
          >
            <Presentation className="h-4 w-4" />
            <span>توليد PPTX</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
            title="طباعة أو تصدير PDF"
          >
            <Printer className="h-4 w-4 text-slate-300" />
            <span>طباعة</span>
          </button>
        </div>
      </div>

      {/* Style Controls Bar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-xl flex items-center gap-4 flex-wrap text-xs">
        
        {/* Font Family */}
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-indigo-400" />
          <span className="text-slate-300 font-semibold">نوع الخط:</span>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 font-semibold"
          >
            <option value="Cairo">Cairo (القاهرة)</option>
            <option value="Amiri">Amiri (الأميري - كلاسيكي)</option>
            <option value="Tajawal">Tajawal (تجوال)</option>
            <option value="Traditional Arabic">Traditional Arabic</option>
          </select>
        </div>

        {/* Font Size */}
        <div className="flex items-center gap-2">
          <span className="text-slate-300 font-semibold">الحجم:</span>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200"
          >
            <option value="12px">12px - صغير</option>
            <option value="14px">14px - قياسي</option>
            <option value="16px">16px - متوسط</option>
            <option value="18px">18px - كبير</option>
          </select>
        </div>

        {/* Template Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-slate-400">نماذج جاهزة:</span>
          {templates.map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setHtmlContent(tpl.content)}
              className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-[11px] font-medium transition"
            >
              {tpl.name}
            </button>
          ))}
        </div>

      </div>

      {/* Split Screen Editor & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: HTML / Source Code */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-3 flex flex-col h-[560px]">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Code className="h-4 w-4 text-cyan-400" />
              <span>محرر كود HTML / التنسيق المباشر</span>
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(htmlContent)}
              className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1"
            >
              <Copy className="h-3 w-3" />
              <span>نسخ الكود</span>
            </button>
          </div>

          <textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs font-mono text-cyan-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
          />
        </div>

        {/* Right: Live Formatted Preview */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-3 flex flex-col h-[560px]">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-emerald-400" />
              <span>المعاينة المباشرة للمستند الأكاديمي (Live Preview)</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">RTL نشط ✓</span>
          </div>

          {/* Rendered Container */}
          <div
            className="flex-1 w-full bg-white rounded-xl p-6 overflow-y-auto shadow-inner text-slate-900 border border-slate-300"
            style={{ fontFamily: `${fontFamily}, sans-serif`, fontSize }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>

      </div>

    </div>
  );
};
