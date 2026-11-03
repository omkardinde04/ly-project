import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Eye,
  Flame,
  Gamepad2,
  Headphones,
  LockKeyhole,
  Swords,
  Target,
  Trophy,
  Zap,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { istDayKey } from '../../utils/istDate';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { useAuth } from '../../contexts/AuthContext';
import { ProgressGame, type GameResult } from './ProgressGame';
import { AdaptivePracticeGame } from './AdaptivePracticeGame';
import { MatchmakingPanel } from './MatchmakingPanel';
import { BattleGame } from './BattleGame';
import {
  BadgeCollection,
  BadgeProgressBar,
  badgeDefinitions,
  type BadgeDefinition,
} from './BadgeCollection';
import { API_BASE } from '../../config/api';

type SkillId = 'sound' | 'focus' | 'memory' | 'speed';

type Skill = {
  id: SkillId;
  icon: typeof Brain;
  name: string;
  construct: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  rating: number;
  delta: number;
};

export type ArenaState = {
  ratings: Record<SkillId, number>;
  skillStats: Record<SkillId, { bestAccuracy: number; attempts: number }>;
  plays: number;
  streak: number;
  lastPlayed: string;
  weeklyGain: number;
  days: string[];
  dailyChallenges: string[];
  achievements: string[];
  acceptedChallenges: number;
  wins: number;
  losses: number;
  opponent: { name: string; rating: number } | null;
};

const today = () => istDayKey();

const labels = {
  en: {
    arena: 'Your Reading Arena',
    ratings: 'Your current ratings',
    daily: 'DAILY CHALLENGE',
    play: 'Play',
    playNow: 'Play now',
    completedToday: 'Completed Today',
    streak: 'day streak',
    best: 'Best',
    week: 'this week',
    skills: 'Your Skills',
    construct: 'Learning Construct',
    peer: 'CHALLENGE A PEER',
    peerText: 'Find someone around your level.',
    find: 'Find Opponent',
    you: 'You',
    accepted: 'accepted',
    activity: 'Activity in the past year',
    challenges: 'challenges completed',
    rating: 'rating this week',
    achievements: 'Recent Achievements',
    growth: 'Your Growth',
    next: 'Recommended next',
    go: 'Go play',
    played: 'Played',
    activities: 'Activities',
    points: 'Points',
  },
  hi: {
    arena: 'आपका रीडिंग एरिना',
    ratings: 'आपकी वर्तमान रेटिंग',
    daily: 'दैनिक चुनौती',
    play: 'खेलें',
    playNow: 'अभी खेलें',
    completedToday: 'आज पूरा हुआ',
    streak: 'दिनों की लकीर',
    best: 'सर्वश्रेष्ठ',
    week: 'इस सप्ताह',
    skills: 'आपके कौशल',
    construct: 'सीखने का कौशल',
    peer: 'साथी को चुनौती दें',
    peerText: 'अपने स्तर के किसी विद्यार्थी को खोजें।',
    find: 'प्रतिद्वंद्वी खोजें',
    you: 'आप',
    accepted: 'स्वीकृत',
    activity: 'पिछले वर्ष की गतिविधि',
    challenges: 'चुनौतियां पूरी',
    rating: 'इस सप्ताह रेटिंग',
    achievements: 'हाल की उपलब्धियां',
    growth: 'आपकी प्रगति',
    next: 'अगली सुझाई चुनौती',
    go: 'खेलने जाएं',
    played: 'खेला गया',
    activities: 'गतिविधियाँ',
    points: 'अंक',
  },
  mr: {
    arena: 'तुमचे रीडिंग एरिना',
    ratings: 'तुमचे सध्याचे गुण',
    daily: 'दैनिक आव्हान',
    play: 'खेळा',
    playNow: 'आता खेळा',
    completedToday: 'आज पूर्ण झाले',
    streak: 'दिवसांची मालिका',
    best: 'सर्वोत्तम',
    week: 'या आठवड्यात',
    skills: 'तुमची कौशल्ये',
    construct: 'शिकण्याचे कौशल्य',
    peer: 'सहकाऱ्याला आव्हान द्या',
    peerText: 'तुमच्या पातळीवरील विद्यार्थी शोधा.',
    find: 'प्रतिस्पर्धी शोधा',
    you: 'तुम्ही',
    accepted: 'स्वीकारले',
    activity: 'मागील वर्षातील उपक्रम',
    challenges: 'आव्हाने पूर्ण',
    rating: 'या आठवड्यातील गुण',
    achievements: 'अलीकडील यश',
    growth: 'तुमची प्रगती',
    next: 'पुढील सुचवलेले आव्हान',
    go: 'खेळायला जा',
    played: 'खेळले',
    activities: 'उपक्रम',
    points: 'गुण',
  },
} as const;

