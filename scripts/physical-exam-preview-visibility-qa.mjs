import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync('index.html','utf8');
const start=html.indexOf('function physicalExamRealisticCandidateHtml(test){');
const end=html.indexOf('function clinicalExamTeachingNote(test){',start);
if(start<0||end<=start)throw Error('clinical exam candidate renderer missing');
const source=html.slice(start,end);
const esc=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const test={clinical_test_id:'ct086',name_ko:'경추 회전 ROM 평가'};
const state={profile:null};
const render=vm.runInNewContext('('+source.replace('function physicalExamRealisticCandidateHtml','function')+')',
 {physicalExamRealisticProfile:()=>state.profile,esc});
const checks=[];
const check=(name,pass)=>{checks.push(Boolean(pass));console.log((pass?'PASS':'FAIL')+' | '+name);};
const baseline={
 clinical_test_id:'ct086',status:'PENDING_GENERATION',
 generation_brief:{render_contract_required:true},
 inflight_render_task:{state:'IMAGE_SUCCEEDED_BINARY_TRANSFER_PENDING'},
 review:{user_preview:'PENDING'},
 preview_candidate:{preview_asset_path:'./assets/physical-exam-realistic/candidates/fake.webp'}
};
state.profile=baseline;
let h=render(test);
check('Generated-only ct086 displays an honest in-progress message and NO unverified image',
 h.includes('원본 확인 중')&&!h.includes('<img')&&h.includes('기존 검사 도해'));
state.profile={...baseline,status:'CANDIDATE_GENERATED_USER_PREVIEW_PENDING'};
h=render(test);
check('Fake ct086 candidate path cannot bypass binary+clinical review gate',!h.includes('<img'));
state.profile={...baseline,status:'CANDIDATE_GENERATED_USER_PREVIEW_PENDING',
 inflight_render_task:{state:'IMAGE_VERIFIED_USER_PREVIEW_PENDING'},
 preview_candidate:{...baseline.preview_candidate,exact_binary_verified:true,
  preflight_passed:true,source_sha256:'a'.repeat(64),preview_webp_sha256:'b'.repeat(64)}
};
h=render(test);
check('Exact-verified ct086 shows amber preview candidate but NOT approved',h.includes('<img')&&
 h.includes('승인 전')&&!h.includes('실사형 승인본')&&h.includes('원본 크기로 열기'));
state.profile={...state.profile,preview_candidate:{...state.profile.preview_candidate,exact_binary_verified:false}};
check('Tampered ct086 binary flag hides preview again',!render(test).includes('<img'));
state.profile={clinical_test_id:'ct083',status:'CANDIDATE_GENERATED_USER_PREVIEW_PENDING',
 generation_brief:{render_contract_required:false},review:{user_preview:'PENDING'},
 preview_candidate:{preview_asset_path:'./assets/physical-exam-realistic/candidates/legacy.webp'}};
check('Legacy under-review illustration remains visible, no migration regression',render({...test,clinical_test_id:'ct083'}).includes('<img'));
state.profile={clinical_test_id:'ct085',status:'APPROVED',composite_url:'./assets/physical-exam-realistic/approved/ct085.webp',
 review:{user_preview:'PASS'},approved_asset:{gen_id:'valid-approved'}};
h=render({...test,clinical_test_id:'ct085'});
check('Previously approved image remains visible and green-approved',h.includes('<img')&&h.includes('실사형 승인본'));
state.profile={clinical_test_id:'ct088',status:'INCOMPLETE_DEFERRED_MUST_REVISIT',
 review:{user_preview:'DEFERRED'}};
check('Hoffmann deferred status preserves its existing fallback',render({...test,clinical_test_id:'ct088'}).includes('미완성 보류'));
const failures=checks.filter(x=>!x).length;
console.log('Physical Examination clinical visual candidate visibility: '+(checks.length-failures)+'/'+checks.length+' PASS');
if(failures)process.exit(1);
