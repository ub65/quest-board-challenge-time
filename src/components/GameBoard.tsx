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

// Enhanced sound effects with better audio context management and higher volume
const playSound = (soundType: string, soundEnabled: boolean, volume: number = 0.5) => {
  if (!soundEnabled || volume === 0) {
    console.log(`[SOUND] Skipped ${soundType} - sound disabled or volume 0`);
    return;
  }
  
  console.log(`[SOUND] Playing ${soundType} at volume ${volume}`);
  
  try {
    // Create a new audio context for each sound to avoid conflicts
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Resume audio context if suspended (required by some browsers)
    if (audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
        console.log('[SOUND] Audio context resumed');
        playActualSound();
      });
    } else {
      playActualSound();
    }
    
    function playActualSound() {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Increase base volume significantly and use the user's volume setting
      const adjustedVolume = Math.max(0, Math.min(1, volume)) * 0.3; // Increased from 0.15 to 0.3
      console.log(`[SOUND] Adjusted volume: ${adjustedVolume}`);
      
      // Create audio envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(adjustedVolume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
      
      // Set oscillator type for better sound quality
      oscillator.type = 'sine';
      
      switch (soundType) {
        case 'move':
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(660, audioContext.currentTime + 0.1);
          break;
        case 'correct':
          // Pleasant ascending chord
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
          oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
          oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
          break;
        case 'wrong':
          // Descending tone
          oscillator.frequency.setValueAtTime(330, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.3);
          break;
        case 'win':
          // Victory fanfare
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.15);
          oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.3);
          oscillator.frequency.setValueAtTime(1047, audioContext.currentTime + 0.45);
          break;
        case 'surprise':
          // Magical sound
          oscillator.frequency.setValueAtTime(330, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(415, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime + 0.2);
          break;
        case 'defense':
          // Low defensive sound
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.15);
          break;
        case 'test':
          // Test sound - simple beep
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          break;
        default:
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      }
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      console.log(`[SOUND] ${soundType} sound started`);
      
      // Clean up audio context after use
      setTimeout(() => {
        if (audioContext.state !== 'closed') {
          audioContext.close();
          console.log('[SOUND] Audio context closed');
        }
      }, 600);
    }
    
  } catch (error) {
    console.error("Audio failed:", error);
  }
};

