/*
  # Fix RLS policies for game rooms and players

  This migration fixes the Row Level Security policies to ensure that authenticated users can properly create and join game rooms.

  ## Changes Made

  1. **Game Rooms Table**
     - Updated INSERT policy to allow authenticated users to create rooms
     - Ensured proper user ID handling in policies

  2. **Game Players Table**
     - Updated INSERT policy to allow authenticated users to join as players
     - Fixed policy conditions for proper user access

  ## Security
  - Maintains RLS protection while allowing proper game functionality
  - Users can only create rooms as hosts with their own user ID
  - Users can only join games as players with their own user ID
*/

-- Drop existing policies to recreate them with proper conditions
DROP POLICY IF EXISTS "Users can create game rooms" ON game_rooms;
DROP POLICY IF EXISTS "Users can join games as players" ON game_players;

-- Recreate INSERT policy for game_rooms with proper conditions
CREATE POLICY "Users can create game rooms"
  ON game_rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (
    host_id = auth.uid() AND
    guest_id IS NULL
  );

-- Recreate INSERT policy for game_players with proper conditions  
CREATE POLICY "Users can join games as players"
  ON game_players
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
  );

-- Ensure the update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';