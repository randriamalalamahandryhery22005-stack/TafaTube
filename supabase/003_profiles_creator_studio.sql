-- TafaTube v4: profiles + creator studio
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text not null default 'TafaTube Creator',
  bio text not null default '',
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable"
on public.profiles for select
using (true);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles for insert to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    nullif(regexp_replace(lower(coalesce(new.email,'')), '[^a-z0-9_]+', '_', 'g'), ''),
    coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email,''),'@',1), 'TafaTube Creator')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_tafayoutube on auth.users;
create trigger on_auth_user_created_tafayoutube
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into storage.buckets (id, name, public)
values ('avatars','avatars',true)
on conflict (id) do update set public=true;

drop policy if exists "TafaTube avatars public read" on storage.objects;
create policy "TafaTube avatars public read"
on storage.objects for select
using (bucket_id='avatars');

drop policy if exists "TafaTube users upload own avatar" on storage.objects;
create policy "TafaTube users upload own avatar"
on storage.objects for insert to authenticated
with check (
  bucket_id='avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "TafaTube users update own avatar" on storage.objects;
create policy "TafaTube users update own avatar"
on storage.objects for update to authenticated
using (
  bucket_id='avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "TafaTube users delete own avatar" on storage.objects;
create policy "TafaTube users delete own avatar"
on storage.objects for delete to authenticated
using (
  bucket_id='avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- Atomic view counter.
create or replace function public.increment_video_view(video_id uuid)
returns bigint
language sql
security definer
set search_path = public
as $$
  update public.videos
  set views_count = views_count + 1,
      updated_at = now()
  where id = video_id
  returning views_count;
$$;

grant execute on function public.increment_video_view(uuid) to anon, authenticated;

-- Helpful indexes for creator queries.
create index if not exists videos_owner_created_idx
on public.videos(owner_id, created_at desc);

create index if not exists videos_visibility_created_idx
on public.videos(visibility, created_at desc);
