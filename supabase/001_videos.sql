-- TafaTube v2: video foundation
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  description text default '',
  category text default 'Général',
  tags text[] default '{}',
  storage_path text not null,
  thumbnail_path text,
  mime_type text not null,
  file_size bigint,
  visibility text not null default 'public' check (visibility in ('public','private','unlisted')),
  views_count bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.videos enable row level security;

create policy "Public videos are readable"
on public.videos for select
using (visibility = 'public' or auth.uid() = owner_id);

create policy "Users can insert their own videos"
on public.videos for insert
with check (auth.uid() = owner_id);

create policy "Users can update their own videos"
on public.videos for update
using (auth.uid() = owner_id);

create policy "Users can delete their own videos"
on public.videos for delete
using (auth.uid() = owner_id);

-- Create a Storage bucket named: videos
-- Recommended Storage policies should restrict uploads to the authenticated owner.
