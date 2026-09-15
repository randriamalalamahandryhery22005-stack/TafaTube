import {useEffect,useState} from "react";
import {Bell,ShieldCheck} from "lucide-react";
import {registerTafaTubePWA,requestNotificationPermission} from "../pwa";
import {savePushSubscription} from "../pushSubscriptions";
export default function PushSettings(){
 const [permission,setPermission]=useState("default"),[message,setMessage]=useState("");
 useEffect(()=>{if("Notification"in window)setPermission(Notification.permission);registerTafaTubePWA()},[]);
 async function enable(){
  try{
   await requestNotificationPermission();
   const reg=await navigator.serviceWorker.ready;
   // A VAPID public key must be supplied by the project owner.
   const key=(import.meta.env.VITE_VAPID_PUBLIC_KEY||"").trim();
   if(!key) throw new Error("VITE_VAPID_PUBLIC_KEY n'est pas encore configurée.");
   const raw=Uint8Array.from(atob(key.replace(/-/g,"+").replace(/_/g,"/")),c=>c.charCodeAt(0));
   const sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:raw});
   await savePushSubscription(sub);
   setPermission(Notification.permission);setMessage("Notifications push activées sur cet appareil.");
  }catch(e:any){setMessage(e.message||"Impossible d'activer les notifications.")}
 }
 return <div className="rounded-2xl border p-5 space-y-4">
  <div className="flex gap-3"><span className="p-2 rounded-xl border"><Bell size={20}/></span><div><b>Notifications push</b><p className="text-sm opacity-60 mt-1">Recevez les alertes TafaTube en arrière-plan.</p></div></div>
  <div className="text-sm flex gap-2 items-center"><ShieldCheck size={17}/> Permission: <b>{permission}</b></div>
  <button onClick={enable} disabled={permission==="granted"} className="rounded-xl border px-4 py-3 font-semibold disabled:opacity-50">
   {permission==="granted"?"Notifications activées":"Activer les notifications"}
  </button>
  {message&&<div className="text-sm rounded-xl bg-zinc-100 dark:bg-zinc-900 p-3">{message}</div>}
 </div>
}