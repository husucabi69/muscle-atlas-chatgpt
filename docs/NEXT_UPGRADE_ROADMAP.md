# LYS Ortho Muscle Atlas — Next Upgrade Roadmap

기준일: 2026-09-25  
앱 이름: 이윤석정형외과 근육  
정본 원칙: Stage 1–12 기능 완성을 유지하고, 새 기능보다 설치 앱 신뢰성·교육 품질·초음파 시각화·실기기 검증을 우선한다.

## 0. 현재 기준선

- Canonical muscles: 205
- O/I/F/N: 820/820
- Clinical tests: 148
- Ultrasound views: 131
- Clinical quiz: 294
- Patient Education assignment: 205/205
- Knowledge relationships: 1,789 / orphan 0
- Oral Viva Pro: anatomy / function / exam / clinical / ultrasound / comparison / scenario / reverse / master
- OrthoOS integration: read-only v1 / no PHI
- Android TWA shell: API 36 / release AAB build PASS
- Play Console: submission pack prepared, actual submission not yet complete

## 개발 우선순위 원칙

1. 설치된 앱이 새 배포를 확실히 받는가
2. 환자가 그림만 보고도 운동을 따라 할 수 있는가
3. 의사가 초음파 landmark와 실제 영상을 빠르게 학습할 수 있는가
4. Oral Viva가 실제 선배·동료·대가와 문답하는 수준으로 깊어지는가
5. 모든 변경이 기존 205근육·임상모듈·PHI 경계를 깨지 않는가
6. 실기기와 Google Play에서 동일하게 동작하는가

---

# Stage 15 — Reliable Auto-Update Engine

상태: **DEV COMPLETE / AUTOMATED QA PASS — 2026-09-25**  
실제 Android 설치 앱의 end-to-end 확인은 Stage 21 Real Device Gate에서 최종 수행한다.

목표: 홈 화면 아이콘으로 실행한 설치형 PWA/TWA가 최신 stable release를 확실히 확인하고, 데이터 손실 없이 새 버전으로 전환되도록 한다.

## 구현
- [x] 매 release마다 변경되는 단일 APP_BUILD_VERSION 정의 — `app-version.js`
- [x] service worker cache version을 APP_BUILD_VERSION과 동기화
- [x] 앱 실행 시 service worker `registration.update()` 실행
- [x] 새 worker 활성화 시 `controllerchange` 감지
- [x] 현재 화면 무한 reload를 막는 one-shot session guard
- [x] index/navigation을 network-first로 변경하여 stale 고착 차단
- [x] JSON/version/manifest/privacy는 network-first, 기타 정적자원은 stale-while-revalidate로 분리
- [x] 이전 release cache 자동 정리
- [x] localStorage의 quiz/oral 학습기록을 update engine에서 변경·삭제하지 않음
- [x] 앱 화면에 현재 버전·업데이트 상태·수동 “업데이트 확인” 버튼 표시
- [x] update/network 실패 시 기존 stable cache로 계속 사용하는 fallback
- [x] `scripts/auto-update-qa.mjs` 및 Global QA gate 추가

## 자동 완료 Gate
- [x] 기존 Global QA 회귀 PASS
- [x] OrthoOS read-only contract PASS
- [x] Android TWA static QA PASS
- [x] Play submission pack QA PASS
- [x] Stage 15 auto-update contract QA PASS

## Stage 21에서 최종 물리 확인
- [ ] 현재 설치된 pre-Stage15 앱이 Stage15 worker를 받은 뒤 최신 화면으로 전환되는지
- [ ] 이후 새 release에서 아이콘 실행 1회 내 자동 update/reload가 되는지
- [ ] 기존 quiz/oral localStorage 학습기록 보존
- [ ] offline cold start / online 복귀 update
- [ ] update loop 0 / stale index·JSON 재현 0

---

# Stage 16 — Patient Exercise Illustration 2.0

목표: 현재 개념 SVG를 “환자가 설명 없이 보고 따라 할 수 있는” 임상교육용 그림으로 고도화한다.

