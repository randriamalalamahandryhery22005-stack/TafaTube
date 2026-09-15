# TafaTube v2 — Video Foundation

## Installation
npm install
npm run dev

## Supabase
1. Copy `.env.example` to `.env`
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Run `supabase/001_videos.sql`
4. Create a Storage bucket named `videos`

The upload screen is included as the first UI foundation. Real upload persistence requires wiring the selected file to Supabase Storage and inserting the row into `public.videos`.
