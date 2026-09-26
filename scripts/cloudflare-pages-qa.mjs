import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const checks=[];
const check=(name,pass,detail='')=>{
  checks.push({name,pass:Boolean(pass),detail});
  console.log(`${pass?'PASS':'FAIL'} | ${name}${detail?' | '+detail:''}`);
};

const html=read('index.html');
const manifest=json('manifest.webmanifest');
const sw=read('sw.js');
const headers=read('_headers');

check('Manifest link is deployment-root relative',
  html.includes('<link rel="manifest" href="./manifest.webmanifest">'));

check('Legacy absolute manifest link removed',
  !html.includes('href="/muscle-atlas-chatgpt/manifest.webmanifest"'));

check('PWA stable id retained for GitHub Pages installed identity',
  manifest.id==='/muscle-atlas-chatgpt/',manifest.id);

check('PWA start_url portable across origins',
  manifest.start_url==='./?source=pwa',manifest.start_url);

check('PWA scope portable across origins',
  manifest.scope==='./',manifest.scope);

check('Service worker registration remains relative',
  html.includes("navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'})"));

check('Service worker shell paths are relative',
  sw.includes("'./index.html'") && sw.includes("'./manifest.webmanifest'") && sw.includes("'./data/knowledge-core-v1.json'"));

const ghManifest='https://husucabi69.github.io/muscle-atlas-chatgpt/manifest.webmanifest';
const cfManifest='https://preview-example.muscle-atlas-chatgpt.pages.dev/manifest.webmanifest';
check('GitHub Pages start URL resolution preserved',
  new URL(manifest.start_url,ghManifest).href==='https://husucabi69.github.io/muscle-atlas-chatgpt/?source=pwa',
  new URL(manifest.start_url,ghManifest).href);
check('GitHub Pages scope resolution preserved',
  new URL(manifest.scope,ghManifest).href==='https://husucabi69.github.io/muscle-atlas-chatgpt/',
  new URL(manifest.scope,ghManifest).href);
check('Cloudflare root start URL resolution works',
  new URL(manifest.start_url,cfManifest).href==='https://preview-example.muscle-atlas-chatgpt.pages.dev/?source=pwa',
  new URL(manifest.start_url,cfManifest).href);
check('Cloudflare root scope resolution works',
  new URL(manifest.scope,cfManifest).href==='https://preview-example.muscle-atlas-chatgpt.pages.dev/',
  new URL(manifest.scope,cfManifest).href);

for(const path of ['/sw.js','/app-version.js','/manifest.webmanifest']){
  check(`Cloudflare no-cache header present for ${path}`,
    headers.includes(path) && headers.slice(headers.indexOf(path),headers.indexOf(path)+180).includes('Cache-Control: no-cache, no-store, must-revalidate'));
}

const failed=checks.filter(x=>!x.pass);
if(failed.length){
  console.error(`Cloudflare Pages QA failed: ${failed.length}`);
  process.exit(1);
}
console.log(`Cloudflare Pages QA PASS: ${checks.length}/${checks.length}`);
