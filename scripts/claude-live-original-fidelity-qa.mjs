import fs from 'node:fs';
import crypto from 'node:crypto';

const evidence=JSON.parse(fs.readFileSync(process.env.DEPLOY_GATE_EVIDENCE||'/tmp/deploy-safety-evidence.json','utf8'));
const exact=evidence.cloudflare?.exact_preview_url;
if(evidence.result!=='PASS'||!exact||evidence.sha!==process.env.GITHUB_SHA){
  throw new Error('Exact Preview provenance absent or deployment safety not passed');
}
const url=new URL(exact);
if(!url.hostname.endsWith('.muscle-atlas-chatgpt.pages.dev')||url.protocol!=='https:'){
  throw new Error('Invalid exact Cloudflare Preview origin');
}
const manifest=JSON.parse(fs.readFileSync('data/claude-library-manifest-v1.json','utf8'));
const hosted=manifest.lectures.filter(row=>String(row.hosting_status||'').startsWith('SELF_HOSTED_'));
if(hosted.length<50)throw new Error('Expected at least 50 verified original HTML self-hosted lectures');
let passed=0;
for(const row of hosted){
  const target=new URL('/claude-library/'+row.source_path,url);
  const response=await fetch(target,{cache:'no-store',signal:AbortSignal.timeout(20000)});
  if(response.status!==200)throw new Error('Live HTML HTTP '+response.status+' for lecture '+row.number);
  const bytes=Buffer.from(await response.arrayBuffer());
  const digest=crypto.createHash('sha256').update(bytes).digest('hex');
  if(bytes.length!==row.source_bytes||digest!==row.source_sha256){
    throw new Error('Live HTML source-byte mismatch: lecture '+row.number+' bytes='+bytes.length+' sha256='+digest);
  }
  const body=bytes.toString('utf8');
  if(row.source_embedded_artifact===false?body.includes(row.claude_artifact_url):!body.includes(row.claude_artifact_url)){
    throw new Error('Original Artifact embedding differs from source: '+row.number);
  }
  if(row.audio!=='없음'){
    const references=Array.isArray(row.source_media_paths)&&row.source_media_paths.length?row.source_media_paths:[row.r2_object_key];
    if(references.some(ref=>typeof ref!=='string'||!ref.startsWith('2_음성/')||!body.includes('../../'+ref))){
      throw new Error('Original MP4 logical path missing: '+row.number);
    }
  }
  console.log('PASS | Live immutable Preview Claude lecture '+row.number+' exact Drive HTML bytes='+bytes.length);
  passed++;
}
console.log('CLAUDE LIVE SOURCE FIDELITY | '+passed+'/'+hosted.length+' PASS | exact='+exact);
