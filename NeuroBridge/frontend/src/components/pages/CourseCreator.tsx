import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Upload, CheckCircle, AlertTriangle, Play, Sparkles, Server, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function CourseCreator() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  
  const [courseData, setCourseData] = useState({
    title: '',
    category: 'Phonology',
    description: '',
    difficulty: 'Beginner'
  });
  
  const [lessonData, setLessonData] = useState({
    title: '',
    videoUrl: 'https://example.com/video.mp4' // Mock URL for prototype
  });
  
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);

  const handleCreateCourse = async () => {
    try {
      setIsUploading(true);
      const res = await fetch('http://localhost:4000/api/creator/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(courseData)
      });
      if (res.ok) {
        const data = await res.json();
        setCreatedCourseId(data._id);
        setStep(2);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadLesson = async () => {
    if (!createdCourseId) return;
    
    try {
      setIsValidating(true);
      setStep(3); // Move to validating step
      
      const res = await fetch(`http://localhost:4000/api/creator/${createdCourseId}/lessons`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(lessonData)
      });
      
      const data = await res.json();
      setValidationResult(data.validation);
      
      if (res.ok) {
         setStep(4); // Success
      } else {
         setStep(5); // Rejected
      }
    } catch (error) {
      console.error(error);
      setStep(5);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/dashboard/courses')} className="text-slate-500 font-bold text-sm mb-6 flex items-center gap-1 hover:text-[#2563EB] transition-colors">
           ← Back to Courses
        </button>
        
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-slate-100">
            <div className="w-12 h-12 bg-blue-50 text-[#2563EB] rounded-2xl flex items-center justify-center">
              <Video size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#1A202C]">Create Educational Course</h1>
              <p className="text-sm text-[#64748B]">Submit your content for AI validation and publishing.</p>
            </div>
          </div>
          
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#1A202C] mb-2">Course Title</label>
                <input 
                  type="text" 
                  value={courseData.title}
                  onChange={e => setCourseData({...courseData, title: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:bg-white outline-none font-medium"
                  placeholder="e.g. Phonological Awareness Mastery"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-bold text-[#1A202C] mb-2">Category</label>
                   <select 
                     value={courseData.category}
                     onChange={e => setCourseData({...courseData, category: e.target.value})}
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:bg-white outline-none font-medium"
                   >
                     {['Academic', 'Phonology', 'Reading', 'Mathematics', 'Memory', 'Communication'].map(c => (
                        <option key={c} value={c}>{c}</option>
                     ))}
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-[#1A202C] mb-2">Difficulty</label>
                   <select 
                     value={courseData.difficulty}
                     onChange={e => setCourseData({...courseData, difficulty: e.target.value})}
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:bg-white outline-none font-medium"
                   >
                     {['Beginner', 'Intermediate', 'Advanced'].map(c => (
                        <option key={c} value={c}>{c}</option>
                     ))}
                   </select>
                 </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#1A202C] mb-2">Short Description</label>
                <textarea 
                  value={courseData.description}
                  onChange={e => setCourseData({...courseData, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:bg-white outline-none font-medium resize-none"
                  placeholder="What will learners achieve?"
                />
              </div>
              
              <button 
                 onClick={handleCreateCourse}
                 disabled={!courseData.title || isUploading}
                 className="w-full py-4 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                 {isUploading ? 'Creating...' : 'Next: Upload Lesson'}
              </button>
            </motion.div>
          )}
          
          {step === 2 && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#1A202C] mb-2">Lesson Title</label>
                  <input 
                    type="text" 
                    value={lessonData.title}
                    onChange={e => setLessonData({...lessonData, title: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:bg-white outline-none font-medium"
                    placeholder="e.g. Recognizing the /b/ sound"
                  />
                </div>
                
                <div className="border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer group">
                   <Upload size={32} className="mx-auto text-slate-400 group-hover:text-[#2563EB] mb-4 transition-colors" />
                   <h3 className="text-lg font-bold text-[#1A202C] mb-2">Upload Video Lesson</h3>
                   <p className="text-sm text-[#64748B]">MP4, WebM up to 500MB</p>
                   <p className="text-xs text-[#2563EB] font-bold mt-4 opacity-0 group-hover:opacity-100 transition-opacity">Click to browse files</p>
                </div>
                
                <div className="bg-blue-50/50 p-4 rounded-xl flex gap-3 text-sm">
                   <Sparkles className="text-[#2563EB] shrink-0 mt-0.5" />
                   <p className="text-[#1A202C] font-medium leading-relaxed">
                     Your video will be automatically analyzed by NeuroBridge AI. We will generate captions, a transcript, a simplified summary, and an interactive knowledge check based on your spoken content.
                   </p>
                </div>
                
                <button 
                   onClick={handleUploadUploadLesson}
                   disabled={!lessonData.title}
                   className="w-full py-4 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                   Upload & Run AI Validation
                </button>
             </motion.div>
          )}
          
          {step === 3 && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
                <div className="relative w-24 h-24 mx-auto mb-8">
                   <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                   <div className="absolute inset-0 rounded-full border-4 border-[#2563EB] border-t-transparent animate-spin"></div>
                   <Sparkles className="absolute inset-0 m-auto text-[#2563EB]" size={32} />
                </div>
                <h2 className="text-2xl font-extrabold text-[#1A202C] mb-2">AI Analyzing Content...</h2>
                <div className="space-y-2 text-[#64748B] font-medium max-w-sm mx-auto text-sm">
                   <p className="flex items-center gap-2 justify-center"><Check size={16} className="text-emerald-500" /> Extracting audio track</p>
                   <p className="flex items-center gap-2 justify-center"><Check size={16} className="text-emerald-500" /> Generating transcript</p>
                   <p className="flex items-center gap-2 justify-center text-[#2563EB] animate-pulse"><Server size={16} /> Verifying educational relevance</p>
                </div>
             </motion.div>
          )}
          
          {step === 4 && validationResult && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                   <CheckCircle size={40} />
                </div>
                <h2 className="text-2xl font-extrabold text-[#1A202C] mb-2">Validation Passed!</h2>
                <p className="text-[#64748B] mb-8">Your content has been verified as educational and safe.</p>
                
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left mb-8 max-w-md mx-auto">
                   <h4 className="font-bold text-[#1A202C] mb-4">AI Analysis Report</h4>
                   <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                         <span className="text-[#64748B]">Detected Category:</span>
                         <span className="font-bold text-[#1A202C]">{validationResult.primaryCategory}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                         <span className="text-[#64748B]">Confidence Score:</span>
                         <span className="font-bold text-[#1A202C]">{(validationResult.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-[#64748B]">Generated Materials:</span>
                         <span className="font-bold text-emerald-600">Transcript, Summary, Quiz</span>
                      </div>
                   </div>
                </div>
                
                <div className="flex gap-4">
                   <button onClick={() => navigate('/dashboard/courses')} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-[#475569] font-bold rounded-xl transition-colors">
                      Done
                   </button>
                   <button onClick={() => setStep(2)} className="flex-1 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl shadow-md transition-colors">
                      Add Another Lesson
                   </button>
                </div>
             </motion.div>
          )}
          
          {step === 5 && validationResult && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
                <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                   <AlertTriangle size={40} />
                </div>
                <h2 className="text-2xl font-extrabold text-[#1A202C] mb-2">Content Needs Revision</h2>
                <p className="text-[#64748B] mb-8">Your video could not be approved for publication.</p>
                
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 text-left mb-8 max-w-md mx-auto">
                   <h4 className="font-bold text-rose-800 mb-2">Reason for rejection:</h4>
                   <p className="text-rose-700 text-sm italic">"{validationResult.reason}"</p>
                   
                   <div className="mt-4 pt-4 border-t border-rose-200/50 space-y-2 text-xs">
                      <p><span className="font-bold">Category Match:</span> {validationResult.titleMatch ? '✅' : '❌'}</p>
                      <p><span className="font-bold">Educational Content:</span> {validationResult.educationalResult ? '✅' : '❌'}</p>
                   </div>
                </div>
                
                <button onClick={() => setStep(2)} className="w-full py-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl shadow-md transition-colors">
                   Upload a Different Video
                </button>
             </motion.div>
          )}
          
        </div>
      </div>
    </div>
  );
  
  // Need to correctly map this for TS scope
  function handleUploadUploadLesson() {
      handleUploadLesson();
  }
}
