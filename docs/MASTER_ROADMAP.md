# Muscle Atlas → LYS OrthoOS 전신 개발 Master Roadmap

최초 시행일: 2026-09-24
최종 재정렬: 2026-09-25
정본 상태: Stage 0–12 COMPLETE / Stage 13 Android TWA COMPLETE / Stage 14 Play submission pack PREPARED
통합 원칙: Muscle Atlas는 독립 학습 앱으로 유지하면서 동일 MSK Knowledge Core를 LYS OrthoOS가 read-only 방식으로 재사용한다.

## 현재 정본 요약

| 영역 | 현재 상태 |
|---|---|
| Canonical anatomy | 205 muscles / O·I·F·N 820/820 |
| Clinical modules | Stage 1–10 COMPLETE |
| Oral Viva | Real Viva Pro COMPLETE |
| Patient Education | 205/205 assignment / 독립 탭 / A4·부위별 매뉴얼 |
| Ultrasound | 131 canonical views / source·figure·license audit 131/131 / generated B-mode 0 |
| Global QA | Stage 11 COMPLETE |
| OrthoOS | Stage 12 read-only contract v1 COMPLETE / no PHI |
| Android | Stage 13 TWA / API 36 / release AAB build PASS |
| Google Play | Stage 14 submission pack PREPARED / 실제 Console 제출은 미완료 |

### 현재 실제 미완료
- 설치형 PWA/TWA의 실기기 fullscreen·자동업데이트 end-to-end 검증
- 환자 운동 그림을 개념 SVG에서 임상교육용 고품질 도해로 고도화
- 131 ultrasound view의 probe-position 도해 및 공개 재사용 가능 실영상 지속 강화
- Google Play account/signing/root Digital Asset Links/Data Safety/internal test/production submission

### 다음 정본 로드맵
새 기능 개발은 `docs/NEXT_UPGRADE_ROADMAP.md`를 따른다.
현재 release 전 필수 순서는 **Stage 23A Full Hierarchical Navigation 3.0 → Stage 23B Patient Exercise Illustration 3.0 → Stage 23C Integrated Real Device & Visual Gate → Stage 24 Google Play Production Release**다.
Stage 23A가 기반 UX이므로 먼저 닫고, 운동 일러스트 고도화는 그 구조가 고정된 뒤 통합해 재작업을 줄인다.

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

## 아이디어 통제 및 로드맵 편입 원칙
- 사용자 피드백/아이디어는 즉시 구현하지 않고 먼저 정본 Idea Register에 기록한다.
- 좋은 아이디어는 구현이 미뤄져도 삭제하지 않는다. queued/deferred/superseded 상태와 이유를 남긴다.
- 선행 구조를 고쳐야 후속 작업 재작업이 줄어드는 경우 구조 작업을 우선한다.
- 한 시점에 하나의 주 작업선만 진행한다. 병렬 아이디어는 backlog로 유지한다.
- 중요도는 Release blocker / High / Medium / Later로 분류한다.
- UX 기반 구조 → 콘텐츠 품질 → 실기기 통합 QA → Production 순서를 기본 원칙으로 한다.
- 자동 QA PASS만으로 사용자 시각검수나 실기기 검수를 대체하지 않는다.

현재 사용자 아이디어 정본:
- 모든 탭을 목차 → 하위목록 → 상세 → 심화 독립 화면 drill-down 방식으로 통일
- 같은 화면 아래쪽에 하위 콘텐츠가 생겨 스크롤로 찾는 패턴 제거
- 각 단계에 뒤로가기 / 상위목차 / breadcrumb 제공
- 환자 운동·스트레칭의 개념형 SVG를 전문 환자교육 수준 일러스트로 전면 고도화
- 앱 실행/재개 자동 업데이트 + 홈 pull-to-refresh 업데이트는 v11.37에서 구현 완료

---
## 개발 운영
- 개발은 dev branch에서 한다.
- 정본 Stage 12 dev branch: `dev/stage12-readonly-integration-20260925`. 과거 stage11/stage12 divergent branch는 참고용이며 merge하지 않는다.
- 회귀검사 PASS는 Preview 승격 조건이지 main 병합 조건이 아니다.
- 모든 진행 개발은 장기 branch `preview/development`에 누적하고 Cloudflare Branch Preview에서 반복 검수한다.
- 개별 기능/도해 배치가 승인되어도 main/Production으로 병합하지 않는다.
- 전체 개발이 완료되고 더 이상 개발할 항목이 없다고 확인된 뒤, 의장님의 명시적 `Production 승격` 승인 시에만 `preview/development`를 main으로 승격한다.
- main은 설치형 학습 앱의 stable Production release다. GitHub Pages는 fallback으로 유지한다.
- 다음 개발 세션은 위 표에서 가장 앞의 미완료 단계부터 재개한다.
- 일정 변경 시 이유와 새 목표일을 ROADMAP에 기록하며, 완료 기준 자체는 낮추지 않는다.

