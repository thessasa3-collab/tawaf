import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bot,
  Loader2,
  Mic,
  MicOff,
  PhoneCall,
  Send,
  Volume2,
  VolumeX,
  WifiOff,
  X,
} from 'lucide-react';
import { OFFLINE_GUIDELINES } from '../data/offlineGuidelines';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useVoiceInput, VoiceErrorCode } from '../hooks/useVoiceInput';
import { LanguageCode, UI_TRANSLATIONS } from '../i18n';
import { TriageResult } from '../triageEngine';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

interface FirstAidAssistantModalProps {
  open: boolean;
  onClose: () => void;
  language: LanguageCode;
  activeResult: TriageResult | null;
  ttsSupported: boolean;
  speakingId: string | null;
  onSpeak: (id: string, text: string) => void;
}

function buildOfflineAssistantReply(query: string, language: LanguageCode): string {
  const q = query.toLowerCase();
  const match =
    OFFLINE_GUIDELINES.find((g) => {
      const text = `${g.title[language]} ${g.summary[language]} ${g.steps[language].join(' ')}`.toLowerCase();
      return q
        .split(/\s+/)
        .filter((w) => w.length >= 3)
        .some((word) => text.includes(word));
    }) ?? OFFLINE_GUIDELINES[0];

  const steps = match.steps[language]
    .map((s, i) => `${i + 1}. ${s}`)
    .join('\n');
  return `${match.title[language]}\n\n${steps}\n\n⚠ ${match.doNot[language]}`;
}

