# LYS OrthoOS AI-EMR 통합 인계 원칙

근육학 · MSK Muscle Atlas를 장기적으로 LYS OrthoOS AI-EMR의 **MSK Knowledge Module**로 통합한다.

- 환자 데이터와 일반 의학 지식 데이터를 분리한다.
- muscle_id / symptom_id / nerve_id / region_id 등 안정적 ID를 공유한다.
- OrthoOS는 환자 문맥에서 관련 ID를 호출하고 Atlas는 일반 해부·임상·초음파 지식을 반환한다.
- Atlas의 UI에 종속되지 않는 구조화 데이터 계층을 유지한다.
- 환자식별정보를 근육학 GitHub 저장소에 저장하지 않는다.
- 향후 양방향 deep link/API 또는 내부 모듈 방식으로 연결 가능하게 설계한다.