## 구현
- [ ] 19 patient exercise profile 전수 시각감사
- [ ] actionable profile별 시작자세 / 끝자세를 구분
- [ ] 움직임 방향 화살표
- [ ] 지지점·고정부위·주의할 관절 표시
- [ ] 반복횟수 / 유지시간 / 세트 / 빈도 시각 표시
- [ ] 흔한 잘못된 자세 1개 이상 표시
- [ ] 통증 유발 시 중단·재평가 경계 표시
- [ ] 모바일용 세로 카드와 A4 인쇄용 그림 동시 지원
- [ ] 색 없이 인쇄해도 이해 가능한 선/기호 체계
- [ ] 접근성 alt text / 쉬운 한국어 caption
- [ ] 출처가 필요한 자세는 source metadata 연결
- [ ] 타 기관 그림 복제 금지; 자체 제작 또는 재사용권 명확한 자료만 사용

## 완료 Gate
- 205 muscle assignment → 유효 profile 연결 100%
- actionable profile 그림 누락 0
- A4 print clipping 0
- 모바일 360px 폭에서 의미 손실 0

---

# Stage 17 — Ultrasound Atlas 2.0

목표: 131개 canonical ultrasound view를 “probe 위치 → landmark → 정상 구조 → 실제 영상 → pitfall” 순으로 학습할 수 있게 한다.

## 구현
- [ ] 131 view 전수 교육성 재평가
- [ ] 각 view에 probe placement/orientation 자체 도해 추가
- [ ] 실제 B-mode/dynamic 자료와 probe 도해를 명확히 구분
- [ ] 구조 landmark label layer 추가
- [ ] normal / common pitfall / anisotropy 등 해석 주의점 표시
- [ ] open-access reusable image/video는 가능한 범위에서 앱내 직접 승격
- [ ] redistribution이 불명확한 자료는 reference-only 유지
- [ ] figure / article / license / attribution metadata 재감사
- [ ] 더 좋은 공개 source 발견 시 기존 canonical reference 승격 규칙 적용
- [ ] generated/fake B-mode substitute 계속 금지
- [ ] broken-link 검사와 source health audit 자동화

## 완료 Gate
- canonical view 131/131 source metadata 유지
- unverified media 0
- generated ultrasound substitute 0
- probe-position illustration coverage 131/131
- source/license missing 0

---

# Stage 18 — Oral Viva 3.0

목표: 암기시험이 아니라 실제 동료·선배·대가가 연속으로 파고드는 구술시험 경험으로 고도화한다.

## 구현
- [ ] 세션 단위 문맥 유지
- [ ] 같은 근육에서 anatomy → function → exam → clinical → ultrasound 연속 질문
- [ ] 잘한 답은 짧게 인정하고 다음 단계로 진행
- [ ] 부분정답은 빠진 핵심만 되묻기
- [ ] 오답은 정본답 + 오류 이유 + 즉시 재질문
- [ ] friend / colleague / senior / master persona 문체·난이도·반응 재감사
- [ ] 부위 내 두 근육 비교 viva 확대
- [ ] nerve/tendon/joint를 포함한 구조간 비교
- [ ] 증상 기반 reverse viva 확대
- [ ] 초음파 landmark reverse identification 확대
- [ ] 임상 시나리오 난이도 3단계
- [ ] 최근 오답·약점 기반 spaced repetition
- [ ] 근육/부위별 mastery summary를 local-only로 제공
- [ ] 음성인식 실패 시 입력 fallback의 UX 단순화
- [ ] semantic grader는 API key를 앱에 넣지 않는 안전한 구조가 확보될 때만 선택적으로 검토

## 완료 Gate
- O/I/F/N exact-answer 회귀 820/820
- canonical muscle coverage 205/205
- 모든 persona의 정답/부분정답/오답 반응 존재
- follow-up dead-end 0
- local mastery data만 사용 / PHI 0

---

# Stage 19 — Clinical Learning Flow 2.0

목표: 각 부위를 단편 지식 카드가 아니라 “증상에서 시작해 무엇을 보고 어떻게 구분하는지” 학습하는 흐름으로 연결한다.

