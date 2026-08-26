import {
  Fraction,
  FractionCardData,
  GameMode,
  GridLevelConfig,
  TeacherConfig,
} from '../types';

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function simplifyFraction(f: Fraction): Fraction {
  const common = gcd(f.numerator, f.denominator);
  return {
    numerator: f.numerator / common,
    denominator: f.denominator / common,
  };
}

/**
 * Validasi kesetaraan pecahan: a * d === b * c
 * JANGAN menggunakan pembulatan desimal sebagai metode validasi utama.
 */
export function isEquivalentFraction(
  a: number,
  b: number,
  c: number,
  d: number
): boolean {
  if (b === 0 || d === 0) return false;
  return a * d === b * c;
}

/**
 * Konfigurasi Level Grid Otomatis / Custom Guru Berdasarkan Ronde:
 * - Level 1 = 8×8 (64 kartu)
 * - Level 2 = 10×10 (100 kartu)
 * - Level 3 = 12×12 (144 kartu)
 */
export function getLevelConfig(
  roundNumber: number,
  mode: GameMode = 'quick',
  totalRounds: number = 5,
  teacherConfig?: TeacherConfig
): GridLevelConfig {
  let level: 1 | 2 | 3 = 1;
  let dimension: 8 | 10 | 12 = 8;
  let timeLimit = 30;

  if (mode === 'teacher' && teacherConfig) {
    // Custom settings from teacher
    timeLimit = teacherConfig.timeLimit || 30;
    if (teacherConfig.gridDimension === 'auto') {
      const progress = roundNumber / Math.max(totalRounds, 1);
      if (progress <= 0.4) {
        level = 1;
        dimension = 8;
      } else if (progress <= 0.8) {
        level = 2;
        dimension = 10;
      } else {
        level = 3;
        dimension = 12;
      }
    } else {
      dimension = teacherConfig.gridDimension;
      level = dimension === 8 ? 1 : dimension === 10 ? 2 : 3;
    }
  } else if (mode === 'quick') {
    // 5 Ronde: R1-2 (Level 1: 8x8), R3-4 (Level 2: 10x10), R5 (Level 3: 12x12)
    if (roundNumber <= 2) {
      level = 1;
      dimension = 8;
      timeLimit = 30;
    } else if (roundNumber <= 4) {
      level = 2;
      dimension = 10;
      timeLimit = 25;
    } else {
      level = 3;
      dimension = 12;
      timeLimit = 20;
    }
  } else if (mode === 'champion') {
    // 10 Ronde: R1-3 (Level 1: 8x8), R4-7 (Level 2: 10x10), R8-10 (Level 3: 12x12)
    if (roundNumber <= 3) {
      level = 1;
      dimension = 8;
      timeLimit = 30;
    } else if (roundNumber <= 7) {
      level = 2;
      dimension = 10;
      timeLimit = 25;
    } else {
      level = 3;
      dimension = 12;
      timeLimit = 20;
    }
  } else {
    // Mode Latihan Mandiri / Training (5 Ronde): R1-2 (Level 1), R3-4 (Level 2), R5+ (Level 3)
    if (roundNumber <= 2) {
      level = 1;
      dimension = 8;
      timeLimit = 35;
    } else if (roundNumber <= 4) {
      level = 2;
      dimension = 10;
      timeLimit = 30;
    } else {
      level = 3;
      dimension = 12;
      timeLimit = 25;
    }
  }

  const levelConfigs: Record<
    1 | 2 | 3,
    {
      levelName: string;
      levelBadgeClass: string;
      badgeText: string;
      description: string;
    }
  > = {
    1: {
      levelName: 'Level 1 (Dasar)',
      levelBadgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      badgeText: 'LEVEL 1 • 8×8',
      description: 'Grid 8×8 (64 kartu) – Pembiasaan mengenali pecahan senilai dasar.',
    },
    2: {
      levelName: 'Level 2 (Tantangan)',
      levelBadgeClass: 'bg-blue-50 text-blue-800 border-blue-300',
      badgeText: 'LEVEL 2 • 10×10',
      description: 'Grid 10×10 (100 kartu) – Pengecoh pecahan lebih beragam dan menantang.',
    },
    3: {
      levelName: 'Level 3 (Master)',
      levelBadgeClass: 'bg-purple-50 text-purple-800 border-purple-300',
      badgeText: 'LEVEL 3 • 12×12',
      description: 'Grid 12×12 (144 kartu) – Kecepatan, ketelitian, dan fokus tingkat juara!',
    },
  };

  return {
    level,
    dimension,
    totalCards: (dimension * dimension) as 64 | 100 | 144,
    timeLimit,
    ...levelConfigs[level],
  };
}

