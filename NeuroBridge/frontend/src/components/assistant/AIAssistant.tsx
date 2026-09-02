// JARVIS 2.0 – Persistent Voice Assistant & Real-Time Website Interaction
// Floating, screen-aware, non-blocking AI Web Agent for NeuroBridge

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Minus,
  X,
  Volume2,
  Send,
  Sparkles,
  Bot,
  User,
  Globe,
  Radio,
  Compass,
  ArrowDown,
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  Type,
  Check,
  AlertTriangle,
  Loader2,
  VolumeX,
} from 'lucide-react';
import { useAssistant } from '../../contexts/AssistantContext';
import { useAuth } from '../../contexts/AuthContext';
import { getSpeechService } from '../../services/speechService';
import type { Language } from '../../types/assistant';

interface AIAssistantProps {
  autoStart?: boolean;
}

export function AIAssistant({ autoStart = true }: AIAssistantProps) {
  const {
    isOpen,
    setIsOpen,
    conversationState,
    processUserInput,
    agentStatus,
    setAgentStatus,
    currentActionName,
    pendingConfirmation,
    confirmPendingAction,
    cancelPendingAction,
    language,
    setLanguage,
    addMessage,
    wakeWordEnabled,
  } = useAssistant();

  const { user } = useAuth();

  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechService = useRef(getSpeechService()).current;
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-scroll to latest message inside Jarvis window
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationState.messages, agentStatus, isOpen]);

  // ── Speech Synthesis with visual state tracking ─────────────────────────────
  const speakFeedback = useCallback(async (text: string, lang: Language) => {
    setSpeechError(null);
    setIsSpeaking(true);
    setAgentStatus('idle');

    try {
      await speechService.speak(text, { language: lang });
    } catch (error) {
      console.warn('[Jarvis] Speech synthesis warning:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, [speechService, setAgentStatus]);

  // ── Command Listening Handler ───────────────────────────────────────────────
  const startCommandListening = useCallback(() => {
    setIsListening(true);
    setAgentStatus('listening');
    setSpeechError(null);

    speechService.startCommandListening(
      (transcript, isFinal) => {
        setUserInput(transcript);
        if (isFinal && transcript.trim()) {
          handleUserSubmit(transcript.trim());
        }
      },
      (error) => {
        console.warn('[Jarvis] Speech recognition error:', error);
        setIsListening(false);
        setAgentStatus('idle');
        if (error.includes('not-allowed') || error.includes('permission')) {
          setSpeechError('Microphone access is unavailable. You can type commands below.');
        }
      },
      language
    );

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      speechService.stopCommandListening();
      setIsListening(false);
      if (agentStatus === 'listening') setAgentStatus('idle');
    }, 6000);
  }, [speechService, language, agentStatus, setAgentStatus]);

  const stopCommandListening = useCallback(() => {
    speechService.stopCommandListening();
    setIsListening(false);
    if (agentStatus === 'listening') setAgentStatus('idle');
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
  }, [speechService, agentStatus, setAgentStatus]);

  // ── Wake Word ("Hey Jarvis") Background Listener ───────────────────────────
  const isWakeProcessingRef = useRef(false);

  useEffect(() => {
    if (!wakeWordEnabled) {
      speechService.stopWakeWordDetection();
      return;
    }

    // Only listen for wake word when NOT actively taking a command or speaking
    if (!isListening && !isSpeaking && agentStatus === 'idle') {
      speechService.startWakeWordDetection(
        () => {
          if (isWakeProcessingRef.current) return;
          isWakeProcessingRef.current = true;

          // Wake word matched!
          setIsOpen(true);
          speechService.stopSpeaking();

          speakFeedback("I'm listening.", language).then(() => {
            isWakeProcessingRef.current = false;
            startCommandListening();
          });
        },
        () => {},
        language
      );
    }

    return () => {
      speechService.stopWakeWordDetection();
    };
  }, [wakeWordEnabled, isListening, isSpeaking, agentStatus, language, speechService, setIsOpen, speakFeedback, startCommandListening]);

  // ── Form & Voice Submission Pipeline ────────────────────────────────────────
  const handleUserSubmit = async (input: string) => {
    if (!input.trim()) return;

    stopCommandListening();
    setUserInput('');

    const response = await processUserInput(input);

    if (response?.text) {
      await speakFeedback(response.text, language);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setShowLanguageSelector(false);
    const confirmationMessages = {
      en: 'Language changed to English',
      hi: 'भाषा हिंदी में बदल दी गई है',
      mr: 'भाषा मराठीमध्ये बदलली गेली आहे',
    };
    speakFeedback(confirmationMessages[lang], lang);
  };

  // Quick Action Suggestions
  const quickSuggestions = [
    { label: 'Take me to Dashboard', icon: LayoutDashboard },
    { label: 'Open Community', icon: Compass },
    { label: 'Scroll down the page', icon: ArrowDown },
    { label: 'Show Opportunities & Jobs', icon: Briefcase },
    { label: 'Toggle Dyslexia font', icon: Type },
    { label: 'Open Learning Hub', icon: GraduationCap },
  ];

  return (
    <>
      {/* ─── 1. MINIMIZED FLOATING ORB (Always mounted & persistent) ───────── */}
      <div className="fixed bottom-6 right-6 z-50 select-none">
        <AnimatePresence mode="wait">
          {!isOpen && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative group flex items-center gap-2"
            >
              {/* Wake Word Tooltip Pill */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-blue-100 text-[#1A202C] text-xs font-bold shadow-lg shadow-blue-500/10">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[11px] text-[#64748B]">Say <strong className="text-[#2563EB]">"Hey Jarvis"</strong></span>
              </div>

              {/* Main Glowing Floating Trigger Orb */}
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="relative p-4 rounded-full bg-gradient-to-tr from-[#2563EB] via-[#4F46E5] to-[#8B5CF6] text-white shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-blue-300 cursor-pointer flex items-center justify-center"
                aria-label="Open JARVIS AI Assistant"
                title="Open JARVIS AI Assistant"
              >
                {/* State Animated Ring Indicator */}
                {agentStatus === 'thinking' ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                ) : isListening ? (
                  <motion.div
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="relative"
                  >
                    <Mic className="w-6 h-6 text-red-200" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full animate-ping" />
                  </motion.div>
                ) : isSpeaking ? (
                  <Volume2 className="w-6 h-6 text-purple-200 animate-pulse" />
                ) : (
                  <div className="relative">
                    <Sparkles className="w-6 h-6 text-white" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                  </div>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── 2. EXPANDED FLOATING NON-BLOCKING CARD ──────────────────────── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="w-[92vw] sm:w-[400px] md:w-[420px] max-h-[560px] h-[520px] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-blue-100/90 bg-white/95 backdrop-blur-xl select-text"
              role="region"
              aria-label="JARVIS AI Website Assistant"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#2563EB] to-[#8B5CF6] px-4 py-3.5 flex items-center justify-between text-white shadow-xs shrink-0 select-none">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs sm:text-sm tracking-tight">JARVIS Web Agent</span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-400/20 text-emerald-100 border border-emerald-300/30">
                        <Radio size={8} className="text-emerald-300 animate-pulse" /> Live
                      </span>
                    </div>
                    <p className="text-[10px] text-white/80 font-medium truncate max-w-[180px]">
                      Say "Hey Jarvis" or type
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Language Selector */}
                  <button
                    type="button"
                    onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                    className="px-2 py-1 text-[11px] font-black bg-white/15 hover:bg-white/25 rounded-xl border border-white/20 transition-colors cursor-pointer flex items-center gap-1"
                    title="Change Language"
                  >
                    <Globe size={11} />
                    <span>{language.toUpperCase()}</span>
                  </button>

                  {/* Minimize Button */}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
                    aria-label="Minimize JARVIS"
                    title="Minimize"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={() => {
                      stopCommandListening();
                      speechService.stopSpeaking();
                      setIsOpen(false);
                    }}
                    className="p-1.5 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
                    aria-label="Close JARVIS"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Real-Time Action Status Bar */}
              {agentStatus !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`px-4 py-2 text-xs font-bold flex items-center gap-2 border-b shrink-0 ${
                    agentStatus === 'thinking'
                      ? 'bg-blue-50 text-blue-800 border-blue-100'
                      : agentStatus === 'executing'
                      ? 'bg-purple-50 text-purple-800 border-purple-100'
                      : agentStatus === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                      : agentStatus === 'awaiting_confirmation'
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                  aria-live="polite"
                >
                  {agentStatus === 'thinking' && (
                    <>
                      <Loader2 size={13} className="animate-spin text-blue-600 shrink-0" />
                      <span>Understanding intent with Llama 3...</span>
                    </>
                  )}
                  {agentStatus === 'executing' && (
                    <>
                      <Sparkles size={13} className="text-purple-600 shrink-0 animate-bounce" />
                      <span>{currentActionName || 'Executing website action...'}</span>
                    </>
                  )}
                  {agentStatus === 'success' && (
                    <>
                      <Check size={13} className="text-emerald-600 shrink-0" />
                      <span>Action verified & complete ✓</span>
                    </>
                  )}
                  {agentStatus === 'awaiting_confirmation' && (
                    <>
                      <AlertTriangle size={13} className="text-amber-600 shrink-0" />
                      <span>Confirmation required</span>
                    </>
                  )}
                </motion.div>
              )}

              {/* Language Selector Drawer */}
              {showLanguageSelector && (
                <motion.div
                  className="bg-blue-50/90 p-2.5 border-b border-blue-100 flex gap-2 justify-center shrink-0"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {(['en', 'hi', 'mr'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleLanguageChange(lang)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        language === lang
                          ? 'bg-[#2563EB] text-white shadow-xs'
                          : 'bg-white text-[#1A202C] border border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Messages Container */}
              <div className="overflow-y-auto p-4 space-y-3.5 bg-[#F8FAFC] flex-1">
                {conversationState.messages.map((msg) => {
                  const isAssistant = msg.type === 'assistant';
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2.5 ${
                        isAssistant ? 'justify-start' : 'justify-end flex-row-reverse'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                          isAssistant
                            ? 'bg-purple-50 border-purple-200 text-[#8B5CF6]'
                            : 'bg-blue-50 border-blue-200 text-[#2563EB]'
                        }`}
                      >
                        {isAssistant ? <Bot size={14} /> : <User size={14} />}
                      </div>

                      <div className="max-w-[82%] space-y-1">
                        <div
                          className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-[13px] font-medium leading-relaxed whitespace-pre-wrap shadow-2xs ${
                            isAssistant
                              ? 'bg-white border border-blue-100/90 text-[#1A202C] rounded-tl-xs'
                              : 'bg-[#2563EB] text-white rounded-tr-xs'
                          }`}
                        >
                          {msg.text}
                        </div>

                        {isAssistant && (
                          <div className="flex items-center gap-2 pl-1">
                            <button
                              type="button"
                              onClick={() => speakFeedback(msg.text, language)}
                              className="text-[10px] font-bold text-[#64748B] hover:text-[#2563EB] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Volume2 size={11} /> Read
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Pending Confirmation Box */}
                {pendingConfirmation && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm space-y-2.5"
                  >
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                      <span>{pendingConfirmation.prompt}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => confirmPendingAction()}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        Yes, Proceed
                      </button>
                      <button
                        type="button"
                        onClick={() => cancelPendingAction()}
                        className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Quick Action Suggestions */}
                {conversationState.messages.length <= 1 && (
                  <div className="pt-2 space-y-1.5 select-none">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                      Try asking JARVIS:
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {quickSuggestions.map((p) => {
                        const Icon = p.icon;
                        return (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => handleUserSubmit(p.label)}
                            className="p-2 rounded-xl bg-white border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/40 text-left text-xs font-semibold text-[#1A202C] flex items-center gap-2 transition-all cursor-pointer group shadow-2xs"
                          >
                            <Icon
                              size={13}
                              className="text-[#2563EB] group-hover:scale-110 transition-transform shrink-0"
                            />
                            <span className="truncate">{p.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input & Voice Controls Footer */}
              <div className="bg-white border-t border-slate-100 p-3 space-y-2.5 shrink-0 select-none">
                {/* Status Indicator (Speaking / Listening) */}
                {(isListening || isSpeaking) && (
                  <div className="text-center text-xs font-bold">
                    {isSpeaking ? (
                      <div className="flex items-center justify-center gap-2 text-[#8B5CF6]">
                        <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                        <span>JARVIS is speaking…</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-[#2563EB]">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                        <span>Listening for your command…</span>
                      </div>
                    )}
                  </div>
                )}

                {speechError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-2 text-[11px] font-bold text-red-700">
                    {speechError}
                  </div>
                )}

                {/* Text Input Row */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUserSubmit(userInput);
                      }
                    }}
                    placeholder="Ask JARVIS (e.g. 'Take me to dashboard')..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-[#F8FAFC] focus:bg-white text-xs text-[#1A202C] placeholder-[#94A3B8] font-medium outline-none transition-all"
                    disabled={isListening || isSpeaking || agentStatus === 'thinking' || agentStatus === 'executing'}
                  />

                  {!isListening && (
                    <button
                      type="button"
                      onClick={() => handleUserSubmit(userInput)}
                      className="p-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
                      disabled={!userInput.trim() || isSpeaking || agentStatus === 'thinking' || agentStatus === 'executing'}
                      title="Send message"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Voice Action Button */}
                <button
                  type="button"
                  onClick={isListening ? stopCommandListening : startCommandListening}
                  className={`w-full py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                      : 'bg-gradient-to-r from-[#2563EB] to-[#8B5CF6] hover:from-[#1D4ED8] hover:to-[#7C3AED] text-white'
                  }`}
                  disabled={isSpeaking || agentStatus === 'thinking' || agentStatus === 'executing'}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isListening ? 'Stop Listening' : 'Speak to JARVIS'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
