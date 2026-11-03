import { Eye, RotateCcw, Type, Volume2 } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import type { ContentWidth, LetterSpacing, LineSpacing } from '../../contexts/DyslexiaContext';

export function AccessibilityPreferences() {
  const {
    isDyslexiaMode,
    toggleDyslexiaMode,
    textSize,
    setTextSize,
    lineSpacing,
    setLineSpacing,
    letterSpacing,
    setLetterSpacing,
    highContrast,
    setHighContrast,
    reduceMotion,
    setReduceMotion,
    contentWidth,
    setContentWidth,
    audioSpeed,
    setAudioSpeed,
    resetVisualPreferences,
  } = useDyslexia();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#1A202C]">Accessibility preferences</h2>
          <p className="mt-1 text-sm text-[#64748B]">Adjust reading and display settings to suit you.</p>
        </div>
        <button
          type="button"
          onClick={resetVisualPreferences}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#475569] transition hover:bg-slate-50"
        >
          <RotateCcw size={14} />
          Reset defaults
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <Type size={18} className="text-blue-600" />
          <h3 className="font-bold text-[#1A202C]">Reading</h3>
        </div>

        <div className="space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="settings-text-size" className="text-sm font-semibold text-[#334155]">Text size</label>
              <span className="text-sm font-bold text-blue-700">{textSize}%</span>
            </div>
            <input
              id="settings-text-size"
              type="range"
              min="80"
              max="140"
              step="10"
              value={textSize}
              onChange={(event) => setTextSize(Number(event.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <ChoiceSetting
            label="Line spacing"
            value={lineSpacing}
            values={['normal', 'comfortable', 'spacious'] as LineSpacing[]}
            onChange={setLineSpacing}
          />
          <ChoiceSetting
            label="Letter spacing"
            value={letterSpacing}
            values={['normal', 'comfortable', 'wide'] as LetterSpacing[]}
            onChange={setLetterSpacing}
          />
          <ChoiceSetting
            label="Reading width"
            value={contentWidth}
            values={['normal', 'comfortable', 'narrow'] as ContentWidth[]}
            onChange={setContentWidth}
          />

          <ToggleSetting
            label="Dyslexia-friendly font"
            description="Use the OpenDyslexic font."
            value={isDyslexiaMode}
            onChange={toggleDyslexiaMode}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <Eye size={18} className="text-purple-600" />
          <h3 className="font-bold text-[#1A202C]">Display comfort</h3>
        </div>
        <div className="space-y-4">
          <ToggleSetting
            label="High contrast"
            description="Increase contrast between text and backgrounds."
            value={highContrast}
            onChange={() => setHighContrast(!highContrast)}
          />
          <ToggleSetting
            label="Reduce motion"
            description="Minimize animations and transitions."
            value={reduceMotion}
            onChange={() => setReduceMotion(!reduceMotion)}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <Volume2 size={18} className="text-emerald-600" />
          <h3 className="font-bold text-[#1A202C]">Narration speed</h3>
        </div>
        <ChoiceSetting
          label="Reading aloud"
          value={audioSpeed}
          values={[0.75, 1, 1.25, 1.5]}
          format={(speed) => `${speed}×`}
          onChange={setAudioSpeed}
        />
      </section>
    </div>
  );
}

function ChoiceSetting<T extends string | number>({
  label,
  value,
  values,
  onChange,
  format = (option) => String(option),
}: {
  label: string;
  value: T;
  values: T[];
  onChange: (value: T) => void;
  format?: (value: T) => string;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-[#334155]">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {values.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold capitalize transition ${
              value === option
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300'
            }`}
          >
            {format(option)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function ToggleSetting({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-[#334155]">{label}</p>
        <p className="mt-0.5 text-xs text-[#64748B]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}
