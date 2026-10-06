import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const failures=[];
const pass=(name,ok,detail='')=>{
  console.log(`${ok?'PASS':'FAIL'} | ${name}${detail?' | '+detail:''}`);
  if(!ok) failures.push({name,detail});
};

const rehab=json('data/patient-rehab-disease-content-v1.json');
const coverage=json('data/patient-rehab-disease-coverage-v1.json');
const exercise=json('data/patient-exercise-library-v1.json');
const realistic=json('data/patient-exercise-realistic-assets-v1.json');

pass('Disease rehab schema v1',rehab.schema_version==='1.0.0',rehab.schema_version);
pass('Disease rehab condition count remains populated',(rehab.conditions||[]).length>=8,String((rehab.conditions||[]).length));
pass('Disease rehab conditions have print IDs',(rehab.conditions||[]).every(c=>Boolean(c.print_template_id)));
pass('Disease rehab print IDs are consistent',new Set((rehab.conditions||[]).map(c=>c.print_template_id)).size===1);
pass('Disease rehab print ID remains named',(rehab.conditions||[]).every(c=>c.print_template_id.length>=8));
pass('Disease rehab print references do not drift',(rehab.conditions||[]).every(c=>c.print_template_id===(rehab.conditions||[])[0].print_template_id));
pass('Disease rehab print contract count',(rehab.conditions||[]).map(c=>c.print_template_id).length===(rehab.conditions||[]).length);
pass('Disease rehab print ref values',(rehab.conditions||[]).every(c=>!!c.print_template_id));
pass('Disease rehab print ref count',(rehab.conditions||[]).filter(c=>Boolean(c.print_template_id)).length>=8);
pass('Disease rehab print refs baseline',(rehab.conditions||[]).filter(c=>Boolean(c.print_template_id)).length>7);
pass('Disease rehab print refs exact current coverage',(rehab.conditions||[]).filter(c=>Boolean(c.print_template_id)).length===(rehab.conditions||[]).length);
pass('Disease rehab print refs all present',(rehab.conditions||[]).filter(c=>Boolean(c.print_template_id)).length>7);
pass('Disease rehab missing print refs zero',(rehab.conditions||[]).filter(c=>!Boolean(c.print_template_id)).length===0);
pass('Disease rehab print refs count positive',(rehab.conditions||[]).length>0);
pass('Disease rehab coverage rows present',(coverage.regions||[]).length>5);
pass('Disease rehab coverage rows stay broad',(coverage.regions||[]).length>=8);
pass('Disease rehab coverage schema v1',coverage.schema_version==='1.0.0',coverage.schema_version);
pass('Preview-only dataset',rehab.status==='PREVIEW_DEVELOPMENT'&&coverage.status==='PREVIEW_DEVELOPMENT',`${rehab.status}/${coverage.status}`);
pass('Patient-safety policy',rehab.content_policy?.postoperative_separate===true && rehab.content_policy?.no_invented_dose===true && rehab.content_policy?.red_flags_before_exercise===true);

const sourceIds=new Set(Object.keys(rehab.sources||{}));
const profileIds=new Set((exercise.profiles||[]).map(x=>x.profile_id));
const realisticIds=new Set((realistic.profiles||[]).map(x=>x.profile_id));
const ids=[];
const errors=[];
const requiredText=['stable_id','region_id','name_ko','name_en','plain_language_overview','who_this_is_for','progression_or_phase','last_reviewed','print_template_id'];
const requiredArrays=['do_not_exercise_or_seek_care','lifestyle_activity_modification','common_errors','return_or_reassessment_criteria','evidence_source_ids','illustration_asset_ids'];
for(const c of rehab.conditions||[]){
  ids.push(c.stable_id);
  for(const k of requiredText) if(!String(c[k]||'').trim()) errors.push(`${c.stable_id}:missing_${k}`);
  for(const k of requiredArrays) if(!Array.isArray(c[k])||!c[k].length) errors.push(`${c.stable_id}:missing_${k}`);
  for(const block of ['stretching','strengthening']){
    const b=c[block];
    if(!b||!String(b.principle||'').trim()) errors.push(`${c.stable_id}:${block}:principle`);
    for(const pid of b?.profile_ids||[]) if(!profileIds.has(pid)) errors.push(`${c.stable_id}:${block}:bad_profile:${pid}`);
    for(const aid of b?.asset_slots||[]) if(!String(aid||'').startsWith('rehab_asset_')) errors.push(`${c.stable_id}:${block}:bad_asset_slot:${aid}`);
  }
  for(const sid of c.evidence_source_ids||[]) if(!sourceIds.has(sid)) errors.push(`${c.stable_id}:bad_source:${sid}`);
  if(!/^2026-\d{2}-\d{2}$/.test(c.last_reviewed||'')) errors.push(`${c.stable_id}:bad_last_reviewed`);
}
const dup=[...new Set(ids.filter((x,i)=>ids.indexOf(x)!==i))];
const conditionIdSet=new Set(ids);
const regionIds=[...new Set((rehab.conditions||[]).map(x=>x.region_id).filter(Boolean))];
pass('Disease rehab Stable IDs unique',dup.length===0,dup.join(','));
pass('Disease rehab content integrity',errors.length===0,errors.slice(0,30).join(','));
const illustrationContractErrors=[];
for(const c of rehab.conditions||[]){
  const declared=new Set(c.illustration_asset_ids||[]);
  const used=[...(c.stretching?.asset_slots||[]),...(c.strengthening?.asset_slots||[])];
  for(const aid of used) if(!declared.has(aid)) illustrationContractErrors.push(c.stable_id+':slot_not_declared:'+aid);
  for(const aid of declared) if(!used.includes(aid)) illustrationContractErrors.push(c.stable_id+':declared_not_used:'+aid);
}
pass('Disease rehab illustration slot contract',illustrationContractErrors.length===0,illustrationContractErrors.join(','));
pass('Shoulder seed coverage >= 2',(rehab.conditions||[]).filter(x=>x.region_id==='shoulder').length>=2,String((rehab.conditions||[]).filter(x=>x.region_id==='shoulder').length));
pass('Multiregion disease rehab coverage >= 7',regionIds.length>=7,`${regionIds.length}: ${regionIds.join(',')}`);
pass('Cervical nonspecific neck pain seed is evidence-linked and dose-safe',(()=>{
  const c=(rehab.conditions||[]).find(x=>x.stable_id==='rehab_cervical_nonspecific_neck_pain_v1');
  return c?.region_id==='cervical' && c?.evidence_source_ids?.includes('src_neck_2025_cpg') &&
    /특정 운동|고정된 운동량|임의의 반복/.test(String(c?.progression_or_phase||'')) &&
    (c?.do_not_exercise_or_seek_care||[]).some(x=>/근력저하|보행|균형/.test(x));
})());

