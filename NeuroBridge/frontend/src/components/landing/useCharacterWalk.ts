import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { useMotionValue, useMotionValueEvent, useScroll, useSpring, type MotionValue } from 'framer-motion';
import { CHAPTERS, type CharacterPose } from './landingConfig';

interface WalkGeometry {
  /** scrollY at the centre of each walk (between chapter k and k+1). */
  boundaries: number[];
  /** Half-width (px of scroll) of the walking window centred on each boundary. */
  halfWindow: number;
  /** Stage width in px, so chapter x fractions can be turned into pixels. */
  stageWidth: number;
}

interface WalkSample {
  /** Horizontal position as a fraction of stage width from centre. */
  x: number;
  /** 0 → 1 progress through the current walk, or -1 while standing at a chapter. */
  t: number;
  /** Chapter being walked away from (when walking) or standing at. */
  from: number;
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function sample(scroll: number, geo: WalkGeometry): WalkSample {
  const { boundaries, halfWindow } = geo;
  for (let k = 0; k < boundaries.length; k++) {
    const start = boundaries[k] - halfWindow;
    const end = boundaries[k] + halfWindow;
    if (scroll < start) return { x: CHAPTERS[k].x, t: -1, from: k };
    if (scroll <= end) {
      const t = (scroll - start) / (end - start);
      const x = CHAPTERS[k].x + (CHAPTERS[k + 1].x - CHAPTERS[k].x) * easeInOut(t);
      return { x, t, from: k };
    }
  }
  return { x: CHAPTERS[CHAPTERS.length - 1].x, t: -1, from: CHAPTERS.length - 1 };
}

/** Below this on-screen speed (px/s) he counts as standing still. */
const MOVING_SPEED = 40;
/** How long the single 'front' frame is held when he turns left↔right. */
const TURN_MS = 100;

/**
 * Scroll-linked "walk" for the persistent character.
 *
 * While a chapter is in view he stands at that chapter's spot. Between chapters
 * he walks to the next spot, position tied directly to scroll (continuous,
 * reversible, scrubbable) with a small step-bob.
 *
 * Facing is driven by his ACTUAL on-screen motion (the smoothed x), so he can
 * never face one way while sliding the other:
 *   moving → face the direction of travel; stopped → face the content.
 * A left↔right flip shows one 'front' frame for ~100ms, which reads as a turn.
 * Pose changes are instant frame swaps (never two images visible at once).
 *
 * Only `pose` is React state and it changes a few times per walk; position and
 * bob are motion values, so scrolling never re-renders React.
 */
export function useCharacterWalk(
  stageRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): { x: MotionValue<number>; y: MotionValue<number>; pose: CharacterPose } {
  const { scrollY } = useScroll();
  const geo = useRef<WalkGeometry>({ boundaries: [], halfWindow: 1, stageWidth: 0 });
  const enabledRef = useRef(enabled);

  const [pose, setPose] = useState<CharacterPose>(CHAPTERS[0].pose);
  const poseRef = useRef<CharacterPose>(CHAPTERS[0].pose);
  /** Pose for the spot he is standing at / heading to (faces that section's content). */
  const restPose = useRef<CharacterPose>(CHAPTERS[0].pose);
  /** Our own measurement of the on-screen motion (px/s). */
  const motion = useRef({ x: 0, t: 0, v: 0 });
  const frontSince = useRef(0);
  const recheckId = useRef<number | undefined>(undefined);
  const placed = useRef(false);
  const settleId = useRef<number | undefined>(undefined);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  // Over-damped springs (no overshoot) smooth jumpy wheels / trackpads.
  const x = useSpring(rawX, { stiffness: 140, damping: 26, mass: 0.7 });
  const y = useSpring(rawY, { stiffness: 300, damping: 22, mass: 0.4 });

  // Lets the turn loop call the latest decidePose without a circular dependency.
  const decideRef = useRef<() => void>(() => undefined);

  const show = useCallback((next: CharacterPose) => {
    if (poseRef.current === next) return;
    if (next === 'front') frontSince.current = performance.now();
    poseRef.current = next;
    setPose(next);
  }, []);

  const decidePose = useCallback(() => {
    const m = motion.current;
    const v = performance.now() - m.t > 80 ? 0 : m.v;
    const target: CharacterPose =
      enabledRef.current && Math.abs(v) > MOVING_SPEED ? (v > 0 ? 'right' : 'left') : restPose.current;
    const current = poseRef.current;

    // Until he is standing still and facing the content, keep re-checking every
    // frame — so an abrupt stop (no further scroll/animation events) still
    // ends with him turned toward the content.
    if (settleId.current === undefined && (v !== 0 || current !== restPose.current)) {
      const started = performance.now();
      const settle = () => {
        const mm = motion.current;
        const still = performance.now() - mm.t > 80;
        if ((still && poseRef.current === restPose.current) || performance.now() - started > 4000) {
          settleId.current = undefined;
          return;
        }
        decideRef.current();
        settleId.current = requestAnimationFrame(settle);
      };
      settleId.current = requestAnimationFrame(settle);
    }

    if (target === current) return;

    if (!enabledRef.current) {
      show(target);
      return;
    }

    // Re-evaluate once the turn frame has been visible long enough.
    const scheduleRecheck = () => {
      if (recheckId.current !== undefined) return;
      const loop = () => {
        if (performance.now() - frontSince.current < TURN_MS) {
          recheckId.current = requestAnimationFrame(loop);
          return;
        }
        recheckId.current = undefined;
        decideRef.current();
      };
      recheckId.current = requestAnimationFrame(loop);
    };

    if (current === 'front' && performance.now() - frontSince.current < TURN_MS && target !== 'front') {
      scheduleRecheck();
      return;
    }
    const isFlip = (current === 'left' && target === 'right') || (current === 'right' && target === 'left');
    if (isFlip) {
      show('front');
      scheduleRecheck();
    } else {
      show(target);
    }
  }, [show]);

  useEffect(() => {
    decideRef.current = decidePose;
  }, [decidePose]);

  const update = useCallback(
    (scroll: number) => {
      const s = sample(scroll, geo.current);
      const walking = enabledRef.current && s.t >= 0;
      // Spot he is standing at (or heading toward, mid-walk).
      const nearest = s.t < 0 ? s.from : s.t < 0.5 ? s.from : s.from + 1;
      restPose.current = CHAPTERS[nearest].pose;

      const target = (enabledRef.current ? s.x : CHAPTERS[nearest].x) * geo.current.stageWidth;
      rawX.set(target);
      // First placement (and reduced motion): jump straight there — no walk-in on page load.
      if (!placed.current || !enabledRef.current) {
        x.jump(target);
        motion.current = { x: target, t: 0, v: 0 };
        if (geo.current.stageWidth > 0) placed.current = true;
        if (poseRef.current !== restPose.current) show(restPose.current);
        return;
      }

      // Step-bob: three little steps per walk, scaled by distance.
      const distance = s.t >= 0 ? Math.abs(CHAPTERS[s.from + 1].x - CHAPTERS[s.from].x) : 0;
      rawY.set(walking && distance > 0.01 ? -Math.abs(Math.sin(s.t * Math.PI * 3)) * (6 + distance * 14) : 0);

      decidePose();
    },
    [rawX, rawY, x, decidePose, show],
  );

  // Measure his real on-screen speed from the smoothed position.
  useMotionValueEvent(x, 'change', (value) => {
    const now = performance.now();
    const m = motion.current;
    const dt = now - m.t;
    if (dt > 0) {
      const instant = ((value - m.x) / dt) * 1000;
      m.v = dt > 100 ? instant : m.v * 0.5 + instant * 0.5;
    }
    m.x = value;
    m.t = now;
    decidePose();
  });
  useMotionValueEvent(x, 'animationComplete', () => {
    motion.current.v = 0; // he has stopped: turn to the content
    decidePose();
  });
  useMotionValueEvent(scrollY, 'change', update);

  useEffect(
    () => () => {
      if (recheckId.current !== undefined) cancelAnimationFrame(recheckId.current);
      if (settleId.current !== undefined) cancelAnimationFrame(settleId.current);
    },
    [],
  );

  useEffect(() => {
    enabledRef.current = enabled;
    // Re-apply on the next frame (e.g. reduced motion toggled while scrolled mid-page).
    const id = requestAnimationFrame(() => update(scrollY.get()));
    return () => cancelAnimationFrame(id);
  }, [enabled, scrollY, update]);

  // Measure chapter positions (and re-measure whenever layout changes:
  // resize, fonts loading, dyslexia/text-size settings, etc.).
  useEffect(() => {
    const measure = () => {
      const vh = window.innerHeight;
      const navH = 72;
      const stageCentre = navH + (vh - navH) / 2;
      const rects = CHAPTERS.map((c) => {
        const section = document.getElementById(c.id);
        const content = section?.querySelector<HTMLElement>('[data-chapter-content]') ?? section;
        const r = content?.getBoundingClientRect();
        return r ? { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY } : { top: 0, bottom: 0 };
      });
      // He crosses when the empty gap between one section's content and the
      // next is in the middle of the screen — where there is the least text.
      const boundaries = rects
        .slice(1)
        .map((r, i) => Math.max(0, (rects[i].bottom + r.top) / 2 - stageCentre));
      const gaps = boundaries.map((b, i) => (i === 0 ? b : b - boundaries[i - 1])).filter((g) => g > 0);
      const minGap = gaps.length ? Math.min(...gaps) : vh;
      geo.current = {
        boundaries,
        halfWindow: Math.max(60, Math.min(vh * 0.3, minGap * 0.45)),
        stageWidth: stageRef.current?.clientWidth ?? 0,
      };
      update(window.scrollY);
    };

    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(document.body);
    if (stageRef.current) ro?.observe(stageRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [stageRef, update]);

  return { x, y, pose };
}
