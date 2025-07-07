import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Game room management
export const gameRoomService = {
  // Create a new game room
  async createRoom(hostName: string, settings: any) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    const { data, error } = await supabase
      .from('game_rooms')
      .insert({
        code,
        status: 'waiting',
        settings,
        game_state: {
          board_size: settings.boardSize || 7,
          positions: { host: { x: 0, y: 0 }, guest: { x: settings.boardSize - 1 || 6, y: settings.boardSize - 1 || 6 } },
          points: { host: 0, guest: 0 },
          current_turn: 'host',
          board_points: [],
          surprise_tiles: [],
          defense_tiles: [],
          defenses_used: { host: 0, guest: 0 }
        }
      })
      .select()
      .single()

    if (error) throw error

    // Add host as player
    await supabase
      .from('game_players')
      .insert({
        game_room_id: data.id,
        role: 'host',
        player_name: hostName,
        is_connected: true
      })

    return data
  },

  // Join existing room
  async joinRoom(code: string, guestName: string) {
    // Find room by code
    const { data: room, error: roomError } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('code', code)
      .eq('status', 'waiting')
      .single()

    if (roomError || !room) throw new Error('Room not found or already started')

    // Add guest as player
    const { error: playerError } = await supabase
      .from('game_players')
      .insert({
        game_room_id: room.id,
        role: 'guest',
        player_name: guestName,
        is_connected: true
      })

    if (playerError) throw playerError

    // Update room status to active
    const { data: updatedRoom, error: updateError } = await supabase
      .from('game_rooms')
      .update({ status: 'active' })
      .eq('id', room.id)
      .select()
      .single()

    if (updateError) throw updateError

    return updatedRoom
  },

  // Get room details
  async getRoom(roomId: string) {
    const { data, error } = await supabase
      .from('game_rooms')
      .select(`
        *,
        game_players (*)
      `)
      .eq('id', roomId)
      .single()

    if (error) throw error
    return data
  },

  // Update game state
  async updateGameState(roomId: string, gameState: any) {
    const { error } = await supabase
      .from('game_rooms')
      .update({ 
        game_state: gameState,
        updated_at: new Date().toISOString()
      })
      .eq('id', roomId)

    if (error) throw error
  },

  // Update current turn
  async updateTurn(roomId: string, turn: 'host' | 'guest') {
    const { error } = await supabase
      .from('game_rooms')
      .update({ current_turn: turn })
      .eq('id', roomId)

    if (error) throw error
  },

  // Set winner
  async setWinner(roomId: string, winner: 'host' | 'guest') {
    const { error } = await supabase
      .from('game_rooms')
      .update({ 
        winner,
        status: 'finished'
      })
      .eq('id', roomId)

    if (error) throw error
  },

  // Subscribe to room changes
  subscribeToRoom(roomId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_rooms',
          filter: `id=eq.${roomId}`
        },
        callback
      )
      .subscribe()
  },

  // Subscribe to player changes
  subscribeToPlayers(roomId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`players-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_players',
          filter: `game_room_id=eq.${roomId}`
        },
        callback
      )
      .subscribe()
  }
}