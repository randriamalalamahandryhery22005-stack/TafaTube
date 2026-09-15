import { useEffect, useState } from 'react'
import { Camera, Save, UserRound, X } from 'lucide-react'
import { getCurrentProfile, saveProfile, uploadAvatar, type Profile } from '../profileStudio'

export default function ProfilePanel({onClose}:{onClose:()=>void}) {
  const [profile,setProfile] = useState<Profile|null>(null)
  const [busy,setBusy] = useState(false)
  const [message,setMessage] = useState('')

  useEffect(()=>{ getCurrentProfile().then(setProfile).catch(e=>setMessage(e.message)) },[])

  if (!profile) return <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5"><div className="bg-white dark:bg-zinc-950 rounded-3xl p-8">Chargement…</div></div>

  async function avatar(file:File) {
    setBusy(true); setMessage('')
    try {
      const url = await uploadAvatar(file)
      setProfile({...profile, avatar_path:url})
      setMessage('Photo de profil mise à jour.')
    } catch(e:any) { setMessage(e.message || 'Erreur') }
    finally { setBusy(false) }
  }

  async function save() {
    setBusy(true); setMessage('')
    try { setProfile(await saveProfile(profile)); setMessage('Profil enregistré.') }
    catch(e:any) { setMessage(e.message || 'Erreur') }
    finally { setBusy(false) }
  }

  const avatarUrl = profile.avatar_path?.startsWith('http')
    ? profile.avatar_path
    : null

  return <div className="fixed inset-0 z-50 bg-black/60 p-4 overflow-y-auto">
    <div className="mx-auto max-w-2xl rounded-3xl bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden">
      <header className="flex items-center justify-between p-5 border-b dark:border-zinc-800"><div><div className="text-xs uppercase tracking-[.2em] opacity-50">Compte</div><h2 className="text-2xl font-black">Mon profil</h2></div><button onClick={onClose}><X/></button></header>
      <main className="p-6 space-y-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            {avatarUrl ? <img src={avatarUrl} className="w-24 h-24 rounded-full object-cover" /> : <div className="w-24 h-24 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center"><UserRound/></div>}
            <label className="absolute -bottom-1 -right-1 rounded-full p-2 bg-black text-white cursor-pointer"><Camera size={16}/><input className="hidden" type="file" accept="image/*" onChange={e=>e.target.files?.[0] && avatar(e.target.files[0])}/></label>
          </div>
          <div><div className="font-black text-xl">{profile.display_name}</div><div className="opacity-60">@{profile.username || 'creator'}</div></div>
        </div>

        {message && <div className="rounded-xl bg-zinc-100 dark:bg-zinc-900 p-3 text-sm">{message}</div>}

        <label className="block text-sm font-semibold">Nom affiché<input className="mt-2 w-full rounded-xl border p-3 bg-transparent" value={profile.display_name} onChange={e=>setProfile({...profile,display_name:e.target.value})}/></label>
        <label className="block text-sm font-semibold">Nom d'utilisateur<input className="mt-2 w-full rounded-xl border p-3 bg-transparent" value={profile.username || ''} onChange={e=>setProfile({...profile,username:e.target.value})}/></label>
        <label className="block text-sm font-semibold">Bio<textarea className="mt-2 w-full rounded-xl border p-3 bg-transparent min-h-32" value={profile.bio} onChange={e=>setProfile({...profile,bio:e.target.value})}/></label>
        <button disabled={busy} onClick={save} className="w-full rounded-xl px-4 py-3 font-bold bg-black text-white dark:bg-white dark:text-black inline-flex justify-center items-center gap-2"><Save size={17}/> Enregistrer le profil</button>
      </main>
    </div>
  </div>
}
