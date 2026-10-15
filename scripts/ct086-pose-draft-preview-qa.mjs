import fs from 'node:fs';
import assert from 'node:assert/strict';
const path='assets/physical-exam-realistic/drafts/ct086-original-pose-layout-review-20261015.svg';
const svg=fs.readFileSync(path,'utf8');
const html=fs.readFileSync('index.html','utf8');
const reg=JSON.parse(fs.readFileSync('data/physical-exam-realistic-assets-v1.json','utf8'));
const p=id=>reg.profiles.find(x=>x.clinical_test_id===id);
let pass=0;
const check=(label,fn)=>{fn();pass++;console.log('PASS | '+label);};
check('1024x1536 portrait review draft with accessible metadata',()=>{
 assert.match(svg,/<svg[^>]+width="1024"[^>]+height="1536"/);
 assert.ok(svg.includes('viewBox="0 0 1024 1536"'));
 assert.ok(svg.includes('aria-labelledby="title desc"'));
});
check('Three exact Korean headers and no extra educational diagnosis copy',()=>{
 for(const label of ['1 중립 자세','2 좌우 회전','3 제한 / 보상'])
  assert.equal(svg.split(label).length-1,1,label);
 assert.equal((svg.match(/<text\b/g)||[]).length,3);
});
check('Draft contains original vector drawing and no foreign photograph',()=>{
 assert.ok((svg.match(/<path\b/g)||[]).length>=15);
 assert.ok((svg.match(/<linearGradient\b/g)||[]).length>=4);
 assert.ok(!/<(?:image|foreignObject|script|iframe|use)\b/i.test(svg));
 assert.ok(!/https?:|data:image|onload=|onerror=|javascript:/i.test(svg.replace('http://www.w3.org/2000/svg','')));
});
check('No approval claims and no excluded source reused',()=>{
 assert.match(svg,/NOT a clinical-approved artwork/);
 assert.match(svg,/not photorealistic or approved/);
 assert.ok(!/runway|candidate5|approved\.webp/i.test(svg));
});
check('ct086 review-only draft link in its blocked state',()=>{
 assert.ok(html.includes('data-exam-independent-layout-draft="ct086"'));
 assert.ok(html.includes('data-clinical-visual-draft="ct086"'));
 assert.ok(html.includes('./'+path));
 assert.ok(html.includes('임상·저작권 검수 전'));
 assert.ok(html.includes('실사형 승인본이 아닙니다'));
});
check('ct086 canonical never becomes pre-approved',()=>{
 assert.equal(p('ct086').status,'PENDING_GENERATION');
 assert.equal(p('ct086').composite_url,null);
 assert.ok(!p('ct086').preview_candidate);
});
check('approved ct085 and deferred ct088 remain untouched',()=>{
 assert.equal(p('ct085').status,'APPROVED');
 assert.ok(p('ct088').status.startsWith('INCOMPLETE_DEFERRED'));
});
console.log('CT086 POSE REVIEW ONLY: '+pass+'/'+pass+' PASS | not a clinical/photorealistic approved asset');
