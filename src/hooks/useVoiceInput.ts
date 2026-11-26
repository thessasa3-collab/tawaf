import { useCallback, useEffect, useRef, useState } from 'react';
import { LanguageCode } from '../i18n';
import {
  inspectPermissionDiagnostics,
  isPermissionsPolicyErrorMessage,
} from '../utils/browserPermissions';

const SPEECH_LOCALE: Record<LanguageCode, string> = {
  ar: 'ar-SA',
  en: 'en-US',
  ur: 'ur-PK',
  id: 'id-ID',
};

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [idx: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export type VoiceState = 'idle' | 'listening' | 'transcribing';

export type VoiceErrorCode =
  | 'UNSUPPORTED'
  | 'INSECURE_CONTEXT'
  | 'IFRAME_BLOCKED'
  | 'PERMISSION_DENIED'
  | 'NO_MICROPHONE'
  | 'MIC_IN_USE'
  | 'TRANSCRIBE_FAILED'
  | 'ERROR';

export function useVoiceInput(
  language: LanguageCode,
  onTranscript: (text: string) => void
) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceError, setVoiceError] = useState<VoiceErrorCode | null>(null);
  const [voiceBlockedInIframe, setVoiceBlockedInIframe] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  const speechSupported = Boolean(getSpeechRecognitionCtor());
  const recorderSupported =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== 'undefined';

  const isSupported = speechSupported || recorderSupported;

  const cleanupMedia = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('[Tawaf Voice] Error stopping SpeechRecognition:', err);
      }
      recognitionRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.warn('[Tawaf Voice] Error stopping MediaRecorder:', err);
        cleanupMedia();
        setVoiceState('idle');
      }
    } else if (voiceState === 'listening') {
      setVoiceState('idle');
    }
  }, [cleanupMedia, voiceState]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {
        // Ignore cleanup errors
      }
      cleanupMedia();
    };
  }, [cleanupMedia]);

  const startMediaRecorderFallback = useCallback(async () => {
    if (!recorderSupported) {
      console.error('[Tawaf Voice] MediaRecorder fallback unsupported in this browser.');
      setVoiceError('UNSUPPORTED');
      setVoiceState('idle');
      return;
    }

    const diag = await inspectPermissionDiagnostics('microphone');
    if (!diag.isSecureContext) {
      console.error('[Tawaf Voice] Microphone blocked: insecure context (HTTPS required).', diag);
      setVoiceError('INSECURE_CONTEXT');
      setVoiceState('idle');
      return;
    }
    if (diag.policyAllowed === false) {
      console.error('[Tawaf Voice] Microphone blocked by Permissions-Policy / iframe allow attribute.', diag);
      setVoiceBlockedInIframe(diag.inIframe);
      setVoiceError(diag.inIframe ? 'IFRAME_BLOCKED' : 'PERMISSION_DENIED');
      setVoiceState('idle');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeCandidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg',
      ];
      const selectedMime =
        mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) || '';

      const recorder = selectedMime
        ? new MediaRecorder(stream, { mimeType: selectedMime })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const mime = recorder.mimeType || selectedMime || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mime });
        cleanupMedia();

        if (blob.size < 256) {
          console.warn('[Tawaf Voice] Captured audio clip too small:', blob.size);
          setVoiceState('idle');
          return;
        }

        setVoiceState('transcribing');
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const str = typeof reader.result === 'string' ? reader.result : '';
              const comma = str.indexOf(',');
              resolve(comma >= 0 ? str.slice(comma + 1) : str);
            };
            reader.onerror = () => reject(new Error('FileReader audio conversion failed'));
            reader.readAsDataURL(blob);
          });

          const res = await fetch('/api/audio/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64,
              mimeType: mime,
              language,
            }),
          });
          const data = (await res.json().catch(() => null)) as {
            transcript?: string;
            error?: string;
          } | null;

          if (res.ok && data?.transcript) {
            onTranscriptRef.current(data.transcript.trim());
          } else {
            console.error('[Tawaf Voice] Server transcription failed:', {
              status: res.status,
              error: data?.error,
            });
            setVoiceError('TRANSCRIBE_FAILED');
          }
        } catch (err) {
          console.error('[Tawaf Voice] Audio upload/transcription exception:', err);
          setVoiceError('TRANSCRIBE_FAILED');
        } finally {
          setVoiceState('idle');
        }
      };

      mediaRecorderRef.current = recorder;
      setVoiceState('listening');
      recorder.start();
    } catch (err: unknown) {
      cleanupMedia();
      const postDiag = await inspectPermissionDiagnostics('microphone');
      const errName = err instanceof DOMException ? err.name : err instanceof Error ? err.name : 'UnknownError';
      const errMsg = err instanceof Error ? err.message : String(err);

      console.error('[Tawaf Voice] navigator.mediaDevices.getUserMedia failed:', {
        name: errName,
        message: errMsg,
        diagnostics: postDiag,
        error: err,
      });

      if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setVoiceError('NO_MICROPHONE');
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        setVoiceError('MIC_IN_USE');
      } else if (errName === 'SecurityError' || !postDiag.isSecureContext) {
        setVoiceError('INSECURE_CONTEXT');
      } else if (
        errName === 'NotAllowedError' ||
        errName === 'PermissionDeniedError'
      ) {
        const iframeBlocked =
          postDiag.inIframe &&
          (postDiag.policyAllowed === false || isPermissionsPolicyErrorMessage(errMsg));
        setVoiceBlockedInIframe(iframeBlocked);
        setVoiceError(iframeBlocked ? 'IFRAME_BLOCKED' : 'PERMISSION_DENIED');
      } else {
        setVoiceError('ERROR');
      }
      setVoiceState('idle');
    }
  }, [cleanupMedia, language, recorderSupported]);

  const startListening = useCallback(async () => {
    setVoiceError(null);
    setVoiceBlockedInIframe(false);

    if (!isSupported) {
      console.error('[Tawaf Voice] Neither Web Speech API nor MediaRecorder is supported in this browser.');
      setVoiceError('UNSUPPORTED');
      return;
    }

    if (voiceState === 'listening') {
      stopListening();
      return;
    }

    const diag = await inspectPermissionDiagnostics('microphone');
    if (!diag.isSecureContext) {
      console.error('[Tawaf Voice] Microphone blocked: insecure context (HTTPS required).', diag);
      setVoiceError('INSECURE_CONTEXT');
      return;
    }
    if (diag.policyAllowed === false) {
      console.error('[Tawaf Voice] Microphone disallowed by document Permissions-Policy / iframe allow attribute.', diag);
      setVoiceBlockedInIframe(diag.inIframe);
      setVoiceError(diag.inIframe ? 'IFRAME_BLOCKED' : 'PERMISSION_DENIED');
      return;
    }

    const SpeechCtor = getSpeechRecognitionCtor();
    if (SpeechCtor) {
      try {
        const rec = new SpeechCtor();
        rec.lang = SPEECH_LOCALE[language];
        rec.interimResults = false;
        rec.continuous = false;
        rec.maxAlternatives = 1;

        let captured = '';
        let fellBackToRecorder = false;

        rec.onresult = (event: SpeechRecognitionEventLike) => {
          const parts: string[] = [];
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const res = event.results[i];
            if (res && res[0]?.transcript) {
              parts.push(res[0].transcript.trim());
            }
          }
          captured = [captured, ...parts].filter(Boolean).join(' ').trim();
        };

        rec.onerror = async (ev: SpeechRecognitionErrorEventLike) => {
          const code = ev.error;
          const msg = ev.message || '';
          const currentDiag = await inspectPermissionDiagnostics('microphone');

          console.error('[Tawaf Voice] SpeechRecognition error:', {
            error: code,
            message: msg,
            locale: rec.lang,
            diagnostics: currentDiag,
          });

          // On Microsoft Edge / Firefox / restricted environments, Web Speech service may fail with 'network',
          // 'service-not-allowed', or 'language-not-supported'; seamlessly fall back to MediaRecorder + Gemini transcribe
          if (
            (code === 'network' ||
              code === 'service-not-allowed' ||
              code === 'language-not-supported') &&
            recorderSupported &&
            currentDiag.policyAllowed !== false
          ) {
            console.warn('[Tawaf Voice] Switching from Web Speech API to MediaRecorder fallback due to:', code);
            fellBackToRecorder = true;
            recognitionRef.current = null;
            await startMediaRecorderFallback();
            return;
          }

          if (code === 'not-allowed' || code === 'service-not-allowed') {
            const iframeBlocked =
              currentDiag.inIframe &&
              (currentDiag.policyAllowed === false || isPermissionsPolicyErrorMessage(msg));
            setVoiceBlockedInIframe(iframeBlocked);
            setVoiceError(iframeBlocked ? 'IFRAME_BLOCKED' : 'PERMISSION_DENIED');
          } else if (code === 'audio-capture') {
            setVoiceError('NO_MICROPHONE');
          } else if (code !== 'aborted' && code !== 'no-speech') {
            setVoiceError('ERROR');
          }
          setVoiceState('idle');
        };

        rec.onend = () => {
          recognitionRef.current = null;
          if (!fellBackToRecorder) {
            setVoiceState('idle');
            if (captured) {
              onTranscriptRef.current(captured);
            }
          }
        };

        recognitionRef.current = rec;
        setVoiceState('listening');
        rec.start();
        return;
      } catch (err) {
        console.warn('[Tawaf Voice] SpeechRecognition.start() failed, falling back to MediaRecorder:', err);
        recognitionRef.current = null;
      }
    }

    await startMediaRecorderFallback();
  }, [
    isSupported,
    language,
    recorderSupported,
    startMediaRecorderFallback,
    stopListening,
    voiceState,
  ]);

  return {
    isSupported,
    voiceState,
    voiceError,
    voiceBlockedInIframe,
    clearVoiceError: () => {
      setVoiceError(null);
      setVoiceBlockedInIframe(false);
    },
    startListening,
    stopListening,
  };
}
