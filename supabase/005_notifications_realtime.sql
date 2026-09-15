-- TafaTube v6 — Realtime notifications
-- Run after 004_engagement_realtime.sql

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  type text not null check (type in ('like','comment','share','subscribe','system')),
  video_id uuid references public.videos(id) on delete cascade,
  comment_id uuid references public.video_comments(id) on delete cascade,
  title text not null,
  body text not null default '',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

drop policy if exists "Users read own notifications" on public.notifications;
create policy "Users read own notifications"
on public.notifications for select to authenticated
using (auth.uid()=recipient_id);

drop policy if exists "Users update own notifications" on public.notifications;
create policy "Users update own notifications"
on public.notifications for update to authenticated
using (auth.uid()=recipient_id)
with check (auth.uid()=recipient_id);

drop policy if exists "Users delete own notifications" on public.notifications;
create policy "Users delete own notifications"
on public.notifications for delete to authenticated
using (auth.uid()=recipient_id);

create index if not exists notifications_recipient_created_idx
on public.notifications(recipient_id,created_at desc);

create index if not exists notifications_unread_idx
on public.notifications(recipient_id,is_read,created_at desc);

-- Prevent duplicate notification for the same actor/action/video/comment.
create unique index if not exists notifications_like_unique
on public.notifications(recipient_id,actor_id,video_id,type)
where type='like';

create unique index if not exists notifications_subscribe_unique
on public.notifications(recipient_id,actor_id,type)
where type='subscribe';

create unique index if not exists notifications_comment_unique
on public.notifications(recipient_id,actor_id,video_id,comment_id,type)
where type='comment';

-- Helper creates a notification only when actor differs from recipient.
create or replace function public.create_notification(
  p_recipient uuid,
  p_actor uuid,
  p_type text,
  p_video uuid default null,
  p_comment uuid default null,
  p_title text default '',
  p_body text default ''
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare n uuid;
begin
  if p_recipient is null or p_actor is null or p_recipient=p_actor then
    return null;
  end if;

  insert into public.notifications
    (recipient_id,actor_id,type,video_id,comment_id,title,body)
  values
    (p_recipient,p_actor,p_type,p_video,p_comment,p_title,p_body)
  on conflict do nothing
  returning id into n;

  return n;
end;
$$;

grant execute on function public.create_notification(uuid,uuid,text,uuid,uuid,text,text)
to authenticated;

-- LIKE trigger: notify video owner.
create or replace function public.notify_video_like()
returns trigger
language plpgsql
security definer set search_path=public
as $$
declare owner_id uuid; n uuid;
begin
  select v.owner_id into owner_id from public.videos v where v.id=new.video_id;
  select public.create_notification(
    owner_id,new.user_id,'like',new.video_id,null,
    'Nouvelle mention J’aime',
    'Quelqu’un a aimé votre vidéo.'
  ) into n;
  return new;
end;
$$;

drop trigger if exists trg_notify_video_like on public.video_likes;
create trigger trg_notify_video_like
after insert on public.video_likes
for each row execute function public.notify_video_like();

-- COMMENT trigger: notify video owner.
create or replace function public.notify_video_comment()
returns trigger
language plpgsql
security definer set search_path=public
as $$
declare owner_id uuid; n uuid;
begin
  select v.owner_id into owner_id from public.videos v where v.id=new.video_id;
  select public.create_notification(
    owner_id,new.user_id,'comment',new.video_id,new.id,
    'Nouveau commentaire',
    left(new.content,140)
  ) into n;
  return new;
end;
$$;

drop trigger if exists trg_notify_video_comment on public.video_comments;
create trigger trg_notify_video_comment
after insert on public.video_comments
for each row execute function public.notify_video_comment();

-- SUBSCRIBE trigger: notify creator.
create or replace function public.notify_subscription()
returns trigger
language plpgsql
security definer set search_path=public
as $$
declare n uuid;
begin
  select public.create_notification(
    new.channel_id,new.subscriber_id,'subscribe',null,null,
    'Nouvel abonné',
    'Quelqu’un vient de s’abonner à votre chaîne.'
  ) into n;
  return new;
end;
$$;

drop trigger if exists trg_notify_subscription on public.channel_subscriptions;
create trigger trg_notify_subscription
after insert on public.channel_subscriptions
for each row execute function public.notify_subscription();

-- Realtime.
do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null; end $$;

-- Atomic mark-all-read.
create or replace function public.mark_all_notifications_read()
returns void
language sql
security definer set search_path=public
as $$
  update public.notifications
  set is_read=true
  where recipient_id=auth.uid() and is_read=false;
$$;

grant execute on function public.mark_all_notifications_read() to authenticated;
