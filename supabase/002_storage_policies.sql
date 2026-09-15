-- TafaTube v3: Storage policies for the videos bucket.
-- Create a PUBLIC bucket named `videos` in Supabase Storage first.

insert into storage.buckets (id, name, public)
values ('videos', 'videos', true)
on conflict (id) do update set public = true;

create policy "TafaTube public video files are readable"
on storage.objects for select
using (bucket_id = 'videos');

create policy "Authenticated users upload only to their own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'videos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Users can update their own video files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'videos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Users can delete their own video files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'videos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
