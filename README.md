# TafaTube v6 — Notifications Realtime

## Added
- Real `notifications` table
- RLS: users only read/update/delete their own notifications
- Automatic DB triggers for:
  - Likes
  - Comments
  - Subscriptions
- Realtime INSERT delivery
- Unread counter
- Mark one / mark all as read
- Instant notification sound while the web app is open
- Notification center UI

## Setup
1. Keep v1-v5.
2. Add `src/notifications.ts`.
3. Add `src/components/NotificationsPanel.tsx`.
4. Run `supabase/005_notifications_realtime.sql`.
5. Open the panel from your notification/bell button.

## Important
Browser/app-closed push notifications are a separate step. This v6 provides realtime + sound while the web app is active. True background push needs a Web Push/Service Worker setup and notification permission; that will be handled in a later step.
