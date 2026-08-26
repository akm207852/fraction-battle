import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { Play, Sparkles, Trophy, Layers, Swords, Zap } from 'lucide-react';
import { sound } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';

interface TurnTransitionProps {
  nextPlayer: Player;
  roundNumber: number;
  totalRounds: number;
  gridDimension: number;
  timeLimit: number;
  onStartTurn: () => void;
}

export const TurnTransition: React.FC<TurnTransitionProps> = ({
  nextPlayer,
  roundNumber,
  totalRounds,
  gridDimension,
  timeLimit,
  onStartTurn,
}) => {
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [countNumber, setCountNumber] = useState<number>(3);

  const level = gridDimension === 8 ? 1 : gridDimension === 10 ? 2 : 3;
  const levelBadge =
    level === 1
      ? {
          name: 'Level 1 (8×8)',
          desc: '64 Kartu • 30 Detik',
          className: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        }
      : level === 2
      ? {
          name: 'Level 2 (10×10)',
          desc: '100 Kartu • 25 Detik',
          className: 'bg-blue-100 text-blue-900 border-blue-300',
        }
      : {
          name: 'Level 3 (12×12)',
          desc: '144 Kartu • 20 Detik',
          className: 'bg-purple-100 text-purple-900 border-purple-300',
        };

  const handleReadyClick = () => {
    setIsCountingDown(true);
    setCountNumber(3);
    sound.playCountdownTick(3);
  };

  // 3... 2... 1... MULAI! sequence
  useEffect(() => {
    if (!isCountingDown) return;

    if (countNumber > 0) {
      const timer = setTimeout(() => {
        const nextNum = countNumber - 1;
        setCountNumber(nextNum);
        sound.playCountdownTick(nextNum);
      }, 850);
      return () => clearTimeout(timer);
    } else {
      // countNumber === 0 (MULAI!)
      const startTimer = setTimeout(() => {
        onStartTurn();
      }, 600);
      return () => clearTimeout(startTimer);
    }
  }, [isCountingDown, countNumber, onStartTurn]);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 text-center animate-in fade-in zoom-in-95 duration-200">
      {/* 3-2-1 Battle Countdown Full-screen Overlay */}
      <AnimatePresence>
        {isCountingDown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4 text-white"
          >
            {/* Background glowing energy circle */}
            <motion.div
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute w-72 h-72 rounded-full blur-3xl pointer-events-none"
              style={{ backgroundColor: nextPlayer.color }}
            />

            <div className="relative z-10 flex flex-col items-center">
              {/* Player Tag */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-xs"
              >
                <span className="text-2xl">{nextPlayer.avatar}</span>
                <span className="font-extrabold text-sm sm:text-base text-amber-300">
                  {nextPlayer.name}
                </span>
                <span className="text-xs text-white/70">Bersiap!</span>
              </motion.div>

              {/* Animated Countdown Number */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={countNumber}
                  initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 1.6, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="flex flex-col items-center"
                >
                  {countNumber > 0 ? (
                    <div className="text-8xl sm:text-9xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-500 drop-shadow-[0_10px_20px_rgba(245,158,11,0.5)]">
                      {countNumber}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="text-6xl sm:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 drop-shadow-[0_10px_25px_rgba(16,185,129,0.7)] animate-pulse">
                        MULAI! 🔥
                      </div>
                      <span className="text-base sm:text-lg font-bold text-emerald-300 mt-2">
                        Pilih pecahan senilai secepatnya!
                      </span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Subtitle helper */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs sm:text-sm text-slate-300 font-semibold mt-8 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                Grid {gridDimension}×{gridDimension} • {timeLimit} Detik
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waiting Indicator Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 border border-amber-300 text-amber-900 rounded-full text-xs font-black uppercase tracking-wider mb-6 shadow-xs">
        <Swords className="w-4 h-4 text-amber-600 animate-bounce" />
        ACADEMIC BATTLE • PERGANTIAN GILIRAN
      </div>

      {/* Main Announcement Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 relative overflow-hidden">
        <div
          className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl opacity-30 pointer-events-none"
          style={{ backgroundColor: nextPlayer.color }}
        />

        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
            RONDE {roundNumber} DARI {totalRounds}
          </span>
          <span className="text-slate-300">•</span>
          <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${levelBadge.className}`}>
            {levelBadge.name}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mb-5">
          GILIRAN PEMAIN LAIN
        </h2>

        {/* Next Player Spotlight Box */}
        <div
          className="p-6 rounded-2xl border-2 mb-5 transition-all relative overflow-hidden"
          style={{
            backgroundColor: `${nextPlayer.color}10`,
            borderColor: nextPlayer.color,
          }}
        >
          <div className="relative inline-block mb-3">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto shadow-md border-2 bg-white"
              style={{
                borderColor: nextPlayer.color,
              }}
            >
              {nextPlayer.avatar}
            </div>
            <span className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300 shadow-xs flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5 fill-current" />
              SIAP
            </span>
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Pemain Selanjutnya
          </span>
          <h3 className="text-3xl font-black text-slate-900 mt-0.5">
            {nextPlayer.name}
          </h3>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4 text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl shadow-xs border border-slate-200">
              <Trophy className="w-4 h-4 text-amber-500" />
              {nextPlayer.score} Poin
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl shadow-xs border border-slate-200">
              <Layers className="w-4 h-4 text-blue-600" />
              Grid {gridDimension}×{gridDimension} ({gridDimension * gridDimension} Kartu)
            </span>
            <span className="bg-white px-3 py-1.5 rounded-xl shadow-xs border border-slate-200 font-mono">
              ⏱️ {timeLimit} Detik
            </span>
          </div>
        </div>

        {/* Message for others */}
        <div className="bg-slate-50 rounded-xl p-3.5 mb-6 text-xs text-slate-600 border border-slate-200">
          <p className="font-semibold">
            💬 "Pemain lain harap bersiap dan serahkan perangkat ke{' '}
            <strong className="text-slate-900">{nextPlayer.name}</strong>. Hitungan mundur 3 detik akan dimulai!"
          </p>
        </div>

        {/* Ready Action Button */}
        <button
          type="button"
          id="ready-turn-btn"
          onClick={handleReadyClick}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-lg rounded-2xl shadow-lg shadow-blue-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>SAYA SIAP! MULAI GILIRAN (3..2..1)</span>
        </button>
      </div>
    </div>
  );
};

