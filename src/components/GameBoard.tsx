import React, { useEffect, useState, useRef } from "react";
import TranslateQuestionModal from "./TranslateQuestionModal";
import SoundManager from "./SoundManager";
import { getRandomQuestionByDifficulty } from "@/lib/questions";
import GameSettingsModal from "./GameSettingsModal";
import AITranslateQuestionModal from "./AITranslateQuestionModal";
import GameHeader from "./GameHeader";
import GameScoreboard from "./GameScoreboard";
import GameBoardGrid from "./GameBoardGrid";
import { useLocalization } from "@/contexts/LocalizationContext";
import { Gift } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export type PlayerType = "human" | "ai";

const DEFAULT_BOARD_SIZE = 7;
const DEFAULT_QUESTION_TIME = 14;
const SURPRISE_TYPES = [
  "double", // double points
  "lose",   // lose points
  "free",   // free move
  "steal",  // take points from opponent
  "extra",  // get extra points
] as const;
type SurpriseType = typeof SURPRISE_TYPES[number];

type Tile = { x: number; y: number };
// Surprise => location + type + active
type SurpriseTile = Tile & { type: SurpriseType; used: boolean; };

function positionsEqual(a: Tile, b: Tile) {
  return a.x === b.x && a.y === b.y;
}

function getValidMoves(pos: Tile, BOARD_SIZE: number): Tile[] {
  const moves: Tile[] = [];
  if (pos.x > 0) moves.push({ x: pos.x - 1, y: pos.y });
  if (pos.x < BOARD_SIZE - 1) moves.push({ x: pos.x + 1, y: pos.y });
  if (pos.y > 0) moves.push({ x: pos.x, y: pos.y - 1 });
  if (pos.y < BOARD_SIZE - 1) moves.push({ x: pos.x, y: pos.y + 1 });
  return moves;
}

function getRandomQuestion(difficulty: "easy" | "medium" | "hard") {
  return getRandomQuestionByDifficulty(difficulty);
}

function getDistance(a: Tile, b: Tile) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// AI moves towards target
function getAIMove(pos: Tile, target: Tile, BOARD_SIZE: number) {
  const moves = getValidMoves(pos, BOARD_SIZE);
  let best = moves[0];
  let bestDist = getDistance(moves[0], target);
  for (const move of moves) {
    const d = getDistance(move, target);
    if (d < bestDist) {
      bestDist = d;
      best = move;
    }
  }
  return best;
}

// Generate 2D array of points
function generateRandomPoints(boardSize: number) {
  return Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => Math.floor(Math.random() * 100) + 1)
  );
}

