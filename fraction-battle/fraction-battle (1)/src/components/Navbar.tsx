import React from 'react';
import { Volume2, VolumeX, HelpCircle, RotateCcw } from 'lucide-react';
import { GameMode, GamePhase } from '../types';

interface NavbarProps {
  phase: GamePhase;
  mode: GameMode;
  currentRound: number;
  totalRounds: number;
  gridDimension?: number;
  isMuted: boolean;
  onToggleSound: () => void;
  onOpenHelp: () => void;
  onResetGame: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  phase,
  mode,
  currentRound,
  totalRounds,
  gridDimension = 8,
  isMuted,
  onToggleSound,
  onOpenHelp,
  onResetGame,
}) => {
  const getModeLabel = () => {
    if (mode === 'quick') return 'Quick Battle';
    if (mode === 'champion') return 'Champion Battle';
    if (mode === 'teacher') return 'Teacher Mode 🎓';
    return 'Latihan Mandiri';
  };

  const level = gridDimension === 8 ? 1 : gridDimension === 10 ? 2 : 3;
  const levelBadgeClass =
    level === 1
      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
      : level === 2
      ? 'bg-blue-50 text-blue-800 border-blue-300'
      : 'bg-purple-50 text-purple-800 border-purple-300';

  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-black shadow-md shadow-blue-500/20">
            ➗
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-slate-900 text-base sm:text-lg tracking-tight leading-none">
                FRACTION BATTLE
              </h1>
              {phase !== 'setup' && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                  {getModeLabel()}
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 hidden sm:block">
              Battle Pecahan Senilai SD Kelas 4
            </p>
          </div>
        </div>

        {/* Center Round & Level Badge (When in game) */}
        {phase !== 'setup' && phase !== 'game_over' && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="text-xs font-bold text-slate-500 uppercase">
                Ronde
              </span>
              <span className="text-sm font-black text-blue-700">
                {currentRound} / {totalRounds}
              </span>
            </div>

            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-black shadow-2xs ${levelBadgeClass}`}>
              <span>Level {level} ({gridDimension}×{gridDimension})</span>
            </div>
          </div>
        )}

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            id="sound-toggle-btn"
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title={isMuted ? 'Nyalakan Suara (Unmute)' : 'Matikan Suara (Mute)'}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          {/* Help Modal */}
          <button
            type="button"
            id="help-guide-btn"
            onClick={onOpenHelp}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Panduan Bermain"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Reset / Home */}
          {phase !== 'setup' && (
            <button
              type="button"
              id="reset-game-nav-btn"
              onClick={onResetGame}
              className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Mulai Ulang / Keluar ke Menu"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
