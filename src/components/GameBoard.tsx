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
import { Gift, Shield } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export type PlayerType = "human" | "ai";

const DEFAULT_BOARD_SIZE = 7;
const DEFAULT_QUESTION_TIME = 14;
const DEFAULT_DEFENSES = 1;
const SURPRISE_TYPES = [
  "double",
  "lose",
  "free",
  "steal",
  "extra",
] as const;
type SurpriseType = typeof SURPRISE_TYPES[number];

type Tile = { x: number; y: number };
type SurpriseTile = Tile & { type: SurpriseType; used: boolean };
type DefenseOwner = "human" | "ai";
type DefenseTile = Tile & { owner: DefenseOwner };

function positionsEqual(a: Tile, b: Tile) {
  return a.x === b.x && a.y === b.y;
}

function getValidMoves(pos: Tile, BOARD_SIZE: number, defenseTiles: DefenseTile[] = []) {
  const moves: Tile[] = [];
  // Can't move to defense tiles
  if (pos.x > 0 && !defenseTiles.some(t => t.x === pos.x - 1 && t.y === pos.y)) moves.push({ x: pos.x - 1, y: pos.y });
  if (pos.x < BOARD_SIZE - 1 && !defenseTiles.some(t => t.x === pos.x + 1 && t.y === pos.y)) moves.push({ x: pos.x + 1, y: pos.y });
  if (pos.y > 0 && !defenseTiles.some(t => t.x === pos.x && t.y === pos.y - 1)) moves.push({ x: pos.x, y: pos.y - 1 });
  if (pos.y < BOARD_SIZE - 1 && !defenseTiles.some(t => t.x === pos.x && t.y === pos.y + 1)) moves.push({ x: pos.x, y: pos.y + 1 });
  return moves;
}

function getRandomQuestion(difficulty: "easy" | "medium" | "hard") {
  return getRandomQuestionByDifficulty(difficulty);
}

function getDistance(a: Tile, b: Tile) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getAIMove(pos: Tile, target: Tile, BOARD_SIZE: number, defenseTiles: DefenseTile[]) {
  const moves = getValidMoves(pos, BOARD_SIZE, defenseTiles);
  let best = moves[0] || pos; // fallback to current pos
  let bestDist = getDistance(best, target);
  for (const move of moves) {
    const d = getDistance(move, target);
    if (d < bestDist) {
      bestDist = d;
      best = move;
    }
  }
  return best;
}

function generateRandomPoints(boardSize: number) {
  return Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => Math.floor(Math.random() * 100) + 1)
  );
}

