import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';

interface Message {
  id: number;
  user: string;
  text: string;
  timestamp: string;
  isAudio?: boolean;
}

export function Community() {
  const { language } = useDyslexia();
  const t = getTranslation(language);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      user: 'Sarah M.',
      text: 'Does anyone have tips for reading long documents?',
      timestamp: '2 hours ago',
    },
    {
      id: 2,
      user: 'Alex K.',
      text: 'I find that using text-to-speech helps me focus better!',
      timestamp: '1 hour ago',
    },
    {
      id: 3,
      user: 'Jamie L.',
      text: 'Breaking content into smaller chunks works great for me 📚',
      timestamp: '30 minutes ago',
    },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: messages.length + 1,
      user: 'You',
      text: newMessage,
      timestamp: 'Just now',
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-800 mb-2">Community</h1>
        <p className="text-gray-600 font-medium">Connect with other learners and share experiences</p>
      </div>

      {/* Discussion Forums */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-50"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">💬</span>
            <h3 className="text-xl font-bold text-gray-800">Discussion Forums</h3>
          </div>
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-xl p-4 cursor-pointer hover:bg-blue-100 transition-colors">
              <div className="font-bold text-gray-800 mb-1">Study Tips & Tricks</div>
              <div className="text-sm text-gray-600">125 active discussions</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 cursor-pointer hover:bg-purple-100 transition-colors">
              <div className="font-bold text-gray-800 mb-1">Career Advice</div>
              <div className="text-sm text-gray-600">89 active discussions</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 cursor-pointer hover:bg-green-100 transition-colors">
              <div className="font-bold text-gray-800 mb-1">Success Stories</div>
              <div className="text-sm text-gray-600">56 active discussions</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-50"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">👥</span>
            <h3 className="text-xl font-bold text-gray-800">Support Groups</h3>
          </div>
          <div className="space-y-3">
            <div className="bg-green-50 rounded-xl p-4 cursor-pointer hover:bg-green-100 transition-colors">
              <div className="font-bold text-gray-800 mb-1">Beginners Group</div>
              <div className="text-sm text-gray-600">Starting your journey together</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 cursor-pointer hover:bg-orange-100 transition-colors">
              <div className="font-bold text-gray-800 mb-1">Advanced Learners</div>
              <div className="text-sm text-gray-600">Share advanced techniques</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 cursor-pointer hover:bg-blue-100 transition-colors">
              <div className="font-bold text-gray-800 mb-1">Parents & Educators</div>
              <div className="text-sm text-gray-600">Support network for helpers</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chat System */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">💭</span>
          <h3 className="text-xl font-bold text-gray-800">Community Chat</h3>
        </div>

        {/* Messages Area */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6 max-h-[400px] overflow-y-auto space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 ${message.user === 'You' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.user === 'You' ? 'bg-blue-100' : 'bg-purple-100'
              }`}>
                <span className="font-bold text-gray-700">{message.user[0]}</span>
              </div>
              
              <div className={`flex-1 ${message.user === 'You' ? 'text-right' : ''}`}>
                <div className={`inline-block px-4 py-3 rounded-2xl ${
                  message.user === 'You' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}>
                  <div className="font-semibold text-sm mb-1">{message.user}</div>
                  <div className="leading-relaxed">{message.text}</div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{message.timestamp}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none font-medium"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            className="px-6 py-3 bg-[#4A90E2] hover:bg-blue-600 text-white font-bold rounded-xl transition-all"
          >
            Send
          </button>
          <button className="px-4 py-3 bg-purple-100 hover:bg-purple-200 text-purple-600 font-bold rounded-xl transition-all">
            🎤
          </button>
        </div>

        {/* Accessibility Features */}
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-400" />
            <span>Enable audio messages</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-400" defaultChecked />
            <span>Text-to-speech for messages</span>
          </label>
        </div>
      </motion.div>

      {/* Guidelines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">📋</span>
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Community Guidelines</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Be respectful and supportive of all members</li>
              <li>• Share your experiences and learn from others</li>
              <li>• Use clear, simple language when possible</li>
              <li>• Celebrate progress, no matter how small</li>
              <li>• Ask questions - we're all here to help</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
