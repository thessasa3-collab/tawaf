import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Accessibility,
  Contrast,
  RotateCcw,
  Sparkles,
  Type,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { LanguageCode, UI_TRANSLATIONS } from '../i18n';
import { AccessibilitySettings, FontScaleMode } from '../hooks/useAccessibility';

interface AccessibilityModalProps {
  open: boolean;
  onClose: () => void;
  language: LanguageCode;
  settings: AccessibilitySettings;
  onChangeSettings: React.Dispatch<React.SetStateAction<AccessibilitySettings>>;
  onReset: () => void;
  ttsSupported: boolean;
  speakingId: string | null;
  onSpeakSample: (id: string, text: string) => void;
  onStopSpeaking: () => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({
  open,
  onClose,
  language,
  settings,
  onChangeSettings,
  onReset,
  ttsSupported,
  speakingId,
  onSpeakSample,
  onStopSpeaking,
}) => {
  const t = UI_TRANSLATIONS[language];
  const isReadingSample = speakingId === 'a11y-sample';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="a11y-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="no-print fixed inset-0 z-50 bg-black/65 flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="a11y-surface bg-[#FAF8F4] w-full sm:max-w-lg max-h-[90vh] rounded-t-2xl sm:rounded-xl border-2 border-[#0D5240] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-[#0D5240] text-white border-b-2 border-[#B58E46] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <Accessibility className="w-5 h-5 text-[#E6C77A] shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <h2
                    id="a11y-modal-title"
                    className="font-display text-base sm:text-lg font-extrabold truncate"
                  >
                    {t.a11yTitle}
                  </h2>
                  <p className="text-xs text-[#E6C77A] truncate">{t.a11ySubtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t.modalClose}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* High Contrast Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={settings.highContrast}
                onClick={() =>
                  onChangeSettings((prev) => ({
                    ...prev,
                    highContrast: !prev.highContrast,
                  }))
                }
                className={`w-full p-4 rounded-xl border-2 flex items-center justify-between gap-4 text-start cursor-pointer transition-colors ${
                  settings.highContrast
                    ? 'bg-[#083D2F] text-white border-[#E6C77A]'
                    : 'bg-white border-[#DDD4C2] text-[#111D18] hover:border-[#0D5240]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Contrast
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      settings.highContrast ? 'text-[#E6C77A]' : 'text-[#0D5240]'
                    }`}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-bold text-sm">{t.a11yContrastLabel}</p>
                    <p
                      className={`text-xs mt-0.5 ${
                        settings.highContrast ? 'text-slate-200' : 'text-slate-600'
                      }`}
                    >
                      {t.a11yContrastDesc}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-extrabold shrink-0 ${
                    settings.highContrast
                      ? 'bg-[#E6C77A] text-[#082D23]'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {settings.highContrast ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Font Size Selector */}
              <div className="a11y-surface bg-white border-2 border-[#DDD4C2] rounded-xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-bold text-[#0D5240]">
                  <Type className="w-4 h-4 text-[#B58E46]" aria-hidden="true" />
                  <span>{t.a11yFontSizeLabel}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { value: 'normal' as FontScaleMode, label: t.a11yFontNormal },
                      { value: 'large' as FontScaleMode, label: t.a11yFontLarge },
                      { value: 'xlarge' as FontScaleMode, label: t.a11yFontXLarge },
                    ] as const
                  ).map((opt) => {
                    const active = settings.fontScale === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() =>
                          onChangeSettings((prev) => ({
                            ...prev,
                            fontScale: opt.value,
                          }))
                        }
                        className={`min-h-[44px] px-2.5 py-2 rounded-lg text-xs font-bold border-2 cursor-pointer transition-colors ${
                          active
                            ? 'bg-[#0D5240] text-white border-[#B58E46]'
                            : 'bg-[#FAF8F4] text-[#111D18] border-[#DDD4C2] hover:border-[#0D5240]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dyslexia / Reading Spacing Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={settings.dyslexiaSpacing}
                onClick={() =>
                  onChangeSettings((prev) => ({
                    ...prev,
                    dyslexiaSpacing: !prev.dyslexiaSpacing,
                  }))
                }
                className={`w-full p-4 rounded-xl border-2 flex items-center justify-between gap-4 text-start cursor-pointer transition-colors ${
                  settings.dyslexiaSpacing
                    ? 'bg-[#083D2F] text-white border-[#E6C77A]'
                    : 'bg-white border-[#DDD4C2] text-[#111D18] hover:border-[#0D5240]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Type
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      settings.dyslexiaSpacing ? 'text-[#E6C77A]' : 'text-[#0D5240]'
                    }`}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-bold text-sm">{t.a11yDyslexiaLabel}</p>
                    <p
                      className={`text-xs mt-0.5 ${
                        settings.dyslexiaSpacing ? 'text-slate-200' : 'text-slate-600'
                      }`}
                    >
                      {t.a11yDyslexiaDesc}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-extrabold shrink-0 ${
                    settings.dyslexiaSpacing
                      ? 'bg-[#E6C77A] text-[#082D23]'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {settings.dyslexiaSpacing ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Reduced Motion Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={settings.reducedMotion}
                onClick={() =>
                  onChangeSettings((prev) => ({
                    ...prev,
                    reducedMotion: !prev.reducedMotion,
                  }))
                }
                className={`w-full p-4 rounded-xl border-2 flex items-center justify-between gap-4 text-start cursor-pointer transition-colors ${
                  settings.reducedMotion
                    ? 'bg-[#083D2F] text-white border-[#E6C77A]'
                    : 'bg-white border-[#DDD4C2] text-[#111D18] hover:border-[#0D5240]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Sparkles
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      settings.reducedMotion ? 'text-[#E6C77A]' : 'text-[#0D5240]'
                    }`}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-bold text-sm">{t.a11yMotionLabel}</p>
                    <p
                      className={`text-xs mt-0.5 ${
                        settings.reducedMotion ? 'text-slate-200' : 'text-slate-600'
                      }`}
                    >
                      {t.a11yMotionDesc}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-extrabold shrink-0 ${
                    settings.reducedMotion
                      ? 'bg-[#E6C77A] text-[#082D23]'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {settings.reducedMotion ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Offline Voice Read-Aloud Controls */}
              {ttsSupported && (
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      onSpeakSample('a11y-sample', `${t.heroTitle}. ${t.heroDesc}`)
                    }
                    className="flex-1 min-h-[46px] px-4 py-2 rounded-lg bg-[#0D5240] hover:bg-[#083D2F] text-white font-bold text-xs sm:text-sm border-2 border-[#B58E46] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isReadingSample ? (
                      <VolumeX className="w-4 h-4 text-[#E6C77A]" aria-hidden="true" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-[#E6C77A]" aria-hidden="true" />
                    )}
                    <span>{isReadingSample ? t.stopReadingBtn : t.readAloudBtn}</span>
                  </button>

                  {speakingId && (
                    <button
                      type="button"
                      onClick={onStopSpeaking}
                      className="min-h-[46px] px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <VolumeX className="w-4 h-4" aria-hidden="true" />
                      <span>{t.stopReadingBtn}</span>
                    </button>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={onReset}
                className="w-full min-h-[44px] px-4 py-2 rounded-lg bg-white border-2 border-[#DDD4C2] hover:border-[#0D5240] text-[#111D18] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.a11yResetBtn}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
