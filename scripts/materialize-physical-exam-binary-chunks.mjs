import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {inspectWebP} from './inspect-realistic-webp.mjs';

const sha256=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
const fail=msg=>{throw new Error(msg);};

function assemble(chunkDir,expectedSha,expectedBytes){
  if(!fs.existsSync(chunkDir)||!fs.statSync(chunkDir).isDirectory())fail('chunk directory missing: '+chunkDir);
  const parts=fs.readdirSync(chunkDir).filter(n=>/^part-\d{3}\.b64$/.test(n)).sort();
  if(!parts.length)fail('no part-NNN.b64 files');
  for(let i=0;i<parts.length;i++){
    const want='part-'+String(i+1).padStart(3,'0')+'.b64';
    if(parts[i]!==want)fail('chunk sequence gap: expected '+want+' got '+parts[i]);
  }
  const encoded=parts.map(n=>fs.readFileSync(path.join(chunkDir,n),'utf8').replace(/\s+/g,'')).join('');
  if(!/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)||encoded.length%4!==0)fail('invalid base64 payload');
  const binary=Buffer.from(encoded,'base64');
  if(binary.length!==expectedBytes)fail('byte-size mismatch expected='+expectedBytes+' actual='+binary.length);
  const actual=sha256(binary);
  if(actual!==expectedSha)fail('sha256 mismatch expected='+expectedSha+' actual='+actual);
  if(binary.subarray(0,4).toString('ascii')!=='RIFF'||binary.subarray(8,12).toString('ascii')!=='WEBP')fail('not a RIFF/WEBP payload');
  return{binary,parts,sha256:actual};
}

try{
  const [testId,chunkDir,genId,expectedSha,expectedBytesRaw,outputPath]=process.argv.slice(2);
  if(!/^ct\d{3}$/.test(testId||''))fail('test id must be ctNNN');
  if(!genId||!chunkDir||!outputPath)fail('missing materialization argument');
  if(!/^[0-9a-f]{64}$/.test(expectedSha||''))fail('invalid expected sha256');
  const expectedBytes=Number(expectedBytesRaw);
  if(!Number.isInteger(expectedBytes)||expectedBytes<=0)fail('invalid expected bytes');

  const manifestPath='data/physical-exam-realistic-assets-v1.json';
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  const profile=manifest.profiles.find(p=>p.clinical_test_id===testId);
  if(!profile)fail('profile not found: '+testId);
  if(profile.status!=='USER_APPROVED_ASSETS_BINARY_TRANSFER_PENDING')fail('profile is not in binary-transfer-pending state');
  if(profile.review?.user_preview!=='PASS')fail('user approval PASS is required');
  if(profile.approved_binary_handoff?.gen_id!==genId)fail('gen_id mismatch');
  if(profile.approved_binary_handoff?.expected_webp_sha256!==expectedSha)fail('manifest expected sha mismatch');
  if(Number(profile.approved_binary_handoff?.expected_bytes)!==expectedBytes)fail('manifest expected byte count mismatch');
  if(profile.approved_binary_handoff?.output_path!==outputPath)fail('manifest output path mismatch');

  const assembled=assemble(chunkDir,expectedSha,expectedBytes);
  fs.mkdirSync(path.dirname(outputPath),{recursive:true});
  fs.writeFileSync(outputPath,assembled.binary);
  const info=inspectWebP(outputPath);
  if(info.sha256!==expectedSha||info.bytes!==expectedBytes)fail('strict WebP inspection identity mismatch');
  const expectedDimensions=profile.approved_binary_handoff?.expected_dimensions||'';
  if(expectedDimensions&&expectedDimensions!==info.width+'x'+info.height)fail('dimension mismatch expected='+expectedDimensions+' actual='+info.width+'x'+info.height);
  if(info.width<1024||info.height<1024)fail('HD canonical minimum not met: '+info.width+'x'+info.height);

  profile.status='APPROVED';
  profile.brief_status='APPROVED';
  profile.composite_url='./'+outputPath.replace(/^\.\//,'');
  profile.user_approved_asset={
    gen_id:genId,
    source_review_path:profile.approved_binary_handoff.source_review_path,
    approved_asset_path:profile.composite_url,
    approved_webp_sha256:info.sha256,
    dimensions:info.width+'x'+info.height,
    source_review_png_sha256:profile.approved_binary_handoff.source_review_png_sha256,
    disposition:'USER_APPROVED_PASS'
  };
  profile.approval_blockers=[];
  profile.approved_binary_handoff={
    ...profile.approved_binary_handoff,
    state:'MATERIALIZED_VERIFIED',
    materialized_sha256:info.sha256,
    materialized_bytes:info.bytes,
    materialized_dimensions:info.width+'x'+info.height,
    materialized_git_blob_sha1:info.git_blob_sha1
  };
  manifest.dataset_version='2026.10.06-exam-real-'+testId+'-hd-materialized';
  manifest.pilot.next_action=testId+' approved HD binary materialized and locked. Continue the canonical work queue; do not regenerate approved assets; Production remains frozen.';
  fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
  console.log('EXAM-REAL CHUNKED BINARY MATERIALIZATION PASS',testId,assembled.parts.length,JSON.stringify(info));
}catch(e){
  console.error('EXAM-REAL CHUNKED BINARY MATERIALIZATION FAIL | '+e.message);
  process.exit(1);
}
