// JARVIS Voice Assistant 3.0 – Real-Time, Fast, Interactive Voice Intelligence
// Features: Robust "Hey Jarvis" Wake-Word Engine, Dynamic VAD Silence Detection,
// Real-Time Streaming Responses, Instant Voice Interruption ("Jarvis, stop"),
// Visual Audio Equalizer, and Clean State Machine Transitions.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Minus,
  X,
  Volume2,
  Send,
  Sparkles,
  Radio,
  Check,
  AlertTriangle,
  Loader2,
  BookOpen,
  FileText,
  Pause,
  Square,
  RotateCcw,
  VolumeX,
  Power,
  LayoutDashboard,
  Type,
} from 'lucide-react';
import { useAssistant } from '../../contexts/AssistantContext';
import { useAuth } from '../../contexts/AuthContext';
import { getSpeechService, type JarvisVoiceState } from '../../services/speechService';
import type { Language } from '../../types/assistant';
import { MarkdownMessage } from './MarkdownMessage';

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
    wakeWordEnabled,
    setWakeWordEnabled,
    voiceState,
    liveTranscript,
    setLiveTranscript,
    interrupt,
    resetConversation,
    isReadingPage,
    pauseReading,
    stopReading,
  } = useAssistant();

  const { user } = useAuth();
  const [userInput, setUserInput] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechService = useRef(getSpeechService()).current;

  // Auto-scroll to latest message inside Jarvis window
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationState.messages, agentStatus, isOpen, voiceState]);

  // ── 1. Stable Form & Voice Submission Pipeline ─────────────────────────────
  const handleUserSubmit = useCallback(async (input: string) => {
    const clean = input.trim();
    if (!clean) return;

    setUserInput('');
    setLiveTranscript('');
    setSpeechError(null);

    await processUserInput(clean);
  }, [processUserInput, setLiveTranscript]);

  // ── 2. Unified Wake-Word & Continuous Audio Controller ─────────────────────
  const isHandlingWakeRef = useRef(false);

  useEffect(() => {
    if (!wakeWordEnabled) {
      speechService.stopWakeWordDetection();
      return;
    }

    // Start wake word background monitoring
    speechService.startWakeWordDetection(
      (trailingCommand?: string) => {
        if (isHandlingWakeRef.current) return;
        isHandlingWakeRef.current = true;

        // Wake word matched! Open window immediately
        setIsOpen(true);
        setSpeechError(null);

        // If user spoke the command right in the wake phrase: e.g. "Hey Jarvis read this"
        if (trailingCommand && trailingCommand.trim().length > 1) {
          handleUserSubmit(trailingCommand.trim());
          setTimeout(() => {
            isHandlingWakeRef.current = false;
          }, 800);
        } else {
          // Waiting for user's speech in LISTENING mode
          setTimeout(() => {
            isHandlingWakeRef.current = false;
          }, 500);
        }
      },
      (error) => {
        console.warn('[Jarvis] Wake word recognition error:', error);
        if (error.includes('denied') || error.includes('not-allowed')) {
          setSpeechError('Microphone permission is required for voice activation.');
        }
      },
      language
    );

    return () => {
      speechService.stopWakeWordDetection();
    };
  }, [wakeWordEnabled, language, speechService, setIsOpen, handleUserSubmit]);

  // ── 3. Manual Mic Click Toggle ─────────────────────────────────────────────
  const handleMicToggle = useCallback(() => {
    setSpeechError(null);

    if (voiceState === 'LISTENING') {
      speechService.stopCommandListening();
    } else if (voiceState === 'SPEAKING' || voiceState === 'PROCESSING') {
      interrupt();
    } else {
      speechService.startCommandListening(
        (transcript, isFinal) => {
          setUserInput(transcript);
          setLiveTranscript(transcript);
          if (isFinal && transcript.trim()) {
            handleUserSubmit(transcript.trim());
          }
        },
        (error) => {
          console.warn('[Jarvis] Speech recognition error:', error);
          if (error.includes('denied') || error.includes('not-allowed')) {
            setSpeechError('Microphone access denied. You can type commands below.');
          }
        },
        language
      );
    }
  }, [voiceState, speechService, language, setLiveTranscript, handleUserSubmit, interrupt]);

  // ── 4. Live Assistant Status Description ────────────────────────────────────
  const getLiveStatus = () => {
    if (speechError) {
      return { text: speechError, color: 'text-red-500', bg: 'bg-red-50 border-red-200' };
    }
    switch (voiceState) {
      case 'ACTIVATED':
        return { text: 'Jarvis activated! Listening...', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
      case 'LISTENING':
        return { text: 'Listening to you...', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
      case 'PROCESSING':
        return { text: 'Understanding & generating response...', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' };
      case 'SPEAKING':
        return { text: 'Speaking response...', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' };
      case 'INTERRUPTED':
        return { text: 'Interrupted.', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
      case 'WAKE_WORD_LISTENING':
        return { text: 'Listening for "Hey Jarvis"...', color: 'text-emerald-600', bg: 'bg-emerald-50/60 border-emerald-100' };
      default:
        return { text: 'Ready for your next command', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200' };
    }
  };

  const statusInfo = getLiveStatus();

  // Quick Action & AI Chat Suggestions
  const quickSuggestions = [
    { label: 'Explain dyslexia simply', icon: Sparkles },
    { label: 'How can I study faster?', icon: BookOpen },
    { label: 'Summarize this page', icon: FileText },
    { label: 'Read this page out loud', icon: Volume2 },
    { label: 'Take me to Dashboard', icon: LayoutDashboard },
    { label: 'Toggle Dyslexia font', icon: Type },
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
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold shadow-lg shadow-blue-500/10">
                <span className={`w-2 h-2 rounded-full ${wakeWordEnabled ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                <span className="text-[11px] text-slate-600 dark:text-slate-300">
                  {wakeWordEnabled ? (
                    <>Say <strong className="text-[#2563EB] dark:text-blue-400 font-extrabold">"Hey Jarvis"</strong></>
                  ) : (
                    'Click to open Jarvis'
                  )}
                </span>
              </div>

              {/* Main Glowing Floating Trigger Orb */}
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className={`relative p-4 rounded-full text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-blue-300 cursor-pointer flex items-center justify-center ${
                  voiceState === 'LISTENING'
                    ? 'bg-red-500 shadow-red-500/30 ring-4 ring-red-300 animate-pulse'
                    : voiceState === 'PROCESSING'
                    ? 'bg-indigo-600 shadow-indigo-500/30'
                    : voiceState === 'SPEAKING'
                    ? 'bg-purple-600 shadow-purple-500/30'
                    : 'bg-gradient-to-tr from-[#2563EB] via-[#4F46E5] to-[#8B5CF6] shadow-blue-600/30'
                }`}
                aria-label="Open JARVIS AI Assistant"
                title="Open JARVIS AI Assistant"
              >
                {/* State Animated Ring Indicator */}
                {voiceState === 'PROCESSING' || agentStatus === 'thinking' ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                ) : voiceState === 'LISTENING' ? (
                  <div className="relative">
                    <Mic className="w-6 h-6 text-white" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                  </div>
                ) : voiceState === 'SPEAKING' ? (
                  <Volume2 className="w-6 h-6 text-white animate-pulse" />
                ) : (
                  <div className="relative">
                    <Sparkles className="w-6 h-6 text-white" />
                    {wakeWordEnabled && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white" />
                    )}
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
              className="assistant-window w-[92vw] sm:w-[400px] md:w-[430px] max-h-[580px] h-[540px] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-blue-100/90 bg-white/95 backdrop-blur-xl select-text"
              role="region"
              aria-label="JARVIS AI Website Assistant"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#2563EB] to-[#8B5CF6] px-4 py-3 flex items-center justify-between text-white shadow-xs shrink-0 select-none">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs sm:text-sm tracking-tight">JARVIS</span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-400/20 text-emerald-100 border border-emerald-300/30">
                        <Radio size={8} className="text-emerald-300 animate-pulse" /> Voice AI
                      </span>
                    </div>
                    <p className="text-[10px] text-white/80 font-medium truncate max-w-[210px]">
                      Ask anything or say "Hey Jarvis"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Wake Word Enable Toggle */}
                  <button
                    type="button"
                    onClick={() => setWakeWordEnabled(!wakeWordEnabled)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer border ${
                      wakeWordEnabled
                        ? 'bg-emerald-500/30 border-emerald-300 text-white'
                        : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
                    }`}
                    title={wakeWordEnabled ? 'Wake word active (Say "Hey Jarvis")' : 'Wake word off (Click to enable)'}
                  >
                    <Power size={10} />
                    <span>{wakeWordEnabled ? 'Wake On' : 'Wake Off'}</span>
                  </button>

                  {/* Reset Conversation */}
                  <button
                    type="button"
                    onClick={resetConversation}
                    className="p-1.5 hover:bg-white/20 rounded-xl transition-colors cursor-pointer text-white/80 hover:text-white"
                    title="Reset Conversation"
                  >
                    <RotateCcw size={14} />
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
                      interrupt();
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

              {/* Live Reading Active Banner */}
              {isReadingPage && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1.5 text-xs font-bold flex items-center justify-between shrink-0 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Reading page aloud with spotlight...</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => pauseReading()}
                      className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer text-white"
                      title="Pause Reading"
                    >
                      <Pause size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => stopReading()}
                      className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer text-red-200 hover:text-white"
                      title="Stop Reading"
                    >
                      <Square size={12} />
                    </button>
                  </div>
                </div>
              )}

              {/* Dynamic Live Status Bar */}
              <div className={`px-4 py-1.5 text-[11px] font-bold flex items-center justify-between border-b shrink-0 ${statusInfo.bg}`}>
                <div className={`flex items-center gap-2 ${statusInfo.color}`}>
                  {voiceState === 'LISTENING' ? (
                    <div className="flex items-center gap-0.5 h-3">
                      <span className="w-1 h-3 bg-red-500 rounded-full animate-bounce" />
                      <span className="w-1 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:0.15s]" />
                      <span className="w-1 h-3.5 bg-red-500 rounded-full animate-bounce [animation-delay:0.3s]" />
                    </div>
                  ) : voiceState === 'PROCESSING' || agentStatus === 'thinking' ? (
                    <Loader2 size={12} className="animate-spin text-indigo-600" />
                  ) : voiceState === 'SPEAKING' ? (
                    <div className="flex items-center gap-0.5 h-3">
                      <span className="w-1 h-2 bg-purple-500 rounded-full animate-bounce" />
                      <span className="w-1 h-3.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.35s]" />
                    </div>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                  <span>{statusInfo.text}</span>
                </div>

                {/* Instant Stop Button when speaking or processing */}
                {(voiceState === 'SPEAKING' || voiceState === 'PROCESSING') && (
                  <button
                    type="button"
                    onClick={interrupt}
                    className="px-2 py-0.5 rounded-md bg-red-500 hover:bg-red-600 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                    title="Stop Jarvis immediately"
                  >
                    <Square size={9} fill="currentColor" />
                    <span>Stop</span>
                  </button>
                )}
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scroll-smooth text-xs">
                {conversationState.messages.map((message) => {
                  const isAssistant = message.type === 'assistant';

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-2.5 items-start ${isAssistant ? 'justify-start' : 'justify-end'}`}
                    >
                      {isAssistant && (
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#2563EB] to-[#8B5CF6] text-white flex items-center justify-center shrink-0 shadow-xs text-[10px] font-bold">
                          J
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-2xs ${
                          isAssistant
                            ? 'bg-[#F8FAFC] text-[#1E293B] border border-slate-200/80 rounded-tl-xs'
                            : 'bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white rounded-tr-xs font-medium'
                        }`}
                      >
                        {isAssistant ? (
                          <MarkdownMessage content={message.text || '...'} />
                        ) : (
                          <p className="whitespace-pre-wrap">{message.text}</p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Suggestions Pills if only greeting exists */}
                {conversationState.messages.length <= 1 && (
                  <div className="pt-2 space-y-2">
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

              {/* Live Speech Interim Transcript Floating Box */}
              {voiceState === 'LISTENING' && liveTranscript && (
                <div className="mx-3 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center gap-2 shadow-xs shrink-0 animate-in fade-in">
                  <Mic size={12} className="text-blue-600 animate-pulse shrink-0" />
                  <span className="truncate italic">"{liveTranscript}"</span>
                </div>
              )}

              {/* Input & Voice Controls Footer */}
              <div className="bg-white border-t border-slate-100 p-3 space-y-2 shrink-0 select-none">
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
                    placeholder="Ask anything or give a command (like ChatGPT)..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-[#F8FAFC] focus:bg-white text-xs text-[#1A202C] placeholder-[#94A3B8] font-medium outline-none transition-all"
                  />

                  <button
                    type="button"
                    onClick={() => handleUserSubmit(userInput)}
                    className="p-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl transition-colors disabled:opacity-40 cursor-pointer shadow-xs shrink-0"
                    disabled={!userInput.trim()}
                    title="Send message"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Voice Interaction Button */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleMicToggle}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                      voiceState === 'LISTENING'
                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                        : voiceState === 'SPEAKING'
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : voiceState === 'PROCESSING'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gradient-to-r from-[#2563EB] to-[#8B5CF6] hover:from-[#1D4ED8] hover:to-[#7C3AED] text-white'
                    }`}
                  >
                    {voiceState === 'LISTENING' ? (
                      <>
                        <Square className="w-3.5 h-3.5" fill="currentColor" />
                        <span>Finish & Send Command</span>
                      </>
                    ) : voiceState === 'SPEAKING' ? (
                      <>
                        <Square className="w-3.5 h-3.5" fill="currentColor" />
                        <span>Stop Speaking</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5" />
                        <span>{wakeWordEnabled ? 'Speak or Say "Hey Jarvis"' : 'Speak to Jarvis'}</span>
                      </>
                    )}
                  </button>

                  {/* Immediate Stop Button */}
                  {(voiceState === 'SPEAKING' || voiceState === 'PROCESSING') && (
                    <button
                      type="button"
                      onClick={interrupt}
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      title="Interrupt Jarvis immediately"
                    >
                      <Square size={12} fill="currentColor" />
                      <span>Stop</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
