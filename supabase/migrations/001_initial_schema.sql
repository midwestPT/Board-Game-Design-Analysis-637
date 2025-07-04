-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles_pt2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'admin')),
  institution_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create games table
CREATE TABLE IF NOT EXISTS games_pt2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_mode TEXT DEFAULT 'ai' CHECK (game_mode IN ('ai', 'human', 'practice')),
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  case_id TEXT NOT NULL,
  player_role TEXT DEFAULT 'pt' CHECK (player_role IN ('pt', 'patient')),
  game_state JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game actions table
CREATE TABLE IF NOT EXISTS game_actions_pt2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games_pt2024(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_data JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game performance table
CREATE TABLE IF NOT EXISTS game_performance_pt2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games_pt2024(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  accuracy_score INTEGER DEFAULT 0,
  efficiency_score INTEGER DEFAULT 0,
  communication_score INTEGER DEFAULT 0,
  diagnostic_score INTEGER DEFAULT 0,
  completion_time INTEGER, -- in seconds
  cards_played INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user progress table
CREATE TABLE IF NOT EXISTS user_progress_pt2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  competency_scores JSONB NOT NULL DEFAULT '{}',
  performance_metrics JSONB NOT NULL DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create institution analytics table
CREATE TABLE IF NOT EXISTS institution_analytics_pt2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id TEXT NOT NULL,
  total_students INTEGER DEFAULT 0,
  total_games INTEGER DEFAULT 0,
  avg_performance JSONB NOT NULL DEFAULT '{}',
  usage_metrics JSONB NOT NULL DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(institution_id)
);

-- Enable Row Level Security
ALTER TABLE user_profiles_pt2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE games_pt2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_actions_pt2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_performance_pt2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress_pt2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_analytics_pt2024 ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON user_profiles_pt2024
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles_pt2024
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles_pt2024
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own games" ON games_pt2024
  FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Users can create games" ON games_pt2024
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own games" ON games_pt2024
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can view their own game actions" ON game_actions_pt2024
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create game actions" ON game_actions_pt2024
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own performance" ON game_performance_pt2024
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create performance records" ON game_performance_pt2024
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own progress" ON user_progress_pt2024
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_progress_pt2024
  FOR ALL USING (auth.uid() = user_id);

-- Faculty can view institution analytics
CREATE POLICY "Faculty can view institution analytics" ON institution_analytics_pt2024
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles_pt2024 
      WHERE user_id = auth.uid() 
      AND role IN ('faculty', 'admin')
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles_pt2024(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_institution ON user_profiles_pt2024(institution_id);
CREATE INDEX IF NOT EXISTS idx_games_creator_id ON games_pt2024(creator_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON games_pt2024(status);
CREATE INDEX IF NOT EXISTS idx_game_actions_game_id ON game_actions_pt2024(game_id);
CREATE INDEX IF NOT EXISTS idx_game_actions_user_id ON game_actions_pt2024(user_id);
CREATE INDEX IF NOT EXISTS idx_game_performance_user_id ON game_performance_pt2024(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress_pt2024(user_id);

-- Create functions for updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles_pt2024
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at 
  BEFORE UPDATE ON games_pt2024
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();