const roadmap=JSON.parse(fs.readFileSync('data/patient-rehab-disease-roadmap-v1.json','utf8'));
const canonicalRegionIds=new Set((roadmap.regions||[]).map(x=>x.region_id));
const regionAlias={elbow:'elbow_forearm',ankle_foot:'leg_ankle_foot',foot:'leg_ankle_foot'};
const canonicalRegion=id=>regionAlias[id]||id;
const contentCanonicalRegions=new Set((rehab.conditions||[]).map(x=>canonicalRegion(x.region_id)).filter(Boolean));
const coverageCanonicalRegions=new Set((coverage.regions||[]).map(x=>canonicalRegion(x.region_id)).filter(Boolean));
const regionContractErrors=[];
for(const c of rehab.conditions||[]) if(!canonicalRegionIds.has(canonicalRegion(c.region_id))) regionContractErrors.push(c.stable_id+':unknown_canonical_region:'+c.region_id);
for(const r of coverage.regions||[]) if(!canonicalRegionIds.has(canonicalRegion(r.region_id))) regionContractErrors.push('coverage:unknown_canonical_region:'+r.region_id);
for(const id of contentCanonicalRegions) if(!coverageCanonicalRegions.has(id)) regionContractErrors.push('content_region_missing_from_coverage:'+id);
pass('Roadmap/coverage/content canonical region contract',regionContractErrors.length===0,regionContractErrors.join(','));

const matrix=coverage.regions||[];
const matrixIds=matrix.map(x=>x.region_id);
const matrixDup=[...new Set(matrixIds.filter((x,i)=>matrixIds.indexOf(x)!==i))];
const matrixErrors=[];
for(const r of matrix){
  if(!['SEEDED','PENDING'].includes(r.status)) matrixErrors.push(`${r.region_id}:bad_status`);
  if(r.status==='SEEDED'&&(!Array.isArray(r.condition_ids)||!r.condition_ids.length)) matrixErrors.push(`${r.region_id}:seeded_without_condition`);
  for(const cid of r.condition_ids||[]) if(!conditionIdSet.has(cid)) matrixErrors.push(`${r.region_id}:unknown_condition:${cid}`);
  if(!String(r.next_priority||'').trim()) matrixErrors.push(`${r.region_id}:missing_next_priority`);
}
pass('Coverage matrix has >= 10 target regions',matrix.length>=Number(coverage.minimum_region_gate||10),`${matrix.length}/${coverage.minimum_region_gate}`);
pass('Coverage matrix region IDs unique',matrixDup.length===0,matrixDup.join(','));
pass('Coverage matrix references valid',matrixErrors.length===0,matrixErrors.join(','));
pass('Coverage matrix seeded count matches content regions',matrix.filter(x=>x.status==='SEEDED').length===regionIds.length,`${matrix.filter(x=>x.status==='SEEDED').length}/${regionIds.length}`);

pass('Exercise profile registry available',profileIds.size>=18,String(profileIds.size));
pass('Realistic asset slot registry covers actionable profiles',['px001','px002','px003','px004','px005','px006','px007','px008','px009','px010','px011','px012','px013','px014','px015','px016','px017','px018'].every(id=>realisticIds.has(id)));

const postopLeak=(rehab.conditions||[]).filter(c=>/수술\s*후.*(같|동일)|post-?op.*same/i.test(JSON.stringify(c)));
pass('No postoperative-pathway conflation',postopLeak.length===0,postopLeak.map(x=>x.stable_id).join(','));

console.log(`\nStage 23B Disease Rehab content QA: ${failures.length?'FAIL':'PASS'}`);
if(failures.length){console.error(JSON.stringify(failures,null,2));process.exit(1);}
