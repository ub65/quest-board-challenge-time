import { useEffect, useRef } from "react";
import { getRandomQuestion, getValidMoves, getAIMove, getAIDefenseTile } from "./utils";
import { PlayerType, Tile, DefenseTile, SurpriseTile } from "./types";

// פונקציה חדשה - AI עם שיקולים משולבים
function chooseBetterAIMove(
  moves: Tile[],
  current: Tile,
  aiTarget: Tile,
  difficulty: "easy" | "medium" | "hard",
  humanPos: Tile,
  humanTarget: Tile,
  defenseTiles: DefenseTile[],
  surpriseTiles: SurpriseTile[],
  aiPoints: number[][],
) {
  if (moves.length === 0) return current;
  // פרמטרים של אקראיות לפי קושי
  const mistakeProb = difficulty === "easy" ? 0.28 : difficulty === "medium" ? 0.13 : 0.05;
  const randomExtra = difficulty === "easy" ? 0.25 : difficulty === "medium" ? 0.15 : 0.10;

  // כל מהלך יקבל ציון לפי כמה פרמטרים
  let scored = moves.map(move => {
    // התקדמות לכיוון המטרה
    let towardGoal = - (Math.abs(move.x - aiTarget.x) + Math.abs(move.y - aiTarget.y));
    // להטריד את השחקן - כמה קרוב לשחקן
    let towardHuman = - (Math.abs(move.x - humanPos.x) + Math.abs(move.y - humanPos.y));
    // להרחיק מהמגן/חסימה
    let nearDefense = defenseTiles.some(d => Math.abs(d.x - move.x) + Math.abs(d.y - move.y) <= 1) ? -4 : 0;
    // לנסות להגיע לסופתעה
    let onSurprise = surpriseTiles.find(s => s.x === move.x && s.y === move.y && !s.used) ? 4 : 0;
    // ניסיון ללכת לכיוון מטרה השחקן, שכנים
    let towardPlayerTarget =
      - (Math.abs(move.x - humanTarget.x) + Math.abs(move.y - humanTarget.y));

    // ניקוד משוקלל, משקל שונה לכל גישה
    let score =
      3 * towardGoal +
      2 * towardHuman +
      nearDefense +
      4 * onSurprise +
      towardPlayerTarget +
      Math.random() * randomExtra * 10; // קצת רנדומלי

    return { move, score };
  });

  // לפעמים בוחר מהלך חלש (טעות)
  if (Math.random() < mistakeProb) {
    const randMove = scored[Math.floor(Math.random() * scored.length)];
    return randMove.move;
  }

  // אחרת בוחר את המהלך עם הניקוד הכי גבוה
  scored.sort((a, b) => b.score - a.score);
  return scored[0].move;
}

// לא נוגעים בלוגיקת תשובה/שאלה -------------------
function maybeWrongAnswer(question: any, difficulty: "easy" | "medium" | "hard") {
  const mistakeProb = difficulty === "easy" ? 0.35 : difficulty === "medium" ? 0.18 : 0.05;
  let aiAnswer = question.correct;
  if (question.answers && Array.isArray(question.answers) && Math.random() < mistakeProb) {
    const wrongs = question.answers.map((_, i) => i).filter(i => i !== question.correct);
    aiAnswer = wrongs[Math.floor(Math.random() * wrongs.length)];
  }
  return aiAnswer;
}

export function useAITurn({
  turn, winner, aiModalState, disableInput, positions, defensesUsed, defenseTiles, surpriseTiles, numDefenses, difficulty, BOARD_SIZE,
  aiTarget, humanTarget, t, setDisableInput, setDefenseTiles, setDefensesUsed, toast, setTurn, setAIModalState, aiMovingRef,
  humanHasMoved,
}: any) {
  useEffect(() => {
    console.log("[AI TURN HOOK] running", {turn, winner, aiModalState, aiMoving: aiMovingRef.current, disableInput, humanHasMoved});

    // Prevent any AI move until human has moved
    if (!humanHasMoved) {
      aiMovingRef.current = false;
      return;
    }

    // Always reset moving ref when human's turn or game over
    if (winner || turn === "human") {
      if (aiMovingRef.current) console.log("[AI TURN HOOK] Resetting aiMovingRef.current", {winner, turn});
      aiMovingRef.current = false;
      return;
    }

    if (turn === "ai" && !aiModalState && !aiMovingRef.current) {
      console.log("[AI TURN HOOK] AI is starting move!");
      aiMovingRef.current = true;
      setDisableInput(true);

      if (defensesUsed.ai < numDefenses) {
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
          setDefensesUsed(d) => ({ ...d, ai: d.ai + 1 });
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

      // כאן יבחר את המהלך המשתפר
      const allMoves = getValidMoves(positions.ai, BOARD_SIZE, defenseTiles, positions.human);
      // new: נוסיף matrix של ניקוד הלוח (כלי), לא חובה, כרגע לפי board size בלבד
      const fakePoints =
        Array.isArray(positions.ai) ? positions.ai : Array.from({length: BOARD_SIZE}).map(()=>Array(BOARD_SIZE).fill(0));
      const move = chooseBetterAIMove(
        allMoves,
        positions.ai,
        aiTarget,
        difficulty,
        positions.human,
        humanTarget,
        defenseTiles,
        surpriseTiles,
        fakePoints,
      );

      const question = getRandomQuestion(difficulty);
      const aiAnswer = maybeWrongAnswer(question, difficulty);

      const aiQuestionWithChoice = { ...question, aiChoice: aiAnswer };

      setTimeout(() => {
        if (!winner) {
          setAIModalState({ question: aiQuestionWithChoice, targetTile: move });
        }
      }, 650);
    }
    // eslint-disable-next-line
  }, [
    turn, winner, aiModalState, disableInput, positions, defensesUsed.ai,
    BOARD_SIZE, numDefenses, t, setDisableInput, setDefenseTiles, setDefensesUsed,
    toast, setTurn, setAIModalState, aiMovingRef, aiTarget, humanTarget, defenseTiles, surpriseTiles,
    difficulty, humanHasMoved
  ]);

  useEffect(() => {
    return () => {
      aiMovingRef.current = false;
    };
  }, [aiMovingRef]);
}