const GameBoard = ({
  difficulty: initialDifficulty,
  onRestart,
  playerName,
  gameCode,
  onlineRole,
  questionType = "translate",
  soundEnabled = true,
  volume = 0.5,
}: {
  difficulty: "easy" | "medium" | "hard";
  onRestart: () => void;
  playerName?: string;
  gameCode?: string;
  onlineRole?: "host" | "guest";
  questionType?: "translate" | "math";
  soundEnabled?: boolean;
  volume?: number;
}) => {
  const { t, language } = useLocalization();

  const {
    difficulty, setDifficulty,
    settingsOpen, setSettingsOpen,
    questionTime, setQuestionTime,
    boardSize, setBoardSize,
    numSurprises, setNumSurprises,
    numDefenses, setNumDefenses,
  } = useGameSettings(initialDifficulty);

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
  } = useGameBoardState(boardSize, numSurprises);

  // Local sound state for mute button
  const [localSoundEnabled, setLocalSoundEnabled] = useState(soundEnabled);

  const BOARD_SIZE = boardSize;
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

  // Test sound on component mount
  useEffect(() => {
    console.log(`[SOUND] GameBoard mounted with sound: ${soundEnabled}, volume: ${volume}`);
    if (soundEnabled && volume > 0) {
      // Play a test sound after a short delay to ensure audio context is ready
      setTimeout(() => {
        console.log('[SOUND] Playing test sound...');
        playSound('test', true, volume);
      }, 1000);
    }
  }, []);

  useEffect(() => {
    const randomStartingPlayer = getRandomStartingPlayer();
    setStartingPlayer(randomStartingPlayer);
    setGameStarted(false);
    setTurn(randomStartingPlayer);
    setPositions({
      human: { x: 0, y: 0 },
      ai: { x: boardSize - 1, y: boardSize - 1 }
    });
    setWinner(null);
    setHumanPoints(0);
    setAIPoints(0);
    setBoardPoints(generateRandomPoints(boardSize));
    setSurpriseTiles(getRandomSurpriseTiles(boardSize, numSurprises));
    setDefenseTiles([]);
    setDefensesUsed({ human: 0, ai: 0 });
    setDefenseMode(false);
    setHumanHasMoved(false);
    setDisableInput(true);
    // eslint-disable-next-line
  }, [boardSize, numSurprises, numDefenses]);

  const handleStartGame = () => {
    setGameStarted(true);
    setDisableInput(false);
    // Set humanHasMoved based on starting player
    if (startingPlayer === "ai") {
      setHumanHasMoved(true); // Allow AI to move immediately
    } else {
      setHumanHasMoved(false); // Human needs to move first
    }
    
    // Play a start game sound
    console.log('[SOUND] Game starting, playing start sound');
    playSound('correct', localSoundEnabled, volume);
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
      console.log(`[SOUND] Game ended, winner: ${winner}`);
      playSound(winner === "human" ? "win" : "wrong", localSoundEnabled, volume);
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
    console.log('[SOUND] Surprise triggered, playing surprise sound');
    playSound("surprise", localSoundEnabled, volume);
    return result;
  }, [surpriseHandler, localSoundEnabled, volume]);

  // Create human move handler
  const { handleTileClick: humanTileClick } = useHumanMoveHandler({
    winner,
    disableInput,
    turn,
    positions,
    BOARD_SIZE,
    defenseTiles,
    difficulty,
    defenseMode,
    handleDefenseClick: () => {}, // Will be set below
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

  // Enhanced handleDefenseClick function
  const handleDefenseClick = useCallback((tile: { x: number; y: number }) => {
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
      console.log('[SOUND] Defense placement failed, playing wrong sound');
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
    
    console.log('[SOUND] Defense placed successfully, playing defense sound');
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
  }, [BOARD_SIZE, numDefenses, positions, defenseTiles, surpriseTiles, defensesUsed, t, toast, setDefenseTiles, setDefensesUsed, setDefenseMode, localSoundEnabled, volume]);

  // Enhanced useDefenseModeHandler hook
  const { toggleDefensePlacement } = useDefenseModeHandler({
    t,
    toast,
    setDefenseMode,
    handleDefenseClick,
    defenseMode,
  });

  // Enhanced handleTileClick function to properly handle defense cancellation
  const handleTileClick = useCallback((tile: { x: number; y: number }) => {
    console.log("Tile clicked:", tile, "Turn:", turn, "Defense mode:", defenseMode, "Disabled:", disableInput);
    
    // If in defense mode, handle defense placement
    if (defenseMode) {
      handleDefenseClick(tile);
      return; // Important: return early to prevent normal move logic
    }

    // Use the human move handler for normal moves
    humanTileClick(tile);
  }, [defenseMode, handleDefenseClick, humanTileClick, turn, disableInput]);

  // Add escape key handler for canceling defense mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && defenseMode) {
        setDefenseMode(false);
        toast({
          title: t("game.defense_cancelled") || "Defense Cancelled",
          description: t("game.defense_cancelled_desc") || "Defense placement mode disabled",
          duration: 1500,
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [defenseMode, setDefenseMode, t, toast]);

  // Cancel defense mode when turn changes
  useEffect(() => {
    if (defenseMode && turn !== 'human') {
      setDefenseMode(false);
    }
  }, [turn, defenseMode, setDefenseMode]);

  // Cancel defense mode when game ends
  useEffect(() => {
    if (winner && defenseMode) {
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
          onClick={onCancel}
          className="ml-2 bg-white/20 hover:bg-white/30 rounded px-2 py-1 text-sm"
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
      console.log('[SOUND] AI moved, playing move sound');
      playSound("move", localSoundEnabled, volume);
      
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
    boardSize,
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

  // Enhanced modal submit handlers with sound
  const handleHumanModalSubmit = useCallback((isCorrect: boolean) => {
    console.log(`[SOUND] Human answered ${isCorrect ? 'correctly' : 'incorrectly'}`);
    playSound(isCorrect ? "correct" : "wrong", localSoundEnabled, volume);
    if (moveState?.resolve) {
      moveState.resolve(isCorrect);
    }
  }, [moveState, localSoundEnabled, volume]);

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
            onCancel={() => setDefenseMode(false)} 
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
            questionTime={questionTime}
            onHumanSubmit={handleHumanModalSubmit}
            onAISubmit={handleAIModalSubmit}
            onRestart={handleRestart}
            settingsOpen={settingsOpen}
            setSettingsOpen={setSettingsOpen}
            onBoardSizeChange={v => setBoardSize(Math.max(5, Math.min(12, v || DEFAULT_BOARD_SIZE)))}
            onQuestionTimeChange={v => setQuestionTime(Math.max(6, Math.min(40, v || DEFAULT_QUESTION_TIME)))}
            onSurpriseCountChange={setNumSurprises}
            onNumDefensesChange={setNumDefenses}
            onDifficultyChange={setDifficulty}
            surpriseCount={numSurprises}
            playerName={playerName}
            soundEnabled={localSoundEnabled}
            onToggleSound={() => {
              const newSoundState = !localSoundEnabled;
              setLocalSoundEnabled(newSoundState);
              console.log(`[SOUND] Sound toggled to: ${newSoundState}`);
              if (newSoundState) {
                // Play a test sound when enabling
                setTimeout(() => playSound('test', true, volume), 100);
              }
            }}
          >
            <GameBoardModals
              moveState={moveState}
              isModalOpen={isModalOpen}
              aiModalState={aiModalState}
              winner={winner}
              questionTime={questionTime}
              onHumanSubmit={handleHumanModalSubmit}
              onAISubmit={handleAIModalSubmit}
              questionType={questionType}
            />
          </GameBoardArea>
        </>
      )}
    </div>
  );
};

export default GameBoard;