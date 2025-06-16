
-- Create enum for game status
CREATE TYPE game_status AS ENUM ('waiting', 'active', 'finished');

-- Create enum for player role in game
CREATE TYPE player_role AS ENUM ('host', 'guest');

-- Create game_rooms table to store multiplayer game sessions
CREATE TABLE public.game_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(8) UNIQUE NOT NULL,
    host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status game_status DEFAULT 'waiting',
    settings JSONB DEFAULT '{}',
    game_state JSONB DEFAULT '{}',
    current_turn VARCHAR(10) DEFAULT 'host',
    winner VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_players table to track player information in games
CREATE TABLE public.game_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_room_id UUID REFERENCES public.game_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role player_role NOT NULL,
    player_name VARCHAR(50),
    points INTEGER DEFAULT 0,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    is_connected BOOLEAN DEFAULT true,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(game_room_id, role)
);

-- Enable Row Level Security
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;

-- RLS Policies for game_rooms
CREATE POLICY "Users can view game rooms they participate in" ON public.game_rooms
    FOR SELECT USING (
        auth.uid() = host_id OR 
        auth.uid() = guest_id
    );

CREATE POLICY "Hosts can update their game rooms" ON public.game_rooms
    FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Users can create game rooms" ON public.game_rooms
    FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their game rooms" ON public.game_rooms
    FOR DELETE USING (auth.uid() = host_id);

-- RLS Policies for game_players
CREATE POLICY "Users can view players in games they participate in" ON public.game_players
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.game_rooms 
            WHERE id = game_room_id 
            AND (host_id = auth.uid() OR guest_id = auth.uid())
        )
    );

CREATE POLICY "Users can update their own player data" ON public.game_players
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert themselves as players" ON public.game_players
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to generate unique game codes
CREATE OR REPLACE FUNCTION generate_game_code()
RETURNS VARCHAR(8) AS $$
DECLARE
    new_code VARCHAR(8);
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate a random 6-character code
        new_code := UPPER(substring(md5(random()::text) from 1 for 6));
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM public.game_rooms WHERE code = new_code) INTO code_exists;
        
        -- If code doesn't exist, we can use it
        IF NOT code_exists THEN
            RETURN new_code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update game_rooms updated_at timestamp
CREATE OR REPLACE FUNCTION update_game_room_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update timestamps
CREATE TRIGGER update_game_rooms_timestamp
    BEFORE UPDATE ON public.game_rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_game_room_timestamp();

-- Enable realtime for the tables
ALTER TABLE public.game_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.game_players REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_players;
