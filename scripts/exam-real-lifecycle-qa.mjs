import fs from 'node:fs';

const registry=JSON.parse(fs.readFileSync('data/physical-exam-realistic-assets-v1.json','utf8'));
const profiles=registry.profiles||[];
const allowed=new Set([
  'PENDING_GENERATION',
  'PREVIEW_CANDIDATE_READY',
  'APPROVED',
  'INCOMPLETE_DEFERRED_BY_USER_2026_10_04',
  'USER_APPROVED_ASSETS_BINARY_TRANSFER_PENDING'
]);
const failures=[];
const check=(name,ok,detail='')=>{
  console.log((ok?'PASS':'FAIL')+' | '+name+(detail?' | '+detail:''));
  if(!ok) failures.push({name,detail});
};

check('All EXAM-REAL lifecycle states recognized',profiles.every(p=>allowed.has(p.status)),
  profiles.filter(p=>!allowed.has(p.status)).map(p=>p.clinical_test_id+':'+p.status).join(','));

for(const p of profiles){
  if(p.status==='APPROVED'){
    check(p.clinical_test_id+' canonical approval has binary metadata',
      p.review?.user_preview==='PASS'&&Boolean(p.approved_asset)&&Boolean(p.composite_url));
  }
  if(p.status==='USER_APPROVED_ASSETS_BINARY_TRANSFER_PENDING'){
    check(p.clinical_test_id+' user approval remains non-canonical until binary transfer',
      p.review?.user_preview==='PASS'&&!p.approved_asset&&!p.preview_candidate&&!p.composite_url&&
      Array.isArray(p.approval_blockers)&&p.approval_blockers.length>0);
  }
  if(p.status==='INCOMPLETE_DEFERRED_BY_USER_2026_10_04'){
    check(p.clinical_test_id+' deferred visual remains non-canonical',
      p.review?.user_preview==='DEFERRED'&&!p.approved_asset&&!p.preview_candidate&&!p.composite_url);
  }
}

console.log('\nEXAM-REAL lifecycle QA: '+(failures.length?'FAIL':'PASS'));
if(failures.length) process.exit(1);
