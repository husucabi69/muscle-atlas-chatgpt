import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import {pngCRC32,inspectPNG} from './inspect-realistic-png.mjs';
import {inspectWebP} from './inspect-realistic-webp.mjs';
import {renderAndCompareCt086PNG,compareCt086Images} from './ct086-candidate5-hd-source-derivative.mjs';

const tests=[];
const check=(name,pass,info='')=>{tests.push({name,pass:Boolean(pass)});console.log((pass?'PASS':'FAIL')+' | '+name+' '+info);};
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ct086-source-convert-'));
function chunk(tag,payload){
 const head=Buffer.alloc(4);head.writeUInt32BE(payload.length);
 const type=Buffer.from(tag),crc=Buffer.alloc(4);
 crc.writeUInt32BE(pngCRC32(Buffer.concat([type,payload])));
 return Buffer.concat([head,type,payload,crc]);
}
function pngFixture(color){
 const w=1024,h=1536,ihdr=Buffer.alloc(13);
 ihdr.writeUInt32BE(w,0);ihdr.writeUInt32BE(h,4);ihdr[8]=8;ihdr[9]=6;
 const row=Buffer.alloc(1+w*4);
 for(let x=0;x<w;x++){
  row[1+x*4]=color;row[2+x*4]=(color+100)%256;row[3+x*4]=70;row[4+x*4]=255;
 }
 const raw=Buffer.alloc(row.length*h);
 for(let y=0;y<h;y++)row.copy(raw,row.length*y);
 return Buffer.concat([
  Buffer.from([137,80,78,71,13,10,26,10]),
  chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
}
try{
 const src=pngFixture(30),png=path.join(tmp,'ct086.png'),webp=path.join(tmp,'ct086.webp');
 fs.writeFileSync(png,src);
 const a=inspectPNG(png);
 const transformed=await renderAndCompareCt086PNG(src);
 fs.writeFileSync(webp,transformed.webpBytes);
 const b=inspectWebP(webp);
 check('Runway-size PNG converts to real HD WebP at same pixel dimensions',
  a.width===b.width&&a.height===b.height&&a.width===1024&&a.height===1536);
 check('Lossy WebP conversion does not materially alter original clinical shapes',
  transformed.metrics.mean_rgb_difference<=8&&transformed.metrics.large_rgb_fraction<=0.08,
  JSON.stringify(transformed.metrics));
 const match=await compareCt086Images(src,transformed.webpBytes);
 check('Independent decoded PNG vs WebP pixels match',match.mean_rgb_difference<=8,
  JSON.stringify(match));
 const swap=await compareCt086Images(pngFixture(200),transformed.webpBytes);
 check('Different source PNG is rejected as different image',swap.mean_rgb_difference>8,
  JSON.stringify(swap));
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
const bad=tests.filter(x=>!x.pass);
console.log('CT086 Runway original to HD WebP conversion E2E: '+(tests.length-bad.length)+'/'+tests.length+' PASS');
if(bad.length)process.exit(1);