// Koleksi pecahan target yang sesuai untuk kelas 4 SD
export const fractionTargets: Fraction[] = [
  // Tingkat Dasar (Pecahan Sederhana)
  { numerator: 1, denominator: 2 },
  { numerator: 1, denominator: 3 },
  { numerator: 1, denominator: 4 },
  { numerator: 2, denominator: 3 },
  { numerator: 3, denominator: 4 },
  // Tingkat Menengah (Penyebut 5, 6, 8)
  { numerator: 1, denominator: 5 },
  { numerator: 2, denominator: 5 },
  { numerator: 3, denominator: 5 },
  { numerator: 4, denominator: 5 },
  { numerator: 5, denominator: 6 },
  // Tingkat Tantangan / Lanjutan
  { numerator: 3, denominator: 8 },
  { numerator: 5, denominator: 8 },
  { numerator: 2, denominator: 7 },
  { numerator: 4, denominator: 9 },
  { numerator: 7, denominator: 10 },
];

export const GRADE_4_TARGET_FRACTIONS = fractionTargets;

/**
 * Fisher-Yates Shuffle murni tanpa dependensi eksternal
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateTargetFraction(
  roundNumber: number = 1,
  totalRounds: number = 5,
  teacherConfig?: TeacherConfig
): Fraction {
  return getTargetForRound(roundNumber, totalRounds, teacherConfig);
}

export function getTargetForRound(
  roundNumber: number,
  totalRounds: number,
  teacherConfig?: TeacherConfig
): Fraction {
  // Jika dalam Teacher Mode dan guru telah memilih target pecahan spesifik
  if (
    teacherConfig?.selectedTargetFractions &&
    teacherConfig.selectedTargetFractions.length > 0
  ) {
    const list = teacherConfig.selectedTargetFractions;
    // Berurutan atau putar jika ronde melebihi jumlah pecahan yang dipilih
    const index = (roundNumber - 1) % list.length;
    return list[index];
  }

  // Jika tingkat kesulitan ditentukan guru
  if (teacherConfig?.difficulty) {
    if (teacherConfig.difficulty === 'easy') {
      const easyPool = fractionTargets.slice(0, 5);
      return easyPool[(roundNumber - 1) % easyPool.length];
    }
    if (teacherConfig.difficulty === 'medium') {
      const medPool = fractionTargets.slice(2, 10);
      return medPool[(roundNumber - 1) % medPool.length];
    }
    if (teacherConfig.difficulty === 'hard') {
      const hardPool = fractionTargets.slice(5);
      return hardPool[(roundNumber - 1) % hardPool.length];
    }
  }

  // Standar: Pilih target berdasarkan progres round
  const pool =
    roundNumber <= 2
      ? fractionTargets.slice(0, 5) // Dasar
      : roundNumber <= Math.ceil(totalRounds * 0.7)
      ? fractionTargets.slice(2, 10) // Menengah
      : fractionTargets.slice(5); // Lanjutan

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

export function calculateAccuracy(correct: number, wrong: number): number {
  const total = correct + wrong;
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

export function getMasteryCategory(
  accuracy: number,
  totalCorrect: number = 0,
  totalWrong: number = 0
): {
  category: 'Sangat Baik' | 'Baik' | 'Mulai Menguasai' | 'Perlu Latihan';
  colorClass: string;
  badgeBg: string;
  description: string;
} {
  const total = totalCorrect + totalWrong;
  if (total === 0) {
    return {
      category: 'Perlu Latihan',
      colorClass: 'text-rose-700 bg-rose-50 border-rose-200',
      badgeBg: 'bg-rose-100 text-rose-800',
      description: 'Belum ada data pengerjaan kartu pecahan.',
    };
  }

  if (accuracy >= 90) {
    return {
      category: 'Sangat Baik',
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      description: 'Menguasai konsep pecahan senilai dengan akurasi dan ketelitian sangat tinggi (90–100%).',
    };
  } else if (accuracy >= 75) {
    return {
      category: 'Baik',
      colorClass: 'text-blue-700 bg-blue-50 border-blue-200',
      badgeBg: 'bg-blue-100 text-blue-800',
      description: 'Mampu menemukan pecahan senilai dengan baik, sedikit kekeliruan pada distraktor (75–89%).',
    };
  } else if (accuracy >= 60) {
    return {
      category: 'Mulai Menguasai',
      colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
      badgeBg: 'bg-amber-100 text-amber-800',
      description: 'Memahami pecahan dasar tetapi masih terkecoh pada angka pengali yang lebih besar (60–74%).',
    };
  } else {
    return {
      category: 'Perlu Latihan',
      colorClass: 'text-rose-700 bg-rose-50 border-rose-200',
      badgeBg: 'bg-rose-100 text-rose-800',
      description: 'Perlu penguatan konsep dasar perkalian & penyederhanaan pecahan senilai (<60%).',
    };
  }
}

export const generateExplanation = generateCardExplanation;
export const createGrid = (target: Fraction, gridDimension: number) =>
  generateGridCards({ target, gridDimension });

export function generateEquivalentFractions(
  target: Fraction,
  count: number,
  maxMultiplier: number = 20
): Fraction[] {
  const base = simplifyFraction(target);
  const result: Fraction[] = [];
  const existing = new Set<string>();

  const multipliers: number[] = [];
  for (let m = 1; m <= maxMultiplier; m++) {
    multipliers.push(m);
  }
  const shuffled = shuffleArray(multipliers);

  for (const m of shuffled) {
    if (result.length >= count) break;
    const num = base.numerator * m;
    const den = base.denominator * m;
    const key = `${num}/${den}`;
    if (!existing.has(key)) {
      existing.add(key);
      result.push({ numerator: num, denominator: den });
    }
  }
  return result;
}

export function generateDistractor(
  target: Fraction,
  existingSignatures?: Set<string>
): Fraction {
  const base = simplifyFraction(target);
  let attempts = 0;
  while (attempts < 100) {
    attempts++;
    const strategy = Math.floor(Math.random() * 5);
    let dNum = 1;
    let dDen = 2;

    if (strategy === 0) {
      const k = Math.floor(Math.random() * 5) + 1;
      dNum = target.numerator + k;
      dDen = target.denominator + k;
    } else if (strategy === 1) {
      const n = Math.floor(Math.random() * 5) + 2;
      dNum = base.numerator * n;
      dDen = Math.max(2, base.denominator * n + (Math.random() > 0.5 ? 1 : -1));
    } else if (strategy === 2) {
      const n = Math.floor(Math.random() * 4) + 1;
      dNum = Math.max(1, base.numerator * n + 1);
      dDen = base.denominator * n;
    } else {
      dNum = Math.floor(Math.random() * 20) + 1;
      dDen = Math.floor(Math.random() * 25) + 2;
    }

    if (dNum > 0 && dDen > 0 && !isEquivalentFraction(target.numerator, target.denominator, dNum, dDen)) {
      const sig = `${dNum}/${dDen}`;
      if (!existingSignatures || !existingSignatures.has(sig)) {
        return { numerator: dNum, denominator: dDen };
      }
    }
  }
  return { numerator: target.numerator + 1, denominator: target.denominator * 2 + 1 };
}

export function generateDistractors(
  target: Fraction,
  count: number,
  existingSignatures: Set<string> = new Set()
): Fraction[] {
  const list: Fraction[] = [];
  while (list.length < count) {
    const d = generateDistractor(target, existingSignatures);
    existingSignatures.add(`${d.numerator}/${d.denominator}`);
    list.push(d);
  }
  return list;
}

export const calculateScore = calculateTurnScore;

export function generateCardExplanation(
  target: Fraction,
  card: Fraction,
  isEq: boolean
): string {
  if (isEq) {
    if (
      card.numerator === target.numerator &&
      card.denominator === target.denominator
    ) {
      return `${card.numerator}/${card.denominator} senilai dengan ${target.numerator}/${target.denominator} karena merupakan pecahan target itu sendiri.`;
    }

    // Kasus kartu adalah kelipatan target (misal: Target 3/4, Pilihan 6/8)
    const factorN = card.numerator / target.numerator;
    const factorD = card.denominator / target.denominator;
    if (Number.isInteger(factorN) && factorN > 1 && factorN === factorD) {
      return `${card.numerator}/${card.denominator} senilai dengan ${target.numerator}/${target.denominator} karena pembilang dan penyebut sama-sama dibagi ${factorN} (${card.numerator} ÷ ${factorN} = ${target.numerator} dan ${card.denominator} ÷ ${factorN} = ${target.denominator}).`;
    }

    // Kasus target adalah kelipatan kartu (misal: Target 6/8, Pilihan 3/4)
    const invFactorN = target.numerator / card.numerator;
    const invFactorD = target.denominator / card.denominator;
    if (Number.isInteger(invFactorN) && invFactorN > 1 && invFactorN === invFactorD) {
      return `${card.numerator}/${card.denominator} senilai dengan ${target.numerator}/${target.denominator} karena pembilang dan penyebut sama-sama dikali ${invFactorN} (${card.numerator} × ${invFactorN} = ${target.numerator} dan ${card.denominator} × ${invFactorN} = ${target.denominator}).`;
    }

    const simpCard = simplifyFraction(card);
    const simpTarget = simplifyFraction(target);
    const gCard = gcd(card.numerator, card.denominator);
    if (gCard > 1) {
      return `${card.numerator}/${card.denominator} senilai dengan ${target.numerator}/${target.denominator} karena setelah disederhanakan (sama-sama dibagi ${gCard}) bernilai ${simpCard.numerator}/${simpCard.denominator}, sama dengan ${simpTarget.numerator}/${simpTarget.denominator}.`;
    }

    return `${card.numerator}/${card.denominator} senilai dengan ${target.numerator}/${target.denominator} karena memiliki nilai perbandingan yang sama (${simpCard.numerator}/${simpCard.denominator}).`;
  } else {
    // KASUS SALAH / TIDAK SENILAI

    // Kasus 1: Pembilang dapat dibagi pembilang target (contoh user: Target 3/4, Pilihan 6/10 -> 6 ÷ 2 = 3 tetapi 10 ÷ 2 = 5, bukan 4)
    if (
      card.numerator > target.numerator &&
      card.numerator % target.numerator === 0
    ) {
      const factor = card.numerator / target.numerator;
      if (card.denominator % factor === 0) {
        const actualDenom = card.denominator / factor;
        return `${card.numerator}/${card.denominator} tidak senilai dengan ${target.numerator}/${target.denominator} karena ${card.numerator} ÷ ${factor} = ${target.numerator} tetapi ${card.denominator} ÷ ${factor} = ${actualDenom}, bukan ${target.denominator}.`;
      } else {
        const expectedDenom = target.denominator * factor;
        return `${card.numerator}/${card.denominator} tidak senilai dengan ${target.numerator}/${target.denominator} karena jika pembilang dikali ${factor} (${target.numerator} × ${factor} = ${card.numerator}), penyebut seharusnya bernilai ${expectedDenom}, bukan ${card.denominator}.`;
      }
    }

    // Kasus 2: Penyebut dapat dibagi penyebut target (misal: Target 3/4, Pilihan 5/8 atau 7/8)
    if (
      card.denominator > target.denominator &&
      card.denominator % target.denominator === 0
    ) {
      const factor = card.denominator / target.denominator;
      if (card.numerator % factor === 0) {
        const actualNum = card.numerator / factor;
        return `${card.numerator}/${card.denominator} tidak senilai dengan ${target.numerator}/${target.denominator} karena ${card.denominator} ÷ ${factor} = ${target.denominator} tetapi ${card.numerator} ÷ ${factor} = ${actualNum}, bukan ${target.numerator}.`;
      } else {
        const expectedNum = target.numerator * factor;
        return `${card.numerator}/${card.denominator} tidak senilai dengan ${target.numerator}/${target.denominator} karena jika penyebut dikali ${factor} (${target.denominator} × ${factor} = ${card.denominator}), pembilang seharusnya bernilai ${expectedNum}, bukan ${card.numerator}.`;
      }
    }

    // Kasus 3: Distraktor pola penjumlahan (misal: Target 3/4, Pilihan 4/5 atau 5/6)
    if (
      card.numerator - target.numerator === card.denominator - target.denominator &&
      card.numerator - target.numerator > 0
    ) {
      const diff = card.numerator - target.numerator;
      return `${card.numerator}/${card.denominator} tidak senilai dengan ${target.numerator}/${target.denominator} karena pembilang dan penyebut hanya ditambah ${diff}, padahal pecahan senilai harus diperoleh lewat perkalian atau pembagian dengan angka yang sama.`;
    }

    // Kasus 4: Disederhanakan menghasilkan pecahan lain
    const simpCard = simplifyFraction(card);
    const gCard = gcd(card.numerator, card.denominator);
    if (gCard > 1) {
      return `${card.numerator}/${card.denominator} tidak senilai dengan ${target.numerator}/${target.denominator} karena saat disederhanakan (dibagi ${gCard}) menghasilkan ${simpCard.numerator}/${simpCard.denominator}, bukan ${target.numerator}/${target.denominator}.`;
    }

    // Kasus 5: Perkalian silang sederhana
    const cross1 = target.numerator * card.denominator;
    const cross2 = target.denominator * card.numerator;
    return `${card.numerator}/${card.denominator} tidak senilai dengan ${target.numerator}/${target.denominator} karena perkalian silang ${target.numerator} × ${card.denominator} (${cross1}) tidak sama dengan ${target.denominator} × ${card.numerator} (${cross2}).`;
  }
}

interface GridGenerationConfig {
  target: Fraction;
  gridDimension: number; // e.g. 8, 10, 12
}

export function generateGridCards({
  target,
  gridDimension,
}: GridGenerationConfig): FractionCardData[] {
  const totalCards = gridDimension * gridDimension;

  // Tentukan jumlah kartu pecahan benar
  let correctCount = 8;
  if (gridDimension === 8) {
    correctCount = Math.floor(Math.random() * 5) + 6; // 6 to 10
  } else if (gridDimension === 10) {
    correctCount = Math.floor(Math.random() * 6) + 10; // 10 to 15
  } else if (gridDimension === 12) {
    correctCount = Math.floor(Math.random() * 11) + 15; // 15 to 25
  }

  const existingSignatures = new Set<string>();
  const correctFractions: Fraction[] = [];

  // Sederhanakan target terlebih dahulu untuk basis pengalian
  const base = simplifyFraction(target);

  // Buat kumpulan faktor pengali unik untuk pecahan senilai
  // Termasuk pengali 1 (pecahan dasar), 2, 3, 4, 5, 6, 7, 8, dst.
  const multiplierCandidates: number[] = [];
  for (let m = 1; m <= 30; m++) {
    multiplierCandidates.push(m);
  }
  // Shuffle multiplier candidates
  for (let i = multiplierCandidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [multiplierCandidates[i], multiplierCandidates[j]] = [
      multiplierCandidates[j],
      multiplierCandidates[i],
    ];
  }

  // Masukkan pecahan senilai
  for (const m of multiplierCandidates) {
    if (correctFractions.length >= correctCount) break;
    const num = base.numerator * m;
    const den = base.denominator * m;
    const sig = `${num}/${den}`;
    if (!existingSignatures.has(sig)) {
      existingSignatures.add(sig);
      correctFractions.push({ numerator: num, denominator: den });
    }
  }

  // Buat distraktor (pecahan pengecoh yang menantang pemahaman konsep)
  const distractorFractions: Fraction[] = [];
  const neededDistractors = totalCards - correctFractions.length;

  let attempts = 0;
  while (distractorFractions.length < neededDistractors && attempts < 2000) {
    attempts++;
    let dNum = 1;
    let dDen = 2;

    const strategy = Math.floor(Math.random() * 7);

    switch (strategy) {
      case 0: {
        // Distraktor aditif: (a + k) / (b + k) -> Kesalahan umum siswa SD!
        const k = Math.floor(Math.random() * 6) + 1;
        dNum = target.numerator + k;
        dDen = target.denominator + k;
        break;
      }
      case 1: {
        // Pengali tidak seimbang: (a * n) / (b * (n ± 1))
        const n = Math.floor(Math.random() * 6) + 2;
        const offset = Math.random() > 0.5 ? 1 : -1;
        dNum = base.numerator * n;
        dDen = Math.max(2, base.denominator * n + offset);
        break;
      }
      case 2: {
        // Pembilang sama, penyebut beda
        const n = Math.floor(Math.random() * 5) + 1;
        dNum = base.numerator * n;
        const denDelta = Math.floor(Math.random() * 5) + 1;
        dDen = base.denominator * n + denDelta;
        break;
      }
      case 3: {
        // Penyebut sama, pembilang beda
        const n = Math.floor(Math.random() * 5) + 1;
        const numDelta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
        dNum = Math.max(1, base.numerator * n + numDelta);
        dDen = base.denominator * n;
        break;
      }
      case 4: {
        // Pecahan acak proporsional kelas 4 (1/2, 2/3, 3/4, 4/5, 5/6, dll)
        const commonPecahan = [
          { n: 1, d: 2 },
          { n: 2, d: 3 },
          { n: 3, d: 4 },
          { n: 4, d: 5 },
          { n: 5, d: 6 },
          { n: 3, d: 5 },
          { n: 2, d: 5 },
          { n: 1, d: 3 },
          { n: 1, d: 4 },
          { n: 3, d: 8 },
          { n: 5, d: 8 },
          { n: 7, d: 10 },
          { n: 6, d: 10 },
          { n: 8, d: 12 },
          { n: 9, d: 16 },
        ];
        const chosen = commonPecahan[Math.floor(Math.random() * commonPecahan.length)];
        const scale = Math.floor(Math.random() * 4) + 1;
        dNum = chosen.n * scale;
        dDen = chosen.d * scale;
        break;
      }
      case 5: {
        // Pengali hanya di salah satu bagian: a / (b * n) atau (a * n) / b
        const n = Math.floor(Math.random() * 4) + 2;
        if (Math.random() > 0.5) {
          dNum = base.numerator * n;
          dDen = base.denominator;
        } else {
          dNum = base.numerator;
          dDen = base.denominator * n;
        }
        break;
      }
      default: {
        // Angka acak wajar untuk kelas 4 (pembilang 1-30, penyebut 2-50)
        dNum = Math.floor(Math.random() * 25) + 1;
        dDen = Math.floor(Math.random() * 35) + 2;
        if (dNum >= dDen && Math.random() > 0.15) {
          // Mayoritas pecahan biasa (kurang dari 1)
          const temp = dNum;
          dNum = Math.min(dDen - 1, 1);
          dDen = Math.max(temp, 2);
        }
        break;
      }
    }

    if (dDen <= 0 || dNum <= 0) continue;
    const sig = `${dNum}/${dDen}`;

    // Pastikan tidak duplikat dan BENAR-BENAR bukan pecahan senilai dengan target
    if (
      !existingSignatures.has(sig) &&
      !isEquivalentFraction(target.numerator, target.denominator, dNum, dDen)
    ) {
      existingSignatures.add(sig);
      distractorFractions.push({ numerator: dNum, denominator: dDen });
    }
  }

  // Jika masih kurang karena batas percobaan, isi dengan deret nomor aman
  let fallbackCount = 1;
  while (distractorFractions.length < neededDistractors) {
    const fNum = target.numerator + fallbackCount;
    const fDen = target.denominator * 2 + fallbackCount;
    const sig = `${fNum}/${fDen}`;
    if (
      !existingSignatures.has(sig) &&
      !isEquivalentFraction(target.numerator, target.denominator, fNum, fDen)
    ) {
      existingSignatures.add(sig);
      distractorFractions.push({ numerator: fNum, denominator: fDen });
    }
    fallbackCount++;
  }

  // Gabungkan dan beri metadata
  const allCards: FractionCardData[] = [];

  correctFractions.forEach((f, idx) => {
    allCards.push({
      id: `correct_${idx}_${f.numerator}_${f.denominator}_${Math.random()}`,
      numerator: f.numerator,
      denominator: f.denominator,
      isEquivalent: true,
      explanation: generateCardExplanation(target, f, true),
    });
  });

  distractorFractions.forEach((f, idx) => {
    allCards.push({
      id: `distractor_${idx}_${f.numerator}_${f.denominator}_${Math.random()}`,
      numerator: f.numerator,
      denominator: f.denominator,
      isEquivalent: false,
      explanation: generateCardExplanation(target, f, false),
    });
  });

  // Fisher-Yates Shuffle agar posisi seluruh kartu teracak sempurna
  for (let i = allCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
  }

  return allCards;
}

/**
 * Hitung skor giliran berdasarkan aturan:
 * - +10 per jawaban benar
 * - -5 per jawaban salah
 * - Combo multipliers (x2 pada 3 benar beruntun, x3 pada 5 benar beruntun)
 * - +10 bonus jika menemukan SEMUA pecahan benar
 * - +10 bonus jika ketelitian 100% tanpa salah sama sekali
 * - Minimal skor ronde = 0
 */
