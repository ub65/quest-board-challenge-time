import { useEffect, useRef } from "react";
import { getRandomQuestion, getValidMoves, getAIMove, getAIDefenseTile } from "./utils";
import { PlayerType, Tile, DefenseTile, SurpriseTile } from "./types";
import { playSound } from "@/lib/audioManager";

// Enhanced AI question answering with more sophisticated difficulty scaling
function getAIAnswer(question: any, difficulty: "easy" | "medium" | "hard") {
  // Base mistake probabilities
  const baseMistakeProb = {
    "easy": 0.32,
    "medium": 0.16, 
    "hard": 0.06
  };

  // Additional factors that increase mistake probability
  let mistakeProb = baseMistakeProb[difficulty];
  
  // Slightly higher mistake rate for math questions (they're harder)
  if (question.type === "math") {
    mistakeProb *= 1.2;
  }
  
  // Sometimes make smart mistakes (choose second-best answer instead of random)
  const smartMistakeProb = difficulty === "hard" ? 0.7 : difficulty === "medium" ? 0.5 : 0.3;
  
  let aiAnswer = question.correct;
  
  if (question.answers && Array.isArray(question.answers) && Math.random() < mistakeProb) {
    const wrongAnswers = question.answers.map((_, i) => i).filter(i => i !== question.correct);
    
    if (Math.random() < smartMistakeProb && wrongAnswers.length > 1) {
      // Smart mistake: avoid obviously wrong answers when possible
      // For now, just pick the first wrong answer (could be enhanced further)
      aiAnswer = wrongAnswers[0];
    } else {
      // Random mistake
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

      // Enhanced defense placement logic with sound timing
      if (defensesUsed.ai < numDefenses) {
        const aiDefense = getAIDefenseTile({
          humanPos: positions.human,
          humanTarget,
          boardSize: BOARD_SIZE,
          defenseTiles,
          positions,
          surpriseTiles,
          difficulty, // Pass difficulty for smarter defense decisions
        });
        
        if (aiDefense) {
          setDefenseTiles(prev => [...prev, { ...aiDefense, owner: "ai" }]);
          setDefensesUsed(d => ({ ...d, ai: d.ai + 1 }));
          
          // Play defense sound with perfect timing
          console.log('[AUDIO] AI placed defense, playing defense sound');
          playSound("defense", true, 0.5, 100);
          
          toast({
            title: t("game.defense_ai_placed") || "AI placed a defense!",
            description: t("game.defense_ai_msg") || "AI blocked your path!",
            duration: 1400,
          });
          
          setTimeout(() => {
            aiMovingRef.current = false;
            setTurn("human");
            setDisableInput(false);
          }, 1000); // Increased delay to let defense sound finish
          return;
        }
      }

      // Enhanced move selection with strategic AI
      const allMoves = getValidMoves(positions.ai, BOARD_SIZE, defenseTiles, positions.human);
      const move = getAIMove(
        positions.ai,
        aiTarget,
        BOARD_SIZE,
        defenseTiles,
        positions.human, // Pass human position for strategic decisions
        humanTarget,     // Pass human target for interception strategies
        surpriseTiles,   // Pass surprise tiles for collection strategy
        difficulty       // Pass difficulty for behavior scaling
      );

      const question = getRandomQuestion(difficulty);
      const aiAnswer = getAIAnswer(question, difficulty);

      const aiQuestionWithChoice = { ...question, aiChoice: aiAnswer };

      setTimeout(() => {
        if (!winner) {
          setAIModalState({ question: aiQuestionWithChoice, targetTile: move });
        }
      }, 750); // Slightly increased delay for better timing
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