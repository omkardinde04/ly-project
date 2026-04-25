import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000';

type LLMAction = 'summarize' | 'explain' | 'simplify' | 'quiz';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  action?: LLMAction;
  content: string;
  isLoading?: boolean;
}

const ACTION_CONFIG: Record<LLMAction, { label: string; icon: string; color: string; hoverColor: string; description: string }> = {
  summarize: { label: 'Summarize', icon: '📋', color: 'bg-blue-500', hoverColor: 'hover:bg-blue-600', description: 'Key points in bullets' },
  explain:   { label: 'Explain',   icon: '💡', color: 'bg-purple-500', hoverColor: 'hover:bg-purple-600', description: 'Simple explanation' },
  simplify:  { label: 'Simplify',  icon: '✏️', color: 'bg-green-500', hoverColor: 'hover:bg-green-600', description: 'Easy words only' },
  quiz:      { label: 'Quiz Me',   icon: '❓', color: 'bg-orange-500', hoverColor: 'hover:bg-orange-600', description: '3 quick questions' },
};

function genId() { return Math.random().toString(36).slice(2); }

export function NotebookLLM() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingAction, setLoadingAction] = useState<LLMAction | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState('');
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

      setMessages(prev =>
        prev.map(m => m.id === aiMsgId ? { ...m, content: data.result ?? '', isLoading: false } : m)
      );
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
              <ChatBubble key={msg.id} message={msg} />
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
    </div>
  );
}

// Chat Bubble Component
function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const action = message.action ? ACTION_CONFIG[message.action] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${
        isUser ? 'bg-blue-100' : 'bg-gradient-to-br from-purple-500 to-blue-600 text-white'
      }`}>
        {isUser ? '👤' : '🤖'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {action && !isUser && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${action.color} inline-block`}>
            {action.icon} {action.label}
          </span>
        )}
        <div className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed ${
          isUser
            ? 'bg-blue-500 text-white rounded-tr-sm'
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
            <FormattedAIResponse text={message.content} isUser={isUser} />
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
              <span dangerouslySetInnerHTML={{ __html: formatted.replace(/^[•\-]\s*/, '').replace(/^\d+\.\s*/, '') }} />
            </div>
          );
        }

        return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
      })}
    </div>
  );
}