## 현재 단계
- Stage 0–10: COMPLETE
- L1 Oral Viva / L2 Patient Education: COMPLETE (지속 evidence refresh 제외)
- Stage 11 Global QA: COMPLETE
- Stage 12 OrthoOS Read-only Integration Contract v1: COMPLETE
- Stage 13 Android TWA / API 36 / AAB build: COMPLETE
- Stage 14 Google Play submission policy pack: PREPARED, 실제 Play Console 제출 전
- Stage 15 Reliable Auto-Update Engine: DEV COMPLETE / automated QA PASS
- 사용자 실사용 피드백 반영: 계층형 화면 전환 → 근육 대표도해 → 사람 같은 Oral 음성 순으로 우선순위 재정렬
- Stage 16 Hierarchical Navigation 2.0: DEV COMPLETE / automated QA PASS
- Stage 17 Muscle Illustration Quality Audit: PREVIEW COMPLETE — Production main 114/205 reviewed, 91 pending; `preview/development` 205/205 final decisions = 177 fixed representative views + 28 documented source gaps, pending 0; Production promotion deferred
- Cloudflare Preview/Production infrastructure: ACTIVE — GitHub integration verified; `preview/development` is the long-lived development line; repeated visual approval occurs in Preview; Production remains frozen until final explicit promotion
- Stage 18 Oral Viva Human Voice 3.0: IN PROGRESS — local voice + contextual viva complete; provider-neutral same-origin high-quality TTS adapter/contract prepared but disabled by default pending provider/privacy/real-device approval
- Stage 19 Patient Exercise Illustration 2.0: DEV COMPLETE / automated QA PASS — 19/19 profile audit; 18 actionable two-phase education diagrams + px099 evidence boundary; final Preview visual check remains release gate
- Stage 20 Ultrasound Atlas 2.0: DEV COMPLETE / automated QA PASS — 131/131 probe guidance + landmarks + pitfall taxonomy; 5 reusable actual-ultrasound assets embedded, 9 permissive candidates held until stable direct asset URL, 117 reference-only; 55/55 source URLs healthy, broken 0; generated B-mode prohibited
- Stage 21 Clinical Learning Flow 2.0: IN PROGRESS — symptom→anatomy→differential→exam→ultrasound→fixed-muscle quiz→viva→education common flow implemented across all 10 clinical modules with ultrasound-first module routing and region fallback
- 현재 개발: **Stage 23A — Full Hierarchical Navigation 3.1 (A6 CLOSED / USER PROCEED AUTHORIZED · A7 AUTOMATED PASS / USER PREVIEW VERIFY PENDING)**
- 다음: **Stage 23B Patient Exercise Illustration 3.0 → Stage 23C Integrated Real Device & Visual Gate → Stage 24 Google Play Production Release**

> 아래 v7.x~v9.x의 “다음” 문구는 당시 시점의 개발 이력이다. 현재 정본 순서는 위 상태표와 `NEXT_UPGRADE_ROADMAP.md`가 우선한다.


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
- [x] 친구 / 동료 / 선배 / 대가 4단계
- [x] O/I/F/N + 기능추론 + 촉진/MMT + 임상/증상 + 초음파 + reverse identification
- [x] Web SpeechRecognition 지원 기기에서는 마이크 답변
- [x] 음성인식 미지원 시 동일 textarea 입력 fallback
- [x] 질문/교정 feedback SpeechSynthesis 읽기
- [x] 정답 / 부분정답 / 틀림 즉시 표시
- [x] 빠진 핵심과 canonical answer를 바로 제시
- [x] 정답 채점은 Atlas 내부 핵심어 비교로 수행. 음성→텍스트 변환은 브라우저/OS SpeechRecognition provider를 사용할 수 있어 사용자 고지
- [x] oral 오답 기록 localStorage 저장
- [ ] OPTIONAL: semantic grader는 API key를 앱에 넣지 않는 안전한 server-side contract가 생긴 뒤에만 검토한다. 현재 COMPLETE gate 또는 Play 출시 blocker가 아니다.

