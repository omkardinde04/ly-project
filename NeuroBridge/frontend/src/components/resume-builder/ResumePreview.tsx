import React, { useRef } from 'react';
import { Laptop, Save, Download, Check } from 'lucide-react';
import type { ResumeData, ThemeType } from './types';
import { TemplateMinimal, TemplateSoft, TemplateStudent } from './Templates';

interface ResumePreviewProps {
  data: ResumeData;
  theme: ThemeType;
  onSave?: () => void;
  onDownload?: () => void;
  saveStatus?: 'idle' | 'saving' | 'success' | 'error';
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, theme, onSave, onDownload, saveStatus = 'idle' }) => {
  const previewRef = useRef<HTMLDivElement>(null);

  const renderTemplate = () => {
    switch (theme) {
      case 'minimal': return <TemplateMinimal data={data} />;
      case 'soft': return <TemplateSoft data={data} />;
      case 'student': return <TemplateStudent data={data} />;
      default: return <TemplateMinimal data={data} />;
    }
  };

  return (
    <div className="flex flex-col h-full rounded-3xl overflow-hidden bg-surface/ border border-border">
      {/* Toolbar */}
      <div className="px-5 py-4 flex items-center justify-between bg-surface/ backdrop-blur-sm border-b border-white/50 text-text">
        <div className="flex items-center gap-2">
          <Laptop size={18} className="text-blue-600" />
          <span className="font-black tracking-wide text-sm" >Live Preview</span>
        </div>
        <div className="flex items-center gap-2">
          {onDownload && (
            <button
              onClick={onDownload}
              title="Download PDF"
              className="flex items-center justify-center p-2 rounded-full bg-surface border border-border text-text hover:bg-gray-50 transition active:scale-90"
            >
              <Download size={18} />
            </button>
          )}
          <button
            onClick={onSave}
            disabled={saveStatus === 'saving'}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition active:scale-95 ${
              saveStatus === 'success' ? 'bg-green-500 text-white' : 
              'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            
          >
            {saveStatus === 'saving' ? (
              <span className="flex items-center gap-2 px-2">Saving...</span>
            ) : saveStatus === 'success' ? (
              <><Check size={18} /> <span>Saved!</span></>
            ) : (
              <><Save size={18} /> <span>Save PDF</span></>
            )}
          </button>
        </div>
      </div>

      {/* PDF Content Area */}
      <div className="flex-1 overflow-auto p-6 bg-gray-100/30">
        <div 
          ref={previewRef}
          className="w-full max-w-[800px] bg-surface shadow-xl mx-auto origin-top transition-transform duration-300 rounded-lg overflow-hidden border border-border"
          id="resume-container"
        >
          {renderTemplate()}
        </div>
      </div>
    </div>
  );
};
