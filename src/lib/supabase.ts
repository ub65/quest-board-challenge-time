import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Authentication helpers
export const authService = {
  // Sign in with a temporary email/password for guest users
  async signInAsGuest() {
    // Generate a temporary email and password for guest users
    const tempId = Math.random().toString(36).substring(2, 15)
    const tempEmail = `guest_${tempId}@example.com` // Changed to valid domain
    const tempPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + "A1!" // Ensure password meets requirements
    
    console.log('[AUTH] Attempting to sign up guest user:', tempEmail)
    
    // Try to sign up first
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: tempEmail,
      password: tempPassword,
      options: {
        emailRedirectTo: undefined // Disable email confirmation
      }
    })
    
    if (signUpError) {
      console.error('[AUTH] Sign up failed:', signUpError)
      throw signUpError
    }
    
    console.log('[AUTH] Guest user signed up successfully:', signUpData.user?.id)
    return signUpData
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Ensure user is authenticated
  async ensureAuthenticated() {
    let user = await this.getCurrentUser()
    if (!user) {
      console.log('[AUTH] No user found, creating guest user')
      const authData = await this.signInAsGuest()
      user = authData.user
    }
    console.log('[AUTH] User authenticated:', user?.id)
    return user
  }
}

// Game room management
export const gameRoomService = {
  // Create a new game room
  async createRoom(hostName: string, settings: any) {
    console.log('[GAME] Creating room for host:', hostName)
    
    // Ensure user is authenticated
    const user = await authService.ensureAuthenticated()
    if (!user) {
      throw new Error('Authentication required')
    }

    console.log('[GAME] User authenticated, creating room with user ID:', user.id)

    // Generate a simple 6-character code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    const roomData = {
      code,
      host_id: user.id,
      status: 'waiting' as const,
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
    }

    console.log('[GAME] Inserting room data:', roomData)
    
    const { data, error } = await supabase
      .from('game_rooms')
      .insert(roomData)
      .select()
      .single()

    if (error) {
      console.error('[GAME] Failed to create room:', error)
      throw error
    }

    console.log('[GAME] Room created successfully:', data.id)

    // Add host as player
    const playerData = {
      game_room_id: data.id,
      user_id: user.id,
      role: 'host' as const,
      player_name: hostName,
      is_connected: true
    }

    console.log('[GAME] Adding host as player:', playerData)

    const { error: playerError } = await supabase
      .from('game_players')
      .insert(playerData)

    if (playerError) {
      console.error('[GAME] Failed to add host as player:', playerError)
      throw playerError
    }

    console.log('[GAME] Host added as player successfully')
    return data
  },

  // Join existing room
  async joinRoom(code: string, guestName: string) {
    console.log('[GAME] Joining room with code:', code)
    
    // Ensure user is authenticated
    const user = await authService.ensureAuthenticated()
    if (!user) throw new Error('Authentication required')

    // Find room by code
    const { data: room, error: roomError } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('code', code)
      .eq('status', 'waiting')
      .single()

    if (roomError || !room) {
      console.error('[GAME] Room not found:', roomError)
      throw new Error('Room not found or already started')
    }

    console.log('[GAME] Room found:', room.id)

    // Add guest as player
    const { error: playerError } = await supabase
      .from('game_players')
      .insert({
        game_room_id: room.id,
        user_id: user.id,
        role: 'guest',
        player_name: guestName,
        is_connected: true
      })

    if (playerError) {
      console.error('[GAME] Failed to add guest as player:', playerError)
      throw playerError
    }

    // Update room to set guest_id
    const { error: updateGuestError } = await supabase
      .from('game_rooms')
      .update({ guest_id: user.id })
      .eq('id', room.id)

    if (updateGuestError) {
      console.error('[GAME] Failed to update guest_id:', updateGuestError)
      throw updateGuestError
    }

    // Update room status to active
    const { data: updatedRoom, error: updateError } = await supabase
      .from('game_rooms')
      .update({ status: 'active' })
      .eq('id', room.id)
      .select()
      .single()

    if (updateError) {
      console.error('[GAME] Failed to update room status:', updateError)
      throw updateError
    }

    console.log('[GAME] Successfully joined room')
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