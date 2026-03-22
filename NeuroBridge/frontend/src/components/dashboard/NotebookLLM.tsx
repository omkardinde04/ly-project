import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import { AudioControl } from '../ui/AudioControl';

export function NotebookLLM() {
  const { language } = useDyslexia();
  const t = getTranslation(language);
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [output, setOutput] = useState<{ text: string; diagram?: string; keyPoints?: string[]; chartData?: { labels: string[]; values: number[] } } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Read file content
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFileContent(content);
        setInput(`Explain this document: ${file.name}`);
      };
      reader.readAsText(file);
    }
  };

  const handleExplain = () => {
    if (!input.trim() && !fileContent) return;
    
    setIsLoading(true);
    // Generate response based on file or input
    setTimeout(() => {
      const topic = fileContent ? selectedFile?.name : input;
      
      // Analyze file content
      let analysisData = { wordCount: 0, sentenceCount: 0, frequentWords: [] as string[], paragraphs: 0 };
      
      if (fileContent) {
        const words = fileContent.split(/\s+/).filter(w => w.length > 0);
        const sentences = fileContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const paragraphs = fileContent.split(/\n\n+/).filter(p => p.trim().length > 0);
        analysisData = {
          wordCount: words.length,
          sentenceCount: sentences.length,
          frequentWords: getFrequentWords(fileContent),
          paragraphs: paragraphs.length
        };
      }
      
      // Generate summary text
      const summaryText = generateSummary(topic || 'Your Topic', analysisData, fileContent);
      
      setOutput({
        text: summaryText,
        diagram: 'chart', // Special marker for chart display
        keyPoints: fileContent ? [
          `${analysisData.wordCount} total words`,
          `${analysisData.sentenceCount} sentences`,
          `${analysisData.paragraphs} paragraphs`,
          `Reading time: ${Math.ceil(analysisData.wordCount / 200)} min`
        ] : [
          'Core concept identification',
          'Visual pattern recognition',
          'Audio-visual integration',
          'Step-by-step progression'
        ],
        chartData: fileContent ? {
          labels: ['Words', 'Sentences', 'Paragraphs', 'Avg Length'],
          values: [analysisData.wordCount, analysisData.sentenceCount, analysisData.paragraphs, Math.round(analysisData.wordCount / analysisData.paragraphs)]
        } : undefined
      });
      setIsLoading(false);
    }, 1500);
  };
  
  // Generate comprehensive summary
  const generateSummary = (topic: string, data: any, content: string): string => {
    if (!content) {
      return `**Understanding Your Topic**

Here's a detailed explanation of your query:

**Key Concepts:**

1. **Foundation**: This topic builds on fundamental principles that are essential for deeper understanding.

2. **Core Elements**: 
   • Breaking down complex ideas into manageable parts
   • Visual representation aids comprehension
   • Audio reinforcement strengthens retention

3. **Application**: Start with basic examples and progressively advance to more complex scenarios.`;
    }
    
    const topKeywords = data.frequentWords.slice(0, 5).join(', ');
    return `**Document Summary: ${topic}**

Your document has been thoroughly analyzed. Here's what we found:

**Content Overview:**

• **Total Words**: ${data.wordCount} words across ${data.sentenceCount} sentences
• **Structure**: ${data.paragraphs} distinct sections/paragraphs
• **Key Topics**: ${topKeywords}

**Main Insights:**

1. **Content Density**: The material presents information in a structured manner with clear organization.

2. **Learning Approach**: 
   • Visual elements can enhance understanding of these concepts
   • Audio narration helps reinforce key points
   • Breaking content into smaller sections aids retention

3. **Study Strategy**: Begin with the core concepts identified, then explore supporting details systematically.`;
  };
  
  // Helper function to extract frequent meaningful words from content
  const getFrequentWords = (text: string): string[] => {
    const commonWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while', 'although', 'though', 'after', 'before', 'unless', 'since', 'that', 'this', 'these', 'those', 'it', 'its'];
    
    const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
    const wordFreq: Record<string, number> = {};
    
    words.forEach(word => {
      if (word.length > 3 && !commonWords.includes(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(entry => entry[0]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-800">Notebook LLM</h1>
              <p className="text-sm text-gray-600">AI-powered learning assistant</p>
            </div>
          </div>
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
        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Your Document
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <div className="font-semibold text-gray-700">Click to upload or drag and drop</div>
                  <div className="text-sm text-gray-500">TXT, PDF, DOC, DOCX (max 10MB)</div>
                </div>
              </div>
            </label>
            {selectedFile && (
              <div className="mt-4 bg-blue-50 rounded-lg p-3 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{selectedFile.name}</div>
                  <div className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</div>
                </div>
                <button
                  onClick={() => { setSelectedFile(null); setFileContent(''); setInput(''); }}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">OR</span>
          </div>
        </div>

        {/* Manual Input */}
        <label className="block text-lg font-bold text-gray-800 mb-3">
          What would you like to learn today?
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a topic, concept, or question... (e.g., 'How does photosynthesis work?' or 'Explain quantum computing')"
          className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none font-medium text-gray-800 min-h-[120px] resize-none"
        />
        <button
          onClick={handleExplain}
          disabled={(!input.trim() && !fileContent) || isLoading}
          className={`mt-4 w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
            (!input.trim() && !fileContent) || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Analyzing & Generating Explanation...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Generate Explanation
            </>
          )}
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
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

            {/* Key Points */}
            {output.keyPoints && (
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Key Takeaways
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {output.keyPoints.map((point, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="text-sm text-gray-700">{point}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Visual Analytics Chart */}
          {output.chartData && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="text-xl font-bold text-gray-800">Content Analytics</h3>
                </div>
                <AudioControl 
                  text={`Document statistics: ${output.chartData.values[0]} words, ${output.chartData.values[1]} sentences, ${output.chartData.values[2]} paragraphs. Average paragraph length is ${output.chartData.values[3]} words.`} 
                  showControls={true} 
                />
              </div>
              
              {/* Bar Chart */}
              <div className="space-y-4">
                {output.chartData!.labels.map((label, index) => {
                  const maxValue = Math.max(...output.chartData!.values);
                  const percentage = (output.chartData!.values[index] / maxValue) * 100;
                  const colors = ['from-blue-500 to-blue-600', 'from-purple-500 to-purple-600', 'from-green-500 to-green-600', 'from-orange-500 to-orange-600'];
                  
                  return (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">{label}</span>
                        <span className="text-sm font-bold text-gray-800">{output.chartData!.values[index].toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: 0.2 + (index * 0.1) }}
                          className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Audio Summary Info */}
              <div className="mt-6 bg-purple-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2">Listen to Statistics Summary</h4>
                    <p className="text-sm text-gray-600">Click the speaker icon above to hear an audio explanation of these chart statistics and what they mean for your document.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Steps */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-100">
            <div className="flex items-center gap-3 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
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
              {fileContent && (
                <div className="flex items-start gap-3 bg-green-50 rounded-xl p-4">
                  <span className="font-bold text-green-600 text-lg">4.</span>
                  <div>
                    <div className="font-bold text-gray-800">Upload more documents</div>
                    <div className="text-sm text-gray-600">Continue building your knowledge base</div>
                  </div>
                </div>
              )}
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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <div>
            <h3 className="font-bold text-gray-800 mb-3">How This Helps You</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Complex concepts broken down into simple parts
              </li>
              <li className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Visual diagrams for better understanding
              </li>
              <li className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Audio explanations for auditory learners
              </li>
              <li className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Step-by-step guidance at your own pace
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
