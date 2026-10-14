/**
 * Recover existing ct086 Runway Candidate 5 without regeneration.
 * Signed URL only from env, never store in GitHub, never auto-approve.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {inspectPNG} from './inspect-realistic-png.mjs';
export const CT086_TASK_ID='00886834-ff19-4655-9000-6941f580664d';
export const CT086_PNG='assets/physical-exam-realistic/candidates/ct086-rotation-rom-candidate5-source.png';
const MAX_BYTES=45*1024*1024;
const VALID_MIMES=new Set(['image/png','application/octet-stream','binary/octet-stream']);
const fail=code=>{throw Error('CT086_RUNWAY_RECOVERY_'+code);};
export function verifyCt086RunwayUrl(value){
 let u;
 try{u=new URL(String(value||''));}catch{fail('INVALID_URL');}
 const host=u.hostname.toLowerCase();
 if(u.protocol!=='https:'||u.username||u.password||u.port||
    !/^[a-z0-9-]+\.cloudfront\.net$/.test(host))fail('UNTRUSTED_HOST');
 if(!u.pathname.includes('/images/'+CT086_TASK_ID+'/')||
    !u.pathname.toLowerCase().endsWith('.png'))fail('WRONG_TASK_OR_FORMAT');
 if(!u.searchParams.get('_jwt'))fail('SIGNED_URL_REQUIRED');
 return u;
}
function verifyInflightRegistry(root){
 let registry;
 try{registry=JSON.parse(fs.readFileSync(path.join(root,'data/physical-exam-realistic-assets-v1.json'),'utf8'));}
 catch{fail('REGISTRY_UNAVAILABLE');}
 const entry=registry.profiles?.find(x=>x.clinical_test_id==='ct086');
 if(entry?.inflight_render_task?.task_id!==CT086_TASK_ID||
    entry?.inflight_render_task?.state!=='IMAGE_SUCCEEDED_BINARY_TRANSFER_PENDING'||
    entry?.inflight_render_task?.candidate_no!==5)fail('INFLIGHT_TASK_MISMATCH');
 return entry;
}
async function bodyBuffer(res,{maxBytes=MAX_BYTES}={}){
 const length=res.headers?.get?.('content-length');
 if(length&&Number(length)>maxBytes)fail('OVERSIZED_RESPONSE');
 const mime=String(res.headers?.get?.('content-type')||'').split(';')[0].trim().toLowerCase();
 if(mime&&!VALID_MIMES.has(mime))fail('NON_PNG_CONTENT_TYPE');
 if(!res.body||typeof res.body.getReader!=='function')fail('MISSING_STREAM');
 const reader=res.body.getReader();
 let count=0;const parts=[];
 try{
   while(true){
     const {done,value}=await reader.read();
     if(done)break;
     count+=value.byteLength;
     if(count>maxBytes)fail('OVERSIZED_STREAM');
     parts.push(Buffer.from(value));
   }
 }finally{if(count>maxBytes)await reader.cancel().catch(()=>{});}
 if(count<57)fail('TRUNCATED_PNG');
 return Buffer.concat(parts,count);
}
export async function recoverCt086ExistingRunwayPNG({
 signedUrl,root=process.cwd(),fetchImpl=globalThis.fetch,
 destination=CT086_PNG,maxBytes=MAX_BYTES
}={}){
 const url=verifyCt086RunwayUrl(signedUrl);
 const profile=verifyInflightRegistry(root);
 if(destination!==CT086_PNG)fail('NONCANONICAL_OUTPUT_PATH');
 let response;
 try{response=await fetchImpl(url.toString(),{redirect:'manual',signal:AbortSignal.timeout(30000)});}
 catch{fail('FETCH_UNAVAILABLE');}
 if(response.status>=300&&response.status<400)fail('UNEXPECTED_REDIRECT');
 if(!response.ok)fail('HTTP_'+response.status);
 const buffer=await bodyBuffer(response,{maxBytes});
 const absolute=path.join(root,CT086_PNG);
 fs.mkdirSync(path.dirname(absolute),{recursive:true});
 const temp=path.join(path.dirname(absolute),'.ct086-source-'+crypto.randomUUID()+'.tmp');
 try{
   fs.writeFileSync(temp,buffer,{flag:'wx',mode:0o600});
   const info=inspectPNG(temp);
   const output=profile.generation_brief?.image_render_contract?.output;
   if(!output||info.width<output.min_width_px||info.height<output.min_height_px){
     fail('REAL_HD_DIMENSIONS_NOT_MET');
   }
   if(fs.existsSync(absolute)){
     if(!fs.readFileSync(absolute).equals(buffer))fail('SOURCE_COLLISION');
     return{status:'SOURCE_ALREADY_PRESENT',task_id:CT086_TASK_ID,
       bytes:info.bytes,width:info.width,height:info.height,sha256:info.sha256,
       next:'EXACT_SOURCE_IDENTITY_AND_CLINICAL_VISUAL_AUDIT_REQUIRED'};
   }
   // Exclusive hard link: a concurrent writer cannot be silently overwritten.
   try{fs.linkSync(temp,absolute);}
   catch(e){
     if(e.code==='EEXIST'&&fs.readFileSync(absolute).equals(buffer)){
       return{status:'SOURCE_ALREADY_PRESENT',task_id:CT086_TASK_ID,
         bytes:info.bytes,width:info.width,height:info.height,sha256:info.sha256,
         next:'EXACT_SOURCE_IDENTITY_AND_CLINICAL_VISUAL_AUDIT_REQUIRED'};
     }
     fail(e.code==='EEXIST'?'SOURCE_COLLISION':'ATOMIC_WRITE_FAILED');
   }
   return{status:'SOURCE_BINARY_STORED_VISUAL_AUDIT_PENDING',task_id:CT086_TASK_ID,
     path:CT086_PNG,bytes:info.bytes,width:info.width,height:info.height,
     sha256:info.sha256,
     next:'RUN_HD_DERIVATIVE_THEN_MATCH_RUNWAY_SOURCE_AND_CLINICIAN_REVIEW'};
 }finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 try{
   const url=process.env.CT086_RUNWAY_ASSET_URL;
   if(!url)fail('MISSING_URL_ENV');
   console.log(JSON.stringify(await recoverCt086ExistingRunwayPNG({signedUrl:url}),null,2));
 }catch(e){
   const code=String(e?.message||'');
   console.error(/^CT086_RUNWAY_RECOVERY_[A-Z0-9_]+$/.test(code)?code:'CT086_RUNWAY_RECOVERY_UNEXPECTED_IO');
   process.exitCode=1;
 }
}
