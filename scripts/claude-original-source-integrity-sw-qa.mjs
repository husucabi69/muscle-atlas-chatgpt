import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto,createHash} from 'node:crypto';

// Execute the actual Service Worker fetch handler against deterministic cache/network.
const source=fs.readFileSync('sw.js','utf8');
const origin='https://preview-development.muscle-atlas-chatgpt.pages.dev';
const lecture='/claude-library/1_강의페이지/03_질환외상/클로드_질환외상_01권_어깨_질환.html';
const media='/claude-library/2_음성/03_질환외상/클로드_질환외상_01권_어깨_질환.mp4';
const original='<!doctype html><title>Canonical source-locked original</title>';
const shell='<!doctype html><title>Root app shell</title>';
const digest=createHash('sha256').update(original).digest('hex');
const row={source_path:lecture.slice('/claude-library/'.length),source_bytes:Buffer.byteLength(original),source_sha256:digest,hosting_status:'SELF_HOSTED_HTML_MEDIA_PENDING'};
const abs=x=>new URL(typeof x==='string'?x:x.url,origin+'/sw.js').href;
let pass=0;
const check=async(name,fn)=>{await fn();console.log('PASS | '+name);pass++};
function setup({online=false,cached=null,live=original,mime='text/html',manifest=true,status=200,staleShellManifest=false,freshRuntimeManifest=false}={}){
 const handlers=new Map(),entries=new Map(),requests=[];
 entries.set(abs('/index.html'),new Response(shell));
 if(manifest)entries.set(abs('/data/claude-library-manifest-v1.json'),new Response(JSON.stringify({lectures:[row]}),{status:200}));
 if(cached!==null)entries.set(abs(lecture),new Response(cached,{headers:{'Content-Type':mime}}));
 const manifestUrl=abs('/data/claude-library-manifest-v1.json');
 const caches={
  match:async req=>abs(req)===manifestUrl&&staleShellManifest?
    new Response(JSON.stringify({lectures:[]})):entries.get(abs(req))?.clone(),
  open:async name=>({put:async(req,res)=>entries.set(abs(req),res.clone()),
    match:async req=>name.includes('-runtime-')&&abs(req)===manifestUrl?
      (freshRuntimeManifest?new Response(JSON.stringify({lectures:[row]})):undefined):entries.get(abs(req))?.clone(),
    addAll:async()=>{}}),
  keys:async()=>[],delete:async()=>true
 };
 const self={location:new URL(origin+'/sw.js'),LYS_APP_RELEASE:{cacheKey:'qa'},addEventListener:(event,fn)=>handlers.set(event,fn),skipWaiting(){},clients:{claim(){}}};
 const freshLectureRows=[row,...Array.from({length:86},(_,i)=>({...row,source_path:'1_강의페이지/qa-'+i+'.html'}))];
 const fetch=async req=>{
  requests.push(abs(req));
  if(!online)throw Error('offline');
  if(abs(req)===manifestUrl)return new Response(JSON.stringify({lectures:freshLectureRows}),{status:200,headers:{'Content-Type':'application/json'}});
  return new Response(live,{status,headers:{'Content-Type':mime}});
 };
 vm.runInNewContext(source,{self,caches,fetch,Response,URL,console,crypto:webcrypto,Uint8Array,importScripts(){}},{filename:'sw.js',timeout:5000});
 async function request(path,mode='navigate'){
  let pending=null;handlers.get('fetch')({request:{method:'GET',url:abs(path),mode},respondWith:r=>pending=Promise.resolve(r)});
  return {intercepted:!!pending,response:pending?await pending:null};
 }
 return {request,entries,requests};
}
await check('offline uncached lecture fails closed 503',async()=>{const h=setup(),r=await h.request(lecture);assert.equal(r.response.status,503);assert.match(await r.response.text(),/다시 열어 주세요/);assert.equal(r.response.headers.get('Cache-Control'),'no-store')});
await check('offline cached exact source remains accessible',async()=>{const r=await setup({cached:original}).request(lecture);assert.equal(await r.response.text(),original)});
await check('old poisoned app-shell cache rejected',async()=>{const r=await setup({cached:shell}).request(lecture);assert.equal(r.response.status,503)});
await check('online exact source is cached',async()=>{const h=setup({online:true}),r=await h.request(lecture);assert.equal(await r.response.text(),original);assert.equal(await h.entries.get(abs(lecture)).text(),original)});
await check('online 200 app-shell fallback rejected and never cached',async()=>{const h=setup({online:true,live:shell}),r=await h.request(lecture);assert.equal(r.response.status,503);assert.equal(h.entries.has(abs(lecture)),false)});
await check('invalid online source uses only verified offline cache',async()=>{const r=await setup({online:true,live:shell,cached:original}).request(lecture);assert.equal(await r.response.text(),original)});
await check('missing canonical manifest fails closed',async()=>{const r=await setup({cached:original,manifest:false}).request(lecture);assert.equal(r.response.status,503)});
await check('same byte count but wrong source digest rejected',async()=>{const changed=original.replace('Canonical','Canonicax');assert.equal(Buffer.byteLength(changed),Buffer.byteLength(original));const r=await setup({online:true,live:changed}).request(lecture);assert.equal(r.response.status,503)});
await check('wrong content type rejected',async()=>{const r=await setup({online:true,mime:'text/plain'}).request(lecture);assert.equal(r.response.status,503)});
await check('root navigation still falls back to app shell',async()=>{const r=await setup().request('/regions');assert.equal(await r.response.text(),shell)});
await check('media request bypasses SW cache to preserve Range',async()=>{const h=setup(),r=await h.request(media,'no-cors');assert.equal(r.intercepted,false);assert.equal(h.requests.length,0)});
await check('unknown lecture path fails closed',async()=>{const r=await setup().request('/claude-library/1_강의페이지/03_질환외상/없는_강의.html');assert.equal(r.response.status,503)});
await check('online fresh 87-course manifest repairs missing install cache before Claude HTML load',async()=>{
 const h=setup({online:true,manifest:false});
 const r=await h.request(lecture);
 assert.equal(r.response.status,200);
 assert.equal(await r.response.text(),original);
});
await check('new runtime manifest wins over stale shell precache',async()=>{
 const h=setup({cached:original,staleShellManifest:true,freshRuntimeManifest:true});
 const r=await h.request(lecture);
 assert.equal(r.response.status,200);
 assert.equal(await r.response.text(),original);
});
console.log('CLAUDE ORIGINAL SOURCE-INTEGRITY SW QA | '+pass+'/'+pass+' PASS');
