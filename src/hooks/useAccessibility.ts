import { useCallback, useEffect, useState } from 'react';
import { LanguageCode } from '../i18n';

export type FontScaleMode = 'normal' | 'large' | 'xlarge';

export interface AccessibilitySettings {
  highContrast: boolean;
  fontScale: FontScaleMode;
  dyslexiaSpacing: boolean;
  reducedMotion: boolean;
}

const STORAGE_KEY = 'tawaf_a11y_settings_v1';

const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  fontScale: 'normal',
  dyslexiaSpacing: false,
  reducedMotion: false,
};

const TTS_LOCALE: Record<LanguageCode, string> = {
  ar: 'ar-SA',
  en: 'en-US',
  ur: 'ur-PK',
  id: 'id-ID',
};

export function useAccessibility(language: LanguageCode) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AccessibilitySettings>;
        return {
          highContrast: Boolean(parsed.highContrast),
          fontScale:
            parsed.fontScale === 'large' || parsed.fontScale === 'xlarge'
              ? parsed.fontScale
              : 'normal',
          dyslexiaSpacing: Boolean(parsed.dyslexiaSpacing),
          reducedMotion: Boolean(parsed.reducedMotion),
        };
      }
    } catch {
      // Ignore storage access restrictions
    }
    return DEFAULT_SETTINGS;
  });

  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const ttsSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('a11y-high-contrast', settings.highContrast);
    root.classList.toggle('a11y-dyslexia', settings.dyslexiaSpacing);
    root.classList.toggle('a11y-reduced-motion', settings.reducedMotion);
    root.classList.remove('a11y-font-large', 'a11y-font-xlarge');
    if (settings.fontScale === 'large') root.classList.add('a11y-font-large');
    if (settings.fontScale === 'xlarge') root.classList.add('a11y-font-xlarge');

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage failures
    }
  }, [settings]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
  }, []);

  const speakText = useCallback(
    (id: string, text: string) => {
      if (!ttsSupported || !text.trim()) return;
      if (speakingId === id) {
        stopSpeaking();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = TTS_LOCALE[language];
      utterance.rate = settings.dyslexiaSpacing ? 0.9 : 0.96;

      utterance.onend = () => {
        setSpeakingId((curr) => (curr === id ? null : curr));
      };
      utterance.onerror = () => {
        setSpeakingId((curr) => (curr === id ? null : curr));
      };

      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    },
    [language, settings.dyslexiaSpacing, speakingId, stopSpeaking, ttsSupported]
  );

  const resetAccessibility = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    stopSpeaking();
  }, [stopSpeaking]);

  return {
    settings,
    setSettings,
    resetAccessibility,
    ttsSupported,
    speakingId,
    speakText,
    stopSpeaking,
  };
}
