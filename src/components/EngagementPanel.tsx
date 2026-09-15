import { useEffect, useState } from 'react'
import { Heart, MessageCircle, Share2, Send, Bell, BellOff } from 'lucide-react'
import { addComment, engagementChannel, getEngagement, hasLiked, isSubscribed, listComments, shareVideo, toggleLike, toggleSubscription, subscriptionChannel } from '../engagement'

export default function EngagementPanel({videoId,channelId}:{videoId:string,channelId:string}) {
  const [stats,setStats]=useState({likes:0,comments:0,shares:0})
  const [liked,setLiked]=useState(false)
  const [subscribed,setSubscribed]=useState(false)
  const [comments,setComments]=useState<any[]>([])
  const [text,setText]=useState('')
  const [busy,setBusy]=useState(false)

  async function refresh() {
    try {
      setStats(await getEngagement(videoId))
      setLiked(await hasLiked(videoId))
      setSubscribed(await isSubscribed(channelId))
      setComments(await listComments(videoId))
    } catch(e) { console.error(e) }
  }
  useEffect(()=>{
    refresh()
    const stopVideo=engagementChannel(videoId,refresh)
    const stopSub=subscriptionChannel(channelId,refresh)
    return ()=>{stopVideo();stopSub()}
  },[videoId,channelId])

  async function like() {
    if(busy)return
    setBusy(true); try { setLiked(await toggleLike(videoId)); await refresh() } catch(e:any){alert(e.message)} finally{setBusy(false)}
  }
  async function subscribe() {
    if(busy)return
    setBusy(true); try { setSubscribed(await toggleSubscription(channelId)); await refresh() } catch(e:any){alert(e.message)} finally{setBusy(false)}
  }
  async function comment() {
    if(!text.trim() || busy)return
    setBusy(true); try { await addComment(videoId,text); setText(''); await refresh() } catch(e:any){alert(e.message)} finally{setBusy(false)}
  }
  async function share() {
    try {
      await shareVideo(videoId)
      await navigator.clipboard?.writeText(window.location.href)
      await refresh()
      alert('Lien copié.')
    } catch(e:any){alert(e.message)}
  }

  return <section className="mt-5 space-y-5">
    <div className="flex flex-wrap gap-2">
      <button onClick={like} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 ${liked?'font-bold':''}`}><Heart size={18} fill={liked?'currentColor':'none'}/> {stats.likes.toLocaleString()}</button>
      <button onClick={share} className="inline-flex items-center gap-2 rounded-full border px-4 py-2"><Share2 size={18}/> Partager · {stats.shares.toLocaleString()}</button>
      <button onClick={subscribe} className="ml-auto inline-flex items-center gap-2 rounded-full border px-4 py-2 font-semibold">{subscribed?<BellOff size={18}/>:<Bell size={18}/>} {subscribed?'Abonné':'S’abonner'}</button>
    </div>
    <div>
      <h3 className="font-bold flex items-center gap-2"><MessageCircle size={18}/> {stats.comments.toLocaleString()} commentaires</h3>
      <div className="flex gap-2 mt-3">
        <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&comment()} className="flex-1 rounded-xl border px-4 py-3 bg-transparent" placeholder="Ajouter un commentaire…"/>
        <button onClick={comment} className="rounded-xl px-4 border"><Send size={18}/></button>
      </div>
      <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
        {comments.map(c=><div key={c.id} className="rounded-xl border p-3"><div className="text-xs opacity-50">{new Date(c.created_at).toLocaleString()}</div><div className="mt-1">{c.content}</div></div>)}
      </div>
    </div>
  </section>
