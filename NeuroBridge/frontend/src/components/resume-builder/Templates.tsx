import React from 'react';
import type { ResumeData } from './types';

interface TemplateProps {
  data: ResumeData;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[12px] uppercase tracking-widest text-gray-500 mb-2">
      {children}
    </div>
  );
}

function ContactLine({ data }: { data: ResumeData }) {
  const parts = [data.personal.email, data.personal.phone, data.personal.location].filter(Boolean);
  return (
    <div className="text-[12px] text-gray-600 leading-relaxed">
      {parts.join(' • ')}
    </div>
  );
}

export const TemplateMinimal: React.FC<TemplateProps> = ({ data }) => (
  <div id="resume-preview-content" className="bg-white min-h-full p-10 text-gray-900 leading-relaxed" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}>
    <header className="mb-8">
      <div className="text-3xl font-black tracking-tight">{data.personal.name || 'Your Name'}</div>
      <ContactLine data={data} />
    </header>

    <div className="space-y-7">
      <section>
        <SectionTitle>Education</SectionTitle>
        <div className="text-sm text-gray-800">
          <div className="font-bold">{data.education.degree || 'Degree'}</div>
          <div className="text-gray-600">{data.education.college || 'College'} • {data.education.year || 'Year'} • CGPA {data.education.cgpa || '-'}</div>
        </div>
      </section>

      <section>
        <SectionTitle>Skills</SectionTitle>
        <div className="text-sm text-gray-800">
          {(data.skills.length ? data.skills : ['Add skills…']).join(', ')}
        </div>
      </section>

      {data.experience.internship || data.experience.project || data.experience.role ? (
        <section>
          <SectionTitle>Experience</SectionTitle>
          <div className="text-sm text-gray-800 space-y-1">
            {data.experience.internship && <div><span className="font-bold">Internship:</span> {data.experience.internship}</div>}
            {data.experience.project && <div><span className="font-bold">Project:</span> {data.experience.project}</div>}
            {data.experience.role && <div><span className="font-bold">Role:</span> {data.experience.role}</div>}
          </div>
        </section>
      ) : null}

      <section>
        <SectionTitle>Projects</SectionTitle>
        <div className="space-y-3">
          {(data.projects.length ? data.projects : [{ id: 'empty', name: 'Add a project…', description: '', techStack: '' }]).map((p) => (
            <div key={p.id}>
              <div className="text-sm font-bold">{p.name}</div>
              {p.description && <div className="text-[12px] text-gray-600">{p.description}</div>}
              {p.techStack && <div className="text-[12px] text-gray-600">Tech: {p.techStack}</div>}
              {p.link && <div className="text-[12px] text-blue-700">Link: {p.link}</div>}
              {p.reportFileName && <div className="text-[12px] text-gray-500">Report: {p.reportFileName}</div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  </div>
);

export const TemplateSoft: React.FC<TemplateProps> = ({ data }) => (
  <div id="resume-preview-content" className="bg-white min-h-full p-10 text-gray-900 leading-relaxed" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}>
    <header className="mb-8">
      <div className="text-3xl font-black tracking-tight">{data.personal.name || 'Your Name'}</div>
      <div className="mt-2 h-px bg-gray-100" />
      <div className="mt-3"><ContactLine data={data} /></div>
    </header>

    <div className="grid grid-cols-[140px_1fr] gap-8">
      <div className="space-y-6">
        <section>
          <SectionTitle>Skills</SectionTitle>
          <div className="text-[12px] text-gray-800 space-y-1">
            {(data.skills.length ? data.skills : ['Add skills…']).map((s, idx) => (
              <div key={idx} className="px-2 py-1 rounded-lg bg-gray-50 border border-gray-100">{s}</div>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-7">
        <section>
          <SectionTitle>Education</SectionTitle>
          <div className="text-sm">
            <div className="font-bold">{data.education.degree || 'Degree'}</div>
            <div className="text-gray-600">{data.education.college || 'College'} • {data.education.year || 'Year'}</div>
            <div className="text-gray-600">CGPA {data.education.cgpa || '-'}</div>
          </div>
        </section>

        {data.experience.internship || data.experience.project || data.experience.role ? (
          <section>
            <SectionTitle>Experience</SectionTitle>
            <div className="text-sm text-gray-800 space-y-1">
              {data.experience.internship && <div><span className="font-bold">Internship:</span> {data.experience.internship}</div>}
              {data.experience.project && <div><span className="font-bold">Project:</span> {data.experience.project}</div>}
              {data.experience.role && <div><span className="font-bold">Role:</span> {data.experience.role}</div>}
            </div>
          </section>
        ) : null}

        <section>
          <SectionTitle>Projects</SectionTitle>
          <div className="space-y-3">
            {(data.projects.length ? data.projects : [{ id: 'empty', name: 'Add a project…', description: '', techStack: '' }]).map((p) => (
              <div key={p.id}>
                <div className="text-sm font-bold">{p.name}</div>
                {p.description && <div className="text-[12px] text-gray-600">{p.description}</div>}
                {p.techStack && <div className="text-[12px] text-gray-600">Tech: {p.techStack}</div>}
                {p.link && <div className="text-[12px] text-blue-700">Link: {p.link}</div>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  </div>
);

export const TemplateStudent: React.FC<TemplateProps> = ({ data }) => (
  <div id="resume-preview-content" className="bg-white min-h-full p-10 text-gray-900 leading-relaxed" style={{ fontFamily: 'OpenDyslexic, Inter, system-ui, sans-serif' }}>
    <header className="mb-8">
      <div className="text-3xl font-black tracking-tight">{data.personal.name || 'Your Name'}</div>
      <ContactLine data={data} />
    </header>

    <div className="space-y-7">
      <section>
        <SectionTitle>Projects (highlight)</SectionTitle>
        <div className="space-y-3">
          {(data.projects.length ? data.projects : [{ id: 'empty', name: 'Add a project…', description: '', techStack: '' }]).map((p) => (
            <div key={p.id} className="rounded-xl bg-gray-50 border border-gray-100 p-3">
              <div className="text-sm font-bold">{p.name}</div>
              {p.description && <div className="text-[12px] text-gray-600 mt-0.5">{p.description}</div>}
              {p.techStack && <div className="text-[12px] text-gray-600 mt-1">Tech: {p.techStack}</div>}
              {p.link && <div className="text-[12px] text-blue-700 mt-1">Link: {p.link}</div>}
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Skills</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {(data.skills.length ? data.skills : ['Add skills…']).map((s, idx) => (
            <span key={idx} className="text-[12px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">{s}</span>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Education</SectionTitle>
        <div className="text-sm">
          <div className="font-bold">{data.education.degree || 'Degree'}</div>
          <div className="text-gray-600">{data.education.college || 'College'} • {data.education.year || 'Year'} • CGPA {data.education.cgpa || '-'}</div>
        </div>
      </section>

      {data.experience.internship || data.experience.project || data.experience.role ? (
        <section>
          <SectionTitle>Experience</SectionTitle>
          <div className="text-sm text-gray-800 space-y-1">
            {data.experience.internship && <div><span className="font-bold">Internship:</span> {data.experience.internship}</div>}
            {data.experience.project && <div><span className="font-bold">Project:</span> {data.experience.project}</div>}
            {data.experience.role && <div><span className="font-bold">Role:</span> {data.experience.role}</div>}
          </div>
        </section>
      ) : null}
    </div>
  </div>
);
