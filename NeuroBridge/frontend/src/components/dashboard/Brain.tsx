import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000';

interface Source {
  text: string;
  doc_id: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: string[];
  insights?: string;
  timestamp: Date;
}

export function Brain() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ status: string; documents_indexed: number; total_chunks: number } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStatus();
    // Add initial message
    setMessages([{
      id: '1',
      role: 'assistant',
      text: "Hello! I am your NeuroBridge Brain. Upload research papers, notes, or assessment results, and I'll help you find insights and career paths grounded in those sources.",
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/brain/status`);
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({ status: 'offline', documents_indexed: 0, total_chunks: 0 });
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${BACKEND_URL}/api/brain/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        text: `Successfully indexed **${data.filename}**. \n\n**Summary:** ${data.summary}`,
        timestamp: new Date()
      }]);
      fetchStatus();
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/brain/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input, k: 3 }),
      });
      const data = await res.json();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.answer,
        sources: data.sources,
        insights: data.insights,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Query failed', err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-5xl mx-auto space-y-4">
      {/* Header & Status */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl">🧠</div>
          <div>
            <h2 className="font-black text-gray-800">Research Brain</h2>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className={`w-2 h-2 rounded-full ${status?.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={status?.status === 'online' ? 'text-green-600' : 'text-red-600'}>
                {status?.status === 'online' ? 'Service Online' : 'Service Offline'}
              </span>
              {status?.documents_indexed !== undefined && (
                <span className="text-gray-400 ml-2">
                  • {status.documents_indexed} Documents • {status.total_chunks} Chunks
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${isUploading ? 'bg-gray-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
            <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} accept=".pdf,.docx,.csv,.txt" />
            {isUploading ? '⏳ Indexing...' : '📤 Upload Research'}
          </label>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-bl-none'
                }`}>
                  <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </div>
                  
                  {msg.insights && (
                    <div className="mt-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-xs text-indigo-700 font-bold">
                      💡 Insight: {msg.insights}
                    </div>
                  )}

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Sources Grounding</div>
                      <div className="space-y-2">
                        {msg.sources.map((src, i) => (
                          <div key={i} className="text-[11px] bg-white p-2 rounded-lg border border-gray-100 text-gray-500 italic line-clamp-2">
                            "{src}"
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-2xl flex gap-1">
                {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.2}s` }} />)}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex gap-2 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything about your documents..."
              className="flex-1 bg-transparent px-3 outline-none text-sm font-medium"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
