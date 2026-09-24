# Muscle Atlas → LYS OrthoOS 전신 개발 Master Roadmap

시행일: 2026-09-24
정본 상태: Active
통합 원칙: Muscle Atlas는 독립 학습 앱으로 유지하면서 동일 MSK Knowledge Core를 향후 LYS OrthoOS가 read-only 방식으로 재사용할 수 있게 한다.

## 완료의 정의
한 부위는 아래 8개 층이 모두 연결되어야 COMPLETE로 처리한다.

1. Anatomy / Structure
2. Tendon · Nerve · Joint · Bursa · Ligament
3. Clinical Finding
4. Examination / Special Test
5. Ultrasound View
6. Diagnosis Concept / Differential
7. Curated Media
8. Quiz / 오답복습

기존 기능 회귀검사와 Stable ID 무결성 검사를 통과해야 main에 배포한다.

## 공식 전신 개발 순서 및 목표일

| 단계 | 모듈 | 목표 완료일 | 핵심 산출물 | Quiz Gate |
|---|---|---:|---|---|
| 0 | Schema/Foundation | 2026-09-24 | MSK Knowledge Schema v1, Stable ID, Integration Contract 초안 | 기존 O/I/F/N quiz 유지 |
| 1 | 어깨·견갑대·상완 | 2026-10-02 | 회전근개, biceps, bursa, AC/GH, special test, shoulder US protocol | Shoulder clinical quiz ≥20 |
| 2 | 팔꿈치·전완 | 2026-10-12 | lateral/medial elbow, flexor-pronator, extensor-supinator, radial tunnel/PIN | Elbow/forearm quiz ≥20 |
| 3 | 손목·손 | 2026-10-24 | 1~6 extensor compartments, flexor tendons, CTS/Guyon, TFCC 주변, intrinsic hand | Wrist/hand quiz ≥25 |
| 4 | 고관절·골반·둔부 | 2026-11-07 | iliopsoas, gluteal tendons, GTPS, adductors, deep gluteal, hamstring origin | Hip/pelvis quiz ≥25 |
| 5 | 무릎·대퇴 | 2026-11-20 | quadriceps/patellar tendon, hamstrings, pes, collateral/periarticular structures | Knee/thigh quiz ≥25 |
| 6 | 하퇴·발목·발 | 2026-12-05 | calf/Achilles, peroneal, anterior tendons, plantar structures, intrinsic foot | Leg/ankle/foot quiz ≥30 |
| 7 | 경추 | 2026-12-18 | deep flexors, SCM/scalenes, suboccipital, posterior muscles, root/nerve relations | Cervical quiz ≥20 |
| 8 | 흉추·등·흉곽 | 2026-12-30 | erector/multifidus, scapulothoracic, intercostal/respiratory relations | Thoracic/back quiz ≥20 |
| 9 | 요추·천추 | 2027-01-14 | multifidus/erector/QL/iliopsoas, lumbosacral relations, examination | Lumbar/sacral quiz ≥20 |
| 10 | 복벽·몸통 심부 | 2027-01-25 | rectus/oblique/TA/diaphragm 및 trunk functional anatomy | Trunk quiz ≥15 |
| 11 | 전신 통합 QA | 2027-02-10 | ID audit, orphan relation=0, media/license audit, quiz coverage audit | 전신 종합/취약부위 quiz |
| 12 | OrthoOS Read-only 준비 | 2027-02-20 | Integration Contract v1, read-only fixture/API shape, no-PHI verification | 교육 모드 재사용 검증 |

## 개발 운영
- 개발은 dev branch에서 한다.
- 회귀검사 PASS 후에만 main으로 병합한다.
- main은 설치형 학습 앱의 stable release다.
- 다음 개발 세션은 위 표에서 가장 앞의 미완료 단계부터 재개한다.
- 일정 변경 시 이유와 새 목표일을 ROADMAP에 기록하며, 완료 기준 자체는 낮추지 않는다.

## 현재 단계
Stage 1 — 어깨·견갑대·상완
현재 목표: v7.4 Examination + Ultrasound Knowledge Module
완료 예정: 2026-10-02


## v7.4 진행 체크 — Shoulder Examination + Ultrasound
- [x] 어깨 clinical test 11개 Stable ID 구조화
- [x] 어깨 ultrasound view 9개 Stable ID 구조화
- [x] Knowledge Core relationship 연결
- [x] Shoulder clinical quiz 20문항 생성
- [x] 앱 임상 모듈 화면 연결
- [ ] 모든 shoulder ultrasound view의 검수된 실제 공개 영상 고정 매칭
- [x] shoulder diagnosis/differential graph 확장
- [x] Stage 1 media/license audit 1차 완료 (9개 view 전수 상태표)


## v7.5 진행 체크 — Shoulder Differential + Media Audit
- [x] 어깨 diagnosis concept 16개 정본화
- [x] clinical finding 12개 정본화
- [x] differential group 6개 구조화
- [x] 초음파 9개 view 전수 media/license audit
- [x] 검증 실제 영상 고정: supraspinatus LAX/SAX, biceps transverse, infraspinatus, dynamic subacromial
- [x] 어깨 임상 문제은행 20 → 30문항
- [ ] biceps LAX, subscapularis LAX/SAX, AC joint의 안정적 직접 자산 URL 고정
- [ ] Shoulder Stage 1 final COMPLETE 판정


## v7.6 모바일 UI / 해부학 탐색
- [x] 모바일 본문과 헤더를 전체 폭에 가깝게 사용
- [x] 작은 화면의 hero/title/탭 밀도 최적화
- [x] 해부학 페이지 1단계: 14개 부위만 표시
- [x] 해부학 페이지 2단계: 선택한 부위의 근육만 표시
- [x] 기존 근육 상세 화면으로 연결
- [x] Knowledge Core hydrate 후 부위 목록 자동 갱신


## v7.7 증상 계층 탐색
- [x] 증상 20개를 해부 부위 기반 7개 그룹으로 분류
- [x] 증상 그룹 Stable ID (sg001~sg007)
- [x] 증상 찾기 1단계: 해부 부위 그룹
- [x] 증상 찾기 2단계: 해당 부위 증상
- [x] 증상 상세 → 관련 근육/신경/초음파 흐름 유지
- [x] Knowledge Core에 symptom_group 계층 반영
