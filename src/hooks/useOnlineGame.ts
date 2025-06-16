
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

export type GameStatus = 'waiting' | 'active' | 'finished';
export type PlayerRole = 'host' | 'guest';

export interface GameRoom {
  id: string;
  code: string;
  host_id: string;
  guest_id: string | null;
  status: GameStatus;
  settings: any;
  game_state: any;
  current_turn: string;
  winner: string | null;
  created_at: string;
  updated_at: string;
}

export interface GamePlayer {
  id: string;
  game_room_id: string;
  user_id: string;
  role: PlayerRole;
  player_name: string;
  points: number;
  position_x: number;
  position_y: number;
  is_connected: boolean;
  joined_at: string;
}

export function useOnlineGame() {
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Create a new game room
  const createGameRoom = useCallback(async (playerName: string, gameSettings: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate a unique code
      const { data: codeData } = await supabase.rpc('generate_game_code');
      
      const { data: room, error: roomError } = await supabase
        .from('game_rooms')
        .insert({
          code: codeData,
          host_id: user.id,
          settings: gameSettings,
          status: 'waiting'
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add host as player
      const { error: playerError } = await supabase
        .from('game_players')
        .insert({
          game_room_id: room.id,
          user_id: user.id,
          role: 'host',
          player_name: playerName
        });

      if (playerError) throw playerError;

      setGameRoom(room);
      return room;
    } catch (error) {
      console.error('Error creating game room:', error);
      toast({
        title: 'Failed to create game',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      return null;
    }
  }, []);

  // Join an existing game room
  const joinGameRoom = useCallback(async (code: string, playerName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Find the game room
      const { data: room, error: roomError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('code', code)
        .eq('status', 'waiting')
        .single();

      if (roomError || !room) {
        throw new Error('Game not found or already started');
      }

      // Update room with guest
      const { data: updatedRoom, error: updateError } = await supabase
        .from('game_rooms')
        .update({ guest_id: user.id })
        .eq('id', room.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Add guest as player
      const { error: playerError } = await supabase
        .from('game_players')
        .insert({
          game_room_id: room.id,
          user_id: user.id,
          role: 'guest',
          player_name: playerName
        });

      if (playerError) throw playerError;

      setGameRoom(updatedRoom);
      return updatedRoom;
    } catch (error) {
      console.error('Error joining game room:', error);
      toast({
        title: 'Failed to join game',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      return null;
    }
  }, []);

  // Start the game
  const startGame = useCallback(async () => {
    if (!gameRoom) return;

    try {
      const { error } = await supabase
        .from('game_rooms')
        .update({ status: 'active' })
        .eq('id', gameRoom.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error starting game:', error);
      toast({
        title: 'Failed to start game',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  }, [gameRoom]);

  // Update player position
  const updatePlayerPosition = useCallback(async (x: number, y: number) => {
    if (!gameRoom) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('game_players')
        .update({ position_x: x, position_y: y })
        .eq('game_room_id', gameRoom.id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating position:', error);
    }
  }, [gameRoom]);

  // Update player points
  const updatePlayerPoints = useCallback(async (points: number) => {
    if (!gameRoom) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('game_players')
        .update({ points })
        .eq('game_room_id', gameRoom.id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating points:', error);
    }
  }, [gameRoom]);

  // Update game state
  const updateGameState = useCallback(async (gameState: any) => {
    if (!gameRoom) return;

    try {
      const { error } = await supabase
        .from('game_rooms')
        .update({ game_state: gameState })
        .eq('id', gameRoom.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating game state:', error);
    }
  }, [gameRoom]);

  // Set up real-time subscription
  useEffect(() => {
    if (!gameRoom) return;

    const gameChannel = supabase.channel(`game-${gameRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_rooms',
          filter: `id=eq.${gameRoom.id}`
        },
        (payload) => {
          setGameRoom(payload.new as GameRoom);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_players',
          filter: `game_room_id=eq.${gameRoom.id}`
        },
        () => {
          // Refetch players when any player data changes
          fetchPlayers();
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    setChannel(gameChannel);

    return () => {
      supabase.removeChannel(gameChannel);
      setChannel(null);
      setIsConnected(false);
    };
  }, [gameRoom?.id]);

  // Fetch players for the current game
  const fetchPlayers = useCallback(async () => {
    if (!gameRoom) return;

    try {
      const { data, error } = await supabase
        .from('game_players')
        .select('*')
        .eq('game_room_id', gameRoom.id)
        .order('joined_at');

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  }, [gameRoom]);

  // Initial players fetch
  useEffect(() => {
    if (gameRoom) {
      fetchPlayers();
    }
  }, [gameRoom, fetchPlayers]);

  return {
    gameRoom,
    players,
    isConnected,
    createGameRoom,
    joinGameRoom,
    startGame,
    updatePlayerPosition,
    updatePlayerPoints,
    updateGameState,
  };
}
