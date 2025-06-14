import React, { useEffect, useState, useRef } from "react";
import TranslateQuestionModal from "./TranslateQuestionModal";
import SoundManager from "./SoundManager";
import GameSettingsModal from "./GameSettingsModal";
import AITranslateQuestionModal from "./AITranslateQuestionModal";
import GameHeader from "./GameHeader";
import GameScoreboard from "./GameScoreboard";
import GameBoardGrid from "./GameBoardGrid";
import { useLocalization } from "@/contexts/LocalizationContext";
import { Gift, Shield } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Refactored logic
import {
  PlayerType,
  DEFAULT_BOARD_SIZE,
  DEFAULT_QUESTION_TIME,
  DEFAULT_DEFENSES,
  SurpriseType,
  Tile,
  SurpriseTile,
  DefenseTile,
  DefenseOwner,
  SURPRISE_TYPES,
} from "./GameBoard/types";
import {
  getValidMoves,
  positionsEqual,
  generateRandomPoints,
  getRandomSurpriseTiles,
  getAIDefenseTile,
  getDistance,
  getAIMove,
  getRandomQuestion,
} from "./GameBoard/utils";
import { useAITurn } from "./GameBoard/aiHooks";
import { useHumanMoveHandler } from "./GameBoard/humanHooks";
import GameBoardHud from "./GameBoard/GameBoardHud";
import GameBoardModals from "./GameBoard/GameBoardModals";