export function ProgressTracking() {
  const { language } = useDyslexia();
  const { user, token } = useAuth();
  const t = labels[language] || labels.en;

  const [game, setGame] = useState<{ skillId: SkillId; isMatch: boolean; adaptive?: boolean } | null>(null);
  const [battle, setBattle] = useState<{ matchId: string; skillId: SkillId } | null>(null);
  const [matchmaking, setMatchmaking] = useState<SkillId | null>(null);
  const [unlockedBadge, setUnlockedBadge] = useState<BadgeDefinition | null>(null);
  const [showBadges, setShowBadges] = useState(false);
  const [ratingSaveError, setRatingSaveError] = useState<string | null>(null);
  const progressRequestVersion = useRef(0);

  const storageKey = `neurobridge-learning-arena-v1:${user?.email || 'guest'}`;

  const [state, setState] = useState<ArenaState>(() => {
    const empty = { sound: 0, focus: 0, memory: 0, speed: 0 };
    const defaults: ArenaState = {
      ratings: empty,
      skillStats: {
        sound: { bestAccuracy: 0, attempts: 0 },
        focus: { bestAccuracy: 0, attempts: 0 },
        memory: { bestAccuracy: 0, attempts: 0 },
        speed: { bestAccuracy: 0, attempts: 0 },
      },
      plays: 0,
      streak: 0,
      lastPlayed: '',
      weeklyGain: 0,
      days: [],
      dailyChallenges: [],
      achievements: [],
      acceptedChallenges: 0,
      wins: 0,
      losses: 0,
      opponent: null,
    };
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      return saved
        ? {
            ...defaults,
            ...saved,
            ratings: { ...empty, ...saved.ratings },
            skillStats: { ...defaults.skillStats, ...saved.skillStats },
          }
        : defaults;
    } catch {
      return defaults;
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  useEffect(() => {
    if (!token) return;
    const requestVersion = progressRequestVersion.current;
    fetch(`${API_BASE}/api/progress`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || requestVersion !== progressRequestVersion.current) return;
        setState((current) => ({
          ...current,
          ratings: {
            ...current.ratings,
            ...Object.fromEntries(
              Object.entries(data.skills || {}).map(([id, stats]: [string, any]) => [
                id,
                stats.rating,
              ])
            ),
          },
          skillStats: { ...current.skillStats, ...data.skills },
          plays: data.completedChallenges ?? current.plays,
          streak: data.streak ?? current.streak,
          lastPlayed: data.lastPlayedDay ?? current.lastPlayed,
          days: data.activityDays ?? current.days,
          dailyChallenges: data.dailyChallenges ?? current.dailyChallenges,
          weeklyGain: data.arena?.weeklyGain ?? current.weeklyGain,
          achievements: data.achievements ?? current.achievements,
          acceptedChallenges: data.arena?.acceptedChallenges ?? current.acceptedChallenges,
          wins: data.arena?.wins ?? current.wins,
          losses: data.arena?.losses ?? current.losses,
          opponent: data.arena?.opponent ?? current.opponent,
        }));
      })
      .catch(() => undefined);
  }, [token]);

  const skills: Skill[] = [
    {
      id: 'sound',
      icon: Headphones,
      name:
        language === 'hi'
          ? 'ध्वनि प्रयोगशाला'
          : language === 'mr'
          ? 'ध्वनी प्रयोगशाळा'
          : 'Sound Lab',
      construct:
        language === 'hi'
          ? 'ध्वन्यात्मक जागरूकता'
          : language === 'mr'
          ? 'ध्वन्यात्मक जागरूकता'
          : 'Phonological Awareness',
      color: '#e86f51',
      bgClass: 'bg-orange-50',
      textClass: 'text-[#E86F51]',
      borderClass: 'border-orange-100',
      rating: state.ratings.sound,
      delta: state.skillStats.sound.bestAccuracy,
    },
    {
      id: 'focus',
      icon: Eye,
      name:
        language === 'hi'
          ? 'फोकस ज़ोन'
          : language === 'mr'
          ? 'फोकस झोन'
          : 'Focus Zone',
      construct:
        language === 'hi'
          ? 'दृश्य ध्यान'
          : language === 'mr'
          ? 'दृश्य लक्ष'
          : 'Visual Attention',
      color: '#2563EB',
      bgClass: 'bg-blue-50',
      textClass: 'text-[#2563EB]',
      borderClass: 'border-blue-100',
      rating: state.ratings.focus,
      delta: state.skillStats.focus.bestAccuracy,
    },
    {
      id: 'memory',
      icon: Brain,
      name:
        language === 'hi'
          ? 'मेमोरी वॉल्ट'
          : language === 'mr'
          ? 'मेमरी वॉल्ट'
          : 'Memory Vault',
      construct:
        language === 'hi'
          ? 'कार्यशील स्मृति'
          : language === 'mr'
          ? 'कार्यरत स्मरणशक्ती'
          : 'Working Memory',
      color: '#8B5CF6',
      bgClass: 'bg-purple-50',
      textClass: 'text-[#8B5CF6]',
      borderClass: 'border-purple-100',
      rating: state.ratings.memory,
      delta: state.skillStats.memory.bestAccuracy,
    },
    {
      id: 'speed',
      icon: Zap,
      name:
        language === 'hi'
          ? 'स्पीड रन'
          : language === 'mr'
          ? 'स्पीड रन'
          : 'Speed Run',
      construct:
        language === 'hi'
          ? 'प्रसंस्करण गति'
          : language === 'mr'
          ? 'प्रक्रिया वेग'
          : 'Processing Speed',
      color: '#F59E0B',
      bgClass: 'bg-amber-50',
      textClass: 'text-[#F59E0B]',
      borderClass: 'border-amber-100',
      rating: state.ratings.speed,
      delta: state.skillStats.speed.bestAccuracy,
    },
  ];

  const daily = skills[Number(today().slice(8, 10)) % skills.length];
  const dailyDone = state.days.includes(today()) || state.dailyChallenges.includes(today());

  const activityWeeks = useMemo(() => {
    const todayKey = today();
    const todayDate = new Date(`${todayKey}T00:00:00Z`);
    const earliestDate = new Date(todayDate);
    earliestDate.setUTCDate(earliestDate.getUTCDate() - 364);
    const weekEnd = new Date(todayDate);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6 - weekEnd.getUTCDay());
    const calendarStart = new Date(weekEnd);
    calendarStart.setUTCDate(calendarStart.getUTCDate() - 370);
    const activeDays = new Set(state.days);

    return Array.from({ length: 53 }, (_, weekIndex) => {
      const days = Array.from({ length: 7 }, (_, dayIndex) => {
        const date = new Date(calendarStart);
        date.setUTCDate(calendarStart.getUTCDate() + weekIndex * 7 + dayIndex);
        const key = date.toISOString().slice(0, 10);
        return {
          key,
          isInRange: key >= earliestDate.toISOString().slice(0, 10) && key <= todayKey,
          isActive: activeDays.has(key),
        };
      });
      const firstOfMonth = days.find((day) => day.key.slice(8, 10) === '01');
      const monthDate = new Date(`${(firstOfMonth?.key || days[0].key)}T00:00:00Z`);

      return {
        days,
        monthLabel:
          weekIndex === 0 || firstOfMonth
            ? new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(monthDate)
            : '',
      };
    });
  }, [state.days]);

  const activeDaysThisYear = activityWeeks
    .flatMap((week) => week.days)
    .filter((day) => day.isInRange && day.isActive).length;

  const complete = (result: GameResult) => {
    const date = today();
    const previousAchievements = state.achievements;
    progressRequestVersion.current += 1;
    setRatingSaveError(null);
    setState((value) => ({
      ...value,
      ratings: {
        ...value.ratings,
        [result.skillId]: Math.max(0, value.ratings[result.skillId] + result.delta),
      },
      plays: value.plays + 1,
      streak: value.lastPlayed === date ? value.streak : value.streak + 1,
      lastPlayed: date,
      weeklyGain: value.weeklyGain + result.delta,
      days: value.days.includes(date) ? value.days : [...value.days, date],
      dailyChallenges:
        result.mode === 'practice' && !value.dailyChallenges.includes(date)
          ? [...value.dailyChallenges, date]
          : value.dailyChallenges,
      achievements:
        value.streak >= 1 || !value.lastPlayed || value.lastPlayed === date
          ? value.achievements.includes('one-day-streak')
            ? value.achievements
            : [...value.achievements, 'one-day-streak']
          : value.achievements,
    }));

    if (token) {
      fetch(`${API_BASE}/api/progress/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skill: result.skillId,
          correct: result.correct,
          total: result.total,
          seconds: result.seconds,
          mode: result.mode,
          dailyKey: date,
        }),
      })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Could not save your rating.');
          return data;
        })
        .then((data) => {
          const savedSkill = data.progress?.skills?.[result.skillId];
          if (!savedSkill) throw new Error('The saved rating was missing from the response.');
          setState((value) => ({
            ...value,
            ratings: { ...value.ratings, [result.skillId]: savedSkill.rating },
            skillStats: { ...value.skillStats, [result.skillId]: savedSkill },
            plays: data.progress.completedChallenges ?? value.plays,
            streak: data.progress.streak ?? value.streak,
            lastPlayed: data.progress.lastPlayedDay ?? value.lastPlayed,
            days: data.progress.activityDays ?? value.days,
            dailyChallenges: data.progress.dailyChallenges ?? value.dailyChallenges,
            achievements: data.progress.achievements ?? value.achievements,
          }));
          const newlyUnlocked = (data.progress?.achievements || []).find(
            (id: string) => !previousAchievements.includes(id)
          );
          if (newlyUnlocked) {
            setUnlockedBadge(
              badgeDefinitions.find((badge) => badge.id === newlyUnlocked) || null
            );
          }
        })
        .catch((error: unknown) => {
          console.error('Could not save progress rating:', error);
          setRatingSaveError('Your result could not be saved. Check your connection and try again later.');
        });
    }
  };

  // Badge celebration overlay
  if (unlockedBadge) {
    const progress = unlockedBadge.progress(state);
    const BadgeIcon = unlockedBadge.icon;
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,#513d12_0%,#17130a_42%,#050505_100%)] p-5">
        <div className="nb-badge-celebration-rays" />
        <span className="nb-badge-sparkle left-[12%] top-[22%]">✦</span>
        <span
          className="nb-badge-sparkle right-[14%] top-[28%]"
          style={{ animationDelay: '0.25s' }}
        >
          ✧
        </span>
        <span
          className="nb-badge-sparkle bottom-[25%] left-[20%]"
          style={{ animationDelay: '0.5s' }}
        >
          ✦
        </span>
        <span
          className="nb-badge-sparkle bottom-[20%] right-[22%]"
          style={{ animationDelay: '0.75s' }}
        >
          ✧
        </span>
        <div className="nb-badge-unlock relative z-10 w-full max-w-lg text-center">
          <div className="nb-badge-shimmer" />
          <div className="nb-badge-celebration-icon relative mx-auto flex h-40 w-40 items-center justify-center rounded-full border-[8px] border-[#d4a941] bg-gradient-to-br from-[#fff3b0] via-[#f4cb5f] to-[#c88e17] text-[#805b08] shadow-2xl">
            <BadgeIcon size={76} />
          </div>
          <p className="relative mt-8 text-xs font-black uppercase tracking-[0.4em] text-[#ffe47e]">
            BADGE UNLOCKED!
          </p>
          <h1 className="relative mt-2 text-3xl font-black text-white sm:text-4xl">
            {unlockedBadge.name}
          </h1>
          <p className="relative mx-auto mt-3 max-w-md text-sm font-semibold text-[#f8e9b5]">
            {unlockedBadge.description}
          </p>
          <p className="relative mt-2 text-xs font-black text-[#ffe47e]">
            {progress.current} / {progress.target}
          </p>
          <button
            onClick={() => {
              setUnlockedBadge(null);
              setGame(null);
            }}
            className="relative mt-8 rounded-2xl bg-[#d4a941] hover:bg-[#e4b84e] px-8 py-3 text-sm font-black text-white shadow-lg transition-all cursor-pointer"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (showBadges) {
    return <BadgeCollection state={state} onClose={() => setShowBadges(false)} />;
  }

  if (battle && token) {
    return (
      <BattleGame
        matchId={battle.matchId}
        token={token}
        language={language}
        userId={String(user?.id)}
        onExit={() => setBattle(null)}
        onResult={(result) => {
          const date = today();
          setState((value) => ({
            ...value,
            ratings: {
              ...value.ratings,
              [battle.skillId]: Math.max(0, value.ratings[battle.skillId] + result.delta),
            },
            plays: value.plays + 1,
            streak: value.lastPlayed === date ? value.streak : value.streak + 1,
            lastPlayed: date,
            days: value.days.includes(date) ? value.days : [...value.days, date],
            weeklyGain: value.weeklyGain + result.delta,
          }));
        }}
      />
    );
  }

  if (matchmaking) {
    const skill = skills.find((item) => item.id === matchmaking)!;
    return (
      <MatchmakingPanel
        skill={skill.id}
        rating={skill.rating}
        language={language}
        token={token}
        displayName={user?.name}
        onFound={(matchId) => {
          setMatchmaking(null);
          setBattle({ matchId, skillId: skill.id });
        }}
        onCancel={() => setMatchmaking(null)}
      />
    );
  }

  if (game) {
    const skill = skills.find((item) => item.id === game.skillId)!;
    if (game.adaptive && token) {
      return (
        <AdaptivePracticeGame
          skillId={skill.id}
          skillName={skill.name}
          rating={skill.rating}
          token={token}
          language={language}
          onComplete={complete}
          onExit={() => setGame(null)}
        />
      );
    }
    return (
      <ProgressGame
        skillId={skill.id}
        skillName={skill.name}
        construct={skill.construct}
        rating={skill.rating}
        language={language}
        isMatch={game.isMatch}
        saveError={ratingSaveError}
        onComplete={complete}
        onExit={() => setGame(null)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10 pb-12">
      {/* ─── HEADER ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden"
      >
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#2563EB] border border-blue-100">
              <Sparkles size={12} className="text-[#2563EB]" />
              {t.arena}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A202C] tracking-tight leading-tight flex items-center gap-2.5">
            <span>{t.skills}</span>
            {state.streak > 0 && (
              <span className="inline-flex items-center gap-1 text-base font-black px-3 py-0.5 rounded-full bg-orange-50 text-[#E86F51] border border-orange-100">
                🔥 {state.streak} {t.streak}
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] font-medium leading-relaxed">
            Practice key skills, build your streak, and track your reading progress.
          </p>
          <div className="pt-2">
            <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-[#64748B]">
              {t.ratings}
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 ${skill.bgClass} ${skill.borderClass}`}
                >
                  <span className={`text-[10px] font-extrabold uppercase tracking-wide ${skill.textClass}`}>
                    {skill.name}
                  </span>
                  <span className="text-base font-black text-[#1A202C]">{skill.rating}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl px-4 py-3 text-center min-w-[85px]">
            <div className="text-lg font-black text-[#1A202C]">{state.plays}</div>
            <div className="text-[10px] font-bold text-[#64748B] uppercase">{t.activities}</div>
          </div>
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl px-4 py-3 text-center min-w-[85px]">
            <div className="text-lg font-black text-[#2563EB]">+{state.weeklyGain}</div>
            <div className="text-[10px] font-bold text-[#2563EB] uppercase">{t.points}</div>
          </div>
          <div className="bg-orange-50/70 border border-orange-100 rounded-2xl px-4 py-3 text-center min-w-[85px]">
            <div className="text-lg font-black text-[#E86F51]">{state.streak}d</div>
            <div className="text-[10px] font-bold text-[#E86F51] uppercase">Streak</div>
          </div>
        </div>
      </motion.div>

      {/* ═══ SECTION 1: CHALLENGE & COMPETE ═══════════════════════════ */}
      <section
        aria-label="Challenges and competition"
        className="rounded-[2rem] border border-amber-200/70 bg-amber-50/30 p-4 sm:p-6 space-y-5"
      >
        <div className="flex items-center gap-3 px-1">
          <span className="w-9 h-9 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <Trophy size={18} />
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-[#1A202C] leading-tight">
              Challenges &amp; Competition
            </h2>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">
              Earn badges, take the daily challenge, or compete with a peer
            </p>
          </div>
        </div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <BadgeProgressBar state={state} onOpen={() => setShowBadges(true)} />
        </motion.div>

        {/* Daily Challenge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          aria-label="Daily challenge"
          className="relative overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-r from-amber-50/60 via-white to-blue-50/40 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-100/40 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200">
                <Zap size={13} className="fill-amber-600 text-amber-600" />
                {t.daily}
              </span>
              <span className="text-xs font-bold text-[#64748B] bg-white/80 px-2.5 py-0.5 rounded-full border border-slate-100">
                10 questions · {daily.construct}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-[#1A202C]">{daily.name}</h3>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-baseline gap-1 bg-white/90 px-3 py-1.5 rounded-xl border border-slate-100 shadow-xs">
                <span className="text-xs font-bold text-[#64748B]">Rating:</span>
                <span className="text-base font-black text-[#1A202C]">{daily.rating}</span>
              </div>
              <div className="text-xs font-semibold text-[#64748B] flex flex-wrap items-center gap-2">
                <span>🔥 {state.streak} {t.streak}</span>
                <span>·</span>
                <span>{t.best}: {daily.rating}</span>
                <span>·</span>
                <span className="text-[#2563EB] font-bold">+{state.weeklyGain} {t.week}</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              disabled={dailyDone}
              onClick={() => setGame({ skillId: daily.id, isMatch: false })}
              className="h-12 px-7 rounded-2xl bg-[#E86F51] hover:bg-[#D45E40] text-white font-bold text-sm shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Gamepad2 size={18} />
              <span>{dailyDone ? t.completedToday : t.playNow}</span>
              {!dailyDone && (
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Challenge a Peer */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0">
                <Swords size={20} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">
                  {t.peer}
                </div>
                <h3 className="text-lg font-extrabold text-[#1A202C]">{t.peerText}</h3>
              </div>
            </div>

            <span className="text-xs font-bold text-[#64748B] bg-slate-100 px-2.5 py-1 rounded-full shrink-0">
              {state.acceptedChallenges} {t.accepted}
            </span>
          </div>

          <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-4 my-4 flex items-center justify-around">
            <div className="text-center">
              <div className="text-xs font-semibold text-[#64748B]">{t.you}</div>
              <div className="text-2xl font-black text-[#2563EB] mt-0.5">{daily.rating}</div>
            </div>

            <span className="w-9 h-9 rounded-full bg-white border border-slate-200 text-[#64748B] font-black text-xs flex items-center justify-center shadow-xs">
              VS
            </span>

            <div className="text-center">
              <div className="text-xs font-semibold text-[#1A202C] truncate max-w-[120px]">
                {state.opponent?.name || 'No opponent yet'}
              </div>
              <div className="text-2xl font-black text-[#E86F51] mt-0.5">
                {state.opponent?.rating ?? '—'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMatchmaking(daily.id)}
            className="w-full h-11 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Swords size={16} />
            <span>{t.find}</span>
          </button>
        </motion.div>
      </section>

      {/* ═══ SECTION 2: PRACTICE AT YOUR OWN PACE ═════════════════════ */}
      <section
        aria-label="Practice at your own pace"
        className="rounded-[2rem] border border-blue-100 bg-blue-50/30 p-4 sm:p-6 space-y-5"
      >
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-blue-100 border border-blue-200 text-[#2563EB] flex items-center justify-center shrink-0">
              <TrendingUp size={18} />
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-[#1A202C] leading-tight">
                Practice at Your Own Pace
              </h2>
              <p className="text-xs text-[#64748B] font-medium mt-0.5">
                Targeted cognitive and multisensory reading practice
              </p>
            </div>
          </div>
          <span className="hidden sm:inline text-xs font-bold text-[#64748B] bg-white px-3 py-1 rounded-full border border-slate-100">
            4 Core Constructs
          </span>
        </div>

        {/* Skills: one per row */}
        <div className="flex flex-col gap-4">
          {skills.map((skill, i) => {
            const Icon = skill.icon;
            return (
              <motion.article
                key={skill.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-blue-100/80 shadow-xs hover:shadow-sm hover:border-blue-200 transition-all flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
              >
                <div className="flex items-center gap-3.5 min-w-0 sm:flex-1">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${skill.bgClass} ${skill.textClass} ${skill.borderClass}`}
                  >
                    <Icon size={24} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-base text-[#1A202C] truncate">
                      {skill.name}
                    </h3>
                    <p className="text-xs font-medium text-[#64748B] truncate mt-0.5">
                      {skill.construct}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span
                    className={`text-xs font-extrabold px-2.5 py-1 rounded-full shrink-0 border ${skill.bgClass} ${skill.textClass} ${skill.borderClass}`}
                  >
                    +{skill.delta}% accuracy
                  </span>

                  <div className="text-left sm:text-center">
                    <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                      Skill Rating
                    </span>
                    <span className="text-2xl font-black text-[#1A202C]">{skill.rating}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setGame({ skillId: skill.id, isMatch: false })}
                      className="h-10 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Gamepad2 size={15} />
                      <span>{t.play}</span>
                    </button>
                    <button
                      type="button"
                      disabled={!token}
                      onClick={() => setGame({ skillId: skill.id, isMatch: false, adaptive: true })}
                      className="h-10 px-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Sparkles size={15} />
                      <span>Adaptive test</span>
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Weekly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#E86F51]">
                <Target size={20} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#1A202C]">{t.activity}</h3>
                <p className="text-xs text-[#64748B] font-medium">Your daily practice at a glance</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-3">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#64748B]">
                <Flame size={14} className="text-[#E86F51]" aria-hidden="true" />
                {state.streak} day streak
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full whitespace-nowrap">
                {activeDaysThisYear} active days
              </span>
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-4 my-2">
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[760px]">
                <div className="relative h-5 ml-7 mb-1">
                  {activityWeeks.map((week, weekIndex) => week.monthLabel && (
                    <span
                      key={`${week.monthLabel}-${weekIndex}`}
                      className="absolute top-0 text-[10px] font-medium text-[#64748B]"
                      style={{ left: `${weekIndex * 13}px` }}
                    >
                      {week.monthLabel}
                    </span>
                  ))}
                </div>
                <div className="flex gap-[3px]">
                  <div className="grid grid-rows-7 gap-[3px] w-6 shrink-0 text-[9px] leading-[10px] text-[#64748B]">
                    <span />
                    <span>Mon</span>
                    <span />
                    <span>Wed</span>
                    <span />
                    <span>Fri</span>
                    <span />
                  </div>
                  {activityWeeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-[3px]">
                      {week.days.map((day) => (
                        <span
                          key={day.key}
                          role="img"
                          aria-label={`${day.key}: ${day.isInRange && day.isActive ? 'activity recorded' : day.isInRange ? 'no activity' : 'outside the past year'}`}
                          title={`${day.key}: ${day.isInRange && day.isActive ? 'Activity recorded' : day.isInRange ? 'No activity' : 'Outside the past year'}`}
                          className={`w-[10px] h-[10px] rounded-[2px] ${
                            !day.isInRange
                              ? 'bg-transparent'
                              : day.isActive
                              ? 'bg-emerald-500 hover:bg-emerald-600'
                              : 'bg-slate-200 hover:bg-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-end gap-2 text-[10px] font-medium text-[#64748B]">
              <span>No activity</span>
              <span className="w-3 h-3 rounded-sm bg-slate-200" aria-hidden="true" />
              <span className="w-3 h-3 rounded-sm bg-emerald-500" aria-hidden="true" />
              <span>Active</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 mt-3">
            <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-100">
              <div className="text-lg font-black text-[#1A202C]">{state.plays}</div>
              <div className="text-xs font-medium text-[#64748B]">{t.challenges}</div>
            </div>
            <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-100">
              <div className="text-lg font-black text-[#2563EB]">+{state.weeklyGain}</div>
              <div className="text-xs font-medium text-[#64748B]">{t.rating}</div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}