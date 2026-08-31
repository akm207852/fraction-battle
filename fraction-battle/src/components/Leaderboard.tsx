import React from 'react';
import { Player } from '../types';
import { Trophy, CheckCircle, Hourglass, Play, Flame, Award, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LeaderboardProps {
  players: Player[];
  activePlayerId: string;
  completedThisRoundPlayerIds: string[];
  currentRound: number;
  totalRounds: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  players,
  activePlayerId,
  completedThisRoundPlayerIds,
  currentRound,
  totalRounds,
}) => {
  // Sort players by highest score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const getRankBadge = (rank: number) => {
    if (rank === 0) {
      return (
        <span className="relative flex items-center justify-center">
          <span className="text-lg animate-bounce">🥇</span>
        </span>
      );
    }
    if (rank === 1) return <span className="text-lg">🥈</span>;
    if (rank === 2) return <span className="text-lg">🥉</span>;
    return (
      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-xs font-black flex items-center justify-center">
        {rank + 1}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500 animate-pulse" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <span>{players.length === 1 ? 'PROGRES SOLO BATTLE' : 'KLASEMEN AKADEMIK'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black">
              LIVE
            </span>
          </h3>
        </div>
        <span className="text-[11px] font-bold text-slate-500">
          Ronde {currentRound}/{totalRounds}
        </span>
      </div>

      {/* Animated Reorderable Player Rows */}
      <div className="space-y-2">
        <AnimatePresence>
          {sortedPlayers.map((p, idx) => {
            const isActive = p.id === activePlayerId;
            const isDoneThisRound = completedThisRoundPlayerIds.includes(p.id);
            const isTop1 = idx === 0;

            return (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all relative ${
                  isActive
                    ? 'border-blue-500 bg-blue-50/80 shadow-md ring-2 ring-blue-500/20'
                    : isTop1
                    ? 'border-amber-200 bg-amber-50/40 hover:bg-amber-50/60'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                {/* Left: Rank & Avatar & Name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 flex items-center justify-center shrink-0">
                    {getRankBadge(idx)}
                  </div>

                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-white border shrink-0 relative"
                    style={{ borderColor: p.color }}
                  >
                    {p.avatar}
                    {isTop1 && (
                      <span className="absolute -top-1.5 -right-1.5 text-[10px]">
                        👑
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-sm truncate max-w-[90px] sm:max-w-[110px]">
                        {p.name}
                      </span>
                      {p.highestCombo >= 3 && (
                        <span
                          title={`Combo Tertinggi: ${p.highestCombo}`}
                          className="flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded-md border border-amber-300"
                        >
                          <Flame className="w-2.5 h-2.5 fill-current text-amber-600" />
                          {p.highestCombo}x
                        </span>
                      )}
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center gap-1 text-[10px] font-semibold mt-0.5">
                      {isActive ? (
                        <span className="text-blue-700 font-extrabold flex items-center gap-0.5">
                          <Play className="w-2.5 h-2.5 fill-current animate-pulse" />
                          Sedang Main
                        </span>
                      ) : isDoneThisRound ? (
                        <span className="text-emerald-700 flex items-center gap-0.5">
                          <CheckCircle className="w-2.5 h-2.5" />
                          Selesai
                        </span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-0.5">
                          <Hourglass className="w-2.5 h-2.5" />
                          Menunggu
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Score */}
                <div className="text-right shrink-0">
                  <span className="text-base font-black text-slate-900 leading-none block">
                    {p.score}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Poin
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
