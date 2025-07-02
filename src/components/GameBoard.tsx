import React, { useRef, useEffect, useState, useCallback } from "react";
import { useLocalization } from "@/contexts/LocalizationContext";
import { toast } from "@/components/ui/use-toast";
import { PlayerType, DEFAULT_BOARD_SIZE, DEFAULT_QUESTION_TIME } from "./GameBoard/types";
import { getValidMoves, positionsEqual, generateRandomPoints, getRandomSurpriseTiles } from "./GameBoard/utils";
import { useAITurn } from "./GameBoard/aiHooks";
import { useHumanMoveHandler } from "./GameBoard/humanHooks";
import { useSurprise } from "./GameBoard/useSurprise";
import { useGameRestart } from "./GameBoard/useGameRestart";
import { canPlaceDefenseHere } from "./GameBoard/defenseHelpers";
import { useGameSettings } from "./GameBoard/useGameSettings";
import { useGameBoardState } from "./GameBoard/useGameBoardState";
import GameBoardArea from "./GameBoard/GameBoardArea";
import { useDefenseModeHandler } from "./GameBoard/useDefenseModeHandler";
import GameBoardModals from "./GameBoard/GameBoardModals";
import { generateQuestion } from "./GameBoard/questionGenerator";
import { playSound, audioManager } from "@/lib/audioManager";