### L2. 환자교육 스트레칭·강화운동
- [x] canonical 205 muscles 전부 assignment 생성
- [x] 부위 → 근육 → 스트레칭/가동성 → 강화/motor-control 계층
- [x] 근거등급 A / B / C 분리
- [x] 직접 근거가 없으면 '개별 단독 protocol 미확립'으로 표시
- [x] 문헌 source 링크와 적용범위 표시
- [x] 수술 후/급성파열/진행성 신경학적 이상/심폐 red flag 안전문구
- [x] 2025 rotator cuff CPG, 2024 Achilles CPG, 2023 plantar heel pain CPG, 2021 LBP/ankle CPG, 2019 PFP CPG, 2018 gluteal tendinopathy RCT, 2017 neck CPG 등을 초기 근거축으로 사용
- [x] Stage 9~10 개발에서 요추·천추 / 복벽·몸통 심부 교육 근거 확장
- [x] Stage 11에서 205개 전체 assignment/source/evidence reference 무결성 재검증
- 지속 과제: 새 CPG/RCT/체계적 고찰은 Evidence & Media Refresh 운영 트랙에서 갱신

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
- grading backend/API 없음; microphone transcription은 browser/OS speech provider를 사용할 수 있어 개인정보 고지에 명시

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
- Stage 11에서 기존 symptom relationship 20개의 endpoint type을 `symptom_pattern`으로 정규화
- 요추 quiz ID를 `lsq001–lsq030`으로 namespace 수정하여 전신 clinical quiz ID 294/294 unique
- duplicate relationship ID 0
- duplicate relationship edge 0
- JavaScript syntax PASS
- PWA id/start_url/scope/fullscreen + standalone fallback PASS
- PHI boundary PASS
- machine-readable report: data/global-qa-stage11-v1.json
- automated QA: scripts/global-qa.mjs + .github/workflows/global-qa.yml

### 수동 확인 항목
- Android 설치형 PWA가 실제 기기에서 주소창 없이 fullscreen으로 열리는지 최종 물리 확인은 사용자 실기기에서 수행 필요.
- 앱/Chrome 데이터 임의 삭제는 하지 않는다.

### 다음 공식 단계
Stage 12 — OrthoOS Read-only Integration Contract.
Muscle Atlas repo/runtime/DB는 독립 유지하며, versioned read-only contract/fixture/API shape만 정의한다. PHI는 Atlas에 들어오지 않는다.


## v9.2 Real Viva + 환자교육 UX — 2026-09-25
상태: DEV COMPLETE / Stage 11 재회귀검사 대상

### 앱 이름
- [x] PWA/브라우저 표시 이름을 `이윤석정형외과 근육`으로 통일
- [x] manifest name/short_name 변경

### Oral Viva 2.0
- [x] O/I/F/N 단독 암기형에서 다영역 viva로 확장
- [x] 기시·정지·신경 / 기능·움직임 / 촉진·MMT / 증상·감별 / 초음파 / reverse identification
- [x] 친구 / 동료 / 선배 / 대가 4개 examiner persona
- [x] examiner별 질문 어투 및 정답·부분정답·오답 반응 차등
- [x] 오답 시 누락 핵심 + 정본답 + 왜 중요한지 teaching point 제공
- [x] '한 단계 더' follow-up teaching prompt
- [x] 증상/진단/초음파 연결은 Knowledge Core Stable ID relationship에서 동적으로 생성
- [x] 채점은 Atlas 내부에서 수행. 단, SpeechRecognition transcription은 브라우저/OS 제공자의 서비스가 처리할 수 있음을 사용자에게 고지

### 환자 운동·스트레칭
- [x] 상단 독립 탭으로 승격
- [x] 홈에서 환자용 바로가기 제공
- [x] 환자 친화적 설명 순서: 부위 → 근육 → 방법 → 용량 → 주의사항
- [x] 각 profile에 print-safe vector 동작 개념도 표시
- [x] 근육별 운동표 A4 인쇄 기능
- [x] 운동별 주의사항과 전체 stop/reassessment red flag
- [x] 의료진용 evidence level/source는 접어서 별도 표시
- [x] 실제 환자용 도해는 print-safe SVG 개념도로 18개 actionable profile 전부 연결
- [ ] 임상사진 수준의 세부 동작 도해는 출처/저작권 또는 자체 제작 검수 후 단계적으로 교체

### Ultrasound 지속 업데이트 정책
- 실제 공개 초음파/B-mode 또는 정당한 open-access figure만 사용
- license/attribution/figure context 확인 후 추가
- 생성형 초음파를 실제 영상처럼 사용하지 않음
- 기존 canonical view보다 교육성이 명확히 좋아지는 경우에만 교체/추가


## v9.3 Real Viva Pro + Patient Manual + Ultrasound Refresh
상태: COMPLETE / Stage 11 재회귀 PASS — 2026-09-25

### Oral Viva Pro
- [x] O/I/F/N 외 기능추론·촉진/MMT·증상·감별·초음파·reverse 질문 유지
- [x] 같은 부위 근육 비교 질문 추가
- [x] 임상 시나리오 질문 추가
- [x] 초음파 landmark 질문 추가
- [x] 친구·동료·선배·대가별 질문/정답/부분정답/오답 반응 다양화
- [x] 답변 후 같은 근육을 더 파고드는 실제 꼬리질문 flow 추가

