import {useEffect,useState} from 'react'
import {Bell,Heart,MessageCircle,Share2,UserPlus,Check,X} from 'lucide-react'
import {listNotifications,markAllNotificationsRead,markNotificationRead,notificationRealtime,type Notification} from '../notifications'

function Icon({type}:{type:Notification['type']}){
  if(type==='like') return <Heart size={18}/>
  if(type==='comment') return <MessageCircle size={18}/>
  if(type==='share') return <Share2 size={18}/>
  if(type==='subscribe') return <UserPlus size={18}/>
  return <Bell size={18}/>
}

export default function NotificationsPanel({onClose}:{onClose:()=>void}){
  const [items,setItems]=useState<Notification[]>([])
  const [busy,setBusy]=useState(false)
  const [soundEnabled,setSoundEnabled]=useState(true)

  async function load(){try{setItems(await listNotifications())}catch(e){console.error(e)}}
  useEffect(()=>{
    load()
    const stop=notificationRealtime(async n=>{
      setItems(prev=>[n,...prev])
      if(soundEnabled){
        try{
          const Ctx=(window.AudioContext||(window as any).webkitAudioContext)
          const ctx=new Ctx(),o=ctx.createOscillator(),g=ctx.createGain()
          o.frequency.value=880;g.gain.value=.04;o.connect(g);g.connect(ctx.destination)
          o.start();o.stop(ctx.currentTime+.16)
        }catch{}
      }
    })
    return stop
  },[soundEnabled])

  const unread=items.filter(x=>!x.is_read).length

  async function read(id:string){
    try{await markNotificationRead(id);setItems(x=>x.map(n=>n.id===id?{...n,is_read:true}:n))}
    catch(e){console.error(e)}
  }
  async function readAll(){
    setBusy(true);try{await markAllNotificationsRead();setItems(x=>x.map(n=>({...n,is_read:true})))}finally{setBusy(false)}
  }

  return <div className="fixed inset-0 z-50 bg-black/60 p-4 overflow-y-auto">
    <div className="mx-auto max-w-2xl rounded-3xl bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden">
      <header className="flex items-center justify-between p-5 border-b dark:border-zinc-800">
        <div><div className="text-xs uppercase tracking-[.2em] opacity-50">TafaTube</div><h2 className="text-2xl font-black">Notifications</h2><div className="text-sm opacity-60">{unread} non lue(s)</div></div>
        <div className="flex gap-2"><button onClick={()=>setSoundEnabled(x=>!x)} className="rounded-xl border px-3 py-2 text-sm">{soundEnabled?'🔊 Son':'🔇 Son'}</button><button onClick={readAll} disabled={busy||!unread} className="rounded-xl border px-3 py-2 text-sm inline-flex gap-2 items-center"><Check size={16}/> Tout lire</button><button onClick={onClose} className="p-2"><X/></button></div>
      </header>
      <main className="p-4 space-y-2">
        {items.length===0&&<div className="py-16 text-center opacity-50">Aucune notification pour le moment.</div>}
        {items.map(n=><button key={n.id} onClick={()=>read(n.id)} className={`w-full text-left rounded-2xl p-4 border flex gap-3 ${n.is_read?'opacity-60':'ring-1'}`}>
          <span className="shrink-0 rounded-xl p-2 border"><Icon type={n.type}/></span>
          <span className="min-w-0 flex-1"><span className="font-bold block">{n.title}</span><span className="text-sm block mt-1">{n.body}</span><span className="text-xs opacity-50 block mt-2">{new Date(n.created_at).toLocaleString()}</span></span>
          {!n.is_read&&<span className="w-2 h-2 rounded-full bg-current mt-2"/>}
        </button>)}
      </main>
    </div>
  </div>
}
