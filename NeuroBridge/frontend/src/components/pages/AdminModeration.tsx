import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Check, X, AlertTriangle, Eye, Video, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function AdminModeration() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        setIsLoading(true);
        if (!token) return;
        const res = await fetch('http://localhost:4000/api/admin/pending-courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        }
      } catch (error) {
        console.error('Error fetching pending courses', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPending();
  }, [token]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`http://localhost:4000/api/admin/courses/${id}/${action}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ reason: action === 'reject' ? 'Admin found issues during manual review.' : '' })
      });
      
      if (res.ok) {
        setCourses(courses.filter(c => c._id !== id));
      }
    } catch (error) {
      console.error('Action failed', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-800 text-white rounded-xl flex items-center justify-center">
                <Shield size={20} />
             </div>
             <h1 className="text-2xl font-extrabold text-[#1A202C]">Admin Moderation</h1>
          </div>
          <button onClick={() => navigate('/dashboard/courses')} className="text-sm font-bold text-[#64748B] hover:text-[#1A202C]">
             Exit to Courses
          </button>
        </div>

        {isLoading ? (
           <div className="text-center py-20">Loading pending courses...</div>
        ) : courses.length > 0 ? (
           <div className="grid grid-cols-1 gap-6">
              {courses.map(course => (
                 <div key={course._id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6">
                    
                    <div className="flex-1">
                       <div className="flex items-center gap-2 mb-2">
                          <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold uppercase">Pending Review</span>
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold uppercase">{course.category}</span>
                       </div>
                       <h3 className="text-xl font-extrabold text-[#1A202C] mb-1">{course.title}</h3>
                       <p className="text-sm text-[#64748B] mb-4">By {course.instructor?.name || 'Unknown'}</p>
                       
                       <p className="text-sm text-slate-600 line-clamp-2 mb-4">{course.description}</p>
                       
                       <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-sm">
                          <h4 className="font-bold text-[#1A202C] mb-2 flex items-center gap-2">
                             <Sparkles size={14} className="text-[#2563EB]" /> AI Validation Results
                          </h4>
                          {course.aiValidationId ? (
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                   <p className="text-slate-500 text-xs">Decision</p>
                                   <p className="font-bold text-amber-600 capitalize">{course.aiValidationId.decision.replace('_', ' ')}</p>
                                </div>
                                <div>
                                   <p className="text-slate-500 text-xs">Confidence</p>
                                   <p className="font-bold text-[#1A202C]">{(course.aiValidationId.confidence * 100).toFixed(0)}%</p>
                                </div>
                                <div className="col-span-2">
                                   <p className="text-slate-500 text-xs">AI Reason</p>
                                   <p className="font-medium text-slate-700 italic">"{course.aiValidationId.reason}"</p>
                                </div>
                             </div>
                          ) : (
                             <p className="text-slate-500 italic">No AI validation record attached.</p>
                          )}
                       </div>
                    </div>
                    
                    <div className="w-full md:w-64 shrink-0 flex flex-col justify-center gap-3 border-l border-slate-100 md:pl-6">
                       <button className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-[#1A202C] font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                          <Video size={16} /> Preview Content
                       </button>
                       <button 
                         onClick={() => handleAction(course._id, 'approve')}
                         className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-md shadow-emerald-500/20"
                       >
                          <Check size={16} /> Approve Course
                       </button>
                       <button 
                         onClick={() => handleAction(course._id, 'reject')}
                         className="w-full py-3 bg-white border-2 border-rose-200 hover:bg-rose-50 text-rose-600 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                       >
                          <X size={16} /> Reject Content
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        ) : (
           <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CheckCircle size={32} />
              </div>
              <h2 className="text-xl font-bold text-[#1A202C]">All caught up!</h2>
              <p className="text-slate-500">There are no courses pending review right now.</p>
           </div>
        )}
      </div>
    </div>
  );
}
