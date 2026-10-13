import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {evaluatePhysicalExamCandidate} from './physical-exam-candidate-preflight.mjs';
const lock=JSON.parse(fs.readFileSync('docs/LYSOS_CLAUDE_EDITION2_HOLD_LOCK.json','utf8'));
assert.equal(lock.schema,'lysos-edition-2-hold-v1');
assert.equal(lock.status,'CLAUDE_EDITION2_PUBLICATION_PENDING');
assert.equal(lock.import_next_edition_only_after_explicit_user_instruction,true);
const gitBlob=(buf)=>crypto.createHash('sha1').update(Buffer.from('blob '+buf.length+'\0')).update(buf).digest('hex');
for(const [p,expected] of Object.entries(lock.protected_app_source_git_blobs)){
 assert.ok(fs.existsSync(p),'frozen academic bridge source exists: '+p);
 const b=fs.readFileSync(p);
 assert.equal(gitBlob(b),expected,'Claude 1st-edition bridge must remain frozen: '+p);
}
const cat=JSON.parse(fs.readFileSync('data/claude-library-manifest-v1.json','utf8'));
assert.equal(cat.lectures?.length,87);
assert.equal(lock.source_html_count,87);
for(const x of cat.lectures){
 const raw=fs.readFileSync('claude-library/'+x.source_path);
 assert.equal(raw.length,x.source_bytes,'edition 1 exact bytes #'+x.number);
 assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),x.source_sha256,
  'edition 1 SHA-256 immutable #'+x.number);
}
const registry=JSON.parse(fs.readFileSync('data/physical-exam-realistic-assets-v1.json','utf8'));
const get=id=>registry.profiles.find(p=>p.clinical_test_id===id);
assert.equal(get('ct085').status,'APPROVED');
assert.equal(get('ct085').hd_migration_status,'HD_CANONICAL');
assert.equal(get('ct086').status,'PENDING_GENERATION');
assert.equal(get('ct086').brief_status,'GENERATION_READY');
assert.equal(get('ct086').preview_candidate??null,null,'unverified render must not enter user Preview');
assert.equal(get('ct086').composite_url??null,null,'never replace original schematic without verified bytes');
assert.equal(get('ct087').status,'PENDING_GENERATION');
assert.ok(String(get('ct088').status).startsWith('INCOMPLETE_DEFERRED'));
const render=JSON.parse(fs.readFileSync('docs/checkpoints/CT086_CANDIDATE5_RUNWAY_TASK_2026-10-14.json','utf8'));
assert.equal(render.runway_task_id,'00886834-ff19-4655-9000-6941f580664d');
assert.equal(render.contract,'2026-10-07-ct086-v2');
assert.equal(render.binary_materialization,'NOT_AVAILABLE_IN_REPOSITORY');
assert.equal(render.preview_connected,false);
assert.equal(render.user_preview,'PENDING_NOT_CONNECTED');
const visual=JSON.parse(fs.readFileSync('docs/checkpoints/CT086_CANDIDATE5_VISUAL_AUDIT_PENDING_2026-10-14.json','utf8'));
assert.equal(visual.task_id,render.runway_task_id);
assert.equal(visual.visual_review_state,'NOT_PERFORMED');
const visualResult=evaluatePhysicalExamCandidate(get('ct086'),visual);
assert.equal(visualResult.eligible,false,'unreviewed Runway image cannot bypass clinical visual safety gate');
assert.ok(visualResult.failed_axes.includes('FEMALE_PATIENT')&&visualResult.failed_axes.includes('HD_DIMENSIONS'));
const ip=JSON.parse(fs.readFileSync('docs/checkpoints/CT086_CANDIDATE5_PROVENANCE_2026-10-14.json','utf8'));
assert.equal(ip.task_id,render.runway_task_id);
assert.ok(ip.original_generation_prompt_exact.length>500);
assert.equal(ip.actual_image_binary_sha256,null);
assert.equal(ip.signed_download_url_recorded,false);
assert.equal(ip.import_to_app,'NOT_CONNECTED');
console.log('LYSOS CLAUDE 2ND EDITION HOLD / CT086 RESUME QA PASS | '+Object.keys(lock.protected_app_source_git_blobs).length+' bridge blobs; 87 protected originals; unverified ct086 asset cannot be presented as approved');
