import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

export const REGISTRY_PATH='data/physical-exam-realistic-assets-v1.json';

export function buildPhysicalExamWorkQueue(manifest){
  const profiles=manifest.profiles||[];
  const pilotIds=manifest.pilot?.clinical_test_ids||[];
  const byId=new Map(profiles.map(p=>[p.clinical_test_id,p]));

  const user_review=profiles
    .filter(p=>p.status==='CANDIDATE_GENERATED_USER_PREVIEW_PENDING'&&p.review?.user_preview==='PENDING'&&p.preview_candidate)
    .map(p=>({clinical_test_id:p.clinical_test_id,title_ko:p.title_ko,candidate_no:p.preview_candidate.candidate_no,asset:p.preview_candidate.preview_asset_path}));

  const generation_ready=pilotIds
    .map(id=>byId.get(id))
    .filter(p=>p?.status==='PENDING_GENERATION'&&p?.brief_status==='GENERATION_READY')
    .map(p=>({clinical_test_id:p.clinical_test_id,title_ko:p.title_ko,pilot_batch:p.pilot_batch,generation_brief_version:p.generation_brief_version||null}));

  const mandatory_deferred=profiles
    .filter(p=>String(p.status||'').startsWith('INCOMPLETE_DEFERRED'))
    .map(p=>({clinical_test_id:p.clinical_test_id,title_ko:p.title_ko,status:p.status,reason:p.generation_blocker?.reason||null}));

  const binary_recovery=profiles
    .filter(p=>p.status==='USER_APPROVED_ASSETS_BINARY_TRANSFER_PENDING'||(
      p.status==='CANDIDATE_GENERATED_USER_PREVIEW_PENDING'&&
      !p.preview_candidate&&
      (
        p.binary_handoff?.state==='BLOCKED'||
        ['ct091','ct092'].includes(p.clinical_test_id)
      )
    ))
    .map(p=>({
      clinical_test_id:p.clinical_test_id,
      title_ko:p.title_ko,
      status:p.status,
      user_preview:p.review?.user_preview||null,
      gen_id:p.gen_id||p.binary_handoff?.gen_id||null,
      blocks_generation_queue:p.binary_handoff?.blocks_generation_queue===true
    }));

  const blocking_binary_handoff=profiles
    .filter(p=>p.binary_handoff?.state==='BLOCKED'&&p.binary_handoff?.blocks_generation_queue===true)
    .map(p=>({
      clinical_test_id:p.clinical_test_id,
      title_ko:p.title_ko,
      gen_id:p.gen_id||p.binary_handoff?.gen_id||null,
      reason:p.binary_handoff?.reason||null,
      next_required_action:p.binary_handoff?.next_required_action||null
    }));

  const approved=profiles
    .filter(p=>p.status==='APPROVED')
    .map(p=>p.clinical_test_id);

  return{
    generated_at_policy:'runtime-derived-no-stale-timestamp',
    pilot_batch:manifest.pilot?.batch_id||null,
    next_generation:blocking_binary_handoff.length?null:(generation_ready[0]?.clinical_test_id||null),
    user_review,
    generation_ready,
    mandatory_deferred,
    binary_recovery,
    blocking_binary_handoff,
    approved
  };
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const manifest=JSON.parse(fs.readFileSync(REGISTRY_PATH,'utf8'));
  console.log(JSON.stringify(buildPhysicalExamWorkQueue(manifest),null,2));
}