### 환자 운동·스트레칭
- [x] 독립 상단 탭 및 홈 바로가기 유지
- [x] 쉬운 환자 설명 + 운동별 주의사항 유지
- [x] 근육별 그림 운동표 A4 인쇄 유지
- [x] 부위별 공통 운동을 중복 제거해 한 번에 인쇄하는 매뉴얼 추가
- [x] 인쇄물 주간 실천 체크칸 추가

### Ultrasound continuous refresh
- [x] Knee PLC usv051을 2024 dedicated pictorial review Figure 5로 우선 reference 승격
- [x] Peroneal usv059에 2025 CC BY retromalleolar anatomy reference 추가
- [ ] 향후 새 공개·검증 B-mode/dynamic source가 더 우수할 때만 기존 reference를 승격/교체
- [ ] generated ultrasound / fake B-mode는 계속 금지

### 배포 게이트
- [x] Global QA static revalidation PASS
- [x] PR CI Global QA PASS — final head run 36115053787
- [x] PR #23 → main
- [x] main Global QA PASS — run 36115111877
- [x] Pages SUCCESS — run 36115110890


## v9.4 Stage 11 재검증 — Real Viva Pro / Patient Manual / Play Readiness
상태: DEV QA PASS — 2026-09-25

- [x] canonical muscle 205 / O-I-F-N 820/820
- [x] Oral Viva Pro: anatomy/function/exam/clinical/ultrasound/comparison/scenario/reverse/master
- [x] 친구·동료·선배·대가 examiner 반응 + same-muscle follow-up
- [x] Patient Education 205/205
- [x] 환자 독립 탭 + 홈 바로가기 + 쉬운 설명 + 운동 중단 주의사항
- [x] 근육별 A4 인쇄 + 부위별 공통 운동 인쇄 + 주간 체크칸
- [x] Stage 1–10 clinical module regression PASS
- [x] actual ultrasound 131/131, unverified 0
- [x] media source/figure/license metadata 131/131
- [x] Stable ID duplicate 0 / orphan 0
- [x] JavaScript / PWA / PHI boundary PASS
- [x] 앱 이름: 이윤석정형외과 근육
- [x] 환자 화면 비의료기기·진단치료 비대체·의료전문가 상담 고지
- [x] Privacy Policy 의료전문가 상담 고지
- [x] Google Play 2026: API36 / AAB / Health declaration / Data Safety 계획 재검증
- [x] GitHub Actions Global QA PASS — PR final head run 36115053787
- [x] main merge — v9.4 payload SHA d40c7a51fdf51ffd0b5522a71984a44efce2ac15
- [x] Pages SUCCESS — run 36115110890

다음 공식 개발: Stage 12 — OrthoOS Read-only Integration Contract.


## Stage 12 완료 기록
완료일: 2026-09-25
상태: COMPLETE — OrthoOS Read-only Integration Contract v1

- [x] 정본 dev branch를 `dev/stage12-readonly-integration-20260925`로 단일화
- [x] 과거 divergent Stage 11/12 branch는 참고용으로 격리, wholesale merge 금지
- [x] contract_version 1.0.0 / status stable_v1
- [x] schema_version 1.0.0 / Knowledge Core dataset 2026.09.25-j pin
- [x] Patient Education dataset 2026.09.25-c pin
- [x] Stage 11 QA 2026.09.25-stage11-v2 pin
- [x] Media audit 2026.09.25-v9.3 pin
- [x] GET-only static read-only bundle
- [x] POST / PUT / PATCH / DELETE 금지
- [x] Stable-ID entity lookup / relationship lookup fixture
- [x] diagnosis concept = general-knowledge candidate only
- [x] clinical finding/test = 지식 정의만 제공, patient observed/performed status 추론 금지
- [x] patient laterality 추론 금지
- [x] PHI / patient / encounter context 금지 및 rejection fixture
- [x] OrthoOS가 patient-specific confirmation과 canonical patient data를 소유
- [x] integration-contract-qa.mjs 자동검사
- [x] 기존 Global QA workflow에 Stage 12 QA 연결
- [x] first PR contract gate run 36117428765 PASS

### 통합 경계
Muscle Atlas repo/runtime/data는 OrthoOS와 합치지 않는다.
Stage 12는 versioned read-only knowledge contract만 제공하며 실제 환자 workflow는 OrthoOS Clinical Integration Layer가 소유한다.


---

## Stage 13 완료 기록 — Android TWA Release Shell
완료일: 2026-09-25
상태: COMPLETE

- [x] Trusted Web Activity Android shell
- [x] provisional applicationId `kr.co.lysortho.muscle`
- [x] targetSdk / compileSdk 36
- [x] HTTPS-only
- [x] native RECORD_AUDIO permission 없음
- [x] release AAB 실제 CI build PASS
- [x] Android TWA QA workflow
- [ ] Play App Signing fingerprint 기반 root Digital Asset Links — 외부 signing/origin 의존
- [ ] 실제 Android 기기 toolbar-less TWA 확인 — Stage 21에서 수행

