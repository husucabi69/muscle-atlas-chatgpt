import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import {stageIndependentCt086PNG} from './ct086-independent-hd-import.mjs';
import {inspectPNG,pngCRC32} from './inspect-realistic-png.mjs';
import {inspectWebP} from './inspect-realistic-webp.mjs';

function chunk(type,payload){
 const name=Buffer.from(type),size=Buffer.alloc(4),crc=Buffer.alloc(4);
 size.writeUInt32BE(payload.length);
 crc.writeUInt32BE(pngCRC32(Buffer.concat([name,payload])));
 return Buffer.concat([size,name,payload,crc]);
}
function makePNG(w=1024,h=1536){
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(w,0);ihdr.writeUInt32BE(h,4);ihdr[8]=8;ihdr[9]=6;
 const row=Buffer.alloc(1+w*4);for(let i=0;i<w;i++){
  row[1+i*4]=i%250;row[2+i*4]=90;row[3+i*4]=200-i%140;row[4+i*4]=255;
 }
 const payload=Buffer.alloc(row.length*h);
 for(let y=0;y<h;y++)row.copy(payload,y*row.length);
 return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),
  chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(payload)),chunk('IEND',Buffer.alloc(0))]);
}
const root=fs.mkdtempSync(path.join(os.tmpdir(),'lysos-ct086-new-source-'));
const pathOf=name=>path.join(root,name);
let checks=0;const check=(title,fn)=>{fn();checks++;console.log('PASS | '+title);};
try{
 fs.mkdirSync(pathOf('data'),{recursive:true});
 fs.copyFileSync('data/physical-exam-realistic-assets-v1.json',pathOf('data/physical-exam-realistic-assets-v1.json'));
 const registryBefore=fs.readFileSync(pathOf('data/physical-exam-realistic-assets-v1.json'));
 const original=pathOf('local-independent.png');fs.writeFileSync(original,makePNG());
 const result=await stageIndependentCt086PNG({sourcePath:original,repoRoot:root});
 const master=pathOf(result.source_asset_path),preview=pathOf(result.preview_asset_path);
 check('Exact original PNG byte identity retained',()=>assert.deepEqual(fs.readFileSync(master),fs.readFileSync(original)));
 check('Actual 2K dimensions preserved through WebP',()=>{
  const a=inspectPNG(master),b=inspectWebP(preview);
  assert.deepEqual([a.width,a.height],[b.width,b.height]);
  assert.deepEqual([a.width,a.height],[1024,1536]);
 });
 check('Independent candidate hashes refer to actual files',()=>{
  assert.equal(inspectPNG(master).sha256,result.source_sha256);
  assert.equal(inspectWebP(preview).sha256,result.preview_webp_sha256);
  assert.equal(inspectWebP(preview).git_blob_sha1,result.git_blob_sha1);
 });
 check('Actual decoded image difference below clinical loss threshold',()=>{
  assert.ok(result.quality.mean_rgb_difference<=8);
  assert.ok(result.quality.large_rgb_fraction<=0.08);
 });
 check('Import alone never modifies approval registry',()=>assert.deepEqual(
  fs.readFileSync(pathOf('data/physical-exam-realistic-assets-v1.json')),registryBefore));
 check('The staged result never claims clinical/user approval',()=>assert.equal(
  result.disposition,'LOCAL_BINARY_STAGED_RIGHTS_AND_MEDICAL_REVIEW_REQUIRED'));
 await assert.rejects(stageIndependentCt086PNG({
  sourcePath:pathOf('ct086-runway-candidate5.png'),repoRoot:root
 }),/FORBIDDEN_HISTORIC_LINEAGE_PATH/);
 check('Historically excluded source path rejected before file access',()=>{});
 const low=pathOf('low-original.png');fs.writeFileSync(low,makePNG(600,900));
 await assert.rejects(stageIndependentCt086PNG({sourcePath:low,repoRoot:root}),/UNACCEPTABLE_ORIGINAL_RESOLUTION/);
 check('Upscaled thumbnail/low resolution source rejected',()=>{});
 const damaged=pathOf('damaged-source.png');const png=makePNG();png[png.length-15]^=1;fs.writeFileSync(damaged,png);
 await assert.rejects(stageIndependentCt086PNG({sourcePath:damaged,repoRoot:root}),/PNG_INTEGRITY_/);
 check('Corrupt PNG integrity rejected',()=>{});
 console.log('CT086 INDEPENDENT HD IMAGE PIPELINE: '+checks+'/'+checks+' PASS. Synthetic pixels only; NO actual clinical image approval.');
}finally{fs.rmSync(root,{recursive:true,force:true});}