function getRandomSurpriseTiles(boardSize: number, count: number): SurpriseTile[] {
  const chosen: SurpriseTile[] = [];
  for (let i = 0; i < count; i++) {
    let attempt = 0;
    while (attempt++ < 30) {
      const x = Math.floor(Math.random() * boardSize);
      const y = Math.floor(Math.random() * boardSize);
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

// New: Best tile for AI to block (closest to straight path, not occupied)
function getAIDefenseTile(options: {humanPos: Tile, humanTarget: Tile, boardSize: number, defenseTiles: DefenseTile[], positions: {human: Tile, ai: Tile}, surpriseTiles: SurpriseTile[]}): Tile | null {
  const { humanPos, humanTarget, boardSize, defenseTiles, positions, surpriseTiles } = options;
  // Build a list of shortest path tiles
  const dx = Math.sign(humanTarget.x - humanPos.x);
  const dy = Math.sign(humanTarget.y - humanPos.y);
  let candidates: Tile[] = [];
  let px = humanPos.x, py = humanPos.y;
  // Try main diagonal path first
  for (let i = 1; i < boardSize - 1; i++) {
    let tx = px + i * dx;
    let ty = py + i * dy;
    if (tx < 0 || ty < 0 || tx >= boardSize || ty >= boardSize) continue;
    candidates.push({ x: tx, y: ty });
  }
  // Add 2 neighbors from current human pos as fallback
  candidates.push(
    ...[
      {x: humanPos.x+1, y: humanPos.y},
      {x: humanPos.x-1, y: humanPos.y},
      {x: humanPos.x, y: humanPos.y+1},
      {x: humanPos.x, y: humanPos.y-1}
    ].filter(
      t=> t.x >=0 && t.x < boardSize && t.y >=0 && t.y < boardSize
    )
  );
  // filter: must not be occupied, must not be already blocked/defense, must not be surprise, not start/end, not on top of human/AI
  for (const c of candidates) {
    if (
      (c.x === 0 && c.y === 0) ||
      (c.x === boardSize - 1 && c.y === boardSize - 1) ||
      (positionsEqual(positions.human, c)) ||
      (positionsEqual(positions.ai, c)) ||
      defenseTiles.some(dt => dt.x === c.x && dt.y === c.y) ||
      surpriseTiles.some(st => st.x === c.x && st.y === c.y && !st.used)
    ) continue;
    return c;
  }
  // If no candidate, return null:
  return null;
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
      ai: { x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 }
    });
    setWinner(null);
    setTurn("human");
    setHumanPoints(0);
    setAIPoints(0);
    setBoardPoints(generateRandomPoints(BOARD_SIZE));
    setSurpriseTiles(getRandomSurpriseTiles(BOARD_SIZE, numSurprises));
    setDefenseTiles([]);
    setDefensesUsed({human: 0, ai: 0});
    setDefenseMode(false);
  }, [BOARD_SIZE, numSurprises, numDefenses]);

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
  useEffect(() => {
    console.log("AI useEffect called", {
      turn,
      winner,
      aiModalState,
      aiMoving: aiMovingRef.current,
      disableInput,
      positions: { ...positions },
      defensesUsed,
      defenseTiles,
      surpriseTiles,
    });

    if (winner) {
      aiMovingRef.current = false;
      return;
    }
    if (turn === "ai" && !aiModalState && !aiMovingRef.current) {
      aiMovingRef.current = true;
      setDisableInput(true);

      // AI: place defense if allowed
      if (defensesUsed.ai < numDefenses) {
        // AI will try to block player if possible before moving!
        const aiDefense = getAIDefenseTile({
          humanPos: positions.human,
          humanTarget,
          boardSize: BOARD_SIZE,
          defenseTiles,
          positions,
          surpriseTiles,
        });
        if (aiDefense) {
          setDefenseTiles(prev => [...prev, { ...aiDefense, owner: "ai" }]);
          setDefensesUsed(d => ({ ...d, ai: d.ai + 1 }));
          toast({
            title: t("game.defense_ai_placed") || "AI placed a defense!",
            description: t("game.defense_ai_msg") || "AI blocked your path!",
            duration: 1400,
          });
          setTimeout(() => {
            aiMovingRef.current = false;
            setTurn("human");
            setDisableInput(false);
          }, 900);
          return;
        }
      }
      // No more defenses or no good place: AI moves as normal
      const move = getValidMoves(positions.ai, BOARD_SIZE, defenseTiles).filter(
        tile => tile.x >= 0 && tile.y >= 0 && tile.x < BOARD_SIZE && tile.y < BOARD_SIZE
      );
      const nextTile = move.length > 0 ? getAIMove(positions.ai, aiTarget, BOARD_SIZE, defenseTiles) : positions.ai;
      const question = getRandomQuestion(difficulty);
      setTimeout(() => {
        if (!winner) {
          console.log("AI is ready to show AI modal", { nextTile, question });
          setAIModalState({ question, targetTile: nextTile });
        }
      }, 650);
    }
    if (turn === "human" || winner) {
      aiMovingRef.current = false;
    }
    // eslint-disable-next-line
  }, [turn, winner, positions.ai, aiModalState, BOARD_SIZE, difficulty, defenseTiles, defensesUsed.ai, numDefenses, positions, humanTarget, surpriseTiles, t]);

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

  // HUMAN MOVE HANDLER (updated)
  const handleTileClick = async (tile: any) => {
    if (winner || disableInput) return;

    // In defense mode, clicks should place a defense instead of moving
    if (defenseMode) {
      handleDefenseClick(tile);
      setDefenseMode(false); // immediately exit defense mode after placement
      return;
    }

    // NOT DEFENSE MODE: regular move
    if (turn !== "human") return;
    const validMoves = getValidMoves(positions.human, BOARD_SIZE, defenseTiles).filter(
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
      setTimeout(() => {
        const doFreeMove = handleSurprise(tile, "human");
        if (!doFreeMove) {
          console.log("Human completed move and hands turn to AI");
          setTurn("ai");
        }
      }, 100);
    } else {
      setSound("wrong");
      console.log("Human answered wrong; turn handed to AI");
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
    setDefenseTiles([]);
    setDefensesUsed({human: 0, ai: 0});
    setDefenseMode(false);
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
      {/* Scoreboard + Defense Button (moved) */}
      <div className="w-full flex flex-col items-center">
        <GameScoreboard humanPoints={humanPoints} aiPoints={aiPoints} />
        <div className="flex items-center gap-4 mt-1">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-primary" />
            <span className="text-xs text-blue-700 font-semibold">
              {t("game.defenses_left")}: {numDefenses - defensesUsed.human}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-red-700" />
            <span className="text-xs text-red-700 font-semibold">
              {t("game.ai_defenses_left")}: {numDefenses - defensesUsed.ai}
            </span>
          </div>
          {/* Place Defense Button */}
          {!winner && turn === "human" && (numDefenses - defensesUsed.human > 0) && (
            <button
              onClick={() => {
                setDefenseMode(true);
                toast({
                  title: t("game.defense_mode_on"),
                  description: t("game.defense_mode_on_desc"),
                  duration: 2200,
                });
                // Next tile click will be for defense, add a handler…
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
              }}
              className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-all animate-pulse"
            >
              <Shield size={20} className="inline-block mr-1" />
              {t("game.defense_place_btn")}
            </button>
          )}
        </div>
        <div className="w-full flex justify-center">
          {defenseMode && (
            <span className="text-sm text-blue-600 mt-2 animate-pulse">
              {t("game.defense_mode_select")}
            </span>
          )}
        </div>
      </div>
      <div className="relative my-3">
        <GameBoardGrid
          BOARD_SIZE={BOARD_SIZE}
          boardPoints={boardPoints}
          positions={positions}
          humanTarget={humanTarget}
          aiTarget={aiTarget}
          winner={winner}
          turn={turn}
          // IMPORTANT: We want to disable input for modal/win, but not for defense mode.
          disableInput={disableInput}
          onTileClick={handleTileClick}
          getValidMoves={(pos) => getValidMoves(pos, BOARD_SIZE, defenseTiles)}
          positionsEqual={positionsEqual}
          surpriseTiles={surpriseTiles}
          defenseTiles={defenseTiles}
          aiPendingTarget={aiModalState ? aiModalState.targetTile : null} // Pass AI's preview target
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
      {/* Turn/who info */}
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

// NOTE: This file is getting too long! After this change, you should consider splitting GameBoard into smaller files for maintainability.
