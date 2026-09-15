import { useEffect, useState } from 'react'
import { BarChart3, Edit3, Eye, Film, Save, Trash2, X } from 'lucide-react'
import { supabase } from '../supabase'
import { deleteVideo, getCreatorStats, updateVideo } from '../profileStudio'

type Video = {
  id: string
  title: string
  description: string
  category: string
  visibility: 'public'|'private'|'unlisted'
  views_count: number
  file_size: number | null
  storage_path: string
  created_at: string
}

const formatBytes = (n:number) => {
  if (!n) return '0 MB'
  const units = ['B','KB','MB','GB']
  let i=0, x=n
  while (x >= 1024 && i < units.length-1) { x/=1024; i++ }
  return `${x.toFixed(i ? 1 : 0)} ${units[i]}`
}

export default function CreatorStudio({ onClose }:{onClose:()=>void}) {
  const [videos,setVideos] = useState<Video[]>([])
  const [stats,setStats] = useState({videos:0,views:0,totalBytes:0})
  const [editing,setEditing] = useState<Video|null>(null)
  const [busy,setBusy] = useState(false)
  const [message,setMessage] = useState('')

  async function load() {
    if (!supabase) return
    const { data:{user} } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('videos')
      .select('id,title,description,category,visibility,views_count,file_size,storage_path,created_at')
      .eq('owner_id',user.id)
      .order('created_at',{ascending:false})
    setVideos((data || []) as Video[])
    setStats(await getCreatorStats())
  }

  useEffect(()=>{ load() },[])

  async function save() {
    if (!editing) return
    setBusy(true); setMessage('')
    try {
      await updateVideo(editing.id, {
        title: editing.title.trim(),
        description: editing.description,
        category: editing.category,
        visibility: editing.visibility
      })
      setEditing(null); await load()
      setMessage('Publication mise à jour.')
    } catch(e:any) { setMessage(e.message || 'Erreur') }
    finally { setBusy(false) }
  }

  async function remove(v:Video) {
    if (!confirm(`Supprimer « ${v.title} » ?`)) return
    setBusy(true)
    try { await deleteVideo(v.id,v.storage_path); await load(); setMessage('Vidéo supprimée.') }
    catch(e:any) { setMessage(e.message || 'Erreur') }
    finally { setBusy(false) }
  }

  return <div className="fixed inset-0 z-50 bg-black/60 p-4 overflow-y-auto">
    <div className="mx-auto max-w-6xl rounded-3xl bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden">
      <header className="flex items-center justify-between p-5 border-b dark:border-zinc-800">
        <div>
          <div className="text-xs uppercase tracking-[.22em] opacity-60">TafaTube</div>
          <h2 className="text-2xl font-black">Creator Studio</h2>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900"><X/></button>
      </header>

      <main className="p-5 space-y-6">
        <section className="grid sm:grid-cols-3 gap-4">
          {[
            [Film,'Vidéos',stats.videos],
            [Eye,'Vues',stats.views.toLocaleString()],
            [BarChart3,'Stockage',formatBytes(stats.totalBytes)]
          ].map(([Icon,label,value]:any)=>
            <div key={label} className="rounded-2xl border dark:border-zinc-800 p-5">
              <Icon className="mb-3" size={21}/>
              <div className="text-xs opacity-60">{label}</div>
              <div className="text-2xl font-black">{value}</div>
            </div>
          )}
        </section>

        {message && <div className="rounded-xl bg-zinc-100 dark:bg-zinc-900 px-4 py-3 text-sm">{message}</div>}

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Mes vidéos</h3>
            <span className="text-sm opacity-60">{videos.length} publication(s)</span>
          </div>

          {videos.length === 0 && <div className="rounded-2xl border border-dashed p-10 text-center opacity-60">Aucune vidéo publiée pour le moment.</div>}

          {videos.map(v=><article key={v.id} className="rounded-2xl border dark:border-zinc-800 p-4 flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-56 aspect-video rounded-xl bg-zinc-900 flex items-center justify-center shrink-0"><Film className="text-white opacity-60"/></div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold truncate">{v.title}</h4>
              <p className="text-sm opacity-60 line-clamp-2 mt-1">{v.description || 'Sans description'}</p>
              <div className="flex flex-wrap gap-3 text-xs opacity-60 mt-3">
                <span>{v.category}</span><span>{v.visibility}</span><span>{Number(v.views_count||0).toLocaleString()} vues</span><span>{formatBytes(Number(v.file_size||0))}</span>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={()=>setEditing({...v})} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border"><Edit3 size={16}/> Modifier</button>
                <button disabled={busy} onClick={()=>remove(v)} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-red-300 text-red-600"><Trash2 size={16}/> Supprimer</button>
              </div>
            </div>
          </article>)}
        </section>
      </main>

      {editing && <div className="fixed inset-0 bg-black/60 z-[60] p-4 flex items-center justify-center">
        <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-zinc-950 p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-5"><h3 className="text-xl font-black">Modifier la vidéo</h3><button onClick={()=>setEditing(null)}><X/></button></div>
          <div className="space-y-4">
            <input className="w-full rounded-xl border p-3 bg-transparent" value={editing.title} onChange={e=>setEditing({...editing,title:e.target.value})} placeholder="Titre"/>
            <textarea className="w-full rounded-xl border p-3 bg-transparent min-h-32" value={editing.description} onChange={e=>setEditing({...editing,description:e.target.value})} placeholder="Description"/>
            <select className="w-full rounded-xl border p-3 bg-transparent" value={editing.category} onChange={e=>setEditing({...editing,category:e.target.value})}>
              {['Général','Musique','Sport','Gaming','Éducation','Divertissement','Actualité','Technologie'].map(x=><option key={x}>{x}</option>)}
            </select>
            <select className="w-full rounded-xl border p-3 bg-transparent" value={editing.visibility} onChange={e=>setEditing({...editing,visibility:e.target.value as any})}>
              <option value="public">Public</option><option value="unlisted">Non répertoriée</option><option value="private">Privée</option>
            </select>
            <button disabled={busy || !editing.title.trim()} onClick={save} className="w-full rounded-xl px-4 py-3 font-bold bg-black text-white dark:bg-white dark:text-black inline-flex justify-center items-center gap-2"><Save size={17}/> Enregistrer</button>
          </div>
        </div>
      </div>}
    </div>
  </div>
}
