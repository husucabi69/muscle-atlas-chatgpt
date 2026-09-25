# OrthoOS Integration Contract v1.0.0

시행일: 2026-09-25  
상태: Stable contract candidate — CI 검증 후 stable  
Provider: Muscle Atlas / MSK Knowledge Layer  
Consumer: LYS OrthoOS Clinical Integration Layer

## 1. 목적
Muscle Atlas의 patient-independent MSK 지식을 LYS OrthoOS가 재사용할 수 있도록 **버전 고정된 read-only 계약**을 정의한다.

이 계약은 두 시스템을 합치는 계약이 아니다.

```
Muscle Atlas / MSK Knowledge Core
        ↓ read-only versioned contract
LYS OrthoOS Clinical Integration Layer
        ↓
Patient / Encounter / Problem / Diagnosis / Order / Result / Treatment
```

Muscle Atlas repository, runtime, database와 OrthoOS의 환자 데이터 저장소는 독립적으로 유지한다.

## 2. v1 transport
현재 v1 provider는 GitHub Pages의 **static read-only bundle**이다.

허용:
- GET
- version-pinned JSON fetch
- Stable ID 기반 knowledge lookup
- relationship lookup

금지:
- POST
- PUT
- PATCH
- DELETE
- Atlas 저장소에 환자정보 쓰기
- client-side API key 또는 writable credential 탑재

OrthoOS 내부 adapter는 다음 API shape를 구현할 수 있다. 이 endpoint는 **OrthoOS 소유 adapter**이며 Atlas 서버 endpoint를 뜻하지 않는다.

- `GET /integration/msk/v1/manifest`
- `GET /integration/msk/v1/entities/{entity_type}/{stable_id}`
- `GET /integration/msk/v1/entities/{entity_type}/{stable_id}/relationships`

## 3. Version pin
현재:
- contract_version: `1.0.0`
- schema_version: `1.0.0`
- dataset_version: `2026.09.25-j`
- patient education dataset: `2026.09.25-c`

OrthoOS는 지식 조회 시 사용한 version을 기록할 수 있어야 한다. 표시명 수정이나 설명 보강은 Stable ID를 바꾸지 않는다.

Breaking change:
- 필수 contract field 삭제/의미변경
- Stable ID 의미 변경
- 호환되지 않는 entity shape 변경
- patient-independent / read-only 경계 변경

위 경우 contract/schema major version을 올린다.

## 4. 허용 entity type
- region
- muscle
- symptom_group
- symptom_pattern
- tendon
- nerve
- joint
- bursa
- ligament
- fascia
- clinical_finding
- clinical_test
- diagnosis_concept
- ultrasound_view
- content_asset
- relationship

Stable ID는 표시명과 분리된 canonical identity다. ID 재사용은 금지한다.

## 5. Request contract
최소 요청:

```json
{
  "entity_type": "muscle",
  "stable_id": "m070"
}
```

version pin을 명시할 수 있다.

```json
{
  "entity_type": "muscle",
  "stable_id": "m070",
  "schema_version": "1.0.0",
  "dataset_version": "2026.09.25-j"
}
```

### Request에 넣으면 안 되는 것
- patient_id
- encounter_id
- patient_name
- laterality
- performed_status
- test_result
- diagnosis_status
- clinical_note
- 그 밖의 patient-specific context

환자 문맥을 Atlas request에 넣지 않는다. 환자 문맥은 OrthoOS 내부에서만 유지한다.

## 6. Response envelope
정상 응답은 최소 다음 의미를 가진다.

```json
{
  "contract_version": "1.0.0",
  "schema_version": "1.0.0",
  "dataset_version": "2026.09.25-j",
  "knowledge_class": "general_msk_knowledge",
  "patient_context_included": false,
  "entity_type": "muscle",
  "stable_id": "m070",
  "clinical_semantics": "General knowledge only",
  "entity": {},
  "relationships": []
}
```

## 7. 임상 의미 경계
### diagnosis_concept
**Knowledge candidate only.**
Atlas의 `d001 극상건병증` 객체가 반환되어도 어떤 환자에게 극상건병증이 확정되었다는 뜻이 아니다.

### clinical_finding
finding definition만 반환한다. 실제 환자에서 해당 소견이 관찰되었다고 표시하지 않는다.

