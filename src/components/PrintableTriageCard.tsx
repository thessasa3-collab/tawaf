import React from 'react';
import { Printer } from 'lucide-react';
import { BODY_PART_LABELS, LanguageCode, UI_TRANSLATIONS } from '../i18n';
import { TriageLevel, TriageResult } from '../triageEngine';
import { InteractiveGlowCard } from './InteractiveGlowCard';
import { TawafEmblem } from './TawafEmblem';

interface PrintableTriageCardProps {
  language: LanguageCode;
  result: TriageResult;
}

const PRINT_PRIORITY_AR_EN: Record<TriageLevel, string> = {
  critical: 'LEVEL 1 · RED (CRITICAL) | المستوى ١ · أحمر (حرج)',
  urgent: 'LEVEL 2 · YELLOW (URGENT) | المستوى ٢ · أصفر (عاجل)',
  stable: 'LEVEL 3 · GREEN (STABLE) | المستوى ٣ · أخضر (مستقر)',
};

const PRIORITY_BORDER: Record<TriageLevel, string> = {
  critical: 'border-red-700 bg-red-700 text-white',
  urgent: 'border-amber-600 bg-amber-600 text-white',
  stable: 'border-[#082D23] bg-[#082D23] text-white',
};

export const PrintableTriageCard: React.FC<PrintableTriageCardProps> = ({
  language,
  result,
}) => {
  const t = UI_TRANSLATIONS[language];
  const arabicBodyLabel = result.bodyPart
    ? BODY_PART_LABELS[result.bodyPart].ar
    : 'غير محدد';
  const englishBodyLabel = result.bodyPart
    ? BODY_PART_LABELS[result.bodyPart].en
    : 'Not specified';

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* On-Screen Ambulance Card Preview + Print Trigger */}
      <InteractiveGlowCard
        scrollReveal={false}
        className="bg-white border-2 border-[#082D23] rounded-xl shadow-xs"
      >
        <div className="px-5 py-3.5 bg-[#082D23] text-white flex items-center justify-between gap-3 border-b-2 border-[#C59B43]">
          <div className="flex items-center gap-2.5 min-w-0">
            <TawafEmblem className="w-8 h-8 shrink-0" />
            <div className="min-w-0">
              <h3 className="font-display text-sm font-bold truncate">
                {t.printCardHeader}
              </h3>
              <p className="text-[11px] text-[#E6C77A] truncate">{t.printCardSub}</p>
            </div>
          </div>
          <span className="text-xs font-bold tabular-nums text-white shrink-0">
            {result.id}
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div
            className={`rounded-lg px-4 py-2.5 text-xs sm:text-sm font-bold text-center ${PRIORITY_BORDER[result.level]}`}
          >
            {result.levelTitle}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-200 pb-4">
            <div>
              <span className="text-slate-500 block">{t.printCardArea}</span>
              <span className="font-bold text-slate-900">
                {result.bodyPartLabel || t.printCardNotProvided}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">{t.printCardZone}</span>
              <span className="font-bold text-slate-900">{result.zoneLabel}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{t.printCardAwareness}</span>
              <span className="font-bold text-slate-900">{result.awarenessLabel}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{t.printCardAge}</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {result.ageValue !== null ? result.ageValue : t.printCardNotProvided}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="btn-interactive w-full min-h-[48px] px-4 py-3 bg-[#082D23] hover:bg-[#0E4A3A] text-white font-bold text-sm rounded-lg border-2 border-[#C59B43] flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4 shrink-0 text-[#E6C77A]" aria-hidden="true" />
            <span>{t.printCardBtn}</span>
          </button>
        </div>
      </InteractiveGlowCard>

      {/* Dedicated Print-Only Official Medical Pass (renders only in @media print) */}
      <div className="print-only-card" dir="rtl">
        <div className="border-4 border-[#082D23] rounded-xl p-6 space-y-5 bg-white text-black">
          <div className="flex items-center justify-between border-b-2 border-[#C59B43] pb-4">
            <div className="flex items-center gap-3">
              <TawafEmblem className="w-14 h-14 shrink-0" />
              <div>
                <h1 className="text-xl font-extrabold text-[#082D23]">
                  طواف — بطاقة الفرز الإسعافي للمسجد الحرام
                </h1>
                <p className="text-xs font-semibold text-slate-700">
                  Tawaf Pilgrim Emergency Triage Pass · Al-Haram Al-Makki (997)
                </p>
              </div>
            </div>
            <div className="text-left text-xs font-bold tabular-nums">
              <p>ID: {result.id}</p>
              <p>{result.timestamp}</p>
            </div>
          </div>

          <div
            className={`p-3 rounded-lg text-center font-extrabold text-base border-2 ${PRIORITY_BORDER[result.level]}`}
          >
            {PRINT_PRIORITY_AR_EN[result.level]}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm border border-slate-300 rounded-lg p-4">
            <div>
              <p className="text-xs text-slate-600 font-semibold">
                الموقع داخل الحرم / Haram Zone
              </p>
              <p className="font-bold">{result.zoneLabel}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 font-semibold">
                منطقة الألم (3D) / Pain Location
              </p>
              <p className="font-bold">
                {arabicBodyLabel} ({englishBodyLabel})
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 font-semibold">
                درجة الوعي / Consciousness
              </p>
              <p className="font-bold">{result.awarenessLabel}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 font-semibold">
                العمر التقريبي / Age
              </p>
              <p className="font-bold tabular-nums">
                {result.ageValue !== null ? result.ageValue : 'غير محدد / N/A'}
              </p>
            </div>
          </div>

          <div className="border border-slate-300 rounded-lg p-4 space-y-1">
            <p className="text-xs font-bold text-slate-700">
              الأعراض المبلّغ عنها / Reported Complaint:
            </p>
            <p className="text-sm font-semibold">{result.symptomsSnapshot}</p>
          </div>

          <div className="border-2 border-[#082D23] rounded-lg p-4 space-y-2.5">
            <h2 className="text-sm font-extrabold text-[#082D23] border-b border-slate-200 pb-1.5">
              تقرير نصائح المسعفين / Paramedic Clinical Handover Brief
            </h2>
            <p className="text-xs">
              <strong>الاحتمال السريري ({t.paramedicImpression}): </strong>
              {result.responderReport.clinicalImpression}
            </p>
            <div className="text-xs">
              <strong>أولويات التدخل:</strong>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                {result.responderReport.immediateActions.map((act) => (
                  <li key={act}>{act}</li>
                ))}
              </ul>
            </div>
            <p className="text-xs">
              <strong>التجهيزات: </strong>
              {result.responderReport.recommendedEquipment}
            </p>
            <p className="text-xs">
              <strong>محاذير ميدانية: </strong>
              {result.responderReport.fieldPrecautions}
            </p>
            <p className="text-xs">
              <strong>مسار الإخلاء: </strong>
              {result.responderReport.evacuationRoute}
            </p>
          </div>

          <p className="text-[11px] text-center text-slate-600 pt-2 border-t border-slate-200">
            طواف للفرز الإسعافي الأولي — الطوارئ الطبية بالمسجد الحرام: ٩٩٧ · العمليات الموحدة: ٩١١
          </p>
        </div>
      </div>
    </>
  );
};
