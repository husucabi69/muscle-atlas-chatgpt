import fs from 'node:fs';

const token=process.env.GITHUB_TOKEN||'';
const repository=process.env.DEPLOY_GATE_REPOSITORY||process.env.GITHUB_REPOSITORY||'';
const sha=process.env.DEPLOY_GATE_SHA||process.env.GITHUB_SHA||'';
const refName=process.env.DEPLOY_GATE_REF_NAME||process.env.GITHUB_REF_NAME||'';
const canonicalPreview='https://preview-development.muscle-atlas-chatgpt.pages.dev';
const evidencePath=process.env.DEPLOY_GATE_EVIDENCE||'/tmp/deploy-safety-evidence.json';

const checks=[];
const check=(name,pass,detail='')=>{
  const item={name,pass:Boolean(pass),detail:String(detail||'')};
  checks.push(item);
  console.log(`${item.pass?'PASS':'FAIL'} | ${item.name}${item.detail?' | '+item.detail:''}`);
  return item.pass;
};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const parseRelease=text=>{
  const pick=key=>text.match(new RegExp(`${key}:'([^']+)'`))?.[1]||'';
  return {buildVersion:pick('buildVersion'),displayVersion:pick('displayVersion'),cacheKey:pick('cacheKey')};
};
const localVersion=fs.readFileSync('app-version.js','utf8');
const localRelease=parseRelease(localVersion);

async function ghJson(url){
  const r=await fetch(url,{headers:{
    Accept:'application/vnd.github+json',
    'X-GitHub-Api-Version':'2022-11-28',
    ...(token?{Authorization:`Bearer ${token}`}:{})
  },cache:'no-store'});
  if(!r.ok)throw new Error(`GitHub ${r.status} ${url}`);
  return r.json();
}
async function fetchText(url){
  const r=await fetch(url,{cache:'no-store',headers:{'Cache-Control':'no-cache'}});
  const text=await r.text();
  return {ok:r.ok,status:r.status,text,url:r.url};
}

check('Gate runs only on canonical development branch',refName==='preview/development',refName);
check('Repository identity',repository==='husucabi69/muscle-atlas-chatgpt',repository);
check('Exact commit SHA present',/^[0-9a-f]{40}$/i.test(sha),sha);
check('Local release metadata complete',Boolean(localRelease.buildVersion&&localRelease.displayVersion&&localRelease.cacheKey),JSON.stringify(localRelease));

if(checks.some(x=>!x.pass)){
  fs.writeFileSync(evidencePath,JSON.stringify({repository,sha,refName,localRelease,checks},null,2));
  process.exit(1);
}

let cloudflare=null;
for(let i=0;i<72;i++){
  const data=await ghJson(`https://api.github.com/repos/${repository}/commits/${sha}/check-runs?per_page=100`);
  cloudflare=(data.check_runs||[]).find(x=>x.name==='Cloudflare Pages'&&x.head_sha===sha)||null;
  if(cloudflare?.status==='completed')break;
  if(i===0)console.log('WAIT | Cloudflare Pages exact-SHA deployment check is not complete yet.');
  await sleep(5000);
}

check('Cloudflare Pages check exists for exact SHA',Boolean(cloudflare),cloudflare?.head_sha||'missing');
check('Cloudflare Pages exact-SHA deploy succeeded',cloudflare?.status==='completed'&&cloudflare?.conclusion==='success',`${cloudflare?.status||'missing'}/${cloudflare?.conclusion||'missing'}`);

const summary=cloudflare?.output?.summary||'';
const commitShort=summary.match(/<code>([0-9a-f]{7,40})<\/code>/i)?.[1]||'';
const exactUrl=summary.match(/Preview URL:<\/strong><\/td><td>[\s\S]*?href=['"]([^'"]+)['"]/i)?.[1]||'';
const branchUrl=summary.match(/Branch Preview URL:<\/strong><\/td><td>[\s\S]*?href=['"]([^'"]+)['"]/i)?.[1]||'';

check('Cloudflare summary commit matches GitHub SHA',Boolean(commitShort)&&sha.startsWith(commitShort),commitShort||'missing');
check('Immutable Preview URL extracted',/^https:\/\/[0-9a-f]{8}\.muscle-atlas-chatgpt\.pages\.dev\/?$/i.test(exactUrl),exactUrl||'missing');
check('Stable branch Preview URL is canonical',branchUrl.replace(/\/$/,'')===canonicalPreview,branchUrl||'missing');

let exactVersion={ok:false,status:0,text:''},branchVersion={ok:false,status:0,text:''};
let exactManifest={ok:false,status:0,text:''},branchManifest={ok:false,status:0,text:''};
let exactSw={ok:false,status:0,text:''},branchSw={ok:false,status:0,text:''};
let exactHome={ok:false,status:0,text:''},branchHome={ok:false,status:0,text:''};

