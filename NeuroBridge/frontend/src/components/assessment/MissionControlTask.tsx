import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────
type StepType = 'KEYPRESS' | 'CLICK';

interface ActivityStep {
  label: string;      // shown to the user e.g. "Click the blue circle"
  type: StepType;
  expectedValue: string;
}

export interface FollowStepsData {
  activity_id: number;
  first_action_delay_ms: number | null;
  step_delays_ms: number[];
  sequence_errors: number;        // steps done out of order
  wrong_key_count: number;
  extra_click_count: number;
  completion_rate: number;        // 0–100
  total_time_ms: number;
}

// ─── Activity variants (system randomly picks one) ───────────────────────────
const ACTIVITIES: ActivityStep[][] = [
  // Version 1
  [
    { label: 'Click the blue circle',  type: 'CLICK',    expectedValue: 'blue-circle'     },
    { label: 'Press the LEFT arrow',   type: 'KEYPRESS', expectedValue: 'ArrowLeft'       },
    { label: 'Type the letter A',      type: 'KEYPRESS', expectedValue: 'a'               },
  ],
  // Version 2
  [
    { label: 'Press the LEFT arrow',   type: 'KEYPRESS', expectedValue: 'ArrowLeft'       },
    { label: 'Click the green square', type: 'CLICK',    expectedValue: 'green-square'    },
    { label: 'Type the letter B',      type: 'KEYPRESS', expectedValue: 'b'               },
  ],
  // Version 3
  [
    { label: 'Click the triangle',     type: 'CLICK',    expectedValue: 'orange-triangle' },
    { label: 'Press the DOWN arrow',   type: 'KEYPRESS', expectedValue: 'ArrowDown'       },
    { label: 'Press SPACE',            type: 'KEYPRESS', expectedValue: ' '               },
  ],
];

const SHOW_DURATION_MS = 3000;

