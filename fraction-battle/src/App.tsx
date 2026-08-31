import { useState } from 'react';
import {
  GameMode,
  GamePhase,
  Player,
  Fraction,
  FractionCardData,
  RoundResult,
  TeacherConfig,
  GameTimeConfig,
} from './types';
import {
  getTargetForRound,
  generateGridCards,
  calculateTurnScore,
  getLevelConfig,
} from './utils/mathEngine';
import { sound } from './utils/audio';
import { Navbar } from './components/Navbar';
import { PlayerSetup } from './components/PlayerSetup';
import { GameBoard } from './components/GameBoard';
import { TurnTransition } from './components/TurnTransition';
import { RoundFeedbackModal } from './components/RoundFeedbackModal';
import { Leaderboard } from './components/Leaderboard';
import { FinalResults } from './components/FinalResults';
import { HelpModal } from './components/HelpModal';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [mode, setMode] = useState<GameMode>('quick');
  const [timeConfig, setTimeConfig] = useState<GameTimeConfig>({
    mode: 'timed',
    durationMinutes: 3,
    timeLimitSeconds: 180,
  });
  const [teacherConfig, setTeacherConfig] = useState<TeacherConfig | undefined>(
    undefined
  );
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [totalRounds, setTotalRounds] = useState<number>(5);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [completedThisRoundPlayerIds, setCompletedThisRoundPlayerIds] = useState<
    string[]
  >([]);

  // Current turn puzzle data
  const [currentTarget, setCurrentTarget] = useState<Fraction>({
    numerator: 3,
    denominator: 4,
  });
  const [currentGridCards, setCurrentGridCards] = useState<FractionCardData[]>(
    []
  );
  const [latestRoundResult, setLatestRoundResult] =
    useState<RoundResult | null>(null);

  // Sound and UI modals
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  // Start new game from setup screen
  const handleStartGame = (
    configuredPlayers: Player[],
    chosenMode: GameMode,
    chosenTimeConfig: GameTimeConfig,
    customTeacherConfig?: TeacherConfig
  ) => {
    setPlayers(configuredPlayers);
    setMode(chosenMode);
    setTimeConfig(chosenTimeConfig);
    setTeacherConfig(customTeacherConfig);

    const rounds =
      chosenMode === 'teacher' && customTeacherConfig
        ? customTeacherConfig.totalRounds
        : chosenMode === 'quick'
        ? 5
        : chosenMode === 'champion'
        ? 10
        : 5;

    setTotalRounds(rounds);
    setCurrentRound(1);
    setActivePlayerIndex(0);
    setCompletedThisRoundPlayerIds([]);

    // Generate puzzle for first player with Level Grid System
    const target = getTargetForRound(1, rounds, customTeacherConfig);
    const firstPlayer = configuredPlayers[0];
    const { dimension } = getLevelConfig(
      1,
      chosenMode,
      rounds,
      customTeacherConfig,
      chosenTimeConfig
    );
    const cards = generateGridCards({
      target,
      gridDimension: dimension,
      playerId: firstPlayer ? firstPlayer.id : 'player_1',
    });

    setCurrentTarget(target);
    setCurrentGridCards(cards);

    if (configuredPlayers.length > 1) {
      setPhase('turn_ready');
    } else {
      // 1 Player Solo mode: start playing immediately
      setPhase('playing');
    }
  };

  // Start the active turn after passing the screen
  const handleStartActiveTurn = () => {
    setPhase('playing');
  };

  // Turn finished (either by button click or timer expiry)
  const handleFinishTurn = (selectedCardIds: string[], timeSpent: number) => {
    const activePlayer = players[activePlayerIndex];
    if (!activePlayer) return;

    const selectedCards = currentGridCards.filter((c) =>
      selectedCardIds.includes(c.id)
    );
    const correctCards = selectedCards.filter((c) => c.isEquivalent);
    const wrongCards = selectedCards.filter((c) => !c.isEquivalent);

    const allEquivalentsInGrid = currentGridCards.filter((c) => c.isEquivalent);
    const missedCards = allEquivalentsInGrid.filter(
      (c) => !selectedCardIds.includes(c.id)
    );

    const scoreCalc = calculateTurnScore({
      selectedCards,
      totalAvailableCorrect: allEquivalentsInGrid.length,
    });

    const result: RoundResult = {
      playerId: activePlayer.id,
      roundNumber: currentRound,
      targetFraction: currentTarget,
      gridSize: currentGridCards.length,
      selectedCards,
      correctCards,
      wrongCards,
      missedCards,
      totalAvailableCorrect: allEquivalentsInGrid.length,
      scoreEarned: scoreCalc.score,
      accuracy: scoreCalc.accuracy,
      timeSpent,
      maxCombo: scoreCalc.maxStreak,
      allCorrectFoundBonus: scoreCalc.allCorrectFoundBonus,
      flawlessBonus: scoreCalc.flawlessBonus,
    };

    setLatestRoundResult(result);

    // Update Player stats
    const updatedPlayers = players.map((p, idx) => {
      if (idx === activePlayerIndex) {
        return {
          ...p,
          score: p.score + scoreCalc.score,
          roundsPlayed: p.roundsPlayed + 1,
          totalCorrect: p.totalCorrect + correctCards.length,
          totalWrong: p.totalWrong + wrongCards.length,
          totalMissed: p.totalMissed + missedCards.length,
          totalTimeSpent: p.totalTimeSpent + timeSpent,
          highestCombo: Math.max(p.highestCombo, scoreCalc.maxStreak),
        };
      }
      return p;
    });

    setPlayers(updatedPlayers);
    setCompletedThisRoundPlayerIds((prev) => [...prev, activePlayer.id]);
    setPhase('round_feedback');
  };

  // Advance to next player or next round or final results
  const handleProceedAfterFeedback = () => {
    const isLastPlayerInRound = activePlayerIndex === players.length - 1;
    const isLastRound = currentRound === totalRounds;

    if (isLastPlayerInRound && isLastRound) {
      // Game completely finished!
      setPhase('game_over');
      return;
    }

    if (isLastPlayerInRound) {
      // Move to Next Round with Player 0
      const nextRoundNumber = currentRound + 1;
      setCurrentRound(nextRoundNumber);
      setActivePlayerIndex(0);
      setCompletedThisRoundPlayerIds([]);

      // Generate new global puzzle target ONLY when advancing to the next round
      const newRoundTarget = getTargetForRound(
        nextRoundNumber,
        totalRounds,
        teacherConfig
      );
      const { dimension } = getLevelConfig(
        nextRoundNumber,
        mode,
        totalRounds,
        teacherConfig,
        timeConfig
      );
      const firstPlayerOfRound = players[0];
      const cards = generateGridCards({
        target: newRoundTarget,
        gridDimension: dimension,
        playerId: firstPlayerOfRound ? firstPlayerOfRound.id : 'player_1',
      });

      setCurrentTarget(newRoundTarget);
      setCurrentGridCards(cards);

      if (players.length > 1) {
        setPhase('turn_ready');
      } else {
        // Solo player: langsung main ronde berikutnya
        setPhase('playing');
      }
    } else {
      // Move to Next Player in the SAME round
      const nextPlayerIdx = activePlayerIndex + 1;
      const nextPlayer = players[nextPlayerIdx];
      setActivePlayerIndex(nextPlayerIdx);

      // ATURAN FAIRNESS: Target tetap SAMA untuk semua pemain di ronde yang sama (currentTarget).
      // Namun buat susunan kartu (board instance) baru yang diacak khusus untuk pemain ini.
      const { dimension } = getLevelConfig(
        currentRound,
        mode,
        totalRounds,
        teacherConfig,
        timeConfig
      );
      const cards = generateGridCards({
        target: currentTarget, // TARGET GLOBAL BERSAMA
        gridDimension: dimension,
        playerId: nextPlayer ? nextPlayer.id : `player_${nextPlayerIdx + 1}`,
      });

      // Target tidak diubah, hanya grid cards yang di-update untuk pemain baru
      setCurrentGridCards(cards);
      setPhase('turn_ready');
    }
  };

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleResetToMenu = () => {
    setIsResetConfirmOpen(false);
    setPhase('setup');
  };

  const activePlayer = players[activePlayerIndex] || players[0];
  const { dimension, timeLimit } = getLevelConfig(
    currentRound,
    mode,
    totalRounds,
    teacherConfig,
    timeConfig
  );
  const isLastTurnOfGame =
    activePlayerIndex === players.length - 1 && currentRound === totalRounds;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-blue-200">
      {/* Top Navigation */}
      <Navbar
        phase={phase}
        mode={mode}
        currentRound={currentRound}
        totalRounds={totalRounds}
        gridDimension={dimension}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onOpenHelp={() => setIsHelpOpen(true)}
        onResetGame={() => setIsResetConfirmOpen(true)}
      />

      {/* Main Content Arena */}
      <main className="flex-1 flex flex-col justify-center py-4">
        {phase === 'setup' && (
          <PlayerSetup onStartGame={handleStartGame} />
        )}

        {phase === 'turn_ready' && activePlayer && (
          <div className="w-full max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            <div className="lg:col-span-3">
              <TurnTransition
                nextPlayer={activePlayer}
                roundNumber={currentRound}
                totalRounds={totalRounds}
                gridDimension={dimension}
                timeLimit={timeLimit}
                onStartTurn={handleStartActiveTurn}
              />
            </div>
            <div className="lg:col-span-1">
              <Leaderboard
                players={players}
                activePlayerId={activePlayer.id}
                completedThisRoundPlayerIds={completedThisRoundPlayerIds}
                currentRound={currentRound}
                totalRounds={totalRounds}
              />
            </div>
          </div>
        )}

        {phase === 'playing' && activePlayer && (
          <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
            <div className="lg:col-span-3">
              <GameBoard
                key={`${activePlayer.id}_r${currentRound}`}
                player={activePlayer}
                roundNumber={currentRound}
                totalRounds={totalRounds}
                targetFraction={currentTarget}
                gridCards={currentGridCards}
                gridDimension={dimension}
                timeLimit={timeLimit}
                onFinishTurn={handleFinishTurn}
              />
            </div>
            <div className="lg:col-span-1">
              <Leaderboard
                players={players}
                activePlayerId={activePlayer.id}
                completedThisRoundPlayerIds={completedThisRoundPlayerIds}
                currentRound={currentRound}
                totalRounds={totalRounds}
              />
            </div>
          </div>
        )}

        {phase === 'round_feedback' && latestRoundResult && activePlayer && (
          <>
            <div className="w-full max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-4 items-start opacity-40 pointer-events-none">
              <div className="lg:col-span-3">
                <GameBoard
                  player={activePlayer}
                  roundNumber={currentRound}
                  totalRounds={totalRounds}
                  targetFraction={currentTarget}
                  gridCards={currentGridCards}
                  gridDimension={dimension}
                  timeLimit={timeLimit}
                  onFinishTurn={() => {}}
                />
              </div>
              <div className="lg:col-span-1">
                <Leaderboard
                  players={players}
                  activePlayerId={activePlayer.id}
                  completedThisRoundPlayerIds={completedThisRoundPlayerIds}
                  currentRound={currentRound}
                  totalRounds={totalRounds}
                />
              </div>
            </div>

            <RoundFeedbackModal
              player={activePlayer}
              result={latestRoundResult}
              isLastTurnOfGame={isLastTurnOfGame}
              onContinue={handleProceedAfterFeedback}
            />
          </>
        )}

        {phase === 'game_over' && (
          <FinalResults
            players={players}
            mode={mode}
            teacherConfig={teacherConfig}
            totalRounds={totalRounds}
            onRestart={handleResetToMenu}
          />
        )}
      </main>

      {/* Help Modal */}
      {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} />}

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-slate-900 mb-2">
              Mulai Ulang Permainan?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-5">
              Skor dan progress pertandingan saat ini akan direset kembali ke menu utama.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                BATAL
              </button>
              <button
                type="button"
                id="confirm-reset-btn"
                onClick={handleResetToMenu}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
              >
                YA, RESET
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
