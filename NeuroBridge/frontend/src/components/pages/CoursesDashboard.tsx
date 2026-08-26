import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Star, Clock, Play, Compass, Filter, Users, TrendingUp, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const CATEGORIES = ['All', 'Academic', 'Phonology', 'Reading', 'Mathematics', 'Memory', 'Study Skills', 'Communication', 'Career', 'Life Skills'];

export function CoursesDashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (!token) return;
        
        // Fetch enrollments
        const envRes = await fetch('http://localhost:4000/api/courses/enrollments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const envData = envRes.ok ? await envRes.json() : [];
        setEnrollments(envData);
        
        // Fetch courses
        const query = activeCategory !== 'All' ? `?category=${activeCategory}` : '';
        const courseRes = await fetch(`http://localhost:4000/api/courses${query}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const courseData = courseRes.ok ? await courseRes.json() : [];
        setCourses(courseData);
      } catch (error) {
        console.error('Failed to fetch courses data', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [token, activeCategory]);

  const activeCourse = enrollments.find(e => e.progress < 100);

  return (
    <div className="min-h-screen bg-[#F0F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#1A202C] mb-2 tracking-tight">
              NeuroBridge Courses
            </h1>
            <p className="text-[#64748B] text-lg max-w-2xl">
              Learn at your own pace, in a way that works for you. Personalized, accessible, and interactive.
            </p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
             <button 
                onClick={() => navigate('/creator/dashboard')}
                className="px-5 py-2.5 bg-white text-[#2563EB] border border-[#2563EB] hover:bg-blue-50 font-bold rounded-xl shadow-xs transition-colors"
             >
                + Teach on NeuroBridge
             </button>
             {/* Admin entry point - in a real app, conditionally rendered */}
             <button 
                onClick={() => navigate('/admin/courses')}
                className="px-5 py-2.5 bg-slate-800 text-white hover:bg-slate-700 font-bold rounded-xl shadow-xs transition-colors"
             >
                Admin
             </button>
          </motion.div>
        </div>

        {/* Continue Learning or Welcome */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }} 
           animate={{ opacity: 1, y: 0 }} 
           transition={{ delay: 0.1 }}
        >
          {activeCourse ? (
            <div className="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl mix-blend-overlay"></div>
              
              <div className="flex-1 z-10 w-full">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                    Continue Learning
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold mb-2">
                  {activeCourse.course?.title || 'Loading...'}
                </h2>
                <div className="flex items-center gap-4 text-sm font-medium text-blue-100 mb-5">
                  <span>{activeCourse.course?.category}</span>
                  <span>•</span>
                  <span>{activeCourse.progress}% Complete</span>
                </div>
                
                <div className="w-full max-w-md bg-black/20 rounded-full h-2.5 mb-2 overflow-hidden">
                  <div className="bg-white h-full rounded-full" style={{ width: `${activeCourse.progress}%` }}></div>
                </div>
                <p className="text-xs text-blue-200">
                  {activeCourse.completedLessons?.length || 0} lessons completed
                </p>
              </div>
              
              <div className="z-10 shrink-0 w-full md:w-auto">
                <button 
                  onClick={() => navigate(`/courses/${activeCourse.course?._id}/learn`)}
                  className="w-full md:w-auto px-8 py-4 bg-white text-[#2563EB] rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Play size={20} className="fill-[#2563EB]" />
                  Resume Course
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100 text-center shadow-xs">
              <div className="w-16 h-16 bg-blue-50 text-[#2563EB] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Compass size={32} />
              </div>
              <h2 className="text-xl font-bold text-[#1A202C] mb-2">You haven't started a course yet</h2>
              <p className="text-[#64748B] mb-5">Explore our recommended courses and begin your learning journey today.</p>
            </div>
          )}
        </motion.div>

        {/* Search and Categories */}
        <div className="flex flex-col md:flex-row gap-4 items-center sticky top-0 z-20 py-2 bg-[#F0F7FA]">
          <div className="relative w-full md:w-96 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search courses, topics or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all shadow-xs"
            />
          </div>
          
          <div className="flex-1 w-full overflow-x-auto pb-2 -mb-2 hide-scrollbar">
            <div className="flex gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    activeCategory === cat 
                    ? 'bg-[#1A202C] text-white shadow-md' 
                    : 'bg-white text-[#64748B] border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Your Learning Path (Mocked for visual progression) */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-[#2563EB]" size={20} />
            <h2 className="text-xl font-extrabold text-[#1A202C]">Your Learning Path</h2>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-blue-100 shadow-xs relative overflow-hidden">
            <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-100 -translate-y-1/2 rounded-full hidden md:block z-0"></div>
            
            <div className="flex flex-col md:flex-row justify-between relative z-10 gap-6">
              {[
                { title: 'Assessment', status: 'completed', desc: 'Baseline established' },
                { title: 'Phonology', status: 'current', desc: 'Current focus' },
                { title: 'Reading Fluency', status: 'next', desc: 'Recommended next' },
                { title: 'Comprehension', status: 'locked', desc: 'Prerequisite needed' }
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center text-center flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform hover:scale-110 shadow-sm
                    ${step.status === 'completed' ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-500' : 
                      step.status === 'current' ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-50' : 
                      step.status === 'next' ? 'bg-white text-[#2563EB] border-2 border-dashed border-[#2563EB]' : 
                      'bg-slate-50 text-slate-400 border border-slate-200'}`}
                  >
                    <span className="font-bold text-lg">{idx + 1}</span>
                  </div>
                  <h3 className={`font-bold text-sm ${step.status === 'locked' ? 'text-slate-400' : 'text-[#1A202C]'}`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recommended & Course Listing */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-2">
               <Sparkles className="text-amber-500" size={20} />
               <h2 className="text-xl font-extrabold text-[#1A202C]">Recommended for You</h2>
             </div>
             <span className="text-sm font-medium text-[#64748B]">Based on your activity</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 animate-pulse h-80">
                  <div className="w-full h-36 bg-slate-200 rounded-2xl mb-4"></div>
                  <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map(course => (
                <div 
                  key={course._id}
                  onClick={() => navigate(`/courses/${course._id}`)}
                  className="bg-white rounded-3xl p-5 border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col h-full"
                >
                  <div className="w-full h-40 bg-slate-100 rounded-2xl mb-4 relative overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                        <BookOpen size={48} className="text-blue-300 opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#1A202C] uppercase tracking-wide">
                      {course.category}
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-extrabold text-[#1A202C] text-lg leading-tight mb-2 group-hover:text-[#2563EB] transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-xs text-[#64748B] font-medium mb-3">
                      <span className="flex items-center gap-1"><Clock size={14} /> {course.duration || '2h 15m'}</span>
                      <span className="flex items-center gap-1 text-amber-500"><Star size={14} className="fill-amber-500" /> {course.rating?.toFixed(1) || '4.8'}</span>
                    </div>
                    
                    <p className="text-sm text-[#64748B] line-clamp-2 mb-4 flex-1">
                      {course.description}
                    </p>
                    
                    <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 mt-auto">
                      <p className="text-[11px] font-medium text-[#2563EB] leading-tight flex items-start gap-1.5">
                        <Sparkles size={12} className="shrink-0 mt-0.5" />
                        Recommended because you're learning {course.category.toLowerCase()}.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
                <p className="text-slate-500">No courses found matching your criteria.</p>
             </div>
          )}
        </motion.div>

        {/* Community Recommendations Section */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-12 mb-8">
           <div className="flex items-center gap-2 mb-6">
             <Users className="text-purple-500" size={20} />
             <h2 className="text-xl font-extrabold text-[#1A202C]">Recommended by the Community</h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mock Community Recommendation */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative">
                 <div className="flex gap-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-2xl shrink-0 overflow-hidden">
                       <img src="https://i.pravatar.cc/150?u=a" alt="User" className="w-full h-full object-cover" />
                    </div>
                    <div>
                       <h4 className="font-bold text-[#1A202C]">Reading Faster Without Stress</h4>
                       <div className="flex items-center gap-2 text-xs text-[#64748B] mt-1 mb-2">
                          <span className="text-amber-500 flex items-center font-bold">★ 4.9</span>
                          <span>•</span>
                          <span>320 learners</span>
                       </div>
                       <p className="text-sm font-medium text-[#1A202C] italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                          "The visual explanations and dyslexia-friendly fonts were really helpful. Highly recommended!"
                       </p>
                       <p className="text-xs text-[#64748B] mt-2 font-medium">— Recommended by Aarav</p>
                    </div>
                 </div>
              </div>
           </div>
        </motion.div>

      </div>
    </div>
  );
}
