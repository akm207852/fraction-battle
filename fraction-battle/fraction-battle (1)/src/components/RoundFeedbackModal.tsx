import React, { useState, useEffect } from 'react';
import { Player, RoundResult } from '../types';
import { FractionDisplay } from './FractionDisplay';
import { sound } from '../utils/audio';
import {
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Award,
  Flame,
  BookOpen,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import { motion } from 'motion/react';

interface RoundFeedbackModalProps {
  player: Player;
  result: RoundResult;
  isLastTurnOfGame: boolean;
  onContinue: () => void;
}

export const RoundFeedbackModal: React.FC<RoundFeedbackModalProps> = ({
  player,
  result,
  isLastTurnOfGame,
  onContinue,
}) => {
  // If player made mistakes, default to 'wrong' so they can immediately reflect; otherwise 'all'
  const [activeTab, setActiveTab] = useState<'all' | 'wrong' | 'correct' | 'missed'>(
    result.wrongCards.length > 0 ? 'wrong' : 'all'
  );

  useEffect(() => {
    sound.playScoreGain(
      result.maxCombo >= 3,
      result.allCorrectFoundBonus || result.flawlessBonus
    );
  }, [result]);

  const handleProceed = () => {
    sound.playCardSelect();
    onContinue();
  };

  const totalSelected = result.selectedCards.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Top Header - Reflection Mode Identification */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 p-5 sm:p-6 text-white text-center relative overflow-hidden shrink-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-400/20 border border-amber-300/40 text-amber-300 rounded-full text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>MODE REFLEKSI & PEMBAHASAN RONDE {result.roundNumber}</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl sm:text-4xl">{player.avatar}</span>
            <div className="text-left">
              <h2 className="text-xl sm:text-2xl font-black">{player.name}</h2>
              <span className="text-xs text-blue-200 font-semibold">
                Giliran Selesai • Waktunya Belajar dari Hasil Pilihan
              </span>
            </div>
          </div>

          {/* Target Reference Highlight */}
          <div className="inline-flex items-center gap-2.5 mt-3.5 bg-white/10 px-4 py-2 rounded-2xl border border-white/20">
            <span className="text-xs font-bold text-slate-200">Pecahan Target Ronde Ini:</span>
            <div className="bg-white text-slate-900 px-3 py-1 rounded-xl font-black text-sm shadow-sm flex items-center gap-1.5">
              <span>🎯</span>
              <span>
                {result.targetFraction.numerator}/{result.targetFraction.denominator}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Quick Round Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Score Earned */}
            <div className="bg-blue-50/80 border border-blue-200 p-3 rounded-2xl text-center shadow-xs">
              <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider block">
                Skor Ronde
              </span>
              <span className="text-2xl sm:text-3xl font-black text-blue-700 block mt-0.5">
                +{result.scoreEarned}
              </span>
            </div>

            {/* Accuracy */}
            <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-2xl text-center shadow-xs">
              <span className="text-[11px] font-black text-emerald-600 uppercase tracking-wider block">
                Akurasi
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-700 block mt-0.5">
                {result.accuracy}%
              </span>
            </div>

            {/* Correct / Wrong Count */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center shadow-xs">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                Benar / Salah
              </span>
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                <span className="text-lg font-black text-emerald-600">
                  {result.correctCards.length}
                </span>
                <span className="text-slate-300 font-bold">/</span>
                <span className="text-lg font-black text-rose-600">
                  {result.wrongCards.length}
                </span>
              </div>
            </div>

            {/* Time Taken */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center shadow-xs">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                Waktu
              </span>
              <div className="flex items-center justify-center gap-1 mt-0.5 text-slate-700 font-black text-lg">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{result.timeSpent}s</span>
              </div>
            </div>
          </div>

          {/* Academic Bonuses & Combo Badges */}
          {(result.allCorrectFoundBonus || result.flawlessBonus || result.maxCombo >= 3) && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs font-bold text-amber-900 shadow-xs">
              <Award className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Bonus Ronde Ini:</span>
              {result.flawlessBonus && (
                <span className="bg-amber-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                  ✨ Ketelitian 100% (+10 Poin)
                </span>
              )}
              {result.allCorrectFoundBonus && (
                <span className="bg-amber-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                  🎯 Sapu Bersih Senilai (+10 Poin)
                </span>
              )}
              {result.maxCombo >= 3 && (
                <span className="bg-amber-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-600 fill-current" />
                  Streak {result.maxCombo}×
                </span>
              )}
            </div>
          )}

          {/* REFLECTION NAVIGATION TABS */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-1.5 text-slate-800">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-black uppercase tracking-wide">
                  Refleksi Pilihan Siswa
                </h3>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {result.wrongCards.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('wrong')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'wrong'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Kesalahan ({result.wrongCards.length})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Semua Pilihan ({totalSelected})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('correct')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'correct'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Benar ({result.correctCards.length})</span>
                </button>

                {result.missedCards.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('missed')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'missed'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Terlewat ({result.missedCards.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Zero Mistakes Banner when viewing wrong tab */}
            {activeTab === 'wrong' && result.wrongCards.length === 0 && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-emerald-800 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-black text-sm">Tidak Ada Kesalahan!</h4>
                <p className="text-xs text-emerald-700 font-medium">
                  Luar biasa, kamu memilih semua kartu dengan sangat teliti tanpa salah sama sekali.
                </p>
              </div>
            )}

            {/* Reflection Card Items List */}
            <div className="space-y-3">
              {/* WRONG CARDS REFLECTION */}
              {(activeTab === 'all' || activeTab === 'wrong') &&
                result.wrongCards.map((card, idx) => (
                  <div
                    key={card.id || `wrong_${idx}`}
                    className="p-4 rounded-2xl bg-rose-50/70 border-2 border-rose-200 space-y-3 shadow-xs"
                  >
                    {/* Header comparison row */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        {/* Target */}
                        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-xs">
                          <span className="text-[10px] font-black uppercase text-slate-400">
                            Target:
                          </span>
                          <FractionDisplay
                            numerator={result.targetFraction.numerator}
                            denominator={result.targetFraction.denominator}
                            size="xs"
                          />
                          <span className="text-xs font-bold text-slate-700">
                            ({result.targetFraction.numerator}/{result.targetFraction.denominator})
                          </span>
                        </div>

                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

                        {/* Pilihan */}
                        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-rose-300 shadow-xs">
                          <span className="text-[10px] font-black uppercase text-rose-500">
                            Pilihan Siswa:
                          </span>
                          <FractionDisplay
                            numerator={card.numerator}
                            denominator={card.denominator}
                            size="xs"
                          />
                          <span className="text-xs font-black text-rose-700">
                            ({card.numerator}/{card.denominator})
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white flex items-center gap-1 shadow-xs">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>STATUS: SALAH</span>
                      </span>
                    </div>

                    {/* Simple Grade 4 Explanation */}
                    <div className="bg-white p-3.5 rounded-xl border border-rose-200 text-xs sm:text-sm text-slate-800 leading-relaxed shadow-xs">
                      <span className="font-black text-rose-900 block text-xs uppercase tracking-wide mb-1">
                        💡 Penjelasan (Mengapa Tidak Senilai?):
                      </span>
                      <p className="font-semibold text-slate-700">
                        {card.explanation}
                      </p>
                    </div>
                  </div>
                ))}

              {/* CORRECT CARDS REFLECTION */}
              {(activeTab === 'all' || activeTab === 'correct') &&
                result.correctCards.map((card, idx) => (
                  <div
                    key={card.id || `correct_${idx}`}
                    className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3 shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        {/* Target */}
                        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-xs">
                          <span className="text-[10px] font-black uppercase text-slate-400">
                            Target:
                          </span>
                          <FractionDisplay
                            numerator={result.targetFraction.numerator}
                            denominator={result.targetFraction.denominator}
                            size="xs"
                          />
                          <span className="text-xs font-bold text-slate-700">
                            ({result.targetFraction.numerator}/{result.targetFraction.denominator})
                          </span>
                        </div>

                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

                        {/* Pilihan */}
                        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-emerald-300 shadow-xs">
                          <span className="text-[10px] font-black uppercase text-emerald-600">
                            Pilihan Siswa:
                          </span>
                          <FractionDisplay
                            numerator={card.numerator}
                            denominator={card.denominator}
                            size="xs"
                          />
                          <span className="text-xs font-black text-emerald-800">
                            ({card.numerator}/{card.denominator})
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>STATUS: BENAR</span>
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-emerald-200 text-xs sm:text-sm text-slate-800 leading-relaxed shadow-xs">
                      <span className="font-black text-emerald-900 block text-xs uppercase tracking-wide mb-1">
                        💡 Penjelasan (Mengapa Senilai?):
                      </span>
                      <p className="font-semibold text-slate-700">
                        {card.explanation}
                      </p>
                    </div>
                  </div>
                ))}

              {/* MISSED CARDS REFLECTION */}
              {(activeTab === 'all' || activeTab === 'missed') &&
                result.missedCards.map((card, idx) => (
                  <div
                    key={card.id || `missed_${idx}`}
                    className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3 shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        {/* Target */}
                        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-xs">
                          <span className="text-[10px] font-black uppercase text-slate-400">
                            Target:
                          </span>
                          <FractionDisplay
                            numerator={result.targetFraction.numerator}
                            denominator={result.targetFraction.denominator}
                            size="xs"
                          />
                          <span className="text-xs font-bold text-slate-700">
                            ({result.targetFraction.numerator}/{result.targetFraction.denominator})
                          </span>
                        </div>

                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

                        {/* Pecahan Terlewat */}
                        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-blue-300 shadow-xs">
                          <span className="text-[10px] font-black uppercase text-blue-600">
                            Pecahan di Grid:
                          </span>
                          <FractionDisplay
                            numerator={card.numerator}
                            denominator={card.denominator}
                            size="xs"
                          />
                          <span className="text-xs font-black text-blue-800">
                            ({card.numerator}/{card.denominator})
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-white flex items-center gap-1 shadow-xs">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>TERLEWAT (SENILAI)</span>
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-blue-200 text-xs sm:text-sm text-slate-800 leading-relaxed shadow-xs">
                      <span className="font-black text-blue-900 block text-xs uppercase tracking-wide mb-1">
                        💡 Penjelasan Senilai:
                      </span>
                      <p className="font-semibold text-slate-700">
                        {card.explanation}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Quick Learning Tip for Grade 4 SD */}
          <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200 flex items-start gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div className="text-xs text-indigo-950 space-y-1">
              <strong className="block font-black text-indigo-900 uppercase tracking-wide">
                Kunci Rahasia Pecahan Senilai (Kelas 4 SD):
              </strong>
              <p className="leading-relaxed font-medium">
                Pecahan senilai hanya bisa dibuat dengan <strong>MENGALIKAN</strong> atau <strong>MEMBAGI</strong> pembilang dan penyebut dengan <strong>angka yang sama</strong>. Jangan pernah menggunakan pola penjumlahan atau pengurangan!
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer / Action Button */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 shrink-0">
          <button
            type="button"
            id="continue-after-round-btn"
            onClick={handleProceed}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-base rounded-2xl shadow-lg shadow-blue-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>
              {isLastTurnOfGame
                ? 'SELESAIKAN PERTANDINGAN & LIHAT JUARA 🏆'
                : 'LANJUT KE PEMAIN BERIKUTNYA'}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
