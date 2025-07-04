
import { Tile, DefenseTile, SurpriseTile } from "./types";
import { ALL_STRATEGIES, AIEvaluationOptions } from "./aiStrategies";
import { getDistance } from "./utils";

export interface AIDecisionResult {
  move: Tile;
  confidence: number;
  reasoning: string[];
}

export class AIDecisionEngine {
  private difficulty: "easy" | "medium" | "hard";
  private randomnessFactor: number;
  private mistakeProbability: number;

  constructor(difficulty: "easy" | "medium" | "hard") {
    this.difficulty = difficulty;
    
    switch (difficulty) {
      case "easy":
        this.randomnessFactor = 0.3;
        this.mistakeProbability = 0.2;
        break;
      case "medium":
        this.randomnessFactor = 0.2;
        this.mistakeProbability = 0.1;
        break;
      case "hard":
        this.randomnessFactor = 0.1;
        this.mistakeProbability = 0.03;
        break;
    }
  }

  public chooseBestMove(options: {
    availableMoves: Tile[];
    currentPos: Tile;
    target: Tile;
    humanPos: Tile;
    humanTarget: Tile;
    defenseTiles: DefenseTile[];
    surpriseTiles: SurpriseTile[];
    boardSize: number;
  }): AIDecisionResult {
    const { availableMoves, currentPos, target, humanPos, humanTarget, defenseTiles, surpriseTiles, boardSize } = options;
    
    if (availableMoves.length === 0) {
      return {
        move: currentPos,
        confidence: 0,
        reasoning: ["No valid moves available"]
      };
    }

    const humanDistanceToGoal = getDistance(humanPos, humanTarget);
    const aiDistanceToGoal = getDistance(currentPos, target);
    const emergencyMode = humanDistanceToGoal <= aiDistanceToGoal && humanDistanceToGoal <= 5;

    const adjustedMistakeProbability = emergencyMode ? this.mistakeProbability * 0.5 : this.mistakeProbability;

    if (Math.random() < adjustedMistakeProbability) {
      const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
      return {
        move: randomMove,
        confidence: 0.2,
        reasoning: ["Made a random move (AI mistake)"]
      };
    }

    const moveEvaluations = availableMoves.map(move => {
      const evalOptions: AIEvaluationOptions = {
        move,
        currentPos,
        target,
        humanPos,
        humanTarget,
        defenseTiles,
        surpriseTiles,
        boardSize,
        difficulty: this.difficulty
      };

      let totalScore = 0;
      const strategyScores: string[] = [];

      for (const strategy of ALL_STRATEGIES) {
        let score = strategy.evaluate(evalOptions);
        
        if (emergencyMode && strategy.name === "goal-seeking") {
          score *= 1.5;
          strategyScores.push(`${strategy.name}: +${score.toFixed(1)} (EMERGENCY BOOST)`);
        } else {
          if (score > 0) {
            strategyScores.push(`${strategy.name}: +${score.toFixed(1)}`);
          } else if (score < 0) {
            strategyScores.push(`${strategy.name}: ${score.toFixed(1)}`);
          }
        }
        
        const weightedScore = score * strategy.weight;
        totalScore += weightedScore;
      }

      const adjustedRandomness = emergencyMode ? this.randomnessFactor * 0.5 : this.randomnessFactor;
      const randomBonus = (Math.random() - 0.5) * adjustedRandomness * 10;
      totalScore += randomBonus;

      return {
        move,
        score: totalScore,
        reasoning: strategyScores,
        rawScore: totalScore - randomBonus
      };
    });

    moveEvaluations.sort((a, b) => b.score - a.score);
    
    const bestMove = moveEvaluations[0];
    const worstMove = moveEvaluations[moveEvaluations.length - 1];
    
    const scoreDifference = bestMove.score - worstMove.score;
    const confidence = Math.min(1, Math.max(0.1, scoreDifference / 20));

    let emergencyReasoning: string[] = [];
    if (emergencyMode) {
      emergencyReasoning.push("🚨 EMERGENCY MODE: Prioritizing goal!");
    }
    if (humanDistanceToGoal <= 2) {
      emergencyReasoning.push("CRITICAL: Human very close to winning!");
    } else if (humanDistanceToGoal <= aiDistanceToGoal && humanDistanceToGoal <= 4) {
      emergencyReasoning.push("WARNING: Human ahead in race to goal");
    }

    return {
      move: bestMove.move,
      confidence,
      reasoning: [...emergencyReasoning, ...bestMove.reasoning]
    };
  }

  public shouldPlaceDefense(options: {
    humanPos: Tile;
    humanTarget: Tile;
    aiPos: Tile;
    aiTarget: Tile;
    availableDefenses: number;
    boardSize: number;
  }): { shouldPlace: boolean; urgency: number; reasoning: string } {
    const { humanPos, humanTarget, aiPos, aiTarget, availableDefenses } = options;
    
    if (availableDefenses <= 0) {
      return { shouldPlace: false, urgency: 0, reasoning: "No defenses available" };
    }

    const humanDistanceToGoal = getDistance(humanPos, humanTarget);
    const aiDistanceToGoal = getDistance(aiPos, aiTarget);
    
    let urgency = 0;
    let reasoning = "";

    if (humanDistanceToGoal <= 2) {
      urgency = 1.0;
      reasoning = "CRITICAL: Human about to win, must block!";
    }
    else if (humanDistanceToGoal < aiDistanceToGoal - 2) {
      urgency = 0.6;
      reasoning = "HIGH: Human significantly ahead";
    }
    else if (humanDistanceToGoal <= 3 && aiDistanceToGoal > 6) {
      urgency = 0.3;
      reasoning = "MEDIUM: Human close, but we're far from goal";
    }
    else {
      urgency = 0.1;
      reasoning = "LOW: Focus on reaching our goal instead";
    }

    const difficultyMultiplier = this.difficulty === "hard" ? 1.0 : this.difficulty === "medium" ? 0.8 : 0.6;
    urgency *= difficultyMultiplier;

    const shouldPlace = urgency > 0.6 || (urgency > 0.4 && Math.random() < urgency);

    return { shouldPlace, urgency, reasoning };
  }
}