## 구현
- [ ] symptom → anatomy → differential → examination → ultrasound → quiz 흐름 통일
- [ ] 각 clinical test에 목적 / 방법 / 양성소견 / 한계 / 흔한 오류 표시
- [ ] 단일 검사로 확진하지 않는 안전문구 일관성 감사
- [ ] red flag와 전원/추가평가 경계를 별도 표시
- [ ] 각 diagnosis concept에 supporting / opposing clue 구조
- [ ] 관련 tendon/nerve/joint/bursa/ligament 빠른 이동
- [ ] 해당 부위 Oral Viva 바로 시작
- [ ] 해당 부위 환자교육 바로 이동
- [ ] patient-specific recommendation을 만들지 않는 교육 경계 유지

## 완료 Gate
- Stage 1–10 전부 동일 navigation contract
- orphan clinical path 0
- patient context/PHI 0

---

# Stage 20 — Search & Personal Learning 2.0

목표: 의사가 몇 초 안에 원하는 근육·구조·증상·검사·초음파를 찾고 자신의 약점을 반복 학습한다.

## 구현
- [ ] 통합검색: 한글/영문/약어/Stable ID
- [ ] muscle / nerve / tendon / test / diagnosis / ultrasound 타입 필터
- [ ] 최근 본 항목
- [ ] 즐겨찾기
- [ ] 오답·약점 자동 모음
- [ ] 부위별 mastery dashboard
- [ ] 데이터는 기본 local-only
- [ ] export/import는 PHI 없는 학습기록만 허용

## 완료 Gate
- 검색 대상 전체 entity type 포함
- 잘못된 환자정보 저장 UI 0
- local learning data migration test PASS

---

# Stage 21 — Real Device & Offline Quality Gate

목표: 개발환경이 아니라 실제 Android 폰에서 설치 앱 전체 흐름을 검증한다.

## 실기기 검사
- [ ] 홈 아이콘 실행 / fullscreen
- [ ] 앱 재실행 자동 업데이트
- [ ] offline cold start
- [ ] online 복귀 후 업데이트
- [ ] Oral Viva microphone
- [ ] microphone 실패 → text fallback
- [ ] SpeechSynthesis
- [ ] 환자교육 A4 print/share
- [ ] external source link
- [ ] 131 ultrasound view navigation
- [ ] quiz/oral local history persistence
- [ ] 화면 회전 / 작은 화면 / 큰 글자
- [ ] Chrome/PWA/TWA 차이 기록

## 완료 Gate
- critical FAIL 0
- data loss 0
- update regression 0

---

# Stage 22 — Google Play Production Release

목표: 기술적으로 준비된 TWA/AAB를 실제 Play Console internal test → production review까지 완료한다.

## 외부 의존 작업
- [ ] 최종 package ID 확정
- [ ] Play Console organization account verification
- [ ] upload key / Play App Signing
- [ ] signing SHA-256 fingerprint 확보
- [ ] launch origin root /.well-known/assetlinks.json 배포
- [ ] toolbar-less TWA verification
- [ ] SpeechRecognition Data Safety 분류 확정
- [ ] final 512×512 icon
- [ ] 1024×500 feature graphic
- [ ] phone screenshots
- [ ] Health Apps declaration
- [ ] Data Safety
- [ ] content rating
- [ ] support contact
- [ ] signed AAB upload
- [ ] internal test
- [ ] production review submission

## 완료 Gate
- Play internal test PASS
- Digital Asset Links PASS
- 정책 form 미완성 0
- production submission 완료

---

# 지속 운영 트랙 — Evidence & Media Refresh

이 트랙은 “완료 후 끝나는 Stage”가 아니라 앱의 상시 유지보수다.

- 최신 CPG / systematic review / high-quality RCT를 patient education evidence에 반영
- 공개·검증 초음파 source 지속 탐색
- 기존 source보다 명확히 우수할 때만 canonical reference 승격
- 링크 단절 / license 변경 감시
- 근육 해부학 O/I/F/N 정본 수정은 출처 확인 후 Stable ID를 유지한 채 반영
- 실제 환자/EMR/PHI를 Atlas에 넣지 않음

# 현재 바로 시작할 순서

**Stage 15 → Stage 16 → Stage 17 → Stage 18 → Stage 19 → Stage 20 → Stage 21 → Stage 22**

기능을 더 많이 넣는 것보다 먼저 **업데이트 신뢰성, 환자용 시각 품질, 초음파 교육 품질**을 완성한다.
