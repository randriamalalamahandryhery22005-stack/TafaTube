# TafaTube v8 — Background Push Server

Dingana 8 adds the server-side part of the Web Push system.

## Files

- `supabase/functions/send-push/index.ts`
  - receives a notification webhook
  - loads recipient push subscriptions
  - encrypts/sends Web Push
  - removes stale 404/410 subscriptions
- `supabase/functions/send-push/README.md`
  - deployment + webhook setup
- `supabase/007_push_webhook.sql`
  - subscription index + timestamp trigger
- `.env.push.example`
  - documents public vs private VAPID configuration

## Important

This ZIP is an incremental patch. It does not replace the previous TafaTube project.

Apply it on top of **TafaTube v7**.

Background push only works after the Supabase Edge Function, secrets, Database Webhook and frontend VAPID public key are configured.
