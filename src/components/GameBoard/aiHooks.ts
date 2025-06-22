import { useEffect, useRef } from "react";
import { getRandomQuestion, getValidMoves, getAIMove, getAIDefenseTile } from "./utils";
import { PlayerType } from "./types";

function getAIAnswer(question: any, difficulty: "easy" | "medium" | "hard") {
  const baseMistakeProb = {
    "easy": 0.32,
    "medium": 0.16, 
    "hard": 0.06
  };

  let mistakeProb = baseMistakeProb[difficulty];
  
  if (question.type === "math") {
    mistakeProb *= 1.2;
  }
  
  const smartMistakeProb = difficulty === "hard" ? 0.7 : difficulty === "medium" ? 0.5 : 0.3;
  
  let aiAnswer = question.correct;
  
  if (question.answers && Array.isArray(question.answers) && Math.random() < mistakeProb) {
    const wrongAnswers = question.answers.map((_, i) => i).filter(i => i !== question.correct);
    
    if (Math.random() < smartMistakeProb && wrongAnswers.length > 1) {
      aiAnswer = wrongAnswers[0];
    } else {
      aiAnswer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
    }
    
    console.log(`[AI MISTAKE] Chose answer ${aiAnswer} instead of correct answer ${question.correct} (difficulty: ${difficulty})`);
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

    if (!humanHasMoved) {
      aiMovingRef.current = false;
      return;
    }

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
          difficulty,
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

      const allMoves = getValidMoves(positions.ai, BOARD_SIZE, defenseTiles, positions.human);
      const move = getAIMove(
        positions.ai,
        aiTarget,
        BOARD_SIZE,
        defenseTiles,
        positions.human,
        humanTarget,
        surpriseTiles,
        difficulty
      );

      const question = getRandomQuestion(difficulty);
      const aiAnswer = getAIAnswer(question, difficulty);

      const aiQuestionWithChoice = { ...question, aiChoice: aiAnswer };

      setTimeout(() => {
        if (!winner) {
          setAIModalState({ question: aiQuestionWithChoice, targetTile: move });
        }
      }, 650);
    }
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