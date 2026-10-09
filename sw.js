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
  './data/muscle-illustration-audit-v1.json',
  './data/ultrasound-probe-guidance-v2.json',
  './data/knowledge-core-v1.json',
  './data/orthopedic-disease-trauma-v1.json',
  './data/claude-library-manifest-v1.json',
  './data/regions-v1.json',
  './data/schema/msk-knowledge-schema-v1.json',
  './data/examination-shoulder-v1.json',
  './data/clinical-exam-illustration-presets-v1.json',
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
  './data/patient-exercise-illustration-v2.json',
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
  './data/global-qa-stage11-v1.json',
  './data/board-exam-sources-v1.json'
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
    event.ports[0].postMessage({type:'VERSION',buildVersion:RELEASE.buildVersion,displayVersion:RELEASE.displayVersion,cacheKey:RELEASE.cacheKey});
    return;
  }
  if(message.type==='GET_CACHE_STATUS'&&event.ports&&event.ports[0]){
    const port=event.ports[0];
    event.waitUntil((async()=>{
      try{
        const cache=await caches.open(SHELL_CACHE);
        const missing=[];
        for(const item of CORE){
          const absolute=new URL(item,self.location.href).href;
          if(!(await cache.match(absolute)))missing.push(item);
        }
        port.postMessage({
          type:'CACHE_STATUS',
          buildVersion:RELEASE.buildVersion,
          cacheKey:RELEASE.cacheKey,
          shellCache:SHELL_CACHE,
          coreTotal:CORE.length,
          coreCached:CORE.length-missing.length,
          missing
        });
      }catch(error){
        port.postMessage({type:'CACHE_STATUS',buildVersion:RELEASE.buildVersion,cacheKey:RELEASE.cacheKey,coreTotal:CORE.length,coreCached:0,missing:[...CORE],error:String(error)});
      }
    })());
  }
});


// Canonical-source gate for original Claude HTML. Never cache or display an app-shell
// fallback as if it were a lecture, including when an older cache was poisoned.
async function verifiedClaudeOriginal(request){
  let reason='SOURCE_MISSING_OR_IDENTITY_MISMATCH';
  const unavailable=()=>new Response(
    '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>원본 강의 확인 필요</title></head><body><h1>원본 강의 확인 필요</h1><p>앱 내부 원본의 검증이 실패했습니다. 인터넷 연결 후 다시 열어 주세요.</p><small>진단: '+reason+'</small></body></html>',
    {status:503,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
  let row;
  try{
    // Installed PWAs can retain an outdated install-time manifest although the
    // top-level app has already shown the current 87-course list. Refresh the
    // source identity on the NETWORK before judging an iframe's original HTML.
    // fetch() inside a Service Worker goes to the network, not back into this
    // fetch event. Verified offline fallback still uses the cached manifest.
    const manifestUrl=new URL('./data/claude-library-manifest-v1.json',self.location.href);
    const runtime=await caches.open(RUNTIME_CACHE);
    let response=null;
    try{
      const fresh=await fetch(manifestUrl.href,{cache:'no-store'});
      if(fresh.ok){
        const verified=await fresh.clone().json();
        if(Array.isArray(verified.lectures)&&verified.lectures.length>=87){
          response=fresh;
          await runtime.put(manifestUrl.href,fresh.clone());
        }
      }
    }catch{}
    if(!response)response=(await runtime.match(manifestUrl.href))||(await caches.match(manifestUrl.href));
    if(!response?.ok){reason='MANIFEST_UNAVAILABLE';return unavailable();}
    const manifest=await response.json();
    const pathname=decodeURI(new URL(request.url).pathname);
    const sourcePath=pathname.slice('/claude-library/'.length);
    row=(manifest.lectures||[]).find(x=>x.source_path===sourcePath);
    if(!row||!String(row.hosting_status).startsWith('SELF_HOSTED_')||
       !Number.isSafeInteger(row.source_bytes)||row.source_bytes<1||
       !/^[0-9a-f]{64}$/.test(row.source_sha256||'')){reason='MANIFEST_ROW_MISSING';return unavailable();}
  }catch{return unavailable();}
  async function valid(response){
    if(!response?.ok||!/^text\/html\b/i.test(response.headers.get('Content-Type')||''))return false;
    const bytes=await response.clone().arrayBuffer();
    if(bytes.byteLength!==row.source_bytes)return false;
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    const hex=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
    return hex===row.source_sha256;
  }
  try{
    const live=await fetch(request,{cache:'no-store'});
    reason='ORIGINAL_HTTP_'+live.status;
    if(live.ok){
      reason='ORIGINAL_CONTENT_TYPE_OR_SHA256_MISMATCH';
      if(await valid(live))return await putIfUsable(RUNTIME_CACHE,request,live);
    }
  }catch{reason='ORIGINAL_NETWORK_ERROR';}
  try{
    const cached=await caches.match(request);
    if(await valid(cached))return cached;
  }catch{}
  return unavailable();
}

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
  // Let audio/video Range requests reach the Pages R2 streaming Function directly.
  // Cache API stale-while-revalidate must not turn a 206 fragment into a stale media response.
  let decodedPath;
  try{decodedPath=decodeURI(path)}catch{decodedPath=path}
  if(decodedPath.startsWith('/claude-library/2_음성/')&&decodedPath.toLowerCase().endsWith('.mp4'))return;
  const isNavigation=event.request.mode==='navigate';
  const isFreshnessCritical=
    path.endsWith('.json')||
    path.endsWith('/app-version.js')||
    path.endsWith('/manifest.webmanifest')||
    path.endsWith('/privacy.html');

  if(decodedPath.startsWith('/claude-library/1_강의페이지/')&&decodedPath.toLowerCase().endsWith('.html')){
    event.respondWith(verifiedClaudeOriginal(event.request));
    return;
  }
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
