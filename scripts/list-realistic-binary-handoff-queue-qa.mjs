import fs from 'node:fs';
import {buildBinaryHandoffQueue} from './list-realistic-binary-handoff-queue.mjs';

const manifest=JSON.parse(fs.readFileSync('data/patient-exercise-realistic-assets-v1.json','utf8'));
const q=buildBinaryHandoffQueue(manifest);
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

check('binary handoff queue is not empty',q.length>0,String(q.length));
check('queue starts at px008 after px007 loss resolution',q[0]?.profile_id==='px008',q[0]?.profile_id||'');
check('queue is stable-ID ordered',q.every((x,i)=>i===0||q[i-1].profile_id.localeCompare(x.profile_id)<0),q.map(x=>x.profile_id).join(','));
check('every queue item has exact gen_id',q.every(x=>typeof x.gen_id==='string'&&x.gen_id.length>20));
check('every queue item has checkpoint',q.every(x=>typeof x.checkpoint_path==='string'&&x.checkpoint_path.length>0));
check('every checkpoint identity matches manifest candidate',q.every(x=>x.checkpoint_identity_pass),JSON.stringify(q.map(x=>({id:x.profile_id,pass:x.checkpoint_identity_pass,error:x.error}))));
check('every queue item points to canonical WebP output',q.every(x=>x.output_path==='assets/patient-exercise-realistic/'+x.profile_id+'.webp'));
check('queue keeps candidates blocked until binary recovery',q.every(x=>x.binary_state==='BLOCKED'));
check('no queue item is already visible in app',q.every(x=>{
  const p=manifest.profiles.find(v=>v.profile_id===x.profile_id);
  return p?.composite_url===null;
}));

let failed=0;
for(const x of checks){
  console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?' | '+x.detail:''}`);
  if(!x.pass)failed++;
}
console.log('\n--- REALISTIC BINARY HANDOFF QUEUE QA ---');
console.log(`PASS=${checks.length-failed} FAIL=${failed}`);
if(failed)process.exit(1);
