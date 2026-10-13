import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {inspectWebP} from './inspect-realistic-webp.mjs';

const CANDIDATE_DIR='assets/physical-exam-realistic/candidates';
function safeCandidateFile(root,p,extension){
 const input=String(p||'');
 if(!input.startsWith('./'+CANDIDATE_DIR+'/')||!input.toLowerCase().endsWith(extension)||/[?#]/.test(input)){
  throw new Error('candidate local asset path required with '+extension+' in '+CANDIDATE_DIR);
 }
 const base=path.resolve(root,CANDIDATE_DIR),full=path.resolve(root,input);
 if(!full.startsWith(base+path.sep))throw new Error('candidate asset path escapes reserved directory');
 if(!fs.existsSync(full))throw new Error('candidate asset binary missing: '+input);
 if(fs.lstatSync(full).isSymbolicLink())throw new Error('candidate asset symlink is forbidden');
 if(!fs.realpathSync(full).startsWith(fs.realpathSync(base)+path.sep))throw new Error('candidate binary resolves outside directory');
 return full;
}
function pngInfo(file){
 const b=fs.readFileSync(file),magic=Buffer.from([137,80,78,71,13,10,26,10]);
 if(b.length<33||!b.subarray(0,8).equals(magic)||b.subarray(12,16).toString('ascii')!=='IHDR')
  throw new Error('invalid source PNG signature / IHDR');
 const width=b.readUInt32BE(16),height=b.readUInt32BE(20);
 if(!width||!height||width>10000||height>10000)throw new Error('invalid source PNG dimensions');
 return{width,height,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')};
}
export function verifyPhysicalExamPreviewBinary(candidate,audit,{assetRoot=process.cwd()}={}){
 const preview=safeCandidateFile(assetRoot,candidate.preview_asset_path,'.webp');
 const info=inspectWebP(preview);
 const sourcePath=String(candidate.source_asset_path||'');
 const sourceExt=sourcePath.toLowerCase().endsWith('.png')?'.png':'.webp';
 const source=safeCandidateFile(assetRoot,sourcePath,sourceExt);
 const sourceInfo=sourceExt==='.png'?pngInfo(source):inspectWebP(source);
 if(sourceInfo.sha256!==candidate.source_sha256)throw new Error('source_sha256 does not match on-disk source bytes');
 if(info.sha256!==candidate.preview_webp_sha256)throw new Error('preview_webp_sha256 does not match actual Preview WebP');
 if(info.git_blob_sha1!==candidate.git_blob_sha1)throw new Error('git_blob_sha1 does not match actual Preview WebP');
 if(info.bytes!==candidate.preview_bytes)throw new Error('preview_bytes does not match actual Preview WebP');
 const dims=String(audit.width)+'x'+String(audit.height);
 if(sourceInfo.width+'x'+sourceInfo.height!==dims)throw new Error('source pixel dimensions do not match visual audit');
 if(info.width+'x'+info.height!==dims)throw new Error('Preview WebP is not actual HD dimensions');
 return{sourcePath,previewPath:candidate.preview_asset_path,dims,source_sha256:sourceInfo.sha256,
  preview_webp_sha256:info.sha256,git_blob_sha1:info.git_blob_sha1,preview_bytes:info.bytes};
}
