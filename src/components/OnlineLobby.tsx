
import React from "react";

/**
 * Placeholder lobby for online multiplayer.
 * Can be expanded to room/party creation, matchmaking, and Supabase logic.
 */
const OnlineLobby: React.FC<{ onBack?: () => void; t: (k: string, params?: any) => string }> = ({
  onBack,
  t,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-sky-100 via-blue-200 to-violet-100 px-4">
      <div className="w-full max-w-sm mx-auto bg-white/95 shadow-xl rounded-3xl p-7 flex flex-col gap-7 mt-10">
        <h1 className="text-2xl font-extrabold text-center text-primary">🕹️ {t("online.lobbyTitle") || "Online Lobby"}</h1>
        <p className="text-center text-gray-500">{t("online.lobbyComingSoon") || "Online multiplayer lobby coming soon!"}</p>
        <button onClick={onBack} className="w-full rounded-lg py-3 text-lg font-semibold transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow">
          {t("general.back") || "Back"}
        </button>
      </div>
    </div>
  );
};

export default OnlineLobby;
