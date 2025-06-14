
import React, { useEffect, useState, useRef } from "react";
import TranslateQuestionModal from "./TranslateQuestionModal";
import SoundManager from "./SoundManager";
import { questionsByDifficulty } from "@/lib/questions";
import GameSettingsModal from "./GameSettingsModal";
import AITranslateQuestionModal from "./AITranslateQuestionModal";
import GameHeader from "./GameHeader";
import GameScoreboard from "./GameScoreboard";
import GameBoardGrid from "./GameBoardGrid";
import { useLocalization } from "@/contexts/LocalizationContext";

export type PlayerType = "human" | "ai";

const DEFAULT_BOARD_SIZE = 7;
const DEFAULT_QUESTION_TIME = 14;

type Tile = { x: number; y: number };

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
  const arr = questionsByDifficulty[difficulty];
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function getDistance(a: Tile, b: Tile) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Simple AI: move closer to target, always answers correctly.
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

// Generate a 2D array of random ints [1,100] for points
function generateRandomPoints(boardSize: number) {
  return Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => Math.floor(Math.random() * 100) + 1)
  );
}

const GameBoard = ({
  difficulty,
  onRestart
}: {
  difficulty: "easy" | "medium" | "hard";
  onRestart: () => void;
}) => {
  const { t } = useLocalization();

  // Settings state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [questionTime, setQuestionTime] = useState<number>(DEFAULT_QUESTION_TIME);
  const [boardSize, setBoardSize] = useState<number>(DEFAULT_BOARD_SIZE);

  // Points board state: NxN grid, each cell: points remaining (0 if collected)
  const [boardPoints, setBoardPoints] = useState<number[][]>(
    () => generateRandomPoints(DEFAULT_BOARD_SIZE)
  );
  // Points tracker (collected points)
  const [humanPoints, setHumanPoints] = useState(0);
  const [aiPoints, setAIPoints] = useState(0);

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

  // When board size changes, reset positions, winner, boardPoints, points
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
  }, [BOARD_SIZE]);

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
    setAIModalState(null);
    setTimeout(() => {
      if (!winner) {
        setTurn("human");
        setDisableInput(false);
        aiMovingRef.current = false;
      }
    }, 600);
  };

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
      setTurn("ai");
    } else {
      setSound("wrong");
      setTurn("ai");
    }
  };

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
    onRestart();
  };

  return (
    <div className="flex flex-col items-center">
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
        />
        {winner && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg animate-fade-in z-10">
            <div className="text-3xl font-bold text-white mb-3 drop-shadow-2xl">
              {winner === "human" ? t('game.youWin') : t('game.aiWins')}
            </div>
            <div className="flex flex-col gap-1 text-lg text-white font-semibold mb-2">
              <div>
                {t('game.yourPoints')}: <span className="text-amber-200 font-bold">{humanPoints}</span>
              </div>
              <div>
                {t('game.aiPoints')}: <span className="text-amber-200 font-bold">{aiPoints}</span>
              </div>
            </div>
            <button
              onClick={handleRestart}
              className="bg-green-400 shadow px-5 py-2 rounded-lg text-xl font-bold text-white hover:bg-green-500 hover:scale-105 transition-all mt-2"
            >
              {t('game.playAgain')}
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
        <div className="w-full mt-4 flex justify-between items-center">
          <div className="font-medium">
            {t('game.yourTarget')}
          </div>
          <div className={`font-medium text-right`}>
            {turn === "human" ? (
              <span className="text-blue-700 animate-pulse">{t('game.yourTurn')}</span>
            ) : (
              <span className="text-red-700">{t('game.aiThinking')}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
