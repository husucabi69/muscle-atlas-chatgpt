import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {chromium} from 'playwright';
import {inspectPNG} from './inspect-realistic-png.mjs';
import {inspectWebP} from './inspect-realistic-webp.mjs';

const TASK_ID='00886834-ff19-4655-9000-6941f580664d';
const CANDIDATE_ROOT='assets/physical-exam-realistic/candidates/';
const OUT_PNG=CANDIDATE_ROOT+'ct086-rotation-rom-candidate5-source.png';
const OUT_WEBP=CANDIDATE_ROOT+'ct086-rotation-rom-candidate5-hd.webp';
const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
function fail(message){throw new Error('CT086_CANDIDATE5_IMPORT_'+message);}

async function loadPixelData(dataUrl,width,height){
 return{dataUrl,width,height};
}

export async function renderAndCompareCt086PNG(sourceBytes,{webpQuality=0.98}={}){
 if(!Buffer.isBuffer(sourceBytes)||sourceBytes.length<60)fail('MISSING_PNG_BYTES');
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();
  const sourceUrl='data:image/png;base64,'+sourceBytes.toString('base64');
  const result=await page.evaluate(async ({sourceUrl,quality})=>{
   const decode=async data=>{
    const img=new Image();img.src=data;await img.decode();return img;
   };
   const original=await decode(sourceUrl);
   const width=original.naturalWidth,height=original.naturalHeight;
   const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
   const ctx=canvas.getContext('2d',{willReadFrequently:true});
   ctx.drawImage(original,0,0);
   const sourceData=ctx.getImageData(0,0,width,height).data;
   const webpURL=canvas.toDataURL('image/webp',quality);
   if(!webpURL.startsWith('data:image/webp;base64,'))throw Error('BROWSER_WEBP_UNSUPPORTED');
   const second=await decode(webpURL);
   const canvas2=document.createElement('canvas');canvas2.width=width;canvas2.height=height;
   const ctx2=canvas2.getContext('2d',{willReadFrequently:true});
   ctx2.drawImage(second,0,0);
   const convertedData=ctx2.getImageData(0,0,width,height).data;
   let delta=0,alphaDelta=0,largeDiff=0,largeAlphaDiff=0;
   for(let k=0;k<sourceData.length;k+=4){
    const r=Math.abs(sourceData[k]-convertedData[k]);
    const g=Math.abs(sourceData[k+1]-convertedData[k+1]);
    const b=Math.abs(sourceData[k+2]-convertedData[k+2]);
    const a=Math.abs(sourceData[k+3]-convertedData[k+3]);
    delta+=r+g+b;alphaDelta+=a;
    if(Math.max(r,g,b)>48)largeDiff++;
    if(a>10)largeAlphaDiff++;
   }
   const pixels=width*height;
   return{webpBase64:webpURL.split(',')[1],width,height,
    mean_rgb_difference:delta/(pixels*3),
    mean_alpha_difference:alphaDelta/pixels,
    large_rgb_fraction:largeDiff/pixels,
    large_alpha_fraction:largeAlphaDiff/pixels};
  },{sourceUrl,quality:webpQuality});
  const out=Buffer.from(result.webpBase64,'base64');
  delete result.webpBase64;
  if(result.mean_rgb_difference>8||result.mean_alpha_difference>3||
    result.large_rgb_fraction>0.08||result.large_alpha_fraction>0.01){
    fail('WEBP_VISUAL_FIDELITY_TOO_LOW');
  }
  return{webpBytes:out,metrics:result};
 }finally{await browser.close();}
}

