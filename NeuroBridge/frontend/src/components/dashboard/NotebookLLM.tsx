import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Lightbulb,
  PenLine,
  HelpCircle,
  Video,
  Paperclip,
  Upload,
  X,
  RotateCcw,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Bot,
  User,
  AlertCircle,
  Play,
  Pause,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000';

type LLMAction = 'summarize' | 'explain' | 'simplify' | 'quiz' | 'video-script';

export interface VideoScene {
  text: string;
  keyword: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  action?: LLMAction;
  content: string;
  isLoading?: boolean;
}

interface ActionConfigItem {
  label: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
  description: string;
}

const ACTION_CONFIG: Record<LLMAction, ActionConfigItem> = {
  summarize: {
    label: 'Summarize',
    icon: FileText,
    colorClass: 'text-[#2563EB]',
    bgClass: 'bg-blue-50/80',
    borderClass: 'border-blue-100',
    badgeClass: 'bg-blue-50 text-[#2563EB] border-blue-200',
    description: 'Key points in bullets',
  },
  explain: {
    label: 'Explain',
    icon: Lightbulb,
    colorClass: 'text-[#8B5CF6]',
    bgClass: 'bg-purple-50/80',
    borderClass: 'border-purple-100',
    badgeClass: 'bg-purple-50 text-[#8B5CF6] border-purple-200',
    description: 'Simple explanation',
  },
  simplify: {
    label: 'Simplify',
    icon: PenLine,
    colorClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50/80',
    borderClass: 'border-emerald-100',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Easy words only',
  },
  quiz: {
    label: 'Quiz Me',
    icon: HelpCircle,
    colorClass: 'text-[#E86F51]',
    bgClass: 'bg-orange-50/80',
    borderClass: 'border-orange-100',
    badgeClass: 'bg-orange-50 text-[#E86F51] border-orange-200',
    description: '3 quick questions',
  },
  'video-script': {
    label: 'Make Video',
    icon: Video,
    colorClass: 'text-pink-700',
    bgClass: 'bg-pink-50/80',
    borderClass: 'border-pink-100',
    badgeClass: 'bg-pink-50 text-pink-700 border-pink-200',
    description: 'Watch an AI Video',
  },
};

function genId() {
  return Math.random().toString(36).slice(2);
}

