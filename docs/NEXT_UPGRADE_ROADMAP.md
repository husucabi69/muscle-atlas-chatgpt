# LYS Ortho Muscle Atlas — Next Upgrade Roadmap

기준일: 2026-09-25  
앱 이름: 이윤석정형외과 근육  
정본 원칙: Stage 1–15의 완성 기능을 유지하면서, 실제 사용 흐름과 교육 품질을 우선 개선한다.

## 현재 기준선

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
- Stage 15 Reliable Auto-Update Engine: DEV COMPLETE / automated QA PASS
- Play Console: submission pack prepared, actual submission not yet complete

## 새 우선순위 — 2026-09-25 사용자 실사용 피드백 반영

1. **계층형 화면 전환을 먼저 완성한다.**
   - 한 화면에서 아래로 스크롤해 다음 계층을 찾는 방식 금지
   - 해부학 부위 → 해당 부위 근육 → 근육 상세 → 심화학습을 각각 독립 화면처럼 전환
   - 뒤로가기 / 부위목록 / 해당 부위 근육목록 이동을 항상 명확히 제공
2. **근육 도해는 “그 근육이 가장 잘 보이는 시야”를 대표 도해로 쓴다.**
   - 단순히 이미지가 있다는 이유로 사용하지 않음
   - 예: 극하근은 견갑골 후면에서 근육 전체·기시·정지가 잘 보이는 posterior view를 대표로 사용
   - 불리한 각도·부분만 보이는 그림·교육적 가치가 낮은 그림은 교체
3. **Oral Viva 질문 음성을 사람 같은 음성으로 고도화한다.**
   - 브라우저 기본 기계음 개선
   - 자연스러운 음성 선택·속도·억양·쉼 조정
   - 실제 사람 수준의 고품질 TTS는 안전한 외부/서버 구조를 통해 선택적으로 연결
   - offline fallback은 유지
4. 기능 수를 늘리는 것보다 “한 번 눌렀을 때 어디로 들어왔는지 명확한 UX”와 “그림/음성의 품질”을 우선한다.

---

# Stage 15 — Reliable Auto-Update Engine

상태: **DEV COMPLETE / AUTOMATED QA PASS — 2026-09-25**  
실제 Android 설치 앱의 end-to-end 확인은 Stage 23 Real Device Gate에서 최종 수행한다.

- [x] 단일 APP_BUILD_VERSION
- [x] service worker cache version 동기화
- [x] 앱 실행 시 update check
- [x] controllerchange 감지 + one-shot reload guard
- [x] navigation/JSON freshness-safe cache 전략
- [x] 이전 cache 정리
- [x] localStorage 학습기록 보존
- [x] 현재 버전 / 업데이트 상태 / 수동 업데이트 확인 UI
- [x] 자동 QA gate

---

# Stage 16 — Hierarchical Navigation 2.0

상태: **DEV COMPLETE / AUTOMATED QA PASS — 2026-09-25**

목표: 스크롤로 아래 내용을 찾아가는 구조를 없애고, 사용자가 “현재 어느 단계인지” 즉시 알 수 있는 계층형 화면 전환을 만든다.

## Anatomy explorer 정본 흐름
1. 해부학 부위 화면 — 부위 카드만 표시
2. 부위 선택 — 해당 부위 근육만 표시
3. 근육 선택 — 근육 상세 기본화면으로 전환
4. 상세 기본화면
   - 기시
   - 정지
   - 기능
   - 신경
   - 혈관
   - 촉지법
   - 임상 중요점
   - 초음파 핵심
5. 심화 탭
   - 대표 해부학 도해
   - 실제 초음파 / landmark
   - 관련 증상·감별
   - Oral Viva
   - 환자교육
6. 명확한 이동
   - 뒤로
   - 해부부위로
   - 현재 부위 근육목록으로

## 구현
- [x] region chooser / muscle list / muscle detail을 독립 view state로 분리
- [x] 부위 클릭 시 같은 페이지 아래로 이동하지 않고 view 교체
- [x] 근육 클릭 시 modal이 아니라 anatomy explorer 내부 detail view로 이동
- [x] detail 내부 basic / imaging / clinical / learning 심화 탭
- [x] history/back 동작을 앱 단계와 맞춤
- [x] 페이지 전환 시 scroll top을 즉시 0으로 고정
- [x] mobile 360px에서 breadcrumb/back control 유지
- [x] 기존 증상·검색 등 외부 진입은 기존 근육 overlay를 깨지 않도록 유지
- [x] Stage 16 navigation QA 추가

## 완료 Gate
- [x] region → muscle list → muscle detail 전환이 각 단계에서 독립 화면처럼 동작
- [x] 다음 내용을 보기 위해 아래로 수동 스크롤해서 계층을 찾을 필요 0
- [x] anatomy explorer back dead-end를 막는 내부 버튼 + popstate 구조
- [x] canonical 205 muscle을 동일 detail renderer로 진입
- [x] 기존 Global QA regression PASS
- [ ] 실제 Android 360px / 물리 back button 최종 확인은 Stage 23에서 수행

---

# Stage 17 — Muscle Illustration Quality Audit

