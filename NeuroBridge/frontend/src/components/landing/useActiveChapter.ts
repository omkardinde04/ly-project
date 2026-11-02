import { useEffect, useState } from 'react';

/**
 * Tracks which landing chapter is crossing the middle of the viewport.
 *
 * Uses a single IntersectionObserver with a thin band around the viewport's
 * centre line, so there is no work on every scroll frame and the result is
 * correct for slow scrolling, fast flicks, anchor jumps and upward scrolling.
 * When nothing is in the band (e.g. after the chapters end) the last value is kept.
 */
export function useActiveChapter(ids: readonly string[]): number {
  const [active, setActive] = useState(0);
  const key = ids.join('|');

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0 || typeof IntersectionObserver === 'undefined') return;

    const inBand = new Map<string, boolean>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) inBand.set(entry.target.id, entry.isIntersecting);
        const index = ids.findIndex((id) => inBand.get(id));
        if (index !== -1) setActive(index);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return active;
}
