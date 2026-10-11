// Optional post-session audit of REAL KST clock stamps.
// NEVER infer a missing sent-at time from a commit, QA run, or message draft.
// GitHub CI self-tests policy math; it cannot observe a ChatGPT message send.
import assert from 'node:assert/strict';
import fs from 'node:fs';

const KST=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/;
const minute=60_000;
const note=(label,pass,detail)=>({label,pass,detail});

export function verifyReport(record){
  const checks=[];
  const required=['started_at','development_stopped_at','work_stopped_at','report_sent_at'];
  const stamps={};
  for(const key of required){
    const value=record?.[key];
    if(typeof value!=='string'||!KST.test(value)||!Number.isFinite(Date.parse(value))){
      checks.push(note('실측 '+key,false,'미계측 또는 +09:00 ISO8601 형식 불일치'));
    }else stamps[key]=Date.parse(value);
  }
  if(required.some(key=>stamps[key]===undefined)){
    return {pass:false,checks};
  }
  const begin=stamps.started_at;
  const dev=(stamps.development_stopped_at-begin)/minute;
  const work=(stamps.work_stopped_at-begin)/minute;
  const report=(stamps.report_sent_at-begin)/minute;
  const order=begin<=stamps.development_stopped_at &&
    stamps.development_stopped_at<=stamps.work_stopped_at &&
    stamps.work_stopped_at<=stamps.report_sent_at;
  checks.push(note('실측시각 전후관계',order,`dev=${dev}m work=${work}m report=${report}m`));
  if(record.mode==='manual'){
    checks.push(note('수동개발 25~30분',dev>=25&&dev<=30,`${dev}분`));
    checks.push(note('30분 이후 신규 개발 금지',dev<=30,`${dev}분`));
    checks.push(note('35분 HARD STOP',work<=35,`${work}분`));
    checks.push(note('35분 내 최종보고 실제 전송',report<=35,`${report}분`));
  }else if(record.mode==='scheduled'){
    const max=Number(record.hard_stop_minutes);
    const target=Number(record.target_minutes);
    const valid=Number.isFinite(max)&&max>0&&Number.isFinite(target)&&target>0&&target<=max;
    checks.push(note('예약별 별도 시간표 명시',valid,`target=${target}, hard=${max}`));
    checks.push(note('예약작업 HARD STOP',valid&&work<=max,`${work}분`));
    checks.push(note('예약작업 최종보고 시간',valid&&report<=max,`${report}분`));
  }else{
    checks.push(note('수동/예약 유형',false,String(record.mode||'미지정')));
  }
  if(record.instruction_received_at!==undefined&&record.instruction_received_at!==null){
    const i=record.instruction_received_at;
    checks.push(note('지시 수령시각 실제 계측',typeof i==='string'&&KST.test(i)&&
      Number.isFinite(Date.parse(i))&&Date.parse(i)<=begin,i));
  }
  return {pass:checks.every(x=>x.pass),checks,elapsed_minutes:{development:dev,work,report}};
}

const sample=(d,w,r)=>({
  mode:'manual',
  started_at:'2026-10-11T10:00:00+09:00',
  development_stopped_at:`2026-10-11T10:${String(d).padStart(2,'0')}:00+09:00`,
  work_stopped_at:`2026-10-11T10:${String(w).padStart(2,'0')}:00+09:00`,
  report_sent_at:`2026-10-11T10:${String(r).padStart(2,'0')}:00+09:00`
});
if(process.argv[2]==='--self-test'){
  assert.equal(verifyReport(sample(27,32,34)).pass,true,'on-time session must pass');
  assert.equal(verifyReport(sample(27,32,36)).pass,false,'late report must fail');
  assert.equal(verifyReport(sample(31,32,34)).pass,false,'late development must fail');
  assert.equal(verifyReport(sample(27,36,37)).pass,false,'late stop must fail');
  assert.equal(verifyReport({...sample(27,32,34),report_sent_at:null}).pass,false,'missing actual report time must fail');
  assert.equal(verifyReport({mode:'scheduled',started_at:'2026-10-11T10:00:00+09:00',
    development_stopped_at:'2026-10-11T10:38:00+09:00',
    work_stopped_at:'2026-10-11T10:42:00+09:00',
    report_sent_at:'2026-10-11T10:44:00+09:00',
    target_minutes:40,hard_stop_minutes:45}).pass,true,'scheduled task separate limit');
  console.log('TIME REPORT ACTUAL-STAMP CONTRACT QA | 6/6 cases PASS');
}else{
  if(!process.argv[2])throw new Error('Usage: node scripts/verify-development-time-report.mjs <real-stamps.json> OR --self-test');
  const record=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const result=verifyReport(record);
  for(const item of result.checks)console.log(`${item.pass?'PASS':'FAIL'} | ${item.label} | ${item.detail}`);
  if(!result.pass)process.exitCode=1;
}
