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

전신 공통 학습 레이어는 별도 completion gate로 유지한다.
9. Oral Viva — Origin / Insertion / Function / Nerve를 음성/텍스트로 답하고 즉시 정답·부분정답·오답 교정
10. Patient Education — 부위 → 근육 → 스트레칭/강화운동, 근거등급·출처·안전경계 표시

기존 Stage 1~8의 임상 COMPLETE를 소급 취소하지 않고, 9~10번 공통 학습 레이어는 Stage 11 전신 통합 QA에서 전체 coverage를 다시 감사한다.
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
| L1 | Oral Viva 학습 레이어 | 2026-09-25 | 205 근육 O/I/F/N 동적 출제, 친구·선생님·선배·대가, 음성/텍스트 답변, 즉시 교정 | 전 근육 동적 coverage |
| L2 | 환자교육 운동 레이어 | 2026-09-25 foundation | 부위→근육→stretch/strength, 근거 A/B/C, source·red flag, 근거 없으면 미확립 명시 | 205 근육 assignment 100% |
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
현재 상태: Stage 1 어깨·견갑대·상완 COMPLETE — 2026-09-24 조기 완료
Stage 2 팔꿈치·전완 COMPLETE — 2026-09-25 조기 완료
Stage 3 손목·손 COMPLETE — 2026-09-25 조기 완료
Stage 4 고관절·골반·둔부 COMPLETE — 2026-09-25 조기 완료
현재 개발: Stage 12 OrthoOS Read-only 준비
목표 완료일: 2027-02-20


## v7.4 진행 체크 — Shoulder Examination + Ultrasound
- [x] 어깨 clinical test 11개 Stable ID 구조화
- [x] 어깨 ultrasound view 9개 Stable ID 구조화
- [x] Knowledge Core relationship 연결
- [x] Shoulder clinical quiz 20문항 생성
- [x] 앱 임상 모듈 화면 연결
- [x] 모든 shoulder ultrasound view의 검수된 실제 공개 영상 고정 매칭 (앱내 5 + 정확한 원문 Figure 4)
- [x] shoulder diagnosis/differential graph 확장
- [x] Stage 1 media/license audit 1차 완료 (9개 view 전수 상태표)


## v7.5 진행 체크 — Shoulder Differential + Media Audit
- [x] 어깨 diagnosis concept 16개 정본화
- [x] clinical finding 12개 정본화
- [x] differential group 6개 구조화
- [x] 초음파 9개 view 전수 media/license audit
- [x] 검증 실제 영상 고정: supraspinatus LAX/SAX, biceps transverse, infraspinatus, dynamic subacromial
- [x] 어깨 임상 문제은행 20 → 30문항
- [x] biceps LAX, subscapularis LAX/SAX, AC joint를 정확한 공개 원문 Figure에 고정 매칭
- [x] Shoulder Stage 1 final COMPLETE — 2026-09-24


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


## v7.8 PWA 독립 실행 / Fullscreen
- [x] manifest start_url 절대경로 고정
- [x] manifest scope 절대경로 고정
- [x] display=fullscreen, standalone fallback
- [x] Android 설치 여부를 앱 내부 display-mode로 자가 판별
- [x] 브라우저로 열린 경우에만 설치 안내 표시
- [x] 설치 prompt 사용 가능 시 앱 내부 설치 버튼 제공
- [x] safe-area 대응
- [ ] 실기기에서 기존 바로가기 제거 후 재설치 확인


## v7.9 Shoulder Stage 1 COMPLETE — 2026-09-24
- [x] Anatomy / Structure
- [x] Tendon · Nerve · Joint · Bursa
- [x] Clinical Finding
- [x] Examination / Special Test 11개
- [x] Ultrasound View 9개
- [x] Diagnosis / Differential 16개 진단개념, 6개 감별그룹
- [x] Curated Media / License audit — 9/9 view 검증
- [x] Shoulder clinical quiz 30문항
- [x] Stable ID / relationship integrity
- [x] Patient/PHI boundary 유지
- [x] 기존 앱 기능 회귀검사

