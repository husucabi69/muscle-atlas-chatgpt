import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {inspectPNG} from './inspect-realistic-png.mjs';
const read=p=>fs.readFileSync(p,'utf8');
const view=read('ct086-review.html'),home=read('index.html');
const registry=JSON.parse(read('data/physical-exam-realistic-assets-v1.json'));
const photo='assets/physical-exam-realistic/drafts/ct086-imagegen-triptych-review-20261017.png';
const source='assets/physical-exam-realistic/drafts/ct086-imagegen-source-20261017.png';
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const expected={photo:'a86ec3f07765e7dfc87fdbaa39f19f6f31f48fa6ee457b8408845e001bb5d3a3',source:'1217a8fcecbcca209a274757591d078a2eb12704513b6671aa38f88eac071663'};
let n=0;
function check(label,fn){fn();n++;console.log('PASS | '+label);}
check('Full-size preexisting photo draft and raw source bytes are unchanged',()=>{
  assert.equal(hash(photo),expected.photo);assert.equal(hash(source),expected.source);
  assert.deepEqual([inspectPNG(photo).width,inspectPNG(photo).height],[1024,1536]);
  assert.deepEqual([inspectPNG(source).width,inspectPNG(source).height],[1214,1295]);
});
check('One-tap route from the original clinical teaching screen',()=>{
  assert.match(home,/data-ct086-review-workspace="ct086"/);
  assert.match(home,/href="\.\/ct086-review\.html"/);
});
check('Three distinct review stages, single source asset, no deceptive reconstruction',()=>{
  for(const label of ['neutral','rotation','compensation'])
    assert.ok(view.includes('data-ct086-review-panel="'+label+'"'));
  assert.ok(view.includes('background-position:center top'));
  assert.ok(view.includes('background-position:center center'));
  assert.ok(view.includes('background-position:center bottom'));
  assert.ok(view.includes('background-size:100% 300%'));
  assert.ok(view.includes(photo));
  assert.ok(view.includes(source));
});
check('All visible photography is prominently marked as NOT approved',()=>{
  assert.ok(view.includes('data-review-not-approved="ct086"'));
  assert.ok(view.includes('PENDING · 의료진·의장님 미승인'));
  assert.ok(view.includes('AI 합성 · 검수 전'));
  assert.ok(view.includes('교육 정본으로 사용 금지'));
  assert.ok(view.includes('새로운 네이티브 HD 원본을 만들거나 의학적 오류를 수정한 것은 아닙니다'));
});
check('Clinical explanation preserves active ROM, safeguards, and non-diagnostic meaning',()=>{
  assert.ok(view.includes('환자가 스스로'));
  assert.ok(view.includes('강제로 조작하지 않습니다'));
  assert.ok(view.includes('단독으로 신경근병증을 확진하지 않습니다'));
  assert.ok(view.includes('정상 회전 범위만으로 신경근병증·척수병증을 배제하지 않습니다'));
  assert.ok(view.includes('예측규칙의 60도 기준'));
});
check('No browser-side approval/PHI upload, external generation, or stealth script',()=>{
  assert.ok(!/<script\b/i.test(view));
  assert.ok(!/<form\b/i.test(view));
  assert.ok(!/<(?:iframe|canvas|video)\b/i.test(view));
  assert.ok(!/https?:\/\//.test(view.replace('http://www.w3.org/1999/xhtml','')));
  assert.match(view,/noindex,nofollow/);
});
check('Canonical ct086 remains pending; ct085 approved and ct088 deferred stay protected',()=>{
  const p=id=>registry.profiles.find(x=>x.clinical_test_id===id);
  assert.equal(p('ct086').status,'PENDING_GENERATION');
  assert.equal(p('ct086').composite_url,null);
  assert.ok(!p('ct086').preview_candidate);
  assert.equal(p('ct085').status,'APPROVED');
  assert.match(p('ct088').status,/^INCOMPLETE_DEFERRED/);
});
console.log('CT086 REVIEW ROOM '+n+'/'+n+' PASS | user and clinician approval still required');
