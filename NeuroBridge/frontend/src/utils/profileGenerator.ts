/**
 * NeuroBridge Reading Profile Generator
 * 
 * Generates a structured, versioned, personalized reading profile based on assessment results.
 * This is the single source of truth contract shared between the NeuroBridge website
 * and the NeuroBridge Chrome Extension.
 *
 * Scoring Directions:
 * - Assessment Performance / Cognitive Skills: 0–100, HIGHER = BETTER performance
 * - Support Needs / Difficulties: 0–100, HIGHER = MORE SUPPORT NEEDED
 *   Formula: supportNeed = clamp(100 - skillScore, 0, 100)
 * - Indicator Score: 0–100, HIGHER = MORE SUPPORT NEEDED (already inverted from performance)
 */

import type { CognitiveDimension, MeasuredCognitiveProfile, AssessmentSeverity } from './assessmentScoring';
import { getAssessmentSeverity } from './assessmentScoring';

export const PROFILE_SCHEMA_VERSION = 1 as const;

export type ExtensionFont = 'default' | 'opendyslexic' | 'atkinson' | 'arial' | 'verdana' | 'tahoma';
export type ExtensionBackground = 'default' | 'white' | 'cream' | 'blue' | 'dark';

export interface ProfileSupportNeeds {
  /** Overall support need indicator (0-100, higher = more support needed) */
  severity: number;
  /** Difficulty distinguishing similar letters (0-100, higher = more confusion) */
  letterConfusion: number;
  /** Difficulty with crowded or packed text (0-100, higher = more crowding difficulty) */
  crowding: number;
  /** Difficulty keeping track across lines (0-100, higher = more tracking difficulty) */
  tracking: number;
  /** Glare and high-contrast visual sensitivity (0-100, higher = more visual stress) */
  visualStress: number;
  /** Reading accuracy percentage (0-100, higher = better accuracy) */
  accuracy: number;
}

export interface ProfileDisplaySettings {
  /** Font family supported by the extension */
  font: ExtensionFont;
  /** Font size percentage (80 - 200, default 100) */
  fontSize: number;
  /** Letter spacing in pixels for extension (0 - 5 px) */
  letterSpacing: number;
  /** Letter spacing in em for website styling (0 - 0.3 em) */
  letterSpacingEm: number;
  /** Word spacing in pixels (0 - 10 px) */
  wordSpacing: number;
  /** Line height multiplier (1.0 - 2.5) */
  lineHeight: number;
  /** Paragraph gap in pixels (0 - 40 px) */
  paragraphSpacing: number;
  /** Font weight (400 - 800) */
  fontWeight: number;
  /** Background theme color */
  background: ExtensionBackground;
}

export interface ProfileVoiceSettings {
  ttsSpeaker: string;
  ttsLang: string;
  ttsPace: number;
  dock: boolean;
}

export interface ProfileReason {
  label: string;
  value: string;
  short?: string;
  why: string;
}

export interface NeuroBridgeReadingProfile {
  schemaVersion: typeof PROFILE_SCHEMA_VERSION;
  generatedAt: string;
  assessmentSeverity: AssessmentSeverity;
  indicatorScore: number;
  supportNeeds: ProfileSupportNeeds;
  settings: ProfileDisplaySettings;
  voice: ProfileVoiceSettings;
  reasons: ProfileReason[];
  level: 'light' | 'moderate' | 'strong';
  label: string;
}

/**
 * Result payload sent to Chrome extension via bridge or external messaging.
 * Perfectly matches what NB.fromResult in extension's shared/profile.js expects.
 */
export interface ExtensionResultPayload {
  severity: number;
  letterConfusion: number;
  crowding: number;
  tracking: number;
  visualStress: number;
  accuracy: number;
  preferredFont?: ExtensionFont;
  preferredBackground?: ExtensionBackground;
}

// ── Math Helpers ─────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// ── Generator ────────────────────────────────────────────────────────────────

export interface GenerateProfileOptions {
  indicatorScore: number;
  cognitiveProfile?: MeasuredCognitiveProfile | null;
  partAPerformance?: number;
  metrics?: {
    confusionCount?: number;
    backtrackCount?: number;
    readingAccuracyPct?: number;
    readingWpm?: number;
  } | null;
  preferredFont?: ExtensionFont;
  preferredBackground?: ExtensionBackground;
}

/**
 * Generates a structured reading profile from assessment outcomes.
 * Pure, deterministic function.
 */
