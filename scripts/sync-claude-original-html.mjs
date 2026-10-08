// Exact Claude HTML ingestion for files already downloaded from the user's Drive.
// This tool never downloads credentials, never uploads audio and never touches main.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const argv=process.argv.slice(2);
const arg=(name)=>{
  const i=argv.indexOf(name);
  return i<0?null:argv[i+1]||null;
};
const fail=message=>{throw new Error(message)};
const n=Number(arg('--lecture'));
const source=arg('--source');
const sourceId=arg('--drive-id');
const write=argv.includes('--write');
if(!Number.isSafeInteger(n)||n<1||!source||!sourceId||!/^[A-Za-z0-9_-]{15,}$/.test(sourceId)){
  fail('Usage: node scripts/sync-claude-original-html.mjs --lecture N --source <exact Drive HTML download> --drive-id <source file ID> [--write] [--replace-verified]');
}
const filePath='data/claude-library-manifest-v1.json';
const manifest=JSON.parse(fs.readFileSync(filePath,'utf8'));
const row=(manifest.lectures||[]).find(x=>x.number===n);
if(!row)fail('Lecture not indexed in source-of-truth manifest; add the Drive source-sheet row first');
const logical=row.source_path;
if(typeof logical!=='string'||!logical.startsWith('1_강의페이지/')||!logical.endsWith('.html')||
  logical.split('/').some(p=>!p||p==='.'||p==='..'||p.includes('\\'))){
  fail('Unsafe Drive source_path');
}
if(path.basename(source)!==path.posix.basename(logical))fail('Downloaded HTML filename differs from source index');
const bytes=fs.readFileSync(source);
const html=bytes.toString('utf8');
if(!/^<!doctype html/i.test(html.slice(0,40).trimStart())||Buffer.from(html,'utf8').length!==bytes.length)fail('Not an unmodified UTF-8 original HTML file');
if(!html.includes(row.claude_artifact_url))fail('Original HTML must retain the indexed Claude Artifact fallback');
const found=[...html.matchAll(/\.\.\/\.\.\/(2_음성\/[^"'<>\s]+?\.mp4)/g)].map(m=>m[1]);
const media=[...new Set(found)];
if(row.audio!=='없음'&&!media.length)fail('Source index says audio exists, but original relative MP4 URLs are missing');
if(row.audio==='없음'&&media.length)fail('Source index says no audio, but HTML contains MP4 URLs; review the source index');
for(const key of media){
  if(!key.startsWith('2_음성/')||key.split('/').some(p=>p==='..'||p==='.'||!p))fail('Unsafe MP4 path');
}
const bytes_sha256=crypto.createHash('sha256').update(bytes).digest('hex');
const target=path.join('claude-library',...logical.split('/'));
const exists=fs.existsSync(target);
const prior=exists?fs.readFileSync(target):null;
const same=prior?.equals(bytes)??false;
if(exists&&!same&&!argv.includes('--replace-verified'))fail('Source already self-hosted but different: explicit --replace-verified required');
if(row.hosting_status==='SELF_HOSTED_HTML_MEDIA_READY'&&!same)fail('Cannot silently replace a READY lecture; revoke media READY and re-verify separately');
if(row.source_sha256&&row.source_sha256!==bytes_sha256&&
  !argv.includes('--replace-verified'))fail('Source SHA drift from canonical manifest requires explicit review');
if(row.source_drive_file_id&&row.source_drive_file_id!==sourceId&&!argv.includes('--replace-verified')){
  fail('Source Drive ID drift from canonical manifest requires explicit review');
}
const updated={...row,hosting_status:row.audio==='없음'?'SELF_HOSTED_HTML_MEDIA_READY':'SELF_HOSTED_HTML_MEDIA_PENDING',
 source_drive_file_id:sourceId,source_bytes:bytes.length,source_sha256:bytes_sha256};
if(media.length===1){updated.r2_object_key=media[0];delete updated.r2_object_keys;}
if(media.length>1){updated.r2_object_keys=media;delete updated.r2_object_key;}
if(media.length){updated.audio_source_verification='DRIVE_MP4_IDENTITY_PENDING';delete updated.audio_sha256;delete updated.audio_bytes;delete updated.audio_drive_file_id;}
// Audio-free HTML may be marked self-hosted/ready; do not use the audio-ready status for unverified audio.
if(row.audio==='없음')delete updated.audio_source_verification;
const result={lecture:n,title:row.title,mode:write?'WRITE':'DRY_RUN',target,source_bytes:bytes.length,
 source_sha256:bytes_sha256,media_keys:media,existing_matches_source:same};
if(write){
  fs.mkdirSync(path.dirname(target),{recursive:true});
  if(!same)fs.writeFileSync(target,bytes);
  Object.assign(row,updated);
  fs.writeFileSync(filePath,JSON.stringify(manifest,null,2)+'\n','utf8');
}
console.log(JSON.stringify(result,null,2));
