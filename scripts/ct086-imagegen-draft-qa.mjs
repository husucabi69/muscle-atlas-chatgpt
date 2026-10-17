import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {inspectPNG} from './inspect-realistic-png.mjs';

const raw='assets/physical-exam-realistic/drafts/ct086-imagegen-source-20261017.png';
const draft='assets/physical-exam-realistic/drafts/ct086-imagegen-triptych-review-20261017.png';
const html=fs.readFileSync('index.html','utf8');
const registry=JSON.parse(fs.readFileSync('data/physical-exam-realistic-assets-v1.json','utf8'));
const SHA=path=>crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex');
const CT086=registry.profiles.find(x=>x.clinical_test_id==='ct086');
let n=0;
function check(label,cb){cb();n++;console.log('PASS | '+label);}
check('Actual AI-generated source is preserved byte-for-byte with 1214x1295 pixels',()=>{
 const info=inspectPNG(raw);
 assert.deepEqual([info.width,info.height],[1214,1295]);
 assert.equal(SHA(raw),'1217a8fcecbcca209a274757591d078a2eb12704513b6671aa38f88eac071663');
});
check('Edited review triptych is real 1024x1536 PNG, not an imaginary path',()=>{
 const info=inspectPNG(draft);
 assert.deepEqual([info.width,info.height],[1024,1536]);
 assert.equal(SHA(draft),'a86ec3f07765e7dfc87fdbaa39f19f6f31f48fa6ee457b8408845e001bb5d3a3');
});
check('APP never says original is a human-authored copyrightable asset or an approved clinical figure',()=>{
 assert.ok(html.includes('인공지능 합성 사진형 3장면 시안'));
 assert.ok(html.includes('실사형 승인본이나 환자교육 정본이 아닙니다.'));
 assert.ok(html.includes('고해상도 정본 기준 미통과'));
});
check('Review image and original are accessible only from a separate review link, not canonical profile',()=>{
 assert.ok(html.includes('data-clinical-photo-draft="ct086"'));
 assert.ok(html.includes('data-clinical-photo-original="ct086"'));
 assert.ok(html.includes('./'+draft));
 assert.ok(html.includes('./'+raw));
 assert.equal(CT086.status,'PENDING_GENERATION');
 assert.ok(!CT086.preview_candidate);
 assert.equal(CT086.composite_url,null);
});
check('Legacy vendor image and all approvals remain protected',()=>{
 assert.ok(html.includes('data-exam-realistic-provider-blocked="ct086"'));
 assert.ok(registry.profiles.find(x=>x.clinical_test_id==='ct085').status==='APPROVED');
 assert.ok(registry.profiles.find(x=>x.clinical_test_id==='ct088').status.startsWith('INCOMPLETE_DEFERRED'));
});
check('Raw source dimensions are NOT falsely labeled canonical HD',()=>{
 assert.ok(html.includes('원본 생성 이미지 1214×1295'));
 assert.ok(html.includes('개별 장면은 크기 조정'));
});
console.log('CT086 PHOTO-LIKE SYNTHETIC DRAFT | '+n+'/'+n+' PASS | human anatomical review and user approval remain PENDING');
