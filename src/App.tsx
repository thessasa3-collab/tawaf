import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  Accessibility,
  Activity,
  AlertCircle,
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Clock,
  Compass,
  ExternalLink,
  Globe,
  HeartPulse,
  Loader2,
  MapPin,
  Menu,
  Mic,
  MicOff,
  PhoneCall,
  QrCode,
  RefreshCw,
  RotateCcw,
  Shield,
  ShieldAlert,
  Stethoscope,
  Trash2,
  Volume2,
  VolumeX,
  WifiOff,
  X,
} from 'lucide-react';
import { AccessibilityModal } from './components/AccessibilityModal';
import { Body3DSelector } from './components/Body3DSelector';
import { FirstAidAssistantModal } from './components/FirstAidAssistantModal';
import { InteractiveGlowCard } from './components/InteractiveGlowCard';
import { OfflineGuidelinesSection } from './components/OfflineGuidelinesSection';
import { PrintableTriageCard } from './components/PrintableTriageCard';
import {
  OfflineIndicator,
  PWAInstallButton,
} from './components/PWAInstallBanner';
import {
  AuthUser,
  ResponderOperationsModal,
} from './components/ResponderOperationsModal';
import { TawafEmblem } from './components/TawafEmblem';
import { useAccessibility } from './hooks/useAccessibility';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useVoiceInput, VoiceErrorCode } from './hooks/useVoiceInput';
import {
  inspectPermissionDiagnostics,
  isPermissionsPolicyErrorMessage,
} from './utils/browserPermissions';
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
  buildCreateCasePayload,
  buildTriageResultFromAI,
  evaluateTriageCase,
  findNearestHaramZone,
  GpsLocation,
  HARAM_ZONES,
  HaramZone,
  mapServerRecordToTriageResult,
  QUICK_SYMPTOM_PRESETS,
  ServerTriageCaseRecord,
  TriageInput,
  TriageLevel,
  TriageResult,
  validateTriageInput,
  ValidationError,
} from './triageEngine';

