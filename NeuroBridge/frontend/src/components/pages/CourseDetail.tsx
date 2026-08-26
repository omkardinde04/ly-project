import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Star, Clock, Users, CheckCircle, Shield, Accessibility, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [courseData, setCourseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

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
        }
      } catch (error) {
        console.error('Error fetching course', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourse();
  }, [id, token]);

  const handleEnroll = async () => {
    try {
      setIsEnrolling(true);
      const res = await fetch(`http://localhost:4000/api/courses/${id}/enroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        // Navigate to player
        navigate(`/courses/${id}/learn`);
      }
    } catch (error) {
      console.error('Enrollment failed', error);
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#F0F7FA] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!courseData || !courseData.course) {
    return <div className="min-h-screen bg-[#F0F7FA] flex items-center justify-center">Course not found</div>;
  }

  const { course, lessons, enrollment } = courseData;

  return (
    <div className="min-h-screen bg-[#F0F7FA] pb-20">
      {/* Hero Banner */}
      <div className="bg-[#1A202C] text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
           <div className="absolute -right-40 -top-40 w-96 h-96 bg-blue-500 rounded-full blur-[100px]"></div>
           <div className="absolute right-40 bottom-0 w-80 h-80 bg-purple-500 rounded-full blur-[100px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <button onClick={() => navigate('/dashboard/courses')} className="text-slate-400 hover:text-white mb-6 text-sm font-bold flex items-center gap-1 transition-colors">
            ← Back to Courses
          </button>
          
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-blue-600/30 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                  {course.category}
                </span>
                <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-lg text-xs font-bold">
                  {course.difficulty}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4 text-white">
                {course.title}
              </h1>
              
              <p className="text-lg text-slate-300 mb-6 max-w-2xl leading-relaxed">
                {course.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-300 mb-8">
                <span className="flex items-center gap-2"><Star className="fill-amber-400 text-amber-400" size={18} /> {course.rating?.toFixed(1) || '4.8'} ({course.reviewCount || 120} reviews)</span>
                <span className="flex items-center gap-2"><Users size={18} /> {course.learnerCount || 0} learners</span>
                <span className="flex items-center gap-2"><Clock size={18} /> {course.duration || '2h 15m'}</span>
                <span className="flex items-center gap-2"><BookOpen size={18} /> {lessons?.length || 0} lessons</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden border-2 border-slate-600">
                   {course.instructor?.profile_picture ? (
                     <img src={course.instructor.profile_picture} alt={course.instructor.name} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center font-bold text-slate-300">{course.instructor?.name?.charAt(0) || 'I'}</div>
                   )}
                </div>
                <div className="text-sm">
                  <p className="text-slate-400 text-xs">Instructor</p>
                  <p className="font-bold text-white">{course.instructor?.name || 'NeuroBridge Educator'}</p>
                </div>
              </div>
            </div>
            
            {/* Action Card (Floats on desktop) */}
            <div className="w-full lg:w-96 shrink-0 lg:mt-4">
              <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-[#1A202C]">
                 <div className="w-full aspect-video bg-slate-100 rounded-2xl mb-6 relative overflow-hidden group cursor-pointer">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                        <Play size={48} className="text-blue-500 opacity-50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center backdrop-blur">
                        <Play size={24} className="text-[#2563EB] ml-1" />
                      </div>
                    </div>
                 </div>
                 
                 {enrollment ? (
                   <div>
                     <p className="text-sm font-bold text-[#64748B] mb-2">Your Progress: {enrollment.progress}%</p>
                     <div className="w-full h-2 bg-slate-100 rounded-full mb-4 overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-[#2563EB] to-blue-400 rounded-full" style={{ width: `${enrollment.progress}%` }}></div>
                     </div>
                     <button 
                       onClick={() => navigate(`/courses/${course._id}/learn`)}
                       className="w-full py-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-2xl font-bold text-lg transition-all shadow-md flex items-center justify-center gap-2"
                     >
                       Continue Course <Play size={18} className="fill-white" />
                     </button>
                   </div>
                 ) : (
                   <button 
                     onClick={handleEnroll}
                     disabled={isEnrolling}
                     className="w-full py-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-2xl font-bold text-lg transition-all shadow-md disabled:opacity-70"
                   >
                     {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                   </button>
                 )}
                 
                 <div className="mt-6 space-y-4 text-sm font-medium text-[#64748B]">
                    <div className="flex items-start gap-3">
                      <Shield className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                      <span>AI Validated Educational Content</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Accessibility className="text-[#2563EB] shrink-0 mt-0.5" size={18} />
                      <div>
                        <span className="block text-[#1A202C] font-bold mb-1">Accessibility Features</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                           {(course.accessibilityFeatures && course.accessibilityFeatures.length > 0 ? course.accessibilityFeatures : ['Captions', 'Transcript', 'Text-to-Speech', 'Simplify']).map((feat: string, i: number) => (
                             <span key={i} className="bg-blue-50 text-[#2563EB] px-2 py-0.5 rounded text-xs">{feat}</span>
                           ))}
                        </div>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-0">
        <div className="w-full lg:w-[calc(100%-420px)] bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100">
          
          {/* Learning Objectives */}
          <h2 className="text-2xl font-extrabold text-[#1A202C] mb-5">What you'll learn</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {(course.learningObjectives && course.learningObjectives.length > 0 ? course.learningObjectives : [
              'Understand core concepts of the topic',
              'Apply practical strategies in daily life',
              'Recognize patterns and structures',
              'Build confidence through interactive practice'
            ]).map((obj: string, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                <span className="text-[#475569]">{obj}</span>
              </div>
            ))}
          </div>
          
          <hr className="border-slate-100 mb-10" />

          {/* Curriculum */}
          <h2 className="text-2xl font-extrabold text-[#1A202C] mb-2">Curriculum</h2>
          <p className="text-[#64748B] mb-6 text-sm">{lessons?.length || 0} lessons • {course.duration || '2h 15m'} total length</p>
          
          <div className="space-y-3">
            {lessons && lessons.length > 0 ? lessons.map((lesson: any, i: number) => (
              <div key={lesson._id} className="group border border-slate-200 rounded-2xl p-4 flex items-center justify-between hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-default">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-[#64748B] flex items-center justify-center font-bold text-sm group-hover:bg-white group-hover:text-[#2563EB] transition-colors">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1A202C]">{lesson.title}</h4>
                    <p className="text-xs text-[#64748B] flex items-center gap-2 mt-1">
                      <Play size={10} /> Video • {Math.round((lesson.duration || 300) / 60)} min
                    </p>
                  </div>
                </div>
                {enrollment && enrollment.completedLessons.includes(lesson._id) && (
                  <CheckCircle className="text-emerald-500" size={20} />
                )}
              </div>
            )) : (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <p className="text-slate-500">Curriculum is being prepared.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
