const CACHE="tafTube-shell-v7";
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(["/","/manifest.webmanifest"])).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{
 if(e.request.method==="GET"&&e.request.mode==="navigate")
  e.respondWith(fetch(e.request).catch(()=>caches.match("/")));
});
self.addEventListener("push",e=>{
 let d={}; try{d=e.data?.json()||{}}catch{d={body:e.data?.text()||""}}
 e.waitUntil(self.registration.showNotification(d.title||"TafaTube",{
  body:d.body||"Nouvelle notification.",icon:d.icon||"/icon-192.png",badge:d.badge||"/icon-192.png",
  tag:d.tag||"tafTube-notification",renotify:true,data:{url:d.url||"/"},vibrate:[100,50,100]
 }));
});
self.addEventListener("notificationclick",e=>{
 e.notification.close(); const url=e.notification.data?.url||"/";
 e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{
  for(const c of list){if("focus" in c){c.navigate(url);return c.focus()}}
  return clients.openWindow(url);
 }));
});