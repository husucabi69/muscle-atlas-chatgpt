import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {inspectPNG,pngCRC32} from './inspect-realistic-png.mjs';
import {inspectWebP} from './inspect-realistic-webp.mjs';
import {verifyPhysicalExamPreviewBinary} from './physical-exam-preview-binary-identity.mjs';

const passed=[];
const check=(name,good)=>{passed.push({name,good:Boolean(good)});console.log((good?'PASS':'FAIL')+' | '+name);};
const fails=(fn,pattern)=>{try{fn();return false;}catch(e){return String(e.message).includes(pattern);}};
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'lysos-ct086-png-proof-'));
function chunk(tag,content){
 const size=Buffer.alloc(4);size.writeUInt32BE(content.length);
 const name=Buffer.from(tag,'ascii'),check=Buffer.alloc(4);
 check.writeUInt32BE(pngCRC32(Buffer.concat([name,content])));
 return Buffer.concat([size,name,content,check]);
}
function fixturePNG(width=1024,height=1536,filter=0){
 const head=Buffer.alloc(13);
 head.writeUInt32BE(width,0);head.writeUInt32BE(height,4);
 head[8]=8;head[9]=6;head[10]=0;head[11]=0;head[12]=0;
 const raw=Buffer.alloc((width*4+1)*height);
 if(filter)for(let row=0;row<height;row++)raw[row*(width*4+1)]=filter;
 const signature=Buffer.from([137,80,78,71,13,10,26,10]);
 return Buffer.concat([signature,chunk('IHDR',head),
  chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
}
try{
 const dest=path.join(tmp,'assets/physical-exam-realistic/candidates');
 fs.mkdirSync(dest,{recursive:true});
 const good=fixturePNG(),png=path.join(dest,'ct086-source.png');
 fs.writeFileSync(png,good);
 const info=inspectPNG(png);
 check('Exact 1024x1536 PNG passes signature/chunks/zlib/scanlines/CRC',
  info.width===1024&&info.height===1536&&info.decoded_bytes===(1024*4+1)*1536);
 const changed=Buffer.from(good);
 changed[30]^=1;fs.writeFileSync(png,changed);
 check('Tampered PNG IHDR CRC is rejected',fails(()=>inspectPNG(png),'CRC_IHDR'));
 fs.writeFileSync(png,good.subarray(0,good.length-12));
 check('Missing IEND is rejected',fails(()=>inspectPNG(png),'MISSING_IDAT_OR_IEND'));
 fs.writeFileSync(png,Buffer.concat([good,Buffer.from('BAD')]));
 check('Trailing PNG bytes rejected',fails(()=>inspectPNG(png),'INVALID_IEND'));
 fs.writeFileSync(png,fixturePNG(1024,1536,5));
 check('Invalid PNG scanline filter rejected',fails(()=>inspectPNG(png),'INVALID_SCANLINE_FILTER'));
 fs.writeFileSync(png,good);
 const webp=path.join(dest,'ct086-preview.webp');
 fs.copyFileSync('assets/physical-exam-realistic/approved/ct085-shoulder-abduction-relief-gen-1db0cd0f-approved-hd.webp',webp);
 const web=inspectWebP(webp);
 const candidate={source_asset_path:'./assets/physical-exam-realistic/candidates/ct086-source.png',
  source_sha256:crypto.createHash('sha256').update(good).digest('hex'),
  preview_asset_path:'./assets/physical-exam-realistic/candidates/ct086-preview.webp',
  preview_webp_sha256:web.sha256,preview_bytes:web.bytes,git_blob_sha1:web.git_blob_sha1};
 const audit={width:1024,height:1536};
 const proof=verifyPhysicalExamPreviewBinary(candidate,audit,{assetRoot:tmp});
 check('Real PNG source + real HD WebP byte identities verified together',
  proof.source_sha256===candidate.source_sha256&&proof.preview_webp_sha256===candidate.preview_webp_sha256);
 fs.writeFileSync(png,fixturePNG(1024,1536,5));
 check('Connector rejects corrupted source PNG even with correct dimensions',
  fails(()=>verifyPhysicalExamPreviewBinary(candidate,audit,{assetRoot:tmp}),'INVALID_SCANLINE_FILTER'));
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
const bad=passed.filter(x=>!x.good);
console.log('Physical Examination exact-source PNG integrity: '+(passed.length-bad.length)+'/'+passed.length+' PASS');
if(bad.length)process.exit(1);
