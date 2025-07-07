/*
  # Create Game Schema

  1. New Tables
    - `game_rooms`
      - `id` (uuid, primary key)
      - `code` (text, unique game room code)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `host_id` (uuid, reference to auth.users)
      - `guest_id` (uuid, reference to auth.users)
      - `status` (enum: waiting, active, finished)
      - `current_turn` (text)
      - `winner` (text)
      - `settings` (jsonb, game configuration)
      - `game_state` (jsonb, current game state)

    - `game_players`
      - `id` (uuid, primary key)
      - `game_room_id` (uuid, foreign key to game_rooms)
      - `user_id` (uuid, reference to auth.users)
      - `role` (enum: host, guest)
      - `player_name` (text)
      - `is_connected` (boolean)
      - `joined_at` (timestamp)
      - `points` (integer)
      - `position_x` (integer)
      - `position_y` (integer)

  2. Enums
    - `game_status` (waiting, active, finished)
    - `player_role` (host, guest)

  3. Functions
    - `generate_game_code()` - generates unique game room codes

  4. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their games
*/

-- Create enums
CREATE TYPE game_status AS ENUM ('waiting', 'active', 'finished');
CREATE TYPE player_role AS ENUM ('host', 'guest');

-- Create game_rooms table
CREATE TABLE IF NOT EXISTS game_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  host_id uuid REFERENCES auth.users(id),
  guest_id uuid REFERENCES auth.users(id),
  status game_status DEFAULT 'waiting',
  current_turn text,
  winner text,
  settings jsonb DEFAULT '{}',
  game_state jsonb DEFAULT '{}'
);

-- Create game_players table
CREATE TABLE IF NOT EXISTS game_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_room_id uuid REFERENCES game_rooms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  role player_role NOT NULL,
  player_name text,
  is_connected boolean DEFAULT true,
  joined_at timestamptz DEFAULT now(),
  points integer DEFAULT 0,
  position_x integer,
  position_y integer
);

-- Create function to generate unique game codes
CREATE OR REPLACE FUNCTION generate_game_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  code_length INTEGER := 6;
  characters TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
  char_index INTEGER;
BEGIN
  FOR i IN 1..code_length LOOP
    char_index := floor(random() * length(characters) + 1);
    result := result || substr(characters, char_index, 1);
  END LOOP;
  
  -- Check if code already exists, if so generate a new one
  WHILE EXISTS (SELECT 1 FROM game_rooms WHERE code = result) LOOP
    result := '';
    FOR i IN 1..code_length LOOP
      char_index := floor(random() * length(characters) + 1);
      result := result || substr(characters, char_index, 1);
    END LOOP;
  END LOOP;
  
  RETURN result;
END;
$$;

-- Enable Row Level Security
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;

-- Create policies for game_rooms
CREATE POLICY "Users can view game rooms they participate in"
  ON game_rooms
  FOR SELECT
  TO authenticated
  USING (
    host_id = auth.uid() OR 
    guest_id = auth.uid() OR 
    id IN (
      SELECT game_room_id 
      FROM game_players 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create game rooms"
  ON game_rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (host_id = auth.uid());

CREATE POLICY "Hosts can update their game rooms"
  ON game_rooms
  FOR UPDATE
  TO authenticated
  USING (host_id = auth.uid())
  WITH CHECK (host_id = auth.uid());

CREATE POLICY "Users can delete their hosted game rooms"
  ON game_rooms
  FOR DELETE
  TO authenticated
  USING (host_id = auth.uid());

-- Create policies for game_players
CREATE POLICY "Users can view players in their games"
  ON game_players
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    game_room_id IN (
      SELECT id FROM game_rooms 
      WHERE host_id = auth.uid() OR guest_id = auth.uid()
    )
  );

CREATE POLICY "Users can join games as players"
  ON game_players
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own player data"
  ON game_players
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave games they joined"
  ON game_players
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_rooms_code ON game_rooms(code);
CREATE INDEX IF NOT EXISTS idx_game_rooms_status ON game_rooms(status);
CREATE INDEX IF NOT EXISTS idx_game_rooms_host_id ON game_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_game_rooms_guest_id ON game_rooms(guest_id);
CREATE INDEX IF NOT EXISTS idx_game_players_game_room_id ON game_players(game_room_id);
CREATE INDEX IF NOT EXISTS idx_game_players_user_id ON game_players(user_id);
CREATE INDEX IF NOT EXISTS idx_game_players_role ON game_players(role);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_game_rooms_updated_at
  BEFORE UPDATE ON game_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();