### 초음파 미디어 기준
- 앱 내 직접 고정 가능한 공개 실영상: 5 view
- 직접 파일 복제보다 정확한 open-access 원문 Figure가 안전한 경우: 4 view
- 미검증/가짜 대체: 0
- 향후 더 안정적인 재배포 가능 direct asset이 확인되면 원문 reference를 direct embed로 승격할 수 있으나 Stage 1 지식 completeness에는 영향 없음.

### 다음
Stage 2 — 팔꿈치·전완. Anatomy → structure/nerve → findings → examination → ultrasound → differential → media → quiz 순으로 동일한 completion gate 적용.


## v8.0 Claude Audit + Elbow Stage 2 Foundation
### Claude anatomy audit
- [x] Claude 186 vs Knowledge Core 전수 구조 대조
- [x] 단순 개수 비교가 아닌 grouping/splitting 차이 확인
- [x] 검증 누락 근육 22개 Stable ID 편입 (m184~m205)
- [x] canonical 근육 기록 183 → 205
- [x] Articularis cubiti는 신규 근거 재검토 후 m205로 승격; 흔적성 sacrococcygeus만 보류
- [x] Claude의 비어 있거나 근거가 약한 임상/초음파 문구는 자동 이식하지 않음

### Stage 2 팔꿈치·전완
- [x] Anatomy / source audit
- [x] Tendon · Nerve · Joint · Bursa · Ligament Stable ID
- [x] 증상 경로 4개: 외측 / 내측 / 전방 / 후방
- [x] Clinical Finding 8개
- [x] Examination / Special Test 10개
- [x] Ultrasound View 8개
- [x] Diagnosis Concept 10개 + differential group 4개
- [x] Elbow clinical quiz 20문항
- [x] 앱 임상 모듈 / 퀴즈 UI 연결
- [x] 실제 공개 elbow ultrasound media 8/8 고정 reference + license audit
- [x] Stage 2 final COMPLETE — 2026-09-25


## v8.1 Elbow Stage 2 COMPLETE — 2026-09-25
- [x] Canonical anatomy 205 records (Articularis cubiti m205 포함)
- [x] Tendon · Nerve · Joint · Bursa · Ligament Stable ID
- [x] Clinical Finding 8개
- [x] Examination / Special Test 10개
- [x] Ultrasound View 8개
- [x] Diagnosis Concept 10개 + differential group 4개
- [x] 실제 공개 초음파 source/figure/license audit 8/8
- [x] Elbow clinical quiz 24문항
- [x] Stable ID / relationship integrity
- [x] Patient/PHI boundary 유지
- [x] 기존 Shoulder/PWA/증상/해부 계층 회귀검사

### 미디어 원칙
- 직접 파일 복제보다 출처·라이선스 문맥을 보존하는 open-access article figure reference를 우선.
- 실제 초음파가 아닌 생성·도식 이미지는 대체 영상으로 사용하지 않음.
- 병리 예시(예: olecranon bursitis)는 정상 영상으로 오인하지 않도록 명시.

### 다음
Stage 3 — 손목·손. 1~6 신전구획, 굴곡건, CTS/Guyon, TFCC 주변, intrinsic hand를 동일 completion gate로 확장.


## v8.2 Wrist/Hand Stage 3 — QA 진행
- [x] Tendon · Nerve · Joint · Ligament Stable ID
- [x] 손목·손 증상 경로 7개(기존 3 + 신규 4)
- [x] Clinical Finding 10개
- [x] Examination / Special Test 14개
- [x] Ultrasound View 12개
- [x] Diagnosis Concept 12개 + differential group 6개
- [x] 실제 공개 wrist/hand ultrasound media 12/12 고정 reference + license audit
- [x] Wrist/hand clinical quiz 30문항
- [x] 앱 임상 모듈 / 퀴즈 UI 연결
- [x] Stage 3 final COMPLETE — 2026-09-25


