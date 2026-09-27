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

상태: **PREVIEW COMPLETE — 2026-09-27 / 205 of 205 final decisions · 177 fixed representative views · 28 documented source gaps · pending 0**

## 배포 게이트
- [x] 저장소 Cloudflare Pages 호환 경로/QA 준비
- [x] Cloudflare Dashboard에서 GitHub 저장소 연결
- [x] Production branch = `main`, Preview = all non-production branches 설정
- [x] Cloudflare Production 배포 + PR Preview 자동생성 확인
- [x] 설골상·설골하 배치 Preview 실제 화면 시각 확인 — 의장님 승인
- [x] 이후 개발은 `preview/development`에만 누적하고 각 배치를 Preview 실화면 검수
- [ ] 전체 개발 완료 후 의장님의 명시적 Production 승격 승인 시에만 main 병합

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
- [x] 205 muscle 전수 audit ledger 완료 / 모든 근육을 reviewed 또는 no_suitable_public_source로 최종 판정
- [x] 대표시야 metadata: view / educationalReason / source / license 구조 도입
- [x] 회전근개 1차: 극상근 posterior / 극하근 posterior / 소원근 posterior / 견갑하근 anterior 대표시야로 교체
- [x] 경추/후두하 우선 배치 11개 검수 완료
- [x] 심부둔부 6개 우선 배치 검수 완료
- [x] 전완심부 8개 우선 배치 검수 완료
- [x] 족부 내재근 10개 우선 배치 검수 완료
- [x] 발 충양근 4개 + 배측골간근 4개 + 족저골간근 3개: Gray 444/446/447의 근복 위 직접 번호(1st·2d·3d·4th)로 개별 대표시야 승인
- [x] 발 소지대립근(가변 구조): 공개 적합 정본 미확립으로 최종 source-gap 판정
- [x] reviewed 근육은 대표 1장 우선 원칙 적용
- [x] 극하근 기존 superior view 대표도해 제거
- [x] 1차 교체 4개 source/license/attribution 검증 및 유지
- [x] anatomy detail 카드에 대표 시야 / view / 선정 이유 표시

## 현재 진행
- Production reviewed: 114 / 205
- Preview fixed representative reviewed: 177 / 205
- Production pending_review: 91 / 205
- Preview documented source-gap: 28 / 205
- Preview pending_review: 0 / 205
- Preview final decisions: 205 / 205
- 극하근: `Infraspinatus muscle top.png` 제거 → `Infraspinatus muscle back.png` 대표시야로 교체
- Stage 17 audit ledger: `data/muscle-illustration-audit-v1.json`
- Stage 17 QA: `scripts/muscle-illustration-audit-qa.mjs`

