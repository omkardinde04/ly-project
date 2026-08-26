import React from 'react';
import { Award, Brain, Eye, Flame, Headphones, LockKeyhole, Medal, Trophy, Zap, X, ChevronRight } from 'lucide-react';
import type { ComponentType } from 'react';
import type { ArenaState } from './ProgressTracking';

export type BadgeDefinition = {
  id: string;
  name: string;
  description: string;
  requirement: string;
  progress: (state: ArenaState) => { current: number; target: number };
  icon: ComponentType<{ size?: number; className?: string }>;
};

export const badgeDefinitions: BadgeDefinition[] = [
  {
    id: 'first-step',
    name: 'First Step',
    description: 'Complete your first reading arena challenge.',
    requirement: 'Complete 1 challenge.',
    progress: (state) => ({ current: Math.min(state.plays, 1), target: 1 }),
    icon: Medal,
  },
  {
    id: 'one-day-streak',
    name: '1 Day Streak',
    description: 'Build your first daily learning streak.',
    requirement: 'Complete a daily challenge for 1 day.',
    progress: (state) => ({ current: Math.min(state.streak, 1), target: 1 }),
    icon: Flame,
  },
  {
    id: 'sound-hunter',
    name: 'Sound Hunter',
    description: 'Practice sound skills consistently.',
    requirement: 'Complete 10 Sound Lab challenges.',
    progress: (state) => ({ current: Math.min(state.skillStats.sound.attempts, 10), target: 10 }),
    icon: Headphones,
  },
  {
    id: 'focus-finder',
    name: 'Focus Finder',
    description: 'Train your visual attention and concentration.',
    requirement: 'Complete 20 Focus Zone challenges.',
    progress: (state) => ({ current: Math.min(state.skillStats.focus.attempts, 20), target: 20 }),
    icon: Eye,
  },
  {
    id: 'memory-master',
    name: 'Memory Master',
    description: 'Reach 80% accuracy while building working memory.',
    requirement: 'Reach 80% memory accuracy across 5 challenges.',
    progress: (state) => ({ current: Math.min(state.skillStats.memory.attempts, 5), target: 5 }),
    icon: Brain,
  },
  {
    id: 'speedster',
    name: 'Speed Booster',
    description: 'Build fast comprehension and processing speed.',
    requirement: 'Reach 80% accuracy in Speed Run.',
    progress: (state) => ({ current: Math.min(state.skillStats.speed.bestAccuracy, 80), target: 80 }),
    icon: Zap,
  },
  {
    id: 'personal-best',
    name: 'Personal Best',
    description: 'Reach a rating milestone across your skills.',
    requirement: 'Reach a rating of 800 in any skill.',
    progress: (state) => ({
      current: Math.min(Math.max(...Object.values(state.ratings)), 800),
      target: 800,
    }),
    icon: Trophy,
  },
];

export function BadgeProgressBar({ state, onOpen }: { state: ArenaState; onOpen: () => void }) {
  const unlocked = badgeDefinitions.filter((badge) => state.achievements.includes(badge.id)).length;
  const percent = Math.round((unlocked / badgeDefinitions.length) * 100);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full items-center gap-4 rounded-3xl border border-amber-200/70 bg-gradient-to-r from-amber-50/50 via-white to-amber-50/30 p-5 sm:p-6 text-left shadow-xs transition-all hover:shadow-sm hover:border-amber-300 cursor-pointer relative overflow-hidden"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100/80 border border-amber-200 text-amber-700 shadow-xs group-hover:scale-105 transition-transform">
        <Trophy size={24} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <span className="text-base font-extrabold text-[#1A202C]">
            Badges & Achievements
          </span>
          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200/80">
            {unlocked} / {badgeDefinitions.length} Earned
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-amber-100/70 mb-1.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#D4A941] to-[#F59E0B] transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>

        <p className="text-xs font-medium text-[#64748B]">
          {unlocked > 0
            ? `You've unlocked ${unlocked} of ${badgeDefinitions.length} badges. Open your collection to track the next.`
            : 'Open your collection and track your next reading achievement milestone.'}
        </p>
      </div>

      <div className="hidden sm:flex items-center text-amber-700/60 group-hover:text-amber-700 group-hover:translate-x-1 transition-all shrink-0">
        <ChevronRight size={20} />
      </div>
    </button>
  );
}

export function BadgeCollection({ state, onClose }: { state: ArenaState; onClose?: () => void }) {
  const unlockedCount = badgeDefinitions.filter((badge) => state.achievements.includes(badge.id)).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Trophy size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1A202C]">Badge Collection</h1>
            <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-0.5">
              {unlockedCount} of {badgeDefinitions.length} unlocked · Complete challenges to earn more
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#1A202C] text-xs font-bold transition-colors cursor-pointer"
          >
            <X size={16} />
            <span>Close</span>
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {badgeDefinitions.map((badge) => {
          const unlocked = state.achievements.includes(badge.id);
          const progress = badge.progress(state);
          const BadgeIcon = unlocked ? badge.icon : LockKeyhole;
          const pct = Math.min(100, Math.round((progress.current / progress.target) * 100));

          return (
            <div
              key={badge.id}
              className={`rounded-3xl p-5 border transition-all ${
                unlocked
                  ? 'bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 border-amber-200/80 shadow-xs'
                  : 'bg-white border-slate-200/80 opacity-80'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                    unlocked
                      ? 'border-amber-300 bg-amber-100 text-amber-700 shadow-xs'
                      : 'border-slate-200 bg-slate-100 text-slate-400'
                  }`}
                >
                  <BadgeIcon size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-extrabold text-sm text-[#1A202C] truncate">
                      {badge.name}
                    </h3>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        unlocked
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {unlocked ? 'UNLOCKED' : 'LOCKED'}
                    </span>
                  </div>

                  <p className="text-xs text-[#64748B] mt-1 line-clamp-2">
                    {badge.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[#64748B]">
                    <span>Requirement: {badge.requirement}</span>
                    <span className="text-amber-700">
                      {progress.current} / {progress.target}
                    </span>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        unlocked ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