## v8.2 Wrist/Hand Stage 3 COMPLETE — 2026-09-25
- [x] Canonical muscle records 205 유지
- [x] Tendon 9개 신규 (t010~t018)
- [x] Nerve 3개 신규 (n011~n013)
- [x] Joint 3개 신규 (j006~j008)
- [x] Ligament/complex 4개 신규 (lig002~lig005)
- [x] 손목·손 symptom pathway 7개
- [x] Clinical Finding 10개
- [x] Examination / Special Test 14개 (ct022~ct035)
- [x] Ultrasound View 12개 (usv018~usv029)
- [x] Diagnosis Concept 12개 (d027~d038)
- [x] Differential group 6개 (dg011~dg016)
- [x] 실제 공개 초음파 source/figure/license audit 12/12
- [x] Wrist/Hand clinical quiz 30문항
- [x] Stable ID 중복 0 / orphan relationship 0
- [x] Patient/PHI boundary 유지
- [x] Shoulder / Elbow / adaptive quiz / symptom hierarchy / anatomy hierarchy / fullscreen PWA 회귀검사

### 임상 안전 원칙
- Finkelstein과 Eichhoff를 구분한다.
- Phalen/Tinel/Durkan 중 하나만으로 CTS를 확정하지 않는다.
- 정중신경 CSA cutoff는 위치·프로토콜 의존적으로 해석한다.
- Fovea/DRUJ/ECU/CMC/Watson 검사는 후보를 좁히는 자료이며 단독 확진 기준이 아니다.
- 실제 초음파가 아닌 생성·도식 이미지를 대체 영상으로 사용하지 않는다.

### 다음
Stage 4 — 고관절·골반·둔부. Iliopsoas, gluteal tendons, GTPS, adductors, deep gluteal, proximal hamstring을 동일 completion gate로 확장.


## v8.3 Hip/Pelvis Stage 4 COMPLETE — 2026-09-25
- [x] Anatomy / Structure — 기존 canonical muscle 205 유지
- [x] Tendon 7개 신규 (t019~t025)
- [x] Nerve 5개 신규 (n014~n018)
- [x] Hip joint j009 / Bursa b004~b005 / Ligament lig006
- [x] 고관절·골반 symptom pathway 6개 (기존 sx11·sx12 + sx27~sx30)
- [x] Clinical Finding 12개 (f031~f042)
- [x] Examination / Special Test 14개 (ct036~ct049)
- [x] Ultrasound View 12개 (usv030~usv041)
- [x] Diagnosis Concept 14개 (d039~d052)
- [x] Differential group 6개 (dg017~dg022)
- [x] 실제 공개 초음파 source/figure/license audit 12/12
- [x] Hip/Pelvis clinical quiz 30문항
- [x] 단일 검사·영상소견을 확정진단으로 사용하지 않는 안전 문구 반영
- [x] Patient/PHI boundary 유지
- [x] Stable ID 중복 0 / orphan relationship 0 — PASS
- [x] Shoulder / Elbow / Wrist-Hand / adaptive quiz / hierarchy / fullscreen PWA 회귀검사 — PASS

### 근거·미디어 원칙
- 2026 open-access hip ultrasonography guide와 ESSR hip protocol을 표준 스캔 기준으로 사용.
- GTPS는 대전자 촉진 + 저항 외전의 순차적 진단확률 변화 근거를 반영하되 확정검사로 취급하지 않음.
- FADIR/FABER는 연구별 정확도 변이가 커 관절내 병변의 보조/선별검사로만 기술.
- Dynamic snapping은 통증·소리와 영상 snap의 시간적 일치를 요구.
- CC BY-NC-ND 원문 Figure는 재가공·복제하지 않고 canonical reference로 연결.

### 다음
Stage 5 — 무릎·대퇴. Quadriceps/patellar tendon, hamstrings, pes, collateral/periarticular structures를 동일 completion gate로 확장.


## Stage 5 완료 기록
완료일: 2026-09-25
상태: COMPLETE — Knee/Thigh Stage 5
- Quadriceps/patellar extensor mechanism, patellofemoral/peripatellar structures
- Distal hamstrings/pes anserinus
- MCL/LCL, ITB, popliteus, proximal tibiofibular and posterior knee structures
- Actual ultrasound canonical reference audit 14/14
- Knee/Thigh clinical quiz 30
- 다음 공식 단계: Stage 6 — 하퇴·발목·발