## 완료 Gate
- [x] 205/205 representative-view decision — 177 fixed representative + 28 documented source-gap
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
- [x] 복벽 우선 4개(복직근·외복사근·내복사근·복횡근) 대표시야 검수 완료
- [x] 흉곽·호흡 우선 6개(대흉근·소흉근·쇄골하근·상후거근·하후거근·횡격막) 대표시야 검수 완료
- [x] 경추 전면 심부 4개(두장근·경장근·전두직근·외측두직근) 대표시야 검수 완료
- [x] 설골상·설골하 8개(이복근·경돌설골근·하악설골근·이설골근·흉골설골근·흉골갑상근·갑상설골근·견갑설골근) 대표시야 데이터 검수 완료 — `preview/development`에 유지, Production 미승격
- [x] 손 내재근 6개(단무지외전근·무지대립근·단소지근·소지외전근·소지대립근·단장근) 개별 강조 대표시야 검수 완료 — `preview/development`
- [x] 손 충양근 4개(제1·2·3·4충양근) Sobotta 심부 손바닥 도해에서 Lumbricalis I–IV 직접 라벨 확인 완료 — `preview/development`
- [x] 발 내재근 정밀 11개(충양근 4·배측골간근 4·족저골간근 3) Gray 정본의 근복 위 직접 번호 확인 완료 — `preview/development`
- [x] 흉벽 5개(늑골거근·외늑간근·내늑간근·최내늑간근·흉횡근) 대표시야 검수 완료 — `preview/development`
- [x] 정확도 우선 4개(흉극근·흉반극근·광경근·거고근) 대표시야 검수 완료 — `preview/development`
- [x] 회음부 3개(외항문괄약근·구해면체근·좌골해면체근) 대표시야 검수 완료 — `preview/development`
- [x] 골반저 3개(치골미골근·장골미골근·미골근) 직접 라벨/경계 확인 대표시야 검수 완료 — `preview/development`
- [x] 비복근 2개 head(내측두·외측두) OpenStax 후면도에서 각각 직접 라벨 확인 완료 — `preview/development`
- [x] 추체근 + 회음부 3개(천회음횡근·심회음횡근·외요도괄약근) 직접 라벨/라이선스 확인 완료 — `preview/development`
- [x] 경추 세로근 3개(경장늑근·두최장근·경최장근) Sobotta 후면도 직접 라벨 확인 완료 — `preview/development`
- [x] 경추 심부 정밀 3개(경반극근·경회선근·경극간근) 직접 라벨/부위 식별 대표시야 검수 완료 — `preview/development`
- [x] 경다열근 + 늑하근: 경부 deep-posterior 직접 라벨 / 흉곽 내면 번호-캡션 직접 대응 대표시야 검수 완료 — `preview/development`
- [x] Stage 17 final 30개: 단무지굴근 표재두·심두 2개 신규 대표도해 승인 + 나머지 28개 근거 기반 source-gap 최종 판정 — pending 0
- [x] 치골직장근 + 무지내전근 2개 head(사두·횡두) 직접 라벨 대표시야 검수 완료 — `preview/development`
  - 동일 후면도에서 세 근육이 각각 독립 라벨로 표시되어 외측-중간 배열 비교 가능
  - 경반극근·경회선근·경극간근은 직접 식별 정본으로 승인; 경극근·경횡돌기간근은 final source-gap 판정
  - 추체근은 Gray397의 명확한 미국 포함 Public Domain 메타데이터로 기존 license 보류를 해제
  - 회음횡근은 Toldt 1903 원판, 외요도괄약근은 Cenveo 남녀 비교도해 사용
  - 동일 도해를 각 head 페이지에 사용하되 해당 head 이름과 선택 이유를 별도로 명시
  - 치골직장근은 sagittal sling 도해에서 A=puborectalis가 직접 지정되어 치골-직장 후방 sling과 anorectal angle 관계를 명확히 확인
  - 외항문괄약근은 OpenStax inferior perineal overview, 구해면체근·좌골해면체근은 Gray 개별 강조 도해 사용
  - 세 근육 모두 여성 비교 시야를 secondary로 추가해 성별 해부 차이를 학습
  - 회음횡근·골반저 세부 part는 개별 구조가 명확한 정본 확보 전까지 pending 유지
  - 흉장늑근·흉최장근은 공개 도해가 전체 muscle group 중심이라 thoracic part 단독 확인이 불충분하여 final source-gap 판정
  - 외/내/최내늑간근은 lateral 시야로 통일해 섬유 방향 비교; 늑하근은 1918 흉곽 내면 Fig.112에서 10,10=subcostal muscles 직접 대응을 확인해 승인
  - 무지내전근 사두·횡두는 Gray426 직접 라벨로 승인; 단무지굴근 표재/심두는 Braus 1921 plate에서 두 head 직접 라벨을 확인해 승인
  - Gray Plate 378 기반 개별 강조 public-domain 도해로 통일; Preview 실화면 확인 후 main 병합
  - 네 근육 모두 Gray plate 기반 개별 강조 public-domain 도해를 사용하여 작은 심부근도 주변 경추·두개저 표지와 함께 구분 가능
  - 대흉근: `202304 Pectoralis major muscle.svg`는 Commons license review needed 상태라 대표도해에서 제외하고 `Gray410.png` public-domain 정본으로 교체
- [x] 대내전근 햄스트링부: part-specific 공개 적합 정본 미확립으로 최종 source-gap 판정
- [x] 대표시야 미등록 항목은 모두 근거 있는 “공개 적합자료 미확립” source-gap으로 명시
- [x] reviewed source/license 누락 0 — automated QA gate
- [x] 극하근 우선 문제 사례 데이터 수정 + 자동 QA
- [ ] 실제 앱 화면에서 posterior 대표시야 시각 확인