// ─── Props ────────────────────────────────────────────────────────────────────
interface FollowStepsProps {
  onComplete?: (data: FollowStepsData) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function MissionControlTask({ onComplete }: FollowStepsProps) {
  // Pick a random activity once, stably
  const [activity] = useState<ActivityStep[]>(
    () => ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)]
  );
  const [activityId] = useState(() => Math.floor(Math.random() * ACTIVITIES.length) + 1);

  type Phase = 'ready' | 'instructions' | 'playing' | 'done' | 'timeout';
  const [phase, setPhase] = useState<Phase>('ready');
  const [completedSteps, setCompletedSteps] = useState(0);
  const [clickedShape, setClickedShape] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(40);

  // ── Telemetry refs ──────────────────────────────────────────────────────────
  const playStartTime    = useRef<number>(0);
  const lastActionTime   = useRef<number>(0);
  const timerInterval    = useRef<any>(null);
  const metrics          = useRef<FollowStepsData>({
    activity_id: activityId,
    first_action_delay_ms: null,
    step_delays_ms: [],
    sequence_errors: 0,
    wrong_key_count: 0,
    extra_click_count: 0,
    completion_rate: 0,
    total_time_ms: 0,
  });

  // ── Start: show instructions then begin playing ──────────────────────────────
  const beginActivity = () => {
    setPhase('instructions');
    setCompletedSteps(0);
    setClickedShape(null);
    setTimeLeft(40);

    setTimeout(() => {
      setPhase('playing');
      playStartTime.current  = Date.now();
      lastActionTime.current = Date.now();
    }, SHOW_DURATION_MS);
  };

  // ── Timer Effect ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'playing') {
      timerInterval.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerInterval.current) clearInterval(timerInterval.current);
            setPhase('timeout');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerInterval.current) clearInterval(timerInterval.current);
    }
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [phase]);

  // ── End ─────────────────────────────────────────────────────────────────────
  const endActivity = useCallback((stepsCompleted: number) => {
    if (timerInterval.current) clearInterval(timerInterval.current);
    const now = Date.now();
    metrics.current.completion_rate = Math.round((stepsCompleted / activity.length) * 100);
    metrics.current.total_time_ms   = now - playStartTime.current;

    setPhase('done');
    console.log('[FollowSteps Telemetry]', metrics.current);

    setTimeout(() => {
      if (onComplete) onComplete(metrics.current);
    }, 1500);
  }, [activity.length, onComplete]);

  const handleProceed = () => {
    if (onComplete) onComplete(metrics.current);
  };

  // Watch for full completion
  useEffect(() => {
    if (phase === 'playing' && completedSteps === activity.length) {
      endActivity(completedSteps);
    }
  }, [completedSteps, phase, activity.length, endActivity]);

  // ── Handle an incoming user action ──────────────────────────────────────────
  const handleAction = useCallback((type: StepType, value: string) => {
    if (phase !== 'playing') return;
    const now = Date.now();

    // Telemetry: timing
    if (metrics.current.first_action_delay_ms === null) {
      metrics.current.first_action_delay_ms = now - playStartTime.current;
    } else {
      metrics.current.step_delays_ms.push(now - lastActionTime.current);
    }
    lastActionTime.current = now;

    // Visual pulse on shape click
    if (type === 'CLICK') {
      setClickedShape(value);
      setTimeout(() => setClickedShape(null), 350);
    }

    if (completedSteps >= activity.length) return;

    const target = activity[completedSteps];
    const correct = target.type === type && target.expectedValue.toLowerCase() === value.toLowerCase();

    if (correct) {
      setCompletedSteps(prev => prev + 1);
    } else {
      // Silent error tracking
      if (type === 'CLICK') {
        metrics.current.extra_click_count += 1;
      } else {
        metrics.current.wrong_key_count += 1;
      }
      metrics.current.sequence_errors += 1;
    }
  }, [phase, completedSteps, activity]);

  // ── Keyboard listener ────────────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (phase === 'playing') {
        handleAction('KEYPRESS', e.key);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleAction, phase]);

  // ── Derived styles ────────────────────────────────────────────────────────────
  const shapeGlow = (id: string) =>
    clickedShape === id
      ? '0 0 0 6px rgba(77,166,255,0.25), 0 4px 18px rgba(77,166,255,0.3)'
      : '0 2px 10px rgba(0,0,0,0.06)';

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto',
        background: '#F5F9FF',
        borderRadius: '20px',
        padding: '32px 28px',
        boxShadow: '0 8px 32px rgba(77,166,255,0.10)',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        minHeight: '480px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1A2340', margin: 0, letterSpacing: '-0.3px' }}>
          Let's try a quick activity ✨
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#7A8CAA', marginTop: '6px', marginBottom: 0 }}>
          Simple · Fun · Short
        </p>
      </div>

      <AnimatePresence mode="wait">

        {/* ── READY phase ──────────────────────────────────────────────────── */}
        {phase === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}
          >
            <div style={{
              background: '#fff',
              border: '1px solid #DCEBFF',
              borderRadius: '14px',
              padding: '20px 24px',
              maxWidth: '340px',
              color: '#2A3A5A',
              fontSize: '0.95rem',
              lineHeight: 1.7,
              textAlign: 'left',
            }}>
              <p style={{ margin: '0 0 10px', fontWeight: 600, color: '#4DA6FF' }}>How it works:</p>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>You'll see <strong>3 short steps</strong></li>
                <li>They'll disappear after a few seconds</li>
                <li>Then do them in order — keyboard & mouse</li>
              </ul>
              <p style={{ margin: '14px 0 0', color: '#7A8CAA', fontSize: '0.85rem' }}>
                No right or wrong. Just follow along 🙂
              </p>
            </div>

            <motion.button
              onClick={beginActivity}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: 'linear-gradient(135deg, #4DA6FF 0%, #7B6AFF 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '50px',
                padding: '13px 36px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(77,166,255,0.35)',
                letterSpacing: '0.2px',
              }}
            >
              Try this quick challenge →
            </motion.button>
          </motion.div>
        )}

        {/* ── INSTRUCTIONS phase (auto-disappear after 3 s) ─────────────────── */}
        {phase === 'instructions' && (
          <motion.div
            key="instructions"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.3 }}
            style={{ textAlign: 'center', width: '100%' }}
          >
            <p style={{ color: '#7A8CAA', fontSize: '0.85rem', marginBottom: '12px', marginTop: 0 }}>
              Follow these steps in order:
            </p>
            <div style={{
              background: '#fff',
              border: '1.5px solid #DCEBFF',
              borderRadius: '14px',
              padding: '20px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              {activity.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                  <span style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4DA6FF, #7B6AFF)',
                    color: '#fff', fontWeight: 700, fontSize: '0.78rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: '#1A2340' }}>
                    {step.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── PLAYING phase ────────────────────────────────────────────────── */}
        {phase === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}
          >
            {/* Soft hint */}
            <p style={{ color: '#7A8CAA', fontSize: '0.84rem', margin: 0 }}>
              You're doing great — go for it!
            </p>

            {/* Step progress dots */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {activity.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: i === completedSteps ? 1.25 : 1 }}
                  style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: i < completedSteps
                      ? 'linear-gradient(135deg, #4DA6FF, #7B6AFF)'
                      : i === completedSteps
                      ? '#BFDCFF'
                      : '#E2ECFF',
                    transition: 'background 0.3s',
                  }}
                />
              ))}
            </div>

            {/* Shape canvas */}
            <div style={{
              background: '#fff',
              border: '2px dashed #DCEBFF',
              borderRadius: '18px',
              width: '100%',
              height: '210px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              padding: '0 24px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Timer Bar */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '4px',
                background: timeLeft < 10 ? '#FF7070' : '#4DA6FF',
                width: `${(timeLeft / 40) * 100}%`,
                transition: 'width 1s linear, background-color 0.3s'
              }} />

              {/* Blue Circle */}
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => handleAction('CLICK', 'blue-circle')}
                aria-label="Blue Circle"
                title="Blue Circle"
                style={{
                  width: '66px', height: '66px', borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%, #7EC8FF, #4DA6FF)',
                  border: 'none', cursor: 'pointer',
                  boxShadow: shapeGlow('blue-circle'),
                  transition: 'box-shadow 0.2s',
                  outline: 'none',
                }}
              />

              {/* Green Square */}
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => handleAction('CLICK', 'green-square')}
                aria-label="Green Square"
                title="Green Square"
                style={{
                  width: '62px', height: '62px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #85EAA6, #50C878)',
                  border: 'none', cursor: 'pointer',
                  boxShadow: shapeGlow('green-square'),
                  transition: 'box-shadow 0.2s',
                  outline: 'none',
                }}
              />

              {/* Orange Triangle */}
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => handleAction('CLICK', 'orange-triangle')}
                aria-label="Orange Triangle"
                title="Orange Triangle"
                style={{
                  width: '66px', height: '66px',
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                  background: 'linear-gradient(160deg, #FFD580, #FFB347)',
                  border: 'none', cursor: 'pointer',
                  boxShadow: clickedShape === 'orange-triangle'
                    ? '0 0 0 6px rgba(255,179,71,0.22)'
                    : 'none',
                  transition: 'box-shadow 0.2s',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: timeLeft < 10 ? '#FF7070' : '#7A8CAA', fontWeight: 600 }}>
                 ⏱️ {timeLeft}s left
              </span>
            </div>
          </motion.div>
        )}

        {/* ── DONE phase ───────────────────────────────────────────────────── */}
        {phase === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
          >
            <div style={{
              width: '70px', height: '70px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #4DA6FF22, #7B6AFF22)',
              border: '2px solid #DCEBFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem',
            }}>
              🏁
            </div>
            <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1A2340', margin: 0 }}>
              Mission Accomplished!
            </p>
            <p style={{ fontSize: '0.9rem', color: '#7A8CAA', margin: 0 }}>
              Let's find the next discovery...
            </p>
          </motion.div>
        )}

        {/* ── TIMEOUT phase ────────────────────────────────────────────────── */}
        {phase === 'timeout' && (
          <motion.div
            key="timeout"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}
          >
            <div style={{
              width: '70px', height: '70px', borderRadius: '50%',
              background: '#FFF5F5',
              border: '2px solid #FFEBEB',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem',
            }}>
              ⏰
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <p style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FF7070', margin: 0 }}>
                Times up, no worries! 
              </p>
              <p style={{ fontSize: '0.9rem', color: '#7A8CAA', margin: 0 }}>
                You did a great job following along.
              </p>
            </div>

            <motion.button
              onClick={handleProceed}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'linear-gradient(135deg, #4DA6FF 0%, #7B6AFF 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '50px',
                padding: '14px 32px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(77,166,255,0.3)',
              }}
            >
              Click next to find next puzzle →
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
