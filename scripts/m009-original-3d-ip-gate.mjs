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
assert.equal(registry.runtime_registry,'data/knowledge-core-v1.json','actual runtime canonical source');
assert.equal(registry.clinical_review,'PENDING','specialist signoff must be recorded separately');
assert.equal(registry.external_anatomy_references_verified,false,'partial source review is not full specialist approval');
const model=registry.model||{};
const source=model.editable_source,exportPath=model.gltf_export;
assert.equal(Boolean(source),Boolean(exportPath),'editable source and export must be declared together');
let status='PASS_INTEGRITY_PENDING_ASSET';
if(source&&exportPath){
 for(const p of [source,exportPath]){
  assert(!p.startsWith('/')&&!p.includes('..'),'unsafe model path '+p);
  assert(existsSync(resolve(root,p)),'declared model file missing '+p);
 }
 const glb=readFileSync(resolve(root,exportPath));
 assert(glb.length>=20,'3D export too small');
 assert.equal(glb.subarray(0,4).toString('ascii'),'glTF','not a GLB');
 assert.equal(glb.readUInt32LE(4),2,'GLB must be version 2');
 assert.equal(glb.readUInt32LE(8),glb.length,'GLB byte count mismatch');
 const digest=createHash('sha256').update(glb).digest('hex');
 assert.equal(digest,model.sha256,'GLB digest mismatch');
 assert.equal(model.anatomical_review,'APPROVED','anatomical review pending');
 assert.equal(model.visual_review,'APPROVED','visual review pending');
 assert.notEqual(registry.human_author_editor?.creative_contribution_evidence,'NOT_YET_DOCUMENTED','human creative evidence absent');
 status='PASS_REVIEWED_ORIGINAL_3D';
}else{
 assert.equal(model.sha256,null,'no GLB may have a hash');
 assert.equal(registry.cros_filing,null,'no CROS filing before original 3D asset');
}
console.log(JSON.stringify({gate:'m009-original-3d-ip',status,source:source||null,glb:exportPath||null,cros_filing:registry.cros_filing||null}));
