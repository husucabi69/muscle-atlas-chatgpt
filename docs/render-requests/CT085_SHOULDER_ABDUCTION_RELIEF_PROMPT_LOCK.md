# CT085 locked generation packet

Stable ID: ct085  
Generation brief version: `2026-10-06-ct085-v1`  
Pilot batch: `PILOT_CERVICAL_01`  
Current state: CANDIDATE_READY_USER_PREVIEW  
Next-generation priority: LOCKED — CANDIDATE EXISTS, DO NOT REGENERATE

This file preserves the frozen generation brief. Candidate 1 has already been generated and connected to Preview; do **not** use this packet to regenerate while user review is pending. The executable source of truth remains `data/physical-exam-realistic-assets-v1.json` + `scripts/build-physical-exam-realistic-prompt.mjs`.

## Candidate 1 receipt
- gen_id: `6582ec89-607d-4ce7-bd9a-f7358f9683ff`
- source PNG SHA-256: `0990827c298c5c7471a74e0159700ba820059ad9c953b6855efcae2a4d871a1e`
- local 600x900 WebP SHA-256: `05a46466fdc930d2f70d44e1db8ab4bd6e18130296e9a91b2193cbd65fd71cce`
- internal clinical/visual review: PASS
- user Preview: PENDING
- repository binary handoff: MATERIALIZED / PREVIEW CONNECTED

## Critical distinction

- Draw the **classic shoulder abduction relief sign**.
- The patient actively places the symptomatic hand/forearm overhead.
- The familiar radicular arm symptom decreases.
- **Do not** draw the examiner passively elevating the arm.
- **Do not** substitute the 2026 modified passive shoulder abduction test.

## Locked prompt

```text
[이윤석정형외과 근육 · Physical Examination 실사형 의료교육 일러스트 정본 프롬프트]
Stable ID: ct085 · 어깨 외전 완화 검사 / Shoulder abduction relief test
Pilot batch: PILOT_CERVICAL_01
Generation brief version: 2026-10-06-ct085-v1

목표
- 실제 사람처럼 보이는 고품질 임상교육용 디지털 일러스트를 만든다.
- 사진 합성이나 실제 환자 사진이 아니라 독립적으로 제작된 realistic medical education illustration이어야 한다.
- 패널 구성: 3-panel vertical: 1 시작 자세 / 2 손을 머리 위에 / 3 익숙한 팔 증상 감소
- 모든 패널의 환자와 검사자는 같은 인물, 같은 복장, 같은 임상 배경을 유지한다.
- 모델 배정: 환자 남성형 / 검사자 여성형. 성별은 임상적 의미를 암시하지 않으며 동일 Stable ID의 모든 패널에서 동일 인물을 유지한다.
- 서로 다른 검사에서 같은 인물 이미지를 재사용하지 않는다. Stable ID마다 독립적으로 새 장면을 제작한다.
- 의료진 강의와 환자 설명에 바로 쓸 수 있는 명확하고 차분한 임상교육 스타일을 사용한다.

정확한 검사 명세
- 환자 시작 자세: 환자는 좌위 또는 선 자세에서 증상측 팔을 자연스럽게 내리고 시작한다. 검사 전 같은 팔의 익숙한 방사통·저림을 확인한다.
- 검사자 시행: 환자가 스스로 증상측 어깨를 외전해 손 또는 전완을 머리 위에 편안히 올린다. 검사자는 옆에서 관찰하고 필요하면 팔꿈치를 가볍게 지지하지만 끝범위까지 억지로 들어 올리지 않는다.
- 양성 판단: 같은 증상측 팔의 기존 방사통·저림 overlay가 머리 위 자세에서 명확히 약해지거나 짧아지는 변화를 보여준다. 어깨 국소통증 완화만을 양성으로 표현하지 않는다.
- 임상 해석: Shoulder abduction relief sign은 cervical radiculopathy를 지지하는 보조 소견이며 단독 확진·배제 또는 root-level 결정용이 아니다.
- 한계·안전: 급성 외상, 진행성 신경학적 결손, myelopathy red flag가 있는 환자에서 일반적인 단순 provocation/relief illustration로 과장하지 않는다. 2026 validation study의 modified passive shoulder abduction test와 혼동하지 말고, 본 Stable ID에서는 환자가 스스로 손/전완을 머리 위에 올렸을 때 익숙한 radicular arm symptom이 완화되는 고전적 shoulder abduction relief sign을 그린다.

검사자 표현 필수
- 환자의 관절 위치와 검사자 손 위치를 실제 임상 시행과 일치시킨다.
- 검사자가 실제로 힘을 가하는 손과 환자를 지지하는 손을 구분한다.
- 힘 또는 움직임 방향은 짧은 교육용 화살표로 표시한다.
- 양성소견은 통증/감각증상/움직임 이상이 나타나는 위치를 과장 없이 표시한다.
- Overlay 원칙: 1번 패널에는 증상측 팔의 익숙한 방사통/저림을 제한적으로 표시하고 3번에서는 같은 overlay가 약해지는 변화만 표현. 임의 통증 숫자·각도·root label 금지. 검사자가 팔을 수동으로 들어 올리는 modified passive variant로 보이게 만들지 않는다.

안전·의학적 보수성
- 그림이 검사 강도를 과장하지 않게 한다. 강한 압박·견인·신경가동성 도발을 불필요하게 묘사하지 않는다.
- 단일 검사만으로 진단이 확정되는 것처럼 표현하지 않는다.
- red flag가 있는 상황에서 반복 도발을 권하는 표현을 넣지 않는다.

저작권·인물·텍스트 금지사항
- 특정 교과서 도판, 웹 사진, 실제 환자 사진, 유명인 또는 식별 가능한 사람을 복제·트레이싱하지 않는다.
- 기존 Gray/Grant/Thieme 등의 특정 도판 구도와 실질적으로 동일한 표현을 만들지 않는다.
- 워터마크, 병원 로고, 제품 로고, 출처 불명 사진 질감을 넣지 않는다.
- 텍스트 원칙: 이미지 내부는 '1 시작 자세', '2 손을 머리 위에', '3 팔 증상 감소' 정도의 최소 한국어만 사용.

출력·후속 검수
- 세로형 clinical teaching poster 비율.
- 모바일에서도 손 위치와 화살표가 읽혀야 한다.
- 생성 원본은 최종 승인품이 아니다. 새로운 gen_id로 보존하고 인간이 임상내용·자세·손위치·힘방향·텍스트를 교정한 뒤에만 앱 후보가 된다.
- 사용자 Preview 승인 전 기존 EXAM-001 Stable-ID schematic을 교체하지 않는다.
```

## Evidence lock
- 2026 systematic review/meta-analysis — PMID 41680685: shoulder abduction relief test pooled sensitivity 0.49 and specificity 0.76; evidence certainty very low.
- 2026 independent CPR validation — PMID 42070317: original 2003 four-test cluster was revalidated; a separate new cluster used a modified passive shoulder abduction test, which must not be substituted for ct085's classic active hand-overhead relief sign.

## Candidate registration requirements

When a fresh candidate is generated:
- record new `gen_id`;
- record source dimensions and SHA-256;
- record `generation_brief_version = 2026-10-06-ct085-v1`;
- create a mobile Preview derivative;
- run clinical/visual QA;
- keep `review.user_preview=PENDING` until explicit user approval;
- do not replace the EXAM-001 schematic before approval.