## Stage 6 완료 기록
완료일: 2026-09-25
상태: COMPLETE — Leg/Ankle/Foot Stage 6
- Calf / Achilles
- Anterior, medial and lateral ankle tendons
- ATFL / CFL / syndesmosis
- Tarsal tunnel and plantar nerve branches
- Plantar fascia and intrinsic foot
- Forefoot web-space / first MTP
- Actual ultrasound canonical reference audit 18/18
- Leg/Ankle/Foot clinical quiz 30
- 다음 공식 단계: Stage 7 — 경추


## Stage 7 완료 기록
완료일: 2026-09-25
상태: COMPLETE — Cervical Stage 7
- Deep cervical flexors / SCM / scalenes
- Suboccipital, splenius, semispinalis, multifidus and posterior extensor layers
- C5–C8 cervical roots / greater occipital nerve / superficial cervical plexus
- AO / AA / cervical zygapophyseal joint knowledge
- Radiculopathy / DCM red-flag / cervicogenic headache / occipital neuralgia pathways
- Actual ultrasound canonical reference audit 14/14
- Cervical clinical quiz 30
- 다음 공식 단계: Stage 8 — 흉추·등·흉곽


## Stage 8 완료 기록
완료일: 2026-09-25
상태: COMPLETE — Thoracic/Back/Chest Wall Stage 8
- Thoracic erector spinae / semispinalis / multifidus / rotatores
- Costotransverse / costovertebral / thoracic facet structures
- Scapulothoracic mechanics and serratus/long thoracic pathway
- Intercostal muscles / intercostal nerve / diaphragm
- Thoracic radiculopathy / myelopathy / serious-pathology red flags
- Actual ultrasound canonical reference audit 14/14
- Thoracic clinical quiz 30
- 다음 공식 단계: Stage 9 — 요추·천추


## v8.8 전신 학습 레이어 — Oral Viva + Patient Education
상태: FOUNDATION COMPLETE — 2026-09-25

### L1. Oral Viva
- [x] canonical 205 muscles에서 Origin / Insertion / Function / Nerve를 동적으로 출제
- [x] 친구 / 선생님 / 선배 / 대가 4단계
- [x] 단일 항목 → 2항목 연결 → O/I/F/N 통합 질문
- [x] Web SpeechRecognition 지원 기기에서는 마이크 답변
- [x] 음성인식 미지원 시 동일 textarea 입력 fallback
- [x] 질문/교정 feedback SpeechSynthesis 읽기
- [x] 정답 / 부분정답 / 틀림 즉시 표시
- [x] 빠진 핵심과 canonical answer를 바로 제시
- [x] 외부 API/LLM에 답변을 전송하지 않고 기기 내부 핵심어 비교
- [x] oral 오답 기록 localStorage 저장
- [ ] 향후 optional semantic grader는 API key를 앱에 넣지 않는 안전한 server-side contract가 생긴 뒤 검토

### L2. 환자교육 스트레칭·강화운동
- [x] canonical 205 muscles 전부 assignment 생성
- [x] 부위 → 근육 → 스트레칭/가동성 → 강화/motor-control 계층
- [x] 근거등급 A / B / C 분리
- [x] 직접 근거가 없으면 '개별 단독 protocol 미확립'으로 표시
- [x] 문헌 source 링크와 적용범위 표시
- [x] 수술 후/급성파열/진행성 신경학적 이상/심폐 red flag 안전문구
- [x] 2025 rotator cuff CPG, 2024 Achilles CPG, 2023 plantar heel pain CPG, 2021 LBP/ankle CPG, 2019 PFP CPG, 2018 gluteal tendinopathy RCT, 2017 neck CPG 등을 초기 근거축으로 사용
- [ ] Stage 9~10 개발 중 새 부위 문헌을 지속 확장
- [ ] Stage 11에서 205개 전체 source/evidence-grade audit 재검증

### 근거 원칙
- '해부학적으로 그럴듯함'과 '임상적으로 검증된 환자운동'을 같은 등급으로 표시하지 않는다.
- 작은 심부근·설골근·골반저 일부처럼 개별 근육 단독 운동 근거가 약한 경우 임의 처방을 만들지 않는다.
- 질환/근육군 CPG 근거를 개별 근육에 연결할 때는 B 또는 설명문으로 그 한계를 명확히 한다.


