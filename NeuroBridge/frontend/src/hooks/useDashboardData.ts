import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDyslexia } from '../contexts/DyslexiaContext';
import type { ResumeData } from '../components/resume-builder/types';
import { initialResumeData } from '../components/resume-builder/types';

export type SkillId = 'sound' | 'focus' | 'memory' | 'speed';

export interface SkillStats {
  rating: number;
  attempts: number;
  bestScore: number;
  bestAccuracy: number;
  totalSeconds: number;
  difficulty?: number;
  lastPlayed?: string;
}

export interface RecentActivityItem {
  skill: SkillId;
  score: number;
  accuracy: number;
  seconds: number;
  delta: number;
  createdAt: string | Date;
}

export interface LearningProgressState {
  skills: Record<SkillId, SkillStats>;
  completedChallenges: number;
  streak: number;
  lastPlayedDay?: string;
  activityDays: string[];
  dailyChallenges: string[];
  achievements: string[];
  recentActivity: RecentActivityItem[];
}

export interface DayActivity {
  day: string; // 'Mon', 'Tue', etc.
  dateStr: string; // 'YYYY-MM-DD'
  minutes: number;
  hours: number;
  lessons: number;
  accuracy: number;
  active: boolean;
  isToday: boolean;
}

export interface ActiveModuleInfo {
  skillId: SkillId;
  title: string;
  moduleNumber: number;
  totalModules: number;
  construct: string;
  description: string;
  completionPercent: number;
  completedActivities: number;
  totalActivities: number;
  remainingMinutes: number;
  nextActivityTitle: string;
  nextActivityDuration: string;
  isAllCompleted: boolean;
}

export interface ResumeWidgetData {
  completionPercent: number;
  personalComplete: boolean;
  educationComplete: boolean;
  skillsComplete: boolean;
  projectsComplete: boolean;
  hasStarted: boolean;
}

export interface DashboardData {
  // Loading & Error states
  isLoading: boolean;
  error: string | null;
  refetch: () => void;

  // Metric counts
  lessonsCompleted: number;
  completedToday: number;
  learningStreak: number;
  timeSpentThisWeekMinutes: number;
  timeSpentThisWeekFormatted: string;
  weeklyGoalPercent: number;
  weeklyGoalDurationMinutes: number;

  // Chart data (Mon - Sun)
  weekActivity: DayActivity[];
  maxDayMinutes: number;
  hasWeekActivity: boolean;

  // Active / Recommended Module
  activeModule: ActiveModuleInfo;

  // Resume state
  resume: ResumeWidgetData;

  // Raw progress
  progressState: LearningProgressState;
}

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const RESUME_STORAGE_KEY = 'neurobridge-resume-data-v2';

const SKILL_MODULES: Record<SkillId, { title: string; construct: string; desc: string; nextActivity: string; duration: string }> = {
  sound: {
    title: 'Sound Lab & Phonology',
    construct: 'Phonological Awareness',
    desc: 'Master phoneme blending, rhyming cues, and multi-sensory sound recognition.',
    nextActivity: 'Phoneme Rhyme & Sound Matching',
    duration: '3 min',
  },
  focus: {
    title: 'Focus Zone & Visual Scan',
    construct: 'Visual Attention',
    desc: 'Train visual attention, mirror-letter discrimination, and clutter reduction.',
    nextActivity: 'Letter Search & Symbol Discrimination',
    duration: '4 min',
  },
  memory: {
    title: 'Memory Vault & Recall',
    construct: 'Working Memory',
    desc: 'Strengthen working memory chunks, sequence retention, and mental hold time.',
    nextActivity: 'Sequence & Pattern Memory Recall',
    duration: '3 min',
  },
  speed: {
    title: 'Speed Run & Rapid Naming',
    construct: 'Processing Speed',
    desc: 'Boost rapid automatic word recognition and contextual reading rhythm.',
    nextActivity: 'Rapid Word & Shape Comparison',
    duration: '2 min',
  },
};