상태: **IN PROGRESS — 2026-09-26 / 100 of 205 representative views reviewed**

목표: 205개 근육 각각에서 “근육을 가장 잘 이해할 수 있는 대표 시야”를 우선 표시한다.

## 대표 도해 선정 규칙
- 근육 전체 belly와 주행이 보이는가
- origin/insertion의 공간관계가 이해되는가
- superficial/deep layer 관계가 필요한 경우 층이 구분되는가
- 주변 뼈 landmark가 충분한가
- 교육적으로 불필요한 방향·과도한 절단·근육이 거의 보이지 않는 시야는 대표에서 제외
- 저작권/재사용 조건이 명확한 자료만 고정
- 실시간 검색 결과를 대표 도해로 자동 승격하지 않음

## 구현
- [x] 205 muscle 전수 audit ledger 생성 / 각 근육 pending/reviewed 상태 관리 (전수 검수 자체는 진행 중)
- [x] 대표시야 metadata: view / educationalReason / source / license 구조 도입
- [x] 회전근개 1차: 극상근 posterior / 극하근 posterior / 소원근 posterior / 견갑하근 anterior 대표시야로 교체
- [x] 경추/후두하 우선 배치 11개 검수 완료
- [x] 심부둔부 6개 우선 배치 검수 완료
- [x] 전완심부 8개 우선 배치 검수 완료
- [x] 족부 내재근 10개 우선 배치 검수 완료
- [ ] 충양근·개별 골간근 등 남은 족부 심부근은 더 명확한 개별 대표도해 확보 후 승격
- [x] reviewed 근육은 대표 1장 우선 원칙 적용
- [x] 극하근 기존 superior view 대표도해 제거
- [x] 1차 교체 4개 source/license/attribution 검증 및 유지
- [x] anatomy detail 카드에 대표 시야 / view / 선정 이유 표시

## 현재 진행
- reviewed: 100 / 205
- pending_review: 105 / 205
- 극하근: `Infraspinatus muscle top.png` 제거 → `Infraspinatus muscle back.png` 대표시야로 교체
- Stage 17 audit ledger: `data/muscle-illustration-audit-v1.json`
- Stage 17 QA: `scripts/muscle-illustration-audit-qa.mjs`

## 완료 Gate
- [ ] 205/205 representative-view decision
- [x] 견갑대·어깨 8개 대표시야 우선 배치 검수 완료
- [x] 전완 표층 11개 대표시야 우선 배치 검수 완료
- [x] 상완근·오훼완근·주근 3개 대표시야 검수 완료
- [x] 이두근 장·단두 / 삼두근 장·외측·내측두: 색분리 head-specific 대표도해 5개 검수 완료
- [x] 하퇴 후면 6개(가자미근·족척근·슬와근·후경골근·장지굴근·장무지굴근) 대표시야 검수 완료
- [x] 하퇴 전·외측 6개(전경골근·장무지신근·장지신근·제3비골근·장비골근·단비골근) 대표시야 검수 완료
- [x] 대퇴 전·내측 10개(봉공근·대퇴직근·외측광근·내측광근·중간광근·치골근·장내전근·단내전근·대내전근 내전부·박근) 대표시야 검수 완료
- [x] 대퇴 후면 4개(대퇴이두근 장두·단두·반건양근·반막양근) 대표시야 검수 완료
- [x] 둔부 표층 4개(대둔근·중둔근·소둔근·대퇴근막장근) 대표시야 검수 완료
- [x] 요추·골반 심부 4개(요방형근·대요근·소요근·장골근) 대표시야 검수 완료
- [ ] 대내전근 햄스트링부는 전체 대내전근 도해가 아닌 part-specific 대표도해 추가 검토
- [ ] 비복근 내·외측두는 head-specific 대표도해 추가 검토
- [ ] 대표시야 미등록 0 또는 근거 있는 “공개 적합자료 미확립” 표기
- [ ] reviewed source/license 누락 0
- [x] 극하근 우선 문제 사례 데이터 수정 + 자동 QA
- [ ] 실제 앱 화면에서 posterior 대표시야 시각 확인

---

# Stage 18 — Oral Viva Human Voice 3.0

목표: 질문과 피드백이 브라우저 기계음이 아니라 실제 동료·선배·대가와 대화하는 느낌에 가깝게 들리도록 한다.

## 1차 — 기기 내 최적 음성
- [ ] Korean neural/natural voice가 있으면 우선 선택
- [ ] voiceschanged 이후 voice ranking
- [ ] persona별 rate / pitch / pause tuning
- [ ] 질문 앞뒤 불필요한 기계적 문장 제거
- [ ] punctuation 기반 자연스러운 쉼
- [ ] friend / colleague / senior / master speaking style 차등
- [ ] 음성 설정 미리듣기
- [ ] SpeechSynthesis fallback 유지

## 2차 — High-quality TTS option
- [ ] 실제 사람 수준 TTS provider/server contract 검토
- [ ] API key를 앱 bundle에 넣지 않음
- [ ] PHI/patient context 전송 금지
- [ ] 질문 텍스트만 전송 가능한 구조
- [ ] network 실패 시 local SpeechSynthesis fallback
- [ ] Data Safety/Privacy 영향 문서화 후에만 활성화

