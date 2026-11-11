import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Chrome,
  Download,
  FolderOpen,
  Globe,
  Lock,
  Pin,
  Puzzle,
  Ruler,
  ShieldCheck,
  ToggleRight,
  Type,
} from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';

const ZIP_URL = '/assets/neurobridge-chrome-extension.zip';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay },
});

// What the extension really does (see public/assets/neurobridge-chrome-extension.zip)
const FEATURES = [
  {
    icon: <Type size={20} />,
    title: 'Easy-to-read font',
    text: 'Every website switches to OpenDyslexic, with a little more space between letters and words.',
  },
  {
    icon: <Ruler size={20} />,
    title: 'Reading ruler',
    text: 'A soft yellow band follows your mouse, so you never lose the line you are reading.',
  },
  {
    icon: <Globe size={20} />,
    title: 'Works on any website',
    text: 'Wikipedia, news, school portals, blogs — it turns on by itself on every page you open.',
  },
];

const STEPS = [
  {
    icon: <Download size={18} />,
    title: 'Download the file',
    text: 'Press "Download extension" above. You get a small .zip file.',
  },
  {
    icon: <FolderOpen size={18} />,
    title: 'Unzip it',
    text: 'Double-click the .zip file. Keep the folder it makes somewhere safe, like Documents.',
  },
  {
    icon: <Puzzle size={18} />,
    title: 'Open the extensions page',
    text: 'In Chrome, type chrome://extensions in the address bar and press Enter.',
    code: 'chrome://extensions',
  },
  {
    icon: <ToggleRight size={18} />,
    title: 'Turn on Developer mode',
    text: 'Use the switch in the top-right corner of that page.',
  },
  {
    icon: <FolderOpen size={18} />,
    title: 'Load the folder',
    text: 'Click "Load unpacked" and choose the folder you unzipped.',
  },
  {
    icon: <Pin size={18} />,
    title: 'Pin it',
    text: 'Click the puzzle icon next to the address bar and pin NeuroBridge. Done!',
  },
];

const SAMPLE =
  'Learning is not fixed. With the right tools, reading gets easier. Move your mouse over this text to see the ruler follow the line you are reading.';

function LiveDemo() {
  const [on, setOn] = useState(true);
  const [rulerTop, setRulerTop] = useState<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const move = (clientY: number) => {
    const box = boxRef.current?.getBoundingClientRect();
    if (box) setRulerTop(Math.max(0, Math.min(box.height - 36, clientY - box.top - 18)));
  };

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Browser bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border bg-surface-2">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
        </div>
        <span className="text-xs text-text-muted font-semibold truncate">any-website.com</span>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          onClick={() => setOn((v) => !v)}
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
            on ? 'bg-[#2563EB] border-[#2563EB] text-white' : 'bg-surface border-border text-text-muted'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${on ? 'bg-white' : 'bg-slate-400'}`} aria-hidden />
          {on ? 'Helper on' : 'Helper off'}
        </button>
      </div>

      {/* Page */}
      <div
        ref={boxRef}
        onMouseMove={(e) => move(e.clientY)}
        onTouchMove={(e) => move(e.touches[0].clientY)}
        onMouseLeave={() => setRulerTop(null)}
        className="relative p-6 sm:p-8 min-h-[11rem]"
        data-font-preview
      >
        {on && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 h-9 bg-yellow-200/30 border-y-2 border-yellow-500/70 transition-[top] duration-75"
            style={{ top: rulerTop ?? 22 }}
          />
        )}
        <p
          className="relative text-text"
          style={
            on
              ? { fontFamily: "'OpenDyslexic', sans-serif", letterSpacing: '0.05em', wordSpacing: '0.1em', fontSize: '1.05rem', lineHeight: 2.1 }
              : { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '1rem', lineHeight: 1.6 }
          }
        >
          {SAMPLE}
        </p>
      </div>
    </div>
  );
}

export function ChromeExtensionPage() {
  const navigate = useNavigate();
  const { isDyslexiaMode, isTestCompleted } = useDyslexia();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* ── Header ── */}
      <motion.div {...fade(0)} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-coral-soft text-coral font-bold text-sm px-4 py-1.5 rounded-full mb-3">
            <Chrome size={16} /> Chrome extension
          </div>
          <h1 className={`font-black text-text leading-tight ${isDyslexiaMode ? 'text-4xl' : 'text-4xl md:text-5xl'}`}>
            Read any website your way.
          </h1>
          <p className="text-text-muted text-lg mt-3 max-w-xl leading-relaxed">
            The free NeuroBridge Reading Companion brings an easy-to-read font and a reading ruler to every page you open.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {isTestCompleted ? (
              <a
                href={ZIP_URL}
                download="neurobridge-chrome-extension.zip"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download size={18} /> Download extension
              </a>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/assessment')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Lock size={16} /> Take the test to unlock <ArrowRight size={16} />
              </button>
            )}
            <a href="#install" className="px-5 py-3 rounded-2xl border border-border bg-surface text-text font-bold text-sm hover:bg-surface-2 transition-colors">
              How to install
            </a>
          </div>
          <p className="mt-3 text-xs text-text-muted font-medium">
            {isTestCompleted
              ? 'Free · For Google Chrome, Microsoft Edge and Brave on a computer'
              : 'Free · Unlocks when you finish the 15-minute test'}
          </p>
        </div>

        <LiveDemo />
      </motion.div>

      {/* ── What it does ── */}
      <motion.div {...fade(0.1)}>
        <h2 className="text-2xl font-bold text-text mb-4">What it does</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-surface rounded-2xl border border-border shadow-sm p-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center mb-3">
                {f.icon}
              </div>
              <h3 className="font-bold text-text mb-1" style={{ fontSize: '1rem', lineHeight: 1.4 }}>{f.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Install ── */}
      <motion.div {...fade(0.2)} id="install" className="scroll-mt-24 bg-surface rounded-2xl border border-border shadow-sm p-6">
        <h2 className="text-2xl font-bold text-text mb-1">How to install</h2>
        <p className="text-text-muted text-sm mb-5">Takes about 2 minutes. You only do this once.</p>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="bg-surface-2 rounded-xl border border-border p-4 flex gap-3">
              <span className="w-8 h-8 rounded-full bg-[#2563EB] text-white text-sm font-black flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <div className="min-w-0">
                <h3 className="font-bold text-text flex items-center gap-1.5" style={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                  <span className="text-[#2563EB]" aria-hidden>
                    {s.icon}
                  </span>
                  {s.title}
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">{s.text}</p>
                {s.code && (
                  <code className="mt-2 inline-block px-2 py-1 rounded-md bg-surface border border-border text-xs font-bold text-text select-all">
                    {s.code}
                  </code>
                )}
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-text-muted">
          Using Microsoft Edge or Brave? Open <code className="font-bold">edge://extensions</code> or{' '}
          <code className="font-bold">brave://extensions</code> instead. To pause the helper, switch it off on the same page.
        </p>
      </motion.div>

      {/* ── Privacy ── */}
      <motion.div {...fade(0.3)} className="bg-surface rounded-2xl border border-border shadow-sm p-6 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 items-start">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text mb-2">Safe and private</h2>
          <ul className="space-y-2 text-sm text-text">
            {[
              'It only changes how pages look on your screen.',
              'It does not collect or save anything you type or read.',
              'No account or sign-in is needed inside the extension.',
            ].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
