import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Clock,
  Globe,
  HeartPulse,
  Loader2,
  MapPin,
  PhoneCall,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Stethoscope,
  X,
} from 'lucide-react';
import { Body3DSelector } from './components/Body3DSelector';
import { InteractiveGlowCard } from './components/InteractiveGlowCard';
import { PrintableTriageCard } from './components/PrintableTriageCard';
import { TawafEmblem } from './components/TawafEmblem';
import {
  BODY_PART_LABELS,
  BodyPartId,
  HEALTH_REMINDER_CARDS,
  LANGUAGES,
  LanguageCode,
  UI_TRANSLATIONS,
} from './i18n';
import {
  AITriageResponsePayload,
  buildTriageResultFromAI,
  HARAM_ZONES,
  HaramZone,
  QUICK_SYMPTOM_PRESETS,
  TriageLevel,
  TriageResult,
  validateTriageInput,
  ValidationError,
} from './triageEngine';

const LEVEL_STYLES: Record<
  TriageLevel,
  {
    headerBg: string;
    border: string;
    text: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  critical: {
    headerBg: 'bg-red-800 text-white',
    border: 'border-red-700',
    text: 'text-red-900',
    icon: ShieldAlert,
  },
  urgent: {
    headerBg: 'bg-amber-600 text-white',
    border: 'border-amber-600',
    text: 'text-amber-950',
    icon: AlertTriangle,
  },
  stable: {
    headerBg: 'bg-[#082D23] text-white',
    border: 'border-[#082D23]',
    text: 'text-[#082D23]',
    icon: CheckCircle2,
  },
};

