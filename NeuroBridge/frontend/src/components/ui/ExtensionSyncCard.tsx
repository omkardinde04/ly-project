import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Chrome,
  CheckCircle2,
  Download,
  RefreshCw,
  Sliders,
  ExternalLink,
  Power,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Puzzle,
  ToggleRight,
  Pin,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { useExtensionSync } from '../../hooks/useExtensionSync';
import { useNavigate } from 'react-router-dom';

const EXTENSION_ZIP_URL = '/assets/neurobridge-chrome-extension.zip';

interface ExtensionSyncCardProps {
  className?: string;
}

export function ExtensionSyncCard({ className = '' }: ExtensionSyncCardProps) {
  const navigate = useNavigate();
  const { readingProfile, isTestCompleted } = useDyslexia();
  const {
    extensionState,
    syncState,
    extensionVersion,
    isExtensionEnabled,
    syncedLabel,
    syncError,
    syncNow,
    checkStatus,
  } = useExtensionSync();

  const [showSteps, setShowSteps] = useState(false);

  // ── State 1: Assessment not completed ──────────────────────────────────────
  if (!isTestCompleted) {
    return (
      <div className={`rounded-3xl p-6 sm:p-7 border border-slate-200 bg-white shadow-xs text-left ${className}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
              <Lock size={26} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold mb-1">
                <span>Assessment Required</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Personalized Chrome Extension
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-lg mt-0.5">
                Complete the reading assessment to calculate your custom font, spacing, and contrast settings.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/assessment')}
            className="shrink-0 w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Take Assessment</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ── State 2: Assessment completed, extension installed & synced ────────────
  if (extensionState === 'installed' && syncState === 'synced') {
    return (
      <div className={`rounded-3xl p-6 sm:p-7 border border-emerald-200 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white shadow-xs text-left ${className}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/25">
              <CheckCircle2 size={26} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black mb-1">
                <CheckCircle2 size={12} />
                <span>Extension Connected • Profile Synced</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Your Reading Profile is Ready {syncedLabel && <span className="text-emerald-700 text-sm font-bold">({syncedLabel})</span>}
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-lg mt-0.5">
                {isExtensionEnabled ? (
                  <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    NeuroBridge is currently active on webpages you visit.
                  </span>
                ) : (
                  <span>
                    The extension is currently <strong className="text-slate-900">OFF</strong>. Click the NeuroBridge icon in your Chrome toolbar and switch it <strong className="text-emerald-700">ON</strong> whenever you want your reading preferences applied.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => syncNow()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <RefreshCw size={14} />
              <span>Re-sync Profile</span>
            </button>
          </div>
        </div>

        {/* Profile Settings Summary Pills */}
        {readingProfile && (
          <div className="mt-4 pt-4 border-t border-emerald-100 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mr-1">Tuned Settings:</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-900 text-xs font-semibold">
              Font: <strong>{readingProfile.settings.font === 'default' ? 'Page Default' : readingProfile.settings.font}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-900 text-xs font-semibold">
              Text: <strong>{readingProfile.settings.fontSize}%</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-900 text-xs font-semibold">
              Letter spacing: <strong>+{readingProfile.settings.letterSpacing}px</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-900 text-xs font-semibold">
              Line height: <strong>{readingProfile.settings.lineHeight}</strong>
            </span>
          </div>
        )}
      </div>
    );
  }

  // ── State 3: Extension installed, syncing profile ──────────────────────────
  if (extensionState === 'installed' && syncState === 'syncing') {
    return (
      <div className={`rounded-3xl p-6 sm:p-7 border border-blue-200 bg-blue-50/70 shadow-xs text-left ${className}`}>
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 animate-spin">
            <RefreshCw size={24} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black mb-1">
              <span>Transferring Preferences</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Syncing Your Personalized Profile…
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">
              Sending your tailored font, spacing, and contrast settings to the NeuroBridge extension.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── State 4: Extension not detected / Missing ─────────────────────────────
  return (
    <div className={`rounded-3xl p-6 sm:p-7 border border-blue-200 bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-white shadow-xs text-left ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25">
            <Chrome size={26} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black mb-1">
              <CheckCircle2 size={12} />
              <span>Assessment Completed • Extension Unlocked</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Install NeuroBridge Extension
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-lg mt-0.5">
              Download the companion extension to apply your personalized fonts, line spacing, and reading ruler to any website.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <a
            href={EXTENSION_ZIP_URL}
            download="neurobridge-chrome-extension.zip"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download size={16} />
            <span>Download Extension</span>
          </a>
          <button
            type="button"
            onClick={() => checkStatus()}
            className="w-full sm:w-auto px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            title="Check if extension is installed"
          >
            <RefreshCw size={14} />
            <span>Check Status</span>
          </button>
        </div>
      </div>

      {syncError && (
        <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
          {syncError}
        </div>
      )}

      {/* Recommended Settings Preview */}
      {readingProfile && (
        <div className="mt-4 pt-4 border-t border-blue-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              Your Personalized Recommendations:
            </span>
            <button
              type="button"
              onClick={() => setShowSteps(!showSteps)}
              className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer"
            >
              <span>{showSteps ? 'Hide installation guide' : 'How to install (takes 1 min)'}</span>
              {showSteps ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-slate-800 text-xs font-semibold">
              Font: <strong>{readingProfile.settings.font === 'default' ? 'Page Default' : readingProfile.settings.font}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-slate-800 text-xs font-semibold">
              Text size: <strong>{readingProfile.settings.fontSize}%</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-slate-800 text-xs font-semibold">
              Letter spacing: <strong>+{readingProfile.settings.letterSpacing}px</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-slate-800 text-xs font-semibold">
              Line height: <strong>{readingProfile.settings.lineHeight}</strong>
            </span>
          </div>

          {/* Quick installation steps */}
          {showSteps && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 rounded-2xl bg-white border border-blue-100 text-xs space-y-3"
            >
              <h4 className="font-extrabold text-slate-900 flex items-center gap-2">
                <span>3 Quick Steps to Install:</span>
              </h4>
              <ol className="space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                  <span><strong>Download & Unzip:</strong> Click the button above and extract the downloaded ZIP to a folder.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                  <span><strong>Open Extensions:</strong> In Chrome, go to <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">chrome://extensions</code> and turn ON <strong>Developer mode</strong> (top right).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                  <span><strong>Load Folder:</strong> Click <strong>Load unpacked</strong> and select the unzipped folder. Return here and your profile syncs automatically!</span>
                </li>
              </ol>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