### clinical_test
검사 방법·양성 정의·해석 지식을 반환한다.
Atlas는 환자별로:
- 시행 여부
- 양성/음성
- 수치
- laterality

를 생성하지 않는다.

### symptom_pattern
교육용 지식 패턴이다. 환자에게 실제 증상이 있다는 assertion이 아니다.

### ultrasound_view
검사법/해부학/정상 landmark 지식이다. 환자 영상이나 Result가 아니다.

## 8. Laterality
Atlas는 환자 좌우를 추정하지 않는다.

예:
- “오른쪽 어깨가 아프다”는 Encounter context는 OrthoOS 소유
- Atlas가 반환하는 `m070 supraspinatus`는 좌/우 환자 개체가 아니라 일반 지식 객체

필요하면 OrthoOS가 patient-specific layer에서 laterality를 붙이고 의사가 확인한다.

## 9. Patient Education
`data/patient-exercise-library-v1.json`은 patient-independent 교육 지식이다.

Atlas가 제공:
- muscle → exercise profile 연결
- stretch / strengthening / motor-control 교육
- evidence tier A/B/C
- source metadata
- evidence boundary / safety note

OrthoOS가 소유:
- 실제 환자에게 처방했는지
- 횟수·강도·기간의 개인별 처방
- 치료 반응
- 금기/수술 후 protocol
- Treatment/PT 기록

## 10. Media
Atlas의 ultrasound media는 실제 초음파 source/reference만 제공한다.
- generated B-mode substitute 금지
- embedded reusable media는 명시적 재사용조건과 attribution 필요
- 그 외 자료는 canonical link-only
- 환자 영상은 Atlas에 저장하지 않는다

## 11. Error contract
- `INVALID_ENTITY_TYPE` — 400
- `INVALID_STABLE_ID` — 400
- `PATIENT_CONTEXT_FORBIDDEN` — 400
- `VERSION_MISMATCH` — 409
- `ENTITY_NOT_FOUND` — 404

환자필드가 들어온 request는 knowledge lookup으로 조용히 무시하지 않고 **PATIENT_CONTEXT_FORBIDDEN**으로 거부한다.

## 12. Security / privacy
- PHI allowed: false
- patient context allowed: false
- client API keys: false
- writable credentials in Atlas: false
- OrthoOS 내부 DB direct-write from Atlas: false

## 13. Canonical files
- Contract: `data/integration/orthoos-readonly-contract-v1.json`
- Export manifest: `data/integration/orthoos-export-manifest-v1.json`
- Integration schema: `data/schema/orthoos-readonly-integration-v1.schema.json`
- Knowledge schema: `data/schema/msk-knowledge-schema-v1.json`
- Knowledge Core: `data/knowledge-core-v1.json`
- Patient Education: `data/patient-exercise-library-v1.json`
- Global QA: `data/global-qa-stage11-v1.json`
- Global media audit: `data/media-license-global-audit-v1.json`

## 14. Fixtures
- muscle request: `data/integration/fixtures/entity-request-m070.json`
- muscle response: `data/integration/fixtures/entity-response-m070.json`
- diagnosis-candidate response: `data/integration/fixtures/entity-response-d001-candidate.json`
- patient-context rejection: `data/integration/fixtures/error-patient-context-forbidden.json`

## 15. v0.1 → v1
v0.1의 기본 원칙은 유지한다.
v1에서 새로 기계적으로 고정한 것:
- entity type allow-list
- request additional-field boundary
- response envelope
- explicit patient-context rejection
- diagnosis candidate semantics
- version pinning
- static-bundle transport
- OrthoOS adapter API shape
- machine-readable manifest/schema/fixtures
- automated integration contract QA

## 16. v1 범위 밖
아래는 v1에서 하지 않는다.
- Atlas가 OrthoOS 차트에 직접 쓰기
- patient-specific 자동진단
- patient-specific 자동 laterality
- 미시행 검사 자동 기록
- 진료 note/order/result 생성 후 자동 확정
- 두 repository/runtime/database 병합

향후 template suggestion이 필요하면 별도의 write-protected proposal contract에서 다루고, 실제 차트 반영은 OrthoOS의 clinician-confirmed workflow가 소유한다.
