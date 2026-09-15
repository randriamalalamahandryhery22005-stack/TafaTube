# TafaTube v3 — Real Video System

## Setup
1. `npm install`
2. Copy `.env.example` to `.env`
3. Add Supabase URL + anon key.
4. Run `supabase/001_videos.sql`
5. Run `supabase/002_storage_policies.sql`
6. `npm run dev`

## Included
- Real video upload to Supabase Storage (`videos` bucket)
- Video metadata stored in `public.videos`
- Public video feed
- Video player modal
- Download button
- Authenticated owner folder policies
- Only video MIME types accepted by the UI
