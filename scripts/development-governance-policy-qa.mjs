import fs from 'node:fs';

const read = p => fs.readFileSync(p, 'utf8');
const files = {
  agents: read('AGENTS.md'),
  constitution: read('docs/DEVELOPMENT_CONSTITUTION.md'),
  principles: read('docs/DEVELOPMENT_PRINCIPLES.md'),
  masterRoadmap: read('docs/MASTER_ROADMAP.md'),
  handoff: read('docs/HANDOFF_CURRENT.md'),
  previewPolicy: read('docs/PREVIEW_DEVELOPMENT_POLICY.md'),
};

const checks = [];
const check = (name, pass, detail='') => {
  checks.push({name, pass:Boolean(pass), detail});
  console.log(`${pass ? 'PASS' : 'FAIL'} | ${name}${detail ? ` | ${detail}` : ''}`);
};

for (const name of ['agents','constitution','principles','masterRoadmap','handoff','previewPolicy']) {
  const text = files[name];
  check(`${name}: 25~30 minute development rule`, text.includes('25~30분') || text.includes('25~30 minutes'));
  check(`${name}: 30~35 minute wrap-up rule`, text.includes('30~35분') || text.includes('30~35 minutes'));
  check(`${name}: 35 minute HARD STOP rule`, (text.includes('35분') || text.includes('35 minutes')) && text.includes('HARD STOP'));
}

const timingFields = ['작업 시작시간','작업 종료시간','보고시간','총 실제 작업시간','작업시간 규칙 준수 여부'];
for (const field of timingFields) {
  check(`AGENTS requires ${field}`, files.agents.includes(field));
  check(`Constitution requires ${field}`, files.constitution.includes(field));
  check(`Principles requires ${field}`, files.principles.includes(field));
}

const orderedFields = ['작업 시작시간','작업 종료시간','보고시간','총 실제 작업시간','작업시간 규칙 준수 여부'];
const inOrder = text => {
  let last = -1;
  for (const field of orderedFields) {
    const idx = text.indexOf(field, last + 1);
    if (idx < 0 || idx <= last) return false;
    last = idx;
  }
  return true;
};
check('AGENTS timing fields are documented in required order', inOrder(files.agents));
check('Constitution timing fields are documented in required order', inOrder(files.constitution));
check('Principles timing fields are documented in required order', inOrder(files.principles));
check('AGENTS preserves explicit user-stop override', files.agents.includes('USER_STOP_OVERRIDE'));
check('Constitution preserves explicit user-stop override', files.constitution.includes('USER_STOP_OVERRIDE'));
check('Principles preserves explicit user-stop override', files.principles.includes('USER_STOP_OVERRIDE'));
check('AGENTS locks explicit approval semantics', files.agents.includes('`승인`, `승인함`, `모두 승인`'));
check('Constitution locks approval semantics section', files.constitution.includes('## 6B. 사용자 승인 해석 규칙'));
check('Principles locks approval handling section', files.principles.includes('## 12. 사용자 승인 처리'));
check('AGENTS forbids treating next-work command as approval', files.agents.includes('`다음 작업 진행`, `진행해`만으로는 승인으로 추정하지 않는다.'));

check('AGENTS locks two-heading report format', files.agents.includes('큰 제목은 **① 뭘 했나 ② 앞으로 뭘 할 건가** 두 개만'));
check('Constitution locks two-heading report format', files.constitution.includes('**딱 2개만**'));
check('Principles locks two-heading report format', files.principles.includes('**① 뭘 했나 / ② 앞으로 뭘 할 건가** 두 개만'));

check('Constitution no longer declares 20-minute manual target', !files.constitution.includes('기본 목표 시간: **20분**'));
check('Constitution no longer declares 25-minute manual HARD STOP', !files.constitution.includes('**25분이 되면 HARD STOP**'));
check('AGENTS no longer declares 30-minute manual HARD STOP', !files.agents.includes('30분 HARD STOP'));
check('Master roadmap no longer declares 20-minute manual HARD STOP', !files.masterRoadmap.includes('**20분 HARD STOP**'));
check('Handoff records latest governance lock', files.handoff.includes('development governance timing/reporting lock'));
check('Handoff records ct098 approval clarification', files.handoff.includes('ct098 approval clarification'));

const failed = checks.filter(x => !x.pass);
console.log(`SUMMARY | ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
