import { useEffect, useRef, useState } from 'react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { formatCount } from '../../hooks/usePublicStats';

/**
 * Animates a number from 0 up to `value` once it scrolls into view.
 * Shows the final number straight away when reduced motion is on.
 */
export function CountUp({ value, duration = 1400 }: { value: number; duration?: number }) {
  const { reduceMotion } = useDyslexia();
  const [shown, setShown] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduceMotion) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const run = () => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setShown(Math.round(value * eased));
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          run();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration, reduceMotion]);

  return (
    <span ref={ref} className="tabular-nums" aria-label={formatCount(value)}>
      {formatCount(reduceMotion ? value : shown)}
    </span>
  );
}
