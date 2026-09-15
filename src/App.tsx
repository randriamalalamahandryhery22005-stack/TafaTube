import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import {
  Bell, Compass, Home, Menu, Moon, Search, Settings, Sun,
  Upload, UserCircle2, X, Play, Sparkles, ChevronRight
} from 'lucide-react'

const demoVideos = [
  { id: 1, title: 'Bienvenue sur TafaTube', creator: 'TafaTube', views: '1,2 k', time: '2:14', thumb: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=900&q=80' },
  { id: 2, title: 'Découvrir Madagascar autrement', creator: 'Tafa Creator', views: '842', time: '4:32', thumb: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80' },
  { id: 3, title: 'Création vidéo : les bases', creator: 'Studio Tafa', views: '3,4 k', time: '7:08', thumb: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=900&q=80' },
  { id: 4, title: 'Les tendances de la semaine', creator: 'Tafa Media', views: '5,1 k', time: '3:51', thumb: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=900&q=80' },
]

function App() {
  const [dark, setDark] = useState(true)
  const [videos, setVideos] = useState<any[]>([])
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null)
  const [search, setSearch] = useState('')
  const [menu, setMenu] = useState(false)
  const [auth, setAuth] = useState<'login' | 'register' | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  useEffect(() => {
    loadVideos()
  }, [])

  async function loadVideos() {
    if (!supabase) return
    const { data } = await supabase
      .from('videos')
      .select('*')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(40)
    if (data) setVideos(data)
  }


  const bg = dark ? 'bg-[#090b10] text-white' : 'bg-[#f7f8fa] text-slate-900'
  const panel = dark ? 'bg-white/[.055] border-white/10' : 'bg-white border-slate-200 shadow-sm'

  return (
    <div className={`min-h-screen ${bg} transition-colors`}>
      <header className={`sticky top-0 z-40 border-b backdrop-blur-2xl ${dark ? 'bg-[#090b10]/80 border-white/10' : 'bg-white/85 border-slate-200'}`}>
        <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-4 px-4 md:px-7">
          <button onClick={() => setMenu(!menu)} className="rounded-xl p-2 hover:bg-white/10" aria-label="Menu">
            {menu ? <X size={21}/> : <Menu size={21}/>}
          </button>
          <div className="flex items-center gap-2 mr-auto">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
              <Play size={17} fill="currentColor"/>
            </div>
            <span className="text-xl font-black tracking-tight">Tafa<span className="text-orange-500">Tube</span></span>
          </div>

          <div className={`hidden md:flex w-[min(520px,42vw)] items-center rounded-2xl border px-3 ${dark ? 'bg-white/[.045] border-white/10' : 'bg-slate-100 border-slate-200'}`}>
            <Search size={18} className="opacity-50"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher une vidéo..." className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"/>
          </div>
          <button onClick={()=>setUploadOpen(true)} className="rounded-xl p-2 hover:bg-white/10" aria-label="Uploader une vidéo"><Upload size={20}/></button>
          <button className="rounded-xl p-2 hover:bg-white/10"><Bell size={20}/></button>
          <button onClick={()=>setDark(!dark)} className="rounded-xl p-2 hover:bg-white/10" aria-label="Theme">
            {dark ? <Sun size={20}/> : <Moon size={20}/>}
          </button>
          <button onClick={()=>setAuth('login')} className="hidden sm:flex items-center gap-2 rounded-xl border border-orange-500/40 px-3 py-2 text-sm font-semibold text-orange-500 hover:bg-orange-500/10">
            <UserCircle2 size={19}/> Connexion
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px]">
        <aside className={`${menu ? 'fixed inset-y-16 left-0 z-30 flex' : 'hidden'} md:flex w-64 shrink-0 flex-col gap-2 border-r p-4 ${dark ? 'border-white/10 bg-[#090b10]' : 'border-slate-200 bg-white'}`}>
          {[
            [Home, 'Accueil'], [Compass, 'Explorer'], [Sparkles, 'Tendances'],
            [Bell, 'Notifications'], [UserCircle2, 'Profil'], [Settings, 'Paramètres']
          ].map(([Icon, label]: any, i) => (
            <button key={label} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${i===0 ? 'bg-orange-500 text-white' : 'hover:bg-white/10'}`}>
              <Icon size={19}/>{label}
            </button>
          ))}
          <div className={`mt-auto rounded-2xl border p-4 ${panel}`}>
            <p className="text-xs font-semibold opacity-60">TAFATUBE CREATOR</p>
            <p className="mt-1 text-sm font-bold">Publiez vos vidéos.</p>
            <button onClick={()=>setAuth('register')} className="mt-3 flex items-center gap-1 text-sm font-bold text-orange-500">Créer un compte <ChevronRight size={16}/></button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8">
          <section className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/20 via-transparent to-transparent p-6 md:p-9">
            <div className="relative z-10 max-w-2xl">
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-orange-500"><Sparkles size={15}/> Nouvelle génération</p>
              <h1 className="text-3xl font-black tracking-tight md:text-5xl">Vos vidéos.<br/><span className="text-orange-500">Votre espace.</span></h1>
              <p className="mt-4 max-w-xl text-sm leading-6 opacity-70 md:text-base">TafaTube est votre nouvelle plateforme pour publier, regarder, partager et découvrir des vidéos.</p>
              <button onClick={()=>setAuth('register')} className="mt-6 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-orange-500/20">Commencer maintenant</button>
            </div>
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl"/>
          </section>

          <div className="mt-8 flex items-center justify-between">
            <div><h2 className="text-xl font-black">Vidéos recommandées</h2><p className="mt-1 text-xs opacity-50">Découvrez les dernières publications</p></div>
            <button className="text-sm font-bold text-orange-500">Voir tout</button>
          </div>

          <section className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            (videos.length ? videos : demoVideos).map(v=>(
              <article key={v.id} onClick={()=>videos.length && setSelectedVideo(v)} className="group cursor-pointer overflow-hidden rounded-2xl">
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
                  <img src={v.thumbnail_path && supabase ? supabase.storage.from('videos').getPublicUrl(v.thumbnail_path).data.publicUrl : v.thumb} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/>
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-1 text-xs font-bold">VIDEO</span>
                  <button className="absolute inset-0 m-auto grid h-12 w-12 scale-90 place-items-center rounded-full bg-orange-500 text-white opacity-0 transition group-hover:scale-100 group-hover:opacity-100"><Play size={20} fill="currentColor"/></button>
                </div>
                <div className="flex gap-3 py-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-orange-700 text-xs font-black">T</div>
                  <div className="min-w-0"><h3 className="truncate text-sm font-bold">{v.title}</h3><p className="mt-1 text-xs opacity-55">{v.creator || 'TafaTube Creator'} · {(v.views_count ?? v.views ?? 0).toLocaleString?.() || 0} vues</p></div>
                </div>
              </article>
            ))}
          </section>
        </main>
      </div>

      {selectedVideo && <VideoModal video={selectedVideo} onClose={()=>setSelectedVideo(null)} dark={dark}/>}
      {auth && <AuthModal type={auth} onClose={()=>setAuth(null)} onSwitch={()=>setAuth(auth==='login'?'register':'login')} dark={dark}/>}
      {uploadOpen && <UploadModal onClose={()=>setUploadOpen(false)} dark={dark}/>}
    </div>
  )
}

function AuthModal({type,onClose,onSwitch,dark}:{type:'login'|'register',onClose:()=>void,onSwitch:()=>void,dark:boolean}) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-md">
    <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl ${dark?'bg-[#11141b] border-white/10':'bg-white border-slate-200'}`}>
      <div className="flex items-start justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-orange-500">TafaTube</p><h2 className="mt-1 text-2xl font-black">{type==='login'?'Bienvenue':'Créer votre compte'}</h2></div>
        <button onClick={onClose} className="rounded-xl p-2 hover:bg-white/10"><X size={20}/></button>
      </div>
      <div className="mt-6 space-y-3">
        {type==='register' && <input placeholder="Nom du compte" className="w-full rounded-xl border border-white/10 bg-black/10 px-4 py-3 outline-none focus:border-orange-500"/>}
        <input type="email" placeholder="E-mail" className="w-full rounded-xl border border-white/10 bg-black/10 px-4 py-3 outline-none focus:border-orange-500"/>
        <input type="password" placeholder="Mot de passe" className="w-full rounded-xl border border-white/10 bg-black/10 px-4 py-3 outline-none focus:border-orange-500"/>
        <button className="w-full rounded-xl bg-orange-500 py-3 font-bold text-white">{type==='login'?'Se connecter':'Créer mon compte'}</button>
      </div>
      <p className="mt-5 text-center text-sm opacity-60">{type==='login'?'Pas encore de compte ?':'Vous avez déjà un compte ?'} <button onClick={onSwitch} className="font-bold text-orange-500">{type==='login'?'Créer un compte':'Se connecter'}</button></p>
    </div>
  </div>
}

export default App



function UploadModal({onClose,dark}:{onClose:()=>void,dark:boolean}) {
  const [file,setFile]=useState<File|null>(null)
  const [title,setTitle]=useState('')
  const [description,setDescription]=useState('')
  const [category,setCategory]=useState('Général')
  const [progress,setProgress]=useState(0)
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)

  async function submit(e:React.FormEvent){
    e.preventDefault()
    if(!file || !title.trim()){ setMessage('Sélectionnez une vidéo et renseignez son titre.'); return }
    if(!supabase){ setMessage('Supabase n’est pas encore configuré dans le fichier .env.'); return }
    if(!file.type.startsWith('video/')){ setMessage('Seuls les fichiers vidéo sont acceptés.'); return }
    setBusy(true); setMessage('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if(!user){ setMessage('Connectez-vous pour publier une vidéo.'); setBusy(false); return }
      const ext=file.name.split('.').pop()?.toLowerCase() || 'mp4'
      const path=`${user.id}/${crypto.randomUUID()}.${ext}`
      const { error:uploadError }=await supabase.storage.from('videos').upload(path,file,{contentType:file.type,upsert:false})
      if(uploadError) throw uploadError
      setProgress(70)
      const { error:dbError }=await supabase.from('videos').insert({
        owner_id:user.id,title:title.trim(),description,category,
        storage_path:path,mime_type:file.type,file_size:file.size,visibility:'public'
      })
      if(dbError) throw dbError
      setProgress(100)
      setMessage('Vidéo publiée avec succès.')
      setTimeout(onClose,700)
    } catch(err:any) {
      setMessage(err?.message || 'Impossible de publier la vidéo.')
    } finally { setBusy(false) }
  }

  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-md">
    <form onSubmit={submit} className={`w-full max-w-xl rounded-3xl border p-6 shadow-2xl ${dark?'bg-[#11141b] border-white/10':'bg-white border-slate-200'}`}>
      <div className="flex items-start justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-orange-500">Creator Studio</p><h2 className="mt-1 text-2xl font-black">Publier une vidéo</h2></div>
        <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-white/10"><X size={20}/></button>
      </div>
      <div className="mt-6 space-y-4">
        <label className="block rounded-2xl border border-dashed border-orange-500/50 p-6 text-center">
          <Upload className="mx-auto mb-2 text-orange-500"/>
          <span className="block text-sm font-bold">Choisir une vidéo</span>
          <span className="mt-1 block text-xs opacity-60">MP4, WebM, MOV...</span>
          <input required type="file" accept="video/*" className="mt-4 block w-full text-sm" onChange={e=>setFile(e.target.files?.[0]||null)}/>
          {file && <p className="mt-2 truncate text-xs text-orange-500">{file.name}</p>}
        </label>
        <input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="Titre de la vidéo" className="w-full rounded-xl border border-white/10 bg-black/10 px-4 py-3 outline-none focus:border-orange-500"/>
        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" rows={3} className="w-full rounded-xl border border-white/10 bg-black/10 px-4 py-3 outline-none focus:border-orange-500"/>
        <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/10 px-4 py-3 outline-none">
          <option>Général</option><option>Musique</option><option>Éducation</option><option>Divertissement</option><option>Sport</option><option>Actualités</option>
        </select>
        {busy && <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-orange-500 transition-all" style={{width:`${progress}%`}}/></div>}
        {message && <p className="rounded-xl bg-orange-500/10 p-3 text-sm text-orange-500">{message}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-orange-500 py-3 font-bold text-white disabled:opacity-50">{busy?'Publication...':'Publier la vidéo'}</button>
      </div>
    </form>
  </div>
}

function VideoModal({video,onClose,dark}:{video:any,onClose:()=>void,dark:boolean}) {
  const url=supabase?.storage.from('videos').getPublicUrl(video.storage_path).data.publicUrl
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 md:p-8">
    <div className={`w-full max-w-5xl overflow-hidden rounded-3xl border ${dark?'border-white/10 bg-[#10131a]':'border-slate-200 bg-white'}`}>
      <div className="flex items-center justify-between p-3">
        <div className="truncate px-2 text-sm font-bold">{video.title}</div>
        <button onClick={onClose} className="rounded-xl p-2 hover:bg-white/10"><X size={20}/></button>
      </div>
      <video src={url} controls autoPlay playsInline className="max-h-[70vh] w-full bg-black"/>
      <div className="p-4">
        <h3 className="text-lg font-black">{video.title}</h3>
        <p className="mt-2 text-sm opacity-60">{video.description}</p>
        <a href={url} download className="mt-4 inline-flex items-center rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white">Télécharger la vidéo</a>
      </div>
    </div>
  </div>
}
