import fs from 'node:fs';
import crypto from 'node:crypto';

function fail(message){throw new Error(message);}
function u24le(buf,offset){return buf[offset]|(buf[offset+1]<<8)|(buf[offset+2]<<16);}

export function inspectWebP(file){
  const b=fs.readFileSync(file);
  if(b.length<20)fail('FILE_TOO_SMALL');
  if(b.subarray(0,4).toString('ascii')!=='RIFF')fail('RIFF_HEADER_MISSING');
  if(b.subarray(8,12).toString('ascii')!=='WEBP')fail('WEBP_SIGNATURE_MISSING');
  const declared=b.readUInt32LE(4)+8;
  if(declared!==b.length)fail('RIFF_SIZE_MISMATCH declared='+declared+' actual='+b.length);

  let offset=12;
  let width=null,height=null,primaryChunk=null;
  while(offset+8<=b.length){
    const type=b.subarray(offset,offset+4).toString('ascii');
    const size=b.readUInt32LE(offset+4);
    const data=offset+8;
    const end=data+size;
    if(end>b.length)fail('TRUNCATED_CHUNK '+type);
    if(type==='VP8X'){
      if(size<10)fail('VP8X_TOO_SMALL');
      width=1+u24le(b,data+4);
      height=1+u24le(b,data+7);
      primaryChunk='VP8X';
    }else if(type==='VP8 ' && width===null){
      if(size<10)fail('VP8_TOO_SMALL');
      if(b[data+3]!==0x9d||b[data+4]!==0x01||b[data+5]!==0x2a)fail('VP8_FRAME_HEADER_INVALID');
      width=b.readUInt16LE(data+6)&0x3fff;
      height=b.readUInt16LE(data+8)&0x3fff;
      primaryChunk='VP8';
    }else if(type==='VP8L' && width===null){
      if(size<5)fail('VP8L_TOO_SMALL');
      if(b[data]!==0x2f)fail('VP8L_SIGNATURE_INVALID');
      const bits=b.readUInt32LE(data+1);
      width=(bits&0x3fff)+1;
      height=((bits>>14)&0x3fff)+1;
      primaryChunk='VP8L';
    }
    offset=end+(size%2);
  }
  if(offset!==b.length)fail('CHUNK_ALIGNMENT_MISMATCH');
  if(!width||!height)fail('DIMENSIONS_NOT_FOUND');
  if(width<100||height<100)fail('DIMENSIONS_IMPLAUSIBLE '+width+'x'+height);
  const sha256=crypto.createHash('sha256').update(b).digest('hex');
  const gitBlobHeader=Buffer.from('blob '+b.length+'\0','utf8');
  const git_blob_sha1=crypto.createHash('sha1').update(gitBlobHeader).update(b).digest('hex');
  return{file,bytes:b.length,width,height,primaryChunk,sha256,git_blob_sha1};
}

if(process.argv[1]&&process.argv[1].endsWith('inspect-realistic-webp.mjs')){
  try{
    const file=process.argv[2];
    if(!file)fail('Usage: node scripts/inspect-realistic-webp.mjs <file.webp>');
    console.log(JSON.stringify(inspectWebP(file),null,2));
  }catch(error){
    console.error('WEBP INTEGRITY FAIL | '+error.message);
    process.exit(1);
  }
}
