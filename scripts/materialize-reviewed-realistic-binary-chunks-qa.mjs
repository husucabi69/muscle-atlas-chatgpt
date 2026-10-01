import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {assembleChunkedBinary} from './materialize-reviewed-realistic-binary-chunks.mjs';

function assert(condition,message){if(!condition)throw new Error(message);}
function sha256(buffer){return crypto.createHash('sha256').update(buffer).digest('hex');}

const sourcePath='assets/patient-exercise-realistic/px001.webp';
const source=fs.readFileSync(sourcePath);
const expectedSha=sha256(source);
const root=fs.mkdtempSync(path.join(os.tmpdir(),'stage23b-chunk-qa-'));
try{
  const encoded=source.toString('base64');
  const chunkSize=4096;
  let index=1;
  for(let offset=0;offset<encoded.length;offset+=chunkSize){
    fs.writeFileSync(path.join(root,'part-'+String(index++).padStart(3,'0')+'.b64'),encoded.slice(offset,offset+chunkSize));
  }
  const out=assembleChunkedBinary(root,{expectedSha,expectedBytes:source.length});
  assert(out.bytes===source.length,'reconstructed byte count mismatch');
  assert(out.sha256===expectedSha,'reconstructed SHA mismatch');
  assert(Buffer.compare(out.binary,source)===0,'reconstructed binary is not byte-for-byte identical');

  const first=path.join(root,'part-001.b64');
  const original=fs.readFileSync(first,'utf8');
  fs.writeFileSync(first,(original[0]==='A'?'B':'A')+original.slice(1));
  let rejected=false;
  try{assembleChunkedBinary(root,{expectedSha,expectedBytes:source.length});}catch{rejected=true;}
  assert(rejected,'corrupted chunk must fail closed');
  console.log('CHUNKED REVIEWED BINARY HANDOFF QA PASS',out.parts.length,out.bytes,out.sha256);
}finally{
  fs.rmSync(root,{recursive:true,force:true});
}
