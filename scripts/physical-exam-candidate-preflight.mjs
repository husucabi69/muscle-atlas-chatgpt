import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

export function evaluatePhysicalExamCandidate(profile,candidate){
  const rc=profile?.generation_brief?.image_render_contract;
  if(!rc)return{eligible:false,reason:'NO_STRUCTURED_RENDER_CONTRACT',checks:[]};

  const checks=[];
  const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});
  const width=Number(candidate?.width||0),height=Number(candidate?.height||0);
  const visibleText=Array.isArray(candidate?.visible_text)?candidate.visible_text.map(String):[];
  const allowed=Array.isArray(rc.allowed_text_exact)?rc.allowed_text_exact.map(String):[];
  const joined=visibleText.join(' | ');

  check('HD_DIMENSIONS',
    width>=Number(rc.output?.min_width_px||1024)&&height>=Number(rc.output?.min_height_px||1536),
    width+'x'+height);
  check('FEMALE_PATIENT',candidate?.patient_gender==='female',String(candidate?.patient_gender||'missing'));
  check('FEMALE_EXAMINER',candidate?.examiner_gender==='female',String(candidate?.examiner_gender||'missing'));
  check('SAME_IDENTITIES_ALL_PANELS',
    candidate?.same_patient_all_panels===true&&candidate?.same_examiner_all_panels===true);
  check('EXAMINER_VISIBLE_ALL_PANELS',candidate?.examiner_visible_all_panels===true);
  check('ACTIVE_ROTATION_ONLY',candidate?.active_rotation_only===true&&candidate?.passive_force_present!==true);
  check('TRUNK_SHOULDERS_FIXED',candidate?.trunk_shoulders_fixed===true);
  check('THREE_ALLOWED_HEADERS_ONLY',
    visibleText.length===allowed.length&&allowed.every(x=>visibleText.includes(x))&&visibleText.every(x=>allowed.includes(x)),
    joined);
  check('NO_NUMERIC_ANGLE_OR_CUTOFF',
    candidate?.numeric_angle_present!==true&&candidate?.degree_symbol_present!==true&&
    !(rc.forbidden_text_patterns||[]).some(pattern=>joined.toLowerCase().includes(String(pattern).toLowerCase())),
    joined);
  check('NO_RED_PAIN_OVERLAY',candidate?.red_pain_overlay_present!==true);
  check('NO_INFOGRAPHIC_COPY',candidate?.infographic_copy_present!==true);

  const failed=checks.filter(x=>!x.pass);
  return{
    eligible:failed.length===0,
    reason:failed.length?'REJECTED_VISUAL_CONTRACT':'PASS_INTERNAL_PREFLIGHT',
    failed_axes:failed.map(x=>x.name),
    checks
  };
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const registry=JSON.parse(fs.readFileSync(process.argv[2]||'data/physical-exam-realistic-assets-v1.json','utf8'));
  const id=process.argv[3];
  const auditPath=process.argv[4];
  if(!id||!auditPath){
    console.error('usage: node scripts/physical-exam-candidate-preflight.mjs <registry> <clinical_test_id> <candidate-audit.json>');
    process.exit(2);
  }
  const profile=registry.profiles?.find(x=>x.clinical_test_id===id);
  if(!profile){
    console.error('unknown clinical test: '+id);
    process.exit(2);
  }
  const candidate=JSON.parse(fs.readFileSync(auditPath,'utf8'));
  const result=evaluatePhysicalExamCandidate(profile,candidate);
  console.log(JSON.stringify(result,null,2));
  if(!result.eligible)process.exit(1);
}
