import fs from 'node:fs';
import {getNextMainlineTask} from './next-realistic-exercise-task.mjs';
import {checkpointIdentity} from './register-realistic-candidate.mjs';

const manifest=JSON.parse(fs.readFileSync('data/patient-exercise-realistic-assets-v1.json','utf8'));
const requests=JSON.parse(fs.readFileSync('data/patient-exercise-render-requests-v1.json','utf8'));
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,Boolean:!!pass,pass:!!pass,detail});

const blocked=manifest.profiles
  .filter(p=>p.status==='CANDIDATE_GENERATED'&&!p.candidate_asset_path&&p.gen_id)
  .sort((a,b)=>a.profile_id.localeCompare(b.profile_id));

check('At least one reviewed candidate is waiting for binary handoff',blocked.length>0,String(blocked.length));

for(const p of blocked){
  check(p.profile_id+' uses binary-handoff gate',p.asset_gate==='BINARY_HANDOFF_BLOCKED',p.asset_gate||'');
  check(p.profile_id+' has checkpoint path',typeof p.candidate_checkpoint_path==='string'&&p.candidate_checkpoint_path.length>0,p.candidate_checkpoint_path||'');
  const checkpointExists=typeof p.candidate_checkpoint_path==='string'&&fs.existsSync(p.candidate_checkpoint_path);
  check(p.profile_id+' checkpoint exists',checkpointExists,p.candidate_checkpoint_path||'');
  if(checkpointExists){
    let identity=null,error=null;
    try{identity=checkpointIdentity(p.candidate_checkpoint_path);}catch(e){error=e.message;}
    check(p.profile_id+' checkpoint is readable',Boolean(identity),error||'');
    check(p.profile_id+' checkpoint keeps same profile ID',identity?.profile_id===p.profile_id,identity?.profile_id||'');
    check(p.profile_id+' checkpoint keeps same exact gen_id',identity?.gen_id===p.gen_id,identity?.gen_id||'');
  }
  check(p.profile_id+' records blocked handoff state',p.binary_handoff?.state==='BLOCKED',p.binary_handoff?.state||'');
  check(p.profile_id+' keeps app asset off-screen',p.composite_url===null,String(p.composite_url));
  check(p.profile_id+' has no content blocker that would force regeneration',
    Array.isArray(p.approval_blockers)&&p.approval_blockers.length===0,
    JSON.stringify(p.approval_blockers||[])
  );
  check(p.profile_id+' pre-binary clinical review passed',p.candidate_review?.clinical_content==='PASS',p.candidate_review?.clinical_content||'');
  check(p.profile_id+' pre-binary visual-pose review passed',p.candidate_review?.visual_pose==='PASS',p.candidate_review?.visual_pose||'');
  check(p.profile_id+' embedded-text review is PASS or explicitly pending binary recheck',
    ['PASS','PENDING'].includes(p.candidate_review?.embedded_text),
    p.candidate_review?.embedded_text||''
  );
  if(p.candidate_review?.embedded_text==='PENDING'){
    check(p.profile_id+' pending embedded text explicitly waits for recovered binary',
      /binary|파일|회수/i.test(p.candidate_review?.note||''),
      p.candidate_review?.note||''
    );
  }
  const request=requests.requests?.find(x=>x.profile_id===p.profile_id);
  if(request){
    check(p.profile_id+' render request does not ask for regeneration',
      request.status==='REVIEWED_CANDIDATE_BINARY_HANDOFF_BLOCKED',
      request.status||''
    );
    check(p.profile_id+' render request keeps exact gen_id',request.gen_id===p.gen_id,request.gen_id||'');
  }
}

check('Earliest remaining binary-handoff candidate is px008',blocked[0]?.profile_id==='px008',blocked[0]?.profile_id||'');
const next=getNextMainlineTask(manifest);
check('px007 regeneration correctly precedes later binary-handoff queue',
  next?.profile_id==='px007'&&next?.action==='REGENERATE_FROM_LOCKED_BRIEF',
  JSON.stringify(next)
);

let failed=0;
for(const x of checks){
  console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?' | '+x.detail:''}`);
  if(!x.pass)failed++;
}
console.log('\n--- REVIEWED CANDIDATE BINARY HANDOFF QA ---');
console.log(`PASS=${checks.length-failed} FAIL=${failed}`);
if(failed)process.exit(1);
