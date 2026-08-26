export type GameMode = 'quick' | 'champion' | 'training' | 'teacher';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'mixed';
export type GridSizeOption = 'auto' | 8 | 10 | 12;

export interface TeacherConfig {
  playerCount: number;
  totalRounds: number;
  gridDimension: GridSizeOption;
  timeLimit: number; // in seconds
  difficulty: DifficultyLevel;
  selectedTargetFractions?: Fraction[];
}

export interface GridLevelConfig {
  level: 1 | 2 | 3;
  dimension: 8 | 10 | 12;
  totalCards: 64 | 100 | 144;
  timeLimit: number;
  levelName: string;
  levelBadgeClass: string;
  badgeText: string;
  description: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  color: string;
  score: number;
  roundsPlayed: number;
  totalCorrect: number;
  totalWrong: number;
  totalMissed: number;
  totalTimeSpent: number; // in seconds
  highestCombo: number;
}

export interface Fraction {
  numerator: number;
  denominator: number;
}

export interface FractionCardData {
  id: string;
  numerator: number;
  denominator: number;
  isEquivalent: boolean;
  explanation: string;
}

export interface TurnSelection {
  cardId: string;
  timestamp: number;
}

export interface RoundResult {
  playerId: string;
  roundNumber: number;
  targetFraction: Fraction;
  gridSize: number;
  selectedCards: FractionCardData[];
  correctCards: FractionCardData[];
  wrongCards: FractionCardData[];
  missedCards: FractionCardData[];
  totalAvailableCorrect: number;
  scoreEarned: number;
  accuracy: number;
  timeSpent: number;
  maxCombo: number;
  allCorrectFoundBonus: boolean;
  flawlessBonus: boolean;
}

export interface LearningAnalysis {
  playerId: string;
  accuracy: number;
  grade: 'SANGAT BAIK' | 'BAIK' | 'MULAI MENGUASAI' | 'PERLU LATIHAN';
  strengths: string[];
  improvements: string[];
  recommendation: string;
}

export type GamePhase =
  | 'setup'
  | 'turn_ready'
  | 'playing'
  | 'round_feedback'
  | 'game_over';
