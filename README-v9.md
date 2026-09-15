# TafaTube v9 — Creator Dashboard

Incremental patch for v8.

Adds:
- Creator analytics RPC
- total videos/views/likes/comments/shares/subscribers
- storage usage
- playlists + playlist items with RLS
- Creator Studio dashboard component

## Apply SQL

Run:

`supabase/008_creator_analytics.sql`

## Frontend

Add `CreatorDashboardV9` to the authenticated Creator Studio route and pass:

`userId={session.user.id}`

The existing upload/video logic is not replaced by this patch.
