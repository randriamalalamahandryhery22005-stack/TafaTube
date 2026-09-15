# TafaTube v7 — PWA + Background Push Foundation

Added:
- PWA manifest
- Service Worker
- Background push handler
- Notification click/focus
- Push subscription table + RLS
- UI to request permission and register a browser push subscription

Setup:
1. Keep v1-v6.
2. Add these files.
3. Run `supabase/006_push_subscriptions.sql`.
4. Add `PushSettings` to Settings.
5. Call `registerTafaTubePWA()` once in `src/main.tsx`.
6. Configure `VITE_VAPID_PUBLIC_KEY`.

IMPORTANT:
This is the client/storage foundation. A server-side Supabase Edge Function is still required to send encrypted Web Push messages. Never expose the VAPID private key in frontend code. The next stage should add the Edge Function that reads `push_subscriptions` and sends pushes when `notifications` receives a new row.

Also add real `icon-192.png` and `icon-512.png` to `public/`.
