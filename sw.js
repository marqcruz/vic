const CACHE="nosso-dia-3-v15";
const CORE=["./","index.html","manifest.webmanifest","assets/icons/icon.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET")return;
 const u=new URL(e.request.url);
 if(u.origin!==self.location.origin)return;
 if(u.pathname.includes("/assets/photos/")||u.pathname.includes("/assets/videos/")||u.pathname.includes("/assets/audio/")||u.pathname.includes("/data/")){
   e.respondWith(fetch(e.request,{cache:"no-store"}));
   return;
 }
 if(e.request.mode==="navigate"){
   e.respondWith(fetch(e.request,{cache:"no-store"}).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match("index.html")));
   return;
 }
 e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request,{cache:"no-store"}).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(cache=>cache.put(e.request,cp))}return r})));
});