import fs from 'node:fs';
import {inspectPNG} from './inspect-realistic-png.mjs';
import {inspectWebP} from './inspect-realistic-webp.mjs';
import {compareCt086Images} from './ct086-candidate5-hd-source-derivative.mjs';

const registry=JSON.parse(fs.readFileSync('data/physical-exam-realistic-assets-v1.json','utf8'));
const profile=registry.profiles.find(x=>x.clinical_test_id==='ct086');
const pending=profile?.preview_candidate;
if(!pending){
 if(profile.status!=='PENDING_GENERATION'||profile.inflight_render_task?.binary_verified!==false)
   throw Error('CT086 FIREFIGHT SOURCE FIDELITY: unexpected no-preview registry state');
 console.log('CT086 SOURCE/WEBP PIXEL FIDELITY: NOT CONNECTED; historical provider disallowed; new independent HD clinical artwork remains pending');
}else{
 if(profile.status!=='CANDIDATE_GENERATED_USER_PREVIEW_PENDING'||
    !pending.exact_binary_verified||!pending.independent_artwork_verified||
    profile.inflight_render_task?.generator!=='LYSOS_INDEPENDENT_ORIGINAL'||
    pending.generator!=='LYSOS_INDEPENDENT_ORIGINAL'||
    !pending.provenance_evidence_reference||
    !/runway/i.test(String(profile.historical_restricted_provider_render_task?.generator||''))){
   throw Error('CT086 INDEPENDENT SOURCE FIDELITY: unverified or restricted artwork published');
 }
 const source=String(pending.source_asset_path||'');
 const webp=String(pending.preview_asset_path||'');
 if(!source.startsWith('./assets/physical-exam-realistic/candidates/')||
    !webp.startsWith('./assets/physical-exam-realistic/candidates/'))
  throw Error('CT086 FIREFIGHT SOURCE FIDELITY: unsafe candidate paths');
 const sourceExt=source.toLowerCase().endsWith('.png')?'png':'webp';
 const original=sourceExt==='png'?inspectPNG(source):inspectWebP(source);
 const preview=inspectWebP(webp);
 if(original.sha256!==pending.source_sha256||
   preview.sha256!==pending.preview_webp_sha256||
   preview.git_blob_sha1!==pending.git_blob_sha1||
   preview.bytes!==pending.preview_bytes){
  throw Error('CT086 FIREFIGHT SOURCE FIDELITY: binary metadata mismatch');
 }
 const outcome=await compareCt086Images(fs.readFileSync(source),fs.readFileSync(webp),
   {sourceMime:sourceExt==='png'?'image/png':'image/webp'});
 if(outcome.mean_rgb_difference>8||outcome.large_rgb_fraction>0.08){
  throw Error('CT086 FIREFIGHT SOURCE FIDELITY: actual rendered human anatomy changed '+JSON.stringify(outcome));
 }
 console.log('CT086 SOURCE/WEBP PIXEL FIDELITY PASS | real registered exact original and preview visually consistent | '+JSON.stringify(outcome));
}
