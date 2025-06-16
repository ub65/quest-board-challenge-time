
import React from "react";

type GameBoardPreGameOverlayProps = {
  gameStarted: boolean;
  startingPlayer: "human" | "ai" | null;
  t: (key: string, params?: any) => string;
  onStartGame: () => void;
};

const GameBoardPreGameOverlay: React.FC<GameBoardPreGameOverlayProps> = ({
  gameStarted,
  startingPlayer,
  t,
  onStartGame,
}) => {
  if (gameStarted || !startingPlayer) return null;

  const announcementKey =
    startingPlayer === "human"
      ? "game.startingPlayer.human"
      : "game.startingPlayer.ai";
  const announcementText = t(announcementKey);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-5 min-w-[320px] max-w-xs mx-auto">
        <h2 className="text-xl font-bold mb-0">{t("game.title")}</h2>
        <div className="text-base text-center text-gray-700 mb-3">
          {announcementText}
        </div>
        <button
          className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold text-lg shadow hover:bg-primary/90 transition"
          onClick={onStartGame}
          autoFocus
          data-testid="start-game-btn"
        >
          {t("welcome.startGame") || "Start Game"}
        </button>
      </div>
    </div>
  );
};

export default GameBoardPreGameOverlay;
