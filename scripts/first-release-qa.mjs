#!/usr/bin/env node
/** First-edition safety + provenance QA; does NOT certify 205 clinical entries. */
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const read=p=>readFileSync(p);
const text=p=>read(p).toString('utf8');
const json=p=>JSON.parse(text(p));
const hash=p=>{const b=read(p),prefix=Buffer.from('blob '+b.length+'\0');return createHash('sha1').update(prefix).update(b).digest('hex')};
const core=json('data/knowledge-core-v1.json');
const legacy=json('data/muscles-v1.json');
const holds=json('data/mmt-safety-hold-v1.json');
const reviews=json('data/mmt-specialist-review-backlog-v1.json');
const patch=json('data/clinical-safety-patch-manifest-20261115.json');
const portal=text('first-release.html'),app=text('index.html'),sw=text('sw.js');
const version=text('app-version.js');

assert.equal(core.schema_version,'1.0.0');
assert.equal(core.muscles.length,205);
assert.equal(new Set(core.muscles.map(m=>m.muscle_id)).size,205);
assert.equal(legacy.length,183);
assert.equal(holds.flagged.length,38);
assert.equal(new Set(holds.flagged.map(m=>m.id)).size,38);
assert.equal(reviews.records.length,7);
assert.equal(holds.clinical_approval,false);
assert.equal(reviews.clinical_approval,false);
assert.equal(patch.clinical_approval,false);
assert.equal(patch.production_approved,false);
assert.equal(patch.original_3d_master,false);
assert.equal(patch.cros_filing,false);
const held=new Set(holds.flagged.map(m=>m.id));
const muscleById=new Map(core.muscles.map(m=>[m.muscle_id,m]));
let complete=0,blocked=0;
for(const m of core.muscles){
  if(m.anatomy?.origin?.trim()&&m.anatomy?.insertion?.trim()&&m.anatomy?.function?.trim()&&m.innervation_text?.trim())complete++;
  if((m.mmt_text||'').includes('임상 사용을 보류'))blocked++;
  assert.equal((m.mmt_text||'').includes('임상 사용을 보류'),held.has(m.muscle_id),'MMT quarantine mismatch '+m.muscle_id);
}
assert.equal(complete,205);assert.equal(blocked,38);
for(const m of reviews.records)assert(muscleById.has(m.id),'unknown specialist-review candidate '+m.id);
for(const item of [[patch.runtime_knowledge_core,'data/knowledge-core-v1.json'],[patch.legacy_fallback,'data/muscles-v1.json'],[patch.clinical_hold,'data/mmt-safety-hold-v1.json']]){
  assert.equal(hash(item[1]),item[0].git_blob_sha,'ORIGINAL_SOURCE_CHANGED '+item[1]);
}
assert(portal.includes('fetch(\'./data/knowledge-core-v1.json\''),'release portal must fetch actual source');
assert(portal.includes('core.muscles')&&portal.includes('held!==38'),'release portal must validate core and safety holds');
assert(!portal.includes('innerHTML'),'untrusted core content must not be injected into HTML');
assert(app.includes('href="./first-release.html"'),'app home must link to first edition');
for(const name of ['first-release.html','anatomy-coverage.html','data/knowledge-core-v1.json'])assert(sw.includes("'./"+name+"'"),'offline CORE missing '+name);
assert(version.includes(patch.preview_app_version),'release version must match pinned safe dataset');
const report={release:'LYSOS first edition preservation candidate',status:'PASS_SOURCE_INTEGRITY_NOT_CLINICAL_APPROVAL',
  canonical:205,recorded_oinf:complete,legacy:183,mmt_quarantined:blocked,specialist_review_pending:7,
  original_core_blob:patch.runtime_knowledge_core.git_blob_sha,original_legacy_blob:patch.legacy_fallback.git_blob_sha,
  original_holds_blob:patch.clinical_hold.git_blob_sha,production_approved:false,device_verified:false};
console.log(JSON.stringify(report,null,2));
