import React, { useEffect, useState } from 'react';
import { Player, GameMode, TeacherConfig } from '../types';
import {
  generateLearningAnalysis,
  getMasteryCategory,
} from '../utils/mathEngine';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  Zap,
  Target,
  Brain,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Flame,
  Download,
  Printer,
  GraduationCap,
  Check,
} from 'lucide-react';

interface FinalResultsProps {
  players: Player[];
  mode?: GameMode;
  teacherConfig?: TeacherConfig;
  totalRounds?: number;
  onRestart: () => void;
}

export const FinalResults: React.FC<FinalResultsProps> = ({
  players,
  mode = 'quick',
  teacherConfig,
  totalRounds = 5,
  onRestart,
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(
    players[0]?.id || ''
  );
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Sort players by score
  const rankedPlayers = [...players].sort((a, b) => b.score - a.score);
  const champion = rankedPlayers[0];

  // Calculate Badges
  // 1. Fraction Master: Highest Score (Champion)
  const fractionMaster = champion;

  // 2. Perfect Accuracy: Highest Accuracy
  const accuracyRanked = [...players].sort((a, b) => {
    const accA =
      a.totalCorrect + a.totalWrong > 0
        ? a.totalCorrect / (a.totalCorrect + a.totalWrong)
        : 0;
    const accB =
      b.totalCorrect + b.totalWrong > 0
        ? b.totalCorrect / (b.totalCorrect + b.totalWrong)
        : 0;
    return accB - accA;
  });
  const accuracyMaster = accuracyRanked[0];

  // 3. Speed Master: Lowest average time per round
  const speedRanked = [...players].sort((a, b) => {
    const avgA = a.roundsPlayed > 0 ? a.totalTimeSpent / a.roundsPlayed : 999;
    const avgB = b.roundsPlayed > 0 ? b.totalTimeSpent / b.roundsPlayed : 999;
    return avgA - avgB;
  });
  const speedMaster = speedRanked[0];

  // 4. Fraction Expert: Most total equivalent fractions found
  const expertRanked = [...players].sort((a, b) => b.totalCorrect - a.totalCorrect);
  const expertMaster = expertRanked[0];

  // 5. Combo Gladiator: Highest combo streak in the game
  const comboRanked = [...players].sort((a, b) => b.highestCombo - a.highestCombo);
  const comboMaster = comboRanked[0];

  // Trigger celebration on mount
  useEffect(() => {
    sound.playVictoryFanfare();
    try {
      // Multi-wave celebratory confetti cannon
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6'],
      });

      const timeout1 = setTimeout(() => {
        confetti({
          particleCount: 70,
          angle: 60,
          spread: 65,
          origin: { x: 0.1, y: 0.65 },
          colors: ['#F59E0B', '#FCD34D', '#FFFFFF'],
        });
        confetti({
          particleCount: 70,
          angle: 120,
          spread: 65,
          origin: { x: 0.9, y: 0.65 },
          colors: ['#3B82F6', '#60A5FA', '#FFFFFF'],
        });
      }, 400);

      const timeout2 = setTimeout(() => {
        confetti({
          particleCount: 90,
          spread: 100,
          origin: { y: 0.4 },
        });
      }, 900);

      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    } catch {
      // safe fallback
    }
  }, []);

  const activeAnalysisPlayer =
    players.find((p) => p.id === selectedPlayerId) || rankedPlayers[0];

  const avgTime =
    activeAnalysisPlayer.roundsPlayed > 0
      ? Math.round(
          (activeAnalysisPlayer.totalTimeSpent /
            activeAnalysisPlayer.roundsPlayed) *
            10
        ) / 10
      : 0;

  const analysis = generateLearningAnalysis(
    activeAnalysisPlayer.totalCorrect,
    activeAnalysisPlayer.totalWrong,
    activeAnalysisPlayer.totalMissed,
    avgTime
  );

  // Function to Export CSV of the student report
  const handleDownloadCSV = () => {
    sound.playCardSelect();
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const headers = [
      'Peringkat',
      'Nama Siswa',
      'Skor',
      'Jumlah Benar',
      'Jumlah Salah',
      'Akurasi (%)',
      'Waktu Rata-rata (detik)',
      'Jumlah Pecahan Senilai Ditemukan',
      'Jumlah Kesalahan',
      'Kategori Penguasaan',
      'Predikat',
      'Catatan Rekomendasi Guru',
    ];

    const rows = rankedPlayers.map((p, idx) => {
      const totalSelected = p.totalCorrect + p.totalWrong;
      const acc =
        totalSelected > 0 ? Math.round((p.totalCorrect / totalSelected) * 100) : 0;
      const pAvgTime =
        p.roundsPlayed > 0
          ? Math.round((p.totalTimeSpent / p.roundsPlayed) * 10) / 10
          : 0;
      const mastery = getMasteryCategory(acc, p.totalCorrect, p.totalWrong);
      const studentAnalysis = generateLearningAnalysis(
        p.totalCorrect,
        p.totalWrong,
        p.totalMissed,
        pAvgTime
      );

      return [
        idx + 1,
        `"${p.name.replace(/"/g, '""')}"`,
        p.score,
        p.totalCorrect,
        p.totalWrong,
        `${acc}%`,
        `${pAvgTime}s`,
        p.totalCorrect,
        p.totalWrong,
        `"${mastery.category}"`,
        `"${studentAnalysis.grade}"`,
        `"${studentAnalysis.recommendation.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      `LAPORAN HASIL ASESMEN MATEMATIKA - FRACTION BATTLE (PECAHAN SENILAI KELAS 4 SD)\n` +
      `Tanggal: ${dateStr}, Mode Permainan: ${mode.toUpperCase()}, Total Ronde: ${totalRounds}\n\n` +
      headers.join(',') +
      '\n' +
      rows.join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Laporan_Fraction_Battle_Kelas4_${now.toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handlePrint = () => {
    sound.playCardSelect();
    window.print();
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Victory Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 bg-amber-100 border border-amber-300 text-amber-900 rounded-full text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
          HASIL AKHIR PERTANDINGAN
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
          🏆 FRACTION BATTLE SELESAI!
        </h1>
        <p className="text-slate-600 font-semibold mt-1">
          Selamat kepada seluruh pejuang matematika atas kegigihan dan ketelitiannya!
        </p>
      </div>

      {/* Podium Showcase */}
      <div className="bg-gradient-to-b from-blue-700 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="text-center mb-6">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-300">
            KLASEMEN AKHIR JUARA
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-1">
            Daftar Juara Kelas
          </h2>
        </div>

        {/* Podium Pillars */}
        <div className="flex flex-wrap items-end justify-center gap-3 sm:gap-4 max-w-3xl mx-auto pt-4 pb-2">
          {/* 2nd Place (Silver) */}
          {rankedPlayers[1] && (
            <div className="flex-1 min-w-[130px] max-w-[190px] flex flex-col items-center order-1 sm:order-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white text-3xl flex items-center justify-center shadow-lg border-2 border-slate-300 mb-2">
                {rankedPlayers[1].avatar}
              </div>
              <span className="font-extrabold text-sm sm:text-base text-slate-200 truncate max-w-full">
                {rankedPlayers[1].name}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {rankedPlayers[1].score} Poin
              </span>
              <div className="w-full bg-slate-400/30 border border-slate-300/40 rounded-t-2xl h-28 sm:h-36 mt-2 flex flex-col items-center justify-center p-2">
                <span className="text-3xl">🥈</span>
                <span className="text-xs font-black uppercase text-slate-200 mt-1">
                  Juara 2
                </span>
              </div>
            </div>
          )}

          {/* 1st Place (Gold / Champion) */}
          {champion && (
            <div className="flex-1 min-w-[150px] max-w-[220px] flex flex-col items-center order-0 sm:order-2">
              <div className="relative">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white text-4xl flex items-center justify-center shadow-xl border-4 border-amber-400 mb-2 animate-bounce">
                  {champion.avatar}
                </div>
                <span className="absolute -top-3 -right-2 text-2xl">👑</span>
              </div>
              <span className="font-black text-base sm:text-lg text-amber-300 truncate max-w-full">
                {champion.name}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-amber-200">
                {champion.score} Poin
              </span>
              <div className="w-full bg-gradient-to-t from-amber-600 to-amber-400 border-2 border-amber-300 rounded-t-2xl h-36 sm:h-48 mt-2 flex flex-col items-center justify-center p-2 shadow-lg shadow-amber-500/20">
                <span className="text-4xl">🥇</span>
                <span className="text-sm font-black uppercase text-white mt-1">
                  JUARA 1
                </span>
                <span className="text-[10px] font-bold text-amber-100 uppercase tracking-widest">
                  Grand Champion
                </span>
              </div>
            </div>
          )}

          {/* 3rd Place (Bronze) */}
          {rankedPlayers[2] && (
            <div className="flex-1 min-w-[130px] max-w-[190px] flex flex-col items-center order-2 sm:order-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white text-3xl flex items-center justify-center shadow-lg border-2 border-amber-700 mb-2">
                {rankedPlayers[2].avatar}
              </div>
              <span className="font-extrabold text-sm sm:text-base text-amber-200 truncate max-w-full">
                {rankedPlayers[2].name}
              </span>
              <span className="text-xs font-bold text-amber-300/80">
                {rankedPlayers[2].score} Poin
              </span>
              <div className="w-full bg-amber-800/40 border border-amber-700/50 rounded-t-2xl h-24 sm:h-28 mt-2 flex flex-col items-center justify-center p-2">
                <span className="text-3xl">🥉</span>
                <span className="text-xs font-black uppercase text-amber-200 mt-1">
                  Juara 3
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Other Players (Rank 4 to 8) */}
        {rankedPlayers.length > 3 && (
          <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {rankedPlayers.slice(3).map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 border border-white/10"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-400 w-4">
                    #{idx + 4}
                  </span>
                  <span className="text-xl">{p.avatar}</span>
                  <span className="font-bold text-sm text-slate-200 truncate max-w-[120px]">
                    {p.name}
                  </span>
                </div>
                <span className="font-extrabold text-sm text-amber-300">
                  {p.score} pt
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Special Category Badges & Academic Trophies */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
            PENGHARGAAN KHUSUS & BADGES AKADEMIK
          </label>
          <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            5 Kategori Juara
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {/* Badge 1: Fraction Master */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col shadow-xs">
            <div className="flex items-center gap-1.5 text-amber-700 mb-1.5">
              <Trophy className="w-4 h-4" />
              <span className="text-[11px] font-black uppercase tracking-wider">
                FRACTION MASTER
              </span>
            </div>
            <span className="text-[11px] text-slate-500">Skor Tertinggi</span>
            <div className="flex items-center gap-2 mt-auto pt-3">
              <span className="text-2xl">{fractionMaster.avatar}</span>
              <div className="min-w-0">
                <strong className="block text-slate-900 text-xs font-black truncate">
                  {fractionMaster.name}
                </strong>
                <span className="text-xs text-amber-700 font-extrabold">
                  {fractionMaster.score} Poin
                </span>
              </div>
            </div>
          </div>

          {/* Badge 2: Perfect Accuracy */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col shadow-xs">
            <div className="flex items-center gap-1.5 text-emerald-700 mb-1.5">
              <Target className="w-4 h-4" />
              <span className="text-[11px] font-black uppercase tracking-wider">
                PERFECT ACCURACY
              </span>
            </div>
            <span className="text-[11px] text-slate-500">Akurasi Terbaik</span>
            <div className="flex items-center gap-2 mt-auto pt-3">
              <span className="text-2xl">{accuracyMaster.avatar}</span>
              <div className="min-w-0">
                <strong className="block text-slate-900 text-xs font-black truncate">
                  {accuracyMaster.name}
                </strong>
                <span className="text-xs text-emerald-700 font-extrabold">
                  {accuracyMaster.totalCorrect + accuracyMaster.totalWrong > 0
                    ? Math.round(
                        (accuracyMaster.totalCorrect /
                          (accuracyMaster.totalCorrect +
                            accuracyMaster.totalWrong)) *
                          100
                      )
                    : 0}
                  % Akurasi
                </span>
              </div>
            </div>
          </div>

          {/* Badge 3: Speed Master */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex flex-col shadow-xs">
            <div className="flex items-center gap-1.5 text-blue-700 mb-1.5">
              <Zap className="w-4 h-4" />
              <span className="text-[11px] font-black uppercase tracking-wider">
                SPEED MASTER
              </span>
            </div>
            <span className="text-[11px] text-slate-500">Paling Gesit</span>
            <div className="flex items-center gap-2 mt-auto pt-3">
              <span className="text-2xl">{speedMaster.avatar}</span>
              <div className="min-w-0">
                <strong className="block text-slate-900 text-xs font-black truncate">
                  {speedMaster.name}
                </strong>
                <span className="text-xs text-blue-700 font-extrabold">
                  {speedMaster.roundsPlayed > 0
                    ? Math.round(
                        (speedMaster.totalTimeSpent / speedMaster.roundsPlayed) *
                          10
                      ) / 10
                    : 0}
                  s / ronde
                </span>
              </div>
            </div>
          </div>

          {/* Badge 4: Fraction Expert */}
          <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 flex flex-col shadow-xs">
            <div className="flex items-center gap-1.5 text-purple-700 mb-1.5">
              <Brain className="w-4 h-4" />
              <span className="text-[11px] font-black uppercase tracking-wider">
                FRACTION EXPERT
              </span>
            </div>
            <span className="text-[11px] text-slate-500">Paling Banyak Menemukan</span>
            <div className="flex items-center gap-2 mt-auto pt-3">
              <span className="text-2xl">{expertMaster.avatar}</span>
              <div className="min-w-0">
                <strong className="block text-slate-900 text-xs font-black truncate">
                  {expertMaster.name}
                </strong>
                <span className="text-xs text-purple-700 font-extrabold">
                  {expertMaster.totalCorrect} Pecahan
                </span>
              </div>
            </div>
          </div>

          {/* Badge 5: Combo Gladiator */}
          <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 flex flex-col shadow-xs">
            <div className="flex items-center gap-1.5 text-rose-700 mb-1.5">
              <Flame className="w-4 h-4" />
              <span className="text-[11px] font-black uppercase tracking-wider">
                COMBO GLADIATOR
              </span>
            </div>
            <span className="text-[11px] text-slate-500">Combo Terpanjang</span>
            <div className="flex items-center gap-2 mt-auto pt-3">
              <span className="text-2xl">{comboMaster.avatar}</span>
              <div className="min-w-0">
                <strong className="block text-slate-900 text-xs font-black truncate">
                  {comboMaster.name}
                </strong>
                <span className="text-xs text-rose-700 font-extrabold">
                  {comboMaster.highestCombo}× Beruntun
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COMPLETE STUDENT REPORT TABLE & TEACHER EXPORT (LAPORAN HASIL SISWA) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                <GraduationCap className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-black text-slate-900">
                LAPORAN ASESMEN & HASIL BELAJAR SISWA
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Rekapitulasi lengkap skor, akurasi, waktu pengerjaan, dan kategori penguasaan pecahan senilai.
            </p>
          </div>

          {/* Action Buttons: DOWNLOAD HASIL & CETAK */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              id="download-results-btn"
              onClick={handleDownloadCSV}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>BERHASIL DIUNDUH!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD HASIL (CSV/EXCEL)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              title="Cetak Laporan / Simpan PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
          </div>
        </div>

        {/* Structured Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-extrabold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <th className="py-3 px-3.5 text-center w-12">#</th>
                <th className="py-3 px-3.5">Nama Siswa</th>
                <th className="py-3 px-3.5 text-center">Skor</th>
                <th className="py-3 px-3.5 text-center">Benar</th>
                <th className="py-3 px-3.5 text-center">Salah</th>
                <th className="py-3 px-3.5 text-center">Akurasi</th>
                <th className="py-3 px-3.5 text-center">Waktu Rata-rata</th>
                <th className="py-3 px-3.5 text-center">Pecahan Ditemukan</th>
                <th className="py-3 px-3.5 text-center">Jumlah Kesalahan</th>
                <th className="py-3 px-3.5 text-center">Kategori Penguasaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rankedPlayers.map((player, idx) => {
                const totalSelected = player.totalCorrect + player.totalWrong;
                const acc =
                  totalSelected > 0
                    ? Math.round((player.totalCorrect / totalSelected) * 100)
                    : 0;
                const pAvgTime =
                  player.roundsPlayed > 0
                    ? Math.round((player.totalTimeSpent / player.roundsPlayed) * 10) /
                      10
                    : 0;
                const mastery = getMasteryCategory(
                  acc,
                  player.totalCorrect,
                  player.totalWrong
                );

                return (
                  <tr
                    key={player.id}
                    onClick={() => {
                      sound.playCardSelect();
                      setSelectedPlayerId(player.id);
                    }}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                      selectedPlayerId === player.id
                        ? 'bg-purple-50/50 font-semibold'
                        : ''
                    }`}
                  >
                    <td className="py-3 px-3.5 text-center font-black text-slate-400">
                      {idx === 0
                        ? '🥇 1'
                        : idx === 1
                        ? '🥈 2'
                        : idx === 2
                        ? '🥉 3'
                        : `${idx + 1}`}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{player.avatar}</span>
                        <div>
                          <strong className="text-slate-900 block font-bold">
                            {player.name}
                          </strong>
                          <span className="text-[10px] text-slate-400">
                            {player.roundsPlayed} ronde
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-center font-black text-blue-700">
                      {player.score}
                    </td>
                    <td className="py-3 px-3.5 text-center font-bold text-emerald-600">
                      {player.totalCorrect}
                    </td>
                    <td className="py-3 px-3.5 text-center font-bold text-rose-600">
                      {player.totalWrong}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md font-extrabold text-xs ${
                          acc >= 85
                            ? 'bg-emerald-100 text-emerald-800'
                            : acc >= 70
                            ? 'bg-blue-100 text-blue-800'
                            : acc >= 50
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {acc}%
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center text-slate-700 font-medium">
                      {pAvgTime}s
                    </td>
                    <td className="py-3 px-3.5 text-center font-bold text-slate-800">
                      {player.totalCorrect}
                    </td>
                    <td className="py-3 px-3.5 text-center font-bold text-slate-800">
                      {player.totalWrong}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-black border ${mastery.colorClass}`}
                      >
                        {mastery.category}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Learning Diagnosis & Pedagogical Analysis */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              EVALUASI KOMPETENSI INDIVIDUAL
            </span>
            <h3 className="text-xl font-black text-slate-900">
              Analisis Kemampuan Pecahan Siswa
            </h3>
          </div>

          {/* Student Selector Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500">Pilih Siswa:</span>
            {players.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => {
                  sound.playCardSelect();
                  setSelectedPlayerId(p.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedPlayerId === p.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{p.avatar}</span>
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Diagnostic 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Left Column: Student Summary */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-3xl">
                  {activeAnalysisPlayer.avatar}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg">
                    {activeAnalysisPlayer.name}
                  </h4>
                  <span className="text-xs text-slate-500 font-semibold">
                    Laporan Hasil Belajar
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 space-y-3">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase block">
                    Kategori Penguasaan
                  </span>
                  <span
                    className={`inline-block px-3 py-1 rounded-lg text-sm font-black mt-1 ${
                      analysis.grade === 'SANGAT BAIK'
                        ? 'bg-emerald-100 text-emerald-800'
                        : analysis.grade === 'BAIK'
                        ? 'bg-blue-100 text-blue-800'
                        : analysis.grade === 'MULAI MENGUASAI'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {analysis.grade}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Akurasi
                    </span>
                    <span className="text-xl font-black text-slate-800">
                      {analysis.accuracy}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Rata-rata Waktu
                    </span>
                    <span className="text-xl font-black text-slate-800 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {avgTime}s
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500">
              Total Benar:{' '}
              <strong className="text-emerald-700">
                {activeAnalysisPlayer.totalCorrect}
              </strong>{' '}
              | Salah:{' '}
              <strong className="text-rose-700">
                {activeAnalysisPlayer.totalWrong}
              </strong>
            </div>
          </div>

          {/* Center Column: Competency Checklist & Strengths */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
            <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-600">
              CAPAIAN PEMBELAJARAN
            </h5>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">
                    Mengenali Pecahan Senilai
                  </strong>
                  <span className="text-slate-500 text-[11px]">
                    Memahami bahwa mengalikan pembilang & penyebut dengan angka sama menghasilkan nilai pecahan setara.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">
                    Menentukan Pecahan Senilai
                  </strong>
                  <span className="text-slate-500 text-[11px]">
                    Mampu memilih pecahan dengan variasi pengali 2×, 3×, 4× hingga pengali tingkat lanjut.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">
                    Membedakan Distraktor Pecahan
                  </strong>
                  <span className="text-slate-500 text-[11px]">
                    Mampu menolak pecahan pengecoh pola penjumlahan atau pengali tidak seimbang.
                  </span>
                </div>
              </div>
            </div>

            {analysis.strengths.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-extrabold uppercase text-emerald-700 block mb-1">
                  Kekuatan Siswa:
                </span>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                  {analysis.strengths.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Pedagogical Recommendation */}
          <div className="bg-blue-50/60 border border-blue-200 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-blue-800 mb-2">
                <Award className="w-4 h-4" />
                <h5 className="font-extrabold text-xs uppercase tracking-wider">
                  REKOMENDASI GURU & TINDAK LANJUT
                </h5>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-blue-950 bg-white p-3.5 rounded-xl border border-blue-200 leading-relaxed shadow-xs">
                "{analysis.recommendation}"
              </p>

              {analysis.improvements.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <span className="text-[11px] font-extrabold uppercase text-slate-500 block">
                    Fokus Latihan Selanjutnya:
                  </span>
                  {analysis.improvements.map((imp, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-1.5 text-xs text-slate-700"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{imp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-blue-200/60 text-[11px] text-blue-800 font-medium">
              💡 Tips: Konsep perkalian silang (a × d = b × c) dapat digunakan sebagai alat cek cepat!
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <button
          type="button"
          id="restart-game-btn"
          onClick={() => {
            sound.playCardSelect();
            onRestart();
          }}
          className="py-4 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-lg rounded-2xl shadow-lg shadow-blue-500/25 transition-all transform active:scale-95 flex items-center gap-3 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          <span>MAIN BATTLE BARU</span>
        </button>
      </div>
    </div>
  );
};
