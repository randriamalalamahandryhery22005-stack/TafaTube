# TafaTube v5 — Engagement + Realtime

## Real features
- Likes/unlikes
- Comments CRUD foundations
- Share tracking + copy link
- Subscribe/unsubscribe to creators
- Live Realtime refresh for likes/comments/shares/subscriptions
- RLS for all engagement tables
- Atomic/derived engagement counts via RPC

## Install
1. Keep v1-v4 as the base.
2. Add `src/engagement.ts`.
3. Add `src/components/EngagementPanel.tsx`.
4. Run `supabase/004_engagement_realtime.sql`.
5. Import `EngagementPanel` into the video player/detail view:
   `<EngagementPanel videoId={video.id} channelId={video.owner_id} />`

## Realtime
The SQL adds the four tables to `supabase_realtime`. The component subscribes only to the current video's events and the current creator's subscription events.

## Security
A user can only create/delete their own like/subscription/share/comment. Public reading is enabled for engagement data. Database policies remain the authority; client-side checks are only UX.