export function useDashboardData(): DashboardData {
  const { user, token } = useAuth();
  const { dyslexiaLevel } = useDyslexia();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storageKey = `neurobridge-learning-arena-v1:${user?.email || 'guest'}`;

  // Default empty state
  const defaultEmptySkills: Record<SkillId, SkillStats> = {
    sound: { rating: 0, attempts: 0, bestScore: 0, bestAccuracy: 0, totalSeconds: 0 },
    focus: { rating: 0, attempts: 0, bestScore: 0, bestAccuracy: 0, totalSeconds: 0 },
    memory: { rating: 0, attempts: 0, bestScore: 0, bestAccuracy: 0, totalSeconds: 0 },
    speed: { rating: 0, attempts: 0, bestScore: 0, bestAccuracy: 0, totalSeconds: 0 },
  };

  const [progressState, setProgressState] = useState<LearningProgressState>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          skills: { ...defaultEmptySkills, ...(parsed.skills || parsed.skillStats || {}) },
          completedChallenges: parsed.plays ?? parsed.completedChallenges ?? 0,
          streak: parsed.streak ?? 0,
          lastPlayedDay: parsed.lastPlayedDay ?? parsed.lastPlayed ?? '',
          activityDays: parsed.activityDays ?? parsed.days ?? [],
          dailyChallenges: parsed.dailyChallenges ?? [],
          achievements: parsed.achievements ?? [],
          recentActivity: parsed.recentActivity ?? [],
        };
      }
    } catch {}
    return {
      skills: defaultEmptySkills,
      completedChallenges: 0,
      streak: 0,
      activityDays: [],
      dailyChallenges: [],
      achievements: [],
      recentActivity: [],
    };
  });

  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [hasResumeStarted, setHasResumeStarted] = useState(false);

  // Fetch learning progress from backend API with fallback
  const fetchProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (token) {
        const res = await fetch('http://localhost:4000/api/progress', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const mergedSkills: Record<SkillId, SkillStats> = {
            sound: { ...defaultEmptySkills.sound, ...(data.skills?.sound || {}) },
            focus: { ...defaultEmptySkills.focus, ...(data.skills?.focus || {}) },
            memory: { ...defaultEmptySkills.memory, ...(data.skills?.memory || {}) },
            speed: { ...defaultEmptySkills.speed, ...(data.skills?.speed || {}) },
          };

          const updated: LearningProgressState = {
            skills: mergedSkills,
            completedChallenges: data.completedChallenges ?? 0,
            streak: data.streak ?? 0,
            lastPlayedDay: data.lastPlayedDay ?? '',
            activityDays: data.activityDays ?? [],
            dailyChallenges: data.dailyChallenges ?? [],
            achievements: data.achievements ?? [],
            recentActivity: data.recentActivity ?? [],
          };

          setProgressState(updated);
          localStorage.setItem(storageKey, JSON.stringify(updated));
        }
      }
    } catch (err: any) {
      console.warn('Dashboard data fetch error:', err);
      setError('Could not sync latest progress. Showing locally saved data.');
    } finally {
      setIsLoading(false);
    }
  }, [token, storageKey]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Load local resume builder state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RESUME_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.resumeData) {
          setResumeData(parsed.resumeData);
          setHasResumeStarted(true);
        }
      }
    } catch {}
  }, []);

  // Compute Monday-Sunday date range for current week in local calendar
  const weekActivity = useMemo<DayActivity[]>(() => {
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Mon...
    // In ISO week, Monday is 1, Sunday is 7 (or 0)
    const distanceToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const todayStr = now.toISOString().slice(0, 10);

    return DAYS_SHORT.map((dayName, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      const dateStr = date.toISOString().slice(0, 10);
      const isToday = dateStr === todayStr;

      // Find activity in recentActivity or activityDays for this date
      const activitiesOnDay = (progressState.recentActivity || []).filter((act) => {
        const actDateStr = typeof act.createdAt === 'string' ? act.createdAt.slice(0, 10) : new Date(act.createdAt).toISOString().slice(0, 10);
        return actDateStr === dateStr;
      });

      let totalSeconds = activitiesOnDay.reduce((acc, act) => acc + (act.seconds || 0), 0);
      let lessonsCount = activitiesOnDay.length;
      let avgAccuracy = activitiesOnDay.length > 0
        ? Math.round(activitiesOnDay.reduce((acc, act) => acc + (act.accuracy || 0), 0) / activitiesOnDay.length)
        : 0;

      // Fallback: If activityDays includes this day but recentActivity didn't record seconds
      const hasDayRecord = (progressState.activityDays || []).includes(dateStr);
      if (hasDayRecord && totalSeconds === 0) {
        totalSeconds = 120; // 2 minutes placeholder for verified active day
        lessonsCount = Math.max(1, lessonsCount);
        avgAccuracy = avgAccuracy || 85;
      }

      const minutes = Math.round((totalSeconds / 60) * 10) / 10;
      const hours = Math.round((totalSeconds / 3600) * 10) / 10;
      const active = totalSeconds > 0 || hasDayRecord;

      return {
        day: dayName,
        dateStr,
        minutes,
        hours,
        lessons: lessonsCount,
        accuracy: avgAccuracy,
        active,
        isToday,
      };
    });
  }, [progressState.recentActivity, progressState.activityDays]);

  const maxDayMinutes = useMemo(() => {
    return Math.max(...weekActivity.map((d) => d.minutes), 5);
  }, [weekActivity]);

  const hasWeekActivity = useMemo(() => {
    return weekActivity.some((d) => d.active);
  }, [weekActivity]);

  // Lessons completed count
  const lessonsCompleted = useMemo(() => {
    if (progressState.completedChallenges > 0) return progressState.completedChallenges;
    const totalAttempts = Object.values(progressState.skills).reduce((acc, s) => acc + (s.attempts || 0), 0);
    return totalAttempts;
  }, [progressState.completedChallenges, progressState.skills]);

  // Lessons completed today
  const completedToday = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayActivities = (progressState.recentActivity || []).filter((act) => {
      const actDateStr = typeof act.createdAt === 'string' ? act.createdAt.slice(0, 10) : new Date(act.createdAt).toISOString().slice(0, 10);
      return actDateStr === todayStr;
    });
    if (todayActivities.length > 0) return todayActivities.length;
    return progressState.activityDays.includes(todayStr) ? 1 : 0;
  }, [progressState.recentActivity, progressState.activityDays]);

  // Learning streak
  const learningStreak = useMemo(() => {
    return progressState.streak || 0;
  }, [progressState.streak]);

  // Time spent this week in minutes
  const timeSpentThisWeekMinutes = useMemo(() => {
    return Math.round(weekActivity.reduce((acc, d) => acc + d.minutes, 0) * 10) / 10;
  }, [weekActivity]);

  const timeSpentThisWeekFormatted = useMemo(() => {
    if (timeSpentThisWeekMinutes <= 0) return '0 min';
    if (timeSpentThisWeekMinutes < 60) return `${Math.round(timeSpentThisWeekMinutes)} min`;
    const hrs = (timeSpentThisWeekMinutes / 60).toFixed(1);
    return `${hrs} hrs`;
  }, [timeSpentThisWeekMinutes]);

  const weeklyGoalDurationMinutes = 60; // 60 minutes weekly learning target
  const weeklyGoalPercent = useMemo(() => {
    return Math.min(100, Math.round((timeSpentThisWeekMinutes / weeklyGoalDurationMinutes) * 100));
  }, [timeSpentThisWeekMinutes, weeklyGoalDurationMinutes]);

  // Active / Recommended Learning Module calculation
  const activeModule = useMemo<ActiveModuleInfo>(() => {
    const skillList: SkillId[] = ['sound', 'focus', 'memory', 'speed'];
    
    // Pick the skill with the least attempts / lowest rating to recommend next
    let targetSkillId: SkillId = skillList[0];
    let minAttempts = Infinity;
    let minRating = Infinity;

    for (const id of skillList) {
      const stat = progressState.skills[id];
      if (stat.attempts < minAttempts) {
        minAttempts = stat.attempts;
        targetSkillId = id;
        minRating = stat.rating;
      } else if (stat.attempts === minAttempts && stat.rating < minRating) {
        targetSkillId = id;
        minRating = stat.rating;
      }
    }

    const currentStat = progressState.skills[targetSkillId];
    const moduleIdx = skillList.indexOf(targetSkillId);
    const config = SKILL_MODULES[targetSkillId];

    const targetAttempts = 10;
    const completedActs = Math.min(targetAttempts, currentStat.attempts || 0);
    const completionPercent = Math.min(100, Math.round((completedActs / targetAttempts) * 100));
    const remainingActs = targetAttempts - completedActs;
    const remainingMinutes = Math.max(2, remainingActs * 2);

    const isAllCompleted = skillList.every((id) => (progressState.skills[id]?.attempts || 0) >= 10);

    return {
      skillId: targetSkillId,
      title: config.title,
      moduleNumber: moduleIdx + 1,
      totalModules: skillList.length,
      construct: config.construct,
      description: config.desc,
      completionPercent,
      completedActivities: completedActs,
      totalActivities: targetAttempts,
      remainingMinutes,
      nextActivityTitle: config.nextActivity,
      nextActivityDuration: config.duration,
      isAllCompleted,
    };
  }, [progressState.skills]);

  // Resume Widget Progress calculation
  const resume = useMemo<ResumeWidgetData>(() => {
    const isFilled = (v?: string) => Boolean(v && v.trim().length > 0);

    const p = resumeData.personal;
    const personalComplete = isFilled(p.name) && isFilled(p.email) && isFilled(p.phone);

    const e = resumeData.education;
    const educationComplete = isFilled(e.degree) && isFilled(e.college) && isFilled(e.year);

    const skillsComplete = (resumeData.skills || []).length > 0;
    const projectsComplete = (resumeData.projects || []).length > 0 && (resumeData.projects || []).some((prj) => isFilled(prj.name));

    let score = 0;
    if (personalComplete) score += 25;
    if (educationComplete) score += 25;
    if (skillsComplete) score += 25;
    if (projectsComplete) score += 25;

    return {
      completionPercent: score,
      personalComplete,
      educationComplete,
      skillsComplete,
      projectsComplete,
      hasStarted: hasResumeStarted || score > 0,
    };
  }, [resumeData, hasResumeStarted]);

  return {
    isLoading,
    error,
    refetch: fetchProgress,
    lessonsCompleted,
    completedToday,
    learningStreak,
    timeSpentThisWeekMinutes,
    timeSpentThisWeekFormatted,
    weeklyGoalPercent,
    weeklyGoalDurationMinutes,
    weekActivity,
    maxDayMinutes,
    hasWeekActivity,
    activeModule,
    resume,
    progressState,
  };
}