// Pick N non-overlapping, non-start/end surprise tiles (use Math.random, no cryptosec needed)
function getRandomSurpriseTiles(boardSize: number, count: number): SurpriseTile[] {
  const chosen: SurpriseTile[] = [];
  for (let i = 0; i < count; i++) {
    let attempt = 0;
    while (attempt++ < 30) { // limit attempts
      const x = Math.floor(Math.random() * boardSize);
      const y = Math.floor(Math.random() * boardSize);
      // Exclude corners and start/end positions
      if (
        (x === 0 && y === 0) ||
        (x === boardSize - 1 && y === boardSize - 1) ||
        chosen.some((t) => t.x === x && t.y === y)
      ) continue;
      const t: SurpriseTile = {
        x, y,
        type: SURPRISE_TYPES[Math.floor(Math.random() * SURPRISE_TYPES.length)],
        used: false,
      };
      chosen.push(t);
      break;
    }
  }
  return chosen;
}

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

  // ---- NEW: Surprise count setting ----
  const [numSurprises, setNumSurprises] = useState<number>(4);

  // Points board state: NxN grid, each cell: points remaining (0 if collected)
  const [boardPoints, setBoardPoints] = useState<number[][]>(
    () => generateRandomPoints(DEFAULT_BOARD_SIZE)
  );
  // Points tracker (collected points)
  const [humanPoints, setHumanPoints] = useState(0);
  const [aiPoints, setAIPoints] = useState(0);

  // Surprise tile state
  const [surpriseTiles, setSurpriseTiles] = useState<SurpriseTile[]>(
    () => getRandomSurpriseTiles(DEFAULT_BOARD_SIZE, numSurprises)
  );

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

  // Adjusted for dynamic board size
  const BOARD_SIZE = boardSize;
  const aiTarget = { x: 0, y: 0 };
  const humanTarget = { x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 };

  // Reset game when board size OR numSurprises changes
  useEffect(() => {
    setPositions({
      human: { x: 0, y: 0 },
      ai: { x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 }
    });
    setWinner(null);
    setTurn("human");
    setHumanPoints(0);
    setAIPoints(0);
    setBoardPoints(generateRandomPoints(BOARD_SIZE));
    setSurpriseTiles(getRandomSurpriseTiles(BOARD_SIZE, numSurprises));
  }, [BOARD_SIZE, numSurprises]);

  useEffect(() => {
    if (winner) {
      setMoveState(null);
      setAIModalState(null);
      setIsModalOpen(false);
      setDisableInput(true);
      aiMovingRef.current = false;
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

  useEffect(() => {
    if (winner) {
      aiMovingRef.current = false;
      return;
    }
    if (turn === "ai" && !aiModalState && !aiMovingRef.current) {
      aiMovingRef.current = true;
      setDisableInput(true);
      // Prepare to ask a question before allowing AI to move
      const move = getValidMoves(positions.ai, BOARD_SIZE).filter(
        tile => tile.x >= 0 && tile.y >= 0 && tile.x < BOARD_SIZE && tile.y < BOARD_SIZE
      );
      const nextTile = move.length > 0 ? getAIMove(positions.ai, aiTarget, BOARD_SIZE) : positions.ai;
      const question = getRandomQuestion(difficulty);
      setTimeout(() => {
        if (!winner) setAIModalState({ question, targetTile: nextTile });
      }, 650);
    }
    if (turn === "human" || winner) {
      aiMovingRef.current = false;
    }
    // eslint-disable-next-line
  }, [turn, winner, positions.ai, aiModalState, BOARD_SIZE, difficulty]);

  // Handles surprise when a player lands on a surprise tile
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

  // HUMAN MOVE HANDLER
  const handleTileClick = async (tile: any) => {
    if (turn !== "human" || winner || disableInput) return;
    const validMoves = getValidMoves(positions.human, BOARD_SIZE).filter(
      t => t.x >= 0 && t.y >= 0 && t.x < BOARD_SIZE && t.y < BOARD_SIZE
    );
    if (!validMoves.some((t) => positionsEqual(t, tile))) return;
    const question = getRandomQuestion(difficulty);
    const ok = await new Promise<boolean>((resolve) => {
      setMoveState({ tile, question, resolve });
      setIsModalOpen(true);
    });
    setIsModalOpen(false);
    setMoveState(null);
    if (winner) return;

    if (ok) {
      setPositions((p) => {
        const { x, y } = tile;
        setBoardPoints((prev) => {
          if (prev[y][x] === 0) return prev;
          if ((x === 0 && y === 0) || (x === BOARD_SIZE - 1 && y === BOARD_SIZE - 1)) return prev;
          setHumanPoints((cur) => cur + prev[y][x]);
          const next = prev.map((row) => [...row]);
          next[y][x] = 0;
          return next;
        });
        return { ...p, human: { x, y } };
      });
      setSound("move");
      // Surprise tile handling (after position is updated)
      setTimeout(() => {
        const doFreeMove = handleSurprise(tile, "human");
        // NEW: After surprise, only allow another move for human if doFreeMove (i.e. "free" surprise)
        if (!doFreeMove) {
          setTurn("ai");
        }
        // If doFreeMove === true, don't change turn: human gets another move.
      }, 100);
    } else {
      setSound("wrong");
      setTurn("ai");
    }
  };

  // AI move handler (after answering modal)
  const handleAIModalSubmit = () => {
    if (!aiModalState || winner) return;
    setSound("move");
    setPositions((p) => {
      const { x, y } = aiModalState.targetTile;
      setBoardPoints((prev) => {
        if (prev[y][x] === 0) return prev;
        if ((x === 0 && y === 0) || (x === BOARD_SIZE - 1 && y === BOARD_SIZE - 1)) return prev;
        setAIPoints((cur) => cur + prev[y][x]);
        const next = prev.map((row) => [...row]);
        next[y][x] = 0;
        return next;
      });
      return { ...p, ai: { x, y } };
    });
    // Surprise tile logic: after AI moves
    setTimeout(() => {
      handleSurprise(aiModalState.targetTile, "ai");
      setAIModalState(null);
      setTimeout(() => {
        if (!winner) {
          // After the AI answers and any surprise, ALWAYS give turn back to human.
          setTurn("human");
          setDisableInput(false);
          aiMovingRef.current = false;
        }
      }, 600);
    }, 100);
  };

  // Reset game
  const handleRestart = () => {
    setPositions({
      human: { x: 0, y: 0 },
      ai: { x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 }
    });
    setWinner(null);
    setTurn("human");
    setIsModalOpen(false);
    setMoveState(null);
    setAIModalState(null);
    setDisableInput(false);
    setHumanPoints(0);
    setAIPoints(0);
    setBoardPoints(generateRandomPoints(BOARD_SIZE));
    setSurpriseTiles(getRandomSurpriseTiles(BOARD_SIZE, numSurprises));
    onRestart();
  };

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
      <GameScoreboard humanPoints={humanPoints} aiPoints={aiPoints} />
      <GameSettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        soundEnabled={soundEnabled}
        onSoundChange={setSoundEnabled}
        boardSize={boardSize}
        onBoardSizeChange={v => setBoardSize(Math.max(5, Math.min(12, v || DEFAULT_BOARD_SIZE)))}
        questionTime={questionTime}
        onQuestionTimeChange={v => setQuestionTime(Math.max(6, Math.min(40, v || DEFAULT_QUESTION_TIME)))}
        // NEW:
        surpriseCount={numSurprises}
        onSurpriseCountChange={setNumSurprises}
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
          getValidMoves={(pos) => getValidMoves(pos, BOARD_SIZE)}
          positionsEqual={positionsEqual}
          // Added:
          surpriseTiles={surpriseTiles}
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
      {moveState && !winner && (
        <TranslateQuestionModal
          isOpen={isModalOpen}
          question={moveState.question}
          timeLimit={questionTime}
          key={moveState.tile.x + "-" + moveState.tile.y + "-human"}
          onSubmit={moveState.resolve}
        />
      )}
      {aiModalState && !winner && (
        <AITranslateQuestionModal
          isOpen={true}
          question={aiModalState.question}
          key={aiModalState.targetTile.x + "-" + aiModalState.targetTile.y + "-ai"}
          onSubmit={handleAIModalSubmit}
        />
      )}
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
    </div>
  );
};

export default GameBoard;

// NOTE: This file is getting too long! After this change, you should consider splitting GameBoard into smaller files for maintainability.