export function generateReadingProfile(options: GenerateProfileOptions): NeuroBridgeReadingProfile {
  const {
    indicatorScore,
    cognitiveProfile = {},
    partAPerformance = 100 - indicatorScore,
    metrics,
    preferredFont,
    preferredBackground,
  } = options;

  const validIndicator = clamp(Number.isFinite(indicatorScore) ? indicatorScore : 25, 0, 100);
  const cp = cognitiveProfile || {};

  // Extract cognitive skill scores (0-100, higher = better)
  const phonologicalSkill = typeof cp.phonological === 'number' && Number.isFinite(cp.phonological) ? clamp(cp.phonological, 0, 100) : null;
  const visualSkill = typeof cp.visual === 'number' && Number.isFinite(cp.visual) ? clamp(cp.visual, 0, 100) : null;
  const orthographicSkill = typeof cp.orthographic === 'number' && Number.isFinite(cp.orthographic) ? clamp(cp.orthographic, 0, 100) : null;
  const processingSpeedSkill = typeof cp.processingSpeed === 'number' && Number.isFinite(cp.processingSpeed) ? clamp(cp.processingSpeed, 0, 100) : null;

  // Invert skill scores to support needs (0-100, higher = more support needed)
  // If specific cognitive dimension is missing (e.g. mic skipped), fall back to general indicator
  let letterConfusion: number;
  if (orthographicSkill !== null || visualSkill !== null) {
    const relevantSkills = [orthographicSkill, visualSkill].filter((v): v is number => v !== null);
    const avgSkill = relevantSkills.reduce((a, b) => a + b, 0) / relevantSkills.length;
    letterConfusion = clamp(Math.round(100 - avgSkill), 0, 100);
  } else {
    letterConfusion = validIndicator;
  }

  // Adjust for explicit confusion count if captured
  if (metrics && typeof metrics.confusionCount === 'number' && metrics.confusionCount > 0) {
    letterConfusion = clamp(letterConfusion + Math.min(15, metrics.confusionCount * 4), 0, 100);
  }

  let crowding: number;
  if (visualSkill !== null || orthographicSkill !== null) {
    const relevantSkills = [visualSkill, orthographicSkill].filter((v): v is number => v !== null);
    const avgSkill = relevantSkills.reduce((a, b) => a + b, 0) / relevantSkills.length;
    crowding = clamp(Math.round(100 - avgSkill), 0, 100);
  } else {
    crowding = validIndicator;
  }

  // Backtracking in reading indicates visual crowding difficulty
  if (metrics && typeof metrics.backtrackCount === 'number' && metrics.backtrackCount > 0) {
    crowding = clamp(crowding + Math.min(15, metrics.backtrackCount * 3), 0, 100);
  }

  let tracking: number;
  if (processingSpeedSkill !== null) {
    tracking = clamp(Math.round(100 - processingSpeedSkill), 0, 100);
  } else {
    tracking = validIndicator;
  }

  // Visual stress is estimated from overall indicator intensity
  const visualStress = clamp(Math.round(validIndicator * 0.55), 0, 100);

  // Accuracy: higher = better
  const accuracy = clamp(
    typeof metrics?.readingAccuracyPct === 'number' ? metrics.readingAccuracyPct : partAPerformance,
    0,
    100
  );

  const supportNeeds: ProfileSupportNeeds = {
    severity: validIndicator,
    letterConfusion,
    crowding,
    tracking,
    visualStress,
    accuracy,
  };

  // Font selection:
  // OpenDyslexic for higher confusion, Atkinson Hyperlegible for moderate, default otherwise
  let font: ExtensionFont = 'default';
  if (preferredFont) {
    font = preferredFont;
  } else if (letterConfusion >= 55) {
    font = 'opendyslexic';
  } else if (letterConfusion >= 25) {
    font = 'atkinson';
  }

  // Background selection:
  // soft cream for moderate stress, light blue for higher stress
  let background: ExtensionBackground = 'default';
  if (preferredBackground) {
    background = preferredBackground;
  } else if (visualStress >= 50) {
    background = 'blue';
  } else if (visualStress >= 20) {
    background = 'cream';
  }

  // Typography metrics calculation
  const fontSize = clamp(Math.round((100 + validIndicator * 0.3) / 5) * 5, 100, 130);
  const letterSpacingPx = clamp(round1((crowding / 100) * 2.4), 0, 5);
  const letterSpacingEm = clamp(round2(letterSpacingPx / 16), 0, 0.3);
  const wordSpacingPx = clamp(Math.round(((crowding / 100) * 6) * 2) / 2, 0, 10);
  const lineHeight = clamp(round1(1.4 + (tracking / 100) * 0.6), 1.2, 2.5);
  const paragraphSpacingPx = clamp(Math.round(((tracking / 100) * 24) / 2) * 2, 0, 40);
  const fontWeight = visualStress >= 70 ? 500 : 400;

  // Audio pace recommendation
  const ttsPace = validIndicator >= 60 ? 0.85 : 1.0;

  const displaySettings: ProfileDisplaySettings = {
    font,
    fontSize,
    letterSpacing: letterSpacingPx,
    letterSpacingEm,
    wordSpacing: wordSpacingPx,
    lineHeight,
    paragraphSpacing: paragraphSpacingPx,
    fontWeight,
    background,
  };

  const voiceSettings: ProfileVoiceSettings = {
    ttsSpeaker: 'shubh',
    ttsLang: 'auto',
    ttsPace,
    dock: true,
  };

  // Human-readable explanations
  const FONT_DISPLAY_NAMES: Record<ExtensionFont, string> = {
    default: 'Page default',
    opendyslexic: 'OpenDyslexic',
    atkinson: 'Atkinson Hyperlegible',
    arial: 'Arial',
    verdana: 'Verdana',
    tahoma: 'Tahoma',
  };

  const BG_DISPLAY_NAMES: Record<ExtensionBackground, string> = {
    default: 'Page default',
    white: 'White',
    cream: 'Cream',
    blue: 'Soft Blue',
    dark: 'Dark',
  };

  const reasons: ProfileReason[] = [];
  if (font !== 'default') {
    reasons.push({
      label: 'Font',
      value: FONT_DISPLAY_NAMES[font],
      short: FONT_DISPLAY_NAMES[font],
      why: letterConfusion >= 55
        ? 'Weighted letter bottoms help prevent flipping and letter rotation.'
        : 'Clear distinction between similar characters (b/d, p/q) enhances reading fluency.',
    });
  }
  if (fontSize > 100) {
    reasons.push({
      label: 'Text size',
      value: `${fontSize}%`,
      short: `${fontSize}% size`,
      why: 'Slightly enlarged text reduces cognitive strain when decoding sentences.',
    });
  }
  if (letterSpacingPx >= 0.3) {
    reasons.push({
      label: 'Letter spacing',
      value: `${letterSpacingPx}px (${letterSpacingEm}em)`,
      short: `+${letterSpacingPx}px letters`,
      why: 'Wider gaps between characters prevent visual crowding and letter blending.',
    });
  }
  if (wordSpacingPx >= 0.5) {
    reasons.push({
      label: 'Word spacing',
      value: `${wordSpacingPx}px`,
      short: `+${wordSpacingPx}px words`,
      why: 'Increased spacing between words makes word boundaries crisp and distinguishable.',
    });
  }
  reasons.push({
    label: 'Line spacing',
    value: `${lineHeight}`,
    short: `${lineHeight} line height`,
    why: tracking >= 40
      ? 'Generous line height helps your eyes return to the correct next line without skipping.'
      : 'Comfortable reading rhythm between lines.',
  });
  if (paragraphSpacingPx > 0) {
    reasons.push({
      label: 'Paragraph gap',
      value: `${paragraphSpacingPx}px`,
      short: `+${paragraphSpacingPx}px paragraph gap`,
      why: 'Clear breaks between paragraphs give natural resting points and prevent line disorientation.',
    });
  }
  if (background !== 'default') {
    reasons.push({
      label: 'Background',
      value: BG_DISPLAY_NAMES[background],
      short: BG_DISPLAY_NAMES[background],
      why: 'Warm tint softens glare from bright backgrounds and calms visual fatigue.',
    });
  }

  const level: 'light' | 'moderate' | 'strong' =
    validIndicator < 30 ? 'light' : validIndicator < 60 ? 'moderate' : 'strong';

  const labelMap = {
    light: 'Light support',
    moderate: 'Moderate support',
    strong: 'Strong support',
  };

  return {
    schemaVersion: PROFILE_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    assessmentSeverity: getAssessmentSeverity(validIndicator),
    indicatorScore: validIndicator,
    supportNeeds,
    settings: displaySettings,
    voice: voiceSettings,
    reasons,
    level,
    label: labelMap[level],
  };
}

/**
 * Formats a reading profile into the exact payload expected by the Chrome extension.
 */
export function toExtensionResultPayload(profile: NeuroBridgeReadingProfile): ExtensionResultPayload {
  return {
    severity: profile.supportNeeds.severity,
    letterConfusion: profile.supportNeeds.letterConfusion,
    crowding: profile.supportNeeds.crowding,
    tracking: profile.supportNeeds.tracking,
    visualStress: profile.supportNeeds.visualStress,
    accuracy: profile.supportNeeds.accuracy,
    preferredFont: profile.settings.font,
    preferredBackground: profile.settings.background,
  };
}

/**
 * Validates a profile object at runtime before passing to storage or messaging.
 */
export function validateReadingProfile(obj: unknown): obj is NeuroBridgeReadingProfile {
  if (!obj || typeof obj !== 'object') return false;
  const p = obj as Partial<NeuroBridgeReadingProfile>;
  if (p.schemaVersion !== PROFILE_SCHEMA_VERSION) return false;
  if (typeof p.indicatorScore !== 'number' || !Number.isFinite(p.indicatorScore)) return false;
  if (!p.supportNeeds || typeof p.supportNeeds !== 'object') return false;
  if (!p.settings || typeof p.settings !== 'object') return false;
  return true;
}

