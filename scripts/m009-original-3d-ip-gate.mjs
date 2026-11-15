#!/usr/bin/env node
/**
 * m009 original 3D/IP evidence integrity gate.
 * PASS_INTEGRITY_PENDING_ASSET is not a completed clinical 3D model.
 */
import {strict as assert} from 'node:assert';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const registry=read('data/ip-asset-registry-v1.json');
assert.equal(registry.stable_id,'m009','stable ID');
assert.equal(registry.anatomy_claim_evidence,'data/anatomy/m009-claim-evidence-v1.json','claim evidence link missing');
const claimEvidence=read(registry.anatomy_claim_evidence);
assert.equal(claimEvidence.stable_id,'m009','claim evidence ID drift');
assert.equal(registry.runtime_registry,'data/knowledge-core-v1.json','actual runtime canonical source');
const gitBlobSha=path=>{const bytes=readFileSync(resolve(root,path));return createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex')};
assert.equal(gitBlobSha(registry.runtime_registry),registry.runtime_registry_sha,'runtime core Git blob SHA drift');
assert.equal(gitBlobSha(registry.source_registry),registry.source_registry_sha,'legacy export Git blob SHA drift');
assert(['PENDING','APPROVED'].includes(registry.clinical_review),'unknown specialist review status');
assert(typeof registry.external_anatomy_references_verified==='boolean','external source review flag missing');
const model=registry.model||{};
const source=model.editable_source,exportPath=model.gltf_export;
assert.equal(Boolean(source),Boolean(exportPath),'editable source and export must be declared together');
let status='PASS_INTEGRITY_PENDING_ASSET';
if(source&&exportPath){
 for(const p of [source,exportPath]){
  assert(!p.startsWith('/')&&!p.includes('..'),'unsafe model path '+p);
  assert(existsSync(resolve(root,p)),'declared model file missing '+p);
 }
 const sourceBytes=readFileSync(resolve(root,source));
 const sourceDigest=createHash('sha256').update(sourceBytes).digest('hex');
 assert.equal(sourceDigest,model.editable_source_sha256,'editable source digest mismatch');
 const exported=readFileSync(resolve(root,exportPath));
 if(exportPath.endsWith('.glb')){
  assert(exported.length>=20,'3D export too small');
  assert.equal(exported.subarray(0,4).toString('ascii'),'glTF','not a GLB');
  assert.equal(exported.readUInt32LE(4),2,'GLB must be version 2');
  assert.equal(exported.readUInt32LE(8),exported.length,'GLB byte count mismatch');
 }else if(exportPath.endsWith('.gltf')){
  const gltf=JSON.parse(exported.toString('utf8'));
  assert.equal(gltf.asset?.version,'2.0','glTF JSON must be version 2.0');
 }else throw new Error('Export must be .glb or .gltf');
 const digest=createHash('sha256').update(exported).digest('hex');
 assert.equal(digest,model.sha256,'export digest mismatch');
 assert.equal(registry.clinical_review,'APPROVED','specialist signoff required before original 3D approval');
 assert.equal(registry.external_anatomy_references_verified,true,'independent anatomy references must be verified');
 assert.equal(model.anatomical_review,'APPROVED','anatomical review pending');
 assert.equal(model.visual_review,'APPROVED','visual review pending');
 assert(registry.human_author_editor?.creative_contribution_evidence && registry.human_author_editor.creative_contribution_evidence!=='NOT_YET_DOCUMENTED','human creative evidence absent');
 status='PASS_REVIEWED_ORIGINAL_3D';
}else{
 assert.equal(model.sha256,null,'no GLB may have a hash');
 assert.equal(model.editable_source_sha256,null,'no source file may have a hash');
 assert.equal(registry.cros_filing,null,'no CROS filing before original 3D asset');
}
if(registry.cros_filing){
 assert.equal(status,'PASS_REVIEWED_ORIGINAL_3D','CROS filing without reviewed original model');
 assert(registry.rights_owner&&registry.rights_owner!=='UNDECIDED_BEFORE_FILING','rights owner missing for CROS');
 assert(registry.human_author_editor?.identity_legal_name&&registry.human_author_editor.identity_legal_name!=='TO_CONFIRM_BEFORE_FILING','legal human identity missing for CROS');
}
console.log(JSON.stringify({gate:'m009-original-3d-ip',status,source:source||null,glb:exportPath||null,cros_filing:registry.cros_filing||null}));