## Stage 14 완료 기록 — Google Play Submission Pack
완료일: 2026-09-25
상태: PREPARED / NOT SUBMITTED

- [x] Store listing 초안
- [x] Health Apps 사전 분류
- [x] Data Safety 사전평가
- [x] Privacy / medical disclaimer 정렬
- [x] 조직계정·signing·DAL·asset 요구사항 정리
- [x] submission pack 자동 QA
- [ ] Play Console 실제 앱 생성/제출
- [ ] signing / root assetlinks / physical device / Data Safety voice 분류
- [ ] screenshots / feature graphic / internal test / production review

## 다음 업그레이드 정본
`docs/NEXT_UPGRADE_ROADMAP.md`

우선순위:
1. Stage 15 Reliable Auto-Update Engine — DEV COMPLETE, physical verification deferred to Stage 23
2. Stage 16 Hierarchical Navigation 2.0 — DEV COMPLETE
3. Stage 17 Muscle Illustration Quality Audit — PREVIEW COMPLETE
4. Stage 18 Oral Viva Human Voice 3.0 — local/contextual DEV COMPLETE, remote provider activation deferred
5. Stage 19 Patient Exercise Illustration 2.0 — DEV COMPLETE
6. Stage 20 Ultrasound Atlas 2.0 — DEV COMPLETE
7. Stage 21 Clinical Learning Flow 2.0 — DEV COMPLETE / automated QA gate
8. Stage 22 Search & Personal Learning 2.0 — DEV COMPLETE / automated QA PASS
9. Stage 23 Real Device & Offline Quality Gate — DEV / automated gate COMPLETE, physical verification PENDING
10. Stage 24 Google Play Production Release


---

## Stage 21 완료 기록 — Clinical Learning Flow 2.0
완료일: 2026-09-27
상태: **DEV COMPLETE — Preview only / Production 미승격**

- [x] symptom → anatomy → differential → examination → ultrasound → quiz → Oral → patient education 8단계 공통 흐름
- [x] `learningFlowContext`: symptom_id / muscle_id / clinical module / canonical ultrasound_view_id / source page 문맥 유지
- [x] muscle → clinical module은 canonical ultrasound view를 1순위로 사용하고 해부학 region은 fallback으로만 사용
- [x] muscle 자체뿐 아니라 parent tendon의 `target_structure_ids`를 추적해 canonical ultrasound view를 해석
- [x] 임상검사 148개를 목적 / 방법 / 양성 기준 / 해석 / 한계·흔한 오류 / Stable ID 형식으로 통일
- [x] 10개 differential module의 safety_rule을 Red flag / 안전 경계로 독립 표시
- [x] diagnosis supporting clue(`look_for`)와 opposing/limiting clue(`not_diagnostic_alone`)를 분리 표시
- [x] tendon / nerve / joint / bursa / ligament / fascia Stable ID 기반 빠른 이동
- [x] clinical_test_id / diagnosis_concept_id / ultrasound_view_id 기반 카드 focus navigation
- [x] symptom overlay에서 선택한 근육 문맥을 anatomy·clinical·quiz·Oral·education까지 보존
- [x] 페이지 이동 시 muscle/symptom overlay 및 body overflow 정리
- [x] 환자별 진단·치료 자동 권고 금지 및 PHI/encounter context 미사용
- [x] Stage 21 전용 regression QA를 Global QA workflow에 유지
- [ ] 실제 Preview 화면 시각검수는 사용자 승인 전까지 별도 미완료로 유지

다음 개발 시작점: **Stage 23 — Real Device & Offline Quality Gate**

Production `main`은 사용자 명시 승인 전까지 동결한다.


---

## Stage 22 완료 기록 — Search & Personal Learning 2.0
완료일: 2026-09-27
상태: **DEV COMPLETE / AUTOMATED QA PASS — Preview only / Production 미승격**

- [x] 통합검색: 한글 / 영문 / 약어 / Stable ID
- [x] entity type filter: 12개 canonical entity 계층
- [x] 최근 본 항목: Stable ID + last-view timestamp만 local 저장
- [x] 즐겨찾기: Stable ID 기반 local-only
- [x] Quiz wrong/due + Oral wrong/partial을 합친 취약근육 자동 모음
- [x] 부위별 학습지표: coverage + 학습기록 performance 기반, 실제 숙련도·임상역량 평가가 아니라 앱 내 학습지표로 명시
- [x] 학습기록 export/import 허용목록: Quiz 수치, Oral grade/score/level, favorites/recent Stable ID
- [x] export/import에서 자유서술 답변·음성 원문·환자/encounter 식별정보 제외
- [x] 외부 서버 동기화 없음 / localStorage 기본
- [x] Stage 22 QA를 Global QA workflow에 추가
- [ ] Preview 실제 화면 시각검수는 사용자 승인 전까지 미완료

