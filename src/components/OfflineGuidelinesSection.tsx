import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, BookOpen, Search, Volume2, VolumeX, WifiOff } from 'lucide-react';
import { GuidelineCategory, OFFLINE_GUIDELINES } from '../data/offlineGuidelines';
import { LanguageCode, UI_TRANSLATIONS } from '../i18n';
import { InteractiveGlowCard } from './InteractiveGlowCard';

interface OfflineGuidelinesSectionProps {
  language: LanguageCode;
  ttsSupported: boolean;
  speakingId: string | null;
  onSpeak: (id: string, text: string) => void;
}

const PRIORITY_HEADER: Record<'critical' | 'urgent' | 'stable', string> = {
  critical: 'bg-red-800 text-white border-red-900',
  urgent: 'bg-amber-600 text-white border-amber-700',
  stable: 'bg-[#0D5240] text-white border-[#083D2F]',
};

export const OfflineGuidelinesSection: React.FC<OfflineGuidelinesSectionProps> = ({
  language,
  ttsSupported,
  speakingId,
  onSpeak,
}) => {
  const t = UI_TRANSLATIONS[language];
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | GuidelineCategory>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return OFFLINE_GUIDELINES.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (!q) return true;
      const haystack = [
        item.title[language],
        item.summary[language],
        item.steps[language].join(' '),
        item.doNot[language],
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [category, language, search]);

  const categories: Array<{ id: 'all' | GuidelineCategory; label: string }> = [
    { id: 'all', label: t.offlineCatAll },
    { id: 'emergency', label: t.offlineCatEmergency },
    { id: 'heat', label: t.offlineCatHeat },
    { id: 'trauma', label: t.offlineCatTrauma },
    { id: 'chronic', label: t.offlineCatChronic },
  ];

  return (
    <section
      id="offline-guidelines"
      className="space-y-6 border-t-2 border-[#DDD4C2] pt-10"
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-[#0D5240]">
            <BookOpen className="w-4 h-4 text-[#B58E46]" aria-hidden="true" />
            <span>{t.offlineGuideBadge}</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#0D5240]">
            {t.offlineGuideTitle}
          </h2>
          <p className="text-sm font-medium text-slate-700 max-w-3xl">
            {t.offlineGuideSubtitle}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-[#0D5240] text-[#E6C77A] border border-[#B58E46] rounded-lg px-3.5 py-2 text-xs font-bold shrink-0">
          <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{t.offlineGuideBadge}</span>
        </div>
      </motion.div>

      {/* Search & Category Controls */}
      <div className="a11y-surface bg-white border-2 border-[#DDD4C2] rounded-xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-0">
          <Search
            className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.offlineGuideSearchPlaceholder}
            aria-label={t.offlineGuideSearchPlaceholder}
            className="w-full min-h-[44px] rounded-lg border-2 border-[#DDD4C2] bg-[#FAF8F4] ps-10 pe-4 text-sm font-medium text-[#111D18] focus:outline-none focus:border-[#0D5240]"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(cat.id)}
                className={`btn-interactive min-h-[42px] px-3.5 py-1.5 rounded-lg text-xs font-bold border cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#0D5240] text-white border-[#B58E46] shadow-xs'
                    : 'bg-[#FAF8F4] text-[#111D18] border-[#DDD4C2] hover:border-[#0D5240]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Offline Protocols Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((item, idx) => {
          const readId = `offline-${item.id}`;
          const isSpeaking = speakingId === readId;
          const speechPayload = `${item.title[language]}. ${item.summary[language]}. ${item.steps[language].join('. ')}. ${t.offlineDoNotLabel} ${item.doNot[language]}`;

          return (
            <InteractiveGlowCard
              key={item.id}
              delayIndex={idx}
              className="a11y-surface bg-white border-2 border-[#DDD4C2] hover:border-[#B58E46] rounded-xl shadow-xs flex flex-col"
            >
              <article className="flex flex-col h-full">
                <div
                  className={`px-5 py-3.5 border-b-2 border-[#B58E46] flex items-center justify-between gap-3 ${PRIORITY_HEADER[item.priority]}`}
                >
                  <h3 className="font-display text-base font-extrabold leading-snug">
                    {item.title[language]}
                  </h3>

                  {ttsSupported && (
                    <button
                      type="button"
                      onClick={() => onSpeak(readId, speechPayload)}
                      aria-label={isSpeaking ? t.stopReadingBtn : t.readAloudBtn}
                      className="min-h-[38px] px-2.5 py-1 rounded-md bg-black/25 hover:bg-black/40 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {isSpeaking ? (
                        <VolumeX className="w-4 h-4 text-[#E6C77A]" aria-hidden="true" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-[#E6C77A]" aria-hidden="true" />
                      )}
                      <span className="hidden sm:inline">
                        {isSpeaking ? t.stopReadingBtn : t.readAloudBtn}
                      </span>
                    </button>
                  )}
                </div>

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
                      {item.summary[language]}
                    </p>
                    <ol className="space-y-2 border-t border-[#EAE3D5] pt-3">
                      {item.steps[language].map((step, i) => (
                        <li
                          key={`${item.id}-${i}`}
                          className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-[#111D18] leading-relaxed"
                        >
                          <span className="font-extrabold text-[#0D5240] tabular-nums shrink-0">
                            {String(i + 1).padStart(2, '0')}.
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs font-semibold text-amber-950 flex items-start gap-2">
                    <AlertTriangle
                      className="w-4 h-4 text-amber-700 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>
                      <strong>{t.offlineDoNotLabel} </strong>
                      {item.doNot[language]}
                    </span>
                  </div>
                </div>
              </article>
            </InteractiveGlowCard>
          );
        })}
      </div>
    </section>
  );
};
