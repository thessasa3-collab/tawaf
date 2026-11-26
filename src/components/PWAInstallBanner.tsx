import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Download, Share, WifiOff, X } from 'lucide-react';
import { LanguageCode, UI_TRANSLATIONS } from '../i18n';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAProps {
  language: LanguageCode;
}

export const OfflineIndicator: React.FC<PWAProps> = ({ language }) => {
  const isOnline = useOnlineStatus();
  const t = UI_TRANSLATIONS[language];

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="no-print bg-amber-900 text-amber-50 border-b-2 border-[#C59B43] px-4 py-2.5 text-xs sm:text-sm"
    >
      <div className="max-w-7xl mx-auto flex items-center gap-2.5">
        <WifiOff className="w-4 h-4 text-[#E6C77A] shrink-0" aria-hidden="true" />
        <p className="font-semibold">
          <strong className="text-[#FDE68A]">{t.offlineBannerTitle}: </strong>
          {t.offlineBannerDesc}
        </p>
      </div>
    </div>
  );
};

export const PWAInstallButton: React.FC<PWAProps> = ({ language }) => {
  const t = UI_TRANSLATIONS[language];
  const { canPrompt, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [iosModalOpen, setIosModalOpen] = useState(false);

  if (isInstalled) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#083D2F] border border-[#B58E46]/50 text-[#E6C77A] text-xs font-bold whitespace-nowrap">
        <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{t.pwaInstalledBadge}</span>
      </span>
    );
  }

  if (!canPrompt && !isIOS) {
    return null;
  }

  const handleClick = async () => {
    if (canPrompt) {
      await promptInstall();
    } else if (isIOS) {
      setIosModalOpen(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => void handleClick()}
        className="btn-interactive min-h-[38px] px-3 py-1.5 rounded-lg bg-[#B58E46] hover:bg-[#c8a052] text-[#082D23] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
      >
        <Download className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{t.pwaInstallBtn}</span>
      </button>

      <AnimatePresence>
        {iosModalOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-ios-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="no-print fixed inset-0 z-50 bg-black/65 flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="a11y-surface bg-[#FAF8F4] w-full sm:max-w-md rounded-t-2xl sm:rounded-xl border-2 border-[#0D5240] p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between gap-3 border-b border-[#DDD4C2] pb-3">
                <h2
                  id="pwa-ios-title"
                  className="font-display text-base font-extrabold text-[#0D5240] flex items-center gap-2"
                >
                  <Share className="w-4 h-4 text-[#B58E46]" aria-hidden="true" />
                  <span>{t.pwaIosTitle}</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setIosModalOpen(false)}
                  aria-label={t.modalClose}
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
              <div className="space-y-2.5 text-sm font-semibold text-[#111D18] leading-relaxed">
                <p>{t.pwaIosStep1}</p>
                <p>{t.pwaIosStep2}</p>
              </div>
              <button
                type="button"
                onClick={() => setIosModalOpen(false)}
                className="w-full min-h-[44px] rounded-lg bg-[#0D5240] text-white font-bold text-sm cursor-pointer"
              >
                {t.modalClose}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
