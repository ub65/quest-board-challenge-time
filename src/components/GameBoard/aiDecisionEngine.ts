
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
    
    // Configure AI behavior based on difficulty
    switch (difficulty) {
      case "easy":
        this.randomnessFactor = 0.4;
        this.mistakeProbability = 0.25;
        break;
      case "medium":
        this.randomnessFactor = 0.25;
        this.mistakeProbability = 0.12;
        break;
      case "hard":
        this.randomnessFactor = 0.15;
        this.mistakeProbability = 0.05;
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

    // Sometimes make a random move (simulating mistakes)
    if (Math.random() < this.mistakeProbability) {
      const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
      return {
        move: randomMove,
        confidence: 0.2,
        reasoning: ["Made a random move (AI mistake)"]
      };
    }

    // Evaluate each move using all strategies
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
        const score = strategy.evaluate(evalOptions);
        const weightedScore = score * strategy.weight;
        totalScore += weightedScore;
        
        if (score > 0) {
          strategyScores.push(`${strategy.name}: +${score.toFixed(1)}`);
        } else if (score < 0) {
          strategyScores.push(`${strategy.name}: ${score.toFixed(1)}`);
        }
      }

      // Add some randomness to prevent completely predictable behavior
      const randomBonus = (Math.random() - 0.5) * this.randomnessFactor * 10;
      totalScore += randomBonus;

      return {
        move,
        score: totalScore,
        reasoning: strategyScores,
        rawScore: totalScore - randomBonus
      };
    });

    // Sort by score (highest first)
    moveEvaluations.sort((a, b) => b.score - a.score);
    
    const bestMove = moveEvaluations[0];
    const worstMove = moveEvaluations[moveEvaluations.length - 1];
    
    // Calculate confidence based on score difference
    const scoreDifference = bestMove.score - worstMove.score;
    const confidence = Math.min(1, Math.max(0.1, scoreDifference / 20));

    // Emergency situation detection
    const humanDistanceToGoal = getDistance(humanPos, humanTarget);
    const aiDistanceToGoal = getDistance(currentPos, target);
    
    let emergencyReasoning: string[] = [];
    if (humanDistanceToGoal <= 2) {
      emergencyReasoning.push("EMERGENCY: Human very close to winning!");
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

    // Critical situation: human is very close to winning
    if (humanDistanceToGoal <= 2) {
      urgency = 1.0;
      reasoning = "CRITICAL: Human about to win, must block!";
    }
    // High urgency: human is ahead
    else if (humanDistanceToGoal < aiDistanceToGoal) {
      urgency = 0.7;
      reasoning = "HIGH: Human is ahead in the race";
    }
    // Medium urgency: human making good progress
    else if (humanDistanceToGoal <= 4) {
      urgency = 0.4;
      reasoning = "MEDIUM: Human making progress toward goal";
    }
    // Low urgency: early game strategic placement
    else {
      urgency = 0.2;
      reasoning = "LOW: Strategic early defense placement";
    }

    // Adjust based on difficulty
    const difficultyMultiplier = this.difficulty === "hard" ? 1.2 : this.difficulty === "medium" ? 1.0 : 0.8;
    urgency *= difficultyMultiplier;

    // Don't place defense too early on easy mode
    if (this.difficulty === "easy" && humanDistanceToGoal > 6) {
      urgency *= 0.3;
    }

    const shouldPlace = urgency > 0.5 || (urgency > 0.3 && Math.random() < urgency);

    return { shouldPlace, urgency, reasoning };
  }
}
