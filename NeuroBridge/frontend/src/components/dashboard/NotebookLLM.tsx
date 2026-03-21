import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import { AudioControl } from '../ui/AudioControl';

export function NotebookLLM() {
  const { language } = useDyslexia();
  const t = getTranslation(language);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<{ text: string; diagram?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleExplain = () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    // Mock AI response - would connect to actual LLM in production
    setTimeout(() => {
      setOutput({
        text: `Here's a simplified explanation of "${input}":\n\nThis concept can be broken down into key parts:\n\n1. **Main Idea**: The core principle is straightforward and focuses on understanding the fundamentals.\n\n2. **Key Components**: \n   • Visual elements help comprehension\n   • Audio support reinforces learning\n   • Step-by-step breakdown aids retention\n\n3. **Practical Application**: You can apply this by starting with simple examples and gradually building complexity.`,
        diagram: '📊 → 🎯 → ✅',
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-800 mb-2">Notebook LLM</h1>
          <p className="text-gray-600 font-medium">AI-powered learning assistant for personalized explanations</p>
        </div>
        <AudioControl 
          text="Notebook LLM. Your AI assistant that explains concepts visually and simply." 
          showControls={false} 
        />
      </div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100"
      >
        <label className="block text-lg font-bold text-gray-800 mb-3">
          What would you like to learn today?
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a topic, concept, or question... (e.g., 'How does photosynthesis work?' or 'Explain machine learning')"
          className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none font-medium text-gray-800 min-h-[120px] resize-none"
        />
        <button
          onClick={handleExplain}
          disabled={!input.trim() || isLoading}
          className={`mt-4 w-full py-4 rounded-xl font-bold text-lg transition-all ${
            !input.trim() || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#4A90E2] hover:bg-blue-600 text-white shadow-lg'
          }`}
        >
          {isLoading ? 'Generating Explanation...' : '✨ Generate Explanation'}
        </button>
      </motion.div>

      {/* Output Section */}
      {output && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Text Explanation */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🧠</span>
              <h3 className="text-xl font-bold text-gray-800">Simplified Explanation</h3>
            </div>
            
            {/* Audio Summary */}
            <div className="mb-4">
              <AudioControl text={output.text} showControls={true} />
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl p-6 whitespace-pre-wrap text-gray-800 leading-relaxed">
              {output.text}
            </div>
          </div>

          {/* Visual Diagram */}
          {output.diagram && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📊</span>
                <h3 className="text-xl font-bold text-gray-800">Visual Breakdown</h3>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 text-center">
                <div className="text-4xl font-black text-gray-800">{output.diagram}</div>
              </div>
            </div>
          )}

          {/* Action Steps */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🎯</span>
              <h3 className="text-xl font-bold text-gray-800">Next Steps</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-orange-50 rounded-xl p-4">
                <span className="font-bold text-orange-600 text-lg">1.</span>
                <div>
                  <div className="font-bold text-gray-800">Review the explanation</div>
                  <div className="text-sm text-gray-600">Listen to the audio summary if needed</div>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
                <span className="font-bold text-blue-600 text-lg">2.</span>
                <div>
                  <div className="font-bold text-gray-800">Study the visual diagram</div>
                  <div className="text-sm text-gray-600">Understand the flow and connections</div>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-purple-50 rounded-xl p-4">
                <span className="font-bold text-purple-600 text-lg">3.</span>
                <div>
                  <div className="font-bold text-gray-800">Practice with examples</div>
                  <div className="text-sm text-gray-600">Apply what you've learned</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Features Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-bold text-gray-800 mb-3">How This Helps You</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                Complex concepts broken down into simple parts
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                Visual diagrams for better understanding
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                Audio explanations for auditory learners
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                Step-by-step guidance at your own pace
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
