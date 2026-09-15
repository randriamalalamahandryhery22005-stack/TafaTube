create table if not exists public.push_subscriptions(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 endpoint text not null,p256dh text,auth text,user_agent text,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 unique(user_id,endpoint)
);
alter table public.push_subscriptions enable row level security;
drop policy if exists "Users read own push subscriptions" on public.push_subscriptions;
create policy "Users read own push subscriptions" on public.push_subscriptions for select to authenticated using(auth.uid()=user_id);
drop policy if exists "Users create own push subscriptions" on public.push_subscriptions;
create policy "Users create own push subscriptions" on public.push_subscriptions for insert to authenticated with check(auth.uid()=user_id);
drop policy if exists "Users update own push subscriptions" on public.push_subscriptions;
create policy "Users update own push subscriptions" on public.push_subscriptions for update to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists "Users delete own push subscriptions" on public.push_subscriptions;
create policy "Users delete own push subscriptions" on public.push_subscriptions for delete to authenticated using(auth.uid()=user_id);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions(user_id);