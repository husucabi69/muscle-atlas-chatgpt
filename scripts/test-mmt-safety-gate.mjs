#!/usr/bin/env node
/**
 * Patient-safety gate: 38 copied elbow MMT instructions are quarantined in
 * canonical JSON and embedded offline PWA fallback. Does not approve new MMT.
 */
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const canonical=JSON.parse(read('data/muscles-v1.json'));
const ledger=JSON.parse(read('data/mmt-safety-hold-v1.json'));
const html=read('index.html');
const begin=html.indexOf('const muscles=')+'const muscles='.length;
const end=html.indexOf(';\nconst usInfo=',begin);
assert(begin>20&&end>begin,'embedded fallback array location');
const embedded=JSON.parse(html.slice(begin,end));
assert.equal(canonical.length,embedded.length,'canonical/fallback count');
const byId=new Map(embedded.map(m=>[m.id,m]));
const holdIds=new Set(ledger.flagged.map(m=>m.id));
assert.equal(holdIds.size,38,'expected unique safety holds');
assert.equal(ledger.clinical_approval,false,'specialist sign-off pending');
for(const m of canonical){
 const fallback=byId.get(m.id);
 assert(fallback,'missing embedded ID '+m.id);
 assert.equal(fallback.mmt,m.mmt,'fallback MMT mismatch '+m.id);
 if(holdIds.has(m.id)){
  assert(m.mmt.includes('검수 대기')&&m.mmt.includes('임상 사용을 보류'),'unsafe MMT not quarantined '+m.id);
  assert(!/주관절의 주(굴곡|신전) 방향/.test(m.mmt),'copied elbow text still displayed '+m.id);
 }
}
for(const f of ledger.flagged){
 assert(/주관절의 주(굴곡|신전) 방향/.test(f.source_mmt),'original audit evidence missing '+f.id);
}
for(const id of ['m080','m081','m091'])assert(!holdIds.has(id),'clinically elbow-related muscle wrongly quarantined '+id);
console.log(JSON.stringify({test:'mmt-patient-safety-gate',status:'PASS',flagged:holdIds.size,canonical:canonical.length,embedded:embedded.length,clinical_signoff:false}));
