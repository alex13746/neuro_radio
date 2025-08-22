-- Simple tracks table creation script
CREATE TABLE IF NOT EXISTS public.tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  genre TEXT DEFAULT 'Lo-Fi',
  duration INTEGER DEFAULT 180,
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  ai_generated BOOLEAN DEFAULT false,
  play_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY IF NOT EXISTS "tracks_select_all"
  ON public.tracks FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY IF NOT EXISTS "tracks_insert_all"
  ON public.tracks FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);
