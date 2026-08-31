import React, { useState } from 'react';
import {
  GameMode,
  Player,
  TeacherConfig,
  DifficultyLevel,
  GridSizeOption,
  Fraction,
  TimeMode,
  DurationMinutes,
  GameTimeConfig,
} from '../types';
import {
  Users,
  Zap,
  Trophy,
  BookOpen,
  Play,
  Check,
  GraduationCap,
  Sliders,
  Clock,
  Flame,
  CheckSquare,
  Square,
  Sparkles,
  User,
  Infinity as InfinityIcon,
  Timer,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { GRADE_4_TARGET_FRACTIONS } from '../utils/mathEngine';

interface PlayerSetupProps {
  onStartGame: (
    players: Player[],
    mode: GameMode,
    timeConfig: GameTimeConfig,
    teacherConfig?: TeacherConfig
  ) => void;
}

const AVATAR_OPTIONS = [
  '🦊', '🦁', '🐼', '🐯', '🦄', '🚀', '⚡', '🦖',
  '🦉', '🐳', '🦅', '🌟', '🤖', '🎯', '👑', '🏆'
];

const DEFAULT_NAMES = [
  'Andi', 'Budi', 'Citra', 'Dimas', 'Eka', 'Fani', 'Gilang', 'Hani'
];

const PLAYER_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

export const PlayerSetup: React.FC<PlayerSetupProps> = ({ onStartGame }) => {
  const [mode, setMode] = useState<GameMode>('quick');
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [playersData, setPlayersData] = useState<
    { name: string; avatar: string; color: string }[]
  >(() =>
    DEFAULT_NAMES.map((name, i) => ({
      name,
      avatar: AVATAR_OPTIONS[i % AVATAR_OPTIONS.length],
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
    }))
  );

  // Time configurations
  const [timeMode, setTimeMode] = useState<TimeMode>('timed');
  const [durationMinutes, setDurationMinutes] = useState<DurationMinutes>(3);

  // Teacher Mode configurations
  const [teacherRounds, setTeacherRounds] = useState<number>(5);
  const [teacherGridSize, setTeacherGridSize] = useState<GridSizeOption>('auto');
  const [teacherDifficulty, setTeacherDifficulty] =
    useState<DifficultyLevel>('mixed');
  const [selectedCustomFractions, setSelectedCustomFractions] = useState<
    Fraction[]
  >([]);

  const [activeAvatarModalIndex, setActiveAvatarModalIndex] = useState<number | null>(
    null
  );

  const handleModeChange = (newMode: GameMode) => {
    sound.playCardSelect();
    setMode(newMode);
    if (newMode === 'training') {
      setPlayerCount(1);
    }
  };

  const handlePlayerCountChange = (count: number) => {
    sound.playCardSelect();
    setPlayerCount(count);
  };

  const handleTimeModeChange = (newTimeMode: TimeMode) => {
    sound.playCardSelect();
    setTimeMode(newTimeMode);
  };

  const handleDurationChange = (dur: DurationMinutes) => {
    sound.playCardSelect();
    setDurationMinutes(dur);
  };

  const handleNameChange = (index: number, newName: string) => {
    const updated = [...playersData];
    updated[index].name = newName;
    setPlayersData(updated);
  };

  const handleAvatarSelect = (index: number, avatar: string) => {
    sound.playCardSelect();
    const updated = [...playersData];
    updated[index].avatar = avatar;
    setPlayersData(updated);
    setActiveAvatarModalIndex(null);
  };

  const toggleTargetFraction = (frac: Fraction) => {
    sound.playCardSelect();
    const exists = selectedCustomFractions.some(
      (f) => f.numerator === frac.numerator && f.denominator === frac.denominator
    );
    if (exists) {
      setSelectedCustomFractions((prev) =>
        prev.filter(
          (f) =>
            !(
              f.numerator === frac.numerator &&
              f.denominator === frac.denominator
            )
        )
      );
    } else {
      setSelectedCustomFractions((prev) => [...prev, frac]);
    }
  };

  const selectAllTargetFractions = () => {
    sound.playCardSelect();
    if (selectedCustomFractions.length === GRADE_4_TARGET_FRACTIONS.length) {
      setSelectedCustomFractions([]);
    } else {
      setSelectedCustomFractions([...GRADE_4_TARGET_FRACTIONS]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playRoundComplete();

    const timeLimitSeconds = timeMode === 'unlimited' ? 0 : durationMinutes * 60;
    const timeConfig: GameTimeConfig = {
      mode: timeMode,
      durationMinutes,
      timeLimitSeconds,
    };

    const activePlayers: Player[] = playersData
      .slice(0, playerCount)
      .map((p, idx) => ({
        id: `player_${idx + 1}`,
        name: p.name.trim() || (playerCount === 1 ? 'Pemain 1' : `Pemain ${idx + 1}`),
        avatar: p.avatar,
        color: p.color,
        score: 0,
        roundsPlayed: 0,
        totalCorrect: 0,
        totalWrong: 0,
        totalMissed: 0,
        totalTimeSpent: 0,
        highestCombo: 0,
      }));

    let teacherConfig: TeacherConfig | undefined = undefined;
    if (mode === 'teacher') {
      teacherConfig = {
        playerCount,
        totalRounds: teacherRounds,
        gridDimension: teacherGridSize,
        timeLimit: timeLimitSeconds,
        difficulty: teacherDifficulty,
        selectedTargetFractions:
          selectedCustomFractions.length > 0
            ? selectedCustomFractions
            : undefined,
      };
    }

    onStartGame(activePlayers, mode, timeConfig, teacherConfig);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Title Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-100 border border-amber-300 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          <span>⚔️ Media Pembelajaran Matematika Interaktif Kelas 4 SD</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
          FRACTION BATTLE
        </h1>
        <p className="text-lg font-semibold text-blue-700 mt-1">
          "Battle Pecahan Senilai"
        </p>
        <p className="text-sm text-slate-600 max-w-lg mx-auto mt-2">
          Kompetisi akademik menguji ketangkasan, ketelitian, dan penguasaan konsep pecahan senilai secara interaktif!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Section 1: Mode Selection */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
            PILIH MODE PERMAINAN
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Quick Battle */}
            <button
              type="button"
              id="mode-quick-btn"
              onClick={() => handleModeChange('quick')}
              className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                mode === 'quick'
                  ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <Zap className="w-5 h-5" />
                </span>
                {mode === 'quick' && (
                  <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <span className="font-bold text-slate-900 text-base mt-2">
                Quick Battle
              </span>
              <span className="text-xs font-semibold text-blue-600">5 Ronde Cepat</span>
              <p className="text-xs text-slate-500 mt-1">
                Format standar. Grid bertahap 8×8, 10×10, hingga 12×12.
              </p>
            </button>

            {/* Champion Battle */}
            <button
              type="button"
              id="mode-champion-btn"
              onClick={() => handleModeChange('champion')}
              className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                mode === 'champion'
                  ? 'border-amber-500 bg-amber-50/70 shadow-sm ring-2 ring-amber-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                  <Trophy className="w-5 h-5" />
                </span>
                {mode === 'champion' && (
                  <span className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <span className="font-bold text-slate-900 text-base mt-2">
                Champion Battle
              </span>
              <span className="text-xs font-semibold text-amber-600">10 Ronde Juara</span>
              <p className="text-xs text-slate-500 mt-1">
                Turnamen penuh penentuan gelar juara matematika kelas.
              </p>
            </button>

            {/* Training Mode */}
            <button
              type="button"
              id="mode-training-btn"
              onClick={() => handleModeChange('training')}
              className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                mode === 'training'
                  ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </span>
                {mode === 'training' && (
                  <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <span className="font-bold text-slate-900 text-base mt-2">
                Latihan Mandiri
              </span>
              <span className="text-xs font-semibold text-emerald-600">
                1 Pemain (Bebas)
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Latihan mandiri tanpa tekanan untuk memperkuat pemahaman pecahan.
              </p>
            </button>

            {/* Teacher Mode */}
            <button
              type="button"
              id="mode-teacher-btn"
              onClick={() => handleModeChange('teacher')}
              className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                mode === 'teacher'
                  ? 'border-purple-600 bg-purple-50/80 shadow-sm ring-2 ring-purple-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                  <GraduationCap className="w-5 h-5" />
                </span>
                {mode === 'teacher' && (
                  <span className="w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <span className="font-bold text-slate-900 text-base mt-2">
                Teacher Mode
              </span>
              <span className="text-xs font-semibold text-purple-600">
                Kustom Penuh Guru 🎓
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Atur siswa, ronde, grid, waktu, kesulitan, pecahan & download laporan.
              </p>
            </button>
          </div>
        </div>

        {/* Section 2: Player Count Selection */}
        {mode !== 'training' && (
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  {mode === 'teacher' ? 'JUMLAH SISWA / PESERTA' : 'JUMLAH PEMAIN'}
                </label>
                <p className="text-xs text-slate-500">
                  {playerCount === 1
                    ? 'Mode Solo: Bermain mandiri langsung tanpa pergantian giliran'
                    : 'Pilih jumlah siswa yang akan bertanding secara bergiliran'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-slate-800 font-bold text-sm bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {playerCount === 1 ? (
                  <User className="w-4 h-4 text-blue-600" />
                ) : (
                  <Users className="w-4 h-4 text-blue-600" />
                )}
                <span>
                  {playerCount} {mode === 'teacher' ? 'Siswa' : 'Pemain'}{' '}
                  {playerCount === 1 && '(Solo)'}
                </span>
              </div>
            </div>

            {/* 1 - 8 Player Selection Buttons */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                <button
                  type="button"
                  key={count}
                  id={`player-count-btn-${count}`}
                  onClick={() => handlePlayerCountChange(count)}
                  className={`h-12 rounded-xl font-black text-base transition-all flex flex-col items-center justify-center cursor-pointer ${
                    playerCount === count
                      ? mode === 'teacher'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-200 scale-105 ring-2 ring-purple-400'
                        : 'bg-blue-600 text-white shadow-md shadow-blue-200 scale-105 ring-2 ring-blue-400'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{count}</span>
                  <span className="text-[9px] font-bold opacity-80 -mt-0.5">
                    {count === 1 ? 'Solo' : 'Pemain'}
                  </span>
                </button>
              ))}
            </div>

            {/* Solo Battle Explanatory Pill */}
            {playerCount === 1 && (
              <div className="mt-3 text-xs text-blue-900 bg-blue-50 p-3 rounded-xl border border-blue-200 flex items-center gap-2">
                <span className="text-base">👤</span>
                <div>
                  <strong>Mode 1 Pemain (Solo Battle):</strong> Siswa langsung mengerjakan seluruh ronde permainan secara mandiri tanpa menunggu giliran pemain lain. Skor dan asesmen dihitung penuh!
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section 3: Time Settings (Mode Waktu & Durasi) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-blue-600" />
                PENGATURAN WAKTU PERMAINAN
              </label>
              <p className="text-xs text-slate-500">
                Pilih apakah ronde dibatasi waktu hitungan mundur atau tanpa batas waktu
              </p>
            </div>
          </div>

          {/* Time Mode Toggle Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {/* Tanpa Batas Waktu */}
            <button
              type="button"
              id="time-mode-unlimited-btn"
              onClick={() => handleTimeModeChange('unlimited')}
              className={`p-3.5 rounded-xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
                timeMode === 'unlimited'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    timeMode === 'unlimited'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <InfinityIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-black text-sm text-slate-900">
                    Tanpa Batas Waktu
                  </span>
                  <span className="text-xs text-slate-500">
                    Bermain santai & teliti tanpa countdown
                  </span>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  timeMode === 'unlimited'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-300'
                }`}
              >
                {timeMode === 'unlimited' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>

            {/* Gunakan Waktu */}
            <button
              type="button"
              id="time-mode-timed-btn"
              onClick={() => handleTimeModeChange('timed')}
              className={`p-3.5 rounded-xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
                timeMode === 'timed'
                  ? 'border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-500/20 shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    timeMode === 'timed'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-black text-sm text-slate-900">
                    Gunakan Waktu (Countdown)
                  </span>
                  <span className="text-xs text-slate-500">
                    Tantangan berpacu dengan timer (1 - 5 Menit)
                  </span>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  timeMode === 'timed'
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300'
                }`}
              >
                {timeMode === 'timed' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>
          </div>

          {/* Duration Choices (Only visible when Gunakan Waktu is selected) */}
          {timeMode === 'timed' && (
            <div className="pt-3 border-t border-slate-100 animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-slate-600 mb-2">
                PILIH DURASI WAKTU PER RONDE:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {([1, 2, 3, 4, 5] as DurationMinutes[]).map((dur) => (
                  <button
                    type="button"
                    key={dur}
                    id={`duration-btn-${dur}m`}
                    onClick={() => handleDurationChange(dur)}
                    className={`py-2.5 px-3 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                      durationMinutes === dur
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="block text-sm font-black">{dur} Menit</span>
                    <span className="text-[10px] opacity-80">
                      {dur * 60} Detik {dur === 3 && '⭐'}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                ⏱️ Waktu hitungan mundur {durationMinutes} menit ({durationMinutes * 60} detik) berlaku untuk setiap giliran ronde siswa. Peringatan merah akan muncul saat tersisa ≤ 30 detik.
              </p>
            </div>
          )}
        </div>

        {/* Dedicated Teacher Mode Configuration Panel */}
        {mode === 'teacher' && (
          <div className="bg-purple-50/60 rounded-3xl p-5 sm:p-7 border-2 border-purple-200 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-purple-200/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">
                    PANEL PENGATURAN GURU (TEACHER CONTROL)
                  </h3>
                  <p className="text-xs text-purple-800 font-medium">
                    Sesuaikan parameter asesmen dan materi pecahan sesuai RPP & kemampuan siswa
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-purple-200/80 text-purple-900 text-xs font-extrabold rounded-full">
                <GraduationCap className="w-3.5 h-3.5" />
                Mode Asesmen & Pembelajaran
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* 1. Jumlah Ronde */}
              <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-2xs">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-purple-600" />
                  Jumlah Ronde Permainan
                </label>
                <p className="text-[11px] text-slate-500 mb-3">
                  Tentukan berapa banyak babak soal yang akan dikerjakan siswa
                </p>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 5, 10].map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => {
                        sound.playCardSelect();
                        setTeacherRounds(r);
                      }}
                      className={`h-10 rounded-xl font-black text-sm border transition-all cursor-pointer ${
                        teacherRounds === r
                          ? 'border-purple-600 bg-purple-600 text-white shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {r} Ronde
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Ukuran Matrix Grid */}
              <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-2xs">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Ukuran Grid Pecahan
                </label>
                <p className="text-[11px] text-slate-500 mb-3">
                  Pilih ukuran papan pecahan atau biarkan otomatis bertahap
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playCardSelect();
                      setTeacherGridSize('auto');
                    }}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      teacherGridSize === 'auto'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 font-extrabold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs font-black">Otomatis (Bertahap)</span>
                    <span className="text-[10px] text-slate-500">8×8 ➔ 10×10 ➔ 12×12</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playCardSelect();
                      setTeacherGridSize(8);
                    }}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      teacherGridSize === 8
                        ? 'border-purple-600 bg-purple-50 text-purple-900 font-extrabold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs font-black">8 × 8 (64 Kartu)</span>
                    <span className="text-[10px] text-slate-500">Tingkat Dasar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playCardSelect();
                      setTeacherGridSize(10);
                    }}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      teacherGridSize === 10
                        ? 'border-purple-600 bg-purple-50 text-purple-900 font-extrabold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs font-black">10 × 10 (100 Kartu)</span>
                    <span className="text-[10px] text-slate-500">Tingkat Menengah</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playCardSelect();
                      setTeacherGridSize(12);
                    }}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      teacherGridSize === 12
                        ? 'border-purple-600 bg-purple-50 text-purple-900 font-extrabold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs font-black">12 × 12 (144 Kartu)</span>
                    <span className="text-[10px] text-slate-500">Tantangan Maksimal</span>
                  </button>
                </div>
              </div>

              {/* 3. Tingkat Kesulitan */}
              <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-2xs md:col-span-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Tingkat Kesulitan Pecahan
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playCardSelect();
                      setTeacherDifficulty('easy');
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      teacherDifficulty === 'easy'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-extrabold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs font-black text-emerald-700">Mudah (Dasar)</span>
                    <span className="text-[10px] text-slate-500">1/2, 1/3, 1/4, 2/3, 3/4</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playCardSelect();
                      setTeacherDifficulty('medium');
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      teacherDifficulty === 'medium'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-extrabold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs font-black text-blue-700">Sedang</span>
                    <span className="text-[10px] text-slate-500">Penyebut 5 & 6 (2/5, 5/6)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playCardSelect();
                      setTeacherDifficulty('hard');
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      teacherDifficulty === 'hard'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 font-extrabold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs font-black text-purple-700">Menantang</span>
                    <span className="text-[10px] text-slate-500">Penyebut 7, 8, 9, 10</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playCardSelect();
                      setTeacherDifficulty('mixed');
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      teacherDifficulty === 'mixed'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-extrabold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs font-black text-indigo-700">Campuran / Progresif</span>
                    <span className="text-[10px] text-slate-500">Menyesuaikan babak ronde</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Pemilihan Pecahan Target Spesifik (Custom List) */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-purple-100 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    PILIHAN PECAHAN TARGET SPESIFIK (OPSIONAL)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Klik pecahan di bawah jika ingin menguji pecahan target tertentu. Kosongkan untuk memilih otomatis.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={selectAllTargetFractions}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 cursor-pointer"
                >
                  {selectedCustomFractions.length === GRADE_4_TARGET_FRACTIONS.length ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Hapus Semua Pilihan</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5" />
                      <span>Pilih Semua ({GRADE_4_TARGET_FRACTIONS.length} Pecahan)</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
                {GRADE_4_TARGET_FRACTIONS.map((frac, idx) => {
                  const isSelected = selectedCustomFractions.some(
                    (f) =>
                      f.numerator === frac.numerator &&
                      f.denominator === frac.denominator
                  );
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => toggleTargetFraction(frac)}
                      className={`p-2 rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50 shadow-xs ring-1 ring-purple-500'
                          : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="font-black text-sm">
                          {frac.numerator}/{frac.denominator}
                        </span>
                        {isSelected && (
                          <Check className="w-3 h-3 text-purple-600 stroke-[3]" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedCustomFractions.length > 0 && (
                <div className="mt-3 text-xs text-purple-800 font-semibold bg-purple-100/70 p-2.5 rounded-xl border border-purple-200 flex items-center justify-between">
                  <span>
                    🎯 {selectedCustomFractions.length} pecahan target terpilih untuk diujikan secara berurutan.
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCustomFractions([])}
                    className="underline text-[11px] hover:text-purple-950 cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 4: Player Details (Names & Avatars) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
              {playerCount === 1 ? 'PROFIL PEMAIN (SOLO BATTLE)' : mode === 'teacher' ? 'DAFTAR NAMA SISWA' : 'PROFIL PEMAIN'}
            </label>
            <span className="text-xs text-slate-400 font-medium">
              Ketik nama siswa untuk sertifikat & laporan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: playerCount }).map((_, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 transition-all ${
                  mode === 'teacher'
                    ? 'focus-within:border-purple-500 focus-within:bg-white'
                    : 'focus-within:border-blue-500 focus-within:bg-white'
                }`}
              >
                {/* Avatar Button */}
                <button
                  type="button"
                  id={`avatar-btn-${idx}`}
                  onClick={() => setActiveAvatarModalIndex(idx)}
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-white border-2 border-slate-200 hover:scale-105 shadow-sm transition-transform cursor-pointer shrink-0"
                  title="Klik untuk ganti avatar"
                >
                  {playersData[idx].avatar}
                </button>

                {/* Name Input */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-400">
                      {playerCount === 1 ? 'Pemain Utama' : mode === 'teacher' ? `Siswa ${idx + 1}` : `Pemain ${idx + 1}`}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: playersData[idx].color }}
                    />
                  </div>
                  <input
                    type="text"
                    id={`player-name-input-${idx}`}
                    value={playersData[idx].name}
                    onChange={(e) => handleNameChange(idx, e.target.value)}
                    maxLength={20}
                    placeholder={playerCount === 1 ? 'Nama Kamu' : mode === 'teacher' ? `Nama Siswa ${idx + 1}` : `Nama Pemain ${idx + 1}`}
                    className="w-full bg-transparent font-bold text-slate-800 text-sm focus:outline-none placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Game Action */}
        <div className="pt-2">
          <button
            type="submit"
            id="start-game-btn"
            className={`w-full py-4 px-6 font-extrabold text-lg rounded-2xl shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer ${
              mode === 'teacher'
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white shadow-purple-500/25'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25'
            }`}
          >
            <Play className="w-6 h-6 fill-current" />
            <span>
              {playerCount === 1
                ? 'MULAI SOLO BATTLE SEKARANG!'
                : mode === 'teacher'
                ? 'MULAI SESI TEACHER MODE'
                : 'MULAI BATTLE SEKARANG!'}
            </span>
          </button>
        </div>
      </form>

      {/* Avatar Selection Modal */}
      {activeAvatarModalIndex !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Pilih Avatar {playerCount === 1 ? 'Pemain' : `Pemain ${activeAvatarModalIndex + 1}`}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pilih karakter ikon favorit
            </p>

            <div className="grid grid-cols-4 gap-2.5 mb-6">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => handleAvatarSelect(activeAvatarModalIndex, av)}
                  className={`h-14 rounded-xl text-2xl flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                    playersData[activeAvatarModalIndex].avatar === av
                      ? 'bg-purple-100 border-2 border-purple-500 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setActiveAvatarModalIndex(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
