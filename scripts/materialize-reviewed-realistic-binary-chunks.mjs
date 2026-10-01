import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';

function sha256(buffer){
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function assembleChunkedBinary(chunkDir,{expectedSha,expectedBytes}){
  if(!chunkDir||!fs.existsSync(chunkDir)||!fs.statSync(chunkDir).isDirectory())throw new Error('chunk directory missing: '+String(chunkDir||''));
  if(!/^[0-9a-f]{64}$/.test(expectedSha||''))throw new Error('expected SHA-256 must be 64 lowercase hex chars');
  if(!Number.isInteger(expectedBytes)||expectedBytes<=0)throw new Error('expected bytes must be a positive integer');
  const parts=fs.readdirSync(chunkDir).filter(name=>/^part-\d{3}\.b64$/.test(name)).sort();
  if(parts.length===0)throw new Error('no part-NNN.b64 files found');
  for(let i=0;i<parts.length;i++){
    const expected='part-'+String(i+1).padStart(3,'0')+'.b64';
    if(parts[i]!==expected)throw new Error('chunk sequence gap: expected '+expected+' got '+parts[i]);
  }
  const encoded=parts.map(name=>fs.readFileSync(path.join(chunkDir,name),'utf8').replace(/\s+/g,'')).join('');
  if(!/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)||encoded.length%4!==0)throw new Error('invalid base64 payload');
  const binary=Buffer.from(encoded,'base64');
  if(binary.length!==expectedBytes)throw new Error('byte-size mismatch: expected '+expectedBytes+' got '+binary.length);
  const actualSha=sha256(binary);
  if(actualSha!==expectedSha)throw new Error('SHA-256 mismatch: expected '+expectedSha+' got '+actualSha);
  if(binary.subarray(0,4).toString('ascii')!=='RIFF'||binary.subarray(8,12).toString('ascii')!=='WEBP')throw new Error('reconstructed payload is not RIFF/WEBP');
  return{binary,parts,sha256:actualSha,bytes:binary.length};
}

function fail(message){
  console.error('CHUNKED REVIEWED BINARY HANDOFF FAIL | '+message);
  process.exit(1);
}

if(process.argv[1]&&process.argv[1].endsWith('materialize-reviewed-realistic-binary-chunks.mjs')){
  try{
    const [profileId,chunkDir,genId,expectedSha,expectedBytesRaw]=process.argv.slice(2);
    if(!/^px\d{3}$/.test(profileId||''))throw new Error('profile must be pxNNN');
    if(!chunkDir||!genId)throw new Error('Usage: node scripts/materialize-reviewed-realistic-binary-chunks.mjs pxNNN <chunk-dir> <gen-id> <sha256> <bytes>');
    const expectedBytes=Number(expectedBytesRaw);
    const assembled=assembleChunkedBinary(chunkDir,{expectedSha,expectedBytes});
    const tempDir=path.join('tmp','stage23b-binary-handoff');
    fs.mkdirSync(tempDir,{recursive:true});
    const tempPath=path.join(tempDir,profileId+'.webp');
    fs.writeFileSync(tempPath,assembled.binary);
    const child=spawnSync(process.execPath,['scripts/materialize-reviewed-realistic-binary.mjs',profileId,tempPath,genId],{stdio:'inherit'});
    if(child.status!==0){
      try{fs.unlinkSync(tempPath);}catch{}
      throw new Error('canonical materializer rejected reconstructed binary');
    }
    try{fs.unlinkSync(tempPath);}catch{}
    console.log('CHUNKED REVIEWED BINARY HANDOFF PASS',profileId,assembled.parts.length,assembled.bytes,assembled.sha256);
  }catch(error){
    fail(error.message);
  }
}
