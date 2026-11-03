import type { SyntheticEvent } from 'react';
import type { Easing } from 'framer-motion';
import frontWebp from '../../assets/character/student-front.webp';
import leftWebp from '../../assets/character/student-profile-left.webp';
import rightWebp from '../../assets/character/student-profile-right.webp';

/**
 * Landing page configuration shared by the content column and the
 * persistent character stage. Keeping this in one place means the
 * character logic never needs to know anything about section markup.
 */

export type CharacterPose = 'front' | 'left' | 'right';

export const CHARACTER_POSES: CharacterPose[] = ['front', 'left', 'right'];

/**
 * Optimised WebP renders of the three supplied views, imported through Vite so
 * they get content-hashed URLs (never served stale from the browser cache, and a
 * missing file fails the build instead of showing a broken image).
 */
export const CHARACTER_SRC: Record<CharacterPose, string> = {
  front: frontWebp,
  // Faces the viewer's LEFT.
  left: leftWebp,
  // Faces the viewer's RIGHT.
  right: rightWebp,
};

/** Original PNGs in /public — used automatically if a WebP ever fails to load. */
export const CHARACTER_FALLBACK_SRC: Record<CharacterPose, string> = {
  front: '/assets/character/student-front.png',
  left: '/assets/character/student-profile-left.png',
  right: '/assets/character/student-profile-right.png',
};

/** onError handler: swap to the original PNG once if the WebP can't be loaded. */
export function fallbackOnError(pose: CharacterPose) {
  return (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.dataset.fallback) return;
    img.dataset.fallback = '1';
    img.src = CHARACTER_FALLBACK_SRC[pose];
  };
}

/**
 * The three renders share a 686×1024 canvas and a common foot line, but the
 * silhouettes sit at slightly different horizontal positions. These offsets
 * line the silhouettes up on one centre axis so crossfades don't "jump".
 * (Measured from each image's alpha bounding box.)
 */
export const POSE_OFFSET_X: Record<CharacterPose, string> = {
  front: '4%',
  left: '5.2%',
  right: '-5.2%',
};

export type ChapterTint = 'blue' | 'purple' | 'emerald' | 'amber';

export interface LandingChapter {
  /** DOM id of the section (several are used by JARVIS tours — keep them stable). */
  id: string;
  /** Short label shown on the character stage; taken from each section's own eyebrow. */
  label: string;
  pose: CharacterPose;
  tint: ChapterTint;
  /** Small per-section adjustment so the figure gently re-settles at each milestone. */
  lift: number;
  scale: number;
  /** Which half of the screen the character stands in; the content takes the other half. */
  side: 'left' | 'right';
  /**
   * Where the character stands on the full-width stage while this chapter is
   * active, as a fraction of the stage width from the centre. Derived from
   * `side`. He walks between these spots as the visitor scrolls.
   */
  x: number;
}

/** Character column share of the width (content gets the rest). */
export const CHARACTER_COLUMN = 0.46;
/** Centre of the character column, as an offset from the stage centre. */
const SIDE_X = 0.5 - CHARACTER_COLUMN / 2; // 0.27

// Zig-zag story: the character starts on the LEFT (content on the right), then
// crosses to the other side at every section. At rest he always faces the
// content: standing on the left he faces right ('right' render), standing on
// the right he faces left ('left' render).
const STORY: Omit<LandingChapter, 'x'>[] = [
  { id: 'hero-section', label: 'Welcome', side: 'left', pose: 'right', tint: 'blue', lift: 0, scale: 1 },
  { id: 'games-section', label: 'What you can do', side: 'right', pose: 'left', tint: 'blue', lift: -4, scale: 1.01 },
  { id: 'courses-section', label: 'Meet JARVIS', side: 'left', pose: 'right', tint: 'purple', lift: -2, scale: 1.015 },
  { id: 'assessment-section', label: 'Read your way', side: 'right', pose: 'left', tint: 'emerald', lift: 2, scale: 1 },
  { id: 'extension-section', label: 'Chrome helper', side: 'left', pose: 'right', tint: 'amber', lift: -4, scale: 1.01 },
  { id: 'how-it-works-section', label: '3 easy steps', side: 'right', pose: 'left', tint: 'blue', lift: -2, scale: 1.01 },
  { id: 'community-section', label: 'Community', side: 'left', pose: 'right', tint: 'emerald', lift: 0, scale: 1 },
];

export const CHAPTERS: LandingChapter[] = STORY.map((c) => ({
  ...c,
  x: c.side === 'left' ? -SIDE_X : SIDE_X,
}));

export const CHAPTER_IDS = CHAPTERS.map((c) => c.id);

export const TINT_COLORS: Record<ChapterTint, { light: string; dark: string }> = {
  blue: { light: 'rgba(191, 219, 254, 0.75)', dark: 'rgba(37, 99, 235, 0.22)' },
  purple: { light: 'rgba(221, 214, 254, 0.75)', dark: 'rgba(124, 58, 237, 0.22)' },
  emerald: { light: 'rgba(167, 243, 208, 0.6)', dark: 'rgba(16, 185, 129, 0.18)' },
  amber: { light: 'rgba(253, 230, 138, 0.6)', dark: 'rgba(245, 158, 11, 0.16)' },
};

/* ── Page-load "drop in & bounce" choreography (shared by desktop + mobile) ── */
const BOUNCE_TIMES = [0, 0.42, 0.62, 0.8, 0.9, 1];
const BOUNCE_EASE: Easing[] = ['easeIn', 'easeOut', 'easeIn', 'easeOut', 'easeIn'];
const BOUNCE_DURATION = 1.15;
const BOUNCE_DELAY = 0.2;

/** Character falls in and bounces twice on the floor (never sinks below it), squashing on each landing. */
export const DROP_IN = {
  initial: { y: -280, scaleY: 1.04, scaleX: 0.97, opacity: 0 },
  animate: {
    y: [-280, 0, -46, 0, -14, 0],
    scaleY: [1.04, 0.9, 1.02, 0.96, 1, 1],
    scaleX: [0.97, 1.07, 0.99, 1.03, 1, 1],
    opacity: 1,
  },
  transition: {
    y: { duration: BOUNCE_DURATION, times: BOUNCE_TIMES, ease: BOUNCE_EASE, delay: BOUNCE_DELAY },
    scaleY: { duration: BOUNCE_DURATION, times: BOUNCE_TIMES, delay: BOUNCE_DELAY },
    scaleX: { duration: BOUNCE_DURATION, times: BOUNCE_TIMES, delay: BOUNCE_DELAY },
    opacity: { duration: 0.2, delay: BOUNCE_DELAY },
  },
};

/** Floor shadow grows as he lands and shrinks a little on each hop. */
export const SHADOW_IN = {
  initial: { scaleX: 0.3, opacity: 0 },
  animate: { scaleX: [0.3, 1, 0.8, 1, 0.93, 1], opacity: [0, 1, 0.7, 1, 0.9, 1] },
  transition: { duration: BOUNCE_DURATION, times: BOUNCE_TIMES, delay: BOUNCE_DELAY },
};

/** Halo / rings pop in behind him just as he lands. */
export const popIn = (delay: number) => ({
  initial: { scale: 0.5, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { type: 'spring' as const, stiffness: 160, damping: 11, delay },
});
