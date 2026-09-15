export async function registerTafaTubePWA(){
 if(!("serviceWorker" in navigator)) return null;
 try{return await navigator.serviceWorker.register("/sw.js",{scope:"/"})}
 catch(e){console.error("Service worker registration failed",e);return null}
}
export async function requestNotificationPermission(){
 if(!("Notification" in window)) throw new Error("Les notifications push ne sont pas supportées.");
 const permission=await Notification.requestPermission();
 if(permission!=="granted") throw new Error("Permission de notification refusée.");
 return permission;
}