export function calculateTurnScore({
  selectedCards,
  totalAvailableCorrect,
}: {
  selectedCards: FractionCardData[];
  totalAvailableCorrect: number;
}) {
  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let currentStreak = 0;
  let maxStreak = 0;

  for (const card of selectedCards) {
    if (card.isEquivalent) {
      correctCount++;
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }

      // Combo scoring
      if (currentStreak >= 5) {
        score += 30; // x3 combo
      } else if (currentStreak >= 3) {
        score += 20; // x2 combo
      } else {
        score += 10;
      }
    } else {
      wrongCount++;
      currentStreak = 0;
      score -= 5;
    }
  }

  const allCorrectFoundBonus =
    correctCount === totalAvailableCorrect && totalAvailableCorrect > 0;
  if (allCorrectFoundBonus) {
    score += 10;
  }

  const flawlessBonus = selectedCards.length > 0 && wrongCount === 0;
  if (flawlessBonus) {
    score += 10;
  }

  // Minimum round score is 0
  const finalRoundScore = Math.max(0, score);
  const totalChosen = selectedCards.length;
  const accuracy =
    totalChosen > 0 ? Math.round((correctCount / totalChosen) * 100) : 0;

  return {
    score: finalRoundScore,
    correctCount,
    wrongCount,
    maxStreak,
    allCorrectFoundBonus,
    flawlessBonus,
    accuracy,
  };
}