다음 개발 시작점: **Stage 23 — Real Device & Offline Quality Gate**

Production `main`은 사용자 명시 승인 전까지 동결한다.


---

## Stage 23 진행 기록 — Real Device & Offline Quality Gate
개발일: 2026-09-27
상태: **DEV / AUTOMATED GATE COMPLETE — Preview only / REAL DEVICE VERIFICATION PENDING**

- [x] 앱 내부 실기기·오프라인 품질 점검 패널
- [x] Chrome / 설치 PWA / TWA runtime mode 식별
- [x] Service Worker `GET_CACHE_STATUS` — CORE cache total/cached/missing 보고
- [x] page / active worker version 일치 확인
- [x] localStorage sentinel round-trip — 기존 Quiz/Oral 기록을 지우지 않고 저장소 검사
- [x] Quiz/Oral persistence JSON 무결성 검사
- [x] home icon 192/512 + fullscreen manifest contract 검사
- [x] representative illustration 205개 최종결정 audit 검사
- [x] canonical ultrasound 131 view 검사
- [x] 360px / landscape / touch-target / horizontal-overflow 진단
- [x] 환자교육 Web Share 추가 + clipboard fallback + 기존 print 유지
- [x] 공유 payload는 일반 교육 텍스트만 사용하며 patient/encounter 식별정보 없음
- [x] 실기기 수동 Gate 7개 항목을 local-only PASS/FAIL/pending으로 기록
- [x] `docs/REAL_DEVICE_OFFLINE_QA.md` — Chrome/PWA/TWA 차이와 수동 검수 절차
- [x] `scripts/real-device-offline-qa.mjs` + Global QA 연결
- [x] Stage 15~23 전체 automated regression PASS
- [ ] 실제 Android offline cold start / online recovery
- [ ] 실제 Oral microphone / TTS
- [ ] 실제 환자교육 print/share
- [ ] 실제 회전 / 작은화면 / 큰글자
- [ ] 실제 Preview 사용자 시각승인
- [ ] TWA toolbar-less — Play signing fingerprint + origin-root Digital Asset Links 필요

Stage 24 Production Release는 위 실기기 gate와 사용자 명시 승인 전까지 진행하지 않는다.

Production `main`은 사용자 명시 승인 전까지 동결한다.


---

## 2026-09-27 사용자 실사용 피드백 재정렬

### Stage 23A — Full Hierarchical Navigation 3.0 — NEXT
- 전 탭 공통 drill-down 화면 구조
- 해부학을 기준 구현으로 먼저 완성
- 환자교육 → 증상 → 임상 → 초음파 → 퀴즈 → Oral → 내 학습 → 홈/검색 순으로 확장
- 동일 화면 아래 append 방식 제거
- view-state/history/back/breadcrumb 공통화

### Stage 23B — Patient Exercise Illustration 3.0 — QUEUED
- Stage 19 개념형 SVG는 final quality 아님
- 18 actionable profile 전수 고품질 재도해
- 손/손가락/상지/하지 비율, 시작/끝 자세, 움직임/지지점 개선
- 환자에게 인쇄·공유 가능한 임상교육 수준을 완료 기준으로 사용

### Stage 23C — Integrated Real Device & Visual Gate — QUEUED
- 23A/23B 이후 실제 Android에서 통합 검수
- offline/update/mic/TTS/print/share/rotation/large-text/data persistence
- 사용자 Preview 최종 승인

### Stage 24 — Google Play Production Release
- Stage 23C 완료 전 시작하지 않음
- Production main은 사용자 명시 승인 전까지 동결


### Stage 23A 진행 기록 — 2026-09-27
- A1 공통 drill navigation shell / view-state / history helper COMPLETE
- A2 해부학 4단계 독립 화면 전환 COMPLETE
- 흐름: 해부학 부위 → 해당 부위 근육 → 근육 학습목차 → 선택 심화내용
- 심화 항목: 기본정보 / 해부도해 / 초음파 / 임상 / 심화·학습
- 각 단계 viewport top reset, hierarchy back, browser/Android history 복원 계약 구현
- Stage 16 legacy QA + Stage 23A navigation 3.0 QA PASS
- Preview version: v11.38 · Hierarchical Navigation 3.0
- 다음 작업: A3 환자 운동·스트레칭 계층화


