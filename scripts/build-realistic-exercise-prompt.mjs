import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {realisticPatientPresentationForStableId} from './realistic-human-model-casting.mjs';

export const MANIFEST_PATH='data/patient-exercise-realistic-assets-v1.json';

function fail(message){throw new Error(message);}

export function buildGenerationPrompt(manifest,profileId){
  const profile=manifest.profiles?.find(x=>x.profile_id===profileId);
  if(!profile)fail('Unknown profile: '+profileId);
  const brief=profile.generation_brief;
  if(!brief)fail(profileId+' has no locked generation_brief.');
  const style=manifest.style_lock;
  if(style?.status!=='USER_APPROVED')fail('User-approved style lock missing.');
  const patientPresentation=realisticPatientPresentationForStableId(profileId);

  const blockers=(profile.approval_blockers||[])
    .map(x=>`- 이전 후보 승인 차단 사유 [${x.code||'UNKNOWN'}]: ${x.note||''}`)
    .join('\n');

  return [
    '[이윤석정형외과 근육 · 환자교육 실사형 운동 일러스트 정본 프롬프트]',
    `프로필: ${profile.profile_id} · ${profile.title_ko}`,
    '',
    '목표',
    '- 실제 성인 환자를 닮은 고품질 의료·재활 교육용 디지털 일러스트를 만든다.',
    '- 한 장의 세로형 composite 안에 1 · 시작 / 2 · 끝 두 패널을 배치한다.',
    '- 두 패널은 같은 사람, 같은 복장, 같은 카메라 시점과 배경을 유지한다.',
    patientPresentation?'- 모델 배정: 환자 '+patientPresentation+'. 성별 표현은 운동의 임상적 의미를 암시하지 않으며 Stable ID 균형 규칙에 따른다.':'- 성별 표현은 임상적 의미를 암시하지 않도록 중립적으로 선택한다.',
    '- 서로 다른 운동에서 같은 인물 이미지를 재사용하지 않는다. Stable ID마다 독립 장면을 제작한다.',
    '- 흰색 임상교육 배경, 모바일 가독성, A4 인쇄 확장성을 우선한다.',
    '- 실제 환자·유명인·식별 가능한 인물을 닮게 만들지 않는다.',
    '',
    '정확한 동작 명세',
    `- 시점: ${brief.view}`,
    `- 시작 자세: ${brief.start}`,
    `- 끝 자세: ${brief.end}`,
    `- 움직임 표시: ${brief.motion}`,
    `- 지지·고정: ${brief.support}`,
    `- 흔한 오류: ${brief.common_error}`,
    '',
    '화면 안 표시',
    '- 한국어로 “1 · 시작”, “2 · 끝”을 명확히 표시한다.',
    '- 필요한 최소한의 움직임 화살표, 지지/고정 표시, 흔한 오류 표시만 넣는다.',
    '- 해부학적 방향과 관절 정렬을 왜곡하지 않는다.',
    '',
    '금지',
    `- ${brief.text_policy}`,
    '- 막대인간, 추상 기하학 인체, 캐릭터풍, 판타지풍 금지.',
    '- 워터마크, 브랜드 로고, 인터넷 사진 재사용, 출처 불명 사진 금지.',
    '- 운동 목적과 다른 동작으로 단순화하거나 임의의 단계를 추가하지 않는다.',
    blockers||'- 현재 별도 approval blocker 없음.',
    '',
    '출력 목표',
    '- 세로형 의료교육 포스터 비율.',
    '- 환자가 그림만 보고 시작 자세, 끝 자세, 움직임 방향, 지지점, 피할 보상을 구분할 수 있어야 한다.',
    '- 설명 문장은 짧고 임상적으로 보수적으로 유지한다.'
  ].join('\n');
}

export function loadPrompt(profileId,manifestPath=MANIFEST_PATH){
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  return buildGenerationPrompt(manifest,profileId);
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const profileId=process.argv[2];
  try{
    if(!profileId)fail('Usage: node scripts/build-realistic-exercise-prompt.mjs pxNNN');
    console.log(loadPrompt(profileId));
  }catch(error){
    console.error('PROMPT BUILD FAIL | '+error.message);
    process.exit(1);
  }
}