const GameBoard = ({
  difficulty,
  onRestart
}: {
  difficulty: "easy" | "medium" | "hard";
  onRestart: () => void;
}) => {
  const { t, language } = useLocalization();

  // Settings state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [questionTime, setQuestionTime] = useState<number>(DEFAULT_QUESTION_TIME);
  const [boardSize, setBoardSize] = useState<number>(DEFAULT_BOARD_SIZE);

  // Surprise count setting
  const [numSurprises, setNumSurprises] = useState<number>(4);

  // Defense counts (NEW): user-configurable, both players use same max
  const [numDefenses, setNumDefenses] = useState(DEFAULT_DEFENSES);

  // Points and trackers
  const [boardPoints, setBoardPoints] = useState<number[][]>(
    () => generateRandomPoints(DEFAULT_BOARD_SIZE)
  );
  const [humanPoints, setHumanPoints] = useState(0);
  const [aiPoints, setAIPoints] = useState(0);

  const [surpriseTiles, setSurpriseTiles] = useState<SurpriseTile[]>(
    () => getRandomSurpriseTiles(DEFAULT_BOARD_SIZE, numSurprises)
  );

  // Defense state: multiple per owner
  const [defenseTiles, setDefenseTiles] = useState<DefenseTile[]>([]);
  // Track defenses used
  const [defensesUsed, setDefensesUsed] = useState<{human: number; ai: number}>({human: 0, ai: 0});
  // Are we in defense placement mode for human?
  const [defenseMode, setDefenseMode] = useState(false);

  // Gameplay state
  const [positions, setPositions] = useState(() => ({
    human: { x: 0, y: 0 },
    ai: { x: boardSize - 1, y: boardSize - 1 }
  }));
  const [turn, setTurn] = useState<PlayerType>("human");
  const [moveState, setMoveState] = useState<null | { tile: any; question: any; resolve: (ok: boolean) => void }>(null);
  const [winner, setWinner] = useState<null | PlayerType>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sound, setSound] = useState<"move" | "wrong" | "win" | null>(null);
  const [disableInput, setDisableInput] = useState(false);

  // AI state
  const aiMovingRef = useRef(false);
  const [aiModalState, setAIModalState] = useState<null | { question: any; targetTile: any }>(null);

  const BOARD_SIZE = boardSize;
  const aiTarget = { x: 0, y: 0 };
  const humanTarget = { x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 };

  // On game reset
  useEffect(() => {
    setPositions({
      human: { x: 0, y: 0 },
      ai: { x: boardSize - 1, y: boardSize - 1 }
    });
    setWinner(null);
    setTurn("human");
    setHumanPoints(0);
    setAIPoints(0);
    setBoardPoints(generateRandomPoints(boardSize));
    setSurpriseTiles(getRandomSurpriseTiles(boardSize, numSurprises));
    setDefenseTiles([]);
    setDefensesUsed({human: 0, ai: 0});
    setDefenseMode(false);
  }, [boardSize, numSurprises, numDefenses]);

  useEffect(() => {
    if (winner) {
      setMoveState(null);
      setAIModalState(null);
      setIsModalOpen(false);
      setDisableInput(true);
      aiMovingRef.current = false;
      setDefenseMode(false);
    }
  }, [winner]);

  useEffect(() => {
    if (positions.human.x === humanTarget.x && positions.human.y === humanTarget.y) {
      setWinner("human");
      setSound("win");
    } else if (positions.ai.x === aiTarget.x && positions.ai.y === aiTarget.y) {
      setWinner("ai");
      setSound("win");
    }
  }, [positions, humanTarget.x, humanTarget.y, aiTarget.x, aiTarget.y]);

  // AI turn, including defense! (before question)
  useAITurn({
    turn, winner, aiModalState, disableInput, positions, defensesUsed, defenseTiles, surpriseTiles, numDefenses, difficulty, BOARD_SIZE,
    aiTarget, humanTarget, t, setDisableInput, setDefenseTiles, setDefensesUsed, toast, setTurn, setAIModalState, aiMovingRef,
  });

  function handleSurprise(tile: Tile, player: PlayerType) {
    // Find surprise
    const sIdx = surpriseTiles.findIndex(st => st.x === tile.x && st.y === tile.y && !st.used);
    if (sIdx === -1) return; // no active surprise here
    const s = surpriseTiles[sIdx];
    let message = "";
    let pointsChange = 0;
    let doFreeMove = false;
    let update: Partial<{ human: number; ai: number }> = {};
    // Get tile points for this move (already 0 if collected!)
    const tilePoints = boardPoints[tile.y]?.[tile.x] || 0;
    // Surprise event logic
    switch (s.type) {
      case "double":
        if (tilePoints > 0) {
          pointsChange = tilePoints;
          if (player === "human") { setHumanPoints(v => v + tilePoints); }
          else { setAIPoints(v => v + tilePoints); }
        }
        message = player === "human" ? t("surprise.double.self") : t("surprise.double.ai");
        break;
      case "lose":
        pointsChange = -Math.ceil((player === "human" ? humanPoints : aiPoints) * 0.2);
        if (player === "human") setHumanPoints(v => Math.max(0, v + pointsChange));
        else setAIPoints(v => Math.max(0, v + pointsChange));
        message = player === "human" ? t("surprise.lose.self") : t("surprise.lose.ai");
        break;
      case "free":
        doFreeMove = true;
        message = player === "human" ? t("surprise.free.self") : t("surprise.free.ai");
        break;
      case "steal":
        const take = 15 + Math.floor(Math.random() * 15);
        if (player === "human") {
          setAIPoints(aiv => Math.max(0, aiv - take));
          setHumanPoints(hv => hv + take);
        } else {
          setHumanPoints(hv => Math.max(0, hv - take));
          setAIPoints(aiv => aiv + take);
        }
        message = player === "human"
          ? t("surprise.steal.self", { n: take })
          : t("surprise.steal.ai", { n: take });
        break;
      case "extra":
        pointsChange = 15 + Math.floor(Math.random() * 15);
        if (player === "human") setHumanPoints(v => v + pointsChange);
        else setAIPoints(v => v + pointsChange);
        message = player === "human"
          ? t("surprise.extra.self", { n: pointsChange })
          : t("surprise.extra.ai", { n: pointsChange });
        break;
    }
    // Mark surprise as used
    setSurpriseTiles(prev => prev.map((s, i) => i === sIdx ? { ...s, used: true } : s));
    // Show a toast
    toast({
      title: t("surprise.title"),
      description: (
        <span className="flex items-center gap-2">
          <Gift className="inline-block text-pink-500" size={24} />
          {message}
        </span>
      ),
      duration: 3000, // updated to 3 seconds
    });
    return doFreeMove;
  }

  // Refactored: HUD Actions
  function handlePlaceDefenseButton() {
    setDefenseMode(true);
    toast({
      title: t("game.defense_mode_on"),
      description: t("game.defense_mode_on_desc"),
      duration: 2200,
    });
    const handler = (ev: MouseEvent) => {
      if (!(ev.target instanceof HTMLElement)) return;
      let tileDiv = ev.target.closest("button[data-tile-x]");
      if (!tileDiv) return;
      const x = parseInt(tileDiv.getAttribute("data-tile-x") || "-1");
      const y = parseInt(tileDiv.getAttribute("data-tile-y") || "-1");
      if (x < 0 || y < 0) return;
      handleDefenseClick({ x, y });
      document.removeEventListener("click", handler, true);
      setDefenseMode(false);
    };
    setTimeout(() => {
      document.addEventListener("click", handler, true);
    }, 100);
  }

  // Refactor: human move handler
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
    handleSurprise,
  });

  // AI move handler (after answering modal) - FIXED: Only zero out the correct tile's points
  const handleAIModalSubmit = () => {
    if (!aiModalState || winner) return;
    setSound("move");
    setPositions((p) => {
      const { x, y } = aiModalState.targetTile;
      setBoardPoints((prev) => {
        console.log("AI is collecting tile at:", x, y, "Current points:", prev[y][x]);
        const newBoard = prev.map((row) => [...row]); // Make sure we copy the board
        // Only collect the tile if it's not a corner and has points
        if (!((x === 0 && y === 0) || (x === BOARD_SIZE - 1 && y === BOARD_SIZE - 1))) {
          setAIPoints((cur) => cur + newBoard[y][x]);
          newBoard[y][x] = 0;
        }
        console.log("AI finished move; updated board (should only change [y][x]):", newBoard);
        return newBoard;
      });
      return { ...p, ai: { x, y } };
    });
    setTimeout(() => {
      handleSurprise(aiModalState.targetTile, "ai");
      setAIModalState(null);
      setTimeout(() => {
        if (!winner) {
          setTurn("human");
          setDisableInput(false);
          aiMovingRef.current = false;
        }
      }, 600);
    }, 100);
  };

  // Defense placement handler (unchanged)
  function canPlaceDefenseHere(tile: Tile): string | null {
    if (defensesUsed.human >= numDefenses) return t("game.defense_already_used") || "No more defenses";
    if ((tile.x === 0 && tile.y === 0) || (tile.x === BOARD_SIZE - 1 && tile.y === BOARD_SIZE - 1)) return t("game.defense_no_corner") || "Can't place on start/end";
    if ((positions.human.x === tile.x && positions.human.y === tile.y) || (positions.ai.x === tile.x && positions.ai.y === tile.y)) return t("game.defense_no_player") || "Can't place on pieces";
    if (defenseTiles.some(d => d.x === tile.x && d.y === tile.y)) return t("game.defense_already_here") || "Already a defense";
    if (surpriseTiles.some(s => s.x === tile.x && s.y === tile.y && !s.used)) return t("game.defense_no_surprise") || "Can't place on a surprise";
    return null;
  }
  function handleDefenseClick(tile: Tile) {
    const problem = canPlaceDefenseHere(tile);
    if (problem) {
      toast({
        title: t("game.defense_fail") || "Invalid defense placement",
        description: problem,
        duration: 2500,
      });
      return;
    }
    setDefenseTiles(prev => [...prev, { ...tile, owner: "human" }]);
    setDefensesUsed(d => ({ ...d, human: d.human + 1 }));
    setDefenseMode(false);
    toast({
      title: t("game.defense_placed") || "Defense Placed",
      description: t("game.defense_success") || "AI cannot move to this tile!",
      duration: 2000,
    });
  }

  // Reset game
  const handleRestart = () => {
    setPositions({
      human: { x: 0, y: 0 },
      ai: { x: boardSize - 1, y: boardSize - 1 }
    });
    setWinner(null);
    setTurn("human");
    setIsModalOpen(false);
    setMoveState(null);
    setAIModalState(null);
    setDisableInput(false);
    setHumanPoints(0);
    setAIPoints(0);
    setBoardPoints(generateRandomPoints(boardSize));
    setSurpriseTiles(getRandomSurpriseTiles(boardSize, numSurprises));
    setDefenseTiles([]);
    setDefensesUsed({human: 0, ai: 0});
    setDefenseMode(false);
  };

  // Debug: log turns to help trace
  useEffect(() => {
    console.log("[GAMEBOARD] Turn changed:", turn, "Winner:", winner);
  }, [turn, winner]);

  return (
    <div
      className="flex flex-col items-center"
      dir={language === "he" ? "rtl" : "ltr"}
    >
      <SoundManager trigger={sound} />
      <GameHeader
        onSettingsOpen={() => setSettingsOpen(true)}
        onRestart={handleRestart}
        difficulty={difficulty}
      />
      <GameBoardHud
        humanPoints={humanPoints}
        aiPoints={aiPoints}
        numDefenses={numDefenses}
        defensesUsed={defensesUsed}
        t={t}
        winner={winner}
        turn={turn}
        onPlaceDefense={handlePlaceDefenseButton}
        defenseMode={defenseMode}
      />
      <div className="relative my-3">
        <GameBoardGrid
          BOARD_SIZE={BOARD_SIZE}
          boardPoints={boardPoints}
          positions={positions}
          humanTarget={humanTarget}
          aiTarget={aiTarget}
          winner={winner}
          turn={turn}
          disableInput={disableInput}
          onTileClick={handleTileClick}
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
        />
        {winner && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg animate-fade-in z-10">
            <div className="text-3xl font-bold text-white mb-3 drop-shadow-2xl">
              {winner === "human" ? t("game.youWin") : t("game.aiWins")}
            </div>
            <div className="flex flex-col gap-1 text-lg text-white font-semibold mb-2">
              <div>
                {t("game.yourPoints")}: <span className="text-amber-200 font-bold">{humanPoints}</span>
              </div>
              <div>
                {t("game.aiPoints")}: <span className="text-amber-200 font-bold">{aiPoints}</span>
              </div>
            </div>
            <button
              onClick={handleRestart}
              className="bg-green-400 shadow px-5 py-2 rounded-lg text-xl font-bold text-white hover:bg-green-500 hover:scale-105 transition-all mt-2"
            >
              {t("game.playAgain")}
            </button>
          </div>
        )}
      </div>
      {/* Question modals */}
      <GameBoardModals
        moveState={moveState}
        isModalOpen={isModalOpen}
        aiModalState={aiModalState}
        winner={winner}
        questionTime={questionTime}
        onHumanSubmit={moveState?.resolve}
        onAISubmit={handleAIModalSubmit}
      />
      {/* Turn info */}
      {!winner && (
        <div
          className={`w-full mt-4 flex justify-between items-center`}
          dir={language === "he" ? "rtl" : "ltr"}
        >
          <div className="font-medium">
            {t("game.yourTarget")}
          </div>
          <div className="font-medium text-right">
            {turn === "human" ? (
              <span className="text-blue-700 animate-pulse">{t("game.yourTurn")}</span>
            ) : (
              <span className="text-red-700">{t("game.aiThinking")}</span>
            )}
          </div>
        </div>
      )}
      {/* Settings modal with new prop */}
      <GameSettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        soundEnabled={soundEnabled}
        onSoundChange={setSoundEnabled}
        boardSize={boardSize}
        onBoardSizeChange={v => setBoardSize(Math.max(5, Math.min(12, v || DEFAULT_BOARD_SIZE)))}
        questionTime={questionTime}
        onQuestionTimeChange={v => setQuestionTime(Math.max(6, Math.min(40, v || DEFAULT_QUESTION_TIME)))}
        surpriseCount={numSurprises}
        onSurpriseCountChange={setNumSurprises}
        numDefenses={numDefenses}
        onNumDefensesChange={setNumDefenses}
      />
    </div>
  );
};

export default GameBoard;

// NOTE: This file was refactored to split out GameBoardHud, GameBoardModals, and move handlers/hook logic for maintainability.