export function generateLearningAnalysis(
  totalCorrect: number,
  totalWrong: number,
  totalMissed: number,
  avgTime: number
) {
  const totalSelected = totalCorrect + totalWrong;
  const accuracy =
    totalSelected > 0 ? Math.round((totalCorrect / totalSelected) * 100) : 0;

  let grade: 'SANGAT BAIK' | 'BAIK' | 'MULAI MENGUASAI' | 'PERLU LATIHAN' =
    'PERLU LATIHAN';
  const strengths: string[] = [];
  const improvements: string[] = [];
  let recommendation = '';

  if (accuracy >= 90) {
    grade = 'SANGAT BAIK';
    strengths.push('Mampu mengidentifikasi pecahan senilai dengan sangat tepat (90–100%).');
    strengths.push('Memiliki ketelitian tinggi dalam membedakan distraktor.');
    if (avgTime < 15) {
      strengths.push('Kecepatan analisis dan perhitungan sangat responsif.');
    }
    recommendation =
      'Luar biasa! Penguasaan materi pecahan senilai sudah sangat matang. Pertahankan ketelitian dan kecepatan.';
  } else if (accuracy >= 75) {
    grade = 'BAIK';
    strengths.push('Memahami konsep dasar perkalian/pembagian pecahan senilai (75–89%).');
    strengths.push('Dapat menemukan sebagian besar pecahan yang setara.');
    improvements.push('Waspadai pecahan pengecoh yang memiliki selisih angka serupa (misal 3/4 dengan 4/5).');
    recommendation =
      'Bagus! Tingkatkan ketelitian pada pecahan dengan angka yang mirip tetapi bukan hasil perkalian seimbang.';
  } else if (accuracy >= 60) {
    grade = 'MULAI MENGUASAI';
    strengths.push('Mulai mengenali pola pecahan sederhana (60–74%).');
    improvements.push('Perlu lebih teliti menghitung perkalian silang pembilang dan penyebut.');
    improvements.push('Kurangi memilih kartu terburu-buru untuk menghindari pengurangan skor.');
    recommendation =
      'Sudah mulai berkembang! Lakukan latihan perkalian pembilang dan penyebut secara merata untuk memantapkan pemahaman.';
  } else {
    grade = 'PERLU LATIHAN';
    improvements.push('Ingat prinsip utama: Pecahan senilai diperoleh dengan MENGALIKAN atau MEMBAGI pembilang dan penyebut dengan angka yang SAMA.');
    improvements.push('Hindari pola penjumlahan (misal: 3/4 + 1/1 = 4/5 bukanlah pecahan senilai).');
    recommendation =
      'Gunakan metode perkalian silang (a × d === b × c) untuk memeriksa kesetaraan sebelum memilih kartu.';
  }

  return {
    accuracy,
    grade,
    strengths,
    improvements,
    recommendation,
  };
}
