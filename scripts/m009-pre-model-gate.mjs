#!/usr/bin/env node
/**
 * LYSOS m009 pre-model anatomy gate. Read-only; no external packages.
 * A PASS means registry consistency only, NOT clinical or visual approval.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=(p)=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const fail=[];
const assert=(condition,message)=>{if(!condition)fail.push(message);};
const muscles=read('data/muscles-v1.json');
const registry=read('data/ip-asset-registry-v1.json');
const core=read('data/knowledge-core-v1.json');
const claims=read('data/anatomy/m009-claim-evidence-v1.json');
assert(claims.stable_id==='m009','claim evidence ID mismatch');
assert(['DISPUTED_LEVELS_SPECIALIST_REVIEW','SPECIALIST_RESOLVED'].includes(claims.claim_map?.innervation?.status),'innervation status must be explicit');
assert(['SAFETY_HOLD_NO_VALIDATED_ISOLATED_PROTOCOL','SPECIALIST_APPROVED_PROTOCOL'].includes(claims.claim_map?.mmt?.status),'MMT status must be explicit');
assert(typeof claims.human_review?.specialist_signed==='boolean','specialist signoff flag missing');
if(claims.human_review.specialist_signed){assert(Boolean(claims.human_review.reviewer_identity)&&Boolean(claims.human_review.reviewed_at),'specialist identity/date evidence required');}
assert(Array.isArray(muscles),'muscles-v1 must be an array');
const ids=new Set();
for(const m of muscles){
  assert(typeof m.id==='string'&&!ids.has(m.id),'duplicate/invalid ID '+m.id);
  ids.add(m.id);
}
const muscle=muscles.find(m=>m.id==='m009');
assert(Boolean(muscle),'m009 absent');
assert(registry.stable_id==='m009','IP registry ID mismatch');
assert(registry.source_registry==='data/muscles-v1.json','IP source mismatch');
if(muscle){
  const runtime=core.muscles.find(m=>m.muscle_id==='m009');
  assert(Boolean(runtime),'m009 missing from runtime Knowledge Core');
  assert(runtime?.mmt_text===muscle.mmt,'m009 runtime/fallback MMT drift');
  assert(muscle.ko==='두판상근'&&muscle.en==='Splenius capitis','m009 identity mismatch');
  for(const k of ['origin','insertion','function','nerve','blood'])assert(typeof muscle[k]==='string'&&muscle[k].length>0,'missing '+k);
  assert(/동측/.test(muscle.function)&&/신전/.test(muscle.function),'laterality/function mismatch');
}
assert(registry.model?.editable_source===null&&registry.model?.gltf_export===null,'unreviewed master declared');
assert(registry.clinical_review==='PENDING','clinical approval requires separate evidence');
const warnings=[];
if(core.muscles.length!==205)fail.push('Runtime Knowledge Core must contain 205 muscle records');
if(muscles.length!==183)warnings.push('Legacy export count changed from expected 183; review fallback migration.');
if(muscle){
  assert(!/주관절의 주(굴곡|신전) 방향/.test(muscle.mmt),'m009 unsafe elbow-joint MMT leaked into canonical');
  assert(/검수 대기/.test(muscle.mmt),'m009 MMT safety hold absent');
  warnings.push('m009 MMT held pending specialist-approved replacement; do not interpret as tested strength grading.');
}
if(!registry.external_anatomy_references_verified)warnings.push('Independent anatomy references not verified.');
console.log(JSON.stringify({gate:'m009-pre-model',status:fail.length?'FAIL':'PASS_REGISTRY_ONLY',legacy_muscle_count:muscles.length,runtime_muscle_count:core.muscles.length,errors:fail,warnings},null,2));
if(fail.length)process.exitCode=1;
