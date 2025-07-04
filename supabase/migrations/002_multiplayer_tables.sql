-- Create game rooms table for multiplayer
CREATE TABLE IF NOT EXISTS game_rooms_pt2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games_pt2024(id) ON DELETE SET NULL,
  game_config JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'ready', 'in_progress', 'completed')),
  max_players INTEGER DEFAULT 2,
  current_players INTEGER DEFAULT 0,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create room participants table
CREATE TABLE IF NOT EXISTS room_participants_pt2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES game_rooms_pt2024(id) ON DELETE CASCADE,
  player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('pt_student', 'patient')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, player_id)
);

-- Create faculty assessments table
CREATE TABLE IF NOT EXISTS faculty_assessments_pt2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  competencies_assessed JSONB NOT NULL DEFAULT '[]',
  cases_included JSONB NOT NULL DEFAULT '[]',
  scoring_rubric JSONB NOT NULL DEFAULT '{}',
  time_limit INTEGER, -- in minutes
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create curriculum integrations table
CREATE TABLE IF NOT EXISTS curriculum_integrations_pt2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_code TEXT NOT NULL,
  learning_objectives JSONB NOT NULL DEFAULT '[]',
  assessment_mapping JSONB NOT NULL DEFAULT '{}',
  game_assignments JSONB NOT NULL DEFAULT '[]',
  grading_rubric JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student engagement tracking table
CREATE TABLE IF NOT EXISTS student_engagement_pt2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id TEXT NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL,
  session_end TIMESTAMP WITH TIME ZONE,
  actions_taken INTEGER DEFAULT 0,
  games_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for new tables
ALTER TABLE game_rooms_pt2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants_pt2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_assessments_pt2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_integrations_pt2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_engagement_pt2024 ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for game rooms
CREATE POLICY "Users can view public game rooms" ON game_rooms_pt2024
  FOR SELECT USING (NOT is_private OR host_id = auth.uid());

CREATE POLICY "Users can create game rooms" ON game_rooms_pt2024
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update their rooms" ON game_rooms_pt2024
  FOR UPDATE USING (auth.uid() = host_id);

-- Create RLS policies for room participants
CREATE POLICY "Users can view room participants" ON room_participants_pt2024
  FOR SELECT USING (
    player_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM game_rooms_pt2024 WHERE id = room_id AND host_id = auth.uid())
  );

CREATE POLICY "Users can join rooms" ON room_participants_pt2024
  FOR INSERT WITH CHECK (auth.uid() = player_id);

-- Create RLS policies for faculty assessments
CREATE POLICY "Faculty can manage their assessments" ON faculty_assessments_pt2024
  FOR ALL USING (auth.uid() = faculty_id);

CREATE POLICY "Students can view active assessments" ON faculty_assessments_pt2024
  FOR SELECT USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM user_profiles_pt2024 up1, user_profiles_pt2024 up2
      WHERE up1.user_id = auth.uid() 
      AND up2.user_id = faculty_id
      AND up1.institution_id = up2.institution_id
    )
  );

-- Create RLS policies for curriculum integrations
CREATE POLICY "Faculty can manage curriculum integrations" ON curriculum_integrations_pt2024
  FOR ALL USING (auth.uid() = faculty_id);

-- Create RLS policies for student engagement
CREATE POLICY "Users can view their own engagement data" ON student_engagement_pt2024
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own engagement data" ON student_engagement_pt2024
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Faculty can view institution engagement" ON student_engagement_pt2024
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles_pt2024 
      WHERE user_id = auth.uid() 
      AND role IN ('faculty', 'admin')
      AND institution_id = student_engagement_pt2024.institution_id
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_rooms_status ON game_rooms_pt2024(status);
CREATE INDEX IF NOT EXISTS idx_game_rooms_host ON game_rooms_pt2024(host_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_room ON room_participants_pt2024(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_player ON room_participants_pt2024(player_id);
CREATE INDEX IF NOT EXISTS idx_faculty_assessments_faculty ON faculty_assessments_pt2024(faculty_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_integrations_faculty ON curriculum_integrations_pt2024(faculty_id);
CREATE INDEX IF NOT EXISTS idx_student_engagement_user ON student_engagement_pt2024(user_id);
CREATE INDEX IF NOT EXISTS idx_student_engagement_institution ON student_engagement_pt2024(institution_id);

-- Create triggers for updated_at
CREATE TRIGGER update_game_rooms_updated_at 
  BEFORE UPDATE ON game_rooms_pt2024
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faculty_assessments_updated_at 
  BEFORE UPDATE ON faculty_assessments_pt2024
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curriculum_integrations_updated_at 
  BEFORE UPDATE ON curriculum_integrations_pt2024
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();