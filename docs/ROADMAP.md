# 근육학 · MSK Muscle Atlas 장기 로드맵

## 제품 목표
독립형 근육학 Atlas를 발전시켜 장기적으로 **LYS OrthoOS AI-EMR의 MSK Knowledge Module**로 통합한다.

## 핵심 개발 원칙
1. 근육학 지식 데이터와 환자 개인정보/진료데이터를 분리한다.
2. muscle_id, symptom_id, nerve_id, region_id 등 안정적인 고유 ID를 사용한다.
3. UI와 지식데이터를 분리해 OrthoOS가 같은 데이터를 재사용할 수 있게 한다.
4. 상업용 저작권 이미지를 복제하지 않고, 공개 라이선스 또는 적법하게 확보한 영상만 사용한다.
5. 초음파는 실제 영상만 사용하고 확인되지 않은 영상을 임의로 대체하지 않는다.
6. 정본 소스는 GitHub 저장소이며 main 변경 시 GitHub Pages 자동 배포를 기본으로 한다.
7. 설치된 PWA는 재설치가 아니라 service worker 버전 갱신으로 업데이트한다.

## 버전 로드맵
- v6: 증상 기반 임상 탐색
- v7: 퀴즈 학습 엔진 + 오답복습 + OrthoOS 연동용 데이터 구조 시작
- v7.x: 어깨/상지 고빈도 근육 30~40개의 실제 해부학·정상 초음파 영상 고정 매칭
- v8: 증상 기반 감별진단, 신경/검사/초음파 소견 연결
- v9: 즐겨찾기, 최근 본 근육, spaced repetition, 숙련도 대시보드
- 장기: LYS OrthoOS AI-EMR에서 환자 증상·진찰·초음파 문맥과 관련 MSK 지식 모듈을 안전하게 연결

## OrthoOS 통합 목표
EMR의 환자 기록은 근육학 앱으로 복제하지 않는다. OrthoOS가 필요한 순간에 구조화된 MSK 지식 ID를 호출하고, Atlas는 일반 의학 지식만 반환하는 구조를 우선한다.


## 현재 진행 상태 — v7.1 실제 영상 정본화
- 1차 고정 매칭: 견갑대·어깨·상완 핵심 18개 근육/근군
- 실제 초음파 고정: 극상건 정상 LAX/SAX, 상완이두근 장두 정상, 회전근개 파열 예시
- 원칙: 구조/면이 불확실한 초음파는 고정하지 않고 임의 대체 금지
- 다음: pectoralis minor, coracobrachialis, anconeus 및 전완 고빈도 근육으로 확대


## 현재 진행 상태 — v7.2 상지 40 + 적응형 퀴즈
- 고정 해부학 영상: 기존 19개 + 상완/전완 21개 = 총 40개 근육/근군
- 추가 대상: 오훼완근, 주근, 원회내근, FCR, palmaris longus, FCU, FDS, FDP, FPL, pronator quadratus, brachioradialis, ECRL, ECRB, ED, EDM, ECU, supinator, APL, EPB, EPL, EI
- 퀴즈: 정방향 + 역방향, 오답 가중 출제, 간격 반복(spaced repetition) 기반 오늘 복습
- 초음파 원칙 유지: 확인 가능한 실제 영상만 고정, 불확실 영상은 임의 대체 금지
- 다음: 손 내재근/하지 고빈도 근육 영상 정본화와 임상 감별진단 v8