if(exactUrl&&branchUrl){
  [exactVersion,branchVersion,exactManifest,branchManifest,exactSw,branchSw,exactHome,branchHome]=await Promise.all([
    fetchText(exactUrl.replace(/\/$/,'')+'/app-version.js'),
    fetchText(branchUrl.replace(/\/$/,'')+'/app-version.js'),
    fetchText(exactUrl.replace(/\/$/,'')+'/manifest.webmanifest'),
    fetchText(branchUrl.replace(/\/$/,'')+'/manifest.webmanifest'),
    fetchText(exactUrl.replace(/\/$/,'')+'/sw.js'),
    fetchText(branchUrl.replace(/\/$/,'')+'/sw.js'),
    fetchText(exactUrl.replace(/\/$/,'')+'/'),
    fetchText(branchUrl.replace(/\/$/,'')+'/')
  ]);
}

for(const [name,item] of [
  ['Exact Preview home',exactHome],['Stable Preview home',branchHome],
  ['Exact Preview app-version.js',exactVersion],['Stable Preview app-version.js',branchVersion],
  ['Exact Preview manifest',exactManifest],['Stable Preview manifest',branchManifest],
  ['Exact Preview service worker',exactSw],['Stable Preview service worker',branchSw]
]) check(name+' smoke HTTP 200',item.ok,String(item.status));

const exactRelease=parseRelease(exactVersion.text||'');
const branchRelease=parseRelease(branchVersion.text||'');
check('Exact Preview release equals checked-out SHA release',
  exactRelease.buildVersion===localRelease.buildVersion&&exactRelease.cacheKey===localRelease.cacheKey&&exactRelease.displayVersion===localRelease.displayVersion,
  JSON.stringify(exactRelease));
check('Stable Preview release equals exact Preview release',
  branchRelease.buildVersion===exactRelease.buildVersion&&branchRelease.cacheKey===exactRelease.cacheKey&&branchRelease.displayVersion===exactRelease.displayVersion,
  JSON.stringify(branchRelease));

let exactManifestJson={},branchManifestJson={};
try{exactManifestJson=JSON.parse(exactManifest.text||'{}')}catch{}
try{branchManifestJson=JSON.parse(branchManifest.text||'{}')}catch{}
check('Exact Preview PWA manifest contract',
  exactManifestJson.start_url==='./?source=pwa'&&exactManifestJson.scope==='./',
  JSON.stringify({start_url:exactManifestJson.start_url,scope:exactManifestJson.scope}));
check('Stable Preview PWA manifest contract',
  branchManifestJson.start_url==='./?source=pwa'&&branchManifestJson.scope==='./',
  JSON.stringify({start_url:branchManifestJson.start_url,scope:branchManifestJson.scope}));
check('Exact Preview service worker uses canonical version file',
  (exactSw.text||'').includes("importScripts('./app-version.js')"));
check('Stable Preview service worker uses canonical version file',
  (branchSw.text||'').includes("importScripts('./app-version.js')"));
check('Stable Preview home declares canonical install origin',
  (branchHome.text||'').includes("APP_CANONICAL_PREVIEW_ORIGIN='https://preview-development.muscle-atlas-chatgpt.pages.dev'"));

const evidence={
  gate:'Muscle Atlas lightweight deployment safety gate',
  checked_at:new Date().toISOString(),
  repository,sha,refName,
  localRelease,
  cloudflare:{
    status:cloudflare?.status||null,
    conclusion:cloudflare?.conclusion||null,
    details_url:cloudflare?.details_url||null,
    summary_commit:commitShort||null,
    exact_preview_url:exactUrl||null,
    branch_preview_url:branchUrl||null
  },
  remoteRelease:{exact:exactRelease,branch:branchRelease},
  checks,
  result:checks.every(x=>x.pass)?'PASS':'FAIL'
};
fs.writeFileSync(evidencePath,JSON.stringify(evidence,null,2)+'\n');

if(process.env.GITHUB_STEP_SUMMARY){
  const lines=[
    '## Muscle Atlas Deploy Safety Gate',
    '',
    `- Result: **${evidence.result}**`,
    `- SHA: \`${sha}\``,
    `- Exact Preview: ${exactUrl||'missing'}`,
    `- Stable Preview: ${branchUrl||'missing'}`,
    `- Release: \`${localRelease.displayVersion}\``,
    ''
  ];
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,lines.join('\n'));
}

const failed=checks.filter(x=>!x.pass);
console.log(`\nDeploy Safety Gate: ${checks.length-failed.length}/${checks.length} PASS`);
if(failed.length)process.exit(1);
