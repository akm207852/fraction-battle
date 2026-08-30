import React, { useState, useEffect, useRef } from 'react';
import { Fraction, FractionCardData, Player } from '../types';
import { FractionDisplay } from './FractionDisplay';
import { sound } from '../utils/audio';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  Sparkles,
  Smartphone,
  Infinity as InfinityIcon,
} from 'lucide-react';

interface GameBoardProps {
  player: Player;
  roundNumber: number;
  totalRounds: number;
  targetFraction: Fraction;
  gridCards: FractionCardData[];
  gridDimension: number; // 8, 10, 12
  timeLimit: number; // in seconds (0 for unlimited, or 60, 120, 180, 240, 300)
  onFinishTurn: (selectedCardIds: string[], timeSpent: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  player,
  roundNumber,
  totalRounds,
  targetFraction,
  gridCards,
  gridDimension,
  timeLimit,
  onFinishTurn,
}) => {
  const isTimed = timeLimit > 0;
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(isTimed ? timeLimit : 0);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isSkipModalOpen, setIsSkipModalOpen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<'fit' | 'normal' | 'large'>('fit');
  const [comboCount, setComboCount] = useState<number>(0);
  const [showComboAnimation, setShowComboAnimation] = useState<string | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isFinishedRef = useRef<boolean>(false);
  const selectedCardIdsRef = useRef(selectedCardIds);
  selectedCardIdsRef.current = selectedCardIds;

  // Level determination: Level 1 (8x8), Level 2 (10x10), Level 3 (12x12)
  const currentLevel = gridDimension === 8 ? 1 : gridDimension === 10 ? 2 : 3;

  const levelInfo = {
    1: {
      badge: 'LEVEL 1 • GRID 8×8',
      title: 'Tingkat Dasar',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      tag: '64 Kartu',
    },
    2: {
      badge: 'LEVEL 2 • GRID 10×10',
      title: 'Tingkat Menengah',
      badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
      tag: '100 Kartu',
    },
    3: {
      badge: 'LEVEL 3 • GRID 12×12',
      title: 'Tingkat Master',
      badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
      tag: '144 Kartu',
    },
  }[currentLevel];

  // Helper format MM:SS
  const formatTimeDisplay = (seconds: number) => {
    if (seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Timer countdown
  useEffect(() => {
    startTimeRef.current = Date.now();
    isFinishedRef.current = false;
    setSelectedCardIds([]);

    if (!isTimed) {
      // Mode Tanpa Batas Waktu
      setTimeLeft(0);
      return;
    }

    // Mode Gunakan Waktu
    setTimeLeft(timeLimit);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (!isFinishedRef.current) {
            isFinishedRef.current = true;
            sound.playTimeUp();
            const timeSpent = timeLimit;
            // Auto finish on timeout with latest selected cards
            setTimeout(() => {
              onFinishTurn(selectedCardIdsRef.current, timeSpent);
            }, 100);
          }
          return 0;
        }

        if (prev <= 6 && prev > 1) {
          sound.playWarningTick();
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [player.id, roundNumber, timeLimit, isTimed]);

  const handleCardClick = (cardId: string) => {
    if (isFinishedRef.current) return;
    if (isTimed && timeLeft <= 0) return;

    if (selectedCardIds.includes(cardId)) {
      sound.playCardDeselect();
      setSelectedCardIds((prev) => prev.filter((id) => id !== cardId));
      setComboCount((prev) => Math.max(0, prev - 1));
    } else {
      sound.playCardSelect();
      setSelectedCardIds((prev) => [...prev, cardId]);
      const newCombo = comboCount + 1;
      setComboCount(newCombo);

      if (newCombo === 3) {
        sound.playComboSound(3);
        setShowComboAnimation('🔥 COMBO ×2! (3 Pilihan)');
        setTimeout(() => setShowComboAnimation(null), 1300);
      } else if (newCombo === 5) {
        sound.playComboSound(5);
        setShowComboAnimation('⚡ SUPER COMBO ×3! (5 Pilihan)');
        setTimeout(() => setShowComboAnimation(null), 1400);
      } else if (newCombo === 8) {
        sound.playComboSound(8);
        setShowComboAnimation('💥 GODLIKE COMBO ×4! (8 Pilihan)');
        setTimeout(() => setShowComboAnimation(null), 1600);
      }
    }
  };

  const handleFinishEarly = () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    const elapsedSeconds = isTimed
      ? Math.min(
          timeLimit,
          Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
        )
      : Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    setIsConfirmModalOpen(false);
    onFinishTurn(selectedCardIds, elapsedSeconds);
  };

  const handleSkipTurn = () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    const elapsedSeconds = isTimed
      ? Math.min(
          timeLimit,
          Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
        )
      : Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    setIsSkipModalOpen(false);
    onFinishTurn([], elapsedSeconds);
  };

  // Timer Progress Math & Urgency (<= 30s)
  const timerPercent = isTimed && timeLimit > 0 ? (timeLeft / timeLimit) * 100 : 100;
  const isUrgentTime = isTimed && timeLeft <= 30 && timeLeft > 0;
  const isCriticalTime = isTimed && timeLeft <= 10 && timeLeft > 0;

  // Grid styling based on dimension and zoom
  const getGridColsClass = () => {
    if (gridDimension === 8) {
      return 'grid-cols-8';
    } else if (gridDimension === 10) {
      return 'grid-cols-10';
    } else {
      return 'grid-cols-12';
    }
  };

  const getCardSizeProps = () => {
    if (zoomLevel === 'large') {
      return {
        size: 'md' as const,
        minHeight: 'min-h-[56px] sm:min-h-[64px]',
        minWidth: 'min-w-[52px] sm:min-w-[62px]',
      };
    }
    if (zoomLevel === 'normal') {
      return {
        size: gridDimension >= 12 ? ('xs' as const) : ('sm' as const),
        minHeight: 'min-h-[46px] sm:min-h-[52px]',
        minWidth: 'min-w-[42px] sm:min-w-[48px]',
      };
    }
    // 'fit'
    if (gridDimension === 8) {
      return {
        size: 'sm' as const,
        minHeight: 'min-h-[42px] sm:min-h-[48px]',
        minWidth: 'min-w-[36px] sm:min-w-[44px]',
      };
    } else if (gridDimension === 10) {
      return {
        size: 'xs' as const,
        minHeight: 'min-h-[38px] sm:min-h-[44px]',
        minWidth: 'min-w-[32px] sm:min-w-[40px]',
      };
    } else {
      return {
        size: 'xs' as const,
        minHeight: 'min-h-[34px] sm:min-h-[40px]',
        minWidth: 'min-w-[28px] sm:min-w-[36px]',
      };
    }
  };

  const cardConfig = getCardSizeProps();

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-4 relative">
      {/* Urgent Time Warning Vignette Overlay (<= 30 detik) */}
      {isUrgentTime && (
        <div
          className={`fixed inset-0 pointer-events-none border-4 sm:border-8 border-rose-500/80 shadow-[inset_0_0_60px_rgba(244,63,94,0.45)] z-40 ${
            isCriticalTime ? 'animate-pulse' : ''
          }`}
        />
      )}

      {/* Low Time Floating Alarm Badge (<= 30 detik) */}
      {isUrgentTime && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white text-xs sm:text-sm font-black px-4 py-1.5 rounded-full shadow-xl shadow-rose-600/40 animate-bounce border-2 border-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-300 animate-spin" />
          <span>WAKTU TINGGAL {timeLeft} DETIK! SELESAIKAN PILIHAN</span>
        </div>
      )}

      {/* Top Banner: Active Player, Level & Grid Info, Timer */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-5 shadow-sm border border-slate-200 mb-3 sm:mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          {/* Active Player Card */}
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm border-2 shrink-0"
              style={{
                backgroundColor: `${player.color}15`,
                borderColor: player.color,
              }}
            >
              {player.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  GILIRAN AKTIF
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  Ronde {roundNumber} dari {totalRounds}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 leading-tight truncate max-w-[180px] sm:max-w-none">
                {player.name}
              </h2>
            </div>
          </div>

          {/* Center Level Badge Tracker */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 shadow-xs ${levelInfo.badgeClass}`}>
              <Layers className="w-3.5 h-3.5" />
              <span>{levelInfo.badge}</span>
            </div>
            <span className="text-[11px] font-bold text-slate-500 hidden md:inline">
              ({levelInfo.tag})
            </span>
          </div>

          {/* Timer Display */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto sm:ml-0">
            {isTimed ? (
              <div
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border-2 transition-all ${
                  isUrgentTime
                    ? 'bg-rose-50 border-rose-500 text-rose-600 animate-pulse'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <Clock
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    isUrgentTime ? 'text-rose-500 animate-spin' : 'text-slate-500'
                  }`}
                />
                <div className="flex flex-col items-end leading-none">
                  <span className="text-xl sm:text-2xl font-mono font-black tracking-tight">
                    {formatTimeDisplay(timeLeft)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Sisa Waktu
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border-2 bg-slate-50 border-slate-200 text-slate-700">
                <InfinityIcon className="w-4 h-4 text-emerald-600" />
                <div className="flex flex-col items-end leading-none">
                  <span className="text-xs sm:text-sm font-black text-emerald-700">
                    Tanpa Batas
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Mode Santai
                  </span>
                </div>
              </div>
            )}

            {/* Quick Selected Pill */}
            <div className="flex flex-col items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-950 min-w-[70px] sm:min-w-[90px]">
              <span className="text-lg sm:text-xl font-black text-blue-700 leading-none">
                {selectedCardIds.length}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-blue-600 mt-0.5">
                Dipilih
              </span>
            </div>
          </div>
        </div>

        {/* Level Progression Breadcrumbs */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600">
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            <span className="text-slate-400 uppercase tracking-wider text-[10px] shrink-0">
              Sistem Level:
            </span>
            <span
              className={`px-2 py-0.5 rounded-md border shrink-0 ${
                currentLevel === 1
                  ? 'bg-emerald-500 text-white font-extrabold border-emerald-600 shadow-xs ring-2 ring-emerald-300'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              Level 1 (8×8)
            </span>
            <span className="text-slate-300">➔</span>
            <span
              className={`px-2 py-0.5 rounded-md border shrink-0 ${
                currentLevel === 2
                  ? 'bg-blue-600 text-white font-extrabold border-blue-700 shadow-xs ring-2 ring-blue-300'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              Level 2 (10×10)
            </span>
            <span className="text-slate-300">➔</span>
            <span
              className={`px-2 py-0.5 rounded-md border shrink-0 ${
                currentLevel === 3
                  ? 'bg-purple-600 text-white font-extrabold border-purple-700 shadow-xs ring-2 ring-purple-300'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              Level 3 (12×12)
            </span>
          </div>

          <span className="text-[10px] text-slate-400 font-semibold hidden sm:inline">
            Otomatis Berganti Tiap Ronde
          </span>
        </div>

        {/* Timer Progress Bar (Only shown in timed mode) */}
        {isTimed && (
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                isUrgentTime ? 'bg-rose-500' : 'bg-blue-600'
              }`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Target Fraction Showcase Banner */}
      <div className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl p-4 sm:p-6 text-white shadow-xl shadow-blue-900/10 mb-3 sm:mb-4 overflow-hidden border border-blue-600/50">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
          {/* Left Text */}
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-white/15 backdrop-blur-xs text-blue-100 rounded-full text-[11px] font-bold uppercase tracking-wider border border-white/20">
                <Flame className="w-3.5 h-3.5 text-amber-300" />
                Misi Ronde Ini
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-400/20 text-amber-200 rounded-full text-[11px] font-bold border border-amber-300/30">
                <Sparkles className="w-3 h-3 text-amber-300" />
                {levelInfo.badge}
              </span>
            </div>
            <h3 className="text-base sm:text-xl font-black tracking-tight text-white">
              PILIH PECAHAN YANG SENILAI DENGAN:
            </h3>
            <p className="text-[11px] sm:text-xs text-blue-100/90 mt-0.5">
              Kalikan atau bagi pembilang dan penyebut dengan angka yang sama (a × d === b × c).
            </p>
          </div>

          {/* Giant Target Fraction Card */}
          <div className="shrink-0 bg-white text-slate-900 px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-2xl shadow-lg border-2 border-amber-300 transform hover:scale-105 transition-transform flex flex-col items-center">
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-0.5">
              PECAHAN TARGET
            </span>
            <FractionDisplay
              numerator={targetFraction.numerator}
              denominator={targetFraction.denominator}
              size="lg"
            />
          </div>
        </div>
      </div>

      {/* Grid Controls & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <span className="bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg">
            Level {currentLevel}: Grid {gridDimension} × {gridDimension} ({gridCards.length} Kartu)
          </span>
          <span className="text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
            {selectedCardIds.length} dipilih
          </span>
        </div>

        {/* Zoom Toggles (Optimized for Smartphone & Desktop) */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setZoomLevel('fit')}
            className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
              zoomLevel === 'fit'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Muat Layar Penuh (Fit All)"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">Pas Layar</span>
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel('normal')}
            className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
              zoomLevel === 'normal'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Ukuran Normal"
          >
            <Smartphone className="w-3 h-3" />
            <span className="hidden sm:inline">Normal</span>
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel('large')}
            className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
              zoomLevel === 'large'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Perbesar Kartu (Scroll Horizontal & Vertikal)"
          >
            <ZoomIn className="w-3 h-3" />
            <span className="hidden sm:inline">Besar</span>
          </button>
        </div>
      </div>

      {/* Floating Combo Popup Notification */}
      {showComboAnimation && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm sm:text-base px-5 py-2 rounded-2xl shadow-xl shadow-amber-500/30 border-2 border-white animate-bounce pointer-events-none">
          {showComboAnimation}
        </div>
      )}

      {/* Interactive Fraction Matrix Grid */}
      <div className="bg-slate-100/90 rounded-3xl p-2 sm:p-4 border-2 border-slate-200/80 shadow-inner overflow-x-auto max-h-[62vh] overflow-y-auto">
        <div className={`grid ${getGridColsClass()} gap-1 sm:gap-1.5 min-w-max mx-auto justify-center`}>
          {gridCards.map((card) => {
            const isSelected = selectedCardIds.includes(card.id);
            return (
              <button
                type="button"
                key={card.id}
                id={`card-${card.id}`}
                onClick={() => handleCardClick(card.id)}
                className={`relative flex items-center justify-center p-1 sm:p-1.5 rounded-xl border-2 transition-all select-none cursor-pointer transform active:scale-95 ${cardConfig.minWidth} ${cardConfig.minHeight} ${
                  isSelected
                    ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-[1.02] z-10'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 text-slate-800 shadow-2xs'
                }`}
              >
                {/* Active checkmark badge */}
                {isSelected && (
                  <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black shadow-xs">
                    ✓
                  </span>
                )}

                <FractionDisplay
                  numerator={card.numerator}
                  denominator={card.denominator}
                  size={cardConfig.size}
                  textColor={isSelected ? 'text-white' : 'text-slate-900'}
                  lineColor={isSelected ? 'bg-white' : 'bg-slate-800'}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 sm:mt-4 pt-1 sm:pt-2">
        <button
          type="button"
          id="skip-turn-btn"
          onClick={() => setIsSkipModalOpen(true)}
          className="px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
        >
          Lewati Giliran
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            id="finish-turn-btn"
            onClick={() => setIsConfirmModalOpen(true)}
            className="px-5 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm sm:text-base rounded-xl shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>SELESAI & KUNCI JAWABAN ({selectedCardIds.length})</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal: Finish Early */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Kunci Jawaban?
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Kamu telah memilih{' '}
              <strong className="text-blue-600">{selectedCardIds.length} kartu</strong> pada{' '}
              <strong className="text-slate-800">Grid {gridDimension}×{gridDimension}</strong>.
              {isTimed ? (
                <>
                  {' '}Sisa waktu <strong className="text-slate-800">{formatTimeDisplay(timeLeft)}</strong>.
                </>
              ) : (
                <>
                  {' '}Waktu: <strong className="text-emerald-700">Tanpa Batas</strong>.
                </>
              )}
              {' '}Yakin ingin mengakhiri giliran sekarang?
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="py-2.5 sm:py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer text-xs sm:text-sm"
              >
                KEMBALI
              </button>
              <button
                type="button"
                id="confirm-finish-btn"
                onClick={handleFinishEarly}
                className="py-2.5 sm:py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer text-xs sm:text-sm"
              >
                YA, SELESAIKAN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Skip Turn */}
      {isSkipModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Lewati Giliran Ini?
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Jika dilewati, kamu tidak akan mendapatkan poin pada ronde ini.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsSkipModalOpen(false)}
                className="py-2.5 sm:py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer text-xs sm:text-sm"
              >
                BATAL
              </button>
              <button
                type="button"
                id="confirm-skip-btn"
                onClick={handleSkipTurn}
                className="py-2.5 sm:py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer text-xs sm:text-sm"
              >
                YA, LEWATI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
