import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

/**
 * Online lobby supporting game creation/joining flows, now allows playing vs AI after joining.
 */
const OnlineLobby: React.FC<{
  onBack?: () => void;
  t: (k: string, params?: any) => string;
  onGameStart: (gameCode: string, role: "host" | "guest") => void;
  onVsAISolo?: () => void;
}> = ({
  onBack,
  t,
  onGameStart,
  onVsAISolo,
}) => {
  const [step, setStep] = useState<
    "menu" | "create" | "join" | "wait" | "error" | "choose-opponent"
  >("menu");
  const [gameCode, setGameCode] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  // Track if the user is host or guest for the vs friend option
  const [currentRole, setCurrentRole] = useState<"host" | "guest" | null>(null);

  function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Handler: Start game creation
  const handleCreateGame = () => {
    setIsCreating(true);
    setTimeout(() => {
      const newCode = generateCode();
      setGameCode(newCode);
      setCurrentRole("host");
      setIsCreating(false);
      toast({
        title: t("online.lobbyGameCreated") || "Game Created",
        description:
          `${t("online.lobbyShareCode") || "Share this code:"} ${newCode}`,
        duration: 45000,
        action: (
          <ToastAction altText={t("online.lobbyContinue") || "Continue"} onClick={() => {
            setStep("choose-opponent");
            // Dismiss the toast by id if needed (Radix Toast will close automatically)
          }}>
            {t("online.lobbyContinue") || "Continue"}
          </ToastAction>
        ),
      });
      // Don't move to "choose-opponent" yet—wait for user to press Continue.
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
      setCurrentRole("guest");
      toast({
        title: t("online.lobbyJoined") || "Joined game!",
        description: t("online.lobbyJoinedDesc") || "Waiting for the host...",
      });
      // Immediately call onGameStart after joining as guest (skip choose-opponent)
      if (onGameStart) {
        onGameStart(gameCode, "guest");
      }
      // Optionally, you could setStep("wait") if you want to show a waiting room.
    }, 800);
  };

  // Handler: Back to menu
  const handleBackToMenu = () => {
    setStep("menu");
    setGameCode("");
    setIsCreating(false);
    setIsJoining(false);
    setCurrentRole(null);
  };

  // Handler: Play vs AI (from lobby)
  const handleVsAI = () => {
    if (onVsAISolo) onVsAISolo();
  };

  // Handler: Play vs Friend
  const handleVsFriend = () => {
    if (gameCode && currentRole) {
      onGameStart(gameCode, currentRole);
    }
  };

  // Lobby/menu screens
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

        {/* CHOOSE OPPONENT STEP */}
        {/* Only hosts see choose-opponent after creating, guests go straight to the board */}
        {step === "choose-opponent" && currentRole === "host" && (
          <>
            <p className="text-center text-gray-500">
              {t("online.lobbyChooseOpponent") || "Do you want to play against AI or a friend?"}
            </p>
            <div className="flex flex-col gap-4">
              <Button className="w-full" onClick={handleVsAI}>
                🤖 {t("online.lobbyVsAI") || "Play vs AI"}
              </Button>
              <Button className="w-full" onClick={handleVsFriend}>
                🧑‍🤝‍🧑 {t("online.lobbyVsFriend") || "Play vs Friend"}
              </Button>
            </div>
            <Button className="w-full mt-3" variant="ghost" onClick={handleBackToMenu}>
              {t("general.back") || "Back"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default OnlineLobby;