### Stage 23A A3 환자교육 계층화 COMPLETE — 2026-09-27
- 흐름: 부위 목차 → 해당 부위 근육 → 선택 근육의 운동 목차 → 선택 운동 1개 상세
- 근육 선택 직후 모든 운동카드를 세로로 길게 붙이던 구조 제거
- 운동 상세 화면에는 선택한 profile 하나만 표시
- browser/Android back + 내부 back + history 복원 계약 추가
- 전체 근육 운동표 인쇄 / 부위별 인쇄 / 공유 기능 유지
- 환자 의료기기 아님·의료전문가 상담 안전문구 유지
- Stage 15~23A 전체 QA PASS
- Preview version: v11.39 · Hierarchy A1-A3
- 다음 작업: A4 증상으로 찾기 계층화


### Stage 23A A4 증상으로 찾기 계층화 COMPLETE — 2026-09-27
- 흐름: 증상군 목차 → 증상 목록 → 증상 학습목차 → 선택한 상세
- 증상 상세의 modal overlay를 주 탐색경로에서 제거
- 상세 목차: 감별·병리 / 관련 근육 / 신경·구조 / 초음파 시작점 / 학습 흐름
- 홈 빠른진입·검색·임상 학습흐름에서 특정 증상 직접 진입 시에도 동일한 drill 구조 사용
- 직접 진입 시 해당 증상 목록 history를 먼저 seed하여 내부 뒤로가기가 목록으로 복귀
- 선택 근육의 symptom_id + muscle_id 문맥 유지
- Stage 21 기존 학습흐름 QA와 Stage 23A navigation 3.0 QA 모두 PASS
- Preview version: v11.40 · Hierarchy A1-A4
- 다음 작업: A5 임상 모듈 계층화


### Stage 23A A2 REOPENED — 실기기 흰 화면 회귀 — 2026-09-27
- 사용자 재현: 홈 → 해부학 위치 찾기 → 경추/상지/견갑대 등 부위 선택 → 근육 목록 대신 흰 화면
- 자동 QA PASS였지만 실제 runtime 경로 FAIL이므로 A2 완료판정 철회
- A5 임상 계층화는 A2 root-cause 해결 전까지 BLOCKED
- 임시 CSS/timeout/조건문 patch 금지
- 실제 click 기반 browser E2E를 새 gate로 추가한 뒤 공통 navigation 구조에서 원인 해결
- 실제 Preview 확인 전 A2를 다시 COMPLETE로 표시하지 않음


### Navigation Root Fix — v11.41 — 2026-09-27
- Root cause: drill screen registry selector와 documentElement의 runtime state dataset이 같은 data-drill-* namespace를 공유
- 두 번째 drill 전환에서 html이 screen으로 오인되어 html.hidden=true가 됨
- 증상: 내부 근육 DOM은 정상 생성되나 문서 전체가 숨겨져 흰 화면
- 해결: screen registry를 .drill-screen[data-drill-group]로 한정하고 runtime state를 drillNavigationState로 분리
- documentElement는 data-active-drill-*만 진단용으로 사용
- Playwright E2E를 Global QA에 추가하여 실제 클릭 기반 회귀검사 상시 실행
- 14개 해부학 부위 → 근육 목록 → 첫 근육 → v11.14 기본정보 상세 → back 전수 PASS
- 정적 QA PASS + runtime E2E PASS
- 사용자 실기기 Preview 확인 전 A2 COMPLETE 처리 금지


### v11.14 Anatomy UX Baseline — LOCKED — 2026-09-27
- 사용자 검증 기준: v11.14 · Stage 17 Precision Anatomy
- 보존 요소: 개별 근육 헤더 + 가로 탭 5개(기본정보 / 해부도해 / 초음파 / 임상 / 심화·학습) + 기본정보 즉시 표시
- Navigation 3.1은 `부위 → 근육 목록 → 근육 상세`까지만 독립 화면 전환을 담당
- 근육 상세 내부 탭은 v11.14처럼 **같은 상세 화면에서 콘텐츠만 교체**하며 별도 deep 화면/history 계층을 만들지 않음
- 세로형 drill-menu 카드 또는 별도 학습목차 허브로 대체 금지
- Static QA + Playwright runtime E2E에 기준선 검사 추가
- 실제 Preview 사용자 확인 전 A2 COMPLETE 처리 금지


### v11.44 · v11.14 Anatomy Restored — 2026-09-28
- v11.14 Stage 17 Precision Anatomy를 개별 근육 상세 UX의 코드 기준선으로 재적용
- 부위 → 근육 목록 → 근육 상세까지만 독립 view
- 근육 상세는 v11.14 고정 가로 탭 5개 + 기본정보 즉시 표시
- 탭 내부 전환은 same-screen content swap, history push 0, extra deep view 0
- 후속 기능은 기준 레이아웃을 깨지 않는 범위에서만 유지
- Global QA + Chromium runtime E2E PASS
- 사용자 실기기 Preview 확인 전 A2 COMPLETE 금지

