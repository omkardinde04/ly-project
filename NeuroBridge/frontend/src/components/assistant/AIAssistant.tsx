// Jarvis-like AI Assistant Component - Main UI

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Volume2, Send } from 'lucide-react';
import { useAssistant } from '../../contexts/AssistantContext';
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
    spotlightTarget
  } = useAssistant();

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
      // We don't speak immediately. We wait for user activation.
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
        speed: 0.92,
        pitch: 0.9,
        volume: 1.0
      });
    } catch (error) {
      console.warn('Speech synthesis failed:', error);
      setSpeechError('Voice audio is unavailable or blocked. Please tap the voice button to enable speech.');
      addMessage('assistant', 'I tried to speak, but audio is blocked or unavailable. Please allow sound or tap Start Voice.');
    } finally {
      setIsSpeaking(false);
    }
  };

  const speakInitialWelcome = async () => {
    const welcomeText = language === 'en'
      ? "Hi 😊 I'm here to help you. You don't need to read anything... just talk to me."
      : language === 'hi'
        ? "नमस्ते 😊 मैं आपकी मदद करने के लिए यहाँ हूँ। आपको कुछ भी पढ़ने की जरूरत नहीं... बस मुझसे बात करें।"
        : "नमस्कार 😊 मी तुम्हाला मदत करण्यासाठी येथे आहे. तुम्हाला काहीही वाचण्याची गरज नाही... फक्त माझ्याशी बोला.";

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
      mr: 'भाषा मराठीमध्ये बदलली गेली आहे'
    };
    speakMessage(confirmationMessages[lang], lang);
  };

  const isTourMode = !!spotlightTarget;

  const speakMessage = async (text: string, lang: Language) => {
    await speakWithFallback(text, lang);
  };

  const handleActivateJarvis = () => {
    setNeedsActivation(false);
    speakInitialWelcome();
  };

  if (!isAssistantActive) {
    return (
      <button
        onClick={toggleAssistant}
        className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Open assistant"
      >
        <Mic className="w-6 h-6" />
      </button>
    );
  }

  return (
    <AnimatePresence>
      {isAssistantActive && (
        <>
          <motion.div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={needsActivation ? undefined : closeAssistant}
          />

          <SpotlightOverlay active={isTourMode} targetId={spotlightTarget} />

          <motion.div
            className={`fixed z-50 w-[95%] sm:w-[500px] flex flex-col max-h-[85vh] sm:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(147,51,234,0.3)] border border-white/20 bg-white/90 backdrop-blur-xl ${isTourMode ? 'sm:w-96' : ''
              }`}
            initial={{
              opacity: 0,
              scale: 0.9,
              y: isTourMode ? 50 : "-50%",
              x: isTourMode ? 0 : "-50%",
              top: isTourMode ? "auto" : "50%",
              left: isTourMode ? "auto" : "50%",
              bottom: isTourMode ? "1.5rem" : "auto",
              right: isTourMode ? "1.5rem" : "auto",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: isTourMode ? 0 : "-50%",
              x: isTourMode ? 0 : "-50%",
              bottom: isTourMode ? "1.5rem" : "auto",
              right: isTourMode ? "1.5rem" : "auto",
              top: isTourMode ? "auto" : "50%",
              left: isTourMode ? "auto" : "50%",
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 1.2 }}
          >
            {needsActivation ? (
              <div
                className="p-8 flex flex-col items-center justify-center text-center space-y-6 cursor-pointer hover:bg-white/50 transition duration-300 min-h-[300px]"
                onClick={handleActivateJarvis}
              >
                <motion.div
                  className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-[0_0_30px_rgba(147,51,234,0.6)] flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-8 h-8 rounded-full bg-white animate-pulse" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Jarvis is ready</h2>
                  <p className="text-gray-500 mt-2">Tap anywhere to wake up your assistant</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-3 h-3 bg-green-300 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="font-semibold">Jarvis Assistant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                      className="px-2 py-1 text-sm bg-white/20 rounded hover:bg-white/30 transition"
                    >
                      {language.toUpperCase()}
                    </button>
                    <button
                      onClick={closeAssistant}
                      className="p-1 hover:bg-white/20 rounded transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Language Selector */}
                {showLanguageSelector && (
                  <motion.div
                    className="bg-purple-50 p-3 border-b border-purple-200 flex gap-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {(['en', 'hi', 'mr'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => handleLanguageChange(lang)}
                        className={`px-3 py-1 rounded text-sm font-medium transition ${language === lang
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-purple-600 border border-purple-300 hover:bg-purple-50'
                          }`}
                      >
                        {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
                      </button>
                    ))}
                  </motion.div>
                )}

                {/* Messages Container */}
                <div className={`overflow-y-auto p-4 space-y-4 bg-gray-50 flex-1 transition-all duration-300 ${isTourMode ? 'max-h-64' : 'max-h-96 min-h-[12rem]'}`}>
                  {conversationState.messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.type === 'assistant' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg text-sm leading-relaxed whitespace-pre-wrap ${msg.type === 'assistant'
                          ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-gray-800 rounded-bl-none'
                          : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-br-none'
                          }`}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="bg-white border-t border-gray-200 p-4 space-y-3">
                  {/* Visual feedback for listening/speaking */}
                  {(isListening || isSpeaking) && (
                    <motion.div
                      className="text-center text-sm text-purple-600 font-medium"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {isSpeaking ? (
                        <div className="flex items-center justify-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <Volume2 className="w-4 h-4" />
                          </motion.div>
                          Speaking...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <motion.div
                            animate={{ scale: [0.8, 1, 0.8] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                            className="w-2 h-2 bg-red-500 rounded-full"
                          />
                          Listening...
                        </div>
                      )}
                    </motion.div>
                  )}

                  {speechError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {speechError}
                    </div>
                  )}
                  {/* Text input area */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSubmitUserInput(userInput);
                        }
                      }}
                      placeholder="Type or say..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={isListening || isSpeaking}
                    />
                    {!isListening && (
                      <button
                        onClick={() => handleSubmitUserInput(userInput)}
                        className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                        disabled={!userInput.trim() || isSpeaking}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Voice button */}
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`w-full py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${isListening
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                      }`}
                    disabled={isSpeaking}
                  >
                    <Mic className="w-4 h-4" />
                    {isListening ? 'Stop Listening' : 'Start Voice'}
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
