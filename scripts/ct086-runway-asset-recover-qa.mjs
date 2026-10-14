import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import {ReadableStream} from 'node:stream/web';
import {recoverCt086ExistingRunwayPNG,verifyCt086RunwayUrl,CT086_TASK_ID,CT086_PNG} from './ct086-runway-asset-recover.mjs';
import {pngCRC32,inspectPNG} from './inspect-realistic-png.mjs';
const url='https://dnznrvs05pmza.cloudfront.net/gemini/images/'+CT086_TASK_ID+'/example.png?_jwt=test-only-token';
let n=0;
const check=(name,pass)=>{n++;assert.ok(pass,name);console.log('PASS | '+name);};
function chunk(type,data){
 const tag=Buffer.from(type),head=Buffer.alloc(4),tail=Buffer.alloc(4);
 head.writeUInt32BE(data.length);tail.writeUInt32BE(pngCRC32(Buffer.concat([tag,data])));
 return Buffer.concat([head,tag,data,tail]);
}
function makePNG(width=1024,height=1536){
 const ihdr=Buffer.alloc(13);
 ihdr.writeUInt32BE(width,0);ihdr.writeUInt32BE(height,4);ihdr[8]=8;ihdr[9]=6;
 const scanline=Buffer.alloc(width*4+1,0);
 return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',ihdr),
  chunk('IDAT',zlib.deflateSync(Buffer.concat(Array.from({length:height},()=>scanline)))),chunk('IEND',Buffer.alloc(0))]);
}
function mockResponse(bytes,{type='image/png',status=200}={}){
 return{ok:status===200,status,
 headers:new Headers({'content-type':type,'content-length':String(bytes.length)}),
 body:new ReadableStream({start(ctrl){ctrl.enqueue(bytes);ctrl.close();}})};
}
const root=fs.mkdtempSync(path.join(os.tmpdir(),'lysos-ct086-runway-'));
fs.mkdirSync(path.join(root,'data'));
fs.writeFileSync(path.join(root,'data/physical-exam-realistic-assets-v1.json'),JSON.stringify({profiles:[{
 clinical_test_id:'ct086',
 inflight_render_task:{task_id:CT086_TASK_ID,candidate_no:5,state:'IMAGE_SUCCEEDED_BINARY_TRANSFER_PENDING'},
 generation_brief:{image_render_contract:{output:{min_width_px:1024,min_height_px:1536}}}
}]}));
const png=makePNG();
try{
 check('Exact existing task URL',verifyCt086RunwayUrl(url).pathname.includes(CT086_TASK_ID));
 for(const bad of [
  'http://dnznrvs05pmza.cloudfront.net/gemini/images/'+CT086_TASK_ID+'/x.png?_jwt=abc',
  'https://dnznrvs05pmza.cloudfront.net.evil.net/images/'+CT086_TASK_ID+'/x.png?_jwt=abc',
  'https://dnznrvs05pmza.cloudfront.net/images/wrong-task/x.png?_jwt=abc',
  'https://dnznrvs05pmza.cloudfront.net/images/'+CT086_TASK_ID+'/x.webp?_jwt=abc',
  'https://dnznrvs05pmza.cloudfront.net/images/'+CT086_TASK_ID+'/x.png'
 ])assert.throws(()=>verifyCt086RunwayUrl(bad));
 check('Reject unsafe/wrong/unsigned URL',true);
 const res=await recoverCt086ExistingRunwayPNG({signedUrl:url,root,fetchImpl:async()=>mockResponse(png)});
 check('Exact original bytes retained',fs.readFileSync(path.join(root,CT086_PNG)).equals(png));
 check('Pixels and SHA from decoded PNG',res.width===1024&&res.height===1536&&res.sha256===inspectPNG(path.join(root,CT086_PNG)).sha256);
 check('No auto-approval',res.status==='SOURCE_BINARY_STORED_VISUAL_AUDIT_PENDING');
 const again=await recoverCt086ExistingRunwayPNG({signedUrl:url,root,fetchImpl:async()=>mockResponse(png)});
 check('Same bytes idempotent',again.status==='SOURCE_ALREADY_PRESENT');
 await assert.rejects(recoverCt086ExistingRunwayPNG({signedUrl:url,root,fetchImpl:async()=>mockResponse(makePNG(1030,1540))}),/SOURCE_COLLISION/);
 check('Different bytes cannot overwrite',true);
 await assert.rejects(recoverCt086ExistingRunwayPNG({signedUrl:url,root,fetchImpl:async()=>mockResponse(png,{type:'text/html'})}),/NON_PNG_CONTENT_TYPE/);
 check('Reject HTML',true);
 await assert.rejects(recoverCt086ExistingRunwayPNG({signedUrl:url,root,fetchImpl:async()=>mockResponse(png,{status:302})}),/UNEXPECTED_REDIRECT/);
 check('Reject redirects',true);
 await assert.rejects(recoverCt086ExistingRunwayPNG({signedUrl:url,root,maxBytes:png.length-1,fetchImpl:async()=>mockResponse(png)}),/OVERSIZED_RESPONSE/);
 check('Enforce byte cap',true);
 check('Registry still pending',JSON.parse(fs.readFileSync(path.join(root,'data/physical-exam-realistic-assets-v1.json'),'utf8')).profiles[0].inflight_render_task.state==='IMAGE_SUCCEEDED_BINARY_TRANSFER_PENDING');
 console.log('SUMMARY | '+n+'/'+n+' PASS');
}finally{fs.rmSync(root,{recursive:true,force:true});}