---

# Stage 18 — Oral Viva Human Voice 3.0

상태: **IN PROGRESS — Local Voice + Contextual Viva 완료 / High-quality TTS secure option 준비·기본 비활성 / 실제 provider activation 미완료**

목표: 질문과 피드백이 브라우저 기계음이 아니라 실제 동료·선배·대가와 대화하는 느낌에 가깝게 들리도록 한다.

## 1차 — 기기 내 최적 음성
- [x] Korean neural/natural voice가 있으면 이름·언어 점수로 우선 선택
- [x] voiceschanged 이후 voice ranking 재계산
- [x] persona별 rate / pitch / pause tuning
- [x] 질문 앞뒤 불필요한 기계적 문장 축소
- [x] punctuation 기반 문장·구 단위 자연스러운 쉼
- [x] friend / colleague / senior / master speaking style 차등
- [x] 음성 선택·상태 표시·미리듣기
- [x] SpeechSynthesis fallback 유지 / 미지원 시 텍스트 Oral 지속

## 2차 — High-quality TTS option
- [x] provider-neutral same-origin TTS server contract v1 준비 / 실제 provider 선택은 activation gate에서 수행
- [x] API key를 앱 bundle에 넣지 않음 / provider credential은 server-side only
- [x] PHI/patient context·학습자 답변·마이크 audio 전송 금지
- [x] generic 질문/피드백 text + persona/locale/kind만 allowlist payload
- [x] offline/timeout/non-2xx/non-audio/playback 실패 시 local SpeechSynthesis fallback
- [x] Data Safety/Privacy·provider retention 검토 전에는 ORAL_REMOTE_TTS.enabled=false 유지

## Oral reasoning upgrade
- [x] 세션 문맥 유지 / 동일 근육에서 이미 물은 category 추적
- [x] anatomy → function → exam → clinical → ultrasound 순차 follow-up 우선
- [x] 부분정답은 빠진 핵심 target만 즉시 교정 질문
- [x] 오답은 정본 교정 후 같은 핵심 1회 즉시 재질문
- [x] 비교·reverse·scenario 기존 고급 출제 유지 + contextual flow와 공존
- [x] local history/wrong 기반 약점 근육을 다음 10문제의 최대 40% 우선 편성

## 완료 Gate
- O/I/F/N 820/820 회귀
- 205/205 muscle coverage
- persona 4종 voice + feedback path 존재
- local fallback 항상 동작
- PHI 0 / client API key 0

---

# Stage 19 — Patient Exercise Illustration 2.0

상태: **DEV COMPLETE / AUTOMATED QA PASS — 19/19 profile 구조감사 + 18 actionable two-phase illustration 구현 완료 / Preview 최종 시각검수는 release gate에서 수행**

목표: 현재 운동 개념 SVG를 환자가 설명 없이도 따라 하기 쉬운 전문 환자교육 도해로 고도화한다.

- [x] 19 patient exercise profile 전수 구조감사 — 18 actionable + px099 evidence boundary
- [x] 시작자세 / 끝자세 two-phase card 18/18
- [x] 움직임 방향 화살표/끝자세 변화 18/18
- [x] 지지점·고정부위 안내 18/18
- [x] 반복·유지·세트·빈도는 기존 근거 기반 dose 문구만 표시하고 임의 숫자 생성 금지
- [x] 흔한 잘못된 자세 18/18
- [x] stop/reassessment 기준 18/18
- [x] 모바일 반응형 card + A4 break-inside/흑백 print-safe 구현
- [x] grayscale print-safe CSS 적용
- [x] 18/18 alt text + 쉬운 한국어 caption

완료 Gate: actionable profile 그림 누락 0 / A4 clipping 0 / 360px 의미손실 0

---

# Stage 20 — Ultrasound Atlas 2.0

상태: **DEV COMPLETE / AUTOMATED QA PASS — 131/131 guidance·landmark·pitfall 완료 / 5 embedded actual US + 9 direct-asset candidates + 117 reference-only / 55 source healthy · broken 0**

목표: 131 canonical view를 probe 위치 → orientation → landmark → 정상 실제 영상 → pitfall 순으로 학습하게 한다.