export async function compareCt086Images(sourceBytes,webpBytes){
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();
  const pngUrl='data:image/png;base64,'+sourceBytes.toString('base64');
  const webpUrl='data:image/webp;base64,'+webpBytes.toString('base64');
  return await page.evaluate(async ([first,second])=>{
   const load=async url=>{const img=new Image();img.src=url;await img.decode();return img;};
   const png=await load(first),webp=await load(second);
   if(png.naturalWidth!==webp.naturalWidth||png.naturalHeight!==webp.naturalHeight)
     throw Error('SOURCE_WEBP_PIXEL_DIMENSION_MISMATCH');
   const px=async img=>{
    const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
    return ctx.getImageData(0,0,c.width,c.height).data;
   };
   const a=await px(png),b=await px(webp);
   let sum=0,large=0;
   for(let i=0;i<a.length;i+=4){
    const dr=Math.abs(a[i]-b[i]),dg=Math.abs(a[i+1]-b[i+1]),db=Math.abs(a[i+2]-b[i+2]);
    sum+=dr+dg+db;
    if(Math.max(dr,dg,db)>48)large++;
   }
   return{mean_rgb_difference:sum/(a.length/4*3),large_rgb_fraction:large/(a.length/4),
     width:png.naturalWidth,height:png.naturalHeight};
  },[pngUrl,webpUrl]);
 }finally{await browser.close();}
}

export async function importCt086RunwayOutput({sourcePath,repositoryRoot=process.cwd()}){
 if(!sourcePath||!fs.existsSync(sourcePath))fail('EXACT_SOURCE_FILE_REQUIRED');
 const registry=JSON.parse(fs.readFileSync(path.join(repositoryRoot,'data/physical-exam-realistic-assets-v1.json'),'utf8'));
 const p=registry.profiles.find(x=>x.clinical_test_id==='ct086');
 if(p?.inflight_render_task?.task_id!==TASK_ID||
    p?.inflight_render_task?.state!=='IMAGE_SUCCEEDED_BINARY_TRANSFER_PENDING'){
  fail('EXPECTED_INFLIGHT_TASK_NOT_FOUND');
 }
 const sourceInfo=inspectPNG(sourcePath);
 const min=p.generation_brief.image_render_contract.output;
 if(sourceInfo.width<min.min_width_px||sourceInfo.height<min.min_height_px)fail('NOT_ORIGINAL_HIGH_RES_PNG');
 const original=fs.readFileSync(sourcePath);
 const {webpBytes,metrics}=await renderAndCompareCt086PNG(original);
 const dir=path.resolve(repositoryRoot,CANDIDATE_ROOT);
 const pngDest=path.join(dir,path.basename(OUT_PNG)),webpDest=path.join(dir,path.basename(OUT_WEBP));
 fs.mkdirSync(dir,{recursive:true});
 for(const [dst,buf] of [[pngDest,original],[webpDest,webpBytes]]){
  if(fs.existsSync(dst)&&!fs.readFileSync(dst).equals(buf))fail('EXISTING_ASSET_COLLISION_'+path.basename(dst));
 }
 // No registry mutation and NO patient-facing Preview promotion: source and derived
 // bytes are preserved for a separate image-bound clinician visual audit.
 for(const [dst,buf] of [[pngDest,original],[webpDest,webpBytes]]){
  if(!fs.existsSync(dst))fs.writeFileSync(dst,buf,{flag:'wx'});
 }
 const webp=inspectWebP(webpDest);
 if(sourceInfo.width!==webp.width||sourceInfo.height!==webp.height)fail('DERIVATIVE_PIXEL_DIMENSIONS');
 const record={candidate_no:5,gen_id:TASK_ID,render_task_id:TASK_ID,
  generated_on:'2026-10-14',generator:'Runway connected image generator',
  source_asset_path:'./'+OUT_PNG,source_sha256:sourceInfo.sha256,
  preview_asset_path:'./'+OUT_WEBP,preview_webp_sha256:webp.sha256,
  preview_bytes:webp.bytes,git_blob_sha1:webp.git_blob_sha1,
  dimensions:webp.width+'x'+webp.height};
 return{record,metrics,disposition:'BINARY_VERIFIED_CLINICAL_VISUAL_REVIEW_PENDING'};
}

if(process.argv[1]&&process.argv[1].endsWith('ct086-candidate5-hd-source-derivative.mjs')){
 try{
  const original=process.argv[2];
  if(!original)fail('USAGE_NODE_SCRIPT_ORIGINAL_RUNWAY_PNG');
  const x=await importCt086RunwayOutput({sourcePath:original});
  console.log(JSON.stringify(x,null,2));
 }catch(e){console.error(e.message);process.exit(1);}
}