export default function App() {
  const [language, setLanguage] = useState<LanguageCode>('ar');
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPartId | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [zone, setZone] = useState<HaramZone>('mataf');
  const [ageText, setAgeText] = useState('');
  const [conscious, setConscious] = useState<'conscious' | 'confused' | 'unconscious'>(
    'conscious'
  );

  const [error, setError] = useState<ValidationError | null>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [history, setHistory] = useState<TriageResult[]>([]);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const symptomsInputRef = useRef<HTMLTextAreaElement | null>(null);
  const ageInputRef = useRef<HTMLInputElement | null>(null);
  const resultSectionRef = useRef<HTMLDivElement | null>(null);
  const activeControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const activeLangMeta =
    LANGUAGES.find((item) => item.code === language) ?? LANGUAGES[0];
  const t = UI_TRANSLATIONS[language];

  useEffect(() => {
    document.documentElement.lang = activeLangMeta.code;
    document.documentElement.dir = activeLangMeta.dir;
  }, [activeLangMeta]);

  useEffect(() => {
    isMountedRef.current = true;
    try {
      const savedDraft = window.sessionStorage.getItem('tawaf_draft_v1');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft) as {
          language?: LanguageCode;
          symptoms?: string;
          zone?: HaramZone;
          ageText?: string;
          conscious?: 'conscious' | 'confused' | 'unconscious';
          selectedBodyPart?: BodyPartId | null;
        };
        if (parsed.language && ['ar', 'en', 'ur', 'id'].includes(parsed.language)) {
          setLanguage(parsed.language);
        }
        if (typeof parsed.symptoms === 'string') setSymptoms(parsed.symptoms);
        if (parsed.zone && parsed.zone in HARAM_ZONES) setZone(parsed.zone);
        if (typeof parsed.ageText === 'string') setAgeText(parsed.ageText);
        if (
          parsed.conscious &&
          ['conscious', 'confused', 'unconscious'].includes(parsed.conscious)
        ) {
          setConscious(parsed.conscious);
        }
        if (parsed.selectedBodyPart !== undefined) {
          setSelectedBodyPart(parsed.selectedBodyPart);
        }
        window.sessionStorage.removeItem('tawaf_draft_v1');
      }
    } catch {
      // Ignore storage access errors inside restricted iframes
    }
    return () => {
      isMountedRef.current = false;
      activeControllerRef.current?.abort();
    };
  }, []);

  const handleLanguageChange = (newLang: LanguageCode) => {
    setLanguage(newLang);
    setError(null);
    setConnectionError(false);
    setSuccessMessage(null);
  };

  const handleReloadAfterConnection = () => {
    try {
      window.sessionStorage.setItem(
        'tawaf_draft_v1',
        JSON.stringify({
          language,
          symptoms,
          zone,
          ageText,
          conscious,
          selectedBodyPart,
        })
      );
    } catch {
      // Ignore storage errors
    }
    window.location.reload();
  };

  const runTriageAnalysis = async () => {
    if (isAnalyzing) return;

    const inputPayload = {
      language,
      symptoms,
      zone,
      ageText,
      conscious,
      bodyPart: selectedBodyPart,
    };

    const validation = validateTriageInput(inputPayload);
    if (validation.ok === false) {
      setError(validation.error);
      setConnectionError(false);
      setSuccessMessage(null);
      if (validation.error.field === 'symptoms') {
        symptomsInputRef.current?.focus();
      } else if (validation.error.field === 'age') {
        ageInputRef.current?.focus();
      }
      return;
    }

    setError(null);
    setConnectionError(false);
    setSuccessMessage(null);
    setIsAnalyzing(true);
    setIsRetrying(false);

    try {
      const maxClientAttempts = 2;
      for (let attempt = 0; attempt < maxClientAttempts; attempt++) {
        const controller = new AbortController();
        activeControllerRef.current = controller;
        const timeoutId = window.setTimeout(() => controller.abort(), 50000);

        try {
          const response = await fetch('/api/triage/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              language,
              symptoms: validation.symptoms,
              zone,
              age: validation.ageValue,
              conscious,
              bodyPart: selectedBodyPart,
            }),
          });

          const data = (await response.json().catch(() => null)) as
            | (AITriageResponsePayload & {
                error?: undefined;
                field?: undefined;
                retryable?: boolean;
                retryAfterSeconds?: number;
              })
            | {
                error?: string;
                field?: 'symptoms' | 'age';
                code?: string;
                retryable?: boolean;
                retryAfterSeconds?: number;
              }
            | null;

          if (!response.ok || !data || ('error' in data && data.error)) {
            const shouldRetry =
              attempt === 0 &&
              (response.status === 503 ||
                (data && 'code' in data && data.code === 'GEMINI_503'));

            if (shouldRetry) {
              if (!isMountedRef.current) return;
              setIsRetrying(true);
              const waitMs = Math.min(
                3000,
                Math.max(1500, ((data && 'retryAfterSeconds' in data && data.retryAfterSeconds) || 4) * 500)
              );
              await new Promise((resolve) => window.setTimeout(resolve, waitMs));
              if (!isMountedRef.current) return;
              continue;
            }

            const field = data && 'field' in data && data.field ? data.field : 'symptoms';
            const message =
              (data && 'error' in data && typeof data.error === 'string' && data.error) ||
              t.aiFallbackError;
            if (!isMountedRef.current) return;
            setError({ field, message });
            setConnectionError(response.status >= 429 || !data);
            setSuccessMessage(null);
            return;
          }

          const triageResult = buildTriageResultFromAI(
            inputPayload,
            validation.ageValue,
            validation.symptoms,
            data as AITriageResponsePayload
          );

          if (!isMountedRef.current) return;
          setError(null);
          setConnectionError(false);
          setResult(triageResult);
          setSuccessMessage(`${t.successTitle} (${triageResult.priorityCode})`);
          setHistory((prev) => [triageResult, ...prev].slice(0, 5));

          if (window.innerWidth < 1024 && resultSectionRef.current) {
            resultSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          return;
        } catch (err: unknown) {
          const isAbort = err instanceof DOMException && err.name === 'AbortError';
          if (attempt === 0 && !isAbort && isMountedRef.current) {
            setIsRetrying(true);
            await new Promise((resolve) => window.setTimeout(resolve, 1800));
            if (!isMountedRef.current) return;
            continue;
          }
          if (!isMountedRef.current) return;
          setError({ field: 'symptoms', message: t.aiFallbackError });
          setConnectionError(true);
          setSuccessMessage(null);
          return;
        } finally {
          window.clearTimeout(timeoutId);
          if (activeControllerRef.current === controller) {
            activeControllerRef.current = null;
          }
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsRetrying(false);
        setIsAnalyzing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void runTriageAnalysis();
  };

  const handleReset = () => {
    setSymptoms('');
    setAgeText('');
    setZone('mataf');
    setConscious('conscious');
    setSelectedBodyPart(null);
    setActivePresetId(null);
    setError(null);
    setConnectionError(false);
    setSuccessMessage(null);
    setResult(null);
    try {
      window.sessionStorage.removeItem('tawaf_draft_v1');
    } catch {
      // Ignore storage errors
    }
    symptomsInputRef.current?.focus();
  };

  const handlePresetClick = (preset: (typeof QUICK_SYMPTOM_PRESETS)[number]) => {
    setSymptoms(preset.symptoms[language]);
    setConscious(preset.conscious);
    setSelectedBodyPart(preset.bodyPart);
    setActivePresetId(preset.id);
    setError(null);
    setSuccessMessage(null);
    symptomsInputRef.current?.focus();
  };

  const LevelIcon = result ? LEVEL_STYLES[result.level].icon : Stethoscope;

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen flex flex-col bg-[#F4F5F4] text-[#0B1215]">
      {/* Official Institutional Header (Strict 3-Zone Top Bar Contract) */}
      <header className="no-print sticky top-0 z-30 bg-[#082D23] text-white border-b-2 border-[#C59B43]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Single-line Brand Wordmark + Emblem */}
          <a
            href="#triage-workspace"
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C77A] rounded-md px-1"
          >
            <TawafEmblem className="w-9 h-9 shrink-0" />
            <span className="font-display text-xl font-extrabold tracking-tight text-white">
              {t.brandName}
            </span>
          </a>

          {/* Zone 2: Concise Single-Line Navigation Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-200"
          >
            <a
              href="#body-3d-section"
              className="hover:text-[#E6C77A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {t.navBody3D}
            </a>
            <a
              href="#triage-workspace"
              className="hover:text-[#E6C77A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {t.navTriage}
            </a>
            <a
              href="#paramedic-report"
              className="hover:text-[#E6C77A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {t.navParamedic}
            </a>
            <a
              href="#haram-points"
              className="hover:text-[#E6C77A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {t.navPoints}
            </a>
            <a
              href="#health-reminders"
              className="hover:text-[#E6C77A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {t.navHealthReminders}
            </a>
          </nav>

          {/* Zone 3: Single Primary Emergency CTA */}
          <div className="shrink-0">
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => setEmergencyModalOpen(true)}
              className="btn-interactive min-h-[44px] px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-sm font-bold rounded-lg border border-red-400/50 whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <PhoneCall className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="tabular-nums">{t.emergencyBtn}</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Ministry-Inspired Portal Hero Banner + 4-Language Selector */}
      <section className="no-print relative overflow-hidden bg-[#0B392C] text-white border-b-4 border-[#C59B43]">
        {/* Soft Architectural Ambient Radial Light */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 start-1/4 w-[520px] h-[520px] rounded-full opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgba(197,155,67,0.38) 0%, rgba(11,57,44,0) 70%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
          {/* 4-Language Switcher Bar (Placed cleanly inside Hero Toolbar) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-5">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-luminous-gold">{t.heroEyebrow}</span>
            </div>

            <div
              role="group"
              aria-label="Language selector"
              className="flex flex-wrap items-center gap-1.5 bg-[#06221A] p-1 rounded-lg border border-[#C59B43]/50"
            >
              <Globe className="w-4 h-4 text-[#E6C77A] mx-1.5 shrink-0" aria-hidden="true" />
              {LANGUAGES.map((lang) => {
                const active = language === lang.code;
                return (
                  <motion.button
                    key={lang.code}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleLanguageChange(lang.code)}
                    aria-pressed={active}
                    className={`btn-interactive min-h-[38px] px-3 py-1.5 text-xs font-bold rounded-md cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#C59B43] text-[#06221A] shadow-sm'
                        : 'text-slate-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {lang.nativeLabel}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Institutional Title & Emblem Lockup */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-9 space-y-3">
              <motion.h1
                key={`title-${language}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-2xl sm:text-4xl font-extrabold text-white leading-tight [text-wrap:balance]"
              >
                {t.heroTitle}
              </motion.h1>
              <motion.p
                key={`desc-${language}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="text-sm sm:text-base text-slate-200 max-w-3xl leading-relaxed"
              >
                {t.heroDesc}
              </motion.p>
            </div>

            <div className="lg:col-span-3 flex lg:justify-end">
              <InteractiveGlowCard
                scrollReveal={false}
                glowColor="rgba(230, 199, 122, 0.22)"
                className="bg-[#06221A] border border-[#C59B43]/70 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <TawafEmblem className="w-12 h-12 shrink-0" />
                  <div className="text-xs space-y-0.5">
                    <p className="font-display font-bold text-luminous-gold text-sm">
                      {t.brandName}
                    </p>
                    <p className="text-slate-200 font-medium">{t.brandSub}</p>
                  </div>
                </div>
              </InteractiveGlowCard>
            </div>
          </div>

          {/* High-Contrast Service Highlights Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-bold">
            <InteractiveGlowCard
              scrollReveal={false}
              glowColor="rgba(197, 155, 67, 0.2)"
              className="bg-[#06221A] border border-white/15 rounded-lg px-4 py-3 text-slate-100"
            >
              <span>01 · {t.stripLangs}</span>
            </InteractiveGlowCard>
            <InteractiveGlowCard
              scrollReveal={false}
              glowColor="rgba(197, 155, 67, 0.2)"
              className="bg-[#06221A] border border-white/15 rounded-lg px-4 py-3 text-slate-100"
            >
              <span>02 · {t.strip3D}</span>
            </InteractiveGlowCard>
            <InteractiveGlowCard
              scrollReveal={false}
              glowColor="rgba(230, 199, 122, 0.24)"
              className="bg-[#06221A] border border-[#C59B43]/40 rounded-lg px-4 py-3 text-[#E6C77A]"
            >
              <span>03 · {t.stripCard}</span>
            </InteractiveGlowCard>
          </div>
        </div>
      </section>

      <main className="no-print flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-12">
        {/* Primary Interactive Workspace: 3D Body + Form (7 cols) | Result + Card + Paramedic Brief (5 cols) */}
        <section
          id="triage-workspace"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start"
        >
          {/* Left/Start Column: 3D Body Locator + Triage Form */}
          <div className="lg:col-span-7 space-y-6">
            <div id="body-3d-section">
              <Body3DSelector
                language={language}
                selectedPart={selectedBodyPart}
                onSelectPart={setSelectedBodyPart}
              />
            </div>

            {/* Triage Input Form */}
            <div className="bg-white border-2 border-slate-300 rounded-xl p-5 sm:p-7 space-y-6 shadow-xs">
              <div className="flex items-center justify-between gap-4 border-b-2 border-slate-200 pb-4">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#082D23]">
                    {t.formTitle}
                  </h2>
                  <p className="text-sm text-slate-600 mt-0.5">{t.formSubtitle}</p>
                </div>
                <Activity className="w-6 h-6 text-[#082D23] shrink-0" aria-hidden="true" />
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* High-Contrast Animated Error & Success Feedback */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      key={`error-${error.field}-${error.message}`}
                      role="alert"
                      initial={{ opacity: 0, y: -6, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="bg-red-50 border-2 border-red-700 rounded-lg p-4 flex items-start gap-3 text-red-950"
                    >
                      <AlertCircle
                        className="w-5 h-5 text-red-700 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <div className="space-y-2 text-sm flex-1">
                        <p className="font-extrabold">{t.errorTitle}</p>
                        <p className="text-red-900 font-medium leading-relaxed">
                          {error.message}
                        </p>
                        {connectionError && (
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => void runTriageAnalysis()}
                              disabled={isAnalyzing}
                              className="btn-interactive inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-md bg-red-700 hover:bg-red-800 disabled:opacity-60 text-white text-xs font-bold cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                              <span>{t.retryConnectionBtn}</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleReloadAfterConnection}
                              disabled={isAnalyzing}
                              className="btn-interactive inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-md bg-white hover:bg-red-100 border border-red-400 text-red-950 text-xs font-bold cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                              <span>{t.reloadPageBtn}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {successMessage && !error && (
                    <motion.div
                      key={`success-${successMessage}`}
                      role="status"
                      initial={{ opacity: 0, y: -6, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="bg-emerald-50 border-2 border-[#082D23] rounded-lg p-4 flex items-start gap-3 text-[#082D23]"
                    >
                      <CheckCircle2
                        className="w-5 h-5 text-[#082D23] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <div className="space-y-0.5 text-sm">
                        <p className="font-extrabold">{t.successTitle}</p>
                        <p className="font-medium leading-relaxed">{successMessage}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Selected 3D Body Part Indicator */}
                <div className="bg-slate-100 border border-slate-300 rounded-lg px-4 py-3 flex items-center justify-between gap-3 text-sm transition-colors">
                  <span className="font-bold text-slate-800">{t.selectedAreaLabel}</span>
                  <span className="font-extrabold text-[#082D23]">
                    {selectedBodyPart
                      ? BODY_PART_LABELS[selectedBodyPart][language]
                      : t.noAreaSelected}
                  </span>
                </div>

                {/* Symptoms Textarea */}
                <div className="space-y-2">
                  <label
                    htmlFor="symptoms-input"
                    className="block text-sm font-bold text-[#0B1215]"
                  >
                    {t.symptomsLabel}{' '}
                    <span className="text-red-700" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <textarea
                    ref={symptomsInputRef}
                    id="symptoms-input"
                    name="symptoms"
                    rows={4}
                    value={symptoms}
                    onChange={(e) => {
                      setSymptoms(e.target.value);
                      setActivePresetId(null);
                      if (error?.field === 'symptoms') setError(null);
                    }}
                    placeholder={t.symptomsPlaceholder}
                    aria-invalid={error?.field === 'symptoms'}
                    className={`w-full rounded-lg border-2 px-4 py-3 text-base text-[#0B1215] placeholder:text-slate-500 bg-white focus:outline-none focus:ring-2 transition-colors ${
                      error?.field === 'symptoms'
                        ? 'border-red-700 focus:ring-red-200'
                        : 'border-slate-300 focus:border-[#082D23] focus:ring-[#082D23]/20'
                    }`}
                  />
                  <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                    <span>{t.symptomsHelp}</span>
                    <span className="tabular-nums font-bold">
                      {symptoms.trim().length} {t.charsUnit}
                    </span>
                  </div>
                </div>

                {/* Quick Presets with Visual Active Confirmation */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-700">
                    {t.presetsLabel}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_SYMPTOM_PRESETS.map((preset) => {
                      const isPresetActive = activePresetId === preset.id;
                      return (
                        <motion.button
                          key={preset.id}
                          type="button"
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handlePresetClick(preset)}
                          aria-pressed={isPresetActive}
                          className={`btn-interactive min-h-[40px] px-3 py-1.5 text-xs font-bold rounded-lg border cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                            isPresetActive
                              ? 'bg-[#082D23] text-white border-[#C59B43] ring-2 ring-[#C59B43]/35 shadow-sm'
                              : 'border-slate-300 bg-slate-100 hover:bg-[#082D23] hover:text-white hover:border-[#082D23] text-slate-900'
                          }`}
                        >
                          {isPresetActive && (
                            <Check className="w-3.5 h-3.5 text-[#E6C77A] shrink-0" aria-hidden="true" />
                          )}
                          <span>{preset.label[language]}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Awareness Segmented Control */}
                <div className="space-y-2">
                  <span className="block text-sm font-bold text-[#0B1215]">
                    {t.awarenessLabel}
                  </span>
                  <div
                    role="group"
                    aria-label={t.awarenessLabel}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-slate-200 rounded-lg"
                  >
                    {[
                      { value: 'conscious' as const, label: t.awareConscious },
                      { value: 'confused' as const, label: t.awareConfused },
                      { value: 'unconscious' as const, label: t.awareUnconscious },
                    ].map((option) => {
                      const active = conscious === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          type="button"
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setConscious(option.value)}
                          aria-pressed={active}
                          className={`btn-interactive min-h-[44px] px-3 py-2 text-sm font-bold rounded-md cursor-pointer whitespace-nowrap ${
                            active
                              ? 'bg-[#082D23] text-white shadow-sm ring-1 ring-[#C59B43]'
                              : 'text-slate-800 hover:bg-white/75'
                          }`}
                        >
                          {option.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Haram Zone & Age */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="zone-select"
                      className="block text-sm font-bold text-[#0B1215]"
                    >
                      {t.zoneLabel}
                    </label>
                    <select
                      id="zone-select"
                      value={zone}
                      onChange={(e) => setZone(e.target.value as HaramZone)}
                      className="w-full min-h-[46px] rounded-lg border-2 border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-[#0B1215] focus:outline-none focus:border-[#082D23] focus:ring-2 focus:ring-[#082D23]/20"
                    >
                      {Object.entries(HARAM_ZONES).map(([key, info]) => (
                        <option key={key} value={key}>
                          {info.labels[language]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="age-input"
                      className="block text-sm font-bold text-[#0B1215]"
                    >
                      {t.ageLabel}
                    </label>
                    <input
                      ref={ageInputRef}
                      id="age-input"
                      type="text"
                      inputMode="numeric"
                      value={ageText}
                      onChange={(e) => {
                        setAgeText(e.target.value);
                        if (error?.field === 'age') setError(null);
                      }}
                      placeholder={t.agePlaceholder}
                      aria-invalid={error?.field === 'age'}
                      className={`w-full min-h-[46px] rounded-lg border-2 px-3 py-2.5 text-sm font-semibold text-[#0B1215] placeholder:text-slate-500 bg-white tabular-nums focus:outline-none focus:ring-2 ${
                        error?.field === 'age'
                          ? 'border-red-700 focus:ring-red-200'
                          : 'border-slate-300 focus:border-[#082D23] focus:ring-[#082D23]/20'
                      }`}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <motion.button
                    type="submit"
                    disabled={isAnalyzing}
                    whileTap={isAnalyzing ? undefined : { scale: 0.97 }}
                    className="btn-interactive flex-1 min-h-[48px] px-6 py-3 bg-[#082D23] hover:bg-[#0E4A3A] disabled:opacity-75 disabled:cursor-wait text-white font-bold text-base rounded-lg border-2 border-[#C59B43] flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {isAnalyzing ? (
                      <Loader2
                        className="w-5 h-5 text-[#E6C77A] shrink-0 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <HeartPulse className="w-5 h-5 text-[#E6C77A] shrink-0" aria-hidden="true" />
                    )}
                    <span>
                      {isAnalyzing
                        ? isRetrying
                          ? t.retryingBtn
                          : t.submittingBtn
                        : t.submitBtn}
                    </span>
                  </motion.button>

                  <motion.button
                    type="button"
                    disabled={isAnalyzing}
                    whileTap={isAnalyzing ? undefined : { scale: 0.97 }}
                    onClick={handleReset}
                    className="btn-interactive min-h-[48px] px-5 py-3 bg-white hover:bg-slate-100 disabled:opacity-60 border-2 border-slate-400 text-[#0B1215] font-bold text-sm rounded-lg flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{t.resetBtn}</span>
                  </motion.button>
                </div>
              </form>
            </div>
          </div>

          {/* Right/End Column: Triage Result + Printable Ambulance Card + Paramedic Brief */}
          <div ref={resultSectionRef} className="lg:col-span-5 space-y-6">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  {/* 1. Primary Triage Assessment Card */}
                  <InteractiveGlowCard
                    scrollReveal={false}
                    className={`bg-white border-2 rounded-xl shadow-xs ${LEVEL_STYLES[result.level].border}`}
                  >
                    <article aria-live="polite">
                      <div className={`p-5 space-y-2.5 ${LEVEL_STYLES[result.level].headerBg}`}>
                        <div className="flex items-center justify-between gap-2 text-xs font-bold opacity-95">
                          <span className="tabular-nums">{result.id}</span>
                          <div className="flex items-center gap-2">
                            <span className="tabular-nums">{result.timestamp}</span>
                            <span aria-hidden="true">·</span>
                            <span>{result.zoneLabel}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/15 shrink-0">
                            <LevelIcon className="w-5 h-5 text-white" aria-hidden="true" />
                          </span>
                          <div className="space-y-1">
                            <p className="text-xs font-extrabold tracking-wide text-[#FDE68A]">
                              {result.levelTitle}
                            </p>
                            <h3 className="font-display text-lg font-extrabold text-white leading-snug">
                              {result.categoryTitle}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 space-y-4">
                        <p className="text-sm font-medium text-[#0B1215] leading-relaxed">
                          {result.summary}
                        </p>

                        <div className="space-y-2.5 border-t border-slate-200 pt-4">
                          <h4 className="text-sm font-extrabold text-[#082D23]">
                            {t.stepsTitle}
                          </h4>
                          <ol className="space-y-2">
                            {result.firstAidSteps.map((step, index) => (
                              <li
                                key={`${index}-${step}`}
                                className="flex items-start gap-2.5 text-sm text-slate-800 font-medium leading-relaxed"
                              >
                                <span className="font-extrabold text-[#082D23] tabular-nums shrink-0">
                                  {String(index + 1).padStart(2, '0')}.
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        <div className="border-t border-slate-200 pt-4 flex items-start gap-2 text-sm font-semibold text-slate-900">
                          <MapPin
                            className="w-4 h-4 text-[#082D23] shrink-0 mt-1"
                            aria-hidden="true"
                          />
                          <p className="leading-relaxed">{result.nearestCarePoint}</p>
                        </div>

                        <div className="bg-slate-100 border border-slate-300 rounded-lg p-3.5 text-xs text-slate-900 leading-relaxed font-medium">
                          <span className="font-extrabold">{t.safetyTitle} </span>
                          {result.warningSigns}
                        </div>

                        {result.callEmergency && (
                          <a
                            href="tel:997"
                            className="btn-interactive w-full min-h-[48px] px-4 py-3 bg-red-700 hover:bg-red-800 text-white font-extrabold text-sm rounded-lg flex items-center justify-center gap-2 shadow-sm"
                          >
                            <PhoneCall className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span className="tabular-nums">{t.call997Btn}</span>
                          </a>
                        )}
                      </div>
                    </article>
                  </InteractiveGlowCard>

                  {/* 2. Printable Ambulance Card */}
                  <PrintableTriageCard language={language} result={result} />

                  {/* 3. Dedicated Paramedic & First Responder Advisory Report */}
                  <InteractiveGlowCard
                    scrollReveal={false}
                    className="bg-white border-2 border-[#C59B43] rounded-xl shadow-xs"
                  >
                    <section id="paramedic-report">
                      <div className="px-5 py-4 bg-[#0B392C] text-white flex items-start justify-between gap-3 border-b-2 border-[#C59B43]">
                        <div>
                          <h3 className="font-display text-base font-extrabold text-white">
                            {t.paramedicTitle}
                          </h3>
                          <p className="text-xs text-[#E6C77A] mt-0.5">
                            {t.paramedicSubtitle}
                          </p>
                        </div>
                        <ClipboardList
                          className="w-5 h-5 text-[#E6C77A] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                      </div>

                      <div className="p-5 space-y-4 text-sm text-[#0B1215]">
                        <div>
                          <p className="text-xs font-extrabold text-[#082D23] mb-1">
                            {t.paramedicImpression}
                          </p>
                          <p className="font-semibold leading-relaxed">
                            {result.responderReport.clinicalImpression}
                          </p>
                        </div>

                        <div className="border-t border-slate-200 pt-3">
                          <p className="text-xs font-extrabold text-[#082D23] mb-2">
                            {t.paramedicActions}
                          </p>
                          <ul className="space-y-1.5">
                            {result.responderReport.immediateActions.map((act, idx) => (
                              <li
                                key={`${idx}-${act}`}
                                className="flex items-start gap-2 text-xs sm:text-sm font-medium text-slate-800 leading-relaxed"
                              >
                                <span className="font-extrabold text-[#B88A2E] tabular-nums shrink-0">
                                  {String(idx + 1).padStart(2, '0')}.
                                </span>
                                <span>{act}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="border-t border-slate-200 pt-3">
                          <p className="text-xs font-extrabold text-[#082D23] mb-1">
                            {t.paramedicEquipment}
                          </p>
                          <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                            {result.responderReport.recommendedEquipment}
                          </p>
                        </div>

                        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 space-y-1">
                          <p className="text-xs font-extrabold text-amber-950">
                            {t.paramedicPrecautions}
                          </p>
                          <p className="text-xs font-semibold text-amber-900 leading-relaxed">
                            {result.responderReport.fieldPrecautions}
                          </p>
                        </div>

                        <div className="border-t border-slate-200 pt-3">
                          <p className="text-xs font-extrabold text-[#082D23] mb-1">
                            {t.paramedicEvac}
                          </p>
                          <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                            {result.responderReport.evacuationRoute}
                          </p>
                        </div>
                      </div>
                    </section>
                  </InteractiveGlowCard>
                </motion.div>
              ) : (
              <div
                id="paramedic-report"
                className="bg-white border-2 border-slate-300 rounded-xl p-6 space-y-5 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-[#082D23] text-[#E6C77A] flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-extrabold text-[#082D23]">
                      {t.resultEmptyTitle}
                    </h2>
                    <p className="text-xs font-medium text-slate-600">
                      {t.paramedicSubtitle}
                    </p>
                  </div>
                </div>

                <p className="text-sm font-medium text-slate-700 leading-relaxed">
                  {t.resultEmptyDesc}
                </p>

                <div className="space-y-3 border-t border-slate-200 pt-4 text-sm">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert
                      className="w-4 h-4 text-red-700 shrink-0 mt-1"
                      aria-hidden="true"
                    />
                    <span className="font-bold text-red-900">
                      {LEVEL_STYLES.critical && (
                        <>
                          {language === 'ar'
                            ? 'المستوى الأحمر: تدخل فوري (ألم صدر، إغماء، ضربة شمس).'
                            : language === 'en'
                            ? 'RED: Immediate life-saving care (chest pain, fainting, heatstroke).'
                            : language === 'ur'
                            ? 'ریڈ: فوری ہنگامی مدد (سینے کا درد، بے ہوشی، ہیٹ اسٹروک)۔'
                            : 'MERAH: Penanganan segera (nyeri dada, pingsan, heatstroke).'}
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle
                      className="w-4 h-4 text-amber-700 shrink-0 mt-1"
                      aria-hidden="true"
                    />
                    <span className="font-bold text-amber-950">
                      {language === 'ar'
                        ? 'المستوى الأصفر: رعاية عاجلة (إجهاد حراري، هبوط سكر، كسر).'
                        : language === 'en'
                        ? 'YELLOW: Urgent evaluation (heat exhaustion, low sugar, fracture).'
                        : language === 'ur'
                        ? 'یلو: فوری معائنہ (گرمی کی تھکن، شوگر کی کمی، فریکچر)۔'
                        : 'KUNING: Evaluasi mendesak (kelelahan panas, gula turun, patah tulang).'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2
                      className="w-4 h-4 text-[#082D23] shrink-0 mt-1"
                      aria-hidden="true"
                    />
                    <span className="font-bold text-[#082D23]">
                      {language === 'ar'
                        ? 'المستوى الأخضر: إسعاف بسيط (جرح سطحي، تسلخ قدم، إرهاق خفيف).'
                        : language === 'en'
                        ? 'GREEN: Minor care (blisters, minor abrasion, mild fatigue).'
                        : language === 'ur'
                        ? 'گرین: سادہ امداد (معمولی زخم، چھالے، ہلکی تھکن)۔'
                        : 'HIJAU: Perawatan ringan (lecet kaki, luka kecil, lelah ringan).'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            </AnimatePresence>

            {/* Session Triage History (In-Memory Only) */}
            {history.length > 0 && (
              <InteractiveGlowCard
                scrollReveal={false}
                className="bg-white border-2 border-slate-300 rounded-xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-sm font-extrabold text-[#082D23]">
                    {t.historyTitle}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setHistory([])}
                    className="text-xs font-bold text-slate-600 hover:text-red-700 cursor-pointer"
                  >
                    {t.clearHistory}
                  </button>
                </div>

                <ul className="divide-y divide-slate-200">
                  {history.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setResult(item);
                          setError(null);
                          setSuccessMessage(`${t.successTitle} (${item.priorityCode})`);
                        }}
                        className="w-full py-2.5 flex items-center justify-between gap-3 text-start hover:bg-slate-100 rounded-md px-2 -mx-2 transition-colors cursor-pointer"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#0B1215] truncate">
                            {item.categoryTitle}
                          </p>
                          <p className="text-xs font-semibold text-slate-600 tabular-nums">
                            {item.zoneLabel} · {item.timestamp} · {item.priorityCode}
                          </p>
                        </div>
                        <ChevronLeft
                          className="w-4 h-4 text-slate-500 shrink-0"
                          aria-hidden="true"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </InteractiveGlowCard>
            )}
          </div>
        </section>

        {/* Institutional Portal Reference Cards: Triage Levels (Scroll-Revealed) */}
        <section id="triage-levels" className="space-y-5 border-t-2 border-slate-300 pt-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-1"
          >
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#082D23]">
              {t.levelsTitle}
            </h2>
            <p className="text-sm font-medium text-slate-700">{t.levelsSub}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InteractiveGlowCard
              delayIndex={0}
              glowColor="rgba(185, 28, 28, 0.14)"
              className="bg-white border-2 border-red-700 rounded-xl p-5 space-y-2.5"
            >
              <div className="flex items-center gap-2 text-red-800 font-extrabold text-sm">
                <ShieldAlert className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>
                  {language === 'ar'
                    ? 'المستوى ١ · حرج (أحمر)'
                    : language === 'en'
                    ? 'Level 1 · Critical (RED)'
                    : language === 'ur'
                    ? 'لیول 1 · انتہائی سنگین (ریڈ)'
                    : 'Level 1 · Kritis (MERAH)'}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-800 leading-relaxed">
                {language === 'ar'
                  ? 'حالات تهدد الحياة مثل ألم الصدر، ضيق التنفس الحاد، فقدان الوعي، أو ضربة الشمس المتقدمة. يتطلب الاتصال بـ ٩٩٧ فوراً.'
                  : language === 'en'
                  ? 'Life-threatening emergencies including chest pain, severe dyspnea, unconsciousness, or heatstroke. Requires immediate 997 dispatch.'
                  : language === 'ur'
                  ? 'جان لیوا ہنگامی حالات جیسے سینے میں درد، سانس کی شدید تکلیف، بے ہوشی یا ہیٹ اسٹروک۔ فوراً 997 پر کال کریں۔'
                  : 'Kondisi mengancam nyawa seperti nyeri dada, sesak berat, pingsan, atau heatstroke. Hubungi 997 segera.'}
              </p>
            </InteractiveGlowCard>

            <InteractiveGlowCard
              delayIndex={1}
              glowColor="rgba(217, 119, 6, 0.16)"
              className="bg-white border-2 border-amber-600 rounded-xl p-5 space-y-2.5"
            >
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>
                  {language === 'ar'
                    ? 'المستوى ٢ · عاجل (أصفر)'
                    : language === 'en'
                    ? 'Level 2 · Urgent (YELLOW)'
                    : language === 'ur'
                    ? 'لیول 2 · فوری توجہ (یلو)'
                    : 'Level 2 · Mendesak (KUNING)'}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-800 leading-relaxed">
                {language === 'ar'
                  ? 'حالات تحتاج تقييماً طبياً قريباً دون تهديد فوري للتنفس مثل الإجهاد الحراري، هبوط السكر، الدوار المستمر، أو الكسور.'
                  : language === 'en'
                  ? 'Requires prompt clinic evaluation without immediate airway collapse: heat exhaustion, low blood sugar, or limb trauma.'
                  : language === 'ur'
                  ? 'گرمی کی تھکن، شوگر کی کمی، مسلسل چکر یا ہڈی کی چوٹ جن میں قریبی کلینک کا فوری معائنہ درکار ہے۔'
                  : 'Membutuhkan pemeriksaan medis segera seperti kelelahan panas, hipoglikemia, atau cedera gerak.'}
              </p>
            </InteractiveGlowCard>

            <InteractiveGlowCard
              delayIndex={2}
              glowColor="rgba(8, 45, 35, 0.14)"
              className="bg-white border-2 border-[#082D23] rounded-xl p-5 space-y-2.5"
            >
              <div className="flex items-center gap-2 text-[#082D23] font-extrabold text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>
                  {language === 'ar'
                    ? 'المستوى ٣ · مستقر (أخضر)'
                    : language === 'en'
                    ? 'Level 3 · Stable (GREEN)'
                    : language === 'ur'
                    ? 'لیول 3 · مستحکم (گرین)'
                    : 'Level 3 · Stabil (HIJAU)'}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-800 leading-relaxed">
                {language === 'ar'
                  ? 'إصابات وحالات بسيطة يمكن التعامل معها في الظل بالراحة وتعويض السوائل أو تضميد الجروح السطحية وتسلخات القدم.'
                  : language === 'en'
                  ? 'Minor injuries manageable with shaded rest, gentle hydration, and sterile blister or abrasion dressing.'
                  : language === 'ur'
                  ? 'معمولی چوٹیں، پاؤں کے چھالے یا ہلکی تھکاوٹ جو آرام، پانی اور سادہ پٹی سے بہتر ہو سکتی ہیں۔'
                  : 'Cedera ringan seperti lecet kaki, luka gores kecil, atau kelelahan ringan yang membaik dengan istirahat.'}
              </p>
            </InteractiveGlowCard>
          </div>
        </section>

        {/* Ministry of Hajj & Umrah: Things to Remember for Health Cards (Scroll-Revealed) */}
        <section id="health-reminders" className="space-y-5 border-t-2 border-slate-300 pt-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-3"
          >
            <div className="space-y-1">
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#082D23]">
                {t.healthRemindersTitle}
              </h2>
              <p className="text-sm font-medium text-slate-700 max-w-3xl">
                {t.healthRemindersSub}
              </p>
            </div>
            <p className="text-xs font-bold text-[#082D23] shrink-0">
              {t.healthRemindersSource}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {HEALTH_REMINDER_CARDS.map((card, index) => (
              <InteractiveGlowCard
                key={card.id}
                delayIndex={index}
                className="bg-white border-2 border-slate-300 hover:border-[#C59B43] rounded-xl p-5 shadow-xs"
              >
                <article className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#B88A2E]">
                    <span className="tabular-nums text-[#082D23]">{card.number}</span>
                    <span aria-hidden="true">·</span>
                    <span>{card.category[language]}</span>
                  </div>
                  <h3 className="font-display text-base sm:text-lg font-extrabold text-[#082D23] leading-snug">
                    {card.title[language]}
                  </h3>
                  <p className="text-sm font-medium text-slate-800 leading-relaxed">
                    {card.description[language]}
                  </p>
                </article>
              </InteractiveGlowCard>
            ))}
          </div>
        </section>

        {/* Medical Points & Emergency Contacts (Scroll-Revealed) */}
        <section id="haram-points" className="space-y-5 border-t-2 border-slate-300 pt-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-1"
          >
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#082D23]">
              {t.pointsTitle}
            </h2>
            <p className="text-sm font-medium text-slate-700">{t.pointsSub}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InteractiveGlowCard
              delayIndex={0}
              className="bg-white border-2 border-slate-300 rounded-xl p-6 space-y-3"
            >
              <div className="flex items-center gap-2 text-[#082D23] font-extrabold text-base">
                <MapPin className="w-5 h-5 text-[#B88A2E] shrink-0" aria-hidden="true" />
                <span>
                  {language === 'ar'
                    ? 'مواقع النقاط الإسعافية داخل الحرم'
                    : language === 'en'
                    ? 'Key Medical Posts Inside Al-Haram'
                    : language === 'ur'
                    ? 'مسجد الحرام کے اندر اہم طبی مراکز'
                    : 'Lokasi Pos Medis Utama di Masjidil Haram'}
                </span>
              </div>
              <ul className="space-y-2 text-sm font-medium text-slate-800 leading-relaxed">
                <li>01. {HARAM_ZONES.mataf.medicalPoint[language]}</li>
                <li>02. {HARAM_ZONES.masa.medicalPoint[language]}</li>
                <li>03. {HARAM_ZONES.courtyards.medicalPoint[language]}</li>
              </ul>
            </InteractiveGlowCard>

            <InteractiveGlowCard
              delayIndex={1}
              glowColor="rgba(230, 199, 122, 0.22)"
              className="bg-[#082D23] text-white border-2 border-[#C59B43] rounded-xl p-6 space-y-4"
            >
              <div className="flex items-center gap-2 font-extrabold text-base text-[#E6C77A]">
                <Clock className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>
                  {language === 'ar'
                    ? 'أرقام البلاغ والاستجابة السريعة (٢٤ ساعة)'
                    : language === 'en'
                    ? '24/7 Makkah Emergency Dispatch Numbers'
                    : language === 'ur'
                    ? '24 گھنٹے ہنگامی طبی و سکیورٹی نمبرز'
                    : 'Nomor Darurat Resmi 24 Jam di Makkah'}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                  <span className="font-semibold">
                    {language === 'ar'
                      ? 'الهلال الأحمر السعودي (الإسعاف الطبي)'
                      : language === 'en'
                      ? 'Saudi Red Crescent Ambulance'
                      : language === 'ur'
                      ? 'سعودی ہلال احمر (ایمبولینس)'
                      : 'Ambulans Bulan Sabit Merah Saudi'}
                  </span>
                  <a
                    href="tel:997"
                    className="btn-interactive px-3 py-1 bg-red-700 hover:bg-red-600 rounded-md font-extrabold text-white tabular-nums"
                  >
                    997
                  </a>
                </div>
                <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                  <span className="font-semibold">
                    {language === 'ar'
                      ? 'مركز العمليات الأمنية الموحد'
                      : language === 'en'
                      ? 'Unified Security Operations Center'
                      : language === 'ur'
                      ? 'یونیفائیڈ سکیورٹی آپریشنز سینٹر'
                      : 'Pusat Operasi Keamanan Terpadu'}
                  </span>
                  <a
                    href="tel:911"
                    className="btn-interactive px-3 py-1 bg-[#C59B43] hover:bg-[#d8af57] rounded-md font-extrabold text-[#06221A] tabular-nums"
                  >
                    911
                  </a>
                </div>
              </div>
            </InteractiveGlowCard>
          </div>
        </section>
      </main>

      {/* Clean Institutional Footer */}
      <footer className="no-print bg-[#06221A] text-slate-200 border-t-2 border-[#C59B43] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-medium">
          <p>{t.footerNote}</p>
          <p className="tabular-nums text-[#E6C77A] font-bold">997 · 911</p>
        </div>
      </footer>

      {/* Emergency Support Modal */}
      <AnimatePresence>
        {emergencyModalOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="emergency-modal-title"
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
              className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl border-2 border-[#082D23] p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                <h2
                  id="emergency-modal-title"
                  className="font-display text-lg font-extrabold text-[#082D23]"
                >
                  {t.modalTitle}
                </h2>
                <button
                  type="button"
                  onClick={() => setEmergencyModalOpen(false)}
                  aria-label={t.modalClose}
                  className="btn-interactive min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-600 hover:text-black hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <p className="text-sm font-medium text-slate-800 leading-relaxed">
                {t.modalDesc}
              </p>

              <div className="space-y-3">
                <a
                  href="tel:997"
                  className="btn-interactive w-full min-h-[48px] px-4 py-3 bg-red-700 hover:bg-red-800 text-white font-extrabold text-sm rounded-lg flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="tabular-nums">{t.modalCall997}</span>
                </a>

                <a
                  href="tel:911"
                  className="btn-interactive w-full min-h-[48px] px-4 py-3 bg-[#082D23] hover:bg-[#0E4A3A] text-white font-extrabold text-sm rounded-lg border-2 border-[#C59B43] flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4 text-[#E6C77A] shrink-0" aria-hidden="true" />
                  <span className="tabular-nums">{t.modalCall911}</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </MotionConfig>
  );
}
