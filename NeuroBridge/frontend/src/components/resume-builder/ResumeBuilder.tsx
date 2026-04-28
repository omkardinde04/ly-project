import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Mic, Plus, Trash2, Upload, X, Save } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ResumePreview } from './ResumePreview';
import { initialResumeData } from './types';
import type { ProjectItem, ResumeData, ThemeType } from './types';

type StepKey = 'personal' | 'education' | 'skills' | 'projects' | 'preview' | 'download' | 'apply';
const STORAGE_KEY = 'neurobridge-resume-data-v2';

const STEPS: { key: StepKey; label: string }[] = [
  { key: 'personal', label: 'Personal' },
  { key: 'education', label: 'Education' },
  { key: 'skills', label: 'Skills' },
  { key: 'projects', label: 'Projects' },
  { key: 'preview', label: 'Preview' },
  { key: 'download', label: 'Download' },
  { key: 'apply', label: 'Apply' },
];

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
const isFilled = (v: string) => v.trim().length > 0;

function UnderlineField({
  label, value, onChange, placeholder, onMicClick, listening
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  onMicClick?: () => void; listening?: boolean;
}) {
  const hasValue = value.trim().length > 0;
  return (
    <div className="relative py-3">
      <div className="flex items-end gap-3">
        <div className="relative flex-1">
          <label className={`absolute left-0 transition-all text-sm font-bold text-gray-500 ${hasValue ? '-top-2' : 'top-3'}`}>{label}</label>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={hasValue ? '' : (placeholder ?? '')}
            className="w-full bg-transparent pt-6 pb-2 outline-none text-lg text-gray-800 placeholder:text-gray-400 border-b border-gray-200 focus:border-blue-400"
            style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif', lineHeight: 1.8 }}
          />
        </div>
        {onMicClick && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onMicClick();
            }}
            className={`h-10 w-10 rounded-full border text-blue-600 flex items-center justify-center transition ${listening ? 'bg-red-50 border-red-200 animate-pulse' : 'bg-white/70 hover:bg-white border-gray-100'}`}
            title="Speak"
          >
            <Mic size={18} />
          </button>
        )}
      </div>
      {listening && <div className="text-xs text-red-500 font-bold mt-1" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}>Listening...</div>}
    </div>
  );
}

function ProgressBar({ stepIndex }: { stepIndex: number }) {
  const pct = Math.round(((stepIndex + 1) / 7) * 100);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-2" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}>
        <span>Progress</span><span>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/70 border border-gray-100 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 font-bold" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}>
        {['Personal', 'Education', 'Skills', 'Projects', 'Preview'].map((s, i) => <span key={s} className={i <= Math.min(stepIndex, 4) ? 'text-gray-700' : ''}>{s}</span>)}
      </div>
    </div>
  );
}

const SectionShell = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
  <div className="bg-white/70 rounded-3xl px-7 py-7 border border-white/70">
    <div className="mb-6">
      <div className="text-3xl font-black text-gray-900" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}>{title}</div>
      <div className="text-gray-500 mt-2 text-sm leading-relaxed" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}>{subtitle}</div>
    </div>
    {children}
  </div>
);

