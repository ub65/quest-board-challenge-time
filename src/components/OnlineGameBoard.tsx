import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocalization } from "@/contexts/LocalizationContext";
import { toast } from "@/components/ui/use-toast";
import { gameRoomService } from "@/lib/supabase";
import { generateRandomPoints, getRandomSurpriseTiles } from "./GameBoard/utils";
import GameBoardArea from "./GameBoard/GameBoardArea";
import GameBoardModals from "./GameBoard/GameBoardModals";
import { generateQuestion } from "./GameBoard/questionGenerator";
import { playSound } from "@/lib/audioManager";

type OnlineGameBoardProps = {
  roomId: string;
  playerRole: 'host' | 'guest';
  playerName: string;
  opponentName: string;
  onLeave: () => void;
  questionType?: "translate" | "math" | "trivia";
  soundEnabled?: boolean;
  volume?: number;
};

const OnlineGameBoard: React.FC<OnlineGameBoardProps> = ({
  roomId,
  playerRole,
  playerName,
  opponentName,
  onLeave,
  questionType = "translate",
  soundEnabled = true,
  volume = 0.5,
}) => {
  const { t, language } = useLocalization();
  
  // Game state
  const [gameState, setGameState] = useState<any>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [moveState, setMoveState] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [disableInput, setDisableInput] = useState(false);
  const [winner, setWinner] = useState<'host' | 'guest' | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  
  const subscriptionRef = useRef<any>(null);
  const playersSubscriptionRef = useRef<any>(null);

  // Initialize game state
  useEffect(() => {
    loadGameRoom();
    setupSubscriptions();
    
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      if (playersSubscriptionRef.current) {
        playersSubscriptionRef.current.unsubscribe();
      }
    };
  }, [roomId]);

  const loadGameRoom = async () => {
    try {
      const room = await gameRoomService.getRoom(roomId);
      setGameState(room.game_state);
      setIsMyTurn(room.current_turn === playerRole);
      setWinner(room.winner);
      setConnectionStatus('connected');
      
      // Initialize board if needed
      if (!room.game_state.board_points || room.game_state.board_points.length === 0) {
        await initializeBoard(room.settings?.boardSize || 7);
      }
    } catch (error) {
      console.error('Failed to load game room:', error);
      setConnectionStatus('disconnected');
      toast({
        title: "Connection Error",
        description: "Failed to connect to game room",
        variant: "destructive"
      });
    }
  };

  const initializeBoard = async (boardSize: number) => {
    const newGameState = {
      board_size: boardSize,
      positions: { 
        host: { x: 0, y: 0 }, 
        guest: { x: boardSize - 1, y: boardSize - 1 } 
      },
      points: { host: 0, guest: 0 },
      current_turn: 'host',
      board_points: generateRandomPoints(boardSize),
      surprise_tiles: getRandomSurpriseTiles(boardSize, 4),
      defense_tiles: [],
      defenses_used: { host: 0, guest: 0 }
    };

    await gameRoomService.updateGameState(roomId, newGameState);
  };

  const setupSubscriptions = () => {
    // Subscribe to room changes
    subscriptionRef.current = gameRoomService.subscribeToRoom(roomId, (payload) => {
      if (payload.new) {
        setGameState(payload.new.game_state);
        setIsMyTurn(payload.new.current_turn === playerRole);
        setWinner(payload.new.winner);
      }
    });

    // Subscribe to player changes
    playersSubscriptionRef.current = gameRoomService.subscribeToPlayers(roomId, (payload) => {
      // Handle player connection/disconnection
      console.log('Player update:', payload);
    });
  };

  const handleTileClick = useCallback(async (tile: { x: number; y: number }) => {
    if (!isMyTurn || disableInput || winner || !gameState) return;

    // Check if move is valid
    const myPosition = gameState.positions[playerRole];
    const distance = Math.abs(tile.x - myPosition.x) + Math.abs(tile.y - myPosition.y);
    
    if (distance !== 1) return; // Only adjacent moves allowed

    // Generate question
    const question = generateQuestion(questionType, "medium");
    
    setMoveState({
      tile,
      question,
      resolve: async (isCorrect: boolean) => {
        setIsModalOpen(false);
        setMoveState(null);

        if (!isCorrect) {
          // Wrong answer - switch turn
          await gameRoomService.updateTurn(roomId, playerRole === 'host' ? 'guest' : 'host');
          playSound("wrong", soundEnabled, volume, 0);
          return;
        }

        // Correct answer - make the move
        const newGameState = { ...gameState };
        newGameState.positions[playerRole] = tile;
        
        // Add points
        const boardSize = newGameState.board_size;
        if (!((tile.x === 0 && tile.y === 0) || (tile.x === boardSize - 1 && tile.y === boardSize - 1))) {
          newGameState.points[playerRole] += newGameState.board_points[tile.y][tile.x];
        }

        // Check for win condition
        const targetX = playerRole === 'host' ? boardSize - 1 : 0;
        const targetY = playerRole === 'host' ? boardSize - 1 : 0;
        
        if (tile.x === targetX && tile.y === targetY) {
          await gameRoomService.setWinner(roomId, playerRole);
          playSound("win", soundEnabled, volume, 0);
        } else {
          // Switch turn
          await gameRoomService.updateTurn(roomId, playerRole === 'host' ? 'guest' : 'host');
          playSound("move", soundEnabled, volume, 0);
        }

        // Update game state
        await gameRoomService.updateGameState(roomId, newGameState);
      }
    });
    
    setIsModalOpen(true);
  }, [isMyTurn, disableInput, winner, gameState, playerRole, roomId, questionType, soundEnabled, volume]);

  const handleModalSubmit = useCallback((isCorrect: boolean) => {
    if (moveState?.resolve) {
      moveState.resolve(isCorrect);
    }
  }, [moveState]);

  const getValidMoves = useCallback((pos: { x: number; y: number }) => {
    if (!gameState) return [];
    
    const moves = [];
    const boardSize = gameState.board_size;
    
    // Adjacent moves only
    if (pos.x > 0) moves.push({ x: pos.x - 1, y: pos.y });
    if (pos.x < boardSize - 1) moves.push({ x: pos.x + 1, y: pos.y });
    if (pos.y > 0) moves.push({ x: pos.x, y: pos.y - 1 });
    if (pos.y < boardSize - 1) moves.push({ x: pos.x, y: pos.y + 1 });
    
    return moves;
  }, [gameState]);

  if (connectionStatus === 'connecting') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">{t('online.connecting') || 'Connecting to game...'}</p>
        </div>
      </div>
    );
  }

  if (connectionStatus === 'disconnected') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{t('online.disconnected') || 'Connection lost'}</p>
          <button 
            onClick={onLeave}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg"
          >
            {t('online.backToLobby') || 'Back to Lobby'}
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-lg">{t('online.loading') || 'Loading game...'}</div>
      </div>
    );
  }

  const myPosition = gameState.positions[playerRole];
  const opponentPosition = gameState.positions[playerRole === 'host' ? 'guest' : 'host'];
  const myPoints = gameState.points[playerRole];
  const opponentPoints = gameState.points[playerRole === 'host' ? 'guest' : 'host'];

  return (
    <div className="w-full" dir={language === "he" ? "rtl" : "ltr"}>
      {/* Online Game Header */}
      <div className="mb-4 text-center">
        <div className="bg-white/90 rounded-lg p-4 shadow-md">
          <div className="flex justify-between items-center mb-2">
            <div className={`text-sm font-medium ${isMyTurn ? 'text-green-600' : 'text-gray-500'}`}>
              {playerName} ({playerRole === 'host' ? t('online.host') || 'Host' : t('online.guest') || 'Guest'})
            </div>
            <div className="text-lg font-bold">
              {myPoints} - {opponentPoints}
            </div>
            <div className={`text-sm font-medium ${!isMyTurn ? 'text-green-600' : 'text-gray-500'}`}>
              {opponentName}
            </div>
          </div>
          <div className="text-center">
            {winner ? (
              <div className="text-lg font-bold">
                {winner === playerRole ? 
                  (t('game.youWin') || 'You Win!') : 
                  (t('game.opponentWins') || 'Opponent Wins!')
                }
              </div>
            ) : (
              <div className={`text-base ${isMyTurn ? 'text-blue-600' : 'text-orange-600'}`}>
                {isMyTurn ? 
                  (t('game.yourTurn') || 'Your Turn') : 
                  (t('game.opponentTurn') || "Opponent's Turn")
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Game Board */}
      <GameBoardArea
        language={language}
        t={t}
        turn={isMyTurn ? "human" : "ai"}
        winner={winner ? (winner === playerRole ? "human" : "ai") : null}
        difficulty="medium"
        humanPoints={myPoints}
        aiPoints={opponentPoints}
        numDefenses={3}
        defensesUsed={{ human: 0, ai: 0 }}
        onPlaceDefense={() => {}}
        defenseMode={false}
        boardSize={gameState.board_size}
        boardPoints={gameState.board_points}
        positions={{
          human: myPosition,
          ai: opponentPosition
        }}
        humanTarget={playerRole === 'host' ? 
          { x: gameState.board_size - 1, y: gameState.board_size - 1 } :
          { x: 0, y: 0 }
        }
        aiTarget={playerRole === 'host' ? 
          { x: 0, y: 0 } :
          { x: gameState.board_size - 1, y: gameState.board_size - 1 }
        }
        disableInput={!isMyTurn || disableInput || !!winner}
        handleTileClick={handleTileClick}
        getValidMoves={getValidMoves}
        positionsEqual={(a, b) => a.x === b.x && a.y === b.y}
        surpriseTiles={gameState.surprise_tiles || []}
        defenseTiles={gameState.defense_tiles || []}
        aiPendingTarget={null}
        moveState={moveState}
        isModalOpen={isModalOpen}
        aiModalState={null}
        questionTime={20}
        onHumanSubmit={handleModalSubmit}
        onAISubmit={() => {}}
        onRestart={() => {}}
        onPause={onLeave}
        settingsOpen={false}
        setSettingsOpen={() => {}}
        onBoardSizeChange={() => {}}
        onQuestionTimeChange={() => {}}
        onSurpriseCountChange={() => {}}
        onNumDefensesChange={() => {}}
        onDifficultyChange={() => {}}
        surpriseCount={4}
        playerName={playerName}
        soundEnabled={soundEnabled}
        onToggleSound={() => {}}
      >
        <GameBoardModals
          moveState={moveState}
          isModalOpen={isModalOpen}
          aiModalState={null}
          winner={winner ? (winner === playerRole ? "human" : "ai") : null}
          questionTime={20}
          onHumanSubmit={handleModalSubmit}
          onAISubmit={() => {}}
          questionType={questionType}
          soundEnabled={soundEnabled}
          volume={volume}
        />
      </GameBoardArea>
    </div>
  );
};

export default OnlineGameBoard;