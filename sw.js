importScripts('./app-version.js');

const RELEASE=self.LYS_APP_RELEASE||{buildVersion:'unknown',cacheKey:'fallback'};
const CACHE_PREFIX='muscle-atlas-chatgpt-';
const SHELL_CACHE=CACHE_PREFIX+'shell-'+RELEASE.cacheKey;
const RUNTIME_CACHE=CACHE_PREFIX+'runtime-'+RELEASE.cacheKey;
const CORE=[
  './',
  './index.html',
  './app-version.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './data/media-v1.json',
  './data/knowledge-core-v1.json',
  './data/regions-v1.json',
  './data/schema/msk-knowledge-schema-v1.json',
  './data/examination-shoulder-v1.json',
  './data/ultrasound-shoulder-v1.json',
  './data/quiz-shoulder-v1.json',
  './data/differential-shoulder-v1.json',
  './data/media-audit-shoulder-v1.json',
  './data/symptom-groups-v1.json',
  './data/symptoms-v1.json',
  './data/examination-elbow-v1.json',
  './data/ultrasound-elbow-v1.json',
  './data/differential-elbow-v1.json',
  './data/quiz-elbow-v1.json',
  './data/media-audit-elbow-v1.json',
  './data/examination-wrist-hand-v1.json',
  './data/ultrasound-wrist-hand-v1.json',
  './data/quiz-wrist-hand-v1.json',
  './data/differential-wrist-hand-v1.json',
  './data/media-audit-wrist-hand-v1.json',
  './data/examination-hip-pelvis-v1.json',
  './data/ultrasound-hip-pelvis-v1.json',
  './data/quiz-hip-pelvis-v1.json',
  './data/differential-hip-pelvis-v1.json',
  './data/media-audit-hip-pelvis-v1.json',
  './data/examination-knee-thigh-v1.json',
  './data/ultrasound-knee-thigh-v1.json',
  './data/quiz-knee-thigh-v1.json',
  './data/differential-knee-thigh-v1.json',
  './data/media-audit-knee-thigh-v1.json',
  './data/examination-leg-ankle-foot-v1.json',
  './data/ultrasound-leg-ankle-foot-v1.json',
  './data/quiz-leg-ankle-foot-v1.json',
  './data/differential-leg-ankle-foot-v1.json',
  './data/media-audit-leg-ankle-foot-v1.json',
  './data/examination-cervical-v1.json',
  './data/ultrasound-cervical-v1.json',
  './data/quiz-cervical-v1.json',
  './data/differential-cervical-v1.json',
  './data/media-audit-cervical-v1.json',
  './data/examination-thoracic-back-chestwall-v1.json',
  './data/ultrasound-thoracic-back-chestwall-v1.json',
  './data/quiz-thoracic-back-chestwall-v1.json',
  './data/differential-thoracic-back-chestwall-v1.json',
  './data/media-audit-thoracic-back-chestwall-v1.json',
  './data/patient-exercise-library-v1.json',
  './privacy.html',
  './data/examination-lumbar-sacral-v1.json',
  './data/ultrasound-lumbar-sacral-v1.json',
  './data/quiz-lumbar-sacral-v1.json',
  './data/differential-lumbar-sacral-v1.json',
  './data/media-audit-lumbar-sacral-v1.json',
  './data/examination-abdominal-core-v1.json',
  './data/ultrasound-abdominal-core-v1.json',
  './data/quiz-abdominal-core-v1.json',
  './data/differential-abdominal-core-v1.json',
  './data/media-audit-abdominal-core-v1.json',
  './data/global-qa-stage11-v1.json'
];

async function putIfUsable(cacheName,request,response){
  if(!response||!response.ok)return response;
  const cache=await caches.open(cacheName);
  await cache.put(request,response.clone());
  return response;
}

async function networkFirst(request,fallbackUrl){
  try{
    const response=await fetch(request,{cache:'no-store'});
    return await putIfUsable(RUNTIME_CACHE,request,response);
  }catch(error){
    const cached=await caches.match(request);
    if(cached)return cached;
    if(fallbackUrl){
      const fallback=await caches.match(fallbackUrl);
      if(fallback)return fallback;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request){
  const cached=await caches.match(request);
  const refresh=fetch(request).then(response=>putIfUsable(RUNTIME_CACHE,request,response)).catch(()=>null);
  if(cached){
    refresh.catch(()=>{});
    return cached;
  }
  const response=await refresh;
  if(response)return response;
  return Response.error();
}

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache=>cache.addAll(CORE))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys
        .filter(key=>key.startsWith(CACHE_PREFIX)&&key!==SHELL_CACHE&&key!==RUNTIME_CACHE)
        .map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('message',event=>{
  const message=event.data||{};
  if(message.type==='SKIP_WAITING'){
    self.skipWaiting();
    return;
  }
  if(message.type==='GET_VERSION'&&event.ports&&event.ports[0]){
    event.ports[0].postMessage({type:'VERSION',buildVersion:RELEASE.buildVersion,displayVersion:RELEASE.displayVersion});
  }
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.protocol!=='http:'&&url.protocol!=='https:')return;

  if(url.origin!==self.location.origin){
    event.respondWith(
      fetch(event.request).catch(()=>caches.match(event.request))
    );
    return;
  }

  const path=url.pathname;
  const isNavigation=event.request.mode==='navigate';
  const isFreshnessCritical=
    path.endsWith('.json')||
    path.endsWith('/app-version.js')||
    path.endsWith('/manifest.webmanifest')||
    path.endsWith('/privacy.html');

  if(isNavigation){
    event.respondWith(networkFirst(event.request,'./index.html'));
    return;
  }

  if(isFreshnessCritical){
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(staleWhileRevalidate(event.request));
});