## Oral reasoning upgrade
- [ ] 세션 문맥 유지
- [ ] anatomy → function → exam → clinical → ultrasound 연속 질문
- [ ] 부분정답은 빠진 핵심만 되묻기
- [ ] 오답은 교정 후 즉시 재질문
- [ ] 비교·reverse·scenario 강화
- [ ] 약점 기반 spaced repetition

## 완료 Gate
- O/I/F/N 820/820 회귀
- 205/205 muscle coverage
- persona 4종 voice + feedback path 존재
- local fallback 항상 동작
- PHI 0 / client API key 0

---

# Stage 19 — Patient Exercise Illustration 2.0

목표: 현재 운동 개념 SVG를 환자가 설명 없이도 따라 하기 쉬운 전문 환자교육 도해로 고도화한다.

- [ ] 19 patient exercise profile 전수 시각감사
- [ ] 시작자세 / 끝자세
- [ ] 움직임 방향 화살표
- [ ] 지지점·고정부위·주의관절
- [ ] 반복횟수 / 유지시간 / 세트 / 빈도
- [ ] 흔한 잘못된 자세
- [ ] stop/reassessment 표시
- [ ] 모바일 카드 + A4 인쇄
- [ ] grayscale print readability
- [ ] alt text / 쉬운 한국어 caption

완료 Gate: actionable profile 그림 누락 0 / A4 clipping 0 / 360px 의미손실 0

---

# Stage 20 — Ultrasound Atlas 2.0

목표: 131 canonical view를 probe 위치 → orientation → landmark → 정상 실제 영상 → pitfall 순으로 학습하게 한다.

- [ ] 131 view 교육성 재평가
- [ ] probe placement/orientation 자체 도해 131/131
- [ ] 실제 B-mode와 probe 도해 명확히 구분
- [ ] landmark layer
- [ ] anisotropy/common pitfall
- [ ] reusable image/video 직접 승격
- [ ] 불명확 라이선스는 reference-only
- [ ] source health/broken-link audit
- [ ] generated/fake B-mode 금지

---

# Stage 21 — Clinical Learning Flow 2.0

목표: symptom → anatomy → differential → examination → ultrasound → quiz → viva → education을 같은 계층 UX로 연결한다.

- [ ] Stage 1–10 동일 navigation contract
- [ ] clinical test: 목적 / 방법 / 양성 / 한계 / 오류
- [ ] red flag 별도 표시
- [ ] diagnosis supporting/opposing clues
- [ ] tendon/nerve/joint/bursa/ligament 빠른 이동
- [ ] patient-specific recommendation 금지

---

# Stage 22 — Search & Personal Learning 2.0

- [ ] 한글/영문/약어/Stable ID 통합검색
- [ ] entity type filter
- [ ] 최근 본 항목
- [ ] 즐겨찾기
- [ ] 오답·약점 자동 모음
- [ ] 부위별 mastery dashboard
- [ ] 기본 local-only
- [ ] PHI 없는 학습기록만 export/import

---

# Stage 23 — Real Device & Offline Quality Gate

- [ ] 홈 아이콘 / fullscreen
- [ ] 자동 update
- [ ] offline cold start / online recovery
- [ ] Oral microphone + human-voice TTS + fallback
- [ ] 환자교육 print/share
- [ ] hierarchical anatomy navigation
- [ ] representative muscle illustration
- [ ] 131 ultrasound navigation
- [ ] quiz/oral history persistence
- [ ] 화면회전 / 작은화면 / 큰글자
- [ ] Chrome/PWA/TWA 차이 기록

완료 Gate: critical FAIL 0 / data loss 0 / update regression 0

---

# Stage 24 — Google Play Production Release

- [ ] final package ID
- [ ] organization developer account verification
- [ ] upload key / Play App Signing
- [ ] SHA-256 fingerprint
- [ ] root /.well-known/assetlinks.json
- [ ] toolbar-less TWA
- [ ] SpeechRecognition/TTS Data Safety 확정
- [ ] store icon / feature graphic / screenshots
- [ ] Health Apps / Data Safety / content rating / support contact
- [ ] signed AAB
- [ ] internal test
- [ ] production review submission

---

# 지속 운영 트랙 — Evidence & Media Refresh

- 최신 CPG / systematic review / high-quality RCT 반영
- 공개·검증 초음파 source 지속 탐색
- 기존 source보다 교육성이 명확히 좋을 때만 canonical 승격
- 링크 단절 / license 변경 감시
- 근육 O/I/F/N 수정은 Stable ID 유지
- 실제 환자/EMR/PHI를 Atlas에 넣지 않음

# 현재 바로 시작할 순서

**Stage 16 Hierarchical Navigation → Stage 17 Muscle Illustration → Stage 18 Human Voice Oral → Stage 19 Patient Exercise Illustration → Stage 20 Ultrasound → Stage 21 Clinical Flow → Stage 22 Search → Stage 23 Real Device → Stage 24 Play**
