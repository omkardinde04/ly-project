import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, FastForward, CheckCircle, Volume2, Sparkles, MessageCircleQuestion, HelpCircle, ArrowRight, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDyslexia } from '../../contexts/DyslexiaContext';

export function CoursePlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  const [courseData, setCourseData] = useState<any>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [showSimplify, setShowSimplify] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [showFeedback, setShowFeedback] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        if (!token) return;
        const res = await fetch(`http://localhost:4000/api/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCourseData(data);
          
          // Determine starting lesson based on enrollment
          if (data.enrollment && data.lessons && data.lessons.length > 0) {
            const lastLessonId = data.enrollment.lastLesson;
            if (lastLessonId) {
              const idx = data.lessons.findIndex((l: any) => l._id === lastLessonId);
              if (idx !== -1) setCurrentLessonIndex(idx);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching course', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourse();
  }, [id, token]);

  const updateProgress = async (completed: boolean) => {
    if (!token || !courseData || !courseData.lessons[currentLessonIndex]) return;
    
    try {
      const lessonId = courseData.lessons[currentLessonIndex]._id;
      await fetch(`http://localhost:4000/api/courses/${id}/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ completed, timeSpent: currentTime })
      });
      
      // Update local state to reflect completion
      if (completed && courseData.enrollment) {
         setCourseData((prev: any) => {
            const updated = { ...prev };
            if (!updated.enrollment.completedLessons.includes(lessonId)) {
               updated.enrollment.completedLessons.push(lessonId);
            }
            return updated;
         });
      }
    } catch (error) {
      console.error('Error updating progress', error);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      
      // Mark as complete if watched > 80%
      if (videoRef.current.currentTime > (videoRef.current.duration * 0.8) && !showQuiz) {
        // Trigger quiz if it exists, otherwise just mark complete
        const currentLesson = courseData?.lessons[currentLessonIndex];
        if (currentLesson?.quiz && currentLesson.quiz.length > 0) {
          setShowQuiz(true);
          if (isPlaying) {
             videoRef.current.pause();
             setIsPlaying(false);
          }
        } else {
          updateProgress(true);
        }
      }
    }
  };
  
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleQuizAnswer = (selected: string, correct: string) => {
    if (selected === correct) {
      setQuizResult('correct');
      updateProgress(true); // Mark lesson complete on correct answer
      setTimeout(() => setShowFeedback(true), 1500);
    } else {
      setQuizResult('incorrect');
    }
  };
  
  const handleNextLesson = () => {
     setShowQuiz(false);
     setShowFeedback(false);
     setQuizResult('none');
     if (currentLessonIndex < courseData.lessons.length - 1) {
        setCurrentLessonIndex(prev => prev + 1);
     }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#F0F7FA] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]"></div>
    </div>;
  }

  if (!courseData || !courseData.course || !courseData.lessons) {
    return <div className="min-h-screen bg-[#F0F7FA] flex items-center justify-center">Unable to load course player</div>;
  }

  const { course, lessons, enrollment } = courseData;
  const currentLesson = lessons[currentLessonIndex];

  return (
    <div className="flex h-screen bg-[#F0F7FA] overflow-hidden flex-col md:flex-row">
      
      {/* Sidebar Curriculum (Left) */}
      <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col h-1/3 md:h-full shrink-0 z-10">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
          <div>
            <button onClick={() => navigate(`/courses/${id}`)} className="text-xs font-bold text-[#64748B] hover:text-[#2563EB] flex items-center gap-1 mb-1 transition-colors">
              <ChevronLeft size={14} /> Back to Course
            </button>
            <h2 className="font-extrabold text-[#1A202C] line-clamp-1">{course.title}</h2>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {lessons.map((lesson: any, index: number) => {
            const isCompleted = enrollment?.completedLessons.includes(lesson._id);
            const isCurrent = index === currentLessonIndex;
            
            return (
              <button
                key={lesson._id}
                onClick={() => {
                   setCurrentLessonIndex(index);
                   setShowQuiz(false);
                   setShowFeedback(false);
                   setQuizResult('none');
                }}
                className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-all ${
                  isCurrent 
                    ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-emerald-500 text-white' 
                    : isCurrent 
                      ? 'bg-[#2563EB] text-white' 
                      : 'border-2 border-slate-300 text-slate-300'
                }`}>
                  {isCompleted ? <Check size={12} strokeWidth={3} /> : (isCurrent ? <Play size={10} className="ml-0.5" /> : null)}
                </div>
                
                <div>
                  <h4 className={`font-bold text-sm ${isCurrent ? 'text-[#2563EB]' : 'text-[#1A202C]'}`}>
                    {index + 1}. {lesson.title}
                  </h4>
                  <p className="text-xs text-[#64748B] mt-0.5">{Math.round(lesson.duration / 60)} min</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Main Content Area (Right) */}
      <div className="flex-1 flex flex-col h-2/3 md:h-full overflow-hidden relative">
        
        {/* Video Player */}
        <div className="bg-black w-full relative shrink-0 aspect-video md:aspect-auto md:h-[60%] flex items-center justify-center">
          {/* Mock Video Player for Prototype */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
             {currentLesson?.videoUrl ? (
                <video 
                  ref={videoRef}
                  src={currentLesson.videoUrl}
                  className="w-full h-full object-cover"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onClick={togglePlay}
                />
             ) : (
                <div className="text-white/20 text-center">
                   <Play size={64} className="mx-auto mb-4" />
                   <p>No video available for this lesson.</p>
                </div>
             )}
          </div>
          
          {/* Custom Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 sm:px-6 py-4 flex flex-col gap-2">
            
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-white/30 rounded-full cursor-pointer relative group">
               <div 
                 className="absolute top-0 left-0 h-full bg-[#2563EB] rounded-full group-hover:bg-blue-400 transition-colors"
                 style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
               />
            </div>
            
            <div className="flex items-center justify-between text-white">
               <div className="flex items-center gap-4">
                  <button onClick={togglePlay} className="hover:text-blue-400 transition-colors">
                     {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <div className="text-xs font-medium font-mono">
                     {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <button className="text-xs font-bold hover:text-blue-400 flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded">
                     1x
                  </button>
               </div>
            </div>
          </div>
          
          {/* Quiz Overlay */}
          <AnimatePresence>
             {showQuiz && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                >
                   <div className="bg-white rounded-3xl p-8 max-w-lg w-full">
                      <div className="flex items-center justify-between mb-6">
                         <h3 className="text-xl font-extrabold text-[#1A202C]">Knowledge Check</h3>
                         <Sparkles className="text-[#2563EB]" />
                      </div>
                      
                      {currentLesson.quiz && currentLesson.quiz.length > 0 && (
                         <div>
                            <p className="text-[#1A202C] font-bold text-lg mb-6">{currentLesson.quiz[0].question}</p>
                            <div className="space-y-3">
                               {currentLesson.quiz[0].options.map((opt: string, i: number) => (
                                  <button
                                    key={i}
                                    onClick={() => handleQuizAnswer(opt, currentLesson.quiz[0].answer)}
                                    className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-all ${
                                       quizResult === 'none' 
                                          ? 'border-slate-200 hover:border-[#2563EB] hover:bg-blue-50 text-[#1A202C]' 
                                          : opt === currentLesson.quiz[0].answer
                                             ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                                             : 'border-rose-200 opacity-50 text-slate-500'
                                    }`}
                                  >
                                     {opt}
                                  </button>
                               ))}
                            </div>
                            
                            {quizResult === 'correct' && (
                               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                                  <CheckCircle className="text-emerald-600 shrink-0" />
                                  <div>
                                     <p className="font-bold text-emerald-800">Correct!</p>
                                     <p className="text-sm text-emerald-700 mt-1">{currentLesson.quiz[0].explanation}</p>
                                  </div>
                               </motion.div>
                            )}
                            
                            {quizResult === 'incorrect' && (
                               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                                  <p className="font-bold text-rose-800">Not quite. Review the options and try again.</p>
                               </motion.div>
                            )}
                         </div>
                      )}
                   </div>
                </motion.div>
             )}
          </AnimatePresence>
        </div>
        
        {/* Interactive Transcript & Learning Support (Below Video) */}
        <div className="flex-1 bg-white overflow-y-auto relative p-6 sm:p-8">
           
           <div className="max-w-3xl mx-auto">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8 sticky top-0 bg-white/90 backdrop-blur pb-4 pt-2 z-10 border-b border-slate-100">
                 <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-50 text-[#2563EB] rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-100 transition-colors">
                       <Volume2 size={16} /> Read Aloud
                    </button>
                    <button 
                      onClick={() => setShowSimplify(!showSimplify)}
                      className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors ${showSimplify ? 'bg-purple-100 text-purple-700' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}
                    >
                       <Sparkles size={16} /> Simplify
                    </button>
                 </div>
              </div>
              
              {/* Transcript */}
              <div className="space-y-4">
                 <h3 className="font-extrabold text-[#1A202C] text-xl mb-4">Interactive Transcript</h3>
                 
                 {showSimplify ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-purple-50 border border-purple-100 rounded-2xl">
                       <div className="flex items-center gap-2 mb-3 text-purple-700 font-bold">
                          <Sparkles size={18} /> AI Simplified Version
                       </div>
                       <p className="text-purple-900 leading-relaxed text-lg">
                          {currentLesson?.summary || "This lesson explains the basics of the topic in an easy way. You will learn the main rules and how to use them."}
                       </p>
                    </motion.div>
                 ) : (
                    <div className="text-[#475569] leading-relaxed space-y-4 text-lg">
                       {/* Mock interactive transcript sentences */}
                       <p className="cursor-pointer hover:bg-blue-50 p-1 -mx-1 rounded transition-colors">
                          Welcome to this lesson on {course.title}.
                       </p>
                       <p className="cursor-pointer hover:bg-blue-50 p-1 -mx-1 rounded transition-colors">
                          {currentLesson?.transcript || "Transcript not available for this lesson."}
                       </p>
                    </div>
                 )}
              </div>
              
              {/* Did you understand? (Shows at end of lesson) */}
              <AnimatePresence>
                 {showFeedback && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-12 mb-8 bg-[#F8FAFC] border border-blue-100 rounded-3xl p-6 sm:p-8 text-center"
                    >
                       <h3 className="text-xl font-extrabold text-[#1A202C] mb-6">Did you understand this lesson?</h3>
                       <div className="flex flex-wrap justify-center gap-4">
                          <button 
                             onClick={handleNextLesson}
                             className="px-6 py-3 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm"
                          >
                             😊 I understood
                          </button>
                          <button className="px-6 py-3 bg-white border border-slate-200 text-[#64748B] hover:bg-slate-50 rounded-xl font-bold transition-colors shadow-sm">
                             😐 I'm somewhat confused
                          </button>
                          <button className="px-6 py-3 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm">
                             😕 I need help
                          </button>
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>
              
              {showFeedback && currentLessonIndex < lessons.length - 1 && (
                 <div className="flex justify-end mt-8">
                    <button 
                       onClick={handleNextLesson}
                       className="px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-bold shadow-md flex items-center gap-2 transition-all"
                    >
                       Next Lesson <ChevronRight size={18} />
                    </button>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
