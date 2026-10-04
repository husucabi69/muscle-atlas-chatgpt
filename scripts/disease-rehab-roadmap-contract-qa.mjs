import fs from 'node:fs';

const path='data/patient-rehab-disease-roadmap-v1.json';
const data=JSON.parse(fs.readFileSync(path,'utf8'));
const errors=[];
const requiredRegions=['shoulder','elbow_forearm','wrist_hand','hip_pelvis','knee_thigh','leg_ankle_foot','cervical','thoracic_back','lumbar_sacral','abdominal_core'];
const requiredSections=['plain_language_overview','indications_contraindications_red_flags','stretching','strengthening','lifestyle_activity_modification','common_errors','return_or_reassessment_criteria','sources_last_reviewed','realistic_illustrations','mobile_and_print'];
const requiredConditionSchema=['stable_id','region_id','name_ko','name_en','plain_language_overview','who_this_is_for','do_not_exercise_or_seek_care','stretching_profile_ids','strength_profile_ids','lifestyle_activity_modification','common_errors','progression_or_phase','return_or_reassessment_criteria','evidence_sources','last_reviewed','illustration_asset_ids','print_template_id'];
const expectedPath=['환자교육','질환별 재활','해부학 부위','대표 질환','재활 프로그램'];

if(data.status!=='MANDATORY_ROADMAP') errors.push('roadmap must remain MANDATORY_ROADMAP');
if(data.completion_policy?.blocks_stage_23c!==true) errors.push('disease rehab must block Stage 23C until complete');
if(data.completion_policy?.postoperative_separate!==true) errors.push('postoperative rehab must stay separate');
if(data.completion_policy?.no_invented_dose!==true) errors.push('no_invented_dose must stay true');
if((data.completion_policy?.minimum_anatomy_regions||0)<10) errors.push('minimum anatomy regions must be >=10');

const regionIds=(data.regions||[]).map(x=>x.region_id);
for(const id of requiredRegions) if(!regionIds.includes(id)) errors.push('missing required region '+id);
if(new Set(regionIds).size!==regionIds.length) errors.push('duplicate region_id');
for(const region of data.regions||[]){
  if(!region.label_ko) errors.push(region.region_id+' missing Korean label');
  if(!Array.isArray(region.priority_conditions)||region.priority_conditions.length===0) errors.push(region.region_id+' has no priority conditions');
}

for(const key of requiredSections) if(!data.completion_policy?.required_patient_sections?.includes(key)) errors.push('missing patient section '+key);
for(const key of requiredConditionSchema) if(!data.per_condition_schema?.includes(key)) errors.push('missing per-condition schema key '+key);
if(JSON.stringify(data.patient_navigation?.primary_path)!==JSON.stringify(expectedPath)) errors.push('patient navigation path drifted');
if(data.patient_navigation?.preserve_existing_muscle_path!==true) errors.push('existing muscle patient-education path must be preserved');
if(data.patient_navigation?.print_action!=='one_click_a4_pdf') errors.push('one-click A4 print contract drifted');

const pendingTerms=(data.user_requested_terms||[]).filter(x=>x.status==='TERMINOLOGY_REVIEW_PENDING');
if(pendingTerms.length<1) errors.push('terminology-review safety queue unexpectedly empty');
for(const term of pendingTerms) if(term.normalized_target!==null) errors.push('pending terminology must not be silently normalized: '+term.term_ko);

if(errors.length){
  console.error('DISEASE REHAB ROADMAP QA FAIL');
  for(const e of errors) console.error('- '+e);
  process.exit(1);
}
console.log('DISEASE REHAB ROADMAP QA PASS | '+regionIds.length+' regions | '+requiredConditionSchema.length+' condition fields | '+pendingTerms.length+' terminology items still require review');
