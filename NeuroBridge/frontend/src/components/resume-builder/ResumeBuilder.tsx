import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Mic,
  Plus,
  Trash2,
  Upload,
  X,
  Save,
  FileText,
  CheckCircle2,
  Circle,
  Download,
  Briefcase,
  Sparkles,
  Layers,
  GraduationCap,
  FolderKanban,
  Send,
  RotateCcw,
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ResumePreview } from './ResumePreview';
import { StepNavigation } from './StepNavigation';
import { initialResumeData } from './types';
import type { ProjectItem, ResumeData, ThemeType } from './types';

type StepKey = 'personal' | 'education' | 'skills' | 'projects' | 'preview' | 'download' | 'apply';
const STORAGE_KEY = 'neurobridge-resume-data-v2';

const STEPS: { key: StepKey; label: string }[] = [
  { key: 'personal', label: '1. Personal' },
  { key: 'education', label: '2. Education' },
  { key: 'skills', label: '3. Skills' },
  { key: 'projects', label: '4. Projects' },
  { key: 'preview', label: '5. Preview' },
  { key: 'download', label: '6. Download' },
  { key: 'apply', label: '7. Apply' },
];

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const isFilled = (v: string) => v.trim().length > 0;

function ModernInputField({
  label,
  value,
  onChange,
  placeholder,
  onMicClick,
  listening,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onMicClick?: () => void;
  listening?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#1A202C] uppercase tracking-wider">{label}</label>
        {onMicClick && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onMicClick();
            }}
            className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              listening
                ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                : 'bg-slate-50 text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 border-slate-200'
            }`}
            title="Speech-to-text input"
          >
            <Mic size={12} />
            <span>{listening ? 'Listening…' : 'Voice'}</span>
          </button>
        )}
      </div>

      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? ''}
          className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-[#F8FAFC] focus:bg-white text-xs sm:text-sm text-[#1A202C] placeholder-[#94A3B8] font-medium outline-none transition-all"
        />
      </div>
    </div>
  );
}

const SectionShell = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100/80 shadow-xs space-y-5">
    <div className="pb-3 border-b border-slate-100">
      <h2 className="text-xl sm:text-2xl font-black text-[#1A202C] tracking-tight">{title}</h2>
      <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-1 leading-relaxed">
        {subtitle}
      </p>
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

  const SKILL_SUGGESTIONS = useMemo(
    () => [
      'Communication',
      'Teamwork',
      'Problem Solving',
      'Python',
      'Java',
      'C++',
      'React',
      'Node.js',
      'SQL',
      'Machine Learning',
      'Data Analysis',
      'Git',
      'UI/UX',
      'Public Speaking',
      'Multisensory Learning',
    ],
    []
  );

  const suggestedSkills = useMemo(() => {
    const q = skillDraft.trim().toLowerCase();
    if (!q) return [];
    return SKILL_SUGGESTIONS.filter((s) => s.toLowerCase().includes(q))
      .filter((s) => !resumeData.skills.some((x) => x.toLowerCase() === s.toLowerCase()))
      .slice(0, 6);
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

  const projectsComplete = useMemo(
    () =>
      resumeData.projects.length > 0 &&
      resumeData.projects.every(
        (p) => isFilled(p.name) && isFilled(p.description) && isFilled(p.techStack)
      ),
    [resumeData.projects]
  );

  const completionPct = useMemo(() => {
    let count = 0;
    if (personalComplete) count += 25;
    if (educationComplete) count += 25;
    if (skillsComplete) count += 25;
    if (projectsComplete) count += 25;
    return count;
  }, [personalComplete, educationComplete, skillsComplete, projectsComplete]);

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
    if (started) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ resumeData, template }));
    }
  }, [resumeData, template, started]);

  const toggleMic = (fieldId: string, onResult: (text: string) => void) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (activeMicField === fieldId) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setActiveMicField(null);
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
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
    if (!name || resumeData.skills.some((s) => s.toLowerCase() === name.toLowerCase())) return;
    setResumeData((prev) => ({ ...prev, skills: [...prev.skills, name] }));
    setSkillDraft('');
  };

  const removeSkill = (name: string) =>
    setResumeData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== name) }));

  const addProject = () =>
    setResumeData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: createId(),
          name: '',
          description: '',
          techStack: '',
          link: '',
          reportFileName: '',
        },
      ],
    }));

  const updateProject = (id: string, patch: Partial<ProjectItem>) =>
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));

  const deleteProject = (id: string) =>
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));

  const nextDisabled =
    (stepIndex === 0 && !personalComplete) ||
    (stepIndex === 1 && !educationComplete) ||
    (stepIndex === 2 && !skillsComplete) ||
    (stepIndex === 3 && !projectsComplete) ||
    stepIndex === 6;

  const handleNext = () => setStepIndex((s) => Math.min(6, s + 1));
  const handleBack = () => setStepIndex((s) => Math.max(0, s - 1));

  const getFileName = () => {
    const safe = (resumeData.personal.name || 'Resume')
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '');
    return `${safe}_Resume.pdf`;
  };

  const downloadPDF = async () => {
    const element =
      document.getElementById('resume-preview-content') ||
      document.getElementById('resume-container');
    if (!element) {
      alert('Resume preview not found. Please make sure the preview is visible.');
      return;
    }

    let exportElement: HTMLElement | null = null;
    try {
      exportElement = element.cloneNode(true) as HTMLElement;
      exportElement.id = 'resume-pdf-export';
      exportElement.style.position = 'fixed';
      exportElement.style.left = '-10000px';
      exportElement.style.top = '0';
      exportElement.style.width = `${Math.max(element.getBoundingClientRect().width, 760)}px`;
      exportElement.style.backgroundColor = '#ffffff';

      const styleProperties = [
        'color',
        'background-color',
        'background-image',
        'font',
        'font-family',
        'font-size',
        'font-weight',
        'line-height',
        'letter-spacing',
        'display',
        'width',
        'height',
        'margin',
        'padding',
        'border',
        'border-radius',
        'text-align',
        'white-space',
        'vertical-align',
      ] as const;

      const sourceNodes = [element, ...Array.from(element.querySelectorAll('*'))];
      const exportNodes = [exportElement, ...Array.from(exportElement.querySelectorAll('*'))];
      sourceNodes.forEach((sourceNode, index) => {
        const targetNode = exportNodes[index] as HTMLElement;
        const computed = window.getComputedStyle(sourceNode);
        styleProperties.forEach((property) =>
          targetNode.style.setProperty(property, computed.getPropertyValue(property))
        );
      });

      document.body.appendChild(exportElement);
      const opt = {
        margin: 0.35,
        filename: getFileName(),
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: false,
          allowTaint: false,
          foreignObjectRendering: false,
          backgroundColor: '#ffffff',
          logging: false,
          onclone: (clonedDocument: Document) => {
            clonedDocument
              .querySelectorAll('style, link[rel="stylesheet"]')
              .forEach((node) => node.remove());
            const clonedElement = clonedDocument.getElementById('resume-pdf-export');
            clonedElement?.querySelectorAll('*').forEach((node) => node.removeAttribute('class'));
          },
        },
        jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const },
        pagebreak: { mode: ['css', 'legacy'] },
      };

      const pdfFactory =
        (html2pdf as unknown as { default?: typeof html2pdf }).default || html2pdf;
      await pdfFactory().set(opt).from(exportElement).save();
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      exportElement?.remove();
    }
  };

  const saveResumeToDB = async () => {
    if (!user?.email) {
      alert('Please log in to save your resume to your profile.');
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
          template,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleApply = () => {
    if (!canApply) return;
    localStorage.setItem(
      'neurobridge-apply-resume',
      JSON.stringify({ resumeData, template, createdAt: Date.now() })
    );
    navigate('/dashboard/opportunities', { state: { resumeData, template } as any });
  };

  const renderStep = () => {
    switch (stepIndex) {
      case 0:
        return (
          <SectionShell
            title="Step 1 — Personal Details"
            subtitle="Fill in your contact information. Type or click Voice for speech-to-text."
          >
            <div className="grid md:grid-cols-2 gap-4">
              <ModernInputField
                label="Full Name"
                value={resumeData.personal.name}
                onChange={(v) =>
                  setResumeData((p) => ({ ...p, personal: { ...p.personal, name: v } }))
                }
                placeholder="e.g. Omkar Dinde"
                onMicClick={() =>
                  toggleMic('personal-name', (t) =>
                    setResumeData((p) => ({
                      ...p,
                      personal: {
                        ...p.personal,
                        name: p.personal.name ? `${p.personal.name} ${t}` : t,
                      },
                    }))
                  )
                }
                listening={activeMicField === 'personal-name'}
              />
              <ModernInputField
                label="Email Address"
                value={resumeData.personal.email}
                onChange={(v) =>
                  setResumeData((p) => ({ ...p, personal: { ...p.personal, email: v } }))
                }
                placeholder="you@example.com"
                onMicClick={() =>
                  toggleMic('personal-email', (t) =>
                    setResumeData((p) => ({
                      ...p,
                      personal: {
                        ...p.personal,
                        email: p.personal.email ? `${p.personal.email} ${t}` : t,
                      },
                    }))
                  )
                }
                listening={activeMicField === 'personal-email'}
              />
              <ModernInputField
                label="Phone Number"
                value={resumeData.personal.phone}
                onChange={(v) =>
                  setResumeData((p) => ({ ...p, personal: { ...p.personal, phone: v } }))
                }
                placeholder="+91 9876543210"
                onMicClick={() =>
                  toggleMic('personal-phone', (t) =>
                    setResumeData((p) => ({
                      ...p,
                      personal: {
                        ...p.personal,
                        phone: p.personal.phone ? `${p.personal.phone} ${t}` : t,
                      },
                    }))
                  )
                }
                listening={activeMicField === 'personal-phone'}
              />
              <ModernInputField
                label="Location / City"
                value={resumeData.personal.location}
                onChange={(v) =>
                  setResumeData((p) => ({ ...p, personal: { ...p.personal, location: v } }))
                }
                placeholder="City, State"
                onMicClick={() =>
                  toggleMic('personal-location', (t) =>
                    setResumeData((p) => ({
                      ...p,
                      personal: {
                        ...p.personal,
                        location: p.personal.location ? `${p.personal.location} ${t}` : t,
                      },
                    }))
                  )
                }
                listening={activeMicField === 'personal-location'}
              />
            </div>
          </SectionShell>
        );

      case 1:
        return (
          <SectionShell
            title="Step 2 — Education"
            subtitle="Add your educational background and credentials."
          >
            <div className="grid md:grid-cols-2 gap-4">
              <ModernInputField
                label="Degree / Major"
                value={resumeData.education.degree}
                onChange={(v) =>
                  setResumeData((p) => ({ ...p, education: { ...p.education, degree: v } }))
                }
                placeholder="B.Tech Computer Engineering / B.Sc"
                onMicClick={() =>
                  toggleMic('education-degree', (t) =>
                    setResumeData((p) => ({
                      ...p,
                      education: {
                        ...p.education,
                        degree: p.education.degree ? `${p.education.degree} ${t}` : t,
                      },
                    }))
                  )
                }
                listening={activeMicField === 'education-degree'}
              />
              <ModernInputField
                label="College / University"
                value={resumeData.education.college}
                onChange={(v) =>
                  setResumeData((p) => ({ ...p, education: { ...p.education, college: v } }))
                }
                placeholder="College or University Name"
                onMicClick={() =>
                  toggleMic('education-college', (t) =>
                    setResumeData((p) => ({
                      ...p,
                      education: {
                        ...p.education,
                        college: p.education.college ? `${p.education.college} ${t}` : t,
                      },
                    }))
                  )
                }
                listening={activeMicField === 'education-college'}
              />
              <ModernInputField
                label="Graduation Year"
                value={resumeData.education.year}
                onChange={(v) =>
                  setResumeData((p) => ({ ...p, education: { ...p.education, year: v } }))
                }
                placeholder="2026"
                onMicClick={() =>
                  toggleMic('education-year', (t) =>
                    setResumeData((p) => ({
                      ...p,
                      education: {
                        ...p.education,
                        year: p.education.year ? `${p.education.year} ${t}` : t,
                      },
                    }))
                  )
                }
                listening={activeMicField === 'education-year'}
              />
              <ModernInputField
                label="CGPA / Percentage"
                value={resumeData.education.cgpa}
                onChange={(v) =>
                  setResumeData((p) => ({ ...p, education: { ...p.education, cgpa: v } }))
                }
                placeholder="8.5 / 85%"
                onMicClick={() =>
                  toggleMic('education-cgpa', (t) =>
                    setResumeData((p) => ({
                      ...p,
                      education: {
                        ...p.education,
                        cgpa: p.education.cgpa ? `${p.education.cgpa} ${t}` : t,
                      },
                    }))
                  )
                }
                listening={activeMicField === 'education-cgpa'}
              />
            </div>
          </SectionShell>
        );

      case 2:
        return (
          <SectionShell
            title="Step 3 — Skills & Strengths"
            subtitle="Highlight your technical skills and neuro-inclusive problem solving strengths."
          >
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <ModernInputField
                  label="Add a Skill"
                  value={skillDraft}
                  onChange={setSkillDraft}
                  placeholder="Type or click Voice to speak a skill"
                  onMicClick={() =>
                    toggleMic('skills', (t) => setSkillDraft((prev) => (prev ? `${prev} ${t}` : t)))
                  }
                  listening={activeMicField === 'skills'}
                />
              </div>
              <button
                type="button"
                onClick={() => addSkill(skillDraft)}
                disabled={!isFilled(skillDraft)}
                className="h-10 px-5 rounded-2xl bg-[#2563EB] text-white font-bold text-xs hover:bg-[#1D4ED8] transition-colors disabled:opacity-40 cursor-pointer shrink-0"
              >
                Add Skill
              </button>
            </div>

            {suggestedSkills.length > 0 && (
              <div className="mt-3">
                <span className="text-[11px] font-bold text-[#64748B] block mb-1.5">
                  Suggested Suggestions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedSkills.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addSkill(s)}
                      className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[#1A202C] font-bold text-xs hover:bg-blue-50 hover:text-[#2563EB] hover:border-blue-200 transition-colors cursor-pointer"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-[#1A202C] block mb-2">Your Skills ({resumeData.skills.length})</span>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100 text-xs font-bold"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSkill(s)}
                      className="w-4 h-4 rounded-full bg-white text-slate-500 hover:text-red-500 flex items-center justify-center cursor-pointer ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {resumeData.skills.length === 0 && (
                  <p className="text-xs text-[#94A3B8] italic">No skills added yet. Add at least 1 skill to proceed.</p>
                )}
              </div>
            </div>
          </SectionShell>
        );

      case 3:
        return (
          <SectionShell
            title="Step 4 — Projects & Experience"
            subtitle="Add your key practical projects, internships, or leadership roles."
          >
            <div className="space-y-4">
              {/* Experience Box */}
              <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200/80 p-5 space-y-3">
                <div className="text-xs font-extrabold text-[#1A202C] uppercase tracking-wider">
                  Experience (Optional)
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <ModernInputField
                    label="Internship"
                    value={resumeData.experience.internship}
                    onChange={(v) =>
                      setResumeData((p) => ({
                        ...p,
                        experience: { ...p.experience, internship: v },
                      }))
                    }
                    placeholder="e.g. Web Dev Intern"
                    onMicClick={() =>
                      toggleMic('exp-internship', (t) =>
                        setResumeData((p) => ({
                          ...p,
                          experience: {
                            ...p.experience,
                            internship: p.experience.internship
                              ? `${p.experience.internship} ${t}`
                              : t,
                          },
                        }))
                      )
                    }
                    listening={activeMicField === 'exp-internship'}
                  />
                  <ModernInputField
                    label="Organization / Project"
                    value={resumeData.experience.project}
                    onChange={(v) =>
                      setResumeData((p) => ({
                        ...p,
                        experience: { ...p.experience, project: v },
                      }))
                    }
                    placeholder="Company / Org Name"
                    onMicClick={() =>
                      toggleMic('exp-project', (t) =>
                        setResumeData((p) => ({
                          ...p,
                          experience: {
                            ...p.experience,
                            project: p.experience.project ? `${p.experience.project} ${t}` : t,
                          },
                        }))
                      )
                    }
                    listening={activeMicField === 'exp-project'}
                  />
                  <ModernInputField
                    label="Key Role"
                    value={resumeData.experience.role}
                    onChange={(v) =>
                      setResumeData((p) => ({
                        ...p,
                        experience: { ...p.experience, role: v },
                      }))
                    }
                    placeholder="Frontend / Research"
                    onMicClick={() =>
                      toggleMic('exp-role', (t) =>
                        setResumeData((p) => ({
                          ...p,
                          experience: {
                            ...p.experience,
                            role: p.experience.role ? `${p.experience.role} ${t}` : t,
                          },
                        }))
                      )
                    }
                    listening={activeMicField === 'exp-role'}
                  />
                </div>
              </div>

              {/* Projects List */}
              {resumeData.projects.map((p, idx) => (
                <div
                  key={p.id}
                  className="rounded-2xl bg-[#F8FAFC] border border-slate-200/80 p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#1A202C]">Project #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => deleteProject(p.id)}
                      className="p-1.5 rounded-xl hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <ModernInputField
                    label="Project Title"
                    value={p.name}
                    onChange={(v) => updateProject(p.id, { name: v })}
                    placeholder="e.g. Accessible Reader App"
                    onMicClick={() =>
                      toggleMic(`project-title-${p.id}`, (t) =>
                        updateProject(p.id, { name: p.name ? `${p.name} ${t}` : t })
                      )
                    }
                    listening={activeMicField === `project-title-${p.id}`}
                  />
                  <ModernInputField
                    label="Project Description"
                    value={p.description}
                    onChange={(v) => updateProject(p.id, { description: v })}
                    placeholder="Describe what you built and the impact"
                    onMicClick={() =>
                      toggleMic(`project-desc-${p.id}`, (t) =>
                        updateProject(p.id, {
                          description: p.description ? `${p.description} ${t}` : t,
                        })
                      )
                    }
                    listening={activeMicField === `project-desc-${p.id}`}
                  />
                  <ModernInputField
                    label="Tech Stack"
                    value={p.techStack}
                    onChange={(v) => updateProject(p.id, { techStack: v })}
                    placeholder="e.g. React, TypeScript, Node.js"
                    onMicClick={() =>
                      toggleMic(`project-tech-${p.id}`, (t) =>
                        updateProject(p.id, {
                          techStack: p.techStack ? `${p.techStack} ${t}` : t,
                        })
                      )
                    }
                    listening={activeMicField === `project-tech-${p.id}`}
                  />
                  <ModernInputField
                    label="Project Link (Optional)"
                    value={p.link || ''}
                    onChange={(v) => updateProject(p.id, { link: v })}
                    placeholder="GitHub URL or live website link"
                  />

                  {/* Project attachment */}
                  <div className="pt-2 flex items-center gap-2.5 flex-wrap">
                    <input
                      ref={(el) => {
                        fileRefs.current[p.id] = el;
                      }}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.type !== 'application/pdf') {
                          alert('Please upload PDF only.');
                          e.target.value = '';
                          return;
                        }
                        updateProject(p.id, { reportFileName: file.name });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileRefs.current[p.id]?.click()}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-[#1A202C] text-xs font-bold hover:border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload size={13} />
                      <span>Upload Project Report PDF</span>
                    </button>
                    {p.reportFileName && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100 text-xs font-bold">
                        📄 {p.reportFileName}
                        <button
                          type="button"
                          onClick={() => updateProject(p.id, { reportFileName: '' })}
                          className="hover:text-red-500 cursor-pointer"
                        >
                          <X size={13} />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addProject}
                className="w-full py-3.5 rounded-2xl bg-blue-50/80 hover:bg-blue-100 border border-blue-200/80 text-[#2563EB] font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={16} />
                <span>Add Project Entry</span>
              </button>
            </div>
          </SectionShell>
        );

      case 4:
        return (
          <SectionShell
            title="Step 5 — Preview & Fine-Tune"
            subtitle="Check your formatting and switch templates using the top selector."
          >
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center gap-3 text-xs text-[#2563EB]">
                <Sparkles size={18} className="shrink-0" />
                <span>
                  Your resume is rendered live in real-time. Use the top template selector to compare formatting styles.
                </span>
              </div>
            </div>
          </SectionShell>
        );

      case 5:
        return (
          <SectionShell
            title="Step 6 — Download & Export"
            subtitle="Download your ATS-formatted PDF or save the resume to your student profile."
          >
            <div className="space-y-3">
              <button
                type="button"
                onClick={downloadPDF}
                className="w-full py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={16} />
                <span>Download High-Resolution PDF</span>
              </button>

              <button
                type="button"
                onClick={saveResumeToDB}
                disabled={saveStatus === 'saving'}
                className={`w-full py-3.5 rounded-2xl border font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  saveStatus === 'success'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : saveStatus === 'error'
                    ? 'bg-red-50 border-red-500 text-red-700'
                    : 'bg-white border-blue-200 text-[#2563EB] hover:bg-blue-50'
                }`}
              >
                {saveStatus === 'saving' ? (
                  <span>Saving to profile…</span>
                ) : saveStatus === 'success' ? (
                  <span>Resume saved to profile!</span>
                ) : saveStatus === 'error' ? (
                  <span>Error saving resume</span>
                ) : (
                  <>
                    <Save size={16} /> <span>Save to Student Profile</span>
                  </>
                )}
              </button>
            </div>
          </SectionShell>
        );

      case 6:
        return (
          <SectionShell
            title="Step 7 — Match Opportunities"
            subtitle="Your resume is complete. Apply directly to curated neuro-inclusive jobs and internships."
          >
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleApply}
                disabled={!canApply}
                className="w-full py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Briefcase size={16} />
                <span>Apply to Matched Opportunities</span>
              </button>
              {!canApply && (
                <p className="text-xs text-[#64748B] text-center">
                  Complete Personal Details, Education, and Skills to apply.
                </p>
              )}
            </div>
          </SectionShell>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-7 pb-12 animate-in fade-in duration-200">
      {/* ─── 1. PAGE HEADER ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] p-2.5 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <FileText size={24} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-2xl font-black text-[#1A202C] tracking-tight">
                Build your resume
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#2563EB] border border-blue-100">
                <Sparkles size={11} /> ATS Optimized
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] font-medium truncate">
              Create a clear, professional resume that highlights your strengths and experience.
            </p>
          </div>
        </div>

        {/* Template Switcher Chips */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl shrink-0">
          {(
            [
              { id: 'minimal', label: 'Minimalist' },
              { id: 'soft', label: 'Modern Soft' },
              { id: 'student', label: 'Student Focus' },
            ] as { id: ThemeType; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTemplate(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                template === t.id
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#1A202C]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ─── 2. RESUME PROGRESS OVERVIEW CARD ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-3xl p-5 sm:p-6 border border-blue-100/80 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#1A202C] uppercase tracking-wider">
            Resume Completion
          </span>
          <span className="text-xs font-black text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
            {completionPct}% Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA] rounded-full transition-all duration-700"
            style={{ width: `${completionPct}%` }}
          />
        </div>

        {/* Section Checklist Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
              personalComplete
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            {personalComplete ? <CheckCircle2 size={13} /> : <Circle size={13} />} Personal Details
          </span>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
              educationComplete
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            {educationComplete ? <CheckCircle2 size={13} /> : <Circle size={13} />} Education
          </span>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
              skillsComplete
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            {skillsComplete ? <CheckCircle2 size={13} /> : <Circle size={13} />} Skills & Strengths
          </span>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
              projectsComplete
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            {projectsComplete ? <CheckCircle2 size={13} /> : <Circle size={13} />} Projects
          </span>
        </div>
      </motion.div>

      {/* ─── 3. GUIDED STEPPERS ────────────────────────────────────────── */}
      {started && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StepNavigation
            currentStep={stepIndex}
            steps={STEPS}
            onStepClick={(i) => setStepIndex(i)}
          />
        </motion.div>
      )}

      {/* ─── 4. TWO-COLUMN WORKSPACE: EDITOR & LIVE PREVIEW ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Column: Form Editor (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!started ? (
            <SectionShell
              title="Start Your Resume Workspace"
              subtitle="Choose whether you want to edit your existing draft or create a fresh resume."
            >
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
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
                  }}
                  className="px-6 py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
                >
                  Continue Editing Resume
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setResumeData(initialResumeData);
                    setTemplate('minimal');
                    setStepIndex(0);
                    localStorage.removeItem(STORAGE_KEY);
                    setStarted(true);
                  }}
                  className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-[#1A202C] font-bold text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Create Fresh Resume
                </button>
              </div>
            </SectionShell>
          ) : (
            <>
              {renderStep()}

              {/* Step Navigation Actions */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={stepIndex === 0}
                  className="px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-[#1A202C] font-bold text-xs sm:text-sm hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <ArrowLeft size={15} />
                  <span>Previous Step</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={nextDisabled}
                  className="px-6 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Next Step</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              {activeMicField && (
                <div className="text-xs font-bold text-[#2563EB] bg-blue-50 p-3 rounded-2xl border border-blue-100 animate-pulse">
                  🎙️ Voice input active. Speak clearly into your microphone, then click Voice again to finish.
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column: Sticky Live Paper Preview (5 Cols) */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="h-[620px]">
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
    </div>
  );
};
