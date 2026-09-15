-- TafaTube v9 — Creator analytics & playlists
create table if not exists public.video_playlists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 180),
  description text not null default '',
  visibility text not null default 'public' check (visibility in ('public','private','unlisted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.video_playlist_items (
  playlist_id uuid not null references public.video_playlists(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  position integer not null default 0,
  added_at timestamptz not null default now(),
  primary key (playlist_id, video_id)
);

alter table public.video_playlists enable row level security;
alter table public.video_playlist_items enable row level security;

create policy "Public playlists are readable"
on public.video_playlists for select
using (visibility='public' or auth.uid()=owner_id);

create policy "Owners manage playlists"
on public.video_playlists for all
using (auth.uid()=owner_id)
with check (auth.uid()=owner_id);

create policy "Playlist items readable through playlist"
on public.video_playlist_items for select
using (
  exists (
    select 1 from public.video_playlists p
    where p.id=playlist_id
      and (p.visibility='public' or p.owner_id=auth.uid())
  )
);

create policy "Owners manage playlist items"
on public.video_playlist_items for all
using (
  exists (
    select 1 from public.video_playlists p
    where p.id=playlist_id and p.owner_id=auth.uid()
  )
)
with check (
  exists (
    select 1 from public.video_playlists p
    where p.id=playlist_id and p.owner_id=auth.uid()
  )
);

create index if not exists video_playlists_owner_idx
on public.video_playlists(owner_id);

create index if not exists video_playlist_items_video_idx
on public.video_playlist_items(video_id);

create or replace function public.get_creator_dashboard(p_owner_id uuid)
returns jsonb
language sql
security definer
set search_path=public
as $$
  select jsonb_build_object(
    'videos', (
      select count(*) from public.videos
      where owner_id=p_owner_id
    ),
    'views', (
      select coalesce(sum(views_count),0) from public.videos
      where owner_id=p_owner_id
    ),
    'likes', (
      select count(*) from public.video_likes l
      join public.videos v on v.id=l.video_id
      where v.owner_id=p_owner_id
    ),
    'comments', (
      select count(*) from public.video_comments c
      join public.videos v on v.id=c.video_id
      where v.owner_id=p_owner_id
    ),
    'shares', (
      select count(*) from public.video_shares s
      join public.videos v on v.id=s.video_id
      where v.owner_id=p_owner_id
    ),
    'subscribers', (
      select count(*) from public.channel_subscriptions
      where channel_id=p_owner_id
    ),
    'storage_bytes', (
      select coalesce(sum(file_size),0) from public.videos
      where owner_id=p_owner_id
    )
  );
$$;

grant execute on function public.get_creator_dashboard(uuid) to authenticated;
