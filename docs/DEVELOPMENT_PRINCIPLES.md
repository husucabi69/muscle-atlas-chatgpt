# DEVELOPMENT PRINCIPLES

시행일: 2026-09-24

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
