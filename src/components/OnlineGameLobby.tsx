
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOnlineGame } from '@/hooks/useOnlineGame';
import { supabase } from '@/integrations/supabase/client';

interface OnlineGameLobbyProps {
  onGameStart: (gameCode: string, role: 'host' | 'guest') => void;
  onBack: () => void;
  gameSettings: any;
  t: (key: string) => string;
}

const OnlineGameLobby: React.FC<OnlineGameLobbyProps> = ({
  onGameStart,
  onBack,
  gameSettings,
  t,
}) => {
  const [playerName, setPlayerName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'waiting'>('menu');
  const [user, setUser] = useState<any>(null);
  
  const {
    gameRoom,
    players,
    isConnected,
    createGameRoom,
    joinGameRoom,
    startGame,
  } = useOnlineGame();

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Check if game is ready to start
  useEffect(() => {
    if (gameRoom && gameRoom.status === 'active') {
      const userRole = gameRoom.host_id === user?.id ? 'host' : 'guest';
      onGameStart(gameRoom.code, userRole);
    }
  }, [gameRoom, user, onGameStart]);

  const handleCreateGame = async () => {
    if (!playerName.trim()) return;
    
    setMode('create');
    const room = await createGameRoom(playerName, gameSettings);
    if (room) {
      setMode('waiting');
    } else {
      setMode('menu');
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim() || !gameCode.trim()) return;
    
    const room = await joinGameRoom(gameCode.toUpperCase(), playerName);
    if (room) {
      setMode('waiting');
    }
  };

  const handleStartGame = async () => {
    await startGame();
  };

  const isHost = gameRoom && user && gameRoom.host_id === user.id;
  const canStart = gameRoom && players.length === 2;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 via-blue-200 to-violet-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {mode === 'waiting' ? t('online.waitingRoom') || 'Game Lobby' : t('online.lobbyTitle') || 'Online Game'}
          </CardTitle>
          <CardDescription className="text-center">
            {mode === 'waiting' && gameRoom
              ? `Game Code: ${gameRoom.code}`
              : t('online.lobbyDesc') || 'Create or join a game'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === 'menu' && (
            <>
              <div>
                <label className="text-sm font-medium">Player Name</label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={20}
                />
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={handleCreateGame} 
                  className="w-full"
                  disabled={!playerName.trim()}
                >
                  Create Game
                </Button>
                <Button 
                  onClick={() => setMode('join')} 
                  variant="outline" 
                  className="w-full"
                  disabled={!playerName.trim()}
                >
                  Join Game
                </Button>
              </div>
              <Button onClick={onBack} variant="ghost" className="w-full">
                Back
              </Button>
            </>
          )}

          {mode === 'join' && (
            <>
              <div>
                <label className="text-sm font-medium">Game Code</label>
                <Input
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  placeholder="Enter game code"
                  maxLength={8}
                  className="uppercase text-center tracking-wider font-mono"
                />
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={handleJoinGame} 
                  className="w-full"
                  disabled={!gameCode.trim()}
                >
                  Join Game
                </Button>
                <Button onClick={() => setMode('menu')} variant="ghost" className="w-full">
                  Back
                </Button>
              </div>
            </>
          )}

          {mode === 'waiting' && gameRoom && (
            <>
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Connection: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                </p>
                <div className="space-y-1">
                  <h3 className="font-semibold">Players ({players.length}/2)</h3>
                  {players.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>{player.player_name}</span>
                      <span className="text-xs text-gray-500">
                        {player.role === 'host' ? '👑 Host' : '👤 Guest'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {players.length < 2 && (
                <p className="text-center text-sm text-gray-500">
                  Waiting for another player to join...
                </p>
              )}

              {isHost && canStart && (
                <Button onClick={handleStartGame} className="w-full">
                  Start Game
                </Button>
              )}

              {!isHost && canStart && (
                <p className="text-center text-sm text-gray-500">
                  Waiting for host to start the game...
                </p>
              )}

              <Button onClick={onBack} variant="ghost" className="w-full">
                Leave Game
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OnlineGameLobby;
