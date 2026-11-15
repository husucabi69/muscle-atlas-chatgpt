#!/usr/bin/env node
/** Prevent the legacy 183-record export from drifting from the 205-record runtime Knowledge Core. */
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const load=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const core=load('data/knowledge-core-v1.json');
const legacy=load('data/muscles-v1.json');
const manifest=load('data/integration/orthoos-export-manifest-v1.json');
const contract=load('data/integration/orthoos-readonly-contract-v1.json');
const patch=load('data/clinical-safety-patch-manifest-20261115.json');
assert.equal(patch.runtime_knowledge_core.muscles,205,'safety patch runtime count');
assert.equal(patch.legacy_fallback.muscles,183,'safety patch legacy count');
assert.equal(patch.clinical_hold.count,38,'safety patch hold count');
assert.equal(patch.production_approved,false,'preview patch must not assert production approval');
assert.equal(manifest.dataset_version,core.dataset_version,'OrthoOS manifest version drift');
assert.equal(contract.version_pin?.dataset_version,core.dataset_version,'OrthoOS contract version drift');
assert.equal(core.muscles.length,205,'runtime Knowledge Core must have 205 muscles');
assert.equal(legacy.length,183,'legacy export count must not silently change without migration');
const byId=new Map(core.muscles.map(m=>[m.muscle_id,m]));
assert.equal(byId.size,205,'unique runtime IDs');
const map=[['origin','origin'],['insertion','insertion'],['function','function'],['nerve','innervation_text'],['blood','blood_supply_text'],['palpation','palpation_text'],['stretch','stretch_text'],['mmt','mmt_text'],['pathology','clinical_text']];
let checks=0;
for(const m of legacy){
 const c=byId.get(m.id);
 assert(c,'runtime missing legacy ID '+m.id);
 assert.equal(c.name_ko,m.ko,'Korean name drift '+m.id);
 assert.equal(c.name_en,m.en,'English name drift '+m.id);
 for(const [field,source] of map){
  const runtime=['origin','insertion','function'].includes(field)?c.anatomy?.[field]:c[source];
  assert.equal(runtime||'',m[field]||'','field drift '+m.id+'.'+field);
  checks++;
 }
}
const ids=Array.from({length:205},(_,i)=>'m'+String(i+1).padStart(3,'0'));
for(const id of ids)assert(byId.has(id),'missing runtime ID '+id);
console.log(JSON.stringify({test:'knowledge-core-legacy-sync',status:'PASS',runtime:205,legacy:183,field_checks:checks,clinical_review:'NOT_ASSERTED'}));