## Stage 9 완료 기록
완료일: 2026-09-25
상태: COMPLETE — Lumbar/Sacral Stage 9
- Lumbar multifidus / erector spinae / quadratus lumborum / psoas major
- L2–S1 nerve-root clinical relations
- Lumbar facet / sacroiliac joint / thoracolumbar fascia
- Superior cluneal nerve pathway
- Radiculopathy / neurogenic claudication / SI pain / cauda equina red-flag pathways
- SI provocation cluster는 positive rule-in이 제한적이며 negative cluster의 배제 가치가 더 높다는 2021 meta-analysis 반영
- Actual ultrasound canonical reference audit 15/15
- Lumbar/Sacral clinical quiz 30
- Oral Viva / Patient Education v8.8 기능 유지
- 다음 공식 단계: Stage 10 — 복벽·몸통 심부


## Stage 10 완료 기록
완료일: 2026-09-25
상태: COMPLETE — Abdominal/Core Stage 10
- Rectus abdominis / external oblique / internal oblique / transversus abdominis
- Linea alba / rectus sheath / transversalis fascia / linea semilunaris
- Thoracoabdominal anterior cutaneous / iliohypogastric / ilioinguinal nerve relations
- Abdominal-wall pain / ACNES / rectus diastasis / hernia / athletic groin / motor-control pathways
- Carnett test 2024 review safety interpretation
- EHS rectus-diastasis guideline: physiotherapy may be considered, but no single optimal exercise regimen is established
- Dynamic hernia ultrasound with Valsalva and inferior epigastric vessel landmark
- Actual ultrasound canonical reference audit 15/15
- Abdominal/Core clinical quiz 30
- Oral Viva + Patient Education preserved and abdominal education refined
- 다음 공식 단계: Stage 11 — 전신 통합 QA


## Stage 11 완료 기록
완료일: 2026-09-25
상태: COMPLETE — Global QA automated gate PASS

### Canonical anatomy
- muscles 205 / regions 14
- Origin / Insertion / Function / Nerve 820/820 fields present
- placeholder/TBD 0
- duplicate English muscle names 0
- cross-entity Stable ID collision 0

### Oral Viva
- O/I/F/N base questions 820/820 tested
- canonical exact-answer false failure 0
- master integrated O/I/F/N 205/205 tested
- SpeechRecognition fallback / SpeechSynthesis / localStorage wiring PASS
- external AI/API answer transfer 없음

### Patient Education
- assignments 205/205
- profiles 19 / evidence sources 11
- invalid profile/source refs 0
- evidence tiers A 58 / B 57 / C 90
- isolated-protocol 근거가 없는 근육은 임의 치료법을 생성하지 않음

### Clinical modules
- Stage 1–10 regression PASS
- clinical tests 148
- ultrasound views 131
- clinical quiz questions 294

### Ultrasound / license
- ultrasound IDs 131/131, missing 0, duplicate 0
- metadata incomplete 0
- embedded reusable media 5: explicit reuse terms + attribution
- reference-only/link-only 126: redistribution rights를 앱이 추정하지 않음
- generated B-mode substitute 0
- 모든 media audit 파일에 Stage 11 license policy 적용

### Knowledge graph / app
- relationships 1,789
- orphan 0
- relationship type mismatch 0
- duplicate relationship ID 0
- duplicate relationship edge 0
- JavaScript syntax PASS
- PWA id/start_url/scope/fullscreen + standalone fallback PASS
- PHI boundary PASS
- machine-readable report: data/global-qa-stage11-v1.json

### 수동 확인 항목
- Android 설치형 PWA가 실제 기기에서 주소창 없이 fullscreen으로 열리는지 최종 물리 확인은 사용자 실기기에서 수행 필요.
- 앱/Chrome 데이터 임의 삭제는 하지 않는다.

### 다음 공식 단계
Stage 12 — OrthoOS Read-only Integration Contract.
Muscle Atlas repo/runtime/DB는 독립 유지하며, versioned read-only contract/fixture/API shape만 정의한다. PHI는 Atlas에 들어오지 않는다.
