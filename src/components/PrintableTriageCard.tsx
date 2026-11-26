import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { MapPin, Printer, QrCode, Volume2, VolumeX } from 'lucide-react';
import { BODY_PART_LABELS, LanguageCode, UI_TRANSLATIONS } from '../i18n';
import { TriageLevel, TriageResult } from '../triageEngine';
import { InteractiveGlowCard } from './InteractiveGlowCard';
import { TawafEmblem } from './TawafEmblem';

interface PrintableTriageCardProps {
  language: LanguageCode;
  result: TriageResult;
  ttsSupported?: boolean;
  speakingId?: string | null;
  onSpeak?: (id: string, text: string) => void;
}

const PRINT_PRIORITY_AR_EN: Record<TriageLevel, string> = {
  critical: 'LEVEL 1 · RED (CRITICAL) | المستوى ١ · أحمر (حرج)',
  urgent: 'LEVEL 2 · YELLOW (URGENT) | المستوى ٢ · أصفر (عاجل)',
  stable: 'LEVEL 3 · GREEN (STABLE) | المستوى ٣ · أخضر (مستقر)',
};

const PRIORITY_BORDER: Record<TriageLevel, string> = {
  critical: 'border-red-700 bg-red-700 text-white',
  urgent: 'border-amber-600 bg-amber-600 text-white',
  stable: 'border-[#0D5240] bg-[#0D5240] text-white',
};

