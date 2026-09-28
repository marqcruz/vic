const CACHE="vic-v3";
const CORE=["./","index.html","manifest.webmanifest","assets/icons/icon.svg"];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET") return;

  const url=new URL(req.url);

  // Never intercept YouTube/Google or any cross-origin request.
  if(url.origin!==self.location.origin) return;

  // Always try the network first for page navigation so new releases appear immediately.
  if(req.mode==="navigate"){
    event.respondWith(
      fetch(req,{cache:"no-store"})
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(req,copy));
          return response;
        })
        .catch(()=>caches.match(req).then(r=>r||caches.match("index.html")))
    );
    return;
  }

  // Static same-origin assets: cache first, network fallback.
  event.respondWith(
    caches.match(req).then(cached=>{
      if(cached) return cached;
      return fetch(req).then(response=>{
        if(response && response.ok){
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(req,copy));
        }
        return response;
      });
    })
  );
});