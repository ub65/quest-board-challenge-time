import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { gameRoomService, authService } from "@/lib/supabase";
import { useLocalization } from "@/contexts/LocalizationContext";

type OnlineLobbyProps = {
  onBack?: () => void;
  onGameStart: (roomId: string, role: "host" | "guest", opponentName: string) => void;
  playerName: string;
};

const OnlineLobby: React.FC<OnlineLobbyProps> = ({
  onBack,
  onGameStart,
  playerName,
}) => {
  const { t } = useLocalization();
  const [step, setStep] = useState<"menu" | "create" | "join" | "waiting">("menu");
  const [gameCode, setGameCode] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  // Initialize authentication on component mount
  React.useEffect(() => {
    const initAuth = async () => {
      try {
        await authService.ensureAuthenticated();
      } catch (error) {
        console.error('Failed to initialize authentication:', error);
        toast({
          title: t("online.error") || "Error",
          description: "Failed to initialize. Please refresh the page.",
          variant: "destructive"
        });
      }
    };
    
    initAuth();
  }, [t]);

  // Handler: Start game creation
  const handleCreateGame = async () => {
    setIsCreating(true);
    try {
      // Ensure authentication before creating room
      await authService.ensureAuthenticated();
      
      const room = await gameRoomService.createRoom(playerName, {
        boardSize: 7,
        questionTime: 20,
        numSurprises: 4,
        numDefenses: 3
      });
      
      setGameCode(room.code);
      setRoomId(room.id);
      setStep("waiting");
      setIsWaiting(true);
      
      toast({
        title: t("online.gameCreated") || "Game Created",
        description: `${t("online.shareCode") || "Share this code:"} ${room.code}`,
        duration: 10000,
      });

      // Wait for opponent to join
      const subscription = gameRoomService.subscribeToRoom(room.id, (payload) => {
        if (payload.new?.status === 'active') {
          subscription.unsubscribe();
          // Get opponent name
          gameRoomService.getRoom(room.id).then((roomData) => {
            const guestPlayer = roomData.game_players.find(p => p.role === 'guest');
            if (guestPlayer) {
              onGameStart(room.id, 'host', guestPlayer.player_name || 'Guest');
            }
          });
        }
      });

    } catch (error) {
      console.error('Failed to create game:', error);
      toast({
        title: t("online.error") || "Error",
        description: t("online.createFailed") || "Failed to create game",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Handler: Show join screen
  const handleJoinGame = () => {
    setStep("join");
    setGameCode("");
  };

  // Handler: Submit join code
  const handleSubmitJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameCode.trim() || gameCode.length < 4) {
      toast({
        title: t("online.invalidCode") || "Invalid code",
        description: t("online.enterValidCode") || "Please enter a valid game code.",
        variant: "destructive",
      });
      return;
    }
    
    setIsJoining(true);
    try {
      // Ensure authentication before joining room
      await authService.ensureAuthenticated();
      
      const room = await gameRoomService.joinRoom(gameCode.trim(), playerName);
      
      // Get host name
      const roomData = await gameRoomService.getRoom(room.id);
      const hostPlayer = roomData.game_players.find(p => p.role === 'host');
      
      toast({
        title: t("online.joined") || "Joined game!",
        description: t("online.gameStarting") || "Game is starting...",
      });
      
      onGameStart(room.id, 'guest', hostPlayer?.player_name || 'Host');
      
    } catch (error) {
      console.error('Failed to join game:', error);
      toast({
        title: t("online.error") || "Error",
        description: t("online.joinFailed") || "Failed to join game. Check the code and try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  // Handler: Back to menu
  const handleBackToMenu = () => {
    setStep("menu");
    setGameCode("");
    setIsCreating(false);
    setIsJoining(false);
    setIsWaiting(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-sky-100 via-blue-200 to-violet-100 px-4">
      <div className="w-full max-w-sm mx-auto bg-white/95 shadow-xl rounded-3xl p-7 flex flex-col gap-8 mt-10 animate-fade-in">
        <h1 className="text-2xl font-extrabold text-center text-primary">
          🌐 {t("online.title") || "Online Multiplayer"}
        </h1>
        
        {step === "menu" && (
          <>
            <p className="text-center text-gray-500">
              {t("online.description") || "Play with a friend online! Create a game or join with a code."}
            </p>
            <div className="flex flex-col gap-4">
              <Button 
                className="w-full" 
                onClick={handleCreateGame} 
                disabled={isCreating}
              >
                {isCreating ? 
                  (t("online.creating") || "Creating...") : 
                  (t("online.createGame") || "Create Game")
                }
              </Button>
              <Button 
                className="w-full" 
                variant="secondary" 
                onClick={handleJoinGame}
              >
                {t("online.joinGame") || "Join Game"}
              </Button>
            </div>
            <Button 
              className="w-full mt-3" 
              variant="ghost" 
              onClick={onBack}
            >
              {t("general.back") || "Back"}
            </Button>
          </>
        )}

        {step === "join" && (
          <form onSubmit={handleSubmitJoin} className="flex flex-col gap-5">
            <label className="font-medium text-center">
              {t("online.enterCode") || "Enter Game Code"}
            </label>
            <input
              autoFocus
              className="w-full text-center border border-gray-300 rounded-lg px-4 py-3 text-lg tracking-widest font-mono uppercase"
              value={gameCode}
              maxLength={8}
              onChange={e => setGameCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              placeholder="ABC123"
              inputMode="text"
              spellCheck={false}
            />
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isJoining}
            >
              {isJoining ? 
                (t("online.joining") || "Joining...") : 
                (t("online.joinGame") || "Join Game")
              }
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full" 
              onClick={handleBackToMenu}
            >
              {t("general.back") || "Back"}
            </Button>
          </form>
        )}

        {step === "waiting" && (
          <>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg font-medium mb-2">
                {t("online.waitingForPlayer") || "Waiting for opponent..."}
              </p>
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {t("online.shareThisCode") || "Share this code:"}
                </p>
                <div className="text-2xl font-mono font-bold tracking-widest text-primary">
                  {gameCode}
                </div>
              </div>
              <p className="text-sm text-gray-500">
                {t("online.waitingDescription") || "Your friend can join using this code"}
              </p>
            </div>
            <Button 
              variant="ghost" 
              className="w-full" 
              onClick={handleBackToMenu}
            >
              {t("online.cancel") || "Cancel"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default OnlineLobby;