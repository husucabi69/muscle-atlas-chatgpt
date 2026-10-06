import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {realisticModelCastingForStableId} from './realistic-human-model-casting.mjs';

export const REGISTRY_PATH='data/physical-exam-realistic-assets-v1.json';

function fail(message){throw new Error(message);}

export function modelCastingForClinicalTestId(clinicalTestId){
  return realisticModelCastingForStableId(clinicalTestId);
}

export function blockingPhysicalExamBinaryHandoff(manifest){
  const ids=manifest.pilot?.clinical_test_ids||[];
  for(const id of ids){
    const p=manifest.profiles?.find(x=>x.clinical_test_id===id);
    if(p?.binary_handoff?.state==='BLOCKED'&&p?.binary_handoff?.blocks_generation_queue===true)return p;
  }
  return null;
}

export function nextPilotProfile(manifest){
  if(blockingPhysicalExamBinaryHandoff(manifest))return null;
  const ids=manifest.pilot?.clinical_test_ids||[];
  for(const id of ids){
    const p=manifest.profiles?.find(x=>x.clinical_test_id===id);
    if(p?.status==='PENDING_GENERATION'&&p?.brief_status==='GENERATION_READY'&&p?.pilot_batch===manifest.pilot?.batch_id)return p;
  }
  return null;
}

export function buildPhysicalExamPrompt(manifest,clinicalTestId){
  if(manifest.status!=='EXAM_REAL_001_IN_PROGRESS')fail('EXAM-REAL-001 registry is not active.');
  const profile=manifest.profiles?.find(x=>x.clinical_test_id===clinicalTestId);
  if(!profile)fail('Unknown clinical test: '+clinicalTestId);
  const pilotIds=manifest.pilot?.clinical_test_ids||[];
  if(!pilotIds.includes(clinicalTestId))fail(clinicalTestId+' is not in the active realistic Physical Examination pilot.');
  if(profile.pilot_batch!==manifest.pilot?.batch_id)fail(clinicalTestId+' pilot batch mismatch.');
  if(profile.status!=='PENDING_GENERATION'||profile.brief_status!=='GENERATION_READY')fail(clinicalTestId+' is not generation-ready.');
  const b=profile.generation_brief;
  if(!b)fail(clinicalTestId+' has no locked generation brief.');
  const casting=modelCastingForClinicalTestId(clinicalTestId);
  const numericId=Number(String(clinicalTestId).match(/(\d+)$/)?.[1]||0);
  const castingLine=numericId>=84&&casting
    ? `- 모델 배정: 환자 ${casting.patient} / 검사자 ${casting.examiner}. 성별은 임상적 의미를 암시하지 않으며 동일 Stable ID의 모든 패널에서 동일 인물을 유지한다.`
    : '- 기존 ct082/ct083 자산은 캐스팅 규칙 grandfathered 대상이다. 재생성 필요가 생기면 별도 human review로 캐스팅을 확정한다.';

  return [
    '[이윤석정형외과 근육 · Physical Examination 실사형 의료교육 일러스트 정본 프롬프트]',
    `Stable ID: ${profile.clinical_test_id} · ${profile.title_ko} / ${profile.title_en}`,
    `Pilot batch: ${profile.pilot_batch}`,
    `Generation brief version: ${profile.generation_brief_version||'UNVERSIONED'}`,
    '',
    '목표',
    '- 실제 사람처럼 보이는 고품질 임상교육용 디지털 일러스트를 만든다.',
    '- 사진 합성이나 실제 환자 사진이 아니라 독립적으로 제작된 realistic medical education illustration이어야 한다.',
    `- 패널 구성: ${b.panel_structure||'세로형 3-panel: 1 시작 자세 / 2 검사 시행 / 3 양성 판단'}`,
    '- 모든 패널의 환자와 검사자는 같은 인물, 같은 복장, 같은 임상 배경을 유지한다.',
    castingLine,
    '- 서로 다른 검사에서 같은 인물 이미지를 재사용하지 않는다. Stable ID마다 독립적으로 새 장면을 제작한다.',
    '- 의료진 강의와 환자 설명에 바로 쓸 수 있는 명확하고 차분한 임상교육 스타일을 사용한다.',
    '',
    '정확한 검사 명세',
    `- 환자 시작 자세: ${b.patient_setup}`,
    `- 검사자 시행: ${b.examiner_maneuver}`,
    `- 양성 판단: ${b.positive_finding}`,
    `- 임상 해석: ${b.interpretation}`,
    `- 한계·안전: ${b.limitation_safety}`,
    '',
    '검사자 표현 필수',
    '- 환자의 관절 위치와 검사자 손 위치를 실제 임상 시행과 일치시킨다.',
    '- 검사자가 실제로 힘을 가하는 손과 환자를 지지하는 손을 구분한다.',
    '- 힘 또는 움직임 방향은 짧은 교육용 화살표로 표시한다.',
    '- 양성소견은 통증/감각증상/움직임 이상이 나타나는 위치를 과장 없이 표시한다.',
    `- Overlay 원칙: ${b.overlay_policy}`,
    '',
    '안전·의학적 보수성',
    '- 그림이 검사 강도를 과장하지 않게 한다. 강한 압박·견인·신경가동성 도발을 불필요하게 묘사하지 않는다.',
    '- 단일 검사만으로 진단이 확정되는 것처럼 표현하지 않는다.',
    '- red flag가 있는 상황에서 반복 도발을 권하는 표현을 넣지 않는다.',
    '',
    '저작권·인물·텍스트 금지사항',
    '- 특정 교과서 도판, 웹 사진, 실제 환자 사진, 유명인 또는 식별 가능한 사람을 복제·트레이싱하지 않는다.',
    '- 기존 Gray/Grant/Thieme 등의 특정 도판 구도와 실질적으로 동일한 표현을 만들지 않는다.',
    '- 워터마크, 병원 로고, 제품 로고, 출처 불명 사진 질감을 넣지 않는다.',
    `- 텍스트 원칙: ${b.text_policy}`,
    '',
    '출력·후속 검수',
    '- 세로형 clinical teaching poster 비율.',
    '- 최종 생성 원본 해상도: 세로형 최소 1024×1536 px. 600×900 이하 축소본을 canonical 후보로 사용하지 않는다.',
    '- 모바일에서도 손 위치와 화살표가 읽혀야 한다.',
    '- 생성 원본은 최종 승인품이 아니다. 새로운 gen_id로 보존하고 인간이 임상내용·자세·손위치·힘방향·텍스트를 교정한 뒤에만 앱 후보가 된다.',
    '- 사용자 Preview 승인 전 기존 EXAM-001 Stable-ID schematic을 교체하지 않는다.'
  ].join('\n');
}


