import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Check,
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
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { useAuth } from '../../contexts/AuthContext';
import { ProgressGame, type GameResult } from './ProgressGame';
import { MatchmakingPanel } from './MatchmakingPanel';
import { BattleGame } from './BattleGame';
import {
  BadgeCollection,
  BadgeProgressBar,
  badgeDefinitions,
  type BadgeDefinition,
} from './BadgeCollection';

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

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const today = () => new Date().toISOString().slice(0, 10);

const labels = {
  en: {
    arena: 'Your Reading Arena',
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
    activity: 'Weekly Activity',
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
    activity: 'साप्ताहिक गतिविधि',
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
    activity: 'साप्ताहिक उपक्रम',
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

  const [game, setGame] = useState<{ skillId: SkillId; isMatch: boolean } | null>(null);
  const [battle, setBattle] = useState<{ matchId: string; skillId: SkillId } | null>(null);
  const [matchmaking, setMatchmaking] = useState<SkillId | null>(null);
  const [unlockedBadge, setUnlockedBadge] = useState<BadgeDefinition | null>(null);
  const [showBadges, setShowBadges] = useState(false);

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
    fetch('http://localhost:4000/api/progress', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
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

  const daily = skills[new Date().getDate() % skills.length];
  const dailyDone = state.days.includes(today()) || state.dailyChallenges.includes(today());

  // Weekday activity array based on real days
  const weekActivity = DAYS.map((_, index) =>
    state.days.includes(
      new Date(Date.now() - (6 - index) * 86400000).toISOString().slice(0, 10)
    )
  );

  const complete = (result: GameResult) => {
    const date = today();
    const previousAchievements = state.achievements;
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
      fetch('http://localhost:4000/api/progress/games', {
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
        .then((response) => response.json())
        .then((data) => {
          const savedSkill = data.progress?.skills?.[result.skillId];
          if (savedSkill) {
            setState((value) => ({
              ...value,
              ratings: { ...value.ratings, [result.skillId]: savedSkill.rating },
              skillStats: { ...value.skillStats, [result.skillId]: savedSkill },
            }));
          }
          const newlyUnlocked = (data.progress?.achievements || []).find(
            (id: string) => !previousAchievements.includes(id)
          );
          if (newlyUnlocked) {
            setUnlockedBadge(
              badgeDefinitions.find((badge) => badge.id === newlyUnlocked) || null
            );
          }
        })
        .catch(() => undefined);
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
            onClick={() => setUnlockedBadge(null)}
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
          setState((value) => ({
            ...value,
            ratings: {
              ...value.ratings,
              [battle.skillId]: Math.max(0, value.ratings[battle.skillId] + result.delta),
            },
            plays: value.plays + 1,
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
    return (
      <ProgressGame
        skillId={skill.id}
        skillName={skill.name}
        construct={skill.construct}
        rating={skill.rating}
        language={language}
        isMatch={game.isMatch}
        onComplete={complete}
        onExit={() => setGame(null)}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-7 pb-12">
      {/* ─── 1. HEADER: YOUR READING ARENA ─────────────────────────── */}
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
        </div>

        {/* Summary Metric Cluster */}
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

      {/* ─── 2. BADGES & ACHIEVEMENTS CARD ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <BadgeProgressBar state={state} onOpen={() => setShowBadges(true)} />
      </motion.div>

      {/* ─── 3. DAILY CHALLENGE HERO CARD ──────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        aria-label="Daily challenge"
        className="relative overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-r from-amber-50/60 via-white to-blue-50/40 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        {/* Subtle decorative background detail */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-100/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200">
              <Zap size={13} className="fill-amber-600 text-amber-600" />
              {t.daily}
            </span>
            <span className="text-xs font-bold text-[#64748B] bg-white/80 px-2.5 py-0.5 rounded-full border border-slate-100">
              10 questions · {daily.construct}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#1A202C]">
            {daily.name}
          </h2>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-baseline gap-1 bg-white/90 px-3 py-1.5 rounded-xl border border-slate-100 shadow-xs">
              <span className="text-xs font-bold text-[#64748B]">Rating:</span>
              <span className="text-base font-black text-[#1A202C]">{daily.rating}</span>
            </div>
            <div className="text-xs font-semibold text-[#64748B] flex items-center gap-2">
              <span>🔥 {state.streak} {t.streak}</span>
              <span>·</span>
              <span>{t.best}: {daily.rating}</span>
              <span>·</span>
              <span className="text-[#2563EB] font-bold">+{state.weeklyGain} {t.week}</span>
            </div>
          </div>
        </div>

        {/* Right CTA Button */}
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            disabled={dailyDone}
            onClick={() => setGame({ skillId: daily.id, isMatch: false })}
            className="h-12 px-7 rounded-2xl bg-[#E86F51] hover:bg-[#D45E40] text-white font-bold text-sm shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Gamepad2 size={18} />
            <span>{dailyDone ? t.completedToday : t.playNow}</span>
            {!dailyDone && <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
          </button>
        </div>
      </motion.section>

      {/* ─── 4. YOUR SKILLS GRID ───────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        aria-label="Your reading skills"
      >
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h2 className="text-lg font-extrabold text-[#1A202C]">
              {t.skills}
            </h2>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">
              Targeted cognitive and multisensory reading practice
            </p>
          </div>
          <span className="text-xs font-bold text-[#64748B] bg-slate-100 px-3 py-1 rounded-full">
            4 Core Constructs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          {skills.map((skill) => {
            const Icon = skill.icon;
            return (
              <article
                key={skill.id}
                className="bg-white rounded-3xl p-6 border border-blue-100/80 shadow-xs hover:shadow-sm hover:border-blue-200 transition-all flex flex-col justify-between h-full group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${skill.bgClass} ${skill.textClass} ${skill.borderClass}`}
                      >
                        <Icon size={22} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-extrabold text-base text-[#1A202C] truncate">
                          {skill.name}
                        </h3>
                        <p className="text-xs font-medium text-[#64748B] truncate mt-0.5">
                          {skill.construct}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-full shrink-0 border ${skill.bgClass} ${skill.textClass} ${skill.borderClass}`}
                    >
                      +{skill.delta}% accuracy
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                      Skill Rating
                    </span>
                    <span className="text-2xl font-black text-[#1A202C]">
                      {skill.rating}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setGame({ skillId: skill.id, isMatch: false })}
                    className="h-10 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Gamepad2 size={15} />
                    <span>{t.play}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </motion.section>

      {/* ─── 5. BOTTOM: CHALLENGE A PEER & WEEKLY ACTIVITY ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Card 1: Challenge a Peer */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs flex flex-col justify-between h-full"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
                  <Swords size={20} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">
                    {t.peer}
                  </div>
                  <h3 className="text-lg font-extrabold text-[#1A202C]">
                    {t.peerText}
                  </h3>
                </div>
              </div>

              <span className="text-xs font-bold text-[#64748B] bg-slate-100 px-2.5 py-1 rounded-full shrink-0">
                {state.acceptedChallenges} {t.accepted}
              </span>
            </div>

            {/* VS Matchup Box */}
            <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-4 my-4 flex items-center justify-around">
              <div className="text-center">
                <div className="text-xs font-semibold text-[#64748B]">{t.you}</div>
                <div className="text-2xl font-black text-[#2563EB] mt-0.5">
                  {daily.rating}
                </div>
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
          </div>

          <button
            type="button"
            onClick={() => setMatchmaking(daily.id)}
            className="w-full h-11 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Swords size={16} />
            <span>{t.find}</span>
          </button>
        </motion.section>

        {/* Card 2: Weekly Activity */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs flex flex-col justify-between h-full"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#E86F51]">
                  <Target size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#1A202C]">
                    {t.activity}
                  </h3>
                  <p className="text-xs text-[#64748B] font-medium">
                    Weekly practice consistency
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
                Active Week
              </span>
            </div>

            {/* Weekday Row (Mon - Sun) */}
            <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-4 my-2 flex items-center justify-between">
              {DAYS.map((day, i) => {
                const isActive = weekActivity[i];
                return (
                  <div key={day} className="flex flex-col items-center gap-1.5 flex-1">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                        isActive
                          ? 'bg-[#2563EB] text-white shadow-xs'
                          : 'bg-slate-200/70 text-slate-400'
                      }`}
                    >
                      {isActive ? <Check size={14} strokeWidth={2.5} /> : '·'}
                    </span>
                    <span className="text-[11px] font-bold text-[#64748B]">
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metric Stats */}
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
        </motion.section>
      </div>
    </div>
  );
}
