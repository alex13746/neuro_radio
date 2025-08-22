-- Create likes table
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, track_id)
);

-- Enable RLS
alter table public.likes enable row level security;

-- Create policies for likes
create policy "likes_select_own"
  on public.likes for select
  using (auth.uid() = user_id);

create policy "likes_insert_own"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "likes_delete_own"
  on public.likes for delete
  using (auth.uid() = user_id);

-- Create listening history table
create table if not exists public.listening_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete cascade,
  listened_at timestamp with time zone default timezone('utc'::text, now()) not null,
  duration_played integer, -- how long the user listened in seconds
  completed boolean default false -- whether the track was played to completion
);

-- Enable RLS
alter table public.listening_history enable row level security;

-- Create policies for listening history
create policy "history_select_own"
  on public.listening_history for select
  using (auth.uid() = user_id);

create policy "history_insert_own"
  on public.listening_history for insert
  with check (auth.uid() = user_id);

-- Create playlists table
create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  is_public boolean default false,
  cover_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.playlists enable row level security;

-- Create policies for playlists
create policy "playlists_select_own_or_public"
  on public.playlists for select
  using (auth.uid() = user_id or is_public = true);

create policy "playlists_insert_own"
  on public.playlists for insert
  with check (auth.uid() = user_id);

create policy "playlists_update_own"
  on public.playlists for update
  using (auth.uid() = user_id);

create policy "playlists_delete_own"
  on public.playlists for delete
  using (auth.uid() = user_id);

-- Create playlist tracks junction table
create table if not exists public.playlist_tracks (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete cascade,
  position integer not null,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(playlist_id, track_id)
);

-- Enable RLS
alter table public.playlist_tracks enable row level security;

-- Create policies for playlist tracks
create policy "playlist_tracks_select_via_playlist"
  on public.playlist_tracks for select
  using (
    exists (
      select 1 from public.playlists p 
      where p.id = playlist_id 
      and (p.user_id = auth.uid() or p.is_public = true)
    )
  );

create policy "playlist_tracks_insert_own_playlist"
  on public.playlist_tracks for insert
  with check (
    exists (
      select 1 from public.playlists p 
      where p.id = playlist_id 
      and p.user_id = auth.uid()
    )
  );

create policy "playlist_tracks_delete_own_playlist"
  on public.playlist_tracks for delete
  using (
    exists (
      select 1 from public.playlists p 
      where p.id = playlist_id 
      and p.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
create index if not exists likes_user_id_idx on public.likes(user_id);
create index if not exists likes_track_id_idx on public.likes(track_id);
create index if not exists history_user_id_idx on public.listening_history(user_id);
create index if not exists history_listened_at_idx on public.listening_history(listened_at desc);
create index if not exists playlist_tracks_playlist_id_idx on public.playlist_tracks(playlist_id);
create index if not exists playlist_tracks_position_idx on public.playlist_tracks(playlist_id, position);
