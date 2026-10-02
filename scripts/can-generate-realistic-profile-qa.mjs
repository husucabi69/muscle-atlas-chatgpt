import fs from 'node:fs';
import {canGenerateRealisticProfile} from './can-generate-realistic-profile.mjs';

const manifest=JSON.parse(fs.readFileSync('data/patient-exercise-realistic-assets-v1.json','utf8'));
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

const p7Blocked=canGenerateRealisticProfile(manifest,'px007');
check('px007 regeneration fails closed without immediate binary materialization capability',
  p7Blocked.allowed===false&&p7Blocked.reason==='BINARY_MATERIALIZATION_UNAVAILABLE',
  JSON.stringify(p7Blocked)
);
const p7=canGenerateRealisticProfile(manifest,'px007',{binaryMaterializationAvailable:true});
check('px007 regeneration is allowed only when binary materialization is available',
  p7.allowed===true&&p7.reason==='READY_REGENERATION',
  JSON.stringify(p7)
);
const p12=canGenerateRealisticProfile(manifest,'px012',{binaryMaterializationAvailable:true});
check('px012 generation stays blocked behind earliest unresolved binary handoff',
  p12.allowed===false&&p12.reason==='EARLIER_BINARY_HANDOFF_BLOCKED'&&p12.blocking_profile_id==='px008',
  JSON.stringify(p12)
);

const cleared={...manifest,profiles:manifest.profiles.map(p=>{
  if(['px007','px008','px009','px010','px011'].includes(p.profile_id)){
    return{...p,status:'APPROVED',asset_gate:'MOBILE_PREVIEW_APPROVED_A4_HD_PENDING',binary_handoff:null,composite_url:'./assets/patient-exercise-realistic/'+p.profile_id+'.webp'};
  }
  return p;
})};
const cleared12Blocked=canGenerateRealisticProfile(cleared,'px012');
check('px012 still fails closed without binary materialization after earlier handoffs clear',
  cleared12Blocked.allowed===false&&cleared12Blocked.reason==='BINARY_MATERIALIZATION_UNAVAILABLE',
  JSON.stringify(cleared12Blocked)
);
const cleared12=canGenerateRealisticProfile(cleared,'px012',{binaryMaterializationAvailable:true});
check('px012 becomes generatable only after earlier handoffs clear and materialization is available',
  cleared12.allowed===true&&cleared12.reason==='READY',
  JSON.stringify(cleared12)
);
check('approved profile cannot be regenerated',
  canGenerateRealisticProfile(manifest,'px001',{binaryMaterializationAvailable:true}).reason==='TARGET_NOT_PENDING_GENERATION'
);

let failed=0;
for(const x of checks){
  console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?' | '+x.detail:''}`);
  if(!x.pass)failed++;
}
console.log('\n--- REALISTIC GENERATION PERMISSION QA ---');
console.log(`PASS=${checks.length-failed} FAIL=${failed}`);
if(failed)process.exit(1);
