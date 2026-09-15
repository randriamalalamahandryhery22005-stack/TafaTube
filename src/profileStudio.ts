import { supabase } from './supabase'

export type Profile = {
  id: string
  username: string | null
  display_name: string
  bio: string
  avatar_path: string | null
}

export async function getCurrentProfile() {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase.from('profiles')
    .select('id,username,display_name,bio,avatar_path')
    .eq('id', user.id)
    .maybeSingle()

  return data as Profile | null
}

export async function saveProfile(input: Pick<Profile, 'display_name'|'username'|'bio'>) {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be signed in')

  const username = input.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
  const { data, error } = await supabase.from('profiles').upsert({
    id: user.id,
    display_name: input.display_name.trim() || 'TafaTube Creator',
    username: username || null,
    bio: input.bio.trim(),
    updated_at: new Date().toISOString()
  }).select().single()

  if (error) throw error
  return data as Profile
}

export async function uploadAvatar(file: File) {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be signed in')
  if (!file.type.startsWith('image/')) throw new Error('Avatar must be an image')
  if (file.size > 5 * 1024 * 1024) throw new Error('Avatar maximum is 5 MB')

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, {
    contentType: file.type,
    upsert: false
  })
  if (uploadError) throw uploadError

  const { error } = await supabase.from('profiles')
    .update({ avatar_path: path, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) throw error
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
}

export async function getCreatorStats() {
  if (!supabase) return { videos: 0, views: 0, totalBytes: 0 }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { videos: 0, views: 0, totalBytes: 0 }

  const { data, error } = await supabase.from('videos')
    .select('id,views_count,file_size')
    .eq('owner_id', user.id)

  if (error) throw error
  return {
    videos: data?.length || 0,
    views: (data || []).reduce((sum, v) => sum + Number(v.views_count || 0), 0),
    totalBytes: (data || []).reduce((sum, v) => sum + Number(v.file_size || 0), 0)
  }
}

export async function updateVideo(videoId: string, patch: {title:string; description:string; category:string; visibility:'public'|'private'|'unlisted'}) {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be signed in')

  const { error } = await supabase.from('videos').update({
    ...patch,
    updated_at: new Date().toISOString()
  }).eq('id', videoId).eq('owner_id', user.id)

  if (error) throw error
}

export async function deleteVideo(videoId: string, storagePath: string) {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be signed in')

  const { error: dbError } = await supabase.from('videos')
    .delete().eq('id', videoId).eq('owner_id', user.id)
  if (dbError) throw dbError

  const { error: storageError } = await supabase.storage.from('videos').remove([storagePath])
  if (storageError) console.warn('Video deleted from database but storage cleanup failed', storageError)
}
