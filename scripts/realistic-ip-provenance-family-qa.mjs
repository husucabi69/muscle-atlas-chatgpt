import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ensureRealisticEducationFamilies,REALISTIC_EDUCATION_FAMILIES} from './extend-realistic-ip-provenance-families.mjs';

const source=JSON.parse(fs.readFileSync('data/ip-provenance-v1.json','utf8'));
const original=JSON.stringify(source);
const working=structuredClone(source);
ensureRealisticEducationFamilies(working);

for(const expected of REALISTIC_EDUCATION_FAMILIES){
  const matches=working.work_families.filter(x=>x.id===expected.id);
  assert.equal(matches.length,1,expected.id+' must exist exactly once');
  assert.equal(matches[0].title,expected.title,expected.id+' title must remain canonical');
}
assert.equal(JSON.stringify(source),original,'helper must not mutate the loaded source unless explicitly called on it');

const once=JSON.stringify(working);
ensureRealisticEducationFamilies(working);
assert.equal(JSON.stringify(working),once,'family migration must be idempotent');

const conflict=structuredClone(source);
conflict.work_families.push({id:'PATIENT_EXERCISE_REALISTIC',title:'wrong title'});
assert.throws(()=>ensureRealisticEducationFamilies(conflict),/conflicting family title/,'conflicting family definitions must fail closed');

console.log('REALISTIC IP FAMILY MIGRATION QA PASS | '+REALISTIC_EDUCATION_FAMILIES.map(x=>x.id).join(', '));
