import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

export const MANIFEST_PATH='data/patient-exercise-realistic-assets-v1.json';
export const ASSET_DIR='assets/patient-exercise-realistic';
export const A4_HD_MIN={width:1240,height:1754};

function fail(message){throw new Error(message);}

export function isWebp(buffer){
  return Buffer.isBuffer(buffer)&&buffer.length>20&&
    buffer.subarray(0,4).toString('ascii')==='RIFF'&&
    buffer.subarray(8,12).toString('ascii')==='WEBP';
}

export function readWebpDimensions(buffer){
  if(!isWebp(buffer))fail('Input is not a valid WebP container.');
  const type=buffer.subarray(12,16).toString('ascii');
  if(type==='VP8X'){
    if(buffer.length<30)fail('Truncated VP8X WebP.');
    return{width:1+buffer.readUIntLE(24,3),height:1+buffer.readUIntLE(27,3)};
  }
  if(type==='VP8L'){
    if(buffer.length<25||buffer[20]!==0x2f)fail('Invalid VP8L header.');
    const bits=buffer[21]|(buffer[22]<<8)|(buffer[23]<<16)|(buffer[24]<<24);
    return{width:1+(bits&0x3fff),height:1+((bits>>>14)&0x3fff)};
  }
  if(type==='VP8 '){
    for(let i=20;i+7<buffer.length&&i<64;i++){
      if(buffer[i]===0x9d&&buffer[i+1]===0x01&&buffer[i+2]===0x2a){
        return{width:buffer.readUInt16LE(i+3)&0x3fff,height:buffer.readUInt16LE(i+5)&0x3fff};
      }
    }
    fail('VP8 frame dimensions not found.');
  }
  fail('Unsupported WebP chunk type: '+type);
}

export function validateCandidate(profile,{genId}={}){
  if(!profile)fail('Profile not found.');
  if(profile.status!=='CANDIDATE_GENERATED')fail(profile.profile_id+' must be CANDIDATE_GENERATED before approval.');
  if(Array.isArray(profile.approval_blockers)&&profile.approval_blockers.length){
    fail(profile.profile_id+' has unresolved approval blockers: '+profile.approval_blockers.map(x=>x.code||'UNKNOWN').join(', '));
  }
  if(!profile.gen_id)fail(profile.profile_id+' is missing generator provenance.');
  if(genId&&profile.gen_id!==genId)fail(profile.profile_id+' gen_id mismatch.');
  return true;
}

export function validateAssetBytes(buffer){
  if(!isWebp(buffer))fail('Candidate file must be WebP.');
  if(buffer.length<4096)fail('Candidate WebP is unexpectedly small.');
  const dims=readWebpDimensions(buffer);
  if(dims.width<320||dims.height<400)fail(`Candidate is too small for mobile Preview: ${dims.width}x${dims.height}.`);
  if(dims.height<=dims.width)fail(`Candidate must preserve the approved portrait composite ratio: ${dims.width}x${dims.height}.`);
  return dims;
}

export function approvalGateForDimensions(dims){
  return dims.width>=A4_HD_MIN.width&&dims.height>=A4_HD_MIN.height
    ?'A4_HD_APPROVED'
    :'MOBILE_PREVIEW_APPROVED_A4_HD_PENDING';
}

export function buildApprovedProfile(profile,{dims,integratedOn,assetUrl}){
  validateCandidate(profile);
  const gate=approvalGateForDimensions(dims);
  return{
    ...profile,
    status:'APPROVED',
    composite_url:assetUrl,
    integrated_on:integratedOn,
    preview_resolution:`${dims.width}x${dims.height}`,
    asset_gate:gate,
    review_note:(profile.review_note?profile.review_note+' ':'')+
      (gate==='A4_HD_APPROVED'
        ?'Repository WebP materialized and A4-HD asset gate passed.'
        :'Repository WebP materialized for mobile Preview; A4-HD replacement remains pending.')
  };
}

function parseArgs(argv){
  const out={};
  for(let i=0;i<argv.length;i++){
    const k=argv[i];
    if(k.startsWith('--'))out[k.slice(2)]=argv[++i];
  }
  return out;
}

export function ingestCandidate({profileId,source,genId,integratedOn=new Date().toISOString().slice(0,10),manifestPath=MANIFEST_PATH,assetDir=ASSET_DIR}){
  if(!profileId||!/^px\d{3}$/.test(profileId))fail('Use --profile pxNNN.');
  if(!source)fail('Use --source /path/to/candidate.webp.');
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  const index=manifest.profiles.findIndex(x=>x.profile_id===profileId);
  if(index<0)fail('Unknown profile: '+profileId);
  const profile=manifest.profiles[index];
  validateCandidate(profile,{genId});
  const buffer=fs.readFileSync(source);
  const dims=validateAssetBytes(buffer);
  fs.mkdirSync(assetDir,{recursive:true});
  const target=path.join(assetDir,profileId+'.webp');
  fs.writeFileSync(target,buffer);
  const assetUrl='./'+target.replaceAll('\\','/');
  manifest.profiles[index]=buildApprovedProfile(profile,{dims,integratedOn,assetUrl});
  manifest.dataset_version=`${integratedOn}-stage23b-materialized-${profileId}`;
  fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
  return{profileId,target,dims,asset_gate:manifest.profiles[index].asset_gate,gen_id:profile.gen_id};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const a=parseArgs(process.argv.slice(2));
  try{
    const result=ingestCandidate({profileId:a.profile,source:a.source,genId:a['gen-id'],integratedOn:a.date});
    console.log(JSON.stringify(result,null,2));
  }catch(error){
    console.error('INGEST FAIL | '+error.message);
    process.exit(1);
  }
}
