# TafaTube v4 — Profile + Creator Studio

This package adds the real profile system and creator dashboard on top of v3.

## Included
- `profiles` table linked to Supabase Auth
- automatic profile creation trigger
- profile RLS
- real profile loading/updating
- avatar upload to `avatars` bucket
- Creator Studio
- My Videos list
- edit title/description/category/visibility
- delete video + storage file
- view counter RPC
- dashboard statistics
- owner-only management policies

## Setup
1. Keep the v3 project as the base.
2. Replace/add the files from this ZIP.
3. Run `supabase/003_profiles_creator_studio.sql` in Supabase SQL Editor.
4. Refresh the app.

### Important
The SQL creates the `profiles` table and an `avatars` storage bucket. It does not remove existing tables.
