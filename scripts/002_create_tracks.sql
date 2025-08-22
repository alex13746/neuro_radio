-- Create tracks table for storing music metadata
create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  album text,
  genre text,
  duration integer, -- duration in seconds
  audio_url text not null, -- Vercel Blob URL for audio file
  cover_url text, -- Vercel Blob URL for album art
  ai_generated boolean default false,
  ai_prompt text, -- original prompt used for AI generation
  ai_model text, -- AI model used (suno, replicate, etc.)
  bpm integer,
  key text,
  mood text,
  tags text[], -- array of tags
  play_count integer default 0,
  like_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.tracks enable row level security;

-- Create policies for tracks (public read, admin write)
create policy "tracks_select_all"
  on public.tracks for select
  to authenticated, anon
  using (true);

-- For now, allow authenticated users to insert tracks (later restrict to admin)
create policy "tracks_insert_authenticated"
  on public.tracks for insert
  to authenticated
  with check (true);

create policy "tracks_update_authenticated"
  on public.tracks for update
  to authenticated
  using (true);

-- Create indexes for better performance
create index if not exists tracks_genre_idx on public.tracks(genre);
create index if not exists tracks_mood_idx on public.tracks(mood);
create index if not exists tracks_ai_generated_idx on public.tracks(ai_generated);
create index if not exists tracks_created_at_idx on public.tracks(created_at desc);
