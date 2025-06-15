
import React from "react";
import TranslateQuestionModal from "../TranslateQuestionModal";
import AITranslateQuestionModal from "../AITranslateQuestionModal";
import type { Question } from "@/lib/questions";
import type { PlayerType, Tile } from "./types";

type GameBoardModalsProps = {
  moveState: null | { tile: Tile; question: Question; resolve: (ok: boolean) => void };
  isModalOpen: boolean;
  aiModalState: null | { question: Question; targetTile: Tile };
  winner: PlayerType | null;
  questionTime: number;
  onHumanSubmit: (value: boolean) => void;
  onAISubmit: () => void;
};

const GameBoardModals: React.FC<GameBoardModalsProps> = ({
  moveState,
  isModalOpen,
  aiModalState,
  winner,
  questionTime,
  onHumanSubmit,
  onAISubmit,
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
        <TranslateQuestionModal
          isOpen={isModalOpen}
          question={moveState.question}
          timeLimit={questionTime}
          key={moveState.tile.x + "-" + moveState.tile.y + "-human"}
          onSubmit={onHumanSubmit}
        />
      )}
      {aiModalState && !winner && (
        <AITranslateQuestionModal
          isOpen={true}
          question={aiModalState.question}
          key={aiModalState.targetTile.x + "-" + aiModalState.targetTile.y + "-ai"}
          onSubmit={onAISubmit}
        />
      )}
    </>
  );
};

export default GameBoardModals;

