import React from "react";
import TranslateQuestionModal from "../TranslateQuestionModal";
import AITranslateQuestionModal from "../AITranslateQuestionModal";
import MathQuestionModal from "../MathQuestionModal";
import AIMathQuestionModal from "../AIMathQuestionModal";
import type { Question } from "@/lib/questions";
import type { PlayerType, Tile } from "./types";

type GameBoardModalsProps = {
  moveState: null | { tile: Tile; question: any; resolve: (ok: boolean) => void };
  isModalOpen: boolean;
  aiModalState: null | { question: any; targetTile: Tile };
  winner: PlayerType | null;
  questionTime: number;
  onHumanSubmit: (value: boolean) => void;
  onAISubmit: () => void;
  questionType?: "translate" | "math";
  soundEnabled?: boolean;
  volume?: number;
};

const GameBoardModals: React.FC<GameBoardModalsProps> = ({
  moveState,
  isModalOpen,
  aiModalState,
  winner,
  questionTime,
  onHumanSubmit,
  onAISubmit,
  questionType = "translate",
  soundEnabled = true,
  volume = 0.5,
}) => {
  if (moveState) {
    console.log("[MODAL/HUMAN] Showing modal with question:", moveState.question);
  }
  if (aiModalState) {
    console.log("[MODAL/AI] Showing modal with question:", aiModalState.question);
  }

  return (
    <>
      {moveState && !winner && (
        questionType === "math" ? (
          <MathQuestionModal
            isOpen={isModalOpen}
            question={moveState.question}
            timeLimit={questionTime}
            key={moveState.tile.x + "-" + moveState.tile.y + "-human-math"}
            onSubmit={onHumanSubmit}
            soundEnabled={soundEnabled}
            volume={volume}
          />
        ) : (
          <TranslateQuestionModal
            isOpen={isModalOpen}
            question={moveState.question}
            timeLimit={questionTime}
            key={moveState.tile.x + "-" + moveState.tile.y + "-human"}
            onSubmit={onHumanSubmit}
            soundEnabled={soundEnabled}
            volume={volume}
          />
        )
      )}
      {aiModalState && !winner && (
        questionType === "math" ? (
          <AIMathQuestionModal
            isOpen={true}
            question={aiModalState.question}
            key={aiModalState.targetTile.x + "-" + aiModalState.targetTile.y + "-ai-math"}
            onSubmit={onAISubmit}
            soundEnabled={soundEnabled}
            volume={volume}
          />
        ) : (
          <AITranslateQuestionModal
            isOpen={true}
            question={aiModalState.question}
            key={aiModalState.targetTile.x + "-" + aiModalState.targetTile.y + "-ai"}
            onSubmit={onAISubmit}
            soundEnabled={soundEnabled}
            volume={volume}
          />
        )
      )}
    </>
  );
};

export default GameBoardModals;