import { useEffect, useState } from 'react';
import { API_BASE } from '../config/api';

/** Real platform totals from GET /api/stats/public (anonymous counts only). */
export interface PublicStats {
  students: number;
  assessments: number;
  practiceMinutes: number;
  courses: number;
  posts: number;
  updatedAt: string;
}

// One request per page visit, shared by every component that asks
let pending: Promise<PublicStats | null> | null = null;
let lastFetchedAt = 0;
const REFRESH_MS = 5 * 60 * 1000;

function loadStats(): Promise<PublicStats | null> {
  if (!pending || Date.now() - lastFetchedAt > REFRESH_MS) {
    lastFetchedAt = Date.now();
    pending = fetch(`${API_BASE}/api/stats/public`)
      .then((res) => (res.ok ? (res.json() as Promise<PublicStats>) : null))
      .catch(() => null)
      .then((data) => {
        if (!data) pending = null; // failed: try again on the next page visit
        return data;
      });
  }
  return pending;
}

/** `stats` is null while loading or if the server can't be reached. */
export function usePublicStats() {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    loadStats().then((data) => {
      if (!alive) return;
      if (data) setStats(data);
      else setFailed(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  return { stats, failed };
}

/** 7 → "7", 1234 → "1.2K+", 25000 → "25K+", 1300000 → "1.3M+" */
export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const k = n / 1000;
    return `${k >= 10 ? Math.floor(k) : Math.floor(k * 10) / 10}K+`;
  }
  return `${Math.floor((n / 1_000_000) * 10) / 10}M+`;
}
