// JARVIS AI Assistant Component - Modern NeuroBridge Design System

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  X,
  Volume2,
  Send,
  Sparkles,
  Bot,
  User,
  Globe,
  Radio,
  RotateCcw,
  Lightbulb,
  FileText,
  Briefcase,
  HelpCircle,
  Compass,
  Square,
} from 'lucide-react';
import { useAssistant } from '../../contexts/AssistantContext';
import { useAuth } from '../../contexts/AuthContext';
import { getSpeechService } from '../../services/speechService';
import type { Language } from '../../types/assistant';
import { SpotlightOverlay } from './SpotlightOverlay';

interface AIAssistantProps {
  autoStart?: boolean;
  initialFlow?: string;
}

export function AIAssistant({ autoStart = true }: AIAssistantProps) {
  const {
    conversationState,
    isAssistantActive,
    isAutoStarted,
    startAssistant,
    toggleAssistant,
    processUserInput,
    language,
    setLanguage,
    addMessage,
    spotlightTarget,
  } = useAssistant();

  const { user } = useAuth();

  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [silenceTimer, setSilenceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [needsActivation, setNeedsActivation] = useState(autoStart);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechServiceRef = useRef(getSpeechService());

  // Auto-start on component mount
  useEffect(() => {
    if (autoStart && !isAssistantActive && !isAutoStarted) {
      startAssistant();
    }
  }, [autoStart, isAssistantActive, isAutoStarted, startAssistant]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationState.messages]);

  const speakWithFallback = async (text: string, lang: Language) => {
    setSpeechError(null);
    setIsSpeaking(true);

    try {
      await speechServiceRef.current.speak(text, {
        language: lang,
      });
    } catch (error) {
      console.warn('Speech synthesis failed:', error);
      setSpeechError(
        'Voice audio is unavailable or blocked. Please tap the voice button to enable speech.'
      );
      addMessage(
        'assistant',
        'I tried to speak, but audio is blocked or unavailable. Please allow sound or tap Start Voice.'
      );
    } finally {
      setIsSpeaking(false);
    }
  };

  const speakInitialWelcome = async () => {
    const welcomeText =
      language === 'en'
        ? `Hi ${user?.name ? user.name.split(' ')[0] : 'there'} 😊 I'm JARVIS, your personal study assistant. You don't need to read anything... just talk to me.`
        : language === 'hi'
        ? `नमस्ते ${user?.name ? user.name.split(' ')[0] : ''} 😊 मैं जार्विस हूँ, आपका निजी अध्ययन सहायक। आपको कुछ भी पढ़ने की जरूरत नहीं... बस मुझसे बात करें।`
        : `नमस्कार ${user?.name ? user.name.split(' ')[0] : ''} 😊 मी जार्व्हिस आहे, तुमचा वैयक्तिक अभ्यास सहाय्यक. तुम्हाला काहीही वाचण्याची गरज नाही... फक्त माझ्याशी बोला.`;

    addMessage('assistant', welcomeText);
    await speakWithFallback(welcomeText, language);
    setTimeout(() => startListening(), 500);
  };

  const startListening = () => {
    setIsListening(true);
    speechServiceRef.current.startListening(
      (transcript, isFinal) => {
        setUserInput(transcript);
        if (isFinal) {
          handleSubmitUserInput(transcript);
        }
      },
      (error) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);
      },
      language
    );

    if (silenceTimer) clearTimeout(silenceTimer);
    const timer = setTimeout(() => {
      speechServiceRef.current.stopListening();
      setIsListening(false);
    }, 5000);
    setSilenceTimer(timer);
  };

  const stopListening = () => {
    speechServiceRef.current.stopListening();
    setIsListening(false);
    if (silenceTimer) clearTimeout(silenceTimer);
  };

  const closeAssistant = () => {
    setShowLanguageSelector(false);
    stopListening();
    speechServiceRef.current.stopSpeaking();
    if (isAssistantActive) {
      toggleAssistant();
    }
  };

  const handleSubmitUserInput = async (input: string) => {
    if (!input.trim()) return;

    stopListening();
    setUserInput('');

    const response = await processUserInput(input);

    if (response) {
      await speakWithFallback(response.text, language);

      if (response.nextAction === 'wait') {
        setTimeout(() => startListening(), 500);
      }
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
    speakMessage(confirmationMessages[lang], lang);
  };

  const speakMessage = async (text: string, lang: Language) => {
    await speakWithFallback(text, lang);
  };

  const handleActivateJarvis = () => {
    setNeedsActivation(false);
    speakInitialWelcome();
  };

  const isTourMode = !!spotlightTarget;

  // Suggested Prompts
  const suggestedPrompts = [
    { label: 'Give me a tour of NeuroBridge', icon: Compass },
    { label: 'Help me understand this topic', icon: Lightbulb },
    { label: 'Explain this in a simpler way', icon: HelpCircle },
    { label: 'How can I build my resume?', icon: FileText },
  ];

  if (!isAssistantActive) {
    return (
      <button
        onClick={toggleAssistant}
        className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-[#2563EB] to-[#8B5CF6] text-white rounded-full shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-blue-300 cursor-pointer flex items-center justify-center group"
        aria-label="Open JARVIS AI Assistant"
      >
        <div className="relative">
          <Mic className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
        </div>
      </button>
    );
  }

  return (
    <AnimatePresence>
      {isAssistantActive && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={needsActivation ? undefined : closeAssistant}
          />

          <SpotlightOverlay active={isTourMode} targetId={spotlightTarget} />

          {/* Main JARVIS Modal Window */}
          <motion.div
            className={`fixed z-50 w-[95%] sm:w-[540px] flex flex-col max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-blue-100/90 bg-white/95 backdrop-blur-xl ${
              isTourMode ? 'sm:w-96' : ''
            }`}
            initial={{
              opacity: 0,
              scale: 0.9,
              y: isTourMode ? 50 : '-50%',
              x: isTourMode ? 0 : '-50%',
              top: isTourMode ? 'auto' : '50%',
              left: isTourMode ? 'auto' : '50%',
              bottom: isTourMode ? '1.5rem' : 'auto',
              right: isTourMode ? '1.5rem' : 'auto',
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: isTourMode ? 0 : '-50%',
              x: isTourMode ? 0 : '-50%',
              bottom: isTourMode ? '1.5rem' : 'auto',
              right: isTourMode ? '1.5rem' : 'auto',
              top: isTourMode ? 'auto' : '50%',
              left: isTourMode ? 'auto' : '50%',
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 1.2 }}
          >
            {needsActivation ? (
              /* ─── ACTIVATION STATE ────────────────────────────── */
              <div
                className="p-8 sm:p-10 flex flex-col items-center justify-center text-center space-y-6 cursor-pointer hover:bg-slate-50/60 transition duration-300 min-h-[340px]"
                onClick={handleActivateJarvis}
              >
                <div className="relative">
                  <motion.div
                    className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#2563EB] to-[#8B5CF6] p-0.5 shadow-xl shadow-blue-500/25 flex items-center justify-center"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <div className="w-full h-full rounded-[22px] bg-white flex items-center justify-center text-[#2563EB]">
                      <Sparkles size={32} className="text-[#8B5CF6] animate-pulse" />
                    </div>
                  </motion.div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-xs" />
                </div>

                <div className="space-y-1.5 max-w-sm">
                  <h2 className="text-2xl font-black text-[#1A202C] tracking-tight">
                    JARVIS AI is Ready
                  </h2>
                  <p className="text-xs sm:text-sm text-[#64748B] font-medium leading-relaxed">
                    Tap anywhere to wake up your personalized neuro-inclusive learning companion.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-50 text-[#2563EB] border border-blue-100 text-xs font-bold shadow-xs">
                  <Mic size={14} />
                  <span>Tap to Speak or Listen</span>
                </div>
              </div>
            ) : (
              /* ─── ACTIVE CONVERSATION STATE ──────────────────── */
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-[#2563EB] to-[#8B5CF6] p-4 sm:p-5 flex items-center justify-between text-white shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
                      <Sparkles size={18} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm tracking-tight">JARVIS AI</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-emerald-400/20 text-emerald-100 border border-emerald-300/30">
                          <Radio size={9} className="text-emerald-300 animate-pulse" /> Ready
                        </span>
                      </div>
                      <p className="text-[11px] text-white/80 font-medium truncate max-w-[200px]">
                        NeuroBridge Companion
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                      className="px-2.5 py-1 text-xs font-black bg-white/15 hover:bg-white/25 rounded-xl border border-white/20 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Globe size={12} />
                      <span>{language.toUpperCase()}</span>
                    </button>

                    <button
                      type="button"
                      onClick={closeAssistant}
                      className="p-1.5 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
                      aria-label="Close JARVIS"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Language Selector Drawer */}
                {showLanguageSelector && (
                  <motion.div
                    className="bg-blue-50/90 p-3 border-b border-blue-100 flex gap-2 justify-center"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {(['en', 'hi', 'mr'] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => handleLanguageChange(lang)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                <div
                  className={`overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#F8FAFC] flex-1 transition-all duration-300 ${
                    isTourMode ? 'max-h-64' : 'max-h-[380px] min-h-[14rem]'
                  }`}
                >
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

                        <div className="max-w-[80%] space-y-1">
                          <div
                            className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap shadow-2xs ${
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
                                onClick={() => speakWithFallback(msg.text, language)}
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

                  {/* Suggested Prompts on start */}
                  {conversationState.messages.length <= 1 && (
                    <div className="pt-2 space-y-2">
                      <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                        Try asking JARVIS:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {suggestedPrompts.map((p) => {
                          const Icon = p.icon;
                          return (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() => handleSubmitUserInput(p.label)}
                              className="p-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/40 text-left text-xs font-semibold text-[#1A202C] flex items-center gap-2 transition-all cursor-pointer group shadow-2xs"
                            >
                              <Icon
                                size={14}
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
                <div className="bg-white border-t border-slate-100 p-4 space-y-3">
                  {/* Status Indicator (Speaking / Listening) */}
                  {(isListening || isSpeaking) && (
                    <motion.div
                      className="text-center text-xs font-bold"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {isSpeaking ? (
                        <div className="flex items-center justify-center gap-2 text-[#8B5CF6]">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          >
                            <Volume2 className="w-4 h-4" />
                          </motion.div>
                          <span>JARVIS is speaking…</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-[#2563EB]">
                          <motion.div
                            animate={{ scale: [0.8, 1.2, 0.8] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="w-2.5 h-2.5 bg-red-500 rounded-full"
                          />
                          <span>Listening to your voice…</span>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {speechError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-bold text-red-700">
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
                          handleSubmitUserInput(userInput);
                        }
                      }}
                      placeholder="Ask JARVIS anything..."
                      className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-[#F8FAFC] focus:bg-white text-xs sm:text-sm text-[#1A202C] placeholder-[#94A3B8] font-medium outline-none transition-all"
                      disabled={isListening || isSpeaking}
                    />

                    {!isListening && (
                      <button
                        type="button"
                        onClick={() => handleSubmitUserInput(userInput)}
                        className="p-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-2xl transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
                        disabled={!userInput.trim() || isSpeaking}
                        title="Send message"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Large Voice Action Button */}
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`w-full py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                      isListening
                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                        : 'bg-gradient-to-r from-[#2563EB] to-[#8B5CF6] hover:from-[#1D4ED8] hover:to-[#7C3AED] text-white'
                    }`}
                    disabled={isSpeaking}
                  >
                    <Mic className="w-4 h-4" />
                    <span>{isListening ? 'Stop Listening' : 'Start Voice Conversation'}</span>
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
