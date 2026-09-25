import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const failures=[],passes=[];
const check=(name,ok,detail='')=>{
  (ok?passes:failures).push({name,detail});
  console.log(`${ok?'PASS':'FAIL'} | ${name}${detail?' | '+detail:''}`);
};

const core=json('data/knowledge-core-v1.json');
const lib=json('data/patient-exercise-library-v1.json');
const globalQA=json('data/global-qa-stage11-v1.json');
const mediaAudit=json('data/media-license-global-audit-v1.json');
const contract=json('data/integration/orthoos-readonly-contract-v1.json');
const manifest=json('data/integration/orthoos-export-manifest-v1.json');
const schema=json('data/schema/orthoos-readonly-integration-v1.schema.json');
const req=json('data/integration/fixtures/entity-request-m070.json');
const muscleResp=json('data/integration/fixtures/entity-response-m070.json');
const dxResp=json('data/integration/fixtures/entity-response-d001-candidate.json');
const reject=json('data/integration/fixtures/error-patient-context-forbidden.json');

check('Contract version 1.0.0',contract.contract_version==='1.0.0',contract.contract_version);
check('Stable contract status',contract.status==='stable_v1',contract.status);
check('Schema version pin',contract.version_pin?.schema_version===core.schema_version && manifest.schema_version===core.schema_version,core.schema_version);
check('Dataset version pin',contract.version_pin?.dataset_version===core.dataset_version && manifest.dataset_version===core.dataset_version,core.dataset_version);
check('Patient education version pin',manifest.patient_education_dataset_version===lib.dataset_version,lib.dataset_version);
check('Stage 11 QA prerequisite',globalQA.status==='PASS_RELEASED_V9_4',globalQA.status);
check('Media audit prerequisite',mediaAudit.summary?.unresolved_issues===0,String(mediaAudit.summary?.unresolved_issues));
check('Stage 11 audit version pin',manifest.global_qa_audit_version===globalQA.audit_version,`${manifest.global_qa_audit_version} / ${globalQA.audit_version}`);
check('Media audit version pin',manifest.media_license_audit_version===mediaAudit.audit_version && contract.supplemental_datasets?.media_license_audit?.audit_version===mediaAudit.audit_version,`${manifest.media_license_audit_version} / ${mediaAudit.audit_version}`);

check('Atlas ownership says no patient data',core.ownership?.contains_patient_data===false);
check('Canonical patient owner is OrthoOS',core.ownership?.canonical_patient_owner==='LYS OrthoOS',core.ownership?.canonical_patient_owner);
check('Contract PHI disabled',contract.security_privacy?.phi_allowed===false && contract.security_privacy?.patient_context_allowed===false);
check('No client API keys/writable credentials',contract.security_privacy?.api_keys_in_client===false && contract.security_privacy?.writable_credentials_in_atlas===false);

const allowed=contract.transport_profile?.allowed_http_methods||[];
const prohibited=contract.transport_profile?.prohibited_http_methods||[];
check('Only GET allowed',allowed.length===1 && allowed[0]==='GET',JSON.stringify(allowed));
check('Write methods prohibited',['POST','PUT','PATCH','DELETE'].every(x=>prohibited.includes(x)),JSON.stringify(prohibited));
const adapterEndpoints=contract.transport_profile?.adapter_api_shape?.endpoints||[];
check('Adapter API shape is read-only',adapterEndpoints.length===3 && adapterEndpoints.every(e=>e.method==='GET'),JSON.stringify(adapterEndpoints.map(e=>e.method)));

const catalog=contract.entity_catalog||{};
const supported=Object.keys(catalog);
check('Manifest entity types match contract',JSON.stringify(manifest.supported_entity_types)===JSON.stringify(supported));
const catalogErrors=[];
for(const [type,spec] of Object.entries(catalog)){
  const arr=core[spec.collection];
  if(!Array.isArray(arr)) { catalogErrors.push(`${type}:missing_collection:${spec.collection}`); continue; }
  if(!arr.length) catalogErrors.push(`${type}:empty_collection`);
  for(const entity of arr){
    if(!entity[spec.stable_id_field]) {catalogErrors.push(`${type}:missing_id_field`);break;}
  }
}
check('Entity catalog resolves to Knowledge Core',catalogErrors.length===0,catalogErrors.join(','));

const actualCounts={
 regions:core.regions.length,muscles:core.muscles.length,symptom_groups:core.symptom_groups.length,
 symptom_patterns:core.symptom_patterns.length,tendons:core.tendons.length,nerves:core.nerves.length,
 joints:core.joints.length,bursae:core.bursae.length,ligaments:core.ligaments.length,fasciae:(core.fasciae||[]).length,
 clinical_findings:core.clinical_findings.length,clinical_tests:core.clinical_tests.length,
 diagnosis_concepts:core.diagnosis_concepts.length,ultrasound_views:core.ultrasound_views.length,
 content_assets:(core.content_assets||[]).length,relationships:core.relationships.length
};
const countErrors=Object.entries(actualCounts).filter(([k,v])=>manifest.counts?.[k]!==v).map(([k,v])=>`${k}:${manifest.counts?.[k]}!=${v}`);
check('Manifest counts match live Knowledge Core',countErrors.length===0,countErrors.join(','));

