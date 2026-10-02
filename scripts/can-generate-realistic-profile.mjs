import fs from 'node:fs';

export function canGenerateRealisticProfile(manifest,profileId,options={}){
  const ordered=[...manifest.profiles]
    .filter(p=>/^px\d{3}$/.test(p.profile_id||''))
    .sort((a,b)=>a.profile_id.localeCompare(b.profile_id));
  const index=ordered.findIndex(p=>p.profile_id===profileId);
  if(index<0)return{allowed:false,reason:'UNKNOWN_PROFILE'};
  const target=ordered[index];
  if(!['PENDING_GENERATION','PENDING_REGENERATION'].includes(target.status)){
    return{allowed:false,reason:'TARGET_NOT_PENDING_GENERATION',status:target.status};
  }
  const earlier=ordered.slice(0,index);
  const blocker=earlier.find(p=>p.asset_gate==='BINARY_HANDOFF_BLOCKED'||p.binary_handoff?.state==='BLOCKED');
  if(blocker){
    return{
      allowed:false,
      reason:'EARLIER_BINARY_HANDOFF_BLOCKED',
      blocking_profile_id:blocker.profile_id,
      blocking_gen_id:blocker.gen_id||null
    };
  }
  if(options.binaryMaterializationAvailable!==true){
    return{
      allowed:false,
      reason:'BINARY_MATERIALIZATION_UNAVAILABLE',
      profile_id:target.profile_id,
      required_next_action:'Run generation only in a session that can immediately materialize and integrity-check the generated binary.'
    };
  }
  return{allowed:true,reason:target.status==='PENDING_REGENERATION'?'READY_REGENERATION':'READY'};
}

if(process.argv[1]&&process.argv[1].endsWith('can-generate-realistic-profile.mjs')){
  const profileId=process.argv[2];
  if(!profileId){console.error('Usage: BINARY_MATERIALIZATION_AVAILABLE=YES node scripts/can-generate-realistic-profile.mjs pxNNN');process.exit(2);}
  const manifest=JSON.parse(fs.readFileSync('data/patient-exercise-realistic-assets-v1.json','utf8'));
  const result=canGenerateRealisticProfile(manifest,profileId,{
    binaryMaterializationAvailable:process.env.BINARY_MATERIALIZATION_AVAILABLE==='YES'
  });
  console.log(JSON.stringify(result,null,2));
  if(!result.allowed)process.exit(1);
}
