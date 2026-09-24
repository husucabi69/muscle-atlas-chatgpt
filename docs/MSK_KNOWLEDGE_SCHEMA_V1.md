# MSK Knowledge Schema v1

## 목적
Muscle Atlas를 독립 앱으로 유지하면서 향후 LYS OrthoOS가 같은 MSK 지식을 Stable ID로 읽을 수 있게 하는 최소 지식 스키마다.

## 핵심
- 환자 데이터는 포함하지 않는다.
- 표시명 변경과 entity identity를 분리한다.
- 기존 m001~m183, sx01~sx20 ID는 폐기하지 않고 canonical stable ID로 승격한다.
- 모든 근육은 muscle_id + structure_id + region_id를 가진다.
- 지식 관계는 relationship edge로 표현한다.
- 새 entity type은 실제 기능이 생길 때 점진적으로 확장한다.

## 현재 v1 범위
- region 14
- muscle 183
- symptom_pattern 20
- tendon / nerve / joint / bursa: 현재 어깨·상지에서 실제 필요한 최소 개체
- clinical finding / test / diagnosis concept / ultrasound view: 현재 구현되는 어깨 clinical pathway부터 시작
- media asset: 현재 고정 영상 레지스트리를 content_asset_id로 감싼다.

## Stable ID 정책
1. ID는 표시명과 분리한다.
2. 한글/영문명이 수정돼도 ID는 유지한다.
3. 삭제 대신 status=deprecated를 우선 사용한다.
4. ID 재사용 금지.
5. OrthoOS는 entity_type + stable ID 조합을 canonical reference로 사용한다.

## 환자정보 경계
이 스키마에는 Patient, Encounter, 실제 환자 Diagnosis/Order/Result/Note/영상/음성/PHI를 저장하지 않는다. 해당 canonical owner는 LYS OrthoOS다.