### v11.45 · v11.14 Anatomy Contract Lock — 2026-09-28
- v11.14 기준 DOM/기본정보 레이아웃 재대조 PASS
- Runtime E2E를 14개 해부학 부위 × 5개 상세 탭 전수 클릭으로 강화
- 모든 상세 탭 전환에서 same-screen 유지 / content non-empty / history.length 증가 0 검증
- 실제 browser back 2회로 근육 상세 → 근육 목록 → 해부학 부위 복귀 검증
- Cloudflare Branch Preview 배포 SUCCESS
- 라이브 Preview 경추·후두하부 → 흉쇄유돌근 실제 클릭 검수 PASS
- 사용자 실기기 Preview 확인 완료 — 2026-09-28
- A2 COMPLETE. 다음 개발 작업선은 A5 임상 모듈.

### v11.46 · Stage 23A A5 Clinical Drilldown 3.1 — 2026-09-28
- 임상 탭의 10개 모듈 세로 누적 UI를 공통 drill navigation으로 교체
- 임상 모듈 → 감별/진찰/초음파 → 세부항목 목록 → 단일 상세의 4단계
- 148 clinical tests / 131 ultrasound views / differential Stable ID와 기존 media audit 보존
- browser back 의미를 각 상위계층과 일치
- 기존 Clinical Learning Flow의 differential/exam/ultrasound 직접 진입을 A5 hierarchy로 재연결
- Global QA SUCCESS
- Runtime E2E 10개 모듈 전수 SUCCESS
- Cloudflare Preview SUCCESS
- 라이브 Preview 경추 진찰/초음파 실제 클릭 SUCCESS
- 사용자 실기기 Preview 승인 전 A5 COMPLETE 금지
- A6 초음파 독립 계층화는 BLOCKED

### v11.47 · Stage 23A A5 Clinical Direct Route Lock — 2026-09-28
- 임상 Stable ID 검색을 muscle proxy 의존 구조에서 직접 A5 detail route로 전환
- pre-load timing에서도 10개 임상 모듈 보장 로딩 후 Stable ID route 재해석
- Runtime E2E를 10개 모듈의 상세 필수필드 계약까지 강화
- ct082 / d089 / usv074 통합검색 직접 진입 browser E2E PASS
- m001 근육 임상흐름 → A5 상세 문맥 유지 PASS
- Global QA + Runtime E2E + Cloudflare Preview + Live Preview PASS
- 2026-09-28 사용자 `다음 작업 진행` 지시로 A5 다음 단계 진입 승인. 별도 A5 실기기 시각 PASS로 오기하지 않음

### v11.48 · Stage 23A A6 Ultrasound Drilldown 3.1 — 2026-09-28
- 독립 top-level 초음파 탭 신설
- 계층: 10개 부위/구조 → canonical view 목록 → 단일 view 상세
- canonical ultrasound 131개 source of truth 유지
- 각 부위에 view 수 + 연결 target structure 수/요약 표시
- 상세 renderer는 A5 canonical ultrasound detail과 공유하여 중복 구현 방지
- 기존 v11.14 해부학 근육 상세의 초음파 가로탭은 보존
- 기존 A5 임상 초음파 경로도 보존
- browser back: 상세 → view 목록 → 부위/구조
- Stage 15~23A static QA PASS
- Playwright Runtime E2E: 10개 부위 전수 / 첫 view 상세 필수필드 / 총 131 canonical view PASS
- Cloudflare Preview 배포 PASS
- TinyFish 미사용. 자동 browser 검증은 GitHub Actions Playwright E2E로 고정
- 2026-09-28 사용자 `진행해` 지시로 A6 다음 단계 진입 승인. 별도 A6 실기기 시각 PASS로 오기하지 않음
- A7은 자동 QA/Preview 배포 완료. 사용자 시각 확인 또는 명시적 다음 단계 진행 승인 전 COMPLETE 처리 금지

### v11.49 · Stage 23A A7 Quiz Drilldown 3.1 — 2026-09-28
- 퀴즈 UI를 setup / session / result 3개 독립 drill screen으로 분리
- 기존 문제은행, `mskQuizProgressV2`, 오답은행, due/streak/nextDue 로직 보존
- 일반·오답·오늘복습·근육집중·10개 임상모듈을 공통 session renderer로 통합
- result에서 점수/정답률/이번 오답 근육을 별도 표시
- terminal result history replace → browser back은 설정 화면
- Stage 15~23A static QA SUCCESS
- Playwright 일반 퀴즈 full session + 결과 + browser back SUCCESS
- Playwright 경추 임상 퀴즈 common session SUCCESS
- Cloudflare Preview SUCCESS
- TinyFish 미사용
- A8 Oral 계층화는 A7 사용자 확인 또는 다음 단계 진행 승인 전 BLOCKED
