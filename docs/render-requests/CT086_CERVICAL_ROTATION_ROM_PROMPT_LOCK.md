# CT086 locked generation packet

Stable ID: ct086  
Generation brief version: `2026-10-06-ct086-v1`  
Pilot batch: `PILOT_CERVICAL_01`  
Current state: GENERATION_READY  
Generation priority after ct085: 1

This file is a frozen human-readable packet. The executable source of truth remains `data/physical-exam-realistic-assets-v1.json` + `scripts/build-physical-exam-realistic-prompt.mjs`.

## Critical visual lock
- **High-resolution source is mandatory: portrait minimum 1024×1536 px. Do not use 240×360 / 320×480 / 600×900 as the app Preview source.**
- Patient rotates the head actively left/right while trunk and shoulders stay fixed.
- Do not depict forceful passive end-range rotation.
- Do not print 60° or any numeric cutoff inside the image.
- The 60° historical value is cluster context only, not a universal abnormal threshold.

## Locked prompt

```text
[이윤석정형외과 근육 · Physical Examination 실사형 의료교육 일러스트 정본 프롬프트]
Stable ID: ct086 · 경추 회전 ROM 평가 / Cervical rotation range-of-motion assessment
Pilot batch: PILOT_CERVICAL_01
Generation brief version: 2026-10-06-ct086-v1

목표
- 실제 사람처럼 보이는 고품질 임상교육용 디지털 일러스트를 만든다.
- 사진 합성이나 실제 환자 사진이 아니라 독립적으로 제작된 realistic medical education illustration이어야 한다.
- 패널 구성: 3-panel vertical: 1 중립 좌위 / 2 좌우 능동 회전 비교 / 3 제한·보상 확인
- 모든 패널의 환자와 검사자는 같은 인물, 같은 복장, 같은 임상 배경을 유지한다.
- 모델 배정: 환자 여성형 / 검사자 여성형. 성별은 임상적 의미를 암시하지 않으며 동일 Stable ID의 모든 패널에서 동일 인물을 유지한다.
- 서로 다른 검사에서 같은 인물 이미지를 재사용하지 않는다. Stable ID마다 독립적으로 새 장면을 제작한다.
- 의료진 강의와 환자 설명에 바로 쓸 수 있는 명확하고 차분한 임상교육 스타일을 사용한다.

정확한 검사 명세
- 환자 시작 자세: 환자는 등받이 있는 의자에 앉고 어깨를 이완하며 머리는 중립. 몸통과 어깨가 따라 돌지 않게 한다.
- 검사자 시행: 환자가 스스로 머리를 왼쪽과 오른쪽으로 천천히 회전한다. 검사자는 정면 또는 뒤에서 몸통 회전, 어깨 보상, 턱 들기/숙이기를 관찰한다. 강한 수동 끝범위 회전은 하지 않는다.
- 양성 판단: 한쪽 회전 arc가 반대쪽보다 뚜렷하게 짧거나 익숙한 목/팔 증상이 재현되는 모습을 표현한다. 특정 각도 숫자를 병적 cut-off처럼 표시하지 않는다.
- 임상 해석: Cervical rotation ROM is a nonspecific functional finding. In the historical radiculopathy cluster, symptomatic-side rotation <60° is one component and was independently revalidated in 2026, but it is not a universal standalone abnormal cutoff. Interpret with neurologic exam, Spurling, distraction and ULNT.
- 한계·안전: 급성 외상·불안정성·새로운 신경학적 이상·비전형적 심한 두통/목통증이 있으면 끝범위 검사보다 원인평가를 우선한다.

검사자 표현 필수
- 환자의 관절 위치와 검사자 손 위치를 실제 임상 시행과 일치시킨다.
- 검사자가 실제로 힘을 가하는 손과 환자를 지지하는 손을 구분한다.
- 힘 또는 움직임 방향은 짧은 교육용 화살표로 표시한다.
- 양성소견은 통증/감각증상/움직임 이상이 나타나는 위치를 과장 없이 표시한다.
- Overlay 원칙: 좌우 회전 방향은 작은 arc 화살표로만 표시. 제한 패널은 한쪽 arc가 짧게 보이게 하되 임의 빨간 통증표시와 숫자 cut-off 금지.

안전·의학적 보수성
- 그림이 검사 강도를 과장하지 않게 한다. 강한 압박·견인·신경가동성 도발을 불필요하게 묘사하지 않는다.
- 단일 검사만으로 진단이 확정되는 것처럼 표현하지 않는다.
- red flag가 있는 상황에서 반복 도발을 권하는 표현을 넣지 않는다.

저작권·인물·텍스트 금지사항
- 특정 교과서 도판, 웹 사진, 실제 환자 사진, 유명인 또는 식별 가능한 사람을 복제·트레이싱하지 않는다.
- 기존 Gray/Grant/Thieme 등의 특정 도판 구도와 실질적으로 동일한 표현을 만들지 않는다.
- 워터마크, 병원 로고, 제품 로고, 출처 불명 사진 질감을 넣지 않는다.
- 텍스트 원칙: 이미지 내부는 '1 중립 자세', '2 좌우 회전', '3 제한 / 보상' 정도의 최소 한국어만 사용. 60° 또는 다른 수치 cutoff를 이미지에 넣지 않는다.

출력·후속 검수
- 세로형 clinical teaching poster 비율.
- 최종 생성 원본은 **최소 1024×1536 px**. 앱 Preview도 이 고해상도 후보를 responsive 축소 표시하며 thumbnail 파생본을 주 이미지로 사용하지 않는다.
- 모바일에서도 손 위치와 화살표가 읽혀야 한다.
- 생성 원본은 최종 승인품이 아니다. 새로운 gen_id로 보존하고 인간이 임상내용·자세·손위치·힘방향·텍스트를 교정한 뒤에만 앱 후보가 된다.
- 사용자 Preview 승인 전 기존 EXAM-001 Stable-ID schematic을 교체하지 않는다.
```

## Evidence lock
- 2026 independent CPR validation — PMID 42070317: the original four-test cluster included symptomatic-side cervical rotation <60° and showed diagnostic values comparable to the original study.
- 2026 systematic review/meta-analysis — PMID 41680685: physical-test evidence remains sparse/low-certainty overall, so 60° must remain cluster context rather than a universal standalone abnormal cutoff.

## Candidate registration requirements
- new `gen_id`;
- source dimensions (portrait minimum 1024×1536) + SHA-256 + Git blob SHA-1;
- exact `generation_brief_version = 2026-10-06-ct086-v1`;
- app Preview source must remain high-resolution; thumbnail/cache derivative is optional and must never replace the HD Preview source;
- internal clinical/visual QA;
- user Preview remains PENDING until explicit approval;
- existing EXAM-001 schematic remains fallback before approval.
