import fs from 'node:fs';

const REGISTRY='data/ip-provenance-v1.json';
const allowedStatus=new Set(['DRAFT','HUMAN_REVIEWED','REGISTRATION_READY','REGISTERED','RETIRED']);
const allowedFamily=new Set(['ANATOMY_2D','ANATOMY_3D','MUSCLE_ACTION_ANIMATION','SOFTWARE_INTERACTION']);
const blockedPublicKeys=new Set(['address','home_address','resident_registration_number','rrn','signature','seal_image','private_email','private_phone']);

const fail=(message)=>{ throw new Error(message); };
const nonEmpty=v=>typeof v==='string' && v.trim().length>0;
const arr=v=>Array.isArray(v)?v:[];

function scanForBlockedKeys(value,path='$'){
  if(Array.isArray(value)){
    value.forEach((item,i)=>scanForBlockedKeys(item,\`${path}[\${i}]\`));
    return;
  }
  if(!value || typeof value!=='object') return;
  for(const [key,val] of Object.entries(value)){
    if(blockedPublicKeys.has(String(key).toLowerCase())) fail(\`PUBLIC_PII_KEY_BLOCKED: ${path}.${key}\`);
    scanForBlockedKeys(val,\`${path}.${key}\`);
  }
}

function hasApprovedThirdPartyState(entry){
  const state=String(entry?.license_status||'').toUpperCase();
  return ['PROJECT_OWNED','INDEPENDENTLY_CREATED','PUBLIC_DOMAIN','LICENSED_APPROVED','NOT_APPLICABLE'].includes(state);
}

function validateFileRefs(files,{requireHash=false,label='file'}={}){
  for(const [i,file] of arr(files).entries()){
    if(!file || typeof file!=='object') fail(\`${label}[\${i}] must be an object\`);
    if(!nonEmpty(file.path) && !nonEmpty(file.storage_ref)) fail(\`${label}[\${i}] missing path/storage_ref\`);
    if(requireHash && !/^[a-f0-9]{64}$/i.test(String(file.sha256||''))) fail(\`${label}[\${i}] missing valid sha256\`);
  }
}

const registry=JSON.parse(fs.readFileSync(REGISTRY,'utf8'));
scanForBlockedKeys(registry);

if(registry.schema_version!=='1.0') fail('schema_version must be 1.0');
if(registry.public_repository!==true) fail('public_repository must be true');
if(!nonEmpty(registry?.rights_owner?.owner_id)) fail('rights_owner.owner_id required');
if(registry?.rights_owner?.legal_identity_storage!=='PRIVATE_EXTERNAL_RECORD') fail('legal identity must remain outside the public repo');

const familyIds=new Set(arr(registry.work_families).map(x=>x?.id));
for(const id of allowedFamily) if(!familyIds.has(id)) fail(\`missing work family ${id}\`);

const seen=new Set();
for(const asset of arr(registry.assets)){
  if(!/^IP-[A-Z0-9][A-Z0-9._-]*$/.test(String(asset?.asset_id||''))) fail('invalid asset_id');
  if(seen.has(asset.asset_id)) fail(\`duplicate asset_id ${asset.asset_id}\`);
  seen.add(asset.asset_id);

  if(!allowedFamily.has(asset.work_family)) fail(\`${asset.asset_id}: invalid work_family\`);
  if(!allowedStatus.has(asset.status)) fail(\`${asset.asset_id}: invalid status\`);
  if(!nonEmpty(asset.title) || !nonEmpty(asset.version) || !nonEmpty(asset.creator_role)) fail(\`${asset.asset_id}: title/version/creator_role required\`);

  const human=asset.human_contribution||{};
  if(!nonEmpty(human.summary)) fail(\`${asset.asset_id}: human_contribution.summary required\`);
  if(!arr(human.creative_decisions).filter(nonEmpty).length) fail(\`${asset.asset_id}: creative_decisions required\`);

  const ai=asset.ai_assistance||{};
  if(typeof ai.used!=='boolean') fail(\`${asset.asset_id}: ai_assistance.used must be boolean\`);
  if(ai.used){
    if(!arr(ai.tools).filter(nonEmpty).length) fail(\`${asset.asset_id}: AI tool list required\`);
    if(!nonEmpty(ai.summary)) fail(\`${asset.asset_id}: AI assistance summary required\`);
  }

  for(const [i,tp] of arr(asset.third_party_assets).entries()){
    if(!hasApprovedThirdPartyState(tp) && ['HUMAN_REVIEWED','REGISTRATION_READY','REGISTERED'].includes(asset.status)){
      fail(\`${asset.asset_id}: unresolved third-party asset at index ${i}\`);
    }
  }

  validateFileRefs(asset.source_files,{label:\`${asset.asset_id}.source_files\`});
  const registrationStage=['REGISTRATION_READY','REGISTERED'].includes(asset.status);
  validateFileRefs(asset.final_files,{requireHash:registrationStage,label:\`${asset.asset_id}.final_files\`});

  if(registrationStage){
    if(!nonEmpty(asset.creation_date)) fail(\`${asset.asset_id}: creation_date required\`);
    if(!arr(asset.source_files).length) fail(\`${asset.asset_id}: source_files required\`);
    if(!arr(asset.final_files).length) fail(\`${asset.asset_id}: final_files required\`);
    if(asset?.final_human_approval?.approved!==true || !nonEmpty(asset?.final_human_approval?.date)){
      fail(\`${asset.asset_id}: final human approval/date required\`);
    }
  }

  if(asset.status==='REGISTERED' && !nonEmpty(asset?.registration?.registration_no)){
    fail(\`${asset.asset_id}: registration_no required for REGISTERED\`);
  }
}

console.log(\`IP provenance QA PASS: ${arr(registry.assets).length} asset record(s), public PII guard active, registration-ready gates enforced.\`);