export const PrintableTriageCard: React.FC<PrintableTriageCardProps> = ({
  language,
  result,
  ttsSupported = false,
  speakingId = null,
  onSpeak,
}) => {
  const t = UI_TRANSLATIONS[language];
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const arabicBodyLabel = result.bodyPart
    ? BODY_PART_LABELS[result.bodyPart].ar
    : 'غير محدد';
  const englishBodyLabel = result.bodyPart
    ? BODY_PART_LABELS[result.bodyPart].en
    : 'Not specified';

  useEffect(() => {
    let active = true;
    const gpsLine = result.gpsLocation
      ? `GPS:${result.gpsLocation.lat},${result.gpsLocation.lng}(±${result.gpsLocation.accuracy ?? '?'}m)`
      : 'GPS:N/A';

    const payloadLines = [
      `TAWAF TRIAGE PASS`,
      `ID:${result.id}`,
      `PRIORITY:${result.level.toUpperCase()}`,
      `ZONE:${result.zone}`,
      ...(result.locationDetail ? [`LOC_DETAIL:${result.locationDetail.slice(0, 90)}`] : []),
      gpsLine,
      `BODY:${result.bodyPart ?? 'none'}`,
      `AWARE:${result.conscious}`,
      `AGE:${result.ageValue ?? 'N/A'}`,
      `CAT:${result.categoryTitle.slice(0, 70)}`,
      `SYM:${result.symptomsSnapshot.slice(0, 120)}`,
    ];

    if (typeof window !== 'undefined' && window.location?.origin) {
      payloadLines.push(`URL:${window.location.origin}/?case=${encodeURIComponent(result.id)}`);
    }

    QRCode.toDataURL(payloadLines.join('\n'), {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 200,
      color: {
        dark: '#083D2F',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });

    return () => {
      active = false;
    };
  }, [result]);

  const handlePrint = () => {
    window.print();
  };

  const cardSpeakId = `card-${result.id}`;
  const isSpeakingCard = speakingId === cardSpeakId;
  const cardSpeechText = `${result.levelTitle}. ${result.categoryTitle}. ${t.printCardZone}: ${result.zoneLabel}. ${t.printCardArea}: ${result.bodyPartLabel || t.printCardNotProvided}. ${t.printCardAwareness}: ${result.awarenessLabel}.`;

  return (
    <>
      {/* On-Screen Ambulance Card Preview + Offline QR + Print Trigger */}
      <InteractiveGlowCard
        scrollReveal={false}
        className="a11y-surface bg-white border-2 border-[#0D5240] rounded-xl shadow-xs"
      >
        <div className="px-5 py-3.5 bg-[#0D5240] text-white flex items-center justify-between gap-3 border-b-2 border-[#B58E46]">
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

          <div className="grid grid-cols-2 gap-3 text-xs border-b border-[#EAE3D5] pb-4">
            <div>
              <span className="text-slate-500 block">{t.printCardArea}</span>
              <span className="font-bold text-[#111D18]">
                {result.bodyPartLabel || t.printCardNotProvided}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">{t.printCardZone}</span>
              <span className="font-bold text-[#111D18]">
                {result.zoneLabel}
                {result.locationDetail ? ` — ${result.locationDetail}` : ''}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">{t.printCardAwareness}</span>
              <span className="font-bold text-[#111D18]">{result.awarenessLabel}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{t.printCardAge}</span>
              <span className="font-bold text-[#111D18] tabular-nums">
                {result.ageValue !== null ? result.ageValue : t.printCardNotProvided}
              </span>
            </div>

            {result.gpsLocation && (
              <div className="col-span-2 bg-[#FAF8F4] border border-[#DDD4C2] rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-4 h-4 text-[#0D5240] shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-600 block">{t.gpsLabelShort}</span>
                    <span className="font-bold text-[#0D5240] tabular-nums text-xs">
                      {result.gpsLocation.lat.toFixed(5)}, {result.gpsLocation.lng.toFixed(5)}
                    </span>
                  </div>
                </div>
                {result.gpsLocation.accuracy !== null && (
                  <span className="text-[11px] font-bold text-slate-600 tabular-nums shrink-0">
                    ±{result.gpsLocation.accuracy}m
                  </span>
                )}
              </div>
            )}

            {result.status && (
              <div className="col-span-2 pt-1 flex items-center justify-between border-t border-[#EAE3D5]">
                <span className="text-slate-500">{t.statusLabel}</span>
                <span className="font-extrabold text-[#0D5240]">
                  {result.status === 'open'
                    ? t.statusOpen
                    : result.status === 'dispatched'
                    ? t.statusDispatched
                    : t.statusResolved}
                </span>
              </div>
            )}
            {result.responderNotes && (
              <div className="col-span-2 bg-[#F2EDE2] rounded-md p-2.5 text-[#111D18]">
                <span className="font-bold block text-[11px] text-[#0D5240]">
                  {t.responderNotesLabel}
                </span>
                <span className="font-medium">{result.responderNotes}</span>
              </div>
            )}
          </div>

          {/* Patient Case QR Code Block (Offline Generated) */}
          {qrDataUrl && (
            <div className="bg-[#FAF8F4] border-2 border-[#DDD4C2] rounded-xl p-3.5 flex items-center gap-3.5">
              <img
                src={qrDataUrl}
                alt={`${t.qrTitle} ${result.id}`}
                width={96}
                height={96}
                className="w-24 h-24 rounded-lg border border-[#DDD4C2] bg-white p-1 shrink-0"
              />
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0D5240]">
                  <QrCode className="w-4 h-4 text-[#B58E46] shrink-0" aria-hidden="true" />
                  <span>{t.qrTitle}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{t.qrSubtitle}</p>
                <p className="text-[11px] font-bold text-[#0D5240]">{t.qrOfflineReady}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="btn-interactive flex-1 min-h-[48px] px-4 py-3 bg-[#0D5240] hover:bg-[#083D2F] text-white font-bold text-sm rounded-lg border-2 border-[#B58E46] flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4 shrink-0 text-[#E6C77A]" aria-hidden="true" />
              <span>{t.printCardBtn}</span>
            </button>

            {ttsSupported && onSpeak && (
              <button
                type="button"
                onClick={() => onSpeak(cardSpeakId, cardSpeechText)}
                className="btn-interactive min-h-[48px] px-4 py-3 bg-[#FAF8F4] hover:bg-[#F2EDE2] text-[#0D5240] font-bold text-xs rounded-lg border-2 border-[#DDD4C2] flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                {isSpeakingCard ? (
                  <VolumeX className="w-4 h-4 text-red-700" aria-hidden="true" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#B58E46]" aria-hidden="true" />
                )}
                <span>{isSpeakingCard ? t.stopReadingBtn : t.readAloudBtn}</span>
              </button>
            )}
          </div>
        </div>
      </InteractiveGlowCard>

      {/* Dedicated Print-Only Official Medical Pass (renders only in @media print) */}
      <div className="print-only-card" dir="rtl">
        <div className="border-4 border-[#0D5240] rounded-xl p-6 space-y-5 bg-white text-black">
          <div className="flex items-center justify-between border-b-2 border-[#B58E46] pb-4">
            <div className="flex items-center gap-3">
              <TawafEmblem className="w-14 h-14 shrink-0" />
              <div>
                <h1 className="text-xl font-extrabold text-[#0D5240]">
                  طواف — بطاقة الفرز الإسعافي للمسجد الحرام
                </h1>
                <p className="text-xs font-semibold text-slate-700">
                  Tawaf Pilgrim Emergency Triage Pass · Al-Haram Al-Makki (997)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-left text-xs font-bold tabular-nums">
                <p>ID: {result.id}</p>
                <p>{result.timestamp}</p>
              </div>
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt={`QR ${result.id}`}
                  width={76}
                  height={76}
                  className="w-18 h-18 border border-slate-300 rounded p-0.5"
                />
              )}
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
              <p className="font-bold">
                {result.zoneLabel}
                {result.locationDetail ? ` — ${result.locationDetail}` : ''}
              </p>
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
            {result.gpsLocation && (
              <div className="col-span-2 pt-2 border-t border-slate-200">
                <p className="text-xs text-slate-600 font-semibold">
                  إحداثيات الموقع الجغرافي (GPS) / Consented Coordinates
                </p>
                <p className="font-bold tabular-nums">
                  {result.gpsLocation.lat.toFixed(6)}, {result.gpsLocation.lng.toFixed(6)}
                  {result.gpsLocation.accuracy !== null
                    ? ` (±${result.gpsLocation.accuracy}m)`
                    : ''}
                </p>
              </div>
            )}
          </div>

          <div className="border border-slate-300 rounded-lg p-4 space-y-1">
            <p className="text-xs font-bold text-slate-700">
              الأعراض المبلّغ عنها / Reported Complaint:
            </p>
            <p className="text-sm font-semibold">{result.symptomsSnapshot}</p>
          </div>

          <div className="border-2 border-[#0D5240] rounded-lg p-4 space-y-2.5">
            <h2 className="text-sm font-extrabold text-[#0D5240] border-b border-slate-200 pb-1.5">
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
            {result.responderNotes && (
              <p className="text-xs">
                <strong>ملاحظات المسعف ({t.responderNotesLabel}): </strong>
                {result.responderNotes}
              </p>
            )}
          </div>

          <p className="text-[11px] text-center text-slate-600 pt-2 border-t border-slate-200">
            طواف للفرز الإسعافي الأولي — الطوارئ الطبية بالمسجد الحرام: ٩٩٧ · العمليات الموحدة: ٩١١
          </p>
        </div>
      </div>
    </>
  );
};