- [x] 131 view 필수 교육 필드 전수 구조감사 — patient position / probe orientation / landmark / normal / pitfall 누락 0
- [x] probe placement/orientation 교육용 schematic 131/131 자동 생성
- [x] 교육용 Probe 도해와 실제 B-mode/검증 원문을 UI에서 명확히 분리
- [x] landmark layer — canonical landmark 최대 4개를 probe guide에 직접 표시
- [x] anisotropy/common pitfall — 131/131 pitfall 존재 + 8종 taxonomy tag
- [x] reusable image/video 승격 정책 적용 — 기존 5개 검증 actual-US embedded 유지; 9개 permissive 후보는 stable direct media asset URL 미확립으로 안전하게 보류
- [x] 불명확/NC/ND 라이선스는 reference-only — 117 view
- [x] source health/broken-link audit — 55/55 healthy · transient 0 · broken 0, CI 상시 감시
- [x] generated/fake B-mode 금지 정책 유지 + Stage 20 QA

---

# Stage 21 — Clinical Learning Flow 2.0

상태: **DEV COMPLETE / AUTOMATED QA GATE — Preview 시각검수 미완료**

목표: symptom → anatomy → differential → examination → ultrasound → quiz → viva → education을 같은 계층 UX로 연결한다.

- [x] Stage 1–10 동일 navigation contract — symptom → anatomy → differential → examination → ultrasound → fixed-muscle quiz → viva → education
- [x] 공통 Learning Flow Context — symptom_id / muscle_id / clinical module / ultrasound_view_ids / source page
- [x] muscle → clinical module resolver — canonical ultrasound view 우선, region fallback
- [x] parent tendon target_structure_ids까지 추적하여 muscle canonical ultrasound view 해석
- [x] clinical test: 목적 / 방법 / 양성 기준 / 해석 / 한계·흔한 오류 / Stable ID
- [x] red flag / safety_rule 별도 표시
- [x] diagnosis supporting / opposing·limiting clues 분리 표시
- [x] tendon / nerve / joint / bursa / ligament / fascia 빠른 이동
- [x] clinical_test_id / diagnosis_concept_id / ultrasound_view_id Stable ID focus navigation
- [x] symptom에서 선택한 muscle context를 quiz / Oral / patient education까지 유지
- [x] overlay / body overflow cleanup
- [x] patient-specific diagnosis/treatment recommendation 금지
- [x] PHI / encounter context 저장·전송 없음
- [x] Stage 21 전용 QA + Global regression gate
- [ ] Preview 실제 화면의 사용자 시각승인

완료 기준: 자동 QA critical FAIL 0. 시각승인은 Production 승격과 별도이며, 승인 전 main merge 금지.

---

# Stage 22 — Search & Personal Learning 2.0

상태: **DEV COMPLETE / AUTOMATED QA PASS — Preview 실제 시각검수 미완료**

- [x] 한글 / 영문 / 약어 / Stable ID 통합검색
- [x] entity type filter — region / muscle / symptom / tendon / nerve / joint / bursa / ligament / fascia / clinical test / diagnosis concept / ultrasound view
- [x] 최근 본 항목 — Stable ID + 마지막 조회시각만 localStorage 저장
- [x] 즐겨찾기 — Stable ID 기반, 검색결과/근육상세/내 학습 화면 연동
- [x] 오답·약점 자동 모음 — Quiz wrong/due + Oral wrong/partial을 합산해 근육별 우선순위 표시
- [x] 부위별 mastery dashboard — 학습 coverage 30% + 앱 내 정오답/Oral performance 70%의 투명한 학습지표
- [x] 기본 local-only — 외부 계정/서버 동기화 없음
- [x] PHI 없는 학습기록 export/import — Quiz 통계, Oral grade/score, favorites/recent Stable ID만 허용목록으로 이동
- [x] 음성 원문 / 자유서술 답변 / 환자 이름 / 환자 ID / encounter 정보는 export/import에 포함하지 않음
- [x] Stage 22 전용 QA + Global regression gate
- [ ] Preview 실제 화면의 사용자 시각승인

완료 기준: automated critical FAIL 0. 시각승인은 Production 승격과 별도이며, 사용자 승인 전 main merge 금지.

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

**Stage 23 Real Device & Offline Quality Gate → Stage 24 Google Play Production Release**
