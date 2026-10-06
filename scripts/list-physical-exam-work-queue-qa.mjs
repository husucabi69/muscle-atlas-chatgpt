import fs from 'node:fs';
import {buildPhysicalExamWorkQueue} from './list-physical-exam-work-queue.mjs';

const manifest=JSON.parse(fs.readFileSync('data/physical-exam-realistic-assets-v1.json','utf8'));
const q=buildPhysicalExamWorkQueue(manifest);
const checks=[];
const check=(name,pass,detail='')=>{
  const ok=Boolean(pass);
  checks.push({name,pass:ok,detail});
  console.log(`${ok?'PASS':'FAIL'} | ${name}${detail?` | ${detail}`:''}`);
};

check('next generation is blocked until ct085 binary handoff',q.next_generation===null,q.next_generation||'none');
check('remaining generation-ready queue is ct086 -> ct087 but cannot advance yet',
  JSON.stringify(q.generation_ready.map(x=>x.clinical_test_id))===JSON.stringify(['ct086','ct087']),
  JSON.stringify(q.generation_ready));
check('remaining generation queue carries exact brief versions',
  JSON.stringify(q.generation_ready.map(x=>x.generation_brief_version))===
    JSON.stringify(['2026-10-06-ct086-v1','2026-10-06-ct087-v1']),
  JSON.stringify(q.generation_ready));
check('ct085 exact-binary handoff blocks later generation',
  q.blocking_binary_handoff?.length===1&&
  q.blocking_binary_handoff[0]?.clinical_test_id==='ct085'&&
  q.blocking_binary_handoff[0]?.gen_id==='6582ec89-607d-4ce7-bd9a-f7358f9683ff',
  JSON.stringify(q.blocking_binary_handoff));
check('ct085 is in binary-recovery queue and is not regenerated or exposed before materialization',
  q.binary_recovery.some(x=>x.clinical_test_id==='ct085'&&x.blocks_generation_queue===true)&&
  !q.user_review.some(x=>x.clinical_test_id==='ct085')&&
  !q.generation_ready.some(x=>x.clinical_test_id==='ct085'),
  JSON.stringify({binary:q.binary_recovery,user_review:q.user_review,generation:q.generation_ready}));
check('only ct083 is active user-review candidate',
  JSON.stringify(q.user_review.map(x=>x.clinical_test_id))===JSON.stringify(['ct083']),
  JSON.stringify(q.user_review));
check('ct088 is mandatory deferred, not user-review or generation-ready',
  q.mandatory_deferred.some(x=>x.clinical_test_id==='ct088')&&
  !q.user_review.some(x=>x.clinical_test_id==='ct088')&&
  !q.generation_ready.some(x=>x.clinical_test_id==='ct088'),
  JSON.stringify({deferred:q.mandatory_deferred,user_review:q.user_review,generation:q.generation_ready}));
check('ct089 remains binary-recovery queue',
  q.binary_recovery.some(x=>x.clinical_test_id==='ct089'),
  JSON.stringify(q.binary_recovery));
check('ct091 and ct092 stay binary/recovery review backlog',
  ['ct091','ct092'].every(id=>q.binary_recovery.some(x=>x.clinical_test_id===id)),
  JSON.stringify(q.binary_recovery));
for(const id of ['ct082','ct084','ct090','ct093','ct094','ct095','ct096','ct097','ct098']){
  check(id+' remains approved and excluded from generation',
    q.approved.includes(id)&&!q.generation_ready.some(x=>x.clinical_test_id===id),
    JSON.stringify({approved:q.approved,generation:q.generation_ready}));
}

const failed=checks.filter(x=>!x.pass);
console.log(`SUMMARY | ${checks.length-failed.length}/${checks.length} PASS`);
if(failed.length)process.exit(1);
