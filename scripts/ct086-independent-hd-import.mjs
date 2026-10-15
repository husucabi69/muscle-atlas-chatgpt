import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {chromium} from 'playwright';
import {inspectPNG} from './inspect-realistic-png.mjs';
import {inspectWebP} from './inspect-realistic-webp.mjs';

const ROOT='assets/physical-exam-realistic/candidates';
const MAX_SOURCE=45*1024*1024;
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const fail=name=>{throw Error('CT086_INDEPENDENT_HD_'+name);};
function readExactOriginal(sourcePath,repoRoot){
 if(typeof sourcePath!=='string'||!sourcePath||/runway|candidate5/i.test(sourcePath))
   fail('FORBIDDEN_HISTORIC_LINEAGE_PATH');
 const abs=path.resolve(repoRoot,sourcePath);
 if(!fs.existsSync(abs)||fs.lstatSync(abs).isSymbolicLink())fail('LOCAL_REAL_PNG_REQUIRED');
 if(!fs.statSync(abs).isFile()||fs.statSync(abs).size>MAX_SOURCE)fail('SOURCE_SIZE_INVALID');
 const info=inspectPNG(abs);
 if(info.width<1024||info.height<1536)fail('UNACCEPTABLE_ORIGINAL_RESOLUTION');
 if(Math.abs(info.width*3-info.height*2)>Math.max(info.width,info.height)*0.035)
   fail('NOT_PORTRAIT_TWO_THIRDS');
 const bytes=fs.readFileSync(abs);
 const ledger=JSON.parse(fs.readFileSync(path.join(repoRoot,'data/physical-exam-realistic-assets-v1.json'),'utf8'));
 const ct086=ledger.profiles.find(x=>x.clinical_test_id==='ct086');
 if(!ct086)fail('MISSING_CANONICAL_CT086');
 const historicalHashes=(ct086.candidate_history||[]).map(c=>c.raw_generation_sha256).filter(Boolean);
 if(historicalHashes.includes(info.sha256))fail('REJECTED_HISTORIC_BYTES');
 return{info,bytes};
}
export async function convertIndependentCt086PNG(bytes){
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();
  const imageSource='data:image/png;base64,'+bytes.toString('base64');
  const x=await page.evaluate(async ({imageSource})=>{
   const load=async url=>{const img=new Image();img.src=url;await img.decode();return img;};
   const original=await load(imageSource);
   const width=original.naturalWidth,height=original.naturalHeight;
   const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
   const context=canvas.getContext('2d',{willReadFrequently:true});
   context.drawImage(original,0,0);
   const px=context.getImageData(0,0,width,height).data;
   const webp=canvas.toDataURL('image/webp',0.98);
   if(!webp.startsWith('data:image/webp;base64,'))throw Error('WEBP_ENCODING_UNAVAILABLE');
   const other=await load(webp);
   if(other.naturalWidth!==width||other.naturalHeight!==height)throw Error('DIMENSION_MISMATCH');
   const c2=document.createElement('canvas');c2.width=width;c2.height=height;
   const ctx2=c2.getContext('2d',{willReadFrequently:true});ctx2.drawImage(other,0,0);
   const b=ctx2.getImageData(0,0,width,height).data;
   let total=0,large=0;
   for(let i=0;i<px.length;i+=4){
     let max=0;
     for(let c=0;c<3;c++){
       const diff=Math.abs(px[i+c]-b[i+c]);total+=diff;max=Math.max(max,diff);
     }
     if(max>48)large++;
   }
   return{png_width:width,png_height:height,
     webp_base64:webp.split(',')[1],
     mean_rgb_difference:total/(width*height*3),
     large_rgb_fraction:large/(width*height)};
  },{imageSource});
  if(x.mean_rgb_difference>8||x.large_rgb_fraction>0.08)fail('WEBP_FIDELITY_NOT_CLINICALLY_SAFE');
  const webpBytes=Buffer.from(x.webp_base64,'base64');delete x.webp_base64;
  return {webpBytes,quality:{width:x.png_width,height:x.png_height,
    mean_rgb_difference:x.mean_rgb_difference,large_rgb_fraction:x.large_rgb_fraction}};
 }finally{await browser.close();}
}
export async function stageIndependentCt086PNG({sourcePath,repoRoot=process.cwd()}={}){
 const {info,bytes}=readExactOriginal(sourcePath,repoRoot);
 const {webpBytes,quality}=await convertIndependentCt086PNG(bytes);
 const dir=path.resolve(repoRoot,ROOT);
 const key=info.sha256.slice(0,16);
 const pngPath='ct086-independent-'+key+'-master.png';
 const webpPath='ct086-independent-'+key+'-preview.webp';
 fs.mkdirSync(dir,{recursive:true});
 const src=path.join(dir,pngPath),preview=path.join(dir,webpPath);
 // Never partially replace another creator's candidate or an earlier staged file.
 for(const [p,b] of [[src,bytes],[preview,webpBytes]])
   if(fs.existsSync(p)&&(!fs.statSync(p).isFile()||fs.lstatSync(p).isSymbolicLink()||
       !fs.readFileSync(p).equals(b)))fail('EXISTING_STAGE_COLLISION');
 for(const [p,b] of [[src,bytes],[preview,webpBytes]])
   if(!fs.existsSync(p))fs.writeFileSync(p,b,{flag:'wx'});
 const meta=inspectWebP(preview);
 if(meta.width!==info.width||meta.height!==info.height)fail('DERIVATIVE_PIXEL_MISMATCH');
 return {candidate_no:6,gen_id:'LYSOS-INDEPENDENT-'+key,
   generated_on:null,generator:'LYSOS_INDEPENDENT_ORIGINAL',
   source_asset_path:'./'+ROOT+'/'+pngPath,source_sha256:info.sha256,
   preview_asset_path:'./'+ROOT+'/'+webpPath,
   preview_webp_sha256:meta.sha256,preview_bytes:meta.bytes,
   git_blob_sha1:meta.git_blob_sha1,dimensions:info.width+'x'+info.height,
   quality,disposition:'LOCAL_BINARY_STAGED_RIGHTS_AND_MEDICAL_REVIEW_REQUIRED'};
}
if(process.argv[1]&&process.argv[1].endsWith('ct086-independent-hd-import.mjs')){
 const src=process.argv[2];
 if(!src){console.error('USAGE: node scripts/ct086-independent-hd-import.mjs <local-original.png>');process.exitCode=2;}
 else try{console.log(JSON.stringify(await stageIndependentCt086PNG({sourcePath:src}),null,2));}
 catch(e){console.error(e.message);process.exitCode=1;}
}
