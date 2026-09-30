import fs from 'node:fs';
import {checkpointIdentity} from './register-realistic-candidate.mjs';

export function buildBinaryHandoffQueue(manifest){
  return manifest.profiles
    .filter(p=>p.status==='CANDIDATE_GENERATED'&&p.asset_gate==='BINARY_HANDOFF_BLOCKED'&&p.gen_id)
    .sort((a,b)=>a.profile_id.localeCompare(b.profile_id))
    .map((p,index)=>{
      const checkpointPath=p.candidate_checkpoint_path||null;
      let checkpoint=null,error=null;
      try{checkpoint=checkpointIdentity(checkpointPath);}catch(e){error=e.message;}
      return{
        priority:index+1,
        profile_id:p.profile_id,
        title_ko:p.title_ko,
        gen_id:p.gen_id,
        checkpoint_path:checkpointPath,
        checkpoint_profile_id:checkpoint?.profile_id||null,
        checkpoint_gen_id:checkpoint?.gen_id||null,
        checkpoint_identity_pass:Boolean(checkpoint&&checkpoint.profile_id===p.profile_id&&checkpoint.gen_id===p.gen_id),
        candidate_review:p.candidate_review||null,
        output_path:'assets/patient-exercise-realistic/'+p.profile_id+'.webp',
        binary_state:p.binary_handoff?.state||null,
        next_action:'Recover exact binary for this gen_id, materialize canonical WebP, validate integrity, then re-review repository file before ingest.',
        error
      };
    });
}

if(process.argv[1]&&process.argv[1].endsWith('list-realistic-binary-handoff-queue.mjs')){
  const manifest=JSON.parse(fs.readFileSync('data/patient-exercise-realistic-assets-v1.json','utf8'));
  console.log(JSON.stringify(buildBinaryHandoffQueue(manifest),null,2));
}
