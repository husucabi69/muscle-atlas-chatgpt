const CACHE_PREFIX='muscle-atlas-chatgpt-';
const CACHE=CACHE_PREFIX+'v7.5-shoulder-diff-media';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./data/media-v1.json','./data/knowledge-core-v1.json','./data/regions-v1.json','./data/schema/msk-knowledge-schema-v1.json','./data/examination-shoulder-v1.json','./data/ultrasound-shoulder-v1.json','./data/quiz-shoulder-v1.json','./data/differential-shoulder-v1.json','./data/media-audit-shoulder-v1.json'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  if(url.origin===location.origin){
    e.respondWith(
      caches.match(e.request).then(hit=>hit||fetch(e.request).then(resp=>{
        const copy=resp.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
        return resp;
      }))
    );
  } else {
    e.respondWith(
      fetch(e.request).then(resp=>{
        const copy=resp.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
        return resp;
      }).catch(()=>caches.match(e.request))
    );
  }
});