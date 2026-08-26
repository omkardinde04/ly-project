import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Play, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CoursesWidgetProps {
  onNavigate?: (tab: string) => void; // Optional if we want to navigate internally within dashboard, but courses will be a full page
}

export function CoursesWidget({ onNavigate }: CoursesWidgetProps) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [activeCourse, setActiveCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setIsLoading(true);
        if (!token) return;
        const res = await fetch('http://localhost:4000/api/courses/enrollments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            // Pick the most recently active or first incomplete course
            const active = data.find((e: any) => e.progress < 100) || data[0];
            setActiveCourse(active);
          }
        }
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEnrollments();
  }, [token]);

  const handleExplore = () => {
    // Navigate to full courses page
    navigate('/dashboard/courses');
  };

  const handleContinue = () => {
    if (activeCourse) {
      navigate(`/courses/${activeCourse.course._id}/learn`);
    } else {
      navigate('/dashboard/courses');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs flex flex-col justify-between h-full relative overflow-hidden group hover:shadow-sm hover:border-blue-200 transition-all cursor-pointer"
      onClick={handleExplore}
    >
      <div className="flex-1 flex flex-col">
        {/* Header Badge */}
        <div className="flex items-center justify-between gap-2 mb-4 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#2563EB] border border-blue-100">
            <Sparkles size={12} className="text-[#2563EB]" />
            Recommended Next Step
          </span>
          <span className="text-xs font-bold text-[#64748B] bg-slate-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <BookOpen size={12} />
            Courses
          </span>
        </div>

        {/* Title & Description */}
        <div className="mb-4 shrink-0">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A202C] leading-snug">
            NeuroBridge Courses
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 leading-relaxed">
            Discover personalized, accessible courses and learn at your own pace.
          </p>
        </div>

        {/* Dynamic State Section */}
        <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-4 mb-4 flex-1 flex flex-col justify-center">
          {isLoading ? (
            <div className="animate-pulse flex flex-col gap-2">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ) : activeCourse && activeCourse.course ? (
            <div>
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                Continue Learning
              </div>
              <div className="font-bold text-[#1A202C] text-sm mb-1 truncate">
                {activeCourse.course.title}
              </div>
              <div className="flex items-center justify-between text-xs font-medium text-[#2563EB] mb-2">
                <span>{activeCourse.progress}% complete</span>
                <span>{activeCourse.completedLessons?.length || 0} lessons done</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA] rounded-full" 
                  style={{ width: `${activeCourse.progress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                Recommended for you
              </div>
              <div className="font-bold text-[#1A202C] text-sm">
                Phonological Awareness
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                Start your first course to build fundamental skills.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); handleContinue(); }}
          className="w-full h-11 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2"
        >
          {activeCourse ? (
            <>
              <Play size={15} className="fill-white" />
              <span>Continue Learning</span>
            </>
          ) : (
            <>
              <span>Explore Courses</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleExplore(); }}
          className="w-full h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#475569] font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-200"
        >
          View All Courses
        </button>
      </div>
    </motion.div>
  );
}
