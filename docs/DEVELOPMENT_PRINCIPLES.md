# DEVELOPMENT PRINCIPLES

시행일: 2026-09-24
최종 개정: 2026-10-05 — 수동 개발 25~30분 / 30~35분 마무리 / 35분 HARD STOP 및 실측 보고

## 공식 제품 방향
Muscle Atlas는 독립 앱으로 계속 발전시키되 장기적으로 LYS OrthoOS의 **MSK Knowledge Layer**가 될 수 있도록 설계한다. 현재 repository와 실행 구조는 OrthoOS와 합치지 않는다.

## 1. UI / Knowledge Data 분리
- 화면 코드와 일반 MSK 지식 데이터를 가능한 한 분리한다.
- 새 데이터는 reusable versioned dataset을 우선한다.
- 기존 embedded 데이터는 단계적으로 migration하며 즉시 전면 재작성하지 않는다.

## 2. Stable ID
다음 ID 체계를 확장 가능하게 유지한다:
region_id, structure_id, muscle_id, tendon_id, nerve_id, joint_id, bursa_id, ligament_id, symptom_id, finding_id, clinical_test_id, diagnosis_concept_id, ultrasound_view_id, exercise_id, content_asset_id.

- 표시명 수정 시 ID를 변경하지 않는다.
- ID 재사용을 금지한다.
- deprecated entity는 가능하면 ID를 보존한다.
- 기존 m001~m183 및 sx01~sx20을 stable ID로 보존한다.

## 3. Ownership Boundary
Muscle Atlas/MSK Knowledge Layer는 일반 의학 지식을 소유한다.
LYS OrthoOS는 Patient, Encounter, Problem, Clinical Note, 실제 Diagnosis, Order, Result, Treatment/PT, Billing/Claim의 canonical owner다.

## 4. PHI 금지
Muscle Atlas 저장소와 knowledge dataset에 실제 환자 성명, 환자번호, encounter, 환자별 진찰소견/진단/오더/영상/음성/전사 등 PHI를 저장하지 않는다.

## 5. Domain Separation
Anatomy/Structure, Clinical Finding, Examination, Ultrasound, Exercise/Rehabilitation, Education/Quiz, Media를 점진적으로 별도 versioned data domain으로 분리한다.

## 6. Integration Boundary
Muscle Atlas / MSK Knowledge Core
→ Versioned Integration Contract
→ OrthoOS Clinical Integration Layer
→ OrthoOS Patient/Encounter/Problem/Diagnosis/Order/Result

서로의 내부 DB에 직접 쓰지 않는다.

## 7. 임상 안전
- Atlas 지식 후보와 환자의 확정 진단을 구분한다.
- AI가 미시행 검사를 생성하거나 좌우를 추정하거나 진단을 자동 확정하지 않는다.
- 진료 template 전달은 초안이며 실제 차트 반영은 OrthoOS에서 의사가 확인·확정한다.

## 8. 콘텐츠/영상
- 실제 초음파만 사용하고 불확실한 영상을 임의 대체하지 않는다.
- 공개 라이선스/적법 자산의 출처와 라이선스를 보존한다.
- 상업용 저작권 아틀라스 이미지를 복제하지 않는다.

## 9. 배포
- 정본 소스는 GitHub main.
- GitHub Pages 자동 배포.
- meaningful release마다 service-worker cache version을 올린다.
- 기존 설치 PWA가 같은 URL에서 업데이트되도록 유지한다.

## 10. 현재 최우선
MSK Knowledge Schema v1을 안정화하고 기존 기능을 깨뜨리지 않으면서 외부 Knowledge Core 우선 구조로 전환한다.

## 11. 작업시간·보고 원칙
- 수동 개발은 **실제 개발 25~30분**을 기본으로 한다.
- 25분 전에 첫 작업이 끝나면 같은 개발선의 독립 가능한 다음 작업·QA·회귀검사·정본화를 이어서 수행해 최소 25분을 확보한다.
- **30분부터 새 기능·새 구조수정·새 asset 생성을 시작하지 않는다.**
- **30~35분은 저장·검증·HANDOFF·최종보고 마무리 구간**으로 사용한다.
- **35분 HARD STOP**은 절대선이다. CI/Cloudflare가 진행 중이어도 기다리기 위해 넘기지 않는다.
- 사용자가 명시적으로 중지·중단을 지시하면 최소 25분보다 사용자 중지 지시가 우선하며, 즉시 안전 정지 후 `USER_STOP_OVERRIDE`로 보고한다.
- 최종보고 말미에는 반드시 **작업 시작시간 / 작업 종료시간 / 보고시간 / 총 실제 작업시간 / 작업시간 규칙 준수 여부**를 실제 계측값으로 적는다.
- 시간 준수 여부는 `실제 개발 25~30분`, `30~35분 마무리`, `35분 HARD STOP`을 각각 PASS/FAIL로 확인한다.
- 사용자 보고의 큰 제목은 최신 규칙에 따라 **① 뭘 했나 / ② 앞으로 뭘 할 건가** 두 개만 사용한다.
- 작업 결과의 PASS / FAIL / BLOCKED는 ① 뭘 했나 안에서 쉬운 설명과 함께 제시한다.
- 이 운영 원칙은 `scripts/development-governance-policy-qa.mjs`가 Global QA에서 검사해 문서 회귀를 차단한다.

## 12. 사용자 승인 처리
- 명시적 `승인`/`승인함`/`모두 승인`은 현재 검수 대상으로 특정된 올바른 후보에 즉시 반영한다.
- 동일 후보의 승인 여부를 반복 확인하지 않는다.
- `진행해`만으로 승인 상태를 만들지 않는다.
- 임상적으로 잘못된 검사·자세·손 위치의 후보는 blanket approval만으로 승인하지 않으며 폐기 사유를 남긴다.
- 승인 canonical asset은 새 명시 지시 없이 재생성하지 않는다.

