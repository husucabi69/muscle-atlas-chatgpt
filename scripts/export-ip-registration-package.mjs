import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const registryPath='data/ip-provenance-v1.json';
const target=process.argv[2]||'all';
const outRoot=process.argv[3]||'dist/ip-registration-package';

const registry=JSON.parse(fs.readFileSync(registryPath,'utf8'));
const eligible=new Set(['HUMAN_REVIEWED','REGISTRATION_READY','REGISTERED']);
const selected=(registry.assets||[]).filter(a=>(target==='all'||a.asset_id===target) && eligible.has(a.status));

if(target!=='all' && !selected.length){
  console.error('No eligible asset found for '+target);
  process.exit(2);
}

function sha256(filePath){
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function verifyLocalFinalFiles(asset){
  const results=[];
  for(const f of asset.final_files||[]){
    if(!f.path){
      results.push({ref:f.storage_ref||null,local:false,verified:false,reason:'external_storage_ref'});
      continue;
    }
    if(!fs.existsSync(f.path)){
      if(['REGISTRATION_READY','REGISTERED'].includes(asset.status)) throw new Error(asset.asset_id+': missing local final file '+f.path);
      results.push({ref:f.path,local:true,verified:false,reason:'file_not_present'});
      continue;
    }
    const actual=sha256(f.path);
    if(f.sha256 && actual.toLowerCase()!==String(f.sha256).toLowerCase()) throw new Error(asset.asset_id+': SHA-256 mismatch '+f.path);
    results.push({ref:f.path,local:true,verified:true,sha256:actual});
  }
  return results;
}

fs.mkdirSync(outRoot,{recursive:true});
const index=[];

for(const asset of selected){
  const dir=path.join(outRoot,asset.asset_id);
  fs.mkdirSync(dir,{recursive:true});
  const verification=verifyLocalFinalFiles(asset);
  const manifest={
    package_type:'MUSCLE_ATLAS_COPYRIGHT_EVIDENCE_PACKAGE_V1',
    official_government_form:false,
    generated_at:new Date().toISOString(),
    rights_owner_id:registry.rights_owner.owner_id,
    asset,
    final_file_verification:verification
  };
  fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');

  const lines=[
    '# Copyright evidence package — '+asset.asset_id,
    '',
    '> Internal evidence package only. This is not an official copyright-registration form.',
    '',
    '## Work',
    '- Title: '+asset.title,
    '- Version: '+asset.version,
    '- Family: '+asset.work_family,
    '- Type: '+asset.work_type,
    '- Status: '+asset.status,
    '- Creation date: '+(asset.creation_date||'not fixed'),
    '',
    '## Human creative contribution',
    asset.human_contribution?.summary||'',
    '',
    ...(asset.human_contribution?.creative_decisions||[]).map(x=>'- '+x),
    '',
    '## AI assistance',
    '- Used: '+String(Boolean(asset.ai_assistance?.used)),
    '- Tools: '+((asset.ai_assistance?.tools||[]).join(', ')||'none'),
    '- Summary: '+(asset.ai_assistance?.summary||''),
    '',
    '## Final files',
    ...(asset.final_files||[]).map(f=>'- '+(f.path||f.storage_ref||'unknown')+' | sha256='+(f.sha256||'pending')),
    '',
    '## Registration',
    '- Status: '+(asset.registration?.status||'NOT_SUBMITTED'),
    '- Registration no.: '+(asset.registration?.registration_no||'not assigned'),
    ''
  ];
  fs.writeFileSync(path.join(dir,'README.md'),lines.join('\n'));
  index.push({asset_id:asset.asset_id,status:asset.status,dir});
}

fs.writeFileSync(path.join(outRoot,'index.json'),JSON.stringify({
  package_type:'MUSCLE_ATLAS_COPYRIGHT_EVIDENCE_INDEX_V1',
  generated_at:new Date().toISOString(),
  target,
  assets:index
},null,2)+'\n');

console.log('IP registration evidence export PASS: '+selected.length+' package(s) -> '+outRoot);
