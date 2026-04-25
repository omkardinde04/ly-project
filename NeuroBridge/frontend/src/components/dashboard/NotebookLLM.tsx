import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

const ACTION_CONFIG: Record<LLMAction, { label: string; icon: string; color: string; hoverColor: string; description: string }> = {
  summarize:   { label: 'Summarize', icon: '📋', color: 'bg-blue-500', hoverColor: 'hover:bg-blue-600', description: 'Key points in bullets' },
  explain:     { label: 'Explain',   icon: '💡', color: 'bg-purple-500', hoverColor: 'hover:bg-purple-600', description: 'Simple explanation' },
  simplify:    { label: 'Simplify',  icon: '✏️', color: 'bg-green-500', hoverColor: 'hover:bg-green-600', description: 'Easy words only' },
  quiz:        { label: 'Quiz Me',   icon: '❓', color: 'bg-orange-500', hoverColor: 'hover:bg-orange-600', description: '3 quick questions' },
  'video-script': { label: 'Make Video', icon: '🎥', color: 'bg-pink-500', hoverColor: 'hover:bg-pink-600', description: 'Watch an AI Video' },
};

function genId() { return Math.random().toString(36).slice(2); }

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
    // Do NOT use readAsText for PDFs — let the backend parse the binary.
    // Just store the File object and show the filename.
    setFileContent('__FILE_UPLOAD__'); // sentinel to enable buttons
    setInput('');
  };

  const callLLM = async (action: LLMAction) => {
    const hasFile = selectedFile && fileContent === '__FILE_UPLOAD__';
    const hasText = input.trim().length > 0;
    if (!hasFile && !hasText) return;

    const userMsgId = genId();
    const aiMsgId = genId();
    const previewLabel = hasFile
      ? `📄 ${selectedFile!.name}`
      : input.slice(0, 200) + (input.length > 200 ? '…' : '');

    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', content: previewLabel, action },
      { id: aiMsgId, role: 'ai', action, content: '', isLoading: true },
    ]);
    setLoadingAction(action);

    try {
      let res: globalThis.Response;

      if (hasFile) {
        // Send as multipart/form-data so backend can parse PDF/DOCX
        const formData = new FormData();
        formData.append('file', selectedFile!);
        res = await fetch(`${BACKEND_URL}/api/llm/${action}`, {
          method: 'POST',
          body: formData,
          // Do NOT set Content-Type — browser sets it + boundary automatically
        });
      } else {
        // Plain text — send as JSON
        res = await fetch(`${BACKEND_URL}/api/llm/${action}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: input }),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` })) as { error?: string };
        throw new Error(errData.error ?? `Server error ${res.status}`);
      }

      const data = await res.json() as { result?: string; error?: string };
      if (data.error) throw new Error(data.error);

      if (action === 'video-script') {
        try {
          let rawJson = data.result ?? '[]';
          // Fix for Ollama sometimes wrapping JSON in text
          const match = rawJson.match(/\[[\s\S]*\]/);
          if (match) {
            rawJson = match[0];
          }
          const scenes = JSON.parse(rawJson) as VideoScene[];
          if (!Array.isArray(scenes) || scenes.length === 0) throw new Error("Empty script");
          setPlayingVideo(scenes);
          // Remove the placeholder message
          setMessages(prev => prev.filter(m => m.id !== aiMsgId && m.id !== userMsgId));
        } catch {
          throw new Error("Failed to generate a valid video script. Please try again.");
        }
      } else {
        setMessages(prev =>
          prev.map(m => m.id === aiMsgId ? { ...m, content: data.result ?? '', isLoading: false } : m)
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setMessages(prev =>
        prev.map(m => m.id === aiMsgId
          ? { ...m, content: `❌ ${msg}`, isLoading: false }
          : m
        )
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRetry = (msgId: string, action: LLMAction | undefined) => {
    if (!action) return;
    // Remove the failed AI message
    setMessages(prev => prev.filter(m => m.id !== msgId));
    // Trigger it again
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800">AI Notebook</h1>
            <p className="text-sm text-gray-500 font-medium">Powered by Gemini AI · Dyslexia-friendly</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearAll} className="text-sm text-gray-400 hover:text-red-500 font-medium transition-colors">
            Clear All ✕
          </button>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-3xl shadow-lg border-2 border-blue-50 p-6">
        {/* File Upload */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-600 mb-2 flex items-center gap-2">
            <span className="text-base">📎</span> Upload a document (optional)
          </label>
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-blue-300 transition-colors">
            <input type="file" accept=".txt,.pdf,.doc,.docx,audio/*,video/*" onChange={handleFileUpload}
              className="hidden" id="notebook-file" />
            {selectedFile ? (
              <div className="flex items-center justify-between bg-blue-50 rounded-xl p-3">
                <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  📄 {selectedFile.name}
                  <span className="text-xs text-gray-500 font-normal">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </span>
                <button onClick={() => { setSelectedFile(null); setFileContent(''); setInput(''); }}
                  className="text-red-400 hover:text-red-600 text-sm font-bold transition-colors">✕</button>
              </div>
            ) : (
              <label htmlFor="notebook-file" className="cursor-pointer flex flex-col items-center gap-1">
                <span className="text-2xl">📂</span>
                <span className="text-sm text-gray-500 font-medium">Click to upload TXT, PDF, DOC, Audio, Video</span>
              </label>
            )}
          </div>
        </div>

        {/* Text Input */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-600 mb-2">
            ✍️ Or type / paste your text here
          </label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste your notes, a paragraph, or ask a question…&#10;&#10;Example: 'The child has difficulty reading letters'"
            className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none font-medium text-gray-800 min-h-[120px] resize-none text-base leading-relaxed"
            style={{ lineHeight: '1.8' }}
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(Object.entries(ACTION_CONFIG) as [LLMAction, typeof ACTION_CONFIG[LLMAction]][]).map(([action, cfg]) => (
            <button
              key={action}
              onClick={() => callLLM(action)}
              disabled={!activeText.trim() || loadingAction !== null}
              className={`${cfg.color} ${cfg.hoverColor} text-white py-3 px-4 rounded-2xl font-bold text-sm transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center gap-1`}
            >
              <span className="text-xl">{loadingAction === action ? '⏳' : cfg.icon}</span>
              <span>{cfg.label}</span>
              <span className="text-xs opacity-80 font-normal">{cfg.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat / Response Area */}
      <AnimatePresence>
        {messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg border-2 border-purple-50 p-6 space-y-4 max-h-[600px] overflow-y-auto"
          >
            {messages.map(msg => (
              <ChatBubble key={msg.id} message={msg} onRetry={() => handleRetry(msg.id, msg.action)} />
            ))}
            <div ref={bottomRef} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state hint */}
      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 text-center border border-blue-100"
        >
          <div className="text-4xl mb-3">🤖</div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">How to use AI Notebook</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            {(Object.entries(ACTION_CONFIG) as [LLMAction, typeof ACTION_CONFIG[LLMAction]][]).map(([action, cfg]) => (
              <div key={action} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                <div className="text-2xl mb-1">{cfg.icon}</div>
                <div className="text-sm font-bold text-gray-700">{cfg.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{cfg.description}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4 font-medium">
            Type or paste text above, then click any button to get AI help.
          </p>
        </motion.div>
      )}

      {/* Dynamic Video Player Modal */}
      <AnimatePresence>
        {playingVideo && (
          <DynamicVideoPlayer scenes={playingVideo} onClose={() => setPlayingVideo(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Dynamic Video Player Component ───────────────────────────────────────────
function DynamicVideoPlayer({ scenes, onClose }: { scenes: VideoScene[], onClose: () => void }) {
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
    // Preload all images so they don't pop in late
    scenes.forEach(scene => {
      const img = new Image();
      img.src = `https://loremflickr.com/1280/720/${encodeURIComponent(scene.keyword || 'abstract')}`;
    });
    
    // Auto-start
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
  const imageUrl = currentScene ? `https://loremflickr.com/1280/720/${encodeURIComponent(currentScene.keyword || 'abstract')}` : '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 p-4 sm:p-8"
    >
      <button 
        onClick={() => { speechSynthesis.cancel(); onClose(); }}
        className="absolute top-6 right-6 z-50 text-gray-500 hover:text-gray-800 bg-white hover:bg-gray-200 border border-gray-200 rounded-full w-10 h-10 flex items-center justify-center text-lg transition-all shadow-sm"
      >
        ✕
      </button>

      <motion.div
        key={currentIndex}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="relative w-full max-w-5xl aspect-video rounded-xl shadow-xl overflow-hidden flex flex-col bg-white border border-gray-200"
      >
        {/* Top Header Bar */}
        <div className="w-full bg-blue-50 py-3 px-6 border-b border-blue-100 flex items-center">
           <span className="text-blue-800 font-bold text-sm tracking-wide uppercase">AI Overview</span>
        </div>

        {/* Content Area - Split Layout */}
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden bg-white">
          {/* Left: Text Content */}
          <div className="flex-1 flex flex-col justify-center p-8 md:p-16">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight"
            >
              {currentScene?.text}
            </motion.h2>
          </div>
          
          {/* Right: Visual/Image */}
          <div className="w-full md:w-2/5 lg:w-1/2 bg-gray-50 flex items-center justify-center p-6 border-t md:border-t-0 md:border-l border-gray-200">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.3 }}
               className="w-full h-full max-h-80 rounded-2xl overflow-hidden shadow-md border border-gray-200 relative bg-white"
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

        {/* Video Controls Footer */}
        <div className="w-full bg-gray-50 border-t border-gray-200 px-6 py-4 flex flex-col gap-3 z-20">
          {/* Timeline */}
          <div className="flex gap-1 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            {scenes.map((_, i) => (
              <div 
                key={i} 
                className={`flex-1 h-full transition-all duration-300 ${i < currentIndex ? 'bg-blue-600' : i === currentIndex ? 'bg-blue-400' : 'bg-transparent'}`} 
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
               Slide {currentIndex + 1} of {scenes.length}
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={restartVideo}
                className="text-gray-500 hover:text-blue-600 transition-colors"
                title="Restart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z" clipRule="evenodd" /></svg>
              </button>
              
              <button 
                onClick={togglePause}
                className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 rounded-full shadow-md transition-all"
                title={isPaused ? "Play" : "Pause"}
              >
                {isPaused ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1"><path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" /></svg>
                )}
              </button>
            </div>
            
            <div className="w-16"></div> {/* Spacer for centering controls */}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Chat Bubble Component
function ChatBubble({ message, onRetry }: { message: ChatMessage, onRetry?: () => void }) {
  const isUser = message.role === 'user';
  const action = message.action ? ACTION_CONFIG[message.action] : null;
  const isError = !isUser && message.content.startsWith('❌');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${
        isUser ? 'bg-blue-100' : isError ? 'bg-red-100 text-red-500' : 'bg-gradient-to-br from-purple-500 to-blue-600 text-white'
      }`}>
        {isUser ? '👤' : isError ? '⚠️' : '🤖'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {action && !isUser && !isError && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${action.color} inline-block`}>
            {action.icon} {action.label}
          </span>
        )}
        <div className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed ${
          isUser
            ? 'bg-blue-500 text-white rounded-tr-sm'
            : isError
              ? 'bg-red-50 text-red-600 border border-red-200 rounded-tl-sm'
              : 'bg-gray-50 border border-gray-200 text-gray-800 rounded-tl-sm'
        }`}>
          {message.isLoading ? (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <span className="text-gray-500 italic text-xs">Thinking…</span>
            </div>
          ) : (
            <div>
              <FormattedAIResponse text={message.content} isUser={isUser} />
              {isError && onRetry && (
                <button 
                  onClick={onRetry}
                  className="mt-3 flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                >
                  <span className="text-sm">🔄</span> Try Again
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Render AI response with basic markdown-like formatting
function FormattedAIResponse({ text, isUser }: { text: string; isUser: boolean }) {
  if (isUser) return <span>{text}</span>;

  // Split on double newlines for paragraphs
  const lines = text.split('\n');

  return (
    <div className="space-y-1" style={{ lineHeight: '1.8' }}>
      {lines.map((line, i) => {
        // Bold headers **text** → <strong>
        const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        if (line.trim() === '') return <div key={i} className="h-2" />;

        // Bullet point
        if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().match(/^\d+\./)) {
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-purple-400 font-bold flex-shrink-0 mt-0.5">›</span>
              <span dangerouslySetInnerHTML={{ __html: formatted.replace(/^[•-]\s*/, '').replace(/^\d+\.\s*/, '') }} />
            </div>
          );
        }

        return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
      })}
    </div>
  );
}