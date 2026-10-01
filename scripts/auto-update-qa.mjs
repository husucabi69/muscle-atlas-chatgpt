import fs from 'node:fs';

const read=path=>fs.readFileSync(path,'utf8');
const version=read('app-version.js');
const sw=read('sw.js');
const index=read('index.html');

const checks=[];
const check=(name,condition,detail='')=>checks.push({name,pass:Boolean(condition),detail});

const versionMatch=version.match(/buildVersion:'([^']+)'/);
const cacheKeyMatch=version.match(/cacheKey:'([^']+)'/);
const displayMatch=version.match(/displayVersion:'([^']+)'/);

check('canonical buildVersion exists',!!versionMatch,versionMatch?.[1]||'missing');
check('canonical cacheKey exists',!!cacheKeyMatch,cacheKeyMatch?.[1]||'missing');
check('displayVersion exists',!!displayMatch,displayMatch?.[1]||'missing');
check('service worker imports canonical version',sw.includes("importScripts('./app-version.js')"));
check('page imports canonical version',index.includes('<script src="./app-version.js"></script>'));
check('service worker cache derives from release key',sw.includes("SHELL_CACHE=CACHE_PREFIX+'shell-'+RELEASE.cacheKey")&&sw.includes("RUNTIME_CACHE=CACHE_PREFIX+'runtime-'+RELEASE.cacheKey"));
check('canonical version is precached',sw.includes("'./app-version.js'"));
check('old release caches are deleted',sw.includes("key.startsWith(CACHE_PREFIX)")&&sw.includes("caches.delete(key)"));
check('skipWaiting enabled',sw.includes('self.skipWaiting()'));
check('clients.claim enabled',sw.includes('self.clients.claim()'));
check('navigation is network-first',sw.includes("if(isNavigation)")&&sw.includes("networkFirst(event.request,'./index.html')"));
check('fresh JSON/version resources are network-first',sw.includes("path.endsWith('.json')")&&sw.includes("path.endsWith('/app-version.js')")&&sw.includes('networkFirst(event.request)'));
check('network-first bypasses HTTP cache',sw.includes("fetch(request,{cache:'no-store'})"));
check('static resources retain offline stale-while-revalidate',sw.includes('staleWhileRevalidate(event.request)'));
check('legacy same-origin cache-first strategy removed',!sw.includes('caches.match(e.request).then(hit=>hit||fetch(e.request)'));
check('service worker can report active version',sw.includes("message.type==='GET_VERSION'")&&sw.includes("buildVersion:RELEASE.buildVersion"));

const updateStart=index.indexOf('let appSWRegistration=null;');
const updateCode=updateStart>=0?index.slice(updateStart):'';
check('page update controller exists',updateStart>=0);
check('registration bypasses worker HTTP cache',updateCode.includes("updateViaCache:'none'"));
check('app launch explicitly checks registration.update',updateCode.includes('await registration.update()'));
check('controllerchange is observed',updateCode.includes("addEventListener('controllerchange'"));
check('new worker receives SKIP_WAITING',updateCode.includes("postMessage({type:'SKIP_WAITING'})"));
check('reload uses one-shot session guard',updateCode.includes("sessionStorage.getItem(reloadKey)!==APP_RELEASE.buildVersion")&&updateCode.includes('window.location.reload()'));
check('update engine never clears local learning storage',!updateCode.includes('localStorage.clear')&&!sw.includes('localStorage'));
check('manual update button exists',index.includes('id="appUpdateButton"')&&updateCode.includes("addEventListener('click',()=>checkForAppUpdate(true))"));
check('stable preview origin is canonical for development installs',
  index.includes("APP_CANONICAL_PREVIEW_ORIGIN='https://preview-development.muscle-atlas-chatgpt.pages.dev'")
);
check('immutable Cloudflare deployment host is detected',
  index.includes('function isImmutableCloudflareDeploymentHost()')&&index.includes('muscle-atlas-chatgpt\\.pages\\.dev')
);
check('immutable deployment never claims latest update state',
  updateCode.includes('if(isImmutableCloudflareDeploymentHost())')&&updateCode.includes('setStablePreviewMigrationUI()')
);
check('immutable deployment blocks service-worker update registration',
  updateCode.includes('setStablePreviewMigrationUI();')&&updateCode.includes('if(isImmutableCloudflareDeploymentHost())return;')
);
check('stable preview migration action exists',
  index.includes('id="appOpenStablePreviewButton"')&&index.includes('function openCanonicalPreview()')
);
check('install prompt is blocked on immutable deployment URLs',
  index.includes('if(!applyInstallOriginPolicy()){deferredInstallPrompt=null;return;}')
);
check('visible current-version label exists',index.includes('id="appVersionLabel"')&&index.includes("appVersionLabel.textContent=APP_RELEASE.displayVersion"));
check('offline status preserves stable app',updateCode.includes("오프라인입니다. 저장된 앱으로 계속 사용할 수 있습니다."));
check('online recovery triggers update check',updateCode.includes("window.addEventListener('online',()=>checkForAppUpdate(false))"));
check('app resume checks for updates',
  updateCode.includes("window.addEventListener('pageshow',()=>requestAppUpdateCheck('pageshow'))") &&
  updateCode.includes("window.addEventListener('focus',()=>requestAppUpdateCheck('focus'))") &&
  updateCode.includes("document.addEventListener('visibilitychange'") &&
  updateCode.includes("document.visibilityState==='visible'")
);
check('resume update checks are throttled',
  updateCode.includes('APP_AUTO_UPDATE_MIN_INTERVAL=15000') &&
  updateCode.includes('now-appLastAutoUpdateCheckAt<APP_AUTO_UPDATE_MIN_INTERVAL')
);
check('pull-to-refresh update indicator exists',
  index.includes('id="pullRefreshIndicator"') &&
  index.includes('아래로 당겨 업데이트')
);
check('pull-to-refresh is home/top guarded',
  updateCode.includes("window.scrollY>0") &&
  updateCode.includes("document.getElementById('home')?.classList.contains('active')")
);
check('pull gesture prevents native double refresh only while tracking',
  updateCode.includes("document.addEventListener('touchmove'") &&
  updateCode.includes("event.preventDefault()") &&
  updateCode.includes("{passive:false}")
);
check('pull release triggers explicit update check',
  updateCode.includes('function triggerPullRefresh()') &&
  updateCode.includes('await checkForAppUpdate(true)')
);
check('pull refresh reloads latest network-first page when no worker transition',
  updateCode.includes("setAppUpdateStatus('최신 화면을 다시 불러옵니다.'") &&
  updateCode.includes('window.location.reload()')
);

let failed=0;
for(const item of checks){
  const mark=item.pass?'PASS':'FAIL';
  console.log(`${mark}  ${item.name}${item.detail?' — '+item.detail:''}`);
  if(!item.pass)failed++;
}
console.log(`\nStage 15 auto-update QA: ${checks.length-failed}/${checks.length} PASS`);
if(failed)process.exit(1);
