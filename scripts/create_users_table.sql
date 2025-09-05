-- Create users table for authentication
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create verification_codes table for email verification
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (true);

-- Create policies for verification_codes table  
CREATE POLICY "Anyone can insert verification codes" ON public.verification_codes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read verification codes" ON public.verification_codes
  FOR SELECT USING (true);
