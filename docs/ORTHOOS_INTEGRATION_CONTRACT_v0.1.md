# OrthoOS Integration Contract v0.1

## 원칙
Muscle Atlas/MSK Knowledge Core와 LYS OrthoOS는 서로의 내부 데이터베이스에 직접 쓰지 않는다.

## 읽기 계약 초안
OrthoOS가 향후 요청하는 기본 단위:
- entity_type
- stable_id
- schema_version
- dataset_version

예시:
```json
{"entity_type":"muscle","stable_id":"m070"}
```

Muscle Atlas Knowledge Layer가 반환할 수 있는 항목:
- canonical labels
- region/structure relationships
- anatomy
- innervation
- clinical knowledge
- related tests/findings/diagnosis concepts
- ultrasound views
- educational media references

## 금지
- Patient/Encounter/실제 Diagnosis/Order/Result를 Atlas에 복제
- Atlas가 환자 차트에 직접 쓰기
- 환자 문맥만으로 미시행 검사나 좌우를 추정
- knowledge candidate를 확정 진단으로 취급

## Stage B
최초 통합은 read-only MSK panel로 한다.

## Stage C
진찰/초음파/운동 템플릿 초안을 OrthoOS에 전달할 수 있으나 실제 차트 반영은 OrthoOS에서 의사가 확인·확정한다.

## Versioning
Breaking change는 schema major version을 올린다. 표시명 수정이나 콘텐츠 보강은 stable ID를 바꾸지 않는다.