export const ResumeBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const recognitionRef = useRef<any>(null);
  const [activeMicField, setActiveMicField] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [template, setTemplate] = useState<ThemeType>('minimal');
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [skillDraft, setSkillDraft] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const SKILL_SUGGESTIONS = useMemo(() => ['Communication', 'Teamwork', 'Problem Solving', 'Python', 'Java', 'C++', 'React', 'Node.js', 'SQL', 'Machine Learning', 'Data Analysis', 'Git', 'UI/UX', 'Public Speaking', 'Leadership'], []);
  const suggestedSkills = useMemo(() => {
    const q = skillDraft.trim().toLowerCase();
    if (!q) return [];
    return SKILL_SUGGESTIONS.filter(s => s.toLowerCase().includes(q)).filter(s => !resumeData.skills.some(x => x.toLowerCase() === s.toLowerCase())).slice(0, 6);
  }, [skillDraft, SKILL_SUGGESTIONS, resumeData.skills]);

  const personalComplete = useMemo(() => {
    const p = resumeData.personal;
    return isFilled(p.name) && isFilled(p.email) && isFilled(p.phone) && isFilled(p.location);
  }, [resumeData.personal]);
  const educationComplete = useMemo(() => {
    const e = resumeData.education;
    return isFilled(e.degree) && isFilled(e.college) && isFilled(e.year) && isFilled(e.cgpa);
  }, [resumeData.education]);
  const skillsComplete = useMemo(() => resumeData.skills.length >= 1, [resumeData.skills]);
  const projectsComplete = useMemo(() => resumeData.projects.length > 0 && resumeData.projects.every(p => isFilled(p.name) && isFilled(p.description) && isFilled(p.techStack)), [resumeData.projects]);
  const canApply = personalComplete && educationComplete && skillsComplete;

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setResumeData(parsed.resumeData ?? initialResumeData);
        setTemplate(parsed.template ?? 'minimal');
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (started) localStorage.setItem(STORAGE_KEY, JSON.stringify({ resumeData, template }));
  }, [resumeData, template, started]);

  const toggleMic = (fieldId: string, onResult: (text: string) => void) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (activeMicField === fieldId) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setActiveMicField(null);
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim?.() ?? '';
      if (transcript) onResult(transcript);
    };

    recognition.onend = () => setActiveMicField(null);
    recognition.onerror = () => setActiveMicField(null);

    recognitionRef.current = recognition;
    setActiveMicField(fieldId);
    
    setTimeout(() => {
      try {
        recognition.start();
      } catch {
        setActiveMicField(null);
      }
    }, 50);
  };

  const addSkill = (raw: string) => {
    const name = raw.trim();
    if (!name || resumeData.skills.some(s => s.toLowerCase() === name.toLowerCase())) return;
    setResumeData(prev => ({ ...prev, skills: [...prev.skills, name] }));
    setSkillDraft('');
  };
  const removeSkill = (name: string) => setResumeData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== name) }));
  const addProject = () => setResumeData(prev => ({ ...prev, projects: [...prev.projects, { id: createId(), name: '', description: '', techStack: '', link: '', reportFileName: '' }] }));
  const updateProject = (id: string, patch: Partial<ProjectItem>) => setResumeData(prev => ({ ...prev, projects: prev.projects.map(p => (p.id === id ? { ...p, ...patch } : p)) }));
  const deleteProject = (id: string) => setResumeData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));

  const nextDisabled = (stepIndex === 0 && !personalComplete) || (stepIndex === 1 && !educationComplete) || (stepIndex === 2 && !skillsComplete) || (stepIndex === 3 && !projectsComplete) || stepIndex === 6;
  const handleNext = () => setStepIndex((s) => Math.min(6, s + 1));
  const handleBack = () => setStepIndex((s) => Math.max(0, s - 1));

  const getFileName = () => {
    const safe = (resumeData.personal.name || 'Resume').trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    return `${safe}_Resume.pdf`;
  };

  const downloadPDF = async () => {
    const element = document.getElementById('resume-preview-content');
    if (!element) {
      alert("Resume preview not found. Please make sure the preview is visible.");
      return;
    }

    try {
      const opt = {
        margin: [0.35, 0.35, 0.35, 0.35],
        filename: getFileName(),
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          backgroundColor: '#ffffff',
          logging: false
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
      };
      
      // Using the promise-based API
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const saveResumeToDB = async () => {
    if (!user?.email) {
      alert("Please log in to save your resume to your profile.");
      return;
    }
    
    setSaveStatus('saving');
    try {
      const response = await fetch('http://localhost:4000/api/resume/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          resumeData,
          template
        }),
      });

      if (!response.ok) throw new Error('Failed to save');
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error("Save error:", err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleApply = () => {
    if (!canApply) return;
    localStorage.setItem('neurobridge-apply-resume', JSON.stringify({ resumeData, template, createdAt: Date.now() }));
    navigate('/dashboard/opportunities', { state: { resumeData, template } as any });
  };

  const renderStep = () => {
    switch (stepIndex) {
      case 0:
        return <SectionShell title="Step 1 — Personal Details" subtitle="Fill all fields. Type or use mic."><div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
          <UnderlineField label="Name" value={resumeData.personal.name} onChange={(v) => setResumeData(p => ({ ...p, personal: { ...p.personal, name: v } }))} placeholder="Your full name" onMicClick={() => toggleMic('personal-name', (t) => setResumeData(p => ({ ...p, personal: { ...p.personal, name: p.personal.name ? `${p.personal.name} ${t}` : t } })))} listening={activeMicField === 'personal-name'} />
          <UnderlineField label="Email" value={resumeData.personal.email} onChange={(v) => setResumeData(p => ({ ...p, personal: { ...p.personal, email: v } }))} placeholder="you@example.com" onMicClick={() => toggleMic('personal-email', (t) => setResumeData(p => ({ ...p, personal: { ...p.personal, email: p.personal.email ? `${p.personal.email} ${t}` : t } })))} listening={activeMicField === 'personal-email'} />
          <UnderlineField label="Phone" value={resumeData.personal.phone} onChange={(v) => setResumeData(p => ({ ...p, personal: { ...p.personal, phone: v } }))} placeholder="+91 9876543210" onMicClick={() => toggleMic('personal-phone', (t) => setResumeData(p => ({ ...p, personal: { ...p.personal, phone: p.personal.phone ? `${p.personal.phone} ${t}` : t } })))} listening={activeMicField === 'personal-phone'} />
          <UnderlineField label="Location" value={resumeData.personal.location} onChange={(v) => setResumeData(p => ({ ...p, personal: { ...p.personal, location: v } }))} placeholder="City, State" onMicClick={() => toggleMic('personal-location', (t) => setResumeData(p => ({ ...p, personal: { ...p.personal, location: p.personal.location ? `${p.personal.location} ${t}` : t } })))} listening={activeMicField === 'personal-location'} />
        </div></SectionShell>;
      case 1:
        return <SectionShell title="Step 2 — Education" subtitle="Fill all fields."><div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
          <UnderlineField label="Degree" value={resumeData.education.degree} onChange={(v) => setResumeData(p => ({ ...p, education: { ...p.education, degree: v } }))} placeholder="B.Tech / B.Sc" onMicClick={() => toggleMic('education-degree', (t) => setResumeData(p => ({ ...p, education: { ...p.education, degree: p.education.degree ? `${p.education.degree} ${t}` : t } })))} listening={activeMicField === 'education-degree'} />
          <UnderlineField label="College" value={resumeData.education.college} onChange={(v) => setResumeData(p => ({ ...p, education: { ...p.education, college: v } }))} placeholder="College / University" onMicClick={() => toggleMic('education-college', (t) => setResumeData(p => ({ ...p, education: { ...p.education, college: p.education.college ? `${p.education.college} ${t}` : t } })))} listening={activeMicField === 'education-college'} />
          <UnderlineField label="Year" value={resumeData.education.year} onChange={(v) => setResumeData(p => ({ ...p, education: { ...p.education, year: v } }))} placeholder="2026" onMicClick={() => toggleMic('education-year', (t) => setResumeData(p => ({ ...p, education: { ...p.education, year: p.education.year ? `${p.education.year} ${t}` : t } })))} listening={activeMicField === 'education-year'} />
          <UnderlineField label="CGPA" value={resumeData.education.cgpa} onChange={(v) => setResumeData(p => ({ ...p, education: { ...p.education, cgpa: v } }))} placeholder="8.5" onMicClick={() => toggleMic('education-cgpa', (t) => setResumeData(p => ({ ...p, education: { ...p.education, cgpa: p.education.cgpa ? `${p.education.cgpa} ${t}` : t } })))} listening={activeMicField === 'education-cgpa'} />
        </div></SectionShell>;
      case 2:
        return <SectionShell title="Step 3 — Skills" subtitle="Add at least 1 skill."><div className="flex items-end gap-3">
          <div className="flex-1"><UnderlineField label="Add a skill" value={skillDraft} onChange={setSkillDraft} placeholder="Type or speak a skill" onMicClick={() => toggleMic('skills', (t) => setSkillDraft(prev => (prev ? `${prev} ${t}` : t)))} listening={activeMicField === 'skills'} /></div>
          <button type="button" onClick={() => addSkill(skillDraft)} disabled={!isFilled(skillDraft)} className="h-10 px-5 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-40" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}>Add</button>
        </div>
        {suggestedSkills.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{suggestedSkills.map(s => <button key={s} type="button" onClick={() => addSkill(s)} className="px-3 py-1.5 rounded-full bg-white/70 border border-gray-100 text-gray-700 font-bold text-sm hover:bg-white transition" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}>+ {s}</button>)}</div>}
        <div className="mt-5 flex flex-wrap gap-2">{resumeData.skills.map(s => <span key={s} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-blue-50 text-blue-800 border border-blue-100 text-sm font-bold" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}>{s}<button type="button" onClick={() => removeSkill(s)} className="h-5 w-5 rounded-full bg-white/70 border border-blue-100 text-blue-700 flex items-center justify-center hover:bg-white">×</button></span>)}</div>
        </SectionShell>;
      case 3:
        return <SectionShell title="Step 4 — Projects + Experience" subtitle="Add project details. Link/PDF optional."><div className="space-y-5">
          <div className="rounded-3xl bg-white/60 border border-gray-100 px-6 py-4">
            <div className="text-sm font-black text-gray-700 mb-2" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}>Experience (optional)</div>
            <div className="grid md:grid-cols-3 gap-x-6">
              <UnderlineField label="Internship" value={resumeData.experience.internship} onChange={(v) => setResumeData(p => ({ ...p, experience: { ...p.experience, internship: v } }))} placeholder="Internship" onMicClick={() => toggleMic('exp-internship', (t) => setResumeData(p => ({ ...p, experience: { ...p.experience, internship: p.experience.internship ? `${p.experience.internship} ${t}` : t } })))} listening={activeMicField === 'exp-internship'} />
              <UnderlineField label="Project" value={resumeData.experience.project} onChange={(v) => setResumeData(p => ({ ...p, experience: { ...p.experience, project: v } }))} placeholder="Project" onMicClick={() => toggleMic('exp-project', (t) => setResumeData(p => ({ ...p, experience: { ...p.experience, project: p.experience.project ? `${p.experience.project} ${t}` : t } })))} listening={activeMicField === 'exp-project'} />
              <UnderlineField label="Role" value={resumeData.experience.role} onChange={(v) => setResumeData(p => ({ ...p, experience: { ...p.experience, role: v } }))} placeholder="Role" onMicClick={() => toggleMic('exp-role', (t) => setResumeData(p => ({ ...p, experience: { ...p.experience, role: p.experience.role ? `${p.experience.role} ${t}` : t } })))} listening={activeMicField === 'exp-role'} />
            </div>
          </div>
          {resumeData.projects.map((p) => (
            <div key={p.id} className="rounded-3xl bg-white/70 border border-gray-100 px-6 py-5">
              <div className="flex items-center justify-between mb-2"><div className="text-sm font-black text-gray-700" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}>Project</div><button type="button" onClick={() => deleteProject(p.id)} className="p-2 rounded-full hover:bg-red-50 text-red-500"><Trash2 size={18} /></button></div>
              <UnderlineField label="Project title" value={p.name} onChange={(v) => updateProject(p.id, { name: v })} placeholder="Project title" onMicClick={() => toggleMic(`project-title-${p.id}`, (t) => updateProject(p.id, { name: p.name ? `${p.name} ${t}` : t }))} listening={activeMicField === `project-title-${p.id}`} />
              <UnderlineField label="Description" value={p.description} onChange={(v) => updateProject(p.id, { description: v })} placeholder="Project description" onMicClick={() => toggleMic(`project-desc-${p.id}`, (t) => updateProject(p.id, { description: p.description ? `${p.description} ${t}` : t }))} listening={activeMicField === `project-desc-${p.id}`} />
              <UnderlineField label="Tech stack" value={p.techStack} onChange={(v) => updateProject(p.id, { techStack: v })} placeholder="React, Node, SQL" onMicClick={() => toggleMic(`project-tech-${p.id}`, (t) => updateProject(p.id, { techStack: p.techStack ? `${p.techStack} ${t}` : t }))} listening={activeMicField === `project-tech-${p.id}`} />
              <UnderlineField label="Project link (optional)" value={p.link || ''} onChange={(v) => updateProject(p.id, { link: v })} placeholder="GitHub / Live URL" />
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <input ref={(el) => { fileRefs.current[p.id] = el; }} type="file" accept="application/pdf" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.type !== 'application/pdf') { alert('Please upload PDF only.'); e.target.value = ''; return; }
                  updateProject(p.id, { reportFileName: file.name });
                }} />
                <button type="button" onClick={() => fileRefs.current[p.id]?.click()} className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 flex items-center gap-2" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}><Upload size={15} /> Upload PDF</button>
                {p.reportFileName && <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-sm font-bold" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}>{p.reportFileName}<button type="button" onClick={() => updateProject(p.id, { reportFileName: '' })} className="text-blue-700"><X size={14} /></button></div>}
              </div>
            </div>
          ))}
          <button type="button" onClick={addProject} className="w-full rounded-full bg-white/70 hover:bg-white border border-gray-100 py-4 font-black text-gray-700 transition flex items-center justify-center gap-2" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}><Plus size={18} className="text-blue-600" />Add Project</button>
        </div></SectionShell>;
      case 4:
        return <SectionShell title="Step 5 — Preview Resume" subtitle="Switch templates at top to update preview instantly."><div className="text-gray-700 text-sm leading-relaxed font-bold" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}>Preview looks live on the right.</div></SectionShell>;
      case 5:
        return (
          <SectionShell title="Step 6 — Download & Save" subtitle="Download PDF or save resume to your profile.">
            <div className="space-y-4">
              <button 
                type="button" 
                onClick={downloadPDF} 
                className="w-full py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black transition flex items-center justify-center gap-2" 
                style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}
              >
                Download PDF
              </button>
              
              <button 
                type="button" 
                onClick={saveResumeToDB} 
                disabled={saveStatus === 'saving'}
                className={`w-full py-4 rounded-full border-2 font-black transition flex items-center justify-center gap-2 ${
                  saveStatus === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 
                  saveStatus === 'error' ? 'bg-red-50 border-red-500 text-red-700' :
                  'bg-white border-blue-100 text-blue-600 hover:bg-blue-50'
                }`}
                style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}
              >
                {saveStatus === 'saving' ? 'Saving...' : 
                 saveStatus === 'success' ? 'Resume saved successfully!' :
                 saveStatus === 'error' ? 'Error saving resume' :
                 <><Save size={18} /> Save to Profile</>}
              </button>
            </div>
          </SectionShell>
        );
      case 6:
        return <SectionShell title="Step 7 — Apply" subtitle="Apply redirects to dashboard opportunities."><button type="button" onClick={handleApply} disabled={!canApply} className="w-full py-4 rounded-full bg-white border border-gray-200 text-gray-800 font-black transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}>Apply to Opportunities</button>{!canApply && <div className="text-xs text-gray-500 font-bold leading-relaxed mt-3" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}>Complete Personal, Education and Skills to enable Apply.</div>}</SectionShell>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F9FD] via-[#F7FBFF] to-[#F9F7FF] text-gray-900 overflow-hidden flex flex-col">
      <div className="px-8 pt-8 pb-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div>
              <div className="text-4xl font-black text-gray-900" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}>Resume Builder</div>
              <div className="text-gray-500 text-sm mt-2 font-bold" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}>Calm, step-by-step, dyslexia-friendly.</div>
            </div>
            <div className="flex items-center gap-2 bg-white/70 border border-white/70 rounded-full p-1">
              {([{ id: 'minimal', label: 'Template 1' }, { id: 'soft', label: 'Template 2' }, { id: 'student', label: 'Template 3' }] as { id: ThemeType; label: string }[]).map((t) => (
                <button key={t.id} type="button" onClick={() => setTemplate(t.id)} className={`px-4 py-2 rounded-full text-sm font-black transition ${template === t.id ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-white'}`} style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}>{t.label}</button>
              ))}
            </div>
          </div>
          {started && <div className="mt-6"><ProgressBar stepIndex={stepIndex} /></div>}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto grid lg:grid-cols-[1fr_520px] gap-6 px-8 pb-8">
          <div className="overflow-auto pr-2">
            {!started ? (
              <SectionShell title="Start Resume Builder" subtitle="Choose how you want to begin.">
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => {
                    const saved = localStorage.getItem(STORAGE_KEY);
                    if (saved) {
                      try {
                        const parsed = JSON.parse(saved);
                        setResumeData(parsed.resumeData ?? initialResumeData);
                        setTemplate(parsed.template ?? 'minimal');
                      } catch {}
                    }
                    setStepIndex(0);
                    setStarted(true);
                  }} className="px-6 py-3 rounded-full bg-blue-600 text-white font-black hover:bg-blue-700 transition" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}>Edit Resume</button>
                  <button type="button" onClick={() => {
                    setResumeData(initialResumeData);
                    setTemplate('minimal');
                    setStepIndex(0);
                    localStorage.removeItem(STORAGE_KEY);
                    setStarted(true);
                  }} className="px-6 py-3 rounded-full bg-white border border-gray-200 text-gray-800 font-black hover:bg-gray-50 transition" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}>Create New Resume</button>
                </div>
              </SectionShell>
            ) : (
              <>
                <div className="space-y-6 pb-24">{renderStep()}</div>
                <div className="sticky bottom-0 mt-6 pt-4 pb-4 bg-gradient-to-t from-[#F4F9FD] to-transparent">
                  <div className="flex items-center justify-between gap-4">
                    <button type="button" onClick={handleBack} disabled={stepIndex === 0} className="px-6 py-3 rounded-full bg-white/70 border border-white/70 text-gray-700 font-black hover:bg-white transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}><ArrowLeft size={18} />Back</button>
                    <button type="button" onClick={handleNext} disabled={nextDisabled} className="px-7 py-3 rounded-full bg-blue-600 text-white font-black hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}>Next<ArrowRight size={18} /></button>
                  </div>
                  {activeMicField && <div className="mt-3 text-xs font-black text-blue-700" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}>Listening... click mic again to stop.</div>}
                </div>
              </>
            )}
          </div>
          <div className="overflow-hidden">
            <ResumePreview 
              data={resumeData} 
              theme={template} 
              onSave={saveResumeToDB} 
              onDownload={downloadPDF}
              saveStatus={saveStatus}
            />
          </div>
        </div>
      </div>

      <style>{`@font-face {font-family: 'OpenDyslexic';src: url('https://antijingoist.github.io/opendyslexic/fonts/OpenDyslexic-Regular.otf') format('opentype');font-weight: normal;font-style: normal;}`}</style>
    </div>
  );
};
