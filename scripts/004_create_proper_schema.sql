-- Create profiles table that extends Supabase auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT,
  email TEXT,
  plan_type TEXT CHECK (plan_type IN ('whisper', 'heartbeat', 'legacy')),
  cards_remaining INTEGER DEFAULT 0,
  cards_last_reset DATE,
  stripe_customer_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create hearts table
CREATE TABLE IF NOT EXISTS hearts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  relationship TEXT,
  email TEXT,
  address JSONB,
  occasions TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hearts ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS policies for hearts
CREATE POLICY "Users can read own hearts" ON hearts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hearts" ON hearts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hearts" ON hearts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hearts" ON hearts
  FOR DELETE USING (auth.uid() = user_id);
