import {supabase} from "./supabase";
export async function savePushSubscription(subscription:PushSubscription){
 if(!supabase) throw new Error("Supabase is not configured");
 const {data:{user}}=await supabase.auth.getUser();
 if(!user) throw new Error("Connectez-vous pour activer les notifications.");
 const j=subscription.toJSON(); if(!j.endpoint) throw new Error("Push endpoint manquant.");
 const {error}=await supabase.from("push_subscriptions").upsert({
  user_id:user.id,endpoint:j.endpoint,p256dh:j.keys?.p256dh||null,auth:j.keys?.auth||null,
  user_agent:navigator.userAgent,updated_at:new Date().toISOString()
 },{onConflict:"user_id,endpoint"});
 if(error) throw error;
}
export async function removePushSubscription(endpoint:string){
 if(!supabase) return; const {data:{user}}=await supabase.auth.getUser(); if(!user)return;
 await supabase.from("push_subscriptions").delete().eq("user_id",user.id).eq("endpoint",endpoint);
}