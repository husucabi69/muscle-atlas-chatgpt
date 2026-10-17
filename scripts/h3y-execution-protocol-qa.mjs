import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=path=>fs.readFileSync(path,'utf8');
const path='docs/H3Y_DEVELOPMENT_EXECUTION_PROTOCOL_V1.md';
const protocol=read(path);
const targets=[
'AGENTS.md',
'docs/DEVELOPMENT_CONSTITUTION.md',
'docs/DEVELOPMENT_PRINCIPLES.md',
'docs/MASTER_ROADMAP.md',
'docs/NEXT_UPGRADE_ROADMAP.md',
'docs/HANDOFF_CURRENT.md',
'docs/PREVIEW_DEVELOPMENT_POLICY.md'
];
let n=0;
const check=(name,fn)=>{fn();n++;console.log('PASS | '+name);};
check('Active canonical protocol is recorded',()=>{
 assert.ok(protocol.includes('H3Y DEVELOPMENT EXECUTION PROTOCOL v1.0'));
 for(const t of ['기본 35분','최대 50분','35분','50분','USER_STOP_OVERRIDE'])assert.ok(protocol.includes(t),t);
});
for(const target of targets){
 check('Latest protocol precedence is prominent: '+target,()=>{
  const text=read(target);const marker='H3Y DEVELOPMENT EXECUTION PROTOCOL v1.0';
  assert.ok(text.includes(marker),target);
  const top=text.indexOf(marker);
  const historical=text.indexOf('SUPER-LOCK 2026-10-11');
  if(historical>=0)assert.ok(top>=0&&top<historical,'the newer user rule must precede historical timing');
  for(const v of ['50분','35분','RUNWAY'])assert.ok(text.toLowerCase().includes(v.toLowerCase()),target+' missing '+v);
 });
}
check('35-minute mandatory report and bounded extension are effective',()=>{
 for(const phrase of ['35분 완료 여부 무관','50분 절대 HARD STOP','50분까지 자율 연장','역사적','SUPERSEDED'])
  assert.ok(read('AGENTS.md').includes(phrase),'missing '+phrase);
 assert.ok(protocol.includes('35분 보고')&&protocol.includes('50분 절대 HARD STOP'));
});
check('Final-report headings use the new three-section protocol',()=>{
 for(const label of ['① 무엇을 했나','② 어떻게 되었나','③ 앞으로 무엇을 할 건가'])
   assert.ok(protocol.includes(label),label);
});
check('Prohibited image provider, Production, Claude hold and registration remain protected',()=>{
 const docs=read('AGENTS.md')+protocol+read('docs/NEXT_UPGRADE_ROADMAP.md');
 for(const phrase of ['RUNWAY-PROHIBITED','Production/main','ct085','ct086','ct088','COPYRIGHT-GATE-0~5','ANATOMY-MASTER-3D-001'])
  assert.ok(docs.includes(phrase),phrase);
});
check('One ACTIVE ct086 review page is not an approved medical asset',()=>{
 const html=read('ct086-review.html');
 assert.ok(html.includes('data-review-not-approved="ct086"'));
 assert.ok(!html.includes('data-clinical-image-approved="ct086"'));
 const registry=JSON.parse(read('data/physical-exam-realistic-assets-v1.json'));
 const status=registry.profiles.find(x=>x.clinical_test_id==='ct086')?.status;
 assert.equal(status,'PENDING_GENERATION');
});
console.log('H3Y PROTOCOL v1.0 '+n+'/'+n+' PASS | old 35-minute rule is superseded, not silently revived');