export function buildPhysicalExamImageOnlyPrompt(manifest,clinicalTestId){
  if(manifest.status!=='EXAM_REAL_001_IN_PROGRESS')fail('EXAM-REAL-001 registry is not active.');
  const profile=manifest.profiles?.find(x=>x.clinical_test_id===clinicalTestId);
  if(!profile)fail('Unknown clinical test: '+clinicalTestId);
  const pilotIds=manifest.pilot?.clinical_test_ids||[];
  if(!pilotIds.includes(clinicalTestId))fail(clinicalTestId+' is not in the active realistic Physical Examination pilot.');
  if(profile.pilot_batch!==manifest.pilot?.batch_id)fail(clinicalTestId+' pilot batch mismatch.');
  if(profile.status!=='PENDING_GENERATION'||profile.brief_status!=='GENERATION_READY')fail(clinicalTestId+' is not generation-ready.');
  const b=profile.generation_brief;
  if(!b)fail(clinicalTestId+' has no locked generation brief.');
  const casting=modelCastingForClinicalTestId(clinicalTestId);
  if(!casting)fail(clinicalTestId+' has no model casting.');

  const rc=b.image_render_contract||null;
  if(rc){
    const headers=(rc.allowed_text_exact||[]).map(x=>JSON.stringify(x)).join(' / ');
    const panelLines=(rc.panels||[]).flatMap(panel=>[
      `PANEL ${panel.panel} — ${panel.header}`,
      `- patient: ${panel.patient_pose}`,
      `- examiner: ${panel.examiner_pose}`,
      `- arrows: ${panel.arrows}`
    ]);
    return [
      '[IMAGE-ONLY RENDER CONTRACT — CLINICAL ILLUSTRATION PLATE]',
      `Stable ID: ${profile.clinical_test_id}`,
      `Render contract: ${rc.contract_version}`,
      '',
      'OUTPUT',
      `- portrait, minimum ${rc.output?.min_width_px||1024}×${rc.output?.min_height_px||1536} px`,
      '- realistic medical-education illustration, clean neutral clinic background',
      '- use the entire canvas for the clinical scenes; this is NOT an infographic',
      '',
      'LOCKED CASTING',
      `- patient: ${rc.casting?.patient||casting.patient}`,
      `- examiner: ${rc.casting?.examiner||casting.examiner}`,
      '- same patient identity, face, hair and clothing across every panel',
      '- same examiner identity, face, hair and clothing across every panel',
      '- examiner must be visibly present in EVERY panel',
      '',
      'PANELS',
      ...panelLines,
      '',
      'TEXT — ABSOLUTE LIMIT',
      `- allowed visible text only: ${headers}`,
      '- no other visible text of any kind',
      '- no numbers except the panel numbers already contained in the three allowed headers',
      '- no degree symbol, no angle value, no cutoff, no diagnosis, no English title',
      '',
      'FORBIDDEN',
      ...(rc.forbidden_visuals||[]).map(x=>'- '+x),
      ...(rc.forbidden_text_patterns||[]).map(x=>'- visible text/pattern forbidden: '+x),
      '',
      'FINAL SELF-CHECK BEFORE RETURNING',
      ...(rc.acceptance_axes||[]).map(x=>'- must pass: '+x),
      '',
      '- Return exactly one high-resolution illustration plate for internal review.',
      '- Do not add educational explanations; those are rendered separately in app HTML.'
    ].join('\n');
  }

  return [
    '[IMAGE-ONLY RENDER PAYLOAD — DO NOT TURN INTO AN INFOGRAPHIC]',
    `Stable ID: ${profile.clinical_test_id} · ${profile.title_ko}`,
    `Generation brief version: ${profile.generation_brief_version||'UNVERSIONED'}`,
    '',
    'HARD COMPOSITION RULES',
    '- Create ONLY the clinical illustration scenes. No educational page, no infographic layout, no lower text cards, no bullet lists, no references, no diagnosis list, no English title.',
    `- Use exactly this panel structure: ${b.panel_structure}`,
    `- Locked models: patient ${casting.patient}; examiner ${casting.examiner}. The same patient and same examiner must remain across all panels.`,
    '- The examiner must be visibly present as an observer in every panel unless the maneuver itself makes that anatomically impossible.',
    '- Use a clean neutral clinic background and realistic medical-education illustration style.',
    '',
    'VISUAL MANEUVER ONLY',
    `- Patient setup: ${b.patient_setup}`,
    `- Motion/observation: ${b.examiner_maneuver}`,
    `- Finding to depict: ${b.positive_finding}`,
    `- Overlay: ${b.overlay_policy}`,
    '',
    'TEXT HARD LIMIT',
    `- ${b.text_policy}`,
    '- Do not print any other words, paragraphs, labels, numbers, degree symbols, references, diagnoses, safety notes, or explanatory copy inside the image.',
    '- All detailed clinical interpretation belongs in app HTML outside the image and must NOT be rendered into the artwork.',
    '',
    'OUTPUT',
    '- Portrait 1024×1536 minimum.',
    '- Full canvas is devoted to the clinical scenes.',
    '- No passive force if the locked maneuver is active ROM.',
    '- Return one high-resolution candidate for internal human review; it is not approved merely by generation.'
  ].join('\n');
}
export function loadRegistry(path=REGISTRY_PATH){
  return JSON.parse(fs.readFileSync(path,'utf8'));
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  try{
    const manifest=loadRegistry();
    const arg=process.argv[2]||'--next';
    const imageOnly=arg==='--image-only';
    const requested=imageOnly?(process.argv[3]||'--next'):arg;
    const profile=requested==='--next'?nextPilotProfile(manifest):manifest.profiles?.find(x=>x.clinical_test_id===requested);
    if(!profile)fail('No generation-ready Physical Examination pilot profile.');
    console.log(imageOnly
      ?buildPhysicalExamImageOnlyPrompt(manifest,profile.clinical_test_id)
      :buildPhysicalExamPrompt(manifest,profile.clinical_test_id));
  }catch(error){
    console.error('PHYSICAL EXAM PROMPT BUILD FAIL | '+error.message);
    process.exit(1);
  }
}
