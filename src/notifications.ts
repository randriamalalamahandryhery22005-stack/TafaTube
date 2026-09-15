import { supabase } from './supabase'

export type Notification = {
  id:string
  recipient_id:string
  actor_id:string|null
  type:'like'|'comment'|'share'|'subscribe'|'system'
  video_id:string|null
  comment_id:string|null
  title:string
  body:string
  is_read:boolean
  created_at:string
}

export async function listNotifications(limit=60){
  if(!supabase) return []
  const {data:{user}}=await supabase.auth.getUser()
  if(!user) return []
  const {data,error}=await supabase.from('notifications')
    .select('*').eq('recipient_id',user.id)
    .order('created_at',{ascending:false}).limit(limit)
  if(error) throw error
  return (data||[]) as Notification[]
}

export async function unreadNotificationCount(){
  if(!supabase) return 0
  const {data:{user}}=await supabase.auth.getUser()
  if(!user) return 0
  const {count,error}=await supabase.from('notifications')
    .select('id',{count:'exact',head:true})
    .eq('recipient_id',user.id).eq('is_read',false)
  if(error) throw error
  return count||0
}

export async function markNotificationRead(id:string){
  if(!supabase) return
  const {data:{user}}=await supabase.auth.getUser()
  if(!user) return
  const {error}=await supabase.from('notifications')
    .update({is_read:true}).eq('id',id).eq('recipient_id',user.id)
  if(error) throw error
}

export async function markAllNotificationsRead(){
  if(!supabase) return
  const {error}=await supabase.rpc('mark_all_notifications_read')
  if(error) throw error
}

export function notificationRealtime(onChange:(n:Notification)=>void){
  if(!supabase) return ()=>{}
  let channel:any
  let active=true
  ;(async()=>{
    const {data:{user}}=await supabase.auth.getUser()
    if(!active || !user) return
    channel=supabase.channel(`notifications-${user.id}`)
      .on('postgres_changes',{
        event:'INSERT',schema:'public',table:'notifications',
        filter:`recipient_id=eq.${user.id}`
      },payload=>onChange(payload.new as Notification))
      .subscribe()
  })()
  return ()=>{ active=false; if(channel) supabase.removeChannel(channel) }
}