export function NotebookLLM() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingAction, setLoadingAction] = useState<LLMAction | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [playingVideo, setPlayingVideo] = useState<VideoScene[] | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setFileContent('__FILE_UPLOAD__');
    setInput('');
  };

  const callLLM = async (action: LLMAction) => {
    const hasFile = selectedFile && fileContent === '__FILE_UPLOAD__';
    const hasText = input.trim().length > 0;
    if (!hasFile && !hasText) return;

    const userMsgId = genId();
    const aiMsgId = genId();
    const previewLabel = hasFile
      ? `Uploaded File: ${selectedFile!.name}`
      : input.slice(0, 200) + (input.length > 200 ? '…' : '');

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', content: previewLabel, action },
      { id: aiMsgId, role: 'ai', action, content: '', isLoading: true },
    ]);
    setLoadingAction(action);

    try {
      let res: globalThis.Response;

      if (hasFile) {
        const formData = new FormData();
        formData.append('file', selectedFile!);
        res = await fetch(`${BACKEND_URL}/api/llm/${action}`, {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch(`${BACKEND_URL}/api/llm/${action}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: input }),
        });
      }

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({ error: `HTTP ${res.status}` }))) as {
          error?: string;
        };
        throw new Error(errData.error ?? `Server error ${res.status}`);
      }

      const data = (await res.json()) as { result?: string; error?: string };
      if (data.error) throw new Error(data.error);

      if (action === 'video-script') {
        try {
          let rawJson = data.result ?? '[]';
          const match = rawJson.match(/\[[\s\S]*\]/);
          if (match) {
            rawJson = match[0];
          }
          const scenes = JSON.parse(rawJson) as VideoScene[];
          if (!Array.isArray(scenes) || scenes.length === 0) throw new Error('Empty script');
          setPlayingVideo(scenes);
          setMessages((prev) => prev.filter((m) => m.id !== aiMsgId && m.id !== userMsgId));
        } catch {
          throw new Error('Failed to generate a valid video script. Please try again.');
        }
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId ? { ...m, content: data.result ?? '', isLoading: false } : m
          )
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId ? { ...m, content: `❌ ${msg}`, isLoading: false } : m
        )
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRetry = (msgId: string, action: LLMAction | undefined) => {
    if (!action) return;
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    callLLM(action);
  };

  const clearAll = () => {
    setMessages([]);
    setInput('');
    setFileContent('');
    setSelectedFile(null);
  };

  const activeText = fileContent || input.trim();

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-7 pb-12 animate-in fade-in duration-200">
      {/* ─── 1. COMPACT AI NOTEBOOK HEADER ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#8B5CF6] p-2.5 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <BookOpen size={24} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-2xl font-black text-[#1A202C] tracking-tight">AI Notebook</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#2563EB] border border-blue-100">
                <Sparkles size={11} /> AI Ready
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] font-medium truncate">
              Powered by Gemini AI · Dyslexia-friendly study companion
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="self-start sm:self-center px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200/80 transition-colors cursor-pointer shrink-0"
          >
            Clear Conversation ✕
          </button>
        )}
      </motion.div>

      {/* ─── 2. MAIN AI WORKSPACE CARD ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-3xl border border-blue-100/80 shadow-xs p-6 sm:p-8 space-y-6"
      >
        {/* Supportive subtitle prompt */}
        <div className="text-xs sm:text-sm text-[#64748B] font-medium leading-relaxed pb-1 border-b border-slate-100">
          Upload study material or paste text, then choose how you would like AI to help.
        </div>

        {/* A. Upload Section */}
        <div>
          <label className="text-xs font-bold text-[#1A202C] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Paperclip size={14} className="text-[#2563EB]" />
            <span>Upload a document (optional)</span>
          </label>

          <div className="border-2 border-dashed border-blue-200/80 hover:border-[#2563EB] bg-blue-50/40 hover:bg-blue-50/70 rounded-2xl p-5 text-center transition-all cursor-pointer">
            <input
              type="file"
              accept=".txt,.pdf,.doc,.docx,audio/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
              id="notebook-file"
            />
            {selectedFile ? (
              <div className="flex items-center justify-between bg-white border border-blue-200 rounded-xl p-3 shadow-xs">
                <div className="flex items-center gap-2.5 text-xs font-bold text-[#1A202C] truncate">
                  <FileText size={16} className="text-[#2563EB] shrink-0" />
                  <span className="truncate">{selectedFile.name}</span>
                  <span className="text-[11px] text-[#94A3B8] font-normal shrink-0">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setFileContent('');
                    setInput('');
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  aria-label="Remove uploaded file"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <label
                htmlFor="notebook-file"
                className="cursor-pointer flex flex-col items-center gap-1.5 py-1"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-blue-100 flex items-center justify-center text-[#2563EB] shadow-xs">
                  <Upload size={18} />
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#1A202C]">
                  Click to upload study material
                </span>
                <span className="text-[11px] text-[#64748B] font-medium">
                  Supported formats: TXT, PDF, DOC, DOCX, Audio, Video
                </span>
              </label>
            )}
          </div>
        </div>

        {/* B. Text Input Section */}
        <div>
          <label className="text-xs font-bold text-[#1A202C] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <PenLine size={14} className="text-[#2563EB]" />
            <span>Or type / paste your text here</span>
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"Paste your notes, a paragraph, or ask a question…\n\nExample: 'The child has difficulty reading letters'"}
            className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-[#F8FAFC] focus:bg-white text-[#1A202C] placeholder-[#94A3B8] font-medium min-h-[130px] resize-y text-sm leading-relaxed transition-all outline-none"
            style={{ lineHeight: '1.7' }}
          />
        </div>

        {/* C. AI Action Grid Section */}
        <div>
          <label className="text-xs font-bold text-[#1A202C] uppercase tracking-wider mb-3 block">
            Choose how AI should help
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(Object.entries(ACTION_CONFIG) as [LLMAction, ActionConfigItem][]).map(
              ([action, cfg]) => {
                const Icon = cfg.icon;
                const isLoading = loadingAction === action;
                const isDisabled = !activeText || loadingAction !== null;

                return (
                  <button
                    key={action}
                    type="button"
                    onClick={() => callLLM(action)}
                    disabled={isDisabled}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 group ${
                      isDisabled
                        ? 'bg-slate-50 border-slate-200/80 opacity-50 cursor-not-allowed'
                        : 'bg-white border-slate-200/90 hover:border-[#2563EB] hover:bg-blue-50/30 hover:shadow-xs cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${cfg.bgClass} ${cfg.colorClass} ${cfg.borderClass}`}
                      >
                        {isLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                        ) : (
                          <Icon size={18} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-extrabold text-[#1A202C] group-hover:text-[#2563EB] transition-colors truncate">
                          {cfg.label}
                        </div>
                        <div className="text-[11px] font-medium text-[#64748B] truncate mt-0.5">
                          {cfg.description}
                        </div>
                      </div>
                    </div>

                    <ArrowRight
                      size={14}
                      className="text-slate-300 group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all shrink-0 mt-2"
                    />
                  </button>
                );
              }
            )}
          </div>
        </div>
      </motion.div>

      {/* ─── 3. AI RESPONSE / OUTPUT STATE ─────────────────────────── */}
      <AnimatePresence>
        {messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="bg-white rounded-3xl border border-blue-100/80 shadow-xs p-6 sm:p-8 space-y-4 max-h-[650px] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-[#2563EB]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A202C]">
                  AI Response & Insights
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#94A3B8]">
                {messages.filter((m) => m.role === 'ai' && !m.isLoading).length} Completed
              </span>
            </div>

            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                onRetry={() => handleRetry(msg.id, msg.action)}
              />
            ))}
            <div ref={bottomRef} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 4. HOW TO USE AI NOTEBOOK GUIDANCE CARD ──────────────── */}
      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#1A202C]">
                How to use AI Notebook
              </h2>
              <p className="text-xs text-[#64748B] font-medium">
                Choose the support that best matches your study task.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
            {(Object.entries(ACTION_CONFIG) as [LLMAction, ActionConfigItem][]).map(
              ([action, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <div
                    key={action}
                    className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${cfg.bgClass} ${cfg.colorClass} ${cfg.borderClass}`}
                      >
                        <Icon size={13} />
                      </div>
                      <span className="text-xs font-bold text-[#1A202C]">{cfg.label}</span>
                    </div>
                    <p className="text-[11px] text-[#64748B] font-medium leading-relaxed">
                      {cfg.description}
                    </p>
                  </div>
                );
              }
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-[#64748B] font-medium text-center">
            💡 Type or paste text above, then click any action button to get instant AI assistance.
          </div>
        </motion.div>
      )}

      {/* ─── DYNAMIC VIDEO PLAYER MODAL ────────────────────────────── */}
      <AnimatePresence>
        {playingVideo && (
          <DynamicVideoPlayer scenes={playingVideo} onClose={() => setPlayingVideo(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Dynamic Video Player Component ───────────────────────────────────────────
function DynamicVideoPlayer({
  scenes,
  onClose,
}: {
  scenes: VideoScene[];
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [speechSynthesis] = useState(() => window.speechSynthesis);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  const playScene = (index: number) => {
    if (index >= scenes.length) {
      setTimeout(onClose, 2000);
      return;
    }
    setCurrentIndex(index);
    setIsPaused(false);

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(scenes[index].text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    currentUtterance.current = utterance;

    utterance.onend = () => {
      setTimeout(() => {
        if (!isPaused) playScene(index + 1);
      }, 500);
    };

    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    scenes.forEach((scene) => {
      const img = new Image();
      img.src = `https://loremflickr.com/1280/720/${encodeURIComponent(
        scene.keyword || 'abstract'
      )}`;
    });

    playScene(0);
    return () => {
      speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePause = () => {
    if (isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
    } else {
      speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const restartVideo = () => {
    speechSynthesis.cancel();
    playScene(0);
  };

  const currentScene = scenes[currentIndex];
  const imageUrl = currentScene
    ? `https://loremflickr.com/1280/720/${encodeURIComponent(currentScene.keyword || 'abstract')}`
    : '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-8"
    >
      <button
        onClick={() => {
          speechSynthesis.cancel();
          onClose();
        }}
        className="absolute top-6 right-6 z-50 text-white hover:text-red-400 bg-black/40 hover:bg-black/60 rounded-full w-10 h-10 flex items-center justify-center text-lg transition-all cursor-pointer"
        aria-label="Close video player"
      >
        <X size={20} />
      </button>

      <motion.div
        key={currentIndex}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="relative w-full max-w-4xl aspect-video rounded-3xl shadow-2xl overflow-hidden flex flex-col bg-white border border-blue-100"
      >
        {/* Top Header Bar */}
        <div className="w-full bg-blue-50/80 py-3 px-6 border-b border-blue-100 flex items-center justify-between">
          <span className="text-[#2563EB] font-bold text-xs tracking-wide uppercase flex items-center gap-1.5">
            <Sparkles size={13} /> AI Video Presentation
          </span>
          <span className="text-xs font-bold text-[#64748B]">
            Scene {currentIndex + 1} of {scenes.length}
          </span>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden bg-white">
          {/* Left: Text Content */}
          <div className="flex-1 flex flex-col justify-center p-8 md:p-12">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl md:text-3xl font-extrabold text-[#1A202C] leading-snug"
            >
              {currentScene?.text}
            </motion.h2>
          </div>

          {/* Right: Visual */}
          <div className="w-full md:w-2/5 bg-slate-50 flex items-center justify-center p-6 border-t md:border-t-0 md:border-l border-slate-100">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full h-full max-h-64 rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative bg-white"
            >
              <img
                key={imageUrl}
                src={imageUrl}
                alt="Presentation Graphic"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>

        {/* Controls Footer */}
        <div className="w-full bg-[#F8FAFC] border-t border-slate-100 px-6 py-4 flex flex-col gap-3 z-20">
          {/* Timeline Bar */}
          <div className="flex gap-1.5 w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            {scenes.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-full transition-all duration-300 rounded-full ${
                  i < currentIndex
                    ? 'bg-[#2563EB]'
                    : i === currentIndex
                    ? 'bg-blue-400 animate-pulse'
                    : 'bg-transparent'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={restartVideo}
              className="text-xs font-bold text-[#64748B] hover:text-[#2563EB] flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={14} /> Restart
            </button>

            <button
              onClick={togglePause}
              className="w-9 h-9 flex items-center justify-center bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-full shadow-xs transition-all cursor-pointer"
              title={isPaused ? 'Play' : 'Pause'}
            >
              {isPaused ? <Play size={16} className="ml-0.5" /> : <Pause size={16} />}
            </button>

            <div className="w-16" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Chat Bubble Component ───────────────────────────────────────────
function ChatBubble({
  message,
  onRetry,
}: {
  message: ChatMessage;
  onRetry?: () => void;
}) {
  const isUser = message.role === 'user';
  const action = message.action ? ACTION_CONFIG[message.action] : null;
  const isError = !isUser && message.content.startsWith('❌');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-black shrink-0 border ${
          isUser
            ? 'bg-blue-50 border-blue-200 text-[#2563EB]'
            : isError
            ? 'bg-red-50 border-red-200 text-red-600'
            : 'bg-purple-50 border-purple-200 text-[#8B5CF6]'
        }`}
      >
        {isUser ? <User size={16} /> : isError ? <AlertCircle size={16} /> : <Bot size={16} />}
      </div>

      {/* Bubble Container */}
      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
        {action && !isUser && !isError && (
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${action.badgeClass} inline-flex items-center gap-1`}
          >
            <Sparkles size={11} /> {action.label}
          </span>
        )}

        <div
          className={`px-5 py-4 rounded-3xl text-sm font-medium leading-relaxed ${
            isUser
              ? 'bg-[#2563EB] text-white rounded-tr-md shadow-xs'
              : isError
              ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-md'
              : 'bg-[#F8FAFC] border border-slate-200/80 text-[#1A202C] rounded-tl-md shadow-xs'
          }`}
        >
          {message.isLoading ? (
            <div className="flex items-center gap-3 py-1">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-[#2563EB] rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-[#64748B]">
                Generating with Gemini AI…
              </span>
            </div>
          ) : (
            <div>
              <FormattedAIResponse text={message.content} isUser={isUser} />
              {isError && onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-3 inline-flex items-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Try Again</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Format AI Markdown/Bullet Output ───────────────────────────────
function FormattedAIResponse({ text, isUser }: { text: string; isUser: boolean }) {
  if (isUser) return <span>{text}</span>;

  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed" style={{ lineHeight: '1.75' }}>
      {lines.map((line, i) => {
        const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        if (line.trim() === '') return <div key={i} className="h-1.5" />;

        if (
          line.trim().startsWith('•') ||
          line.trim().startsWith('-') ||
          line.trim().match(/^\d+\./)
        ) {
          return (
            <div key={i} className="flex gap-2 items-start pl-1">
              <span className="text-[#2563EB] font-bold shrink-0 mt-0.5">›</span>
              <span
                dangerouslySetInnerHTML={{
                  __html: formatted.replace(/^[•-]\s*/, '').replace(/^\d+\.\s*/, ''),
                }}
              />
            </div>
          );
        }

        return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
      })}
    </div>
  );
}