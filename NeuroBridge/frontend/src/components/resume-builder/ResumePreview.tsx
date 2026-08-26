import React, { useRef } from 'react';
import { Laptop, Save, Download, Check, Sparkles } from 'lucide-react';
import type { ResumeData, ThemeType } from './types';
import { TemplateMinimal, TemplateSoft, TemplateStudent } from './Templates';

interface ResumePreviewProps {
  data: ResumeData;
  theme: ThemeType;
  onSave?: () => void;
  onDownload?: () => void;
  saveStatus?: 'idle' | 'saving' | 'success' | 'error';
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  data,
  theme,
  onSave,
  onDownload,
  saveStatus = 'idle',
}) => {
  const previewRef = useRef<HTMLDivElement>(null);

  const renderTemplate = () => {
    switch (theme) {
      case 'minimal':
        return <TemplateMinimal data={data} />;
      case 'soft':
        return <TemplateSoft data={data} />;
      case 'student':
        return <TemplateStudent data={data} />;
      default:
        return <TemplateMinimal data={data} />;
    }
  };

  return (
    <div className="flex flex-col h-full rounded-3xl overflow-hidden bg-white border border-blue-100/80 shadow-xs">
      {/* Top Toolbar */}
      <div className="px-5 py-3.5 flex items-center justify-between bg-slate-50/70 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100">
            <Laptop size={15} />
          </div>
          <div>
            <span className="font-extrabold text-xs text-[#1A202C]">Live Preview</span>
            <span className="text-[10px] text-[#64748B] font-medium ml-1.5 uppercase">
              · {theme}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              title="Download PDF"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#1A202C] hover:border-blue-200 hover:text-[#2563EB] transition-colors cursor-pointer shadow-2xs"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          )}

          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={saveStatus === 'saving'}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                saveStatus === 'success'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
              }`}
            >
              {saveStatus === 'saving' ? (
                <span>Saving...</span>
              ) : saveStatus === 'success' ? (
                <>
                  <Check size={14} /> <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save size={14} /> <span>Save</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* PDF Paper Content View Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-[#F8FAFC]">
        <div
          ref={previewRef}
          className="w-full max-w-[760px] bg-white shadow-md mx-auto origin-top transition-transform duration-300 rounded-2xl overflow-hidden border border-slate-200/90 text-left"
          id="resume-container"
        >
          {renderTemplate()}
        </div>
      </div>
    </div>
  );
};