export const FirstAidAssistantModal: React.FC<FirstAidAssistantModalProps> = ({
  open,
  onClose,
  language,
  activeResult,
  ttsSupported,
  speakingId,
  onSpeak,
}) => {
  const t = UI_TRANSLATIONS[language];
  const isOnline = useOnlineStatus();

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: 'welcome', role: 'assistant', text: UI_TRANSLATIONS[language].assistantWelcome },
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const listEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages((prev) =>
      prev.length === 1 && prev[0].id === 'welcome'
        ? [{ id: 'welcome', role: 'assistant', text: t.assistantWelcome }]
        : prev
    );
  }, [t.assistantWelcome]);

  useEffect(() => {
    if (open) {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const {
    isSupported: voiceSupported,
    voiceState,
    voiceError,
    voiceBlockedInIframe,
    startListening,
    stopListening,
  } = useVoiceInput(language, (transcript) => {
    setInputText((prev) => (prev.trim() ? `${prev.trim()} ${transcript}` : transcript));
  });

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

  const sendMessage = async (textOverride?: string) => {
    const content = (textOverride ?? inputText).trim();
    if (!content || sending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: content,
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    if (!textOverride) setInputText('');

    if (!isOnline) {
      const offlineReply = buildOfflineAssistantReply(content, language);
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', text: offlineReply },
      ]);
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          message: content,
          history: nextHistory
            .filter((m) => m.id !== 'welcome')
            .slice(-8)
            .map((m) => ({ role: m.role, text: m.text })),
          triageContext: activeResult
            ? {
                level: activeResult.level,
                zone: activeResult.zone,
                bodyPart: activeResult.bodyPart,
                categoryTitle: activeResult.categoryTitle,
              }
            : null,
        }),
      });

      const data = (await res.json().catch(() => null)) as {
        reply?: string;
        error?: string;
      } | null;

      if (res.ok && data?.reply) {
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: 'assistant', text: data.reply! },
        ]);
      } else {
        const fallback = buildOfflineAssistantReply(content, language);
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            text: `${data?.error ? `${data.error}\n\n` : ''}${fallback}`,
          },
        ]);
      }
    } catch {
      const fallback = buildOfflineAssistantReply(content, language);
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', text: fallback },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="assistant-modal-title"
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
            className="a11y-surface bg-[#FAF8F4] w-full sm:max-w-2xl h-[88vh] sm:h-[640px] rounded-t-2xl sm:rounded-xl border-2 border-[#0D5240] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-[#0D5240] text-white border-b-2 border-[#B58E46] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-[#083D2F] border border-[#B58E46] flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-[#E6C77A]" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h2
                    id="assistant-modal-title"
                    className="font-display text-base sm:text-lg font-extrabold truncate"
                  >
                    {t.assistantTitle}
                  </h2>
                  <p className="text-xs text-[#E6C77A] truncate">{t.assistantSubtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="tel:997"
                  className="min-h-[38px] px-2.5 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-extrabold flex items-center gap-1 tabular-nums"
                >
                  <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>997</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t.modalClose}
                  className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-lg text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Context / Offline Banner */}
            {(activeResult || !isOnline) && (
              <div className="px-4 py-2 bg-[#F2EDE2] border-b border-[#DDD4C2] flex flex-wrap items-center justify-between gap-2 text-xs">
                {activeResult && (
                  <span className="font-bold text-[#0D5240]">
                    {t.assistantContextBadge}: {activeResult.categoryTitle} ({activeResult.priorityCode})
                  </span>
                )}
                {!isOnline && (
                  <span className="inline-flex items-center gap-1.5 font-bold text-amber-900">
                    <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t.assistantOfflineNotice}</span>
                  </span>
                )}
              </div>
            )}

            {/* Chat Thread */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                const speakId = `chat-${msg.id}`;
                const isSpeaking = speakingId === speakId;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                        isUser
                          ? 'bg-[#0D5240] text-white font-medium'
                          : 'a11y-surface bg-white border-2 border-[#DDD4C2] text-[#111D18] font-medium'
                      }`}
                    >
                      <p>{msg.text}</p>
                      {!isUser && ttsSupported && (
                        <div className="mt-2 pt-2 border-t border-[#EAE3D5] flex justify-end">
                          <button
                            type="button"
                            onClick={() => onSpeak(speakId, msg.text)}
                            className="text-[11px] font-bold text-[#0D5240] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            {isSpeaking ? (
                              <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                            )}
                            <span>{isSpeaking ? t.stopReadingBtn : t.readAloudBtn}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {sending && (
                <div className="flex justify-start">
                  <div className="bg-white border-2 border-[#DDD4C2] rounded-xl px-4 py-3 flex items-center gap-2 text-xs font-bold text-[#0D5240]">
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>...</span>
                  </div>
                </div>
              )}
              <div ref={listEndRef} />
            </div>

            {/* Quick Question Chips */}
            <div className="px-4 py-2 bg-[#F2EDE2] border-t border-[#DDD4C2] flex flex-wrap gap-1.5 shrink-0">
              {[t.assistantQuick1, t.assistantQuick2, t.assistantQuick3].map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={sending}
                  onClick={() => void sendMessage(q)}
                  className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-white border border-[#DDD4C2] hover:border-[#0D5240] text-[#0D5240] cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Voice Diagnostics Notice */}
            {voiceErrorMessage && (
              <div
                role="alert"
                className="px-4 py-2 bg-red-50 border-t border-red-300 text-xs font-bold text-red-800 flex flex-wrap items-center justify-between gap-2 shrink-0"
              >
                <span>{voiceErrorMessage}</span>
                {voiceBlockedInIframe && typeof window !== 'undefined' && (
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#0D5240] font-extrabold"
                  >
                    {t.gpsOpenStandaloneBtn}
                  </a>
                )}
              </div>
            )}

            {/* Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage();
              }}
              className="p-3 sm:p-4 bg-white border-t-2 border-[#DDD4C2] flex items-center gap-2 shrink-0"
            >
              {voiceSupported && (
                <button
                  type="button"
                  onClick={() =>
                    voiceState === 'listening' ? stopListening() : void startListening()
                  }
                  disabled={voiceState === 'transcribing'}
                  aria-label={voiceState === 'listening' ? t.voiceStopBtn : t.voiceStartBtn}
                  className={`min-h-[44px] min-w-[44px] px-3 rounded-lg border-2 flex items-center justify-center cursor-pointer shrink-0 transition-colors ${
                    voiceState === 'listening'
                      ? 'bg-red-700 text-white border-red-800'
                      : 'bg-[#FAF8F4] text-[#0D5240] border-[#DDD4C2] hover:border-[#0D5240]'
                  }`}
                >
                  {voiceState === 'transcribing' ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : voiceState === 'listening' ? (
                    <MicOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Mic className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              )}

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t.assistantPlaceholder}
                className="flex-1 min-h-[44px] rounded-lg border-2 border-[#DDD4C2] bg-[#FAF8F4] px-3.5 text-sm font-medium text-[#111D18] focus:outline-none focus:border-[#0D5240]"
              />

              <button
                type="submit"
                disabled={sending || !inputText.trim()}
                className="btn-interactive min-h-[44px] px-4 py-2 rounded-lg bg-[#0D5240] hover:bg-[#083D2F] disabled:opacity-50 text-white text-xs sm:text-sm font-bold border-2 border-[#B58E46] flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4 text-[#E6C77A]" aria-hidden="true" />
                <span className="hidden sm:inline">{t.assistantSendBtn}</span>
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
