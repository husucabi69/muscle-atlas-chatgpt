# CT087 locked generation packet

Stable ID: ct087  
Generation brief version: `2026-10-06-ct087-v1`  
Pilot batch: `PILOT_CERVICAL_01`  
Current state: GENERATION_READY  
Generation priority after ct085: 2

This file is a frozen human-readable packet. The executable source of truth remains `data/physical-exam-realistic-assets-v1.json` + `scripts/build-physical-exam-realistic-prompt.mjs`.

## Critical visual lock
- **High-resolution source is mandatory: portrait minimum 1024×1536 px. Do not use 240×360 / 320×480 / 600×900 as the app Preview source.**
- Keep the four domains visually distinct: motor / sensory / reflex / segment pattern.
- Use plausible resistance hand placement and reflex-hammer position.
- Do not draw a huge exact-looking dermatome map or imply one-to-one root mapping.
- Make motor, sensory and reflex findings converge as a pattern rather than one finding proving a root level.

## Locked prompt

```text
[이윤석정형외과 근육 · Physical Examination 실사형 의료교육 일러스트 정본 프롬프트]
Stable ID: ct087 · C5–T1 신경학적 선별 / C5–T1 motor-sensory-reflex screen
Pilot batch: PILOT_CERVICAL_01
Generation brief version: 2026-10-06-ct087-v1

목표
- 실제 사람처럼 보이는 고품질 임상교육용 디지털 일러스트를 만든다.
- 사진 합성이나 실제 환자 사진이 아니라 독립적으로 제작된 realistic medical education illustration이어야 한다.
- 패널 구성: 4-panel vertical or 2×2: 1 motor / 2 sensory / 3 reflex / 4 pattern interpretation
- 모든 패널의 환자와 검사자는 같은 인물, 같은 복장, 같은 임상 배경을 유지한다.
- 모델 배정: 환자 남성형 / 검사자 남성형. 성별은 임상적 의미를 암시하지 않으며 동일 Stable ID의 모든 패널에서 동일 인물을 유지한다.
- 서로 다른 검사에서 같은 인물 이미지를 재사용하지 않는다. Stable ID마다 독립적으로 새 장면을 제작한다.
- 의료진 강의와 환자 설명에 바로 쓸 수 있는 명확하고 차분한 임상교육 스타일을 사용한다.

정확한 검사 명세
- 환자 시작 자세: 환자는 편안히 앉고 양측 상지를 노출하며 어깨를 이완한다.
- 검사자 시행: motor panel은 대표 C5–T1 task 중 2~3개를 명확히 보여주되 손 위치가 해부학적으로 정확해야 한다. sensory panel은 대표 dermatome 영역을 좌우 비교하는 가벼운 촉각검사. reflex panel은 biceps/brachioradialis/triceps 중 하나 이상을 정확한 자세로 표현한다. 마지막 패널은 한 root에 motor-sensory-reflex가 모이는 개념을 보여준다.
- 양성 판단: 분절성 근력저하·감각저하·반사 감소가 같은 root 분포에서 일관되게 나타나는 개념을 표현한다. 하나의 점만 빨갛게 표시해 특정 root를 확정하는 그림은 금지한다.
- 임상 해석: C5–T1 neurologic screen supports root-level clinical localization and differentiation from peripheral nerve/plexus or cord disease. Myotomes and dermatomes overlap; no single finding is definitive.
- 한계·안전: 통증 억제성 약화와 진짜 신경학적 약화를 구분해야 하며, UMN signs/보행장애가 있으면 radiculopathy만으로 설명하지 않는다.

검사자 표현 필수
- 환자의 관절 위치와 검사자 손 위치를 실제 임상 시행과 일치시킨다.
- 검사자가 실제로 힘을 가하는 손과 환자를 지지하는 손을 구분한다.
- 힘 또는 움직임 방향은 짧은 교육용 화살표로 표시한다.
- 양성소견은 통증/감각증상/움직임 이상이 나타나는 위치를 과장 없이 표시한다.
- Overlay 원칙: 대표 root 표시는 교육용 작은 라벨로만 사용하고 과도한 dermatome 색칠·질환 확정 아이콘 금지. 좌우 비교가 명확해야 한다.

안전·의학적 보수성
- 그림이 검사 강도를 과장하지 않게 한다. 강한 압박·견인·신경가동성 도발을 불필요하게 묘사하지 않는다.
- 단일 검사만으로 진단이 확정되는 것처럼 표현하지 않는다.
- red flag가 있는 상황에서 반복 도발을 권하는 표현을 넣지 않는다.

저작권·인물·텍스트 금지사항
- 특정 교과서 도판, 웹 사진, 실제 환자 사진, 유명인 또는 식별 가능한 사람을 복제·트레이싱하지 않는다.
- 기존 Gray/Grant/Thieme 등의 특정 도판 구도와 실질적으로 동일한 표현을 만들지 않는다.
- 워터마크, 병원 로고, 제품 로고, 출처 불명 사진 질감을 넣지 않는다.
- 텍스트 원칙: 이미지 내부는 '1 근력', '2 감각', '3 반사', '4 분절 패턴' 정도의 최소 한국어만 사용. 장문 설명은 앱 HTML에 둔다.

출력·후속 검수
- 세로형 clinical teaching poster 비율.
- 최종 생성 원본은 **최소 1024×1536 px**. 앱 Preview도 고해상도 후보를 responsive 축소 표시하며 thumbnail 파생본을 주 이미지로 사용하지 않는다.
- 모바일에서도 손 위치와 화살표가 읽혀야 한다.
- 생성 원본은 최종 승인품이 아니다. 새로운 gen_id로 보존하고 인간이 임상내용·자세·손위치·힘방향·텍스트를 교정한 뒤에만 앱 후보가 된다.
- 사용자 Preview 승인 전 기존 EXAM-001 Stable-ID schematic을 교체하지 않는다.
```

## Evidence lock
- 2026 cervical radiculopathy physical-test systematic review — PMID 41680685: individual physical-test evidence is limited; neurologic findings must be integrated with history and other tests.
- DCM sign evidence locks remain linked through `dcm_signs_2024` and `dcm_scoping_2025` so multi-level/UMN patterns are not mislabeled as isolated radiculopathy.

## Candidate registration requirements
- new `gen_id`;
- source dimensions (portrait minimum 1024×1536) + SHA-256 + Git blob SHA-1;
- exact `generation_brief_version = 2026-10-06-ct087-v1`;
- app Preview source must remain high-resolution; thumbnail/cache derivative is optional and must never replace the HD Preview source;
- internal clinical/visual QA;
- user Preview remains PENDING until explicit approval;
- existing EXAM-001 schematic remains fallback before approval.
