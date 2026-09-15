-- TafaTube v5: Likes, Comments, Shares, Subscriptions + Realtime
-- Run after 001_videos.sql and 003_profiles_creator_studio.sql.

create table if not exists public.video_likes (
  video_id uuid not null references public.videos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (video_id,user_id)
);

create table if not exists public.video_comments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(trim(content)) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.video_shares (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.channel_subscriptions (
  channel_id uuid not null references auth.users(id) on delete cascade,
  subscriber_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (channel_id,subscriber_id),
  check (channel_id <> subscriber_id)
);

create index if not exists video_comments_video_created_idx
on public.video_comments(video_id,created_at desc);

create index if not exists video_likes_video_idx
on public.video_likes(video_id);

create index if not exists video_shares_video_idx
on public.video_shares(video_id);

create index if not exists subscriptions_channel_idx
on public.channel_subscriptions(channel_id);

create index if not exists subscriptions_subscriber_idx
on public.channel_subscriptions(subscriber_id);

alter table public.video_likes enable row level security;
alter table public.video_comments enable row level security;
alter table public.video_shares enable row level security;
alter table public.channel_subscriptions enable row level security;

drop policy if exists "Anyone can read video likes" on public.video_likes;
create policy "Anyone can read video likes" on public.video_likes
for select using (true);

drop policy if exists "Users can like as themselves" on public.video_likes;
create policy "Users can like as themselves" on public.video_likes
for insert to authenticated with check (auth.uid()=user_id);

drop policy if exists "Users can unlike as themselves" on public.video_likes;
create policy "Users can unlike as themselves" on public.video_likes
for delete to authenticated using (auth.uid()=user_id);

drop policy if exists "Anyone can read comments" on public.video_comments;
create policy "Anyone can read comments" on public.video_comments
for select using (true);

drop policy if exists "Users can create own comments" on public.video_comments;
create policy "Users can create own comments" on public.video_comments
for insert to authenticated with check (auth.uid()=user_id);

drop policy if exists "Users can edit own comments" on public.video_comments;
create policy "Users can edit own comments" on public.video_comments
for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);

drop policy if exists "Users can delete own comments" on public.video_comments;
create policy "Users can delete own comments" on public.video_comments
for delete to authenticated using (auth.uid()=user_id);

drop policy if exists "Shares are publicly readable" on public.video_shares;
create policy "Shares are publicly readable" on public.video_shares
for select using (true);

drop policy if exists "Authenticated users can create shares" on public.video_shares;
create policy "Authenticated users can create shares" on public.video_shares
for insert to authenticated with check (auth.uid()=user_id);

drop policy if exists "Anyone can read subscriptions" on public.channel_subscriptions;
create policy "Anyone can read subscriptions" on public.channel_subscriptions
for select using (true);

drop policy if exists "Users can subscribe as themselves" on public.channel_subscriptions;
create policy "Users can subscribe as themselves" on public.channel_subscriptions
for insert to authenticated with check (auth.uid()=subscriber_id);

drop policy if exists "Users can unsubscribe as themselves" on public.channel_subscriptions;
create policy "Users can unsubscribe as themselves" on public.channel_subscriptions
for delete to authenticated using (auth.uid()=subscriber_id);

-- Safe counters. Counts are derived from source tables, avoiding client-side counter races.
create or replace function public.get_video_engagement(p_video_id uuid)
returns table(likes bigint, comments bigint, shares bigint)
language sql
security definer set search_path=public
as $$
  select
    (select count(*) from public.video_likes where video_id=p_video_id),
    (select count(*) from public.video_comments where video_id=p_video_id),
    (select count(*) from public.video_shares where video_id=p_video_id);
$$;

create or replace function public.get_channel_subscriber_count(p_channel_id uuid)
returns bigint
language sql
security definer set search_path=public
as $$
  select count(*) from public.channel_subscriptions where channel_id=p_channel_id;
$$;

grant execute on function public.get_video_engagement(uuid) to anon, authenticated;
grant execute on function public.get_channel_subscriber_count(uuid) to anon, authenticated;

-- Realtime publication: safe if already present.
do $$
begin
  alter publication supabase_realtime add table public.video_likes;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.video_comments;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.video_shares;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.channel_subscriptions;
exception when duplicate_object then null;
end $$;