const GameBoard = ({
  difficulty: initialDifficulty,
  onRestart,
  playerName,
  gameCode,
  onlineRole,
  questionType = "translate",
  soundEnabled = true,
  volume = 0.5,
  boardSize: propBoardSize = DEFAULT_BOARD_SIZE,
  questionTime: propQuestionTime = DEFAULT_QUESTION_TIME,
}: {
  difficulty: "easy" | "medium" | "hard";
  onRestart: () => void;
  playerName?: string;
  gameCode?: string;
  onlineRole?: "host" | "guest";
  questionType?: "translate" | "math";
  soundEnabled?: boolean;
  volume?: number;
  boardSize?: number;
  questionTime?: number;
}) => {
  const { t, language } = useLocalization();

  const {
    difficulty, setDifficulty,
    settingsOpen, setSettingsOpen,
    questionTime: internalQuestionTime, setQuestionTime,
    boardSize: internalBoardSize, setBoardSize,
    numSurprises, setNumSurprises,
    numDefenses, setNumDefenses,
  } = useGameSettings(initialDifficulty);

  // Use prop values if provided, otherwise use internal state
  const actualBoardSize = propBoardSize || internalBoardSize;
  const actualQuestionTime = propQuestionTime || internalQuestionTime;

  console.log('[GAMEBOARD] Settings values:', {
    propBoardSize,
    internalBoardSize,
    actualBoardSize,
    propQuestionTime,
    internalQuestionTime,
    actualQuestionTime,
    gameKey: Date.now() % 10000
  });

  const {
    boardPoints, setBoardPoints,
    humanPoints, setHumanPoints,
    aiPoints, setAIPoints,
    surpriseTiles, setSurpriseTiles,
    defenseTiles, setDefenseTiles,
    defensesUsed, setDefensesUsed,
    defenseMode, setDefenseMode,
    positions, setPositions,
    winner, setWinner,
    turn, setTurn,
    moveState, setMoveState,
    isModalOpen, setIsModalOpen,
    disableInput, setDisableInput,
    humanHasMoved, setHumanHasMoved,
    getRandomStartingPlayer,
  } = useGameBoardState(actualBoardSize, numSurprises);

  // Local sound state for mute button
  const [localSoundEnabled, setLocalSoundEnabled] = useState(soundEnabled);
  const [audioInitialized, setAudioInitialized] = useState(false);

  const BOARD_SIZE = actualBoardSize;
  const aiTarget = { x: 0, y: 0 };
  const humanTarget = { x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 };
  const [aiModalState, setAIModalState] = useState<null | { question: any; targetTile: any }>(null);
  const aiMovingRef = useRef(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [startingPlayer, setStartingPlayer] = useState<"human" | "ai" | null>(null);

  // Update local sound state when prop changes
  useEffect(() => {
    setLocalSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  // Update audio manager settings when props change
  useEffect(() => {
    audioManager.setEnabled(localSoundEnabled);
    audioManager.setVolume(volume);
  }, [localSoundEnabled, volume]);

  // Initialize audio on first user interaction
  const initializeAudio = useCallback(async () => {
    if (!audioInitialized) {
      console.log('[AUDIO] Initializing audio on user interaction...');
      try {
        await audioManager.initialize();
        setAudioInitialized(true);
        console.log('[AUDIO] Audio system ready');
      } catch (error) {
        console.error('[AUDIO] Failed to initialize audio:', error);
      }
    }
  }, [audioInitialized]);

  // Reset game when board size changes
  useEffect(() => {
    console.log('[GAME] Board size changed to:', actualBoardSize);
    const randomStartingPlayer = getRandomStartingPlayer();
    setStartingPlayer(randomStartingPlayer);
    setGameStarted(false);
    setTurn(randomStartingPlayer);
    setPositions({
      human: { x: 0, y: 0 },
      ai: { x: actualBoardSize - 1, y: actualBoardSize - 1 }
    });
    setWinner(null);
    setHumanPoints(0);
    setAIPoints(0);
    setBoardPoints(generateRandomPoints(actualBoardSize));
    setSurpriseTiles(getRandomSurpriseTiles(actualBoardSize, numSurprises));
    setDefenseTiles([]);
    setDefensesUsed({ human: 0, ai: 0 });
    setDefenseMode(false);
    setHumanHasMoved(false);
    setDisableInput(true);
    setMoveState(null);
    setAIModalState(null);
    setIsModalOpen(false);
    aiMovingRef.current = false;
  }, [actualBoardSize, numSurprises, numDefenses, getRandomStartingPlayer, setPositions, setTurn, setWinner, setHumanPoints, setAIPoints, setBoardPoints, setSurpriseTiles, setDefenseTiles, setDefensesUsed, setDefenseMode, setHumanHasMoved, setDisableInput, setMoveState, setIsModalOpen]);

  const handleStartGame = async () => {
    await initializeAudio(); // Initialize audio on game start
    setGameStarted(true);
    setDisableInput(false);
    // Set humanHasMoved based on starting player
    if (startingPlayer === "ai") {
      setHumanHasMoved(true); // Allow AI to move immediately
    } else {
      setHumanHasMoved(false); // Human needs to move first
    }
    
    // Play a start game sound
    console.log('[AUDIO] Game starting, playing start sound');
    setTimeout(() => {
      playSound('correct', localSoundEnabled, volume);
    }, 500); // Delay to ensure audio is ready
  };

  useEffect(() => {
    if (winner) {
      setMoveState(null);
      setAIModalState(null);
      setIsModalOpen(false);
      setDisableInput(true);
      aiMovingRef.current = false;
      setDefenseMode(false);
      
      // Play win/lose sound
      console.log(`[AUDIO] Game ended, winner: ${winner}`);
      setTimeout(() => {
        playSound(winner === "human" ? "win" : "wrong", localSoundEnabled, volume);
      }, 300);
    }
  }, [winner, localSoundEnabled, volume]);

  useEffect(() => {
    if (positions.human.x === humanTarget.x && positions.human.y === humanTarget.y) {
      setWinner("human");
    } else if (positions.ai.x === aiTarget.x && positions.ai.y === aiTarget.y) {
      setWinner("ai");
    }
  }, [positions, humanTarget.x, humanTarget.y, aiTarget.x, aiTarget.y]);

  const surpriseHandler = useSurprise({
    boardPoints,
    surpriseTiles,
    setSurpriseTiles,
    setHumanPoints,
    setAIPoints,
    humanPoints,
    aiPoints,
    t,
    toast,
  });

  // Enhanced surprise handler with sound
  const surpriseHandlerWithSound = useCallback((tile: any, player: string) => {
    const result = surpriseHandler(tile, player);
    console.log('[AUDIO] Surprise triggered, playing surprise sound');
    setTimeout(() => {
      playSound("surprise", localSoundEnabled, volume);
    }, 200);
    return result;
  }, [surpriseHandler, localSoundEnabled, volume]);

  // Enhanced handleDefenseClick function
  const handleDefenseClick = useCallback(async (tile: { x: number; y: number }) => {
    await initializeAudio(); // Ensure audio is ready
    
    const problem = canPlaceDefenseHere({
      tile,
      BOARD_SIZE,
      numDefenses,
      positions,
      defenseTiles,
      surpriseTiles,
      defensesUsed,
      t,
    });
    
    if (problem) {
      console.log('[AUDIO] Defense placement failed, playing wrong sound');
      playSound("wrong", localSoundEnabled, volume);
      toast({
        title: t("game.defense_fail") || "Invalid defense placement",
        description: (
          <span className="flex items-center gap-2">
            <span className="font-semibold">⛔ Defense! </span>
            {problem}
          </span>
        ),
        duration: 2500,
      });
      // Don't exit defense mode on failed placement
      return;
    }
    
    // Successfully placed defense
    setDefenseTiles((prev) => [...prev, { ...tile, owner: "human" }]);
    setDefensesUsed((d) => ({ ...d, human: d.human + 1 }));
    setDefenseMode(false); // Exit defense mode after successful placement
    
    console.log('[AUDIO] Defense placed successfully, playing defense sound');
    playSound("defense", localSoundEnabled, volume);
    toast({
      title: t("game.defense_placed") || "Defense Placed",
      description: (
        <span className="flex items-center gap-2">
          <span className="font-semibold">🛡️ Defense! </span>
          {t("game.defense_success") || "AI cannot move to this tile!"}
        </span>
      ),
      duration: 2000,
    });
  }, [BOARD_SIZE, numDefenses, positions, defenseTiles, surpriseTiles, defensesUsed, t, toast, setDefenseTiles, setDefensesUsed, setDefenseMode, localSoundEnabled, volume, initializeAudio]);

  // Enhanced useDefenseModeHandler hook
  const { toggleDefensePlacement, cancelDefensePlacement } = useDefenseModeHandler({
    t,
    toast,
    setDefenseMode,
    handleDefenseClick,
    defenseMode,
  });

  // Create human move handler (removed sound props since sound is now in modal)
  const { handleTileClick: humanTileClick } = useHumanMoveHandler({
    winner,
    disableInput,
    turn,
    positions,
    BOARD_SIZE,
    defenseTiles,
    difficulty,
    defenseMode,
    handleDefenseClick,
    setPositions,
    setBoardPoints,
    setIsModalOpen,
    setMoveState,
    setTurn,
    setHumanPoints,
    handleSurprise: surpriseHandlerWithSound,
    questionType,
    getQuestionForTurn: () => generateQuestion(questionType, difficulty),
    setHumanHasMoved,
    humanHasMoved,
  });

  useAITurn({
    turn,
    winner,
    aiModalState,
    disableInput,
    positions,
    defensesUsed,
    defenseTiles,
    surpriseTiles,
    numDefenses,
    difficulty,
    BOARD_SIZE,
    aiTarget,
    humanTarget,
    t,
    setDisableInput,
    setDefenseTiles,
    setDefensesUsed,
    toast,
    setTurn,
    aiMovingRef,
    humanHasMoved,
    setAIModalState: (val) => {
      if (val && val.targetTile) {
        setAIModalState({
          ...val,
          question: generateQuestion(questionType, difficulty)
        });
      } else {
        setAIModalState(val);
      }
    }
  });

  // Enhanced handleTileClick function to properly handle defense cancellation
  const handleTileClick = useCallback(async (tile: { x: number; y: number }) => {
    await initializeAudio(); // Ensure audio is ready on any click
    console.log("Tile clicked:", tile, "Turn:", turn, "Defense mode:", defenseMode, "Disabled:", disableInput);
    
    // If in defense mode, handle defense placement
    if (defenseMode) {
      handleDefenseClick(tile);
      return; // Important: return early to prevent normal move logic
    }

    // Use the human move handler for normal moves
    humanTileClick(tile);
  }, [defenseMode, handleDefenseClick, humanTileClick, turn, disableInput, initializeAudio]);

  // Add escape key handler for canceling defense mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && defenseMode) {
        console.log('[DEFENSE] Escape key pressed, cancelling defense mode');
        event.preventDefault();
        event.stopPropagation();
        cancelDefensePlacement();
      }
    };

    if (defenseMode) {
      document.addEventListener('keydown', handleKeyDown, { capture: true });
      return () => {
        document.removeEventListener('keydown', handleKeyDown, { capture: true });
      };
    }
  }, [defenseMode, cancelDefensePlacement]);

  // Cancel defense mode when turn changes
  useEffect(() => {
    if (defenseMode && turn !== 'human') {
      console.log('[DEFENSE] Turn changed, cancelling defense mode');
      setDefenseMode(false);
    }
  }, [turn, defenseMode, setDefenseMode]);

  // Cancel defense mode when game ends
  useEffect(() => {
    if (winner && defenseMode) {
      console.log('[DEFENSE] Game ended, cancelling defense mode');
      setDefenseMode(false);
    }
  }, [winner, defenseMode, setDefenseMode]);

  // Enhanced UI feedback - add visual indicator for defense mode
  const DefenseModeIndicator = ({ defenseMode, onCancel }: { defenseMode: boolean; onCancel: () => void }) => {
    if (!defenseMode) return null;
    
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <span>🛡️ Defense Mode Active - Click a tile to place defense</span>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[DEFENSE] Cancel button clicked');
            onCancel();
          }}
          className="ml-2 bg-white/20 hover:bg-white/30 rounded px-2 py-1 text-sm transition-colors"
          type="button"
        >
          Cancel (ESC)
        </button>
      </div>
    );
  };

  const handleAIModalSubmit = useCallback((isCorrect: boolean) => {
    console.log("AI modal submit:", isCorrect);
    if (aiModalState) {
      const targetTile = aiModalState.targetTile;
      
      // Move AI regardless of answer (AI always gets correct answer)
      setPositions(prev => {
        const newPos = { ...prev, ai: targetTile };
        
        // Add points from the tile
        setBoardPoints(prevBoard => {
          const newBoard = prevBoard.map(row => [...row]);
          if (!((targetTile.x === 0 && targetTile.y === 0) || (targetTile.x === BOARD_SIZE - 1 && targetTile.y === BOARD_SIZE - 1))) {
            setAIPoints(cur => cur + newBoard[targetTile.y][targetTile.x]);
          }
          return newBoard;
        });
        
        return newPos;
      });
      
      // Play move sound
      console.log('[AUDIO] AI moved, playing move sound');
      setTimeout(() => {
        playSound("move", localSoundEnabled, volume);
      }, 100);
      
      // Handle surprise if any
      setTimeout(() => {
        surpriseHandlerWithSound(targetTile, "ai");
        
        // Switch turn back to human after a delay
        setTimeout(() => {
          if (!winner) {
            setTurn("human");
            setDisableInput(false);
          }
        }, 600);
      }, 100);
      
      setAIModalState(null);
    }
  }, [aiModalState, setPositions, setBoardPoints, setAIPoints, BOARD_SIZE, surpriseHandlerWithSound, winner, setTurn, setDisableInput, localSoundEnabled, volume]);

  const handleRestart = useGameRestart({
    boardSize: actualBoardSize,
    numSurprises,
    setPositions,
    setWinner,
    setTurn,
    setIsModalOpen,
    setMoveState,
    setAIModalState,
    setDisableInput,
    setHumanPoints,
    setAIPoints,
    setBoardPoints,
    setSurpriseTiles,
    setDefenseTiles,
    setDefensesUsed,
    setDefenseMode,
  });

  // Modal submit handlers (sound is now handled in modals)
  const handleHumanModalSubmit = useCallback((isCorrect: boolean) => {
    console.log(`[MODAL] Human answered ${isCorrect ? 'correctly' : 'incorrectly'}`);
    if (moveState?.resolve) {
      moveState.resolve(isCorrect);
    }
  }, [moveState]);

  // Enhanced board size change handler - now just updates internal state
  const handleBoardSizeChange = useCallback((newSize: number) => {
    console.log('[SETTINGS] Internal board size changing from', internalBoardSize, 'to', newSize);
    setBoardSize(newSize);
  }, [internalBoardSize, setBoardSize]);

  // Enhanced question time change handler
  const handleQuestionTimeChange = useCallback((newTime: number) => {
    console.log('[SETTINGS] Internal question time changing from', internalQuestionTime, 'to', newTime);
    setQuestionTime(newTime);
  }, [internalQuestionTime, setQuestionTime]);

  const announcementKey =
    startingPlayer === "human"
      ? "game.startingPlayer.human"
      : "game.startingPlayer.ai";

  return (
    <div className="relative w-full">
      {!gameStarted && startingPlayer && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-5 min-w-[320px] max-w-xs mx-auto">
            <h2 className="text-xl font-bold mb-0">{t("game.title")}</h2>
            <div className="text-base text-center text-gray-700 mb-3">
              {t(announcementKey)}
            </div>
            <button
              className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold text-lg shadow hover:bg-primary/90 transition"
              onClick={handleStartGame}
              autoFocus
              data-testid="start-game-btn"
            >
              {t("welcome.startGame") || "Start Game"}
            </button>
          </div>
        </div>
      )}

      {gameStarted && (
        <>
          <DefenseModeIndicator 
            defenseMode={defenseMode} 
            onCancel={cancelDefensePlacement} 
          />
          <GameBoardArea
            language={language}
            t={t}
            turn={turn}
            winner={winner}
            difficulty={difficulty}
            humanPoints={humanPoints}
            aiPoints={aiPoints}
            numDefenses={numDefenses}
            defensesUsed={defensesUsed}
            onPlaceDefense={toggleDefensePlacement}
            defenseMode={defenseMode}
            boardSize={BOARD_SIZE}
            boardPoints={boardPoints}
            positions={positions}
            humanTarget={humanTarget}
            aiTarget={aiTarget}
            disableInput={disableInput}
            handleTileClick={handleTileClick}
            getValidMoves={(pos) =>
              getValidMoves(
                pos,
                BOARD_SIZE,
                defenseTiles,
                pos === positions.human ? positions.ai : positions.human
              )
            }
            positionsEqual={positionsEqual}
            surpriseTiles={surpriseTiles}
            defenseTiles={defenseTiles}
            aiPendingTarget={aiModalState ? aiModalState.targetTile : null}
            moveState={moveState}
            isModalOpen={isModalOpen}
            aiModalState={aiModalState}
            questionTime={actualQuestionTime}
            onHumanSubmit={handleHumanModalSubmit}
            onAISubmit={handleAIModalSubmit}
            onRestart={handleRestart}
            settingsOpen={settingsOpen}
            setSettingsOpen={setSettingsOpen}
            onBoardSizeChange={handleBoardSizeChange}
            onQuestionTimeChange={handleQuestionTimeChange}
            onSurpriseCountChange={setNumSurprises}
            onNumDefensesChange={setNumDefenses}
            onDifficultyChange={setDifficulty}
            surpriseCount={numSurprises}
            playerName={playerName}
            soundEnabled={localSoundEnabled}
            onToggleSound={async () => {
              const newSoundState = !localSoundEnabled;
              setLocalSoundEnabled(newSoundState);
              console.log(`[AUDIO] Sound toggled to: ${newSoundState}`);
              if (newSoundState) {
                // Initialize audio and play a test sound when enabling
                await initializeAudio();
                setTimeout(() => {
                  playSound('test', true, volume);
                }, 200);
              }
            }}
          >
            <GameBoardModals
              moveState={moveState}
              isModalOpen={isModalOpen}
              aiModalState={aiModalState}
              winner={winner}
              questionTime={actualQuestionTime}
              onHumanSubmit={handleHumanModalSubmit}
              onAISubmit={handleAIModalSubmit}
              questionType={questionType}
              soundEnabled={localSoundEnabled}
              volume={volume}
            />
          </GameBoardArea>
        </>
      )}
    </div>
  );
};

export default GameBoard;