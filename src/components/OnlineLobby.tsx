
import React, { useState } from "react";
import { Button } from "@/components/ui/button"; // Using shadcn/ui button for improved UI
import { toast } from "@/components/ui/use-toast";

/**
 * Online lobby supporting game creation/joining flows (Supabase real-time to be added).
 */
const OnlineLobby: React.FC<{
  onBack?: () => void;
  t: (k: string, params?: any) => string;
  onGameStart: (gameCode: string, role: "host" | "guest") => void;
}> = ({
  onBack,
  t,
  onGameStart,
}) => {
  const [step, setStep] = useState<"menu" | "create" | "join" | "wait" | "error">("menu");
  const [gameCode, setGameCode] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Handler: Start game creation
  const handleCreateGame = () => {
    setIsCreating(true);
    setTimeout(() => {
      const newCode = generateCode();
      setGameCode(newCode);
      setIsCreating(false);
      toast({
        title: t("online.lobbyGameCreated") || "Game Created",
        description: `${t("online.lobbyShareCode") || "Share this code:"} ${newCode}`,
      });
      // Call parent to start the game in "host" mode
      onGameStart(newCode, "host");
    }, 700);
  };

  // Handler: Show join screen
  const handleJoinGame = () => {
    setStep("join");
    setGameCode("");
  };

  // Handler: Submit join code (to be implemented)
  const handleSubmitJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameCode.trim() || gameCode.length < 4) {
      toast({
        title: t("online.lobbyInvalidCode") || "Invalid code",
        description: t("online.lobbyEnterValidCode") || "Please enter a valid game code.",
        variant: "destructive",
      });
      return;
    }
    setIsJoining(true);
    setTimeout(() => {
      setIsJoining(false);
      toast({
        title: t("online.lobbyJoined") || "Joined game!",
        description: t("online.lobbyJoinedDesc") || "Waiting for the host...",
      });
      // Call parent to start the game in "guest" mode
      onGameStart(gameCode.toUpperCase(), "guest");
    }, 800);
  };

  // Handler: Reset to menu
  const handleBackToMenu = () => {
    setStep("menu");
    setGameCode("");
    setIsCreating(false);
    setIsJoining(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-sky-100 via-blue-200 to-violet-100 px-4">
      <div className="w-full max-w-sm mx-auto bg-white/95 shadow-xl rounded-3xl p-7 flex flex-col gap-8 mt-10 animate-fade-in">
        <h1 className="text-2xl font-extrabold text-center text-primary">🕹️ {t("online.lobbyTitle") || "Online Lobby"}</h1>
        {step === "menu" && (
          <>
            <p className="text-center text-gray-500">{t("online.lobbyDesc") || "Invite a friend to play online, or join their game with a code."}</p>
            <div className="flex flex-col gap-4">
              <Button className="w-full" onClick={handleCreateGame} disabled={isCreating}>
                {isCreating ? t("online.lobbyCreating") || "Creating..." : t("online.lobbyCreate") || "Create Game"}
              </Button>
              <Button className="w-full" variant="secondary" onClick={handleJoinGame}>
                {t("online.lobbyJoin") || "Join Game"}
              </Button>
            </div>
            <Button className="w-full mt-3" variant="ghost" onClick={onBack}>
              {t("general.back") || "Back"}
            </Button>
          </>
        )}
        {step === "create" && (
          <>
            <p>{t("online.lobbyCreating") || "Creating game..."}</p>
          </>
        )}
        {step === "join" && (
          <form onSubmit={handleSubmitJoin} className="flex flex-col gap-5">
            <label className="font-medium text-center">
              {t("online.lobbyEnterCode") || "Enter a game code"}
            </label>
            <input
              autoFocus
              className="w-full text-center border border-gray-300 rounded-lg px-4 py-3 text-lg tracking-widest font-mono"
              value={gameCode}
              maxLength={8}
              onChange={e => setGameCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              placeholder="ABC123"
              inputMode="text"
              spellCheck={false}
            />
            <Button type="submit" className="w-full" disabled={isJoining}>
              {isJoining ? t("online.lobbyJoining") || "Joining..." : t("online.lobbyJoin") || "Join Game"}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={handleBackToMenu}>
              {t("general.back") || "Back"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default OnlineLobby;