## 개발 작업 보고 3단 설명 규칙 (필수 · 2026-10-06 사용자 지시)

- 최종 사용자 보고의 큰 제목은 기존 정본대로 **① 뭘 했나 / ② 앞으로 뭘 할 건가** 두 개만 유지한다.
- 각 큰 제목 안에서 실제 작업 항목을 설명할 때 아래 **3단 설명을 반드시 모두 제공**한다.
  1. **코딩 전문가 설명** — 어떤 코드/데이터 구조/상태계약/QA/E2E/배포 경로를 왜 수정했는지 전문적으로 설명한다.
  2. **쉬운 설명** — 비개발자가 같은 내용을 바로 이해할 수 있도록 일상적인 한국어로 다시 설명한다.
  3. **실제 앱 사용 시 변화** — 사용자가 앱에서 어디를 눌렀을 때 무엇이 새로 보이거나, 무엇이 더 안전·정확·편해졌는지 구체적으로 설명한다. 앱 동작이 전혀 달라지지 않은 백엔드/정본 작업이면 **“실제 앱 화면 변화 없음”**이라고 명시하고 대신 어떤 위험을 예방했는지 설명한다.
- PASS / FAIL / PARTIAL / BLOCKED 상태는 **① 뭘 했나** 안의 각 작업 항목에 명시한다.
- **② 앞으로 뭘 할 건가**에서도 다음 작업의 전문 구현 목표, 쉬운 목적, 완료 시 실제 앱 변화 또는 검수 위치를 같은 3단 방식으로 설명한다.
- SHA, commit, CI run, 파일명 같은 기술 증빙은 코딩 전문가 설명 뒤에 붙인다. 증빙만 단독으로 보고하지 않는다.
- “실제 앱 사용 시 변화”는 추정으로 쓰지 않는다. 구현·검증된 변화만 현재 변화로 표현하고, 아직 구현 전이면 **예상 변화**로 구분한다.
- 이 규칙은 `scripts/development-governance-policy-qa.mjs`가 Global QA에서 자동 검사하며, 세 가지 설명 축 중 하나라도 정본에서 빠지면 CI가 실패해야 한다.

## 모든 일러스트 고해상도 규칙 — LOCKED 2026-10-06

- 앞으로 생성·교체·승인되는 모든 raster 교육 일러스트는 **고해상도 원본을 canonical 기준**으로 사용한다.
- 세로형 자산의 기본 최소 기준은 **1024×1536 px**, 가로형은 **1536×1024 px** 또는 동등 이상의 해상도다. 정사각형·특수비율은 짧은 변 1024 px 이상을 원칙으로 한다.
- 240×360, 320×480, 600×900 같은 축소본은 thumbnail/cache 용도로만 허용하며 canonical approved asset으로 승격하지 않는다.
- 앱에서는 고해상도 canonical asset을 responsive CSS로 축소 표시한다. 화면 표시 크기를 줄인다는 이유로 원본 파일 자체를 저해상도로 낮추지 않는다.
- SVG처럼 본질적으로 resolution-independent인 vector asset은 이 raster 최소 픽셀 규칙의 예외지만, 최종 실사형 인체 교육자료는 raster high-resolution 원본을 우선한다.
- 승인 자산의 고해상도 교체는 **내용·자세·손 위치·화살표·문구가 승인본과 동일한 경우 resolution-only replacement**로 취급할 수 있다. 내용이 달라지면 새 후보로 다시 사용자 검수를 받아야 한다.
- 기존 저해상도 승인 raster 자산은 `HD_UPGRADE_REQUIRED` migration backlog로 관리하고 순차적으로 교체한다. 단순 픽셀 확대만으로 선명도가 회복되지 않는 경우 “고해상도 완료”로 오기하지 않는다.
- 신규 raster 후보/승인본은 dimension, byte count, SHA-256, Git blob SHA-1을 registry에 기록하고 CI에서 검증한다.

## Physical Examination 교과서형 서술 해석 규칙 — LOCKED 2026-10-06

- 모든 Physical Examination Stable ID에는 단편 bullet만이 아니라 **교과서 수준의 연결된 서술형 해석**을 제공한다.
- `interpretation_detail.textbook_interpretation_narrative`를 정본 필드로 사용한다.
- 서술은 최소한 다음 흐름을 하나의 임상적 논리로 연결한다: 검사 원리/해부·생체역학적 배경 → 무엇을 실제로 평가하는지 → 양성·음성 결과의 의미 → 진단적 무게와 한계 → 주요 감별진단 → 함께 보아야 할 신경학적/근골격계 소견 → 다음 검사·영상·전기진단/전원 판단 → red flag와 안전.
- 단순 목록 반복이 아니라 “왜 그런 결과가 나오는가, 그 결과가 어떤 가설을 올리고 내리는가, 무엇은 여전히 남는가”를 설명한다.
- 근거 수치가 있으면 sensitivity/specificity/LR 및 근거확실성을 맥락과 함께 설명하되, 특정 cut-off나 단일검사를 확진/배제처럼 과장하지 않는다.
- 환자도 이해 가능한 `plain_language_explanation`은 유지하고, 그 아래 의사·전공의·학생이 공부할 수 있는 교과서형 서술을 별도 표시한다.
- 새로 제작·수정하는 검사부터 강제 적용하며, 기존 148개 Stable ID는 별도 migration backlog로 순차 보강한다.