const OFFLINE_HISTORY_KEY = 'tawaf_offline_history_v1';

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
    headerBg: 'bg-[#0D5240] text-white',
    border: 'border-[#0D5240]',
    text: 'text-[#0D5240]',
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

  // Patient-consented GPS & manual location state (never fabricate coordinates)
  const [gpsConsent, setGpsConsent] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<GpsLocation | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsBlockedInIframe, setGpsBlockedInIframe] = useState(false);
  const [manualLocationMode, setManualLocationMode] = useState(false);
  const [locationDetail, setLocationDetail] = useState('');
  const [gpsSuggestedInfo, setGpsSuggestedInfo] = useState<{
    zone: HaramZone;
    distanceMeters: number;
    withinHaram: boolean;
  } | null>(null);

  const [error, setError] = useState<ValidationError | null>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [history, setHistory] = useState<TriageResult[]>(() => {
    try {
      const cached = window.localStorage.getItem(OFFLINE_HISTORY_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as TriageResult[];
        if (Array.isArray(parsed)) return parsed.slice(0, 8);
      }
    } catch {
      // Ignore storage errors
    }
    return [];
  });

  const [qrScannedCaseId, setQrScannedCaseId] = useState<string | null>(null);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [opsModalOpen, setOpsModalOpen] = useState(false);
  const [a11yModalOpen, setA11yModalOpen] = useState(false);
  const [assistantModalOpen, setAssistantModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isSavingCase, setIsSavingCase] = useState(false);
  const [deletingHistoryId, setDeletingHistoryId] = useState<string | null>(null);

  const symptomsInputRef = useRef<HTMLTextAreaElement | null>(null);
  const ageInputRef = useRef<HTMLInputElement | null>(null);
  const manualLocationInputRef = useRef<HTMLInputElement | null>(null);
  const resultSectionRef = useRef<HTMLDivElement | null>(null);
  const activeControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const isOnline = useOnlineStatus();
  const {
    settings: a11ySettings,
    setSettings: setA11ySettings,
    resetAccessibility,
    ttsSupported,
    speakingId,
    speakText,
    stopSpeaking,
  } = useAccessibility(language);

  const {
    isSupported: voiceSupported,
    voiceState,
    voiceError,
    voiceBlockedInIframe,
    clearVoiceError,
    startListening,
    stopListening,
  } = useVoiceInput(language, (transcript) => {
    setSymptoms((prev) => (prev.trim() ? `${prev.trim()} ${transcript}` : transcript));
    setActivePresetId(null);
    if (error?.field === 'symptoms') setError(null);
  });

  const activeLangMeta =
    LANGUAGES.find((item) => item.code === language) ?? LANGUAGES[0];
  const t = UI_TRANSLATIONS[language];

  const resolveVoiceErrorMessage = (code: VoiceErrorCode | null): string | null => {
    if (!code) return null;
    switch (code) {
      case 'IFRAME_BLOCKED':
        return t.voiceIframeBlockedError;
      case 'INSECURE_CONTEXT':
        return t.voiceHttpsError;
      case 'PERMISSION_DENIED':
        return t.voicePermissionError;
      case 'NO_MICROPHONE':
        return t.voiceNoMicError;
      case 'MIC_IN_USE':
        return t.voiceMicInUseError;
      case 'TRANSCRIBE_FAILED':
        return t.voiceTranscribeError;
      case 'UNSUPPORTED':
      case 'ERROR':
      default:
        return t.voiceUnsupportedError;
    }
  };
  const voiceErrorMessage = resolveVoiceErrorMessage(voiceError);

  useEffect(() => {
    document.documentElement.lang = activeLangMeta.code;
    document.documentElement.dir = activeLangMeta.dir;
  }, [activeLangMeta]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        OFFLINE_HISTORY_KEY,
        JSON.stringify(history.slice(0, 8))
      );
    } catch {
      // Ignore storage quota / privacy mode errors
    }
  }, [history]);

  useEffect(() => {
    isMountedRef.current = true;

    // Check QR case deep link (?case=TWF-...)
    try {
      const params = new URLSearchParams(window.location.search);
      const caseParam = params.get('case')?.trim();
      if (caseParam && caseParam.startsWith('TWF-')) {
        setQrScannedCaseId(caseParam);
        setHistory((prev) => {
          const matched = prev.find((c) => c.id === caseParam);
          if (matched) {
            setResult(matched);
          }
          return prev;
        });
      }
    } catch {
      // Ignore URL parsing issues
    }

    try {
      const savedDraft = window.sessionStorage.getItem('tawaf_draft_v1');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft) as {
          language?: LanguageCode;
          symptoms?: string;
          zone?: HaramZone;
          locationDetail?: string;
          ageText?: string;
          conscious?: 'conscious' | 'confused' | 'unconscious';
          selectedBodyPart?: BodyPartId | null;
        };
        if (parsed.language && ['ar', 'en', 'ur', 'id'].includes(parsed.language)) {
          setLanguage(parsed.language);
        }
        if (typeof parsed.symptoms === 'string') setSymptoms(parsed.symptoms);
        if (parsed.zone && parsed.zone in HARAM_ZONES) setZone(parsed.zone);
        if (typeof parsed.locationDetail === 'string') {
          setLocationDetail(parsed.locationDetail);
        }
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
    clearVoiceError();
    stopSpeaking();
  };

  const handleGpsConsentToggle = (checked: boolean) => {
    setGpsConsent(checked);
    setGpsError(null);
    setGpsBlockedInIframe(false);
    if (!checked) {
      setGpsLocation(null);
      setGpsSuggestedInfo(null);
    }
  };

  const handleEnableManualLocation = () => {
    setManualLocationMode(true);
    window.setTimeout(() => {
      manualLocationInputRef.current?.focus();
      manualLocationInputRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 60);
  };

  const handleCaptureGps = async () => {
    if (!gpsConsent || gpsLoading) return;
    setGpsError(null);
    setGpsBlockedInIframe(false);

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      console.error('[Tawaf GPS] navigator.geolocation is unsupported in this browser.');
      setGpsError(t.gpsUnsupportedError);
      setManualLocationMode(true);
      return;
    }

    const diag = await inspectPermissionDiagnostics('geolocation');
    if (!diag.isSecureContext) {
      console.error('[Tawaf GPS] Geolocation blocked: insecure context (HTTPS required).', diag);
      setGpsError(t.gpsHttpsError);
      setManualLocationMode(true);
      return;
    }
    if (diag.policyAllowed === false) {
      console.error(
        '[Tawaf GPS] Geolocation disallowed by document Permissions-Policy / iframe allow attribute.',
        diag
      );
      setGpsBlockedInIframe(diag.inIframe);
      setGpsError(diag.inIframe ? t.gpsIframeBlockedError : t.gpsDeniedError);
      setManualLocationMode(true);
      return;
    }

    const requestPosition = (options: PositionOptions) =>
      new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

    setGpsLoading(true);
    try {
      let position: GeolocationPosition;
      try {
        position = await requestPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 15000,
        });
      } catch (firstErr: unknown) {
        const geoErr = firstErr as Partial<GeolocationPositionError> | undefined;
        // On Windows laptops / Microsoft Edge without hardware GPS, high-accuracy often times out or fails;
        // retry once using standard/network location without ever fabricating coordinates.
        if (geoErr && (geoErr.code === 3 || geoErr.code === 2)) {
          console.warn('[Tawaf GPS] High-accuracy geolocation failed, retrying network accuracy:', {
            code: geoErr.code,
            message: geoErr.message,
            diagnostics: diag,
          });
          position = await requestPosition({
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60000,
          });
        } else {
          throw firstErr;
        }
      }

      if (!isMountedRef.current) return;
      const lat = Number(position.coords.latitude.toFixed(6));
      const lng = Number(position.coords.longitude.toFixed(6));
      const accuracy = Number.isFinite(position.coords.accuracy)
        ? Math.round(position.coords.accuracy)
        : null;

      const captured: GpsLocation = {
        lat,
        lng,
        accuracy,
        capturedAt: new Date().toISOString(),
        consentGiven: true,
      };

      const nearest = findNearestHaramZone(lat, lng);
      setGpsLocation(captured);
      setGpsSuggestedInfo(nearest);
      if (nearest.withinHaram) {
        setZone(nearest.zone);
      }
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      const postDiag = await inspectPermissionDiagnostics('geolocation');
      const geoErr = err as Partial<GeolocationPositionError> | undefined;
      const code = typeof geoErr?.code === 'number' ? geoErr.code : null;
      const message =
        typeof geoErr?.message === 'string'
          ? geoErr.message
          : err instanceof Error
          ? err.message
          : String(err);

      console.error('[Tawaf GPS] navigator.geolocation.getCurrentPosition failed:', {
        code,
        message,
        diagnostics: postDiag,
        error: err,
      });

      if (code === 1) {
        const iframeBlocked =
          postDiag.inIframe &&
          (postDiag.policyAllowed === false || isPermissionsPolicyErrorMessage(message));
        setGpsBlockedInIframe(iframeBlocked);
        setGpsError(iframeBlocked ? t.gpsIframeBlockedError : t.gpsDeniedError);
      } else if (code === 3) {
        setGpsError(t.gpsTimeoutError);
      } else if (code === 2) {
        setGpsError(t.gpsUnavailableError);
      } else if (!postDiag.isSecureContext) {
        setGpsError(t.gpsHttpsError);
      } else {
        setGpsError(t.gpsDeniedError);
      }
      setManualLocationMode(true);
    } finally {
      if (isMountedRef.current) {
        setGpsLoading(false);
      }
    }
  };

  const handleReloadAfterConnection = () => {
    try {
      window.sessionStorage.setItem(
        'tawaf_draft_v1',
        JSON.stringify({
          language,
          symptoms,
          zone,
          locationDetail,
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

  const persistTriageResult = async (
    candidate: TriageResult
  ): Promise<TriageResult> => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return candidate;
    }
    setIsSavingCase(true);
    try {
      const res = await fetch('/api/triage/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildCreateCasePayload(candidate, language)),
      });
      const data = (await res.json().catch(() => null)) as {
        caseRecord?: ServerTriageCaseRecord;
        caseToken?: string;
      } | null;
      if (res.ok && data?.caseRecord) {
        return mapServerRecordToTriageResult(
          data.caseRecord,
          language,
          data.caseToken
        );
      }
    } catch {
      // Keep local result usable if persistence fails transiently
    } finally {
      if (isMountedRef.current) {
        setIsSavingCase(false);
      }
    }
    return candidate;
  };

  const runLocalFallbackTriage = async () => {
    const inputPayload: TriageInput = {
      language,
      symptoms,
      zone,
      ageText,
      conscious,
      bodyPart: selectedBodyPart,
      gpsLocation: gpsConsent ? gpsLocation : null,
      locationDetail: locationDetail.trim() || null,
    };
    const localEval = evaluateTriageCase(inputPayload);
    if (localEval.ok === false) {
      setError(localEval.error);
      setConnectionError(false);
      if (localEval.error.field === 'symptoms') {
        symptomsInputRef.current?.focus();
      } else if (localEval.error.field === 'age') {
        ageInputRef.current?.focus();
      }
      return;
    }

    setError(null);
    setConnectionError(false);
    setResult(localEval.result);
    setSuccessMessage(`${t.successTitle} (${localEval.result.priorityCode})`);

    const saved = await persistTriageResult(localEval.result);
    if (!isMountedRef.current) return;
    setResult(saved);
    setSuccessMessage(`${t.successTitle} (${saved.priorityCode})`);
    setHistory((prev) => [saved, ...prev.filter((i) => i.id !== saved.id)].slice(0, 8));

    if (window.innerWidth < 1024 && resultSectionRef.current) {
      resultSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDeleteHistoryItem = async (
    e: React.MouseEvent,
    item: TriageResult
  ) => {
    e.stopPropagation();
    if (deletingHistoryId) return;

    if (item.persisted && (authToken || item.caseToken) && isOnline) {
      setDeletingHistoryId(item.id);
      try {
        const headers: Record<string, string> = {};
        if (authToken) headers.Authorization = `Bearer ${authToken}`;
        if (item.caseToken) headers['x-case-token'] = item.caseToken;
        await fetch(`/api/triage/cases/${encodeURIComponent(item.id)}`, {
          method: 'DELETE',
          headers,
        });
      } catch {
        // Still remove from local list if request fails
      } finally {
        if (isMountedRef.current) {
          setDeletingHistoryId(null);
        }
      }
    }

    setHistory((prev) => prev.filter((x) => x.id !== item.id));
    if (result?.id === item.id) {
      setResult(null);
      setSuccessMessage(null);
    }
  };

  const runTriageAnalysis = async () => {
    if (isAnalyzing) return;

    const inputPayload: TriageInput = {
      language,
      symptoms,
      zone,
      ageText,
      conscious,
      bodyPart: selectedBodyPart,
      gpsLocation: gpsConsent ? gpsLocation : null,
      locationDetail: locationDetail.trim() || null,
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

    // Immediate offline local rapid triage if offline
    if (!isOnline) {
      await runLocalFallbackTriage();
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
                Math.max(
                  1500,
                  ((data && 'retryAfterSeconds' in data && data.retryAfterSeconds) || 4) * 500
                )
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

          const initialResult = buildTriageResultFromAI(
            inputPayload,
            validation.ageValue,
            validation.symptoms,
            data as AITriageResponsePayload
          );

          if (!isMountedRef.current) return;
          setError(null);
          setConnectionError(false);
          setResult(initialResult);
          setSuccessMessage(`${t.successTitle} (${initialResult.priorityCode})`);

          if (window.innerWidth < 1024 && resultSectionRef.current) {
            resultSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }

          const persistedResult = await persistTriageResult(initialResult);
          if (!isMountedRef.current) return;
          setResult(persistedResult);
          setHistory((prev) =>
            [persistedResult, ...prev.filter((i) => i.id !== persistedResult.id)].slice(0, 8)
          );
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
    setGpsLocation(null);
    setGpsConsent(false);
    setGpsError(null);
    setGpsBlockedInIframe(false);
    setManualLocationMode(false);
    setLocationDetail('');
    setGpsSuggestedInfo(null);
    setError(null);
    setConnectionError(false);
    setSuccessMessage(null);
    setResult(null);
    clearVoiceError();
    stopSpeaking();
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

  const resultSpeechText = result
    ? `${result.levelTitle}. ${result.categoryTitle}. ${result.summary}. ${t.stepsTitle}: ${result.firstAidSteps.join('. ')}. ${result.nearestCarePoint}. ${t.safetyTitle} ${result.warningSigns}`
    : '';

  const paramedicSpeechText = result
    ? `${t.paramedicTitle}. ${result.responderReport.clinicalImpression}. ${t.paramedicActions}: ${result.responderReport.immediateActions.join('. ')}. ${result.responderReport.evacuationRoute}`
    : '';

  return (
    <MotionConfig reducedMotion={a11ySettings.reducedMotion ? 'always' : 'user'}>
      <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-[#111D18]">
        {/* Skip to Main Content Link for Screen Readers / Keyboard Accessibility */}
        <a
          href="#triage-workspace"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#0D5240] focus:text-[#E6C77A] focus:font-bold focus:border-2 focus:border-[#B58E46]"
        >
          {t.skipToMain}
        </a>

        {/* Offline Mode Status Banner */}
        <OfflineIndicator language={language} />

        {/* QR Scanned Case Deep-Link Banner */}
        {qrScannedCaseId && (
          <div
            role="status"
            className="no-print bg-[#F2EDE2] border-b-2 border-[#B58E46] px-4 py-2.5 text-xs sm:text-sm"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[#0D5240] font-bold">
                <QrCode className="w-4 h-4 text-[#B58E46] shrink-0" aria-hidden="true" />
                <span>
                  {t.qrCaseBannerTitle} — {t.qrCaseBannerDesc}{' '}
                  <strong className="tabular-nums">{qrScannedCaseId}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setQrScannedCaseId(null)}
                aria-label={t.modalClose}
                className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-md hover:bg-[#DDD4C2] text-[#0D5240] cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* Ministry of Hajj & Umrah Inspired Portal Header (Strict 3-Zone Top Bar) */}
        <header className="no-print sticky top-0 z-30 bg-[#083D2F] text-white border-b-2 border-[#B58E46] shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-6">
            {/* Zone 1: Brand Wordmark + Emblem */}
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
              className="hidden md:flex items-center gap-4 lg:gap-5 text-sm font-semibold text-slate-100"
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
                href="#offline-guidelines"
                className="hover:text-[#E6C77A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                {t.navOfflineGuide}
              </a>
              <a
                href="#haram-points"
                className="hover:text-[#E6C77A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                {t.navPoints}
              </a>
              <button
                type="button"
                onClick={() => setOpsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#052B21] hover:bg-[#0D5240] border border-[#B58E46]/70 text-[#E6C77A] text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
              >
                <Shield className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{t.navOps}</span>
              </button>
            </nav>

            {/* Zone 3: Mobile Menu + Accessibility Button + Primary 997 Emergency CTA */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setA11yModalOpen(true)}
                aria-label={t.a11yBtn}
                title={t.a11yBtn}
                className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-lg bg-[#052B21] hover:bg-[#0D5240] border border-[#B58E46]/60 text-[#E6C77A] cursor-pointer transition-colors"
              >
                <Accessibility className="w-5 h-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? t.menuCloseLabel : t.menuOpenLabel}
                className="md:hidden min-h-[42px] min-w-[42px] flex items-center justify-center rounded-lg bg-[#052B21] border border-[#B58E46]/60 text-[#E6C77A] cursor-pointer"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Menu className="w-5 h-5" aria-hidden="true" />
                )}
              </button>

              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setEmergencyModalOpen(true)}
                className="btn-interactive min-h-[42px] px-3.5 sm:px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-xs sm:text-sm font-bold rounded-lg border border-red-400/60 whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <PhoneCall className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="tabular-nums">{t.emergencyBtn}</span>
              </motion.button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden overflow-hidden bg-[#052B21] border-t border-[#B58E46]/40"
              >
                <div className="px-4 py-3 flex flex-col gap-1.5 text-sm font-semibold">
                  <a
                    href="#body-3d-section"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-slate-100 hover:bg-white/10"
                  >
                    {t.navBody3D}
                  </a>
                  <a
                    href="#triage-workspace"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-slate-100 hover:bg-white/10"
                  >
                    {t.navTriage}
                  </a>
                  <a
                    href="#offline-guidelines"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-slate-100 hover:bg-white/10"
                  >
                    {t.navOfflineGuide}
                  </a>
                  <a
                    href="#haram-points"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-slate-100 hover:bg-white/10"
                  >
                    {t.navPoints}
                  </a>
                  <a
                    href="#health-reminders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-slate-100 hover:bg-white/10"
                  >
                    {t.navHealthReminders}
                  </a>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setAssistantModalOpen(true);
                      }}
                      className="px-3 py-2.5 rounded-lg bg-[#0D5240] border border-[#B58E46] text-white font-bold flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                    >
                      <Bot className="w-4 h-4 text-[#E6C77A]" aria-hidden="true" />
                      <span>{t.assistantBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setOpsModalOpen(true);
                      }}
                      className="px-3 py-2.5 rounded-lg bg-[#083D2F] border border-[#B58E46]/70 text-[#E6C77A] font-bold flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                    >
                      <Shield className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{t.navOps}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Ministry of Hajj & Umrah Inspired Hero Portal + Language & Smart Toolbar */}
        <section className="no-print relative overflow-hidden bg-[#0D5240] haram-lattice-bg text-white border-b-4 border-[#B58E46]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 start-1/4 w-[520px] h-[520px] rounded-full opacity-35"
            style={{
              background:
                'radial-gradient(circle, rgba(230,199,122,0.34) 0%, rgba(13,82,64,0) 70%)',
            }}
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
            {/* Hero Portal Toolbar: Eyebrow + Assistant + Accessibility + PWA Install + 4 Languages */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/15 pb-5">
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold">
                <span className="text-luminous-gold">{t.heroEyebrow}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Smart First-Aid Assistant Trigger */}
                <button
                  type="button"
                  onClick={() => setAssistantModalOpen(true)}
                  className="btn-interactive min-h-[38px] px-3 py-1.5 rounded-lg bg-[#052B21] hover:bg-[#083D2F] border border-[#B58E46] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
                >
                  <Bot className="w-4 h-4 text-[#E6C77A] shrink-0" aria-hidden="true" />
                  <span>{t.assistantBtn}</span>
                </button>

                {/* Accessibility Preferences Trigger */}
                <button
                  type="button"
                  onClick={() => setA11yModalOpen(true)}
                  className="btn-interactive min-h-[38px] px-3 py-1.5 rounded-lg bg-[#052B21] hover:bg-[#083D2F] border border-white/25 text-slate-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Accessibility className="w-4 h-4 text-[#E6C77A] shrink-0" aria-hidden="true" />
                  <span>{t.a11yBtn}</span>
                </button>

                {/* PWA Mobile Install Trigger */}
                <PWAInstallButton language={language} />

                {/* 4-Language Selector */}
                <div
                  role="group"
                  aria-label="Language selector"
                  className="flex flex-wrap items-center gap-1 bg-[#052B21] p-1 rounded-lg border border-[#B58E46]/55"
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
                        className={`btn-interactive min-h-[36px] px-2.5 py-1 text-xs font-bold rounded-md cursor-pointer whitespace-nowrap ${
                          active
                            ? 'bg-[#B58E46] text-[#052B21] shadow-sm'
                            : 'text-slate-100 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {lang.nativeLabel}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Institutional Title & Arch Lockup Card */}
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
                  className="text-sm sm:text-base text-slate-100 max-w-3xl leading-relaxed"
                >
                  {t.heroDesc}
                </motion.p>
              </div>

              <div className="lg:col-span-3 flex lg:justify-end">
                <InteractiveGlowCard
                  scrollReveal={false}
                  glowColor="rgba(230, 199, 122, 0.22)"
                  className="bg-[#052B21] border border-[#B58E46]/75 rounded-t-3xl rounded-b-xl px-4 py-3.5"
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

            {/* Service Highlights Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs font-bold">
              <InteractiveGlowCard
                scrollReveal={false}
                glowColor="rgba(181, 142, 70, 0.2)"
                className="bg-[#052B21] border border-white/15 rounded-lg px-4 py-3 text-slate-100"
              >
                <span>01 · {t.stripLangs}</span>
              </InteractiveGlowCard>
              <InteractiveGlowCard
                scrollReveal={false}
                glowColor="rgba(181, 142, 70, 0.2)"
                className="bg-[#052B21] border border-white/15 rounded-lg px-4 py-3 text-slate-100"
              >
                <span>02 · {t.strip3D}</span>
              </InteractiveGlowCard>
              <InteractiveGlowCard
                scrollReveal={false}
                glowColor="rgba(230, 199, 122, 0.24)"
                className="bg-[#052B21] border border-[#B58E46]/50 rounded-lg px-4 py-3 text-[#E6C77A]"
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
              <div className="a11y-surface bg-white border-2 border-[#DDD4C2] rounded-xl p-5 sm:p-7 space-y-6 shadow-xs">
                <div className="flex items-center justify-between gap-4 border-b-2 border-[#EAE3D5] pb-4">
                  <div>
                    <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#0D5240]">
                      {t.formTitle}
                    </h2>
                    <p className="text-sm text-slate-600 mt-0.5">{t.formSubtitle}</p>
                  </div>
                  <Activity className="w-6 h-6 text-[#0D5240] shrink-0" aria-hidden="true" />
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  {/* Animated Error & Success Feedback */}
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
                                onClick={() => void runLocalFallbackTriage()}
                                disabled={isAnalyzing}
                                className="btn-interactive inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-md bg-[#0D5240] hover:bg-[#083D2F] disabled:opacity-60 text-white text-xs font-bold border border-[#B58E46] cursor-pointer"
                              >
                                <HeartPulse
                                  className="w-3.5 h-3.5 text-[#E6C77A] shrink-0"
                                  aria-hidden="true"
                                />
                                <span>{t.localFallbackBtn}</span>
                              </button>
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
                        className="bg-emerald-50 border-2 border-[#0D5240] rounded-lg p-4 flex items-start gap-3 text-[#0D5240]"
                      >
                        <CheckCircle2
                          className="w-5 h-5 text-[#0D5240] shrink-0 mt-0.5"
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
                  <div className="bg-[#FAF8F4] border border-[#DDD4C2] rounded-lg px-4 py-3 flex items-center justify-between gap-3 text-sm">
                    <span className="font-bold text-slate-800">{t.selectedAreaLabel}</span>
                    <span className="font-extrabold text-[#0D5240]">
                      {selectedBodyPart
                        ? BODY_PART_LABELS[selectedBodyPart][language]
                        : t.noAreaSelected}
                    </span>
                  </div>

                  {/* Symptoms Textarea + Voice Dictation Control */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label
                        htmlFor="symptoms-input"
                        className="block text-sm font-bold text-[#111D18]"
                      >
                        {t.symptomsLabel}{' '}
                        <span className="text-red-700" aria-hidden="true">
                          *
                        </span>
                      </label>

                      {voiceSupported && (
                        <button
                          type="button"
                          onClick={() =>
                            voiceState === 'listening'
                              ? stopListening()
                              : void startListening()
                          }
                          disabled={voiceState === 'transcribing'}
                          aria-pressed={voiceState === 'listening'}
                          className={`btn-interactive min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors ${
                            voiceState === 'listening'
                              ? 'bg-red-700 text-white border-red-800'
                              : voiceState === 'transcribing'
                              ? 'bg-[#F2EDE2] text-[#0D5240] border-[#B58E46]'
                              : 'bg-[#FAF8F4] hover:bg-[#0D5240] hover:text-white text-[#0D5240] border-[#B58E46]'
                          }`}
                        >
                          {voiceState === 'transcribing' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                          ) : voiceState === 'listening' ? (
                            <MicOff className="w-3.5 h-3.5" aria-hidden="true" />
                          ) : (
                            <Mic className="w-3.5 h-3.5 text-[#B58E46]" aria-hidden="true" />
                          )}
                          <span>
                            {voiceState === 'transcribing'
                              ? t.voiceTranscribingBtn
                              : voiceState === 'listening'
                              ? t.voiceStopBtn
                              : t.voiceStartBtn}
                          </span>
                        </button>
                      )}
                    </div>

                    {voiceErrorMessage && (
                      <div
                        role="alert"
                        className="bg-red-50 border border-red-300 rounded-lg p-3 text-xs font-bold text-red-800 space-y-1.5"
                      >
                        <p>{voiceErrorMessage}</p>
                        {voiceBlockedInIframe && typeof window !== 'undefined' && (
                          <a
                            href={window.location.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[#0D5240] underline font-extrabold"
                          >
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span>{t.gpsOpenStandaloneBtn}</span>
                          </a>
                        )}
                      </div>
                    )}

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
                      className={`w-full rounded-lg border-2 px-4 py-3 text-base text-[#111D18] placeholder:text-slate-500 bg-white focus:outline-none focus:ring-2 transition-colors ${
                        error?.field === 'symptoms'
                          ? 'border-red-700 focus:ring-red-200'
                          : 'border-[#DDD4C2] focus:border-[#0D5240] focus:ring-[#0D5240]/20'
                      }`}
                    />
                    <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                      <span>{t.symptomsHelp}</span>
                      <span className="tabular-nums font-bold">
                        {symptoms.trim().length} {t.charsUnit}
                      </span>
                    </div>
                  </div>

                  {/* Quick Presets */}
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
                                ? 'bg-[#0D5240] text-white border-[#B58E46] ring-2 ring-[#B58E46]/35 shadow-sm'
                                : 'border-[#DDD4C2] bg-[#FAF8F4] hover:bg-[#0D5240] hover:text-white hover:border-[#0D5240] text-[#111D18]'
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
                    <span className="block text-sm font-bold text-[#111D18]">
                      {t.awarenessLabel}
                    </span>
                    <div
                      role="group"
                      aria-label={t.awarenessLabel}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-[#F2EDE2] border border-[#DDD4C2] rounded-lg"
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
                                ? 'bg-[#0D5240] text-white shadow-sm ring-1 ring-[#B58E46]'
                                : 'text-[#111D18] hover:bg-white/80'
                            }`}
                          >
                            {option.label}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Patient-Consented Precise GPS Location Card */}
                  <div className="bg-[#FAF8F4] border-2 border-[#DDD4C2] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-extrabold text-[#0D5240] flex items-center gap-2">
                        <Compass className="w-4 h-4 text-[#B58E46]" aria-hidden="true" />
                        <span>{t.gpsSectionTitle}</span>
                      </span>
                      {gpsLocation && (
                        <button
                          type="button"
                          onClick={() => {
                            setGpsLocation(null);
                            setGpsSuggestedInfo(null);
                            setGpsError(null);
                          }}
                          className="text-xs font-bold text-red-700 hover:underline cursor-pointer"
                        >
                          {t.gpsClearBtn}
                        </button>
                      )}
                    </div>

                    <label className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-[#111D18] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={gpsConsent}
                        onChange={(e) => handleGpsConsentToggle(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-[#0D5240] rounded cursor-pointer shrink-0"
                      />
                      <span>{t.gpsConsentLabel}</span>
                    </label>

                    {gpsConsent && (
                      <div className="space-y-2.5 pt-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            disabled={gpsLoading}
                            onClick={() => void handleCaptureGps()}
                            className="btn-interactive min-h-[42px] px-4 py-2 rounded-lg bg-[#0D5240] hover:bg-[#083D2F] disabled:opacity-65 text-white text-xs font-bold border border-[#B58E46] inline-flex items-center gap-2 cursor-pointer"
                          >
                            {gpsLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin text-[#E6C77A]" aria-hidden="true" />
                            ) : (
                              <MapPin className="w-4 h-4 text-[#E6C77A]" aria-hidden="true" />
                            )}
                            <span>{gpsLoading ? t.gpsCapturingBtn : t.gpsCaptureBtn}</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleEnableManualLocation}
                            className="btn-interactive min-h-[42px] px-3.5 py-2 rounded-lg bg-white hover:bg-[#F2EDE2] text-[#0D5240] text-xs font-bold border border-[#DDD4C2] inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Compass className="w-3.5 h-3.5 text-[#B58E46]" aria-hidden="true" />
                            <span>{t.gpsManualBtn}</span>
                          </button>
                        </div>

                        {gpsError && (
                          <div
                            role="alert"
                            className="bg-red-50 border border-red-300 rounded-lg p-3 space-y-2 text-xs text-red-900"
                          >
                            <p className="font-bold leading-relaxed">{gpsError}</p>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                disabled={gpsLoading}
                                onClick={() => void handleCaptureGps()}
                                className="px-2.5 py-1.5 rounded-md bg-red-700 hover:bg-red-800 text-white font-bold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <RefreshCw className="w-3 h-3" aria-hidden="true" />
                                <span>{t.retryConnectionBtn}</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleEnableManualLocation}
                                className="px-2.5 py-1.5 rounded-md bg-white hover:bg-[#FAF8F4] border border-[#0D5240] text-[#0D5240] font-bold cursor-pointer"
                              >
                                {t.gpsManualBtn}
                              </button>
                              {gpsBlockedInIframe && typeof window !== 'undefined' && (
                                <a
                                  href={window.location.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1.5 rounded-md bg-[#0D5240] text-white font-bold inline-flex items-center gap-1 hover:bg-[#083D2F]"
                                >
                                  <ExternalLink className="w-3 h-3 text-[#E6C77A]" aria-hidden="true" />
                                  <span>{t.gpsOpenStandaloneBtn}</span>
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        {gpsLocation && (
                          <div className="bg-white border border-[#DDD4C2] rounded-lg p-3 text-xs space-y-1">
                            <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-[#0D5240]">
                              <span className="tabular-nums">
                                {gpsLocation.lat.toFixed(5)}, {gpsLocation.lng.toFixed(5)}
                              </span>
                              {gpsLocation.accuracy !== null && (
                                <span className="tabular-nums text-slate-600">
                                  {t.gpsAccuracyLabel}: ±{gpsLocation.accuracy}m
                                </span>
                              )}
                            </div>
                            {gpsSuggestedInfo && (
                              <p className="text-slate-700 font-medium">
                                {gpsSuggestedInfo.withinHaram
                                  ? `${t.gpsNearestZoneNote} ${HARAM_ZONES[gpsSuggestedInfo.zone].labels[language]} (~${gpsSuggestedInfo.distanceMeters}m)`
                                  : t.gpsOutsideHaramNote}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Haram Zone, Manual Landmark Detail & Age */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="zone-select"
                        className="block text-sm font-bold text-[#111D18]"
                      >
                        {t.zoneLabel}
                      </label>
                      <select
                        id="zone-select"
                        value={zone}
                        onChange={(e) => setZone(e.target.value as HaramZone)}
                        className="w-full min-h-[46px] rounded-lg border-2 border-[#DDD4C2] bg-white px-3 py-2.5 text-sm font-semibold text-[#111D18] focus:outline-none focus:border-[#0D5240] focus:ring-2 focus:ring-[#0D5240]/20"
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
                        className="block text-sm font-bold text-[#111D18]"
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
                        className={`w-full min-h-[46px] rounded-lg border-2 px-3 py-2.5 text-sm font-semibold text-[#111D18] placeholder:text-slate-500 bg-white tabular-nums focus:outline-none focus:ring-2 ${
                          error?.field === 'age'
                            ? 'border-red-700 focus:ring-red-200'
                            : 'border-[#DDD4C2] focus:border-[#0D5240] focus:ring-[#0D5240]/20'
                        }`}
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <label
                        htmlFor="location-detail-input"
                        className="block text-sm font-bold text-[#111D18]"
                      >
                        {t.gpsManualDetailLabel}
                      </label>
                      <input
                        ref={manualLocationInputRef}
                        id="location-detail-input"
                        type="text"
                        maxLength={160}
                        value={locationDetail}
                        onChange={(e) => setLocationDetail(e.target.value)}
                        placeholder={t.gpsManualDetailPlaceholder}
                        className={`w-full min-h-[46px] rounded-lg border-2 px-3.5 py-2.5 text-sm font-semibold text-[#111D18] placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-colors ${
                          manualLocationMode
                            ? 'border-[#0D5240] bg-[#FAF8F4] ring-2 ring-[#0D5240]/15'
                            : 'border-[#DDD4C2] bg-white focus:border-[#0D5240] focus:ring-[#0D5240]/20'
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
                      className="btn-interactive flex-1 min-h-[48px] px-6 py-3 bg-[#0D5240] hover:bg-[#083D2F] disabled:opacity-75 disabled:cursor-wait text-white font-bold text-base rounded-lg border-2 border-[#B58E46] flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      {isAnalyzing ? (
                        <Loader2
                          className="w-5 h-5 text-[#E6C77A] shrink-0 animate-spin"
                          aria-hidden="true"
                        />
                      ) : !isOnline ? (
                        <WifiOff className="w-5 h-5 text-[#E6C77A] shrink-0" aria-hidden="true" />
                      ) : (
                        <HeartPulse className="w-5 h-5 text-[#E6C77A] shrink-0" aria-hidden="true" />
                      )}
                      <span>
                        {isAnalyzing
                          ? isRetrying
                            ? t.retryingBtn
                            : t.submittingBtn
                          : !isOnline
                          ? t.localFallbackBtn
                          : t.submitBtn}
                      </span>
                    </motion.button>

                    <motion.button
                      type="button"
                      disabled={isAnalyzing}
                      whileTap={isAnalyzing ? undefined : { scale: 0.97 }}
                      onClick={handleReset}
                      className="btn-interactive min-h-[48px] px-5 py-3 bg-[#FAF8F4] hover:bg-[#F2EDE2] disabled:opacity-60 border-2 border-[#DDD4C2] text-[#111D18] font-bold text-sm rounded-lg flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{t.resetBtn}</span>
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right/End Column: Triage Result + Printable QR Ambulance Card + Paramedic Brief */}
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
                      className={`a11y-surface bg-white border-2 rounded-xl shadow-xs ${LEVEL_STYLES[result.level].border}`}
                    >
                      <article aria-live="polite">
                        <div className={`p-5 space-y-2.5 ${LEVEL_STYLES[result.level].headerBg}`}>
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold opacity-95">
                            <div className="flex items-center gap-2">
                              <span className="tabular-nums">{result.id}</span>
                              <span className="px-2 py-0.5 rounded bg-black/25 text-[11px]">
                                {result.source === 'local' ? t.sourceLocalBadge : t.sourceAiBadge}
                              </span>
                              {isSavingCase ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-[#FDE68A]">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  {t.savingCaseText}
                                </span>
                              ) : result.persisted ? (
                                <span className="text-[11px] text-[#FDE68A]">
                                  · {t.persistedBadge}
                                </span>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="tabular-nums">{result.timestamp}</span>
                              <span aria-hidden="true">·</span>
                              <span>{result.zoneLabel}</span>
                            </div>
                          </div>

                          <div className="flex items-start justify-between gap-3">
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

                            {ttsSupported && (
                              <button
                                type="button"
                                onClick={() => speakText(`result-${result.id}`, resultSpeechText)}
                                aria-label={
                                  speakingId === `result-${result.id}`
                                    ? t.stopReadingBtn
                                    : t.readAloudBtn
                                }
                                className="min-h-[38px] px-2.5 py-1 rounded-md bg-black/25 hover:bg-black/40 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                              >
                                {speakingId === `result-${result.id}` ? (
                                  <VolumeX className="w-4 h-4 text-[#E6C77A]" aria-hidden="true" />
                                ) : (
                                  <Volume2 className="w-4 h-4 text-[#E6C77A]" aria-hidden="true" />
                                )}
                                <span className="hidden sm:inline">
                                  {speakingId === `result-${result.id}`
                                    ? t.stopReadingBtn
                                    : t.readAloudBtn}
                                </span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="p-5 space-y-4">
                          <p className="text-sm font-medium text-[#111D18] leading-relaxed">
                            {result.summary}
                          </p>

                          <div className="space-y-2.5 border-t border-[#EAE3D5] pt-4">
                            <h4 className="text-sm font-extrabold text-[#0D5240]">
                              {t.stepsTitle}
                            </h4>
                            <ol className="space-y-2">
                              {result.firstAidSteps.map((step, index) => (
                                <li
                                  key={`${index}-${step}`}
                                  className="flex items-start gap-2.5 text-sm text-slate-800 font-medium leading-relaxed"
                                >
                                  <span className="font-extrabold text-[#0D5240] tabular-nums shrink-0">
                                    {String(index + 1).padStart(2, '0')}.
                                  </span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>

                          <div className="border-t border-[#EAE3D5] pt-4 flex items-start gap-2 text-sm font-semibold text-[#111D18]">
                            <MapPin
                              className="w-4 h-4 text-[#0D5240] shrink-0 mt-1"
                              aria-hidden="true"
                            />
                            <div className="space-y-1">
                              <p className="leading-relaxed">{result.nearestCarePoint}</p>
                              {result.locationDetail && (
                                <p className="text-xs font-bold text-[#0D5240]">
                                  {result.zoneLabel} — {result.locationDetail}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="bg-[#FAF8F4] border border-[#DDD4C2] rounded-lg p-3.5 text-xs text-[#111D18] leading-relaxed font-medium">
                            <span className="font-extrabold">{t.safetyTitle} </span>
                            {result.warningSigns}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            {result.callEmergency && (
                              <a
                                href="tel:997"
                                className="btn-interactive flex-1 min-h-[48px] px-4 py-3 bg-red-700 hover:bg-red-800 text-white font-extrabold text-sm rounded-lg flex items-center justify-center gap-2 shadow-sm"
                              >
                                <PhoneCall className="w-4 h-4 shrink-0" aria-hidden="true" />
                                <span className="tabular-nums">{t.call997Btn}</span>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => setAssistantModalOpen(true)}
                              className="btn-interactive min-h-[48px] px-4 py-3 bg-[#083D2F] hover:bg-[#0D5240] text-white font-bold text-xs sm:text-sm rounded-lg border border-[#B58E46] flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Bot className="w-4 h-4 text-[#E6C77A] shrink-0" aria-hidden="true" />
                              <span>{t.assistantBtn}</span>
                            </button>
                          </div>
                        </div>
                      </article>
                    </InteractiveGlowCard>

                    {/* 2. Printable Ambulance Card with Offline QR & GPS */}
                    <PrintableTriageCard
                      language={language}
                      result={result}
                      ttsSupported={ttsSupported}
                      speakingId={speakingId}
                      onSpeak={speakText}
                    />

                    {/* 3. Dedicated Paramedic & First Responder Advisory Report */}
                    <InteractiveGlowCard
                      scrollReveal={false}
                      className="a11y-surface bg-white border-2 border-[#B58E46] rounded-xl shadow-xs"
                    >
                      <section id="paramedic-report">
                        <div className="px-5 py-4 bg-[#0D5240] text-white flex items-start justify-between gap-3 border-b-2 border-[#B58E46]">
                          <div>
                            <h3 className="font-display text-base font-extrabold text-white">
                              {t.paramedicTitle}
                            </h3>
                            <p className="text-xs text-[#E6C77A] mt-0.5">
                              {t.paramedicSubtitle}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {ttsSupported && (
                              <button
                                type="button"
                                onClick={() =>
                                  speakText(`paramedic-${result.id}`, paramedicSpeechText)
                                }
                                aria-label={
                                  speakingId === `paramedic-${result.id}`
                                    ? t.stopReadingBtn
                                    : t.readAloudBtn
                                }
                                className="min-h-[34px] px-2 py-1 rounded-md bg-black/25 hover:bg-black/40 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                {speakingId === `paramedic-${result.id}` ? (
                                  <VolumeX className="w-3.5 h-3.5 text-[#E6C77A]" aria-hidden="true" />
                                ) : (
                                  <Volume2 className="w-3.5 h-3.5 text-[#E6C77A]" aria-hidden="true" />
                                )}
                              </button>
                            )}
                            <ClipboardList
                              className="w-5 h-5 text-[#E6C77A] shrink-0 mt-0.5"
                              aria-hidden="true"
                            />
                          </div>
                        </div>

                        <div className="p-5 space-y-4 text-sm text-[#111D18]">
                          <div>
                            <p className="text-xs font-extrabold text-[#0D5240] mb-1">
                              {t.paramedicImpression}
                            </p>
                            <p className="font-semibold leading-relaxed">
                              {result.responderReport.clinicalImpression}
                            </p>
                          </div>

                          <div className="border-t border-[#EAE3D5] pt-3">
                            <p className="text-xs font-extrabold text-[#0D5240] mb-2">
                              {t.paramedicActions}
                            </p>
                            <ul className="space-y-1.5">
                              {result.responderReport.immediateActions.map((act, idx) => (
                                <li
                                  key={`${idx}-${act}`}
                                  className="flex items-start gap-2 text-xs sm:text-sm font-medium text-slate-800 leading-relaxed"
                                >
                                  <span className="font-extrabold text-[#B58E46] tabular-nums shrink-0">
                                    {String(idx + 1).padStart(2, '0')}.
                                  </span>
                                  <span>{act}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="border-t border-[#EAE3D5] pt-3">
                            <p className="text-xs font-extrabold text-[#0D5240] mb-1">
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

                          <div className="border-t border-[#EAE3D5] pt-3">
                            <p className="text-xs font-extrabold text-[#0D5240] mb-1">
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
                    className="a11y-surface bg-white border-2 border-[#DDD4C2] rounded-xl p-6 space-y-5 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-[#0D5240] text-[#E6C77A] flex items-center justify-center shrink-0">
                        <Stethoscope className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h2 className="font-display text-lg font-extrabold text-[#0D5240]">
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

                    <div className="space-y-3 border-t border-[#EAE3D5] pt-4 text-sm">
                      <div className="flex items-start gap-2.5">
                        <ShieldAlert
                          className="w-4 h-4 text-red-700 shrink-0 mt-1"
                          aria-hidden="true"
                        />
                        <span className="font-bold text-red-900">
                          {language === 'ar'
                            ? 'المستوى الأحمر: تدخل فوري (ألم صدر، إغماء، ضربة شمس).'
                            : language === 'en'
                            ? 'RED: Immediate life-saving care (chest pain, fainting, heatstroke).'
                            : language === 'ur'
                            ? 'ریڈ: فوری ہنگامی مدد (سینے کا درد، بے ہوشی، ہیٹ اسٹروک)۔'
                            : 'MERAH: Penanganan segera (nyeri dada, pingsan, heatstroke).'}
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
                          className="w-4 h-4 text-[#0D5240] shrink-0 mt-1"
                          aria-hidden="true"
                        />
                        <span className="font-bold text-[#0D5240]">
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

              {/* Session Triage History (Locally Cached for Offline Access) */}
              {history.length > 0 && (
                <InteractiveGlowCard
                  scrollReveal={false}
                  className="a11y-surface bg-white border-2 border-[#DDD4C2] rounded-xl p-5 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-sm font-extrabold text-[#0D5240]">
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

                  <ul className="divide-y divide-[#EAE3D5]">
                    {history.map((item) => (
                      <li key={item.id} className="py-1.5 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setResult(item);
                            setError(null);
                            setSuccessMessage(`${t.successTitle} (${item.priorityCode})`);
                          }}
                          className="flex-1 min-w-0 py-1.5 flex items-center justify-between gap-3 text-start hover:bg-[#FAF8F4] rounded-md px-2 transition-colors cursor-pointer"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#111D18] truncate">
                              {item.categoryTitle}
                            </p>
                            <p className="text-xs font-semibold text-slate-600 tabular-nums">
                              {item.zoneLabel} · {item.timestamp} · {item.priorityCode}
                            </p>
                          </div>
                          <ChevronLeft
                            className="w-4 h-4 text-slate-500 shrink-0 ltr:rotate-180"
                            aria-hidden="true"
                          />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => void handleDeleteHistoryItem(e, item)}
                          disabled={deletingHistoryId === item.id}
                          aria-label={t.deleteCaseBtn}
                          className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-md text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                        >
                          {deletingHistoryId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </InteractiveGlowCard>
              )}
            </div>
          </section>

          {/* Offline-Available First-Aid Protocols */}
          <OfflineGuidelinesSection
            language={language}
            ttsSupported={ttsSupported}
            speakingId={speakingId}
            onSpeak={speakText}
          />

          {/* Institutional Portal Reference Cards: Triage Levels */}
          <section id="triage-levels" className="space-y-5 border-t-2 border-[#DDD4C2] pt-10">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-1"
            >
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#0D5240]">
                {t.levelsTitle}
              </h2>
              <p className="text-sm font-medium text-slate-700">{t.levelsSub}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <InteractiveGlowCard
                delayIndex={0}
                glowColor="rgba(185, 28, 28, 0.14)"
                className="a11y-surface bg-white border-2 border-red-700 rounded-xl p-5 space-y-2.5"
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
                className="a11y-surface bg-white border-2 border-amber-600 rounded-xl p-5 space-y-2.5"
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
                glowColor="rgba(13, 82, 64, 0.14)"
                className="a11y-surface bg-white border-2 border-[#0D5240] rounded-xl p-5 space-y-2.5"
              >
                <div className="flex items-center gap-2 text-[#0D5240] font-extrabold text-sm">
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

          {/* Ministry of Hajj & Umrah: Things to Remember for Health Cards */}
          <section id="health-reminders" className="space-y-5 border-t-2 border-[#DDD4C2] pt-10">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col md:flex-row md:items-end justify-between gap-3"
            >
              <div className="space-y-1">
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#0D5240]">
                  {t.healthRemindersTitle}
                </h2>
                <p className="text-sm font-medium text-slate-700 max-w-3xl">
                  {t.healthRemindersSub}
                </p>
              </div>
              <p className="text-xs font-bold text-[#0D5240] shrink-0">
                {t.healthRemindersSource}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {HEALTH_REMINDER_CARDS.map((card, index) => (
                <InteractiveGlowCard
                  key={card.id}
                  delayIndex={index}
                  className="a11y-surface bg-white border-2 border-[#DDD4C2] hover:border-[#B58E46] rounded-xl p-5 shadow-xs"
                >
                  <article className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-[#B58E46]">
                      <span className="tabular-nums text-[#0D5240]">{card.number}</span>
                      <span aria-hidden="true">·</span>
                      <span>{card.category[language]}</span>
                    </div>
                    <h3 className="font-display text-base sm:text-lg font-extrabold text-[#0D5240] leading-snug">
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

          {/* Medical Points & Emergency Contacts */}
          <section id="haram-points" className="space-y-5 border-t-2 border-[#DDD4C2] pt-10">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-1"
            >
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#0D5240]">
                {t.pointsTitle}
              </h2>
              <p className="text-sm font-medium text-slate-700">{t.pointsSub}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InteractiveGlowCard
                delayIndex={0}
                className="a11y-surface bg-white border-2 border-[#DDD4C2] rounded-xl p-6 space-y-3"
              >
                <div className="flex items-center gap-2 text-[#0D5240] font-extrabold text-base">
                  <MapPin className="w-5 h-5 text-[#B58E46] shrink-0" aria-hidden="true" />
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
                className="bg-[#083D2F] text-white border-2 border-[#B58E46] rounded-xl p-6 space-y-4"
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
                      className="btn-interactive px-3 py-1 bg-[#B58E46] hover:bg-[#c8a052] rounded-md font-extrabold text-[#052B21] tabular-nums"
                    >
                      911
                    </a>
                  </div>
                </div>
              </InteractiveGlowCard>
            </div>
          </section>
        </main>

        {/* Ministry Portal Footer */}
        <footer className="no-print bg-[#052B21] text-slate-200 border-t-2 border-[#B58E46] mt-12">
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
                className="a11y-surface bg-[#FAF8F4] w-full sm:max-w-md rounded-t-2xl sm:rounded-xl border-2 border-[#0D5240] p-6 space-y-5 shadow-2xl"
              >
                <div className="flex items-center justify-between gap-4 border-b border-[#DDD4C2] pb-3">
                  <h2
                    id="emergency-modal-title"
                    className="font-display text-lg font-extrabold text-[#0D5240]"
                  >
                    {t.modalTitle}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setEmergencyModalOpen(false)}
                    aria-label={t.modalClose}
                    className="btn-interactive min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-600 hover:text-black hover:bg-[#F2EDE2] cursor-pointer"
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>

                <p className="text-sm font-medium text-[#111D18] leading-relaxed">
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
                    className="btn-interactive w-full min-h-[48px] px-4 py-3 bg-[#0D5240] hover:bg-[#083D2F] text-white font-extrabold text-sm rounded-lg border-2 border-[#B58E46] flex items-center justify-center gap-2"
                  >
                    <PhoneCall className="w-4 h-4 text-[#E6C77A] shrink-0" aria-hidden="true" />
                    <span className="tabular-nums">{t.modalCall911}</span>
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Accessibility Settings Modal */}
        <AccessibilityModal
          open={a11yModalOpen}
          onClose={() => setA11yModalOpen(false)}
          language={language}
          settings={a11ySettings}
          onChangeSettings={setA11ySettings}
          onReset={resetAccessibility}
          ttsSupported={ttsSupported}
          speakingId={speakingId}
          onSpeakSample={speakText}
          onStopSpeaking={stopSpeaking}
        />

        {/* Smart AI First-Aid Assistant Modal */}
        <FirstAidAssistantModal
          open={assistantModalOpen}
          onClose={() => setAssistantModalOpen(false)}
          language={language}
          activeResult={result}
          ttsSupported={ttsSupported}
          speakingId={speakingId}
          onSpeak={speakText}
        />

        {/* Responder & Supervisor Operations Portal Modal */}
        <ResponderOperationsModal
          open={opsModalOpen}
          onClose={() => setOpsModalOpen(false)}
          language={language}
          authToken={authToken}
          authUser={authUser}
          onAuthSuccess={(token, user) => {
            setAuthToken(token);
            setAuthUser(user);
          }}
          onLogout={() => {
            void fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
            setAuthToken(null);
            setAuthUser(null);
          }}
          onLoadCaseToWorkspace={(loaded) => {
            setResult(loaded);
            setError(null);
            setSuccessMessage(`${t.successTitle} (${loaded.priorityCode})`);
            if (window.innerWidth < 1024 && resultSectionRef.current) {
              resultSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          onCaseUpdated={(updated) => {
            setHistory((prev) =>
              prev.map((item) =>
                item.id === updated.id ? { ...updated, caseToken: item.caseToken } : item
              )
            );
            if (result?.id === updated.id) {
              setResult({ ...updated, caseToken: result.caseToken });
            }
          }}
          onCaseDeleted={(deletedId) => {
            setHistory((prev) => prev.filter((item) => item.id !== deletedId));
            if (result?.id === deletedId) {
              setResult(null);
              setSuccessMessage(null);
            }
          }}
        />
      </div>
    </MotionConfig>
  );
}
