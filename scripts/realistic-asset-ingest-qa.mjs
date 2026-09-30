import fs from 'node:fs';
import {
  readWebpDimensions,
  validateCandidate,
  validateAssetBytes,
  approvalGateForDimensions,
  buildApprovedProfile
} from './ingest-realistic-exercise-asset.mjs';

const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});
const throws=(fn,pattern)=>{try{fn();return false;}catch(e){return pattern?pattern.test(String(e.message)):true;}};

const sample=fs.readFileSync('assets/patient-exercise-realistic/px002.webp');
const dims=readWebpDimensions(sample);
check('Existing realistic WebP dimensions readable',dims.width>=320&&dims.height>=400,`${dims.width}x${dims.height}`);
check('Existing realistic WebP passes ingest byte gate',(()=>{try{return Boolean(validateAssetBytes(sample));}catch{return false;}})());

const candidate={profile_id:'px777',status:'CANDIDATE_GENERATED',gen_id:'test-generation-id-12345',approval_blockers:[],candidate_review:{clinical_content:'PASS',visual_pose:'PASS',embedded_text:'PASS'},review_note:''};
check('Clean generated candidate can enter approval gate',validateCandidate(candidate)===true);
check('Approval blocker stops materialization',throws(()=>validateCandidate({...candidate,approval_blockers:[{code:'TEST_BLOCKER'}]}),/TEST_BLOCKER/));
check('Pending slot cannot skip candidate review',throws(()=>validateCandidate({...candidate,status:'PENDING_GENERATION'}),/CANDIDATE_GENERATED/));
check('Generator provenance mismatch is rejected',throws(()=>validateCandidate(candidate,{genId:'wrong-id'}),/mismatch/));
check('Incomplete three-part candidate review blocks approval',
  throws(()=>validateCandidate({...candidate,candidate_review:{clinical_content:'PASS',visual_pose:'PENDING',embedded_text:'PASS'}}),/candidate review gate incomplete/)
);
check('Missing candidate review blocks approval',
  throws(()=>validateCandidate({...candidate,candidate_review:undefined}),/candidate review gate incomplete/)
);
check('Mobile asset stays A4-HD pending',approvalGateForDimensions({width:640,height:800})==='MOBILE_PREVIEW_APPROVED_A4_HD_PENDING');
check('Large asset stays A4-HD pending until visual review',approvalGateForDimensions({width:1240,height:1754})==='MOBILE_PREVIEW_APPROVED_A4_HD_PENDING');
check('Explicit A4 visual review may clear print fallback gate',approvalGateForDimensions({width:1240,height:1754},{a4Reviewed:true})==='A4_HD_APPROVED');
check('A4 approval rejects undersized asset',throws(()=>approvalGateForDimensions({width:640,height:800},{a4Reviewed:true}),/requires at least/));

const approved=buildApprovedProfile(candidate,{dims:{width:640,height:800},integratedOn:'2026-09-30',assetUrl:'./assets/patient-exercise-realistic/px777.webp'});
check('Approved profile records repository asset URL',approved.status==='APPROVED'&&approved.composite_url.endsWith('px777.webp'));
check('Approved profile records resolution and gate',approved.preview_resolution==='640x800'&&approved.asset_gate==='MOBILE_PREVIEW_APPROVED_A4_HD_PENDING');

let failed=0;
for(const x of checks){
  console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?' | '+x.detail:''}`);
  if(!x.pass)failed++;
}
console.log('\n--- REALISTIC ASSET INGEST QA ---');
console.log(`PASS=${checks.length-failed} FAIL=${failed}`);
if(failed)process.exit(1);
