-- Function to update track play count
create or replace function public.increment_play_count(track_uuid uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.tracks 
  set play_count = play_count + 1,
      updated_at = timezone('utc'::text, now())
  where id = track_uuid;
end;
$$;

-- Function to update track like count
create or replace function public.update_like_count()
returns trigger
language plpgsql
security definer
as $$
begin
  if TG_OP = 'INSERT' then
    update public.tracks 
    set like_count = like_count + 1,
        updated_at = timezone('utc'::text, now())
    where id = NEW.track_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.tracks 
    set like_count = like_count - 1,
        updated_at = timezone('utc'::text, now())
    where id = OLD.track_id;
    return OLD;
  end if;
  return null;
end;
$$;

-- Create triggers for like count updates
drop trigger if exists update_track_like_count on public.likes;
create trigger update_track_like_count
  after insert or delete on public.likes
  for each row
  execute function public.update_like_count();

-- Function to get user's listening stats
create or replace function public.get_user_stats(user_uuid uuid)
returns json
language plpgsql
security definer
as $$
declare
  result json;
begin
  select json_build_object(
    'total_listening_time', coalesce(sum(duration_played), 0),
    'tracks_played', count(distinct track_id),
    'total_sessions', count(*),
    'favorite_genre', (
      select t.genre
      from public.listening_history lh
      join public.tracks t on t.id = lh.track_id
      where lh.user_id = user_uuid and t.genre is not null
      group by t.genre
      order by count(*) desc
      limit 1
    )
  ) into result
  from public.listening_history
  where user_id = user_uuid;
  
  return result;
end;
$$;
