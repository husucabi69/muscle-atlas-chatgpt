#!/usr/bin/env node
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { dirname,resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveMuscleAtlas,clinicalDetailsAvailable } from '../src/anatomy/canonical-muscle-resolver.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const load=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const canonical=load('data/muscles-v1.json');
const recovered=load('data/m184-m205-recovery-inventory-v1.json');
const all=resolveMuscleAtlas(canonical,recovered);
assert.equal(all.length,205,'total ID coverage');
assert.equal(new Set(all.map(m=>m.id)).size,205,'unique IDs');
for(let i=1;i<=205;i++)assert.equal(all[i-1].id,'m'+String(i).padStart(3,'0'),'sequential ID');
const m009=all.find(m=>m.id==='m009');
assert.equal(m009.ko,'두판상근');
assert.equal(clinicalDetailsAvailable(m009),true);
for(const m of all.slice(183)){
  assert.equal(m.clinical_data_status,'IDENTITY_ONLY_NO_OIFN');
  assert.equal(clinicalDetailsAvailable(m),false);
  for(const k of ['origin','insertion','function','nerve','blood'])assert.equal(m[k],null,'no fabricated '+k+' for '+m.id);
}
assert.throws(()=>resolveMuscleAtlas(canonical,{records:[{...recovered.records[0],id:'m009'}]}),/collides/);
assert.throws(()=>resolveMuscleAtlas([...canonical,canonical[0]],recovered),/duplicate/);
assert.throws(()=>resolveMuscleAtlas(canonical,{records:[{...recovered.records[0],anatomy_oinf_status:'VERIFIED'}]}),/Invalid recovered identity/);
console.log(JSON.stringify({test:'canonical-muscle-resolver',status:'PASS',total:all.length,full_existing:183,identity_only:22,clinical_content_not_fabricated:true}));
