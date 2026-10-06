import fs from 'node:fs';
import {canGeneratePhysicalExamProfile} from './physical-exam-generation-permission.mjs';

const manifest=JSON.parse(fs.readFileSync('data/physical-exam-realistic-assets-v1.json','utf8'));
const checks=[];
const check=(name,pass,detail='')=>{
  const ok=Boolean(pass);
  checks.push({name,pass:ok,detail});
  console.log(`${ok?'PASS':'FAIL'} | ${name}${detail?` | ${detail}`:''}`);
};

const c85NoBinary=canGeneratePhysicalExamProfile(manifest,'ct085',{binaryMaterializationAvailable:false});
check('ct085 user-approved HD binary transfer cannot be regenerated',
  !c85NoBinary.allowed&&c85NoBinary.reason==='USER_APPROVED_BINARY_TRANSFER_PENDING',
  JSON.stringify(c85NoBinary));

const c85Yes=canGeneratePhysicalExamProfile(manifest,'ct085',{binaryMaterializationAvailable:true});
check('ct085 remains regeneration-locked even when binary materialization is available',
  !c85Yes.allowed&&c85Yes.reason==='USER_APPROVED_BINARY_TRANSFER_PENDING',
  JSON.stringify(c85Yes));

const c86=canGeneratePhysicalExamProfile(manifest,'ct086',{binaryMaterializationAvailable:true});
check('ct086 is the next permitted generation target after ct085 Preview connection',
  c86.allowed&&c86.reason==='READY'&&c86.generation_brief_version==='2026-10-06-ct086-v1',
  JSON.stringify(c86));

const c87=canGeneratePhysicalExamProfile(manifest,'ct087',{binaryMaterializationAvailable:true});
check('ct087 cannot skip ahead of ct086',
  !c87.allowed&&c87.reason==='OUT_OF_ORDER'&&c87.required_next_clinical_test_id==='ct086',
  JSON.stringify(c87));

const c88=canGeneratePhysicalExamProfile(manifest,'ct088',{binaryMaterializationAvailable:true});
check('ct088 user-deferred incomplete is hard-blocked from generation',
  !c88.allowed&&c88.reason==='USER_DEFERRED',
  JSON.stringify(c88));

for(const id of ['ct082','ct084','ct090','ct093','ct094','ct095','ct096','ct097','ct098']){
  const r=canGeneratePhysicalExamProfile(manifest,id,{binaryMaterializationAvailable:true});
  check(id+' approved asset is regeneration-locked',
    !r.allowed&&r.reason==='APPROVED_REGENERATION_LOCKED',
    JSON.stringify(r));
}

const c83=canGeneratePhysicalExamProfile(manifest,'ct083',{binaryMaterializationAvailable:true});
check('ct083 user-preview candidate cannot be duplicate-generated',
  !c83.allowed&&c83.reason==='USER_PREVIEW_PENDING_NO_DUPLICATE_GENERATION',
  JSON.stringify(c83));

const failed=checks.filter(x=>!x.pass);
console.log(`SUMMARY | ${checks.length-failed.length}/${checks.length} PASS`);
if(failed.length)process.exit(1);
