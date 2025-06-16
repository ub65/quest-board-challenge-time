
import { useEffect } from "react";
import { useLocalization } from "@/contexts/LocalizationContext";
import { toast } from "@/components/ui/use-toast";
import { useAITurn } from "./aiHooks";
import { useHumanMoveHandler } from "./humanHooks";
import { useSurprise } from "./useSurprise";
import { useGameRestart } from "./useGameRestart";
import { canPlaceDefenseHere } from "./defenseHelpers";
import { useGameSettings } from "./useGameSettings";
import { useGameBoardState } from "./useGameBoardState";
import { useDefenseModeHandler } from "./useDefenseModeHandler";
import { useStartGamePhase } from "./useStartGamePhase";
import { useQuestionHandlers } from "./useQuestionHandlers";
import { useModalHandlers } from "./useModalHandlers";
import {
  DEFAULT_BOARD_SIZE,
  DEFAULT_QUESTION_TIME,
} from "./types";

export function useMainGameBoard({
  initialDifficulty,
  questionType = "translate",
}: {
  initialDifficulty: "easy" | "medium" | "hard";
  questionType?: "translate" | "math";
}) {
  const { t } = useLocalization();
  const {
    difficulty, setDifficulty,
    settingsOpen, setSettingsOpen,
    soundEnabled, setSoundEnabled,
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
    sound, setSound,
    disableInput, setDisableInput,
    humanHasMoved, setHumanHasMoved,
    getRandomStartingPlayer,
  } = useGameBoardState(boardSize, numSurprises, numDefenses);

  const startPhase = useStartGamePhase({
    boardSize,
    numSurprises,
    numDefenses,
    setPositions,
    setWinner,
    setTurn,
    setHumanPoints,
    setAIPoints,
    setBoardPoints,
    setSurpriseTiles,
    setDefenseTiles,
    setDefensesUsed,
    setDefenseMode,
    setHumanHasMoved,
    setDisableInput,
    getRandomStartingPlayer,
  });

  const BOARD_SIZE = boardSize;
  const aiTarget = { x: 0, y: 0 };
  const humanTarget = { x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 };

  const { getQuestionForTurn, getQuestionForAiTurn } = useQuestionHandlers(
    questionType,
    difficulty
  );

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

  const modalHandlers = useModalHandlers({
    winner,
    BOARD_SIZE,
    setPositions,
    setBoardPoints,
    setAIPoints,
    setSound,
    setTurn,
    setDisableInput,
    surpriseHandler,
  });

  useAITurn({
    turn,
    winner,
    aiModalState: modalHandlers.aiModalState,
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
    aiMovingRef: modalHandlers.aiMovingRef,
    humanHasMoved,
    setAIModalState: (val) => {
      if (val && val.targetTile) {
        modalHandlers.setAIModalState({
          ...val,
          question: getQuestionForAiTurn()
        });
      } else {
        modalHandlers.setAIModalState(val);
      }
    }
  });

  const { startDefensePlacement } = useDefenseModeHandler({
    t,
    toast,
    setDefenseMode,
    handleDefenseClick,
  });

  const { handleTileClick } = useHumanMoveHandler({
    winner,
    disableInput,
    turn,
    positions,
    BOARD_SIZE,
    defenseTiles,
    difficulty,
    defenseMode,
    handleDefenseClick,
    setSound,
    setPositions,
    setBoardPoints,
    setIsModalOpen,
    setMoveState,
    setTurn,
    setHumanPoints,
    handleSurprise: surpriseHandler,
    questionType,
    getQuestionForTurn,
    setHumanHasMoved,
    humanHasMoved,
  });

  function handleDefenseClick(tile: { x: number; y: number }) {
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
      toast({
        title: t("game.defense_fail") || "Invalid defense placement",
        description: `⛔ Defense! ${problem}`,
        duration: 2500,
      });
      return;
    }
    setDefenseTiles((prev) => [...prev, { ...tile, owner: "human" }]);
    setDefensesUsed((d) => ({ ...d, human: d.human + 1 }));
    setDefenseMode(false);
    toast({
      title: t("game.defense_placed") || "Defense Placed",
      description: `🛡️ Defense! ${t("game.defense_success") || "AI cannot move to this tile!"}`,
      duration: 2000,
    });
  }

  const handleRestart = useGameRestart({
    boardSize,
    numSurprises,
    setPositions,
    setWinner,
    setTurn,
    setIsModalOpen,
    setMoveState,
    setAIModalState: modalHandlers.setAIModalState,
    setDisableInput,
    setHumanPoints,
    setAIPoints,
    setBoardPoints,
    setSurpriseTiles,
    setDefenseTiles,
    setDefensesUsed,
    setDefenseMode,
  });

  useEffect(() => {
    if (winner) {
      setMoveState(null);
      modalHandlers.setAIModalState(null);
      setIsModalOpen(false);
      setDisableInput(true);
      modalHandlers.aiMovingRef.current = false;
      setDefenseMode(false);
    }
  }, [winner, setMoveState, setIsModalOpen, setDisableInput, setDefenseMode, modalHandlers]);

  useEffect(() => {
    if (positions.human.x === humanTarget.x && positions.human.y === humanTarget.y) {
      setWinner("human");
      setSound("win");
    } else if (positions.ai.x === aiTarget.x && positions.ai.y === aiTarget.y) {
      setWinner("ai");
      setSound("win");
    }
  }, [positions, humanTarget.x, humanTarget.y, aiTarget.x, aiTarget.y, setWinner, setSound]);

  useEffect(() => {
    console.log("[GAMEBOARD] Turn changed:", turn, "Winner:", winner);
  }, [turn, winner]);

  return {
    // Localization
    t,
    
    // Settings
    difficulty, setDifficulty,
    settingsOpen, setSettingsOpen,
    soundEnabled, setSoundEnabled,
    questionTime, setQuestionTime,
    boardSize, setBoardSize,
    numSurprises, setNumSurprises,
    numDefenses, setNumDefenses,
    
    // Game state
    boardPoints, humanPoints, aiPoints,
    surpriseTiles, defenseTiles, defensesUsed,
    defenseMode, positions, winner, turn,
    moveState, isModalOpen, sound, disableInput,
    
    // Targets and size
    BOARD_SIZE, aiTarget, humanTarget,
    
    // Handlers
    handleTileClick,
    startDefensePlacement,
    handleRestart,
    
    // Modal handlers
    ...modalHandlers,
    
    // Start phase
    startPhase,
  };
}
