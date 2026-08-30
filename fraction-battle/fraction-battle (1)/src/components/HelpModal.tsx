import React from 'react';
import { X, BookOpen, CheckCircle, XCircle, Award, Flame } from 'lucide-react';
import { FractionDisplay } from './FractionDisplay';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-300" />
            <h3 className="text-lg font-black tracking-tight">
              Panduan Bermain Fraction Battle
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto text-slate-700 text-sm">
          {/* Section 1: Concept */}
          <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl">
            <h4 className="font-extrabold text-blue-900 text-sm mb-2 flex items-center gap-2">
              <span className="text-lg">🎯</span> Apa itu Pecahan Senilai?
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Pecahan senilai adalah pecahan-pecahan yang memiliki nilai yang sama, meskipun angka pembilang dan penyebutnya berbeda.
            </p>
            <div className="mt-3 p-3 bg-white rounded-xl border border-blue-200 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-800">
              <div className="flex items-center gap-2">
                <span>Contoh:</span>
                <FractionDisplay numerator={3} denominator={4} size="xs" />
                <span>=</span>
                <FractionDisplay numerator={6} denominator={8} size="xs" />
                <span>=</span>
                <FractionDisplay numerator={9} denominator={12} size="xs" />
              </div>
            </div>
            <p className="text-xs text-blue-800 mt-2 font-medium">
              💡 <strong>Rumus Pembuktian:</strong> Dua pecahan <span className="font-mono">a/b</span> dan <span className="font-mono">c/d</span> senilai jika hasil perkalian silang <span className="font-mono">a × d === b × c</span>.
            </p>
          </div>

          {/* Section 2: How to Play */}
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm mb-2.5">
              🎮 Cara Bermain Turn-Based
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-slate-600 pl-1">
              <li>Pilih jumlah pemain (2 hingga 8 siswa) dan tentukan nama serta avatar.</li>
              <li>Permainan berlangsung <strong>secara bergiliran</strong> (pemain lain menunggu dan bersiap).</li>
              <li>Perhatikan <strong>Pecahan Target</strong> yang muncul di bagian atas grid.</li>
              <li>Pilih sebanyak-banyaknya kartu pecahan yang senilai sebelum waktu habis!</li>
              <li>Klik sekali untuk memilih, klik lagi untuk membatalkan pilihan.</li>
              <li>Tekan tombol <strong>[SELESAI & KUNCI JAWABAN]</strong> bila sudah yakin.</li>
            </ol>
          </div>

          {/* Section 3: Scoring & Bonuses */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
            <h4 className="font-extrabold text-slate-900 text-sm mb-2">
              ⭐ Sistem Penilaian & Poin
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Jawaban Benar: <strong>+10 Poin</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Jawaban Salah: <strong>-5 Poin</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Combo 3 Benar: <strong>×2 Poin</strong> | 5 Benar: <strong>×3 Poin</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                <Award className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Ketelitian 100% / Sapu Bersih: <strong>+10 Bonus</strong></span>
              </div>
            </div>
          </div>

          {/* Section 4: Grid & Levels */}
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm mb-2 flex items-center justify-between">
              <span>📐 Sistem Level Grid (Otomatis Tiap Ronde)</span>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                Responsif HP
              </span>
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <strong className="block text-emerald-900 font-black">Level 1</strong>
                <span className="text-emerald-700 font-semibold">Grid 8×8 (64 kartu)</span>
                <span className="text-emerald-800 font-mono font-black block mt-0.5">⏱️ 30 Detik</span>
              </div>
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                <strong className="block text-blue-900 font-black">Level 2</strong>
                <span className="text-blue-700 font-semibold">Grid 10×10 (100 kartu)</span>
                <span className="text-blue-800 font-mono font-black block mt-0.5">⏱️ 25 Detik</span>
              </div>
              <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl">
                <strong className="block text-purple-900 font-black">Level 3</strong>
                <span className="text-purple-700 font-semibold">Grid 12×12 (144 kartu)</span>
                <span className="text-purple-800 font-mono font-black block mt-0.5">⏱️ 20 Detik</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              📱 <strong>Optimasi Smartphone:</strong> Seluruh kartu dirancang dengan garis pecahan dan angka dengan tingkat keterbacaan tinggi. Gunakan tombol zoom (Pas, Sedang, Besar) di atas grid untuk menyesuaikan ukuran.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
          >
            Mengerti, Siap Bertanding!
          </button>
        </div>
      </div>
    </div>
  );
};