const manifestPaths=[
 manifest.files?.contract,manifest.files?.integration_schema,manifest.files?.knowledge_schema,
 manifest.files?.knowledge_core,manifest.files?.patient_education,manifest.files?.global_qa,manifest.files?.media_license_audit,
 ...(manifest.fixtures||[])
].filter(Boolean);
const missingPaths=manifestPaths.filter(p=>!fs.existsSync(p));
check('Manifest files exist',missingPaths.length===0,missingPaths.join(','));

const allowedRequestKeys=new Set(['entity_type','stable_id','schema_version','dataset_version']);
const reqUnknown=Object.keys(req).filter(k=>!allowedRequestKeys.has(k));
check('Request fixture has only allowed keys',reqUnknown.length===0,reqUnknown.join(','));
check('Request fixture version pins',req.schema_version===core.schema_version && req.dataset_version===core.dataset_version);
check('Request fixture resolves m070',req.entity_type==='muscle' && req.stable_id==='m070');

const forbidden=new Set(contract.entity_request?.prohibited||[]);
const collectKeys=(x,out=[])=>{
  if(Array.isArray(x)){for(const v of x)collectKeys(v,out);}
  else if(x&&typeof x==='object'){for(const [k,v] of Object.entries(x)){out.push(k);collectKeys(v,out);}}
  return out;
};
for(const [name,obj] of [['request',req],['muscle_response',muscleResp],['diagnosis_response',dxResp]]){
  const bad=[...new Set(collectKeys(obj).filter(k=>forbidden.has(k)))];
  check(`${name} patient-context fields = 0`,bad.length===0,bad.join(','));
}

const m070=core.muscles.find(x=>x.muscle_id==='m070');
const muscleFixtureOK=
  muscleResp.contract_version===contract.contract_version &&
  muscleResp.schema_version===core.schema_version &&
  muscleResp.dataset_version===core.dataset_version &&
  muscleResp.knowledge_class==='general_msk_knowledge' &&
  muscleResp.patient_context_included===false &&
  muscleResp.entity_type==='muscle' && muscleResp.stable_id==='m070' &&
  muscleResp.entity?.muscle_id===m070?.muscle_id &&
  muscleResp.entity?.name_ko===m070?.name_ko &&
  muscleResp.entity?.name_en===m070?.name_en &&
  JSON.stringify(muscleResp.entity?.anatomy)===JSON.stringify(m070?.anatomy) &&
  muscleResp.entity?.innervation_text===m070?.innervation_text;
check('m070 response fixture matches canonical core',muscleFixtureOK);

const relationshipIds=new Set(core.relationships.map(r=>r.relationship_id));
check('m070 fixture relationships resolve',(muscleResp.relationships||[]).every(r=>relationshipIds.has(r.relationship_id)));

const d001=core.diagnosis_concepts.find(x=>x.diagnosis_concept_id==='d001');
check('d001 fixture matches canonical concept',dxResp.entity_type==='diagnosis_concept' && dxResp.stable_id==='d001' && JSON.stringify(dxResp.entity)===JSON.stringify(d001));
check('Diagnosis fixture is candidate-only',/candidate only/i.test(dxResp.clinical_semantics||'') && dxResp.patient_context_included===false);
check('d001 fixture relationships resolve',(dxResp.relationships||[]).every(r=>relationshipIds.has(r.relationship_id)));

check('Patient-context rejection fixture',reject.error?.code==='PATIENT_CONTEXT_FORBIDDEN' && (reject.error?.rejected_fields||[]).every(x=>forbidden.has(x)));

const enumTypes=schema.$defs?.entityType?.enum||[];
check('Integration schema entity enum matches contract',JSON.stringify(enumTypes)===JSON.stringify(supported));
check('Request schema blocks additional fields',schema.$defs?.entityRequest?.additionalProperties===false);
check('Response schema pins patient_context false',schema.$defs?.entityResponse?.properties?.patient_context_included?.const===false);
check('Error schema includes patient-context rejection',(schema.$defs?.errorResponse?.properties?.error?.properties?.code?.enum||[]).includes('PATIENT_CONTEXT_FORBIDDEN'));

check('Diagnosis semantics are knowledge-only',/candidate only/i.test(contract.clinical_semantics?.diagnosis_concept||''));
check('Clinical-test semantics prohibit patient performed status',/never marks a test performed/i.test(contract.clinical_semantics?.clinical_test||''));
check('Laterality inference prohibited',/must not infer patient laterality/i.test(contract.clinical_semantics?.laterality||''));

check('Static bundle is read-only',manifest.transport==='static_read_only_bundle' && manifest.constraints?.read_only===true);
check('Manifest contains no PHI',manifest.constraints?.contains_phi===false && manifest.constraints?.patient_context===false);

const badFixturePaths=(contract.fixtures||[]).filter(p=>!fs.existsSync(p));
check('Contract fixtures exist',badFixturePaths.length===0,badFixturePaths.join(','));

console.log('\n--- ORTHOOS READ-ONLY CONTRACT QA SUMMARY ---');
console.log(`PASS=${passes.length} FAIL=${failures.length}`);
if(failures.length){
  console.error(JSON.stringify(failures,null,2));
  process.exit(1);
}
