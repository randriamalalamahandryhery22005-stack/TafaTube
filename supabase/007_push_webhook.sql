-- TafaTube v8
-- Optional hardening/helpers for the push pipeline.
-- The actual HTTP webhook is configured in Supabase Dashboard:
-- Database -> Webhooks -> public.notifications -> INSERT
-- -> POST /functions/v1/send-push

-- Useful index for fast recipient subscription lookup.
create index if not exists push_subscriptions_user_id_idx
on public.push_subscriptions(user_id);

-- Keep the updated_at timestamp current when a browser refreshes
-- an existing push subscription.
create or replace function public.touch_push_subscription()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_push_subscription
on public.push_subscriptions;

create trigger trg_touch_push_subscription
before update on public.push_subscriptions
for each row
execute function public.touch_push_subscription();
