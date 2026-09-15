import { supabase } from './supabase'

export async function getEngagement(videoId:string) {
  if (!supabase) return {likes:0,comments:0,shares:0}
  const {data,error}=await supabase.rpc('get_video_engagement',{p_video_id:videoId})
  if(error) throw error
  const row=Array.isArray(data)?data[0]:data
  return {
    likes:Number(row?.likes||0),
    comments:Number(row?.comments||0),
    shares:Number(row?.shares||0)
  }
}

export async function hasLiked(videoId:string) {
  if(!supabase) return false
  const {data:{user}}=await supabase.auth.getUser()
  if(!user) return false
  const {data,error}=await supabase.from('video_likes')
    .select('video_id').eq('video_id',videoId).eq('user_id',user.id).maybeSingle()
  if(error) throw error
  return !!data
}

export async function toggleLike(videoId:string) {
  if(!supabase) throw new Error('Supabase is not configured')
  const {data:{user}}=await supabase.auth.getUser()
  if(!user) throw new Error('Connectez-vous pour aimer une vidéo.')
  const liked=await hasLiked(videoId)
  if(liked) {
    const {error}=await supabase.from('video_likes').delete()
      .eq('video_id',videoId).eq('user_id',user.id)
    if(error) throw error
    return false
  }
  const {error}=await supabase.from('video_likes').insert({video_id:videoId,user_id:user.id})
  if(error) throw error
  return true
}

export async function addComment(videoId:string,content:string) {
  if(!supabase) throw new Error('Supabase is not configured')
  const {data:{user}}=await supabase.auth.getUser()
  if(!user) throw new Error('Connectez-vous pour commenter.')
  const text=content.trim()
  if(!text) throw new Error('Le commentaire est vide.')
  const {data,error}=await supabase.from('video_comments')
    .insert({video_id:videoId,user_id:user.id,content:text})
    .select('id,video_id,user_id,content,created_at,updated_at').single()
  if(error) throw error
  return data
}

export async function listComments(videoId:string) {
  if(!supabase) return []
  const {data,error}=await supabase.from('video_comments')
    .select('id,video_id,user_id,content,created_at,updated_at')
    .eq('video_id',videoId).order('created_at',{ascending:false}).limit(100)
  if(error) throw error
  return data||[]
}

export async function shareVideo(videoId:string) {
  if(!supabase) throw new Error('Supabase is not configured')
  const {data:{user}}=await supabase.auth.getUser()
  const {error}=await supabase.from('video_shares').insert({
    video_id:videoId,user_id:user?.id||null
  })
  if(error) throw error
  return true
}

export async function isSubscribed(channelId:string) {
  if(!supabase) return false
  const {data:{user}}=await supabase.auth.getUser()
  if(!user || user.id===channelId) return false
  const {data,error}=await supabase.from('channel_subscriptions')
    .select('channel_id').eq('channel_id',channelId).eq('subscriber_id',user.id).maybeSingle()
  if(error) throw error
  return !!data
}

export async function toggleSubscription(channelId:string) {
  if(!supabase) throw new Error('Supabase is not configured')
  const {data:{user}}=await supabase.auth.getUser()
  if(!user) throw new Error('Connectez-vous pour vous abonner.')
  if(user.id===channelId) throw new Error('Vous ne pouvez pas vous abonner à votre propre chaîne.')
  const active=await isSubscribed(channelId)
  if(active) {
    const {error}=await supabase.from('channel_subscriptions').delete()
      .eq('channel_id',channelId).eq('subscriber_id',user.id)
    if(error) throw error
    return false
  }
  const {error}=await supabase.from('channel_subscriptions').insert({
    channel_id:channelId,subscriber_id:user.id
  })
  if(error) throw error
  return true
}

export function engagementChannel(videoId:string, onChange:()=>void) {
  if(!supabase) return ()=>{}
  const channel=supabase.channel(`video-engagement-${videoId}`)
    .on('postgres_changes',{event:'*',schema:'public',table:'video_likes',filter:`video_id=eq.${videoId}`},onChange)
    .on('postgres_changes',{event:'*',schema:'public',table:'video_comments',filter:`video_id=eq.${videoId}`},onChange)
    .on('postgres_changes',{event:'*',schema:'public',table:'video_shares',filter:`video_id=eq.${videoId}`},onChange)
    .subscribe()
  return ()=>{ supabase.removeChannel(channel) }
}

export function subscriptionChannel(channelId:string,onChange:()=>void) {
  if(!supabase) return ()=>{}
  const channel=supabase.channel(`creator-subscriptions-${channelId}`)
    .on('postgres_changes',{event:'*',schema:'public',table:'channel_subscriptions',filter:`channel_id=eq.${channelId}`},onChange)
    .subscribe()
  return ()=>{ supabase.removeChannel(channel) }
}
