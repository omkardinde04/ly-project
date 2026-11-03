import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, RotateCcw, Sparkles } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { FUN_FONTS, FUN_RANGES, weightName, type FunFontId } from '../../utils/funFonts';

/**
 * Fun mode — the reader picks their own font, line spacing, font weight,
 * letter spacing and text size. Every change applies to the whole site in
 * real time (see the `fun-mode` rules in globals.css) and is remembered.
 *
 * variant="popover": a button that opens a dropdown panel (navbar / dashboard).
 * variant="inline":  the same controls laid out flat (mobile menu drawer).
 */
export function FunModeMenu({ variant = 'popover', className = '' }: { variant?: 'popover' | 'inline'; className?: string }) {
  const { isDyslexiaMode: on, isDarkMode } = useDyslexia();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (variant === 'inline') return <FunModePanel />;

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Fun mode reading settings"
        title="Fun mode"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold shadow-2xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40 ${
          on
            ? 'bg-purple-50 border-purple-300 text-purple-700 dark:bg-purple-950/60 dark:border-purple-700 dark:text-purple-300'
            : isDarkMode
              ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
        }`}
      >
        <Sparkles size={14} className={on ? '' : 'text-purple-500'} />
        <span className="hidden 2xl:inline">Fun mode</span>
        {on && <span className="w-1.5 h-1.5 rounded-full bg-purple-500" aria-hidden />}
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Fun mode reading settings"
          className={`absolute right-0 top-full mt-2 w-[22rem] max-w-[calc(100vw-2rem)] max-h-[calc(100svh-6rem)] overflow-y-auto rounded-2xl border p-4 shadow-2xl z-50 ${
            isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
          }`}
        >
          <FunModePanel />
        </div>
      )}
    </div>
  );
}

/** The controls themselves (shared by the dropdown and the inline variant). */
function FunModePanel() {
  const {
    isDyslexiaMode: on,
    toggleDyslexiaMode,
    enableFunMode,
    isDarkMode,
    funFont,
    funLineHeight,
    funWeight,
    funLetterSpacing,
    textSize,
    setFunFont,
    setFunLineHeight,
    setFunWeight,
    setFunLetterSpacing,
    setTextSize,
    resetFunSettings,
  } = useDyslexia();

  // Changing any control switches Fun mode on, so the change is visible right away.
  const change = <T,>(setter: (v: T) => void) => (v: T) => {
    enableFunMode();
    setter(v);
  };

  const label = isDarkMode ? 'text-slate-200' : 'text-slate-800';
  const muted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-4 text-left">
      {/* Header + master switch */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-purple-500" aria-hidden />
          <span className={`text-base font-bold ${label}`}>Fun mode</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Turn Fun mode on or off"
          onClick={toggleDyslexiaMode}
          className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40 ${
            on ? 'bg-purple-600' : isDarkMode ? 'bg-slate-600' : 'bg-slate-300'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${on ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>

      {/* Font picker: every option previews itself */}
      <fieldset>
        <legend className={`text-sm font-semibold mb-2 ${label}`}>Font</legend>
        <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Font">
          {FUN_FONTS.map((f) => {
            const selected = on && funFont === f.id;
            return (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => change<FunFontId>(setFunFont)(f.id)}
                title={f.label}
                data-font-preview
                className={`flex flex-col items-center justify-center gap-0.5 rounded-xl border px-1 py-2 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40 ${
                  selected
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/60 ring-1 ring-purple-500'
                    : isDarkMode
                      ? 'border-slate-700 hover:bg-slate-800'
                      : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className={`text-xl leading-none ${label}`} style={{ fontFamily: f.stack }}>
                  Abc
                </span>
                <span className={`text-[10px] leading-tight truncate max-w-full ${muted}`} style={{ fontFamily: f.stack }}>
                  {f.label}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Live sample using the current settings */}
      <div
        aria-live="polite"
        className={`rounded-xl border px-3 py-2.5 ${isDarkMode ? 'border-slate-700 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}
      >
        <span className={`block text-[11px] font-semibold mb-1 ${muted}`}>Preview</span>
        <span
          data-font-preview
          className={`block ${label}`}
          style={{
            fontFamily: FUN_FONTS.find((f) => f.id === funFont)?.stack,
            lineHeight: funLineHeight,
            fontWeight: funWeight,
            letterSpacing: `${funLetterSpacing}em`,
            fontSize: `${(15 * textSize) / 100}px`,
          }}
        >
          Reading is easier when it fits you. b d p q
        </span>
      </div>

      {/* Sliders */}
      <Slider
        label="Line spacing"
        value={funLineHeight}
        display={`${funLineHeight.toFixed(1)}×`}
        {...FUN_RANGES.lineHeight}
        onChange={change(setFunLineHeight)}
      />
      <Slider
        label="Font weight"
        value={funWeight}
        display={weightName(funWeight)}
        {...FUN_RANGES.weight}
        onChange={change(setFunWeight)}
      />
      <Slider
        label="Letter spacing"
        value={funLetterSpacing}
        display={funLetterSpacing === 0 ? 'Normal' : `+${Math.round(funLetterSpacing * 100)}%`}
        {...FUN_RANGES.letterSpacing}
        onChange={change(setFunLetterSpacing)}
      />
      <Slider
        label="Text size"
        value={textSize}
        display={`${textSize}%`}
        {...FUN_RANGES.textSize}
        onChange={change(setTextSize)}
      />

      <button
        type="button"
        onClick={resetFunSettings}
        className={`w-full flex items-center justify-center gap-2 rounded-xl border py-2 text-sm font-semibold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40 ${
          isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
        }`}
      >
        <RotateCcw size={14} aria-hidden /> Reset to default
      </button>
    </div>
  );
}

function Slider({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: ReactNode;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const { isDarkMode } = useDyslexia();
  const id = useId();
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={id} className={`text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
          {label}
        </label>
        <span className={`text-xs font-bold tabular-nums ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-purple-600 cursor-pointer"
      />
    </div>
  );
}
