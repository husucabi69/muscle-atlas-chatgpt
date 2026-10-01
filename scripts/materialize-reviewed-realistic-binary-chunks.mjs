import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';

function fail(message){
  console.error('CHUNKED REVIEWED BINARY HANDOFF FAIL | '+message);
  process.exit(1);
}

function sha256(buffer){
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

const [profileId,chunkDir,genId,expectedSha,expectedBytesRaw]=process.argv.slice(2);
if(!/^px\d{3}$/.test(profileId||''))fail('profile must be pxNNN');
if(!chunkDir||!genId||!/^[0-9a-f]{64}$/.test(expectedSha||'')){
  fail('Usage: node scripts/materialize-reviewed-realistic-binary-chunks.mjs pxNNN <chunk-dir> <gen-id> <sha256> <bytes>');
}
const expectedBytes=Number(expectedBytesRaw);
if(!Number.isInteger(expectedBytes)||expectedBytes<=0)fail('expected bytes must be a positive integer');
if(!fs.existsSync(chunkDir)||!fs.statSync(chunkDir).isDirectory())fail('chunk directory missing: '+chunkDir);

const parts=fs.readdirSync(chunkDir)
  .filter(name=>/^part-\d{3}\.b64$/.test(name))
  .sort();
if(parts.length===0)fail('no part-NNN.b64 files found');
for(let i=0;i<parts.length;i++){
  const expected='part-'+String(i+1).padStart(3,'0')+'.b64';
  if(parts[i]!==expected)fail('chunk sequence gap: expected '+expected+' got '+parts[i]);
}

const encoded=parts.map(name=>fs.readFileSync(path.join(chunkDir,name),'utf8').replace(/\s+/g,'')).join('');
if(!/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)||encoded.length%4!==0)fail('invalid base64 payload');
const binary=Buffer.from(encoded,'base64');
if(binary.length!==expectedBytes)fail('byte-size mismatch: expected '+expectedBytes+' got '+binary.length);
const actualSha=sha256(binary);
if(actualSha!==expectedSha)fail('SHA-256 mismatch: expected '+expectedSha+' got '+actualSha);
if(binary.subarray(0,4).toString('ascii')!=='RIFF'||binary.subarray(8,12).toString('ascii')!=='WEBP')fail('reconstructed payload is not RIFF/WEBP');

const tempDir=path.join('tmp','stage23b-binary-handoff');
fs.mkdirSync(tempDir,{recursive:true});
const tempPath=path.join(tempDir,profileId+'.webp');
fs.writeFileSync(tempPath,binary);

const child=spawnSync(process.execPath,[
  'scripts/materialize-reviewed-realistic-binary.mjs',
  profileId,tempPath,genId
],{stdio:'inherit'});
if(child.status!==0){
  try{fs.unlinkSync(tempPath);}catch{}
  fail('canonical materializer rejected reconstructed binary');
}
try{fs.unlinkSync(tempPath);}catch{}
console.log('CHUNKED REVIEWED BINARY HANDOFF PASS',profileId,parts.length,expectedBytes,expectedSha);
