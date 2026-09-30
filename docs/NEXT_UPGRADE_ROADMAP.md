# LYS Ortho Muscle Atlas — Next Upgrade Roadmap

기준일: 2026-09-25  
앱 이름: 이윤석정형외과 근육  
정본 원칙: Stage 1–15의 완성 기능을 유지하면서, 실제 사용 흐름과 교육 품질을 우선 개선한다.

## 개발 통제 원칙 — 아이디어 보존 / 우선순위 / 작업선 관리

사용자 아이디어는 즉시 구현 지시로 해석하지 않는다. 먼저 아래 절차를 거쳐 정본 로드맵에 배치한다.

1. **아이디어 보존** — 새 아이디어는 반드시 Idea Register에 기록한다. 삭제하지 않는다.
2. **선후관계 분석** — 기반 구조를 먼저 고쳐야 뒤 작업의 재작업이 줄어드는지 판단한다.
3. **중요도 분류** — Release blocker / High / Medium / Later 로 분류한다.
4. **의존성 확인** — 기존 Stable ID, PWA, 학습기록, 임상 모듈, 환자교육 구조를 깨지 않는지 확인한다.
5. **로드맵 배치 후 구현** — 현재 작업선보다 우선도가 낮으면 뒤로 보낸다. 좋은 아이디어라도 즉시 끼워 넣지 않는다.
6. **중간 아이디어 유실 금지** — 구현을 미루더라도 deferred 상태와 이유를 남긴다.
7. **작업선 단일화** — 한 시점에 하나의 주 작업선만 진행하고, 별도 아이디어는 backlog에 축적한다.
8. **Preview 우선** — 자동 QA → Preview 실제화면 검수 → 사용자 승인 후에만 다음 release gate로 이동한다.
9. **Production 동결** — 명시적 Production 승격 승인 전에는 main을 변경하지 않는다.

### Idea Register — 2026-09-27

| ID | 아이디어 | 중요도 | 선행조건 | 상태 / 배치 |
|---|---|---|---|---|
| UX-001 | top-level 흐름을 목차 → 하위목록 → 상세 계층으로 정리하되, 검증된 내부 탭 UX는 보존 | Release blocker | 공통 navigation shell | **IN PROGRESS / A1 완료 · A2 사용자검수 대기** |
| UX-002 | 탭/항목을 눌렀을 때 같은 화면 아래에 내용을 붙여 사용자가 스크롤로 찾아야 하는 패턴 제거 | Release blocker | UX-001 | **Stage 23A** |
| UX-003 | 각 단계에 뒤로가기 / 상위목차 / breadcrumb / 현재위치 제공 | High | UX-001 | **Stage 23A** |
| UX-004 | 해부학: 부위만 표시 → 부위 근육만 표시 → 근육 상세 3단계; 상세 내부 5개 탭은 v11.14 same-screen | Release blocker | UX-001 | **IMPLEMENTED / A2 USER VERIFY PENDING** |
| UX-005 | 증상·환자교육·임상·초음파·퀴즈·Oral·내학습에도 같은 계층 UX 적용 | Release blocker | UX-004 공통 shell 검증 | **IN PROGRESS · 환자교육·증상 완료 / 다음 임상** |
| EDU-001 | 현재 환자 운동·스트레칭의 개념형 SVG를 전문 환자교육 수준 일러스트로 교체 | High | navigation 구조 고정 후 통합 | **Stage 23B** |
| EDU-002 | 손·손가락·상지 등 인체 비율과 시작/끝 자세, 지지점, 움직임 방향을 실제 교육용 수준으로 개선 | High | EDU-001 | **Stage 23B** |
| EDU-003 | 대표 정형외과 질환별 환자 재활교육 모듈: 질환 설명 → 스트레칭 → 강화운동 → 생활습관 교정 → 중단기준/red flag → 인쇄 | Release blocker | EDU-001/002 + 임상모듈 Stable ID | **Stage 23B-Disease Rehab / MUST IMPLEMENT** |
| EDU-004 | 해부학 부위별 대표 질환 coverage matrix를 구축하고 질환별 근거 출처·적응증·금기·진행단계를 구조화 | Release blocker | EDU-003 | **Stage 23B-Disease Rehab / MUST IMPLEMENT** |
| EDU-005 | 질환별 운동을 사용자 승인 실사형 2-panel 일러스트와 연결하고 A4 1~2장 환자교육지로 인쇄 가능하게 구현 | Release blocker | EDU-003 + realistic asset pipeline | **Stage 23B-Disease Rehab / MUST IMPLEMENT** |
| EDU-006 | 환자용 앱 탐색: 환자교육 → 부위 → 대표 질환 → 재활 프로그램, 홈/검색/임상상세에서 질환교육 direct route 지원 | Release blocker | EDU-003 + Stage 23A navigation | **Stage 23B-Disease Rehab / MUST IMPLEMENT** |
| EDU-007 | 대표 질환 교육은 최신 CPG·systematic review·고품질 RCT를 우선 근거로 하며 수술 후 프로토콜·급성 손상·red flag는 일반 보존적 재활과 분리 | Release blocker | EDU-003 | **Stage 23B-Disease Rehab QA / MUST IMPLEMENT** |
| UPD-001 | 앱 실행/재개/포커스 시 자동 업데이트 확인 | High | Stage 15 | **IMPLEMENTED v11.37** |
| UPD-002 | 홈 최상단에서 아래로 당겨 업데이트 확인/재로드 | High | Stage 15 | **IMPLEMENTED v11.37** |
| QA-001 | 실제 Android에서 offline cold start / mic / TTS / 큰글자 / 회전 / print-share 확인 | Release blocker | Stage 23A + 23B | **Stage 23C** |
| VID-001 | 초음파 상세에 최고품질 검수 YouTube 영상 링크/임베드 추가 | High | Stage 23A navigation shell | **Stage 23B/Media layer** |
| VID-002 | 환자교육 운동·스트레칭에 고품질 YouTube 환자교육 영상 링크/임베드 추가 | High | Stage 23A + exercise profile mapping | **Stage 23B** |
| VID-003 | 영상 출처·채널·언어·duration·last_verified·embed 가능 여부·교육목적을 metadata로 관리하고 broken-link audit | High | VID-001/002 | **Stage 23B QA** |
| VID-004 | 영어 영상에 한국어 접근성 레이어 추가: YouTube 한국어 자막 우선 + 앱내 한국어 핵심해설/타임스탬프 | High | VID-001/002 | **Stage 23B Media UX** |
| VID-005 | CC BY/Public Domain/명시적 허가 영상에 한해 한국어 번역자막 및 선택적 TTS 더빙 지원 | Medium | license/permission audit | **Stage 23B Media UX** |
| ARCH-001 | 대표 해부도해·실제 초음파·근육별 운동·질환별 재활을 코드 재설계 없이 계속 추가·교체할 수 있는 Stable ID + registry + asset slot 확장 계약 유지 | Release blocker | 기존 Stable ID/registry | **EVERGREEN ARCHITECTURE / MUST PRESERVE** |
| EDU-008 | 사용자가 특정 근육 운동·스트레칭 추가를 요청하면 기존 근육별 환자교육 registry에 source/last-reviewed/asset slot을 붙여 확장 가능하게 유지 | High | ARCH-001 | **ONGOING / NON-PREEMPTIVE** |
| MED-001 | 대표 해부도해와 실제 초음파 이미지·영상은 더 좋은 공개·검증 자료가 생길 때 지속 교체하되 현재 Active Stage를 중단시키지 않는 별도 refresh track으로 운영 | High | ARCH-001 + license audit | **ONGOING MEDIA REFRESH** |
| OPS-001 | 00:00~08:00 매 정시 자동개발 이후 오전 첫 수동 개발은 최신 HEAD·야간 commit·QA/Preview·Active Stage를 먼저 대조하고 중복 없이 재개 | Release blocker | automation checkpoint | **OPERATING RULE** |

아이디어 상태는 NEXT / queued / deferred / implemented / superseded 중 하나로 남긴다. superseded도 삭제하지 않고 대체 아이디어와 이유를 기록한다.

---
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
   - 해부학은 `부위 → 해당 부위 근육 → 근육 상세`까지만 독립 화면처럼 전환하고, 근육 상세의 5개 탭은 v11.14처럼 같은 화면에서 콘텐츠만 교체
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

상태: **DEV / AUTOMATED GATE COMPLETE — REAL DEVICE VERIFICATION PENDING**

- [x] 홈 아이콘 / fullscreen 계약 — manifest 192/512 + fullscreen + 앱내 runtime mode 진단
- [x] 자동 update — 실행/재개/포커스 시 자동 확인 + worker/page version 진단
- [x] 홈 화면 pull-to-refresh — 아래로 당겨 업데이트 확인 후 최신 화면 재로드
- [x] offline cache readiness — Service Worker가 CORE cached/missing 상태를 직접 보고
- [ ] 실제 offline cold start / online recovery — Android 실기기 비행기모드 검수 필요
- [x] Oral microphone + human-voice TTS + fallback 계약/기능 유지
- [ ] 실제 Oral microphone 입력 + 실제 TTS 청취 — 실기기 확인 필요
- [x] 환자교육 print + Web Share / clipboard fallback
- [ ] 실제 Android 인쇄·공유창 결과 확인
- [x] hierarchical anatomy navigation 자동 회귀
- [x] representative muscle illustration 205개 최종결정 audit 확인
- [x] 131 ultrasound navigation canonical count 확인
- [x] quiz/oral history persistence JSON + localStorage round-trip 진단
- [x] 360px / landscape / 44px touch target / root overflow runtime 진단
- [ ] 실제 화면회전 / 작은화면 / Android 큰글자 시각검수
- [x] Chrome / PWA / TWA 차이 문서화 — `docs/REAL_DEVICE_OFFLINE_QA.md`
- [x] 앱 홈에 **실기기·오프라인 품질 점검** 패널 + 수동 PASS/FAIL 기록 추가
- [x] Stage 23 static QA를 Global QA workflow에 연결
- [ ] TWA toolbar-less 실제 확인 — Play signing fingerprint + root Digital Asset Links 의존
- [ ] Preview 실제 화면 사용자 승인

자동 Gate: **critical FAIL 0 / data-loss 코드경로 0 / update regression 0**

실기기 완료 Gate: 실제 대상 기기에서 수동 항목 PASS + offline cold start PASS + 학습기록 data loss 0.  
Stage 24 Production Release는 위 실기기 확인 및 사용자 명시 승인 전까지 시작/승격하지 않는다.

---

# Stage 23A — Full Hierarchical Navigation 3.0

상태: **Stage 23A CLOSED / USER PROCEED AUTHORIZED · Stage 23B ACTIVE — REALISTIC PATIENT ILLUSTRATION MIGRATION**

목표: 앱 전체를 “한 화면 아래로 내용이 계속 붙는 구조”에서 벗어나, 각 선택이 **독립 화면 전환**으로 느껴지는 계층형 UI로 통일한다.

## 공통 화면 계약
1. 1단계: 상위 목차만 표시
2. 2단계: 선택한 항목의 하위 목록만 표시
3. 3단계: 선택한 항목의 상세만 표시
4. 4단계: 심화학습 목차
5. 5단계: 선택한 심화 콘텐츠만 표시

> **해부학 A2 예외:** v11.14 기준선 보존을 위해 해부학은 3단계 `부위 → 근육 목록 → 근육 상세`까지만 독립 view다. 근육 상세의 기본정보/해부도해/초음파/임상/심화·학습 5개 탭은 4·5단계 deep view를 만들지 않고 같은 상세 화면에서 content swap한다.

각 전환 시:
- 기존 단계 콘텐츠는 화면에서 제거/숨김
- 새 단계는 viewport top에서 시작
- 뒤로가기 / 상위목차 / breadcrumb 제공
- 사용자가 “아래로 내려가면 새 내용이 생겼다”는 경험 0
- browser/Android back과 내부 back의 의미를 일치시킴

## 적용 순서
- [x] **A1. 공통 navigation shell / view-state / history contract** — drill screen 공통 전환·viewport reset·history helper
- [x] **A2. 해부학 부위 — COMPLETE** — root cause 수정, 14개 부위 × 5탭 browser E2E PASS, Live Preview PASS, 사용자 실기기 Preview 확인 완료
- [x] **A3. 환자 운동·스트레칭** — 부위만 → 근육만 → 운동목차 → 운동 1개 상세 독립 화면
- [x] **A4. 증상으로 찾기** — 증상군만 → 증상만 → 관련 구조/감별 학습목차 → 선택 상세 독립 화면
- [x] **A5. 임상 모듈 — CLOSED / USER PROCEED AUTHORIZED** — 10개 모듈 계층화 + Stable ID direct route. 사용자가 2026-09-28 `다음 작업 진행`을 명시하여 A6 진입 승인. 별도 A5 실기기 시각 PASS를 했다고 기록하지 않음
- [x] **A6. 초음파 — CLOSED / USER PROCEED AUTHORIZED** — 독립 초음파 탭 → 10개 부위/구조 → 131 canonical view → 단일 상세. 사용자가 2026-09-28 `진행해`로 A7 진입 승인. 별도 A6 실기기 시각 PASS로 오기하지 않음
- [x] **A7. 퀴즈 — CLOSED / USER PROCEED AUTHORIZED** — 사용자가 2026-09-28 `다음 작업 진행해`로 A8 진입 승인. 별도 A7 실기기 시각 PASS로 오기하지 않음
- [x] **A8. Oral Viva — CLOSED / USER PROCEED AUTHORIZED** — 사용자가 2026-09-28 `다음 작업 진행해`로 A9 진입 승인. 별도 A8 실기기 시각 PASS로 오기하지 않음
- [x] **A9. 내 학습 — CLOSED / USER PROCEED AUTHORIZED** — 사용자가 2026-09-28 `진행해`로 A10 진입 승인. 별도 A9 실기기 시각 PASS로 오기하지 않음
- [x] **A10. 홈/검색 — CLOSED / USER PROCEED AUTHORIZED** — 사용자가 2026-09-28 `진행해`로 Stage 23B 진입 승인. 별도 A10 실기기 시각 PASS로 오기하지 않음

## 완료 Gate
- 모든 top-level 탭에서 drill-down 단계가 독립 화면처럼 전환
- 하위 콘텐츠가 동일 화면 아래쪽에 append 되는 주요 경로 0
- 각 단계 진입 시 scrollTop=0
- Android/browser back dead-end 0
- 기존 Stable ID deep-link/학습기록/임상 흐름 회귀 0
- 360px/큰글자에서도 breadcrumb/back/navigation 사용 가능
- 사용자 Preview 실제 화면 승인

---

# Stage 23B — Patient Exercise Illustration 3.0

상태: **ACTIVE — USER-APPROVED REALISTIC STYLE / ASSET PIPELINE IN PROGRESS**

사용자 승인 스타일:
- 최종 환자교육 그림은 막대인간/추상 SVG가 아니라 **실제 사람처럼 보이는 실사형 의료·재활 교육 일러스트**
- 한 운동당 **1장 composite** 안에 `1 · 시작` / `2 · 끝` 두 패널
- 같은 사람·같은 복장·같은 시점으로 시작/끝 자세 연속성 유지
- 움직임 화살표 / 고정·지지 / 흔한 보상동작을 그림 안에서 바로 이해 가능하게 표시
- 한국어 라벨, 흰 배경, 모바일·A4 인쇄 대응
- 사용자 승인 스쿼트 샘플을 전체 18개 운동의 스타일 기준으로 사용
- 인터넷 무단 사진·워터마크·초상권 불명 자료 사용 금지
- 기존 SVG는 **migration fallback**으로만 유지하며 최종품으로 사용하지 않음

실사형 asset lifecycle:
- `PENDING_GENERATION → CANDIDATE_GENERATED → APPROVED` 순서를 지킨다.
- `gen_id`만 있고 저장소 WebP가 없는 후보는 완료가 아니다. 같은 후보를 매시간 다시 생성하지 말고 **binary materialization + Preview review**가 다음 작업이다.
- 재생성 프롬프트는 `scripts/build-realistic-exercise-prompt.mjs`가 style lock + generation_brief + approval blocker를 합쳐 만든 정본을 사용한다.
- 후보에 환자교육 정확성 문제가 있으면 `approval_blockers`를 남기고 교정 전에는 절대 `APPROVED`로 올리지 않는다.
- `APPROVED` 전에는 후보별 `candidate_review`의 **clinical_content / visual_pose / embedded_text** 3개 항목이 모두 `PASS`여야 한다. blocker가 없어도 이 세 항목이 PASS가 아니면 승인 금지.
- 승인 후보 파일 수용은 `scripts/ingest-realistic-exercise-asset.mjs`를 사용해 gen_id, blocker, WebP 형식, 최소 해상도, 세로형 비율을 검증한 뒤 Stable ID asset slot에 기록한다.
- 모바일 Preview 저해상도 자산은 `MOBILE_PREVIEW_APPROVED_A4_HD_PENDING`으로 표시하고, 고해상도 승인 전 A4 인쇄에서는 선명한 SVG fallback을 사용한다.
- **고해상도만으로 A4 승인하지 않는다.** A4용 asset은 최소 1240×1754px 조건과 별도의 명시적 시각검수를 모두 통과해야 `A4_HD_APPROVED`로 승격한다.
- A4용 고해상도 asset이 검수되면 같은 Stable ID/slot을 유지한 채 asset만 승격·교체한다.

현재 content-safety checkpoint — 2026-09-30:
- px001–px006의 기존 실사형 WebP는 **스타일 기준은 유지하되 콘텐츠 승인은 취소**했다.
- 이유: 원 레지스트리/CPG가 단일값으로 확정하지 않은 유지시간·반복횟수·세트 등의 고정 숫자가 이미지 안에 포함되어 있음.
- 기존 WebP 파일은 `candidate_asset_path`로 보존하지만 `composite_url=null`로 두어 앱 화면에서는 SVG fallback을 사용한다.
- px001–px006에는 `UNSUPPORTED_FIXED_DOSAGE_TEXT` blocker와 교정용 `generation_brief`를 부여했다.
- px007의 `HAND_INTRINSIC_MOTION_MISMATCH`, px009의 `SQUAT_KNEE_TOE_ABSOLUTE_CUE` blocker도 유지한다.
- px001은 2026-09-30 고정 숫자 제거 → 3중 검수 → canonical ingest까지 완료해 mobile Preview `APPROVED`로 복귀했다.
- px001–px005는 2026-09-30 고정 숫자 제거 → 3중 검수 → canonical ingest까지 완료해 mobile Preview `APPROVED` 상태다.
- manifest-derived selector의 현재 첫 작업은 **px006 / REGENERATE_FROM_LOCKED_BRIEF**다.
- blocker가 있는 후보가 runtime에서 실사 이미지로 노출되면 E2E FAIL 처리한다.

현재 Stage 19의 운동 그림은 **기능 검증용 개념형 SVG**이며 최종 환자교육 품질로 보지 않는다.

목표:
- [ ] 18 actionable profile 전수 재도해
- [ ] 사람의 실제 비율에 가까운 몸통·팔·손·손가락·하지 표현
- [ ] 시작자세와 끝자세를 한눈에 구분
- [ ] 움직임 방향 / 지지점 / 고정점 / 흔한 오류를 그림에서 직접 이해
- [ ] 손·손가락이 기호/만화처럼 보이는 표현 제거
- [ ] 환자에게 인쇄·공유해도 어색하지 않은 임상교육용 스타일
- [ ] 모바일과 A4 모두 가독성 유지
- [ ] 근거 없는 동작/가동범위/반복횟수 시각적으로 임의 생성 금지
- [ ] 최종 시각검수 전 기존 개념 SVG를 “완성품”으로 표시하지 않음
- [ ] **환자교육 curated video** — 운동 profile별 고품질 YouTube 영상 0~N개를 검수해 연결
- [ ] **초음파 curated video** — canonical view별 probe 위치/orientation/landmark/실제 B-mode 교육성이 높은 YouTube 영상 연결
- [ ] 영상은 다운로드·재호스팅하지 않고 YouTube 링크/허용된 embed만 사용
- [ ] uploader가 embed를 막으면 “YouTube에서 보기” 외부 링크로 fallback
- [ ] 대학병원·의과대학·전문학회·전문 초음파교육기관·공신력 있는 재활기관 우선
- [ ] 정확한 구조/운동을 보여주지 않거나 광고성·과장성·출처 불명 영상은 제외
- [ ] title / channel / language / duration / topic / canonical target / last_verified / embed_allowed metadata 관리
- [ ] 삭제·비공개·URL 변경을 정기 source-health QA에서 감시
- [ ] 영어 영상은 YouTube 제공 한국어 자동번역 자막이 있으면 우선 사용
- [ ] 자막이 불충분하거나 없는 경우 앱내 **한국어 핵심 해설 + 타임스탬프**를 별도 제공
- [ ] 전체 한국어 번역자막/더빙은 CC BY·Public Domain·명시적 허가 등 파생저작 허용 조건이 확인된 영상에만 적용
- [ ] 저작권 불명확 영상은 원본 임베드 + 독자적 한국어 교육요약만 제공하고 원문 전체 번역/더빙 재배포는 금지
- [ ] 허가된 영상의 한국어 TTS 더빙은 원본 음성과 별도 트랙으로 제공하고 원본 출처·라이선스를 명시

## Stage 23B-Disease Rehab — 대표 질환별 환자 재활교육 1.0

상태: **MANDATORY / MUST IMPLEMENT BEFORE STAGE 23C**

목표:
- 근육 단위 운동만 제공하지 않고, 환자가 실제로 진단받는 **대표 정형외과 질환 단위의 재활교육 프로그램**을 제공한다.
- 각 프로그램은 환자가 앱에서 직접 찾아보고 병원에서 A4로 바로 인쇄해 받을 수 있어야 한다.
- 사용자 예시인 **오십견, 극상근 파열/회전근개 질환, 극상근 스트레칭·강화, 퇴행성 관절염**을 반드시 포함 후보로 유지한다.
- 사용자 표현 **“퇴행성 통증 증후군”, “연골 낭종”**은 삭제하지 않고 원문 아이디어로 보존하며, 실제 구현 전 표준 의학용어와 대응 질환을 근거 검토해 정규화한다.

환자용 모듈 공통 구조:
1. **이 질환은 무엇인가** — 환자가 이해할 수 있는 쉬운 설명
2. **지금 해도 되는 운동 / 피해야 할 상황** — 적응증·금기·red flag
3. **스트레칭** — 목적 / 시작자세 / 끝자세 / 빈도·강도(근거가 있을 때만)
4. **강화운동** — 초기 → 중간 → 기능회복 단계
5. **생활습관 교정** — 일상 자세, 작업·운동 조절, 체중/활동량, 수면·반복부하 등 질환별 관련 항목
6. **흔한 실수** — 통증을 참는 과부하, 보상동작, 너무 빠른 진행 등
7. **언제 병원에 다시 와야 하나** — 악화·신경학적 증상·잠김·불안정성·급성 외상 등 질환별 기준
8. **근거 / 최종 검토일** — CPG·systematic review·고품질 RCT 우선
9. **실사형 운동 일러스트** — 사용자 승인 Stage 23B 스타일
10. **A4 환자교육지 / 모바일 화면** — 같은 source-of-truth로 출력

최소 coverage matrix:
- **어깨·견갑대**: 유착성 관절낭염(오십견), 회전근개 건병증/파열(극상근 포함), 견봉하 통증 증후군, 석회성 건병증, 상완이두근 장두 건병증, 견관절 퇴행성 관절염
- **팔꿈치·전완**: 외측/내측 상과통, 원위 이두근·삼두근 건병증, 주관증후군, 요골터널/PIN 관련 보존적 교육
- **손목·손**: 드퀘르벵, 손목터널증후군, TFCC 보존적 관리, 방아쇠수지, 엄지 CMC 관절염, 결절종(ganglion cyst) 환자교육
- **고관절·골반**: 대전자통증증후군/둔근건병증, 고관절 퇴행성 관절염, FAI 보존적 재활, 내전근·햄스트링 근위부 건병증
- **무릎·대퇴**: 무릎 퇴행성 관절염, 슬개대퇴통증증후군, 퇴행성 반월상연골 병변 보존적 재활, 슬개건/대퇴사두근건 건병증, 거위발 통증
- **하퇴·발목·발**: 외측 발목 염좌, 아킬레스건병증, 족저근막병증, 후경골근건 기능장애/건병증, 비골근건병증, 발·발목 퇴행성 관절질환
- **경추**: 비특이적 경부통, 경추 신경근병증 보존적 재활, 경추성 두통 관련 운동교육
- **흉추·등·흉곽**: 비특이적 흉추통, 견갑흉곽 기능장애/자세 관련 통증의 운동교육
- **요추·천추**: 비특이적 요통, 요추 신경근병증 보존적 재활, 요추관협착증 운동·생활교육, 퇴행성 요추질환
- **복벽·코어**: 만성 비특이적 요통과 연계한 코어 조절/호흡 교육 범위에서 제공하며, 복벽 질환의 의학적 금기는 별도 분리

의학적 콘텐츠 원칙:
- 질환명·단계·수술 여부·급성/만성 상태에 따라 운동이 달라질 수 있으므로 **모든 환자에게 같은 프로그램을 자동 적용하지 않는다.**
- 회전근개 파열 등은 파열 크기·증상·수술 여부와 관계없이 같은 운동을 제시하지 않는다.
- 수술 후 재활은 별도 프로토콜로 분리하며 일반 보존적 프로그램과 섞지 않는다.
- 근거가 불충분한 반복횟수·가동범위·기간을 임의 생성하지 않는다.
- 환자교육지는 진료를 대체하지 않으며 진단 미확정·red flag 상황에서는 운동보다 평가/진료 안내를 우선한다.

앱 UX:
- `환자교육 → 질환별 재활 → 해부학 부위 → 대표 질환 → 재활 프로그램`
- 기존 `환자교육 → 부위 → 근육 → 운동` 경로도 유지
- 홈 통합검색에서 질환명을 검색하면 해당 환자교육 프로그램으로 direct route
- 임상 진단 상세에서 `환자에게 설명/재활교육` 버튼으로 연결
- 환자 모드에서는 전문용어보다 쉬운 설명을 먼저 표시하고 `의료진 설명`을 접어서 제공
- 각 질환 프로그램에서 `인쇄/PDF` 1-click 제공

완료 Gate:
- [ ] 위 10개 해부학 영역 모두 대표 질환 coverage 1개 이상
- [ ] 우선순위 질환군 전부에 쉬운 설명 + 운동 + 생활습관 + 금기/red flag + 근거 연결
- [ ] 해당 운동의 실사형 일러스트 연결
- [ ] A4 인쇄 clipping 0
- [ ] 모바일 환자 경로 실제 클릭 QA
- [ ] 검색/임상상세 direct route QA
- [ ] source/last-reviewed audit
- [ ] 사용자 Preview 검수
- [ ] **이 Gate를 통과하기 전 Stage 23C로 이동 금지**

완료 Gate: 18/18 실제 Preview 시각검수 + 환자가 그림만 보고 시작/끝/방향을 구분 가능 + clipping 0.


---

## Evergreen Content Extension Contract — 계속 업데이트되는 앱 구조

이 앱은 “한 번 완성하고 끝나는 앱”이 아니라 장기간 계속 갱신하는 정본으로 운영한다.

- **대표 해부도해**: 근육 Stable ID는 그대로 두고 representative anatomy asset slot만 더 좋은 검증 자산으로 교체한다.
- **실제 초음파**: canonical ultrasound view ID는 유지하고 actual B-mode image/video slot을 추가·교체한다. 생성형 B-mode는 금지한다.
- **근육별 재활**: 기존 환자교육 → 부위 → 근육 → 운동 경로를 유지하며 운동 profile을 registry에 계속 추가할 수 있어야 한다.
- **질환별 재활**: 환자교육 → 질환별 재활 → 부위 → 질환 → 프로그램 구조에서 질환과 운동을 계속 추가할 수 있어야 한다.
- 모든 새 콘텐츠는 가능한 경우 source, license, last-reviewed, asset/status, 관련 Stable ID를 가진다.
- 새 항목 추가 때문에 navigation 구조나 기존 Stable ID를 다시 설계하지 않는다.
- 사용자가 개발 중 새 아이디어를 제안하면 Idea Register에 먼저 저장하고 중요도·의존성을 평가한 뒤 로드맵 순서에 배치한다.
- 회귀버그·환자안전·데이터손실·Production 오염·release blocker가 아닌 한, 새 아이디어가 현재 Active Stage를 가로채지 않는다.

---

# Stage 23C — Integrated Real Device & Visual Gate

상태: **QUEUED — Stage 23A + 23B 후 최종 실행**

- Stage 23 기존 자동 device/offline gate 재실행
- 전 탭 계층 navigation 실제 Android 검수
- exercise illustration 실제 화면/인쇄 검수
- offline cold start / online recovery
- auto update / pull refresh
- Oral mic / TTS
- print / share
- 세로·가로 / 작은 화면 / 큰글자
- 학습기록 data loss 0
- critical FAIL 0
- 사용자 Preview 최종 승인

Stage 23C를 닫기 전에는 Google Play Production Release로 넘어가지 않는다.

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
- 대표 해부도해는 더 좋은 whole-muscle / course / origin-insertion 시야가 확보되면 Stable ID를 유지한 채 asset slot 교체
- 공개·검증 실제 초음파 image/video source 지속 탐색
- 기존 source보다 교육성이 명확히 좋을 때만 canonical 승격
- 링크 단절 / license 변경 감시
- 근육별 운동·스트레칭과 질환별 재활은 registry에 계속 추가 가능하게 유지
- 근육 O/I/F/N 수정은 Stable ID 유지
- 실제 환자/EMR/PHI를 Atlas에 넣지 않음
- 이 Refresh 트랙은 **비선점(non-preemptive)** 운영이 원칙이다. 회귀·안전·release blocker가 아니면 현재 Active Stage보다 먼저 끼워 넣지 않는다.

# 현재 바로 시작할 순서

**Stage 23B 실사형 운동 일러스트 18종 제작/검수 → Stage 23B-Disease Rehab 대표 질환별 환자 재활교육 → Stage 23C → Stage 24**

대표도해 미확보 항목 재탐색, 초음파 direct-embed 후보 탐색, 신규 근육/질환 콘텐츠 제안은 모두 위 주 개발선과 별도의 **Evergreen Refresh backlog**로 보존하며 주 개발선을 중단시키지 않는다.


## A2 회귀 복구 Gate — 2026-09-27

상태: **CLOSED — A2 COMPLETE / USER DEVICE PREVIEW PASS**

재현 경로:
- 홈
- 해부학 위치 찾기
- 경추·상지·견갑대 등 임의 부위 선택
- 기대: 해당 부위 근육 목록
- 실제: 흰 화면 / 근육 목록 미표시

복구 절차:
- [x] 실제 browser click으로 재현되는 E2E test 작성
- [x] runtime console/page error 캡처
- [x] 공통 drill navigation state/render 원인 규명 — documentElement이 drill registry selector에 섞여 html.hidden=true가 되는 구조 결함
- [x] DOM visibility/state source-of-truth 정리 — 실제 screen registry와 drillNavigationState 분리
- [x] 14개 모든 부위 근육 수 canonical data 대조 — browser E2E PASS
- [x] 각 부위 첫 근육 클릭 → v11.14 기본정보 상세 visible 확인 — browser E2E PASS
- [x] 14개 모든 부위에서 5개 가로 탭 전수 클릭 → same-screen 유지 / content non-empty / tab history 증가 0 검증
- [x] 실제 browser back 2회 → 근육 목록 → 해부학 부위 복귀 검증
- [x] Stage 15~23A 전체 QA PASS
- [x] 실제 Preview 화면 사용자 확인 — 2026-09-28

금지:
- 특정 경추 버튼만 예외처리
- setTimeout으로 억지 표시
- CSS !important 덧대기로 원인 은폐
- 중복 DOM 삽입
- 사용자 확인 전 COMPLETE 처리


### A2 root cause 기록 — 2026-09-27
- 공통 setDrillView가 document.documentElement에 data-drill-group/data-drill-view를 상태표시용으로 기록
- 다음 전환 때 querySelectorAll('[data-drill-group=...]')가 실제 drill screen뿐 아니라 html까지 수집
- html의 이전 view와 새 view가 다르면 html.hidden=true 실행
- 결과: 내부 근육 목록은 정상 렌더링되지만 문서 전체가 display:none이 되어 흰 화면
- 구조 수정: 실제 registry는 .drill-screen[data-drill-group=...]로 제한
- runtime state는 별도 drillNavigationState + data-active-drill-* 진단 속성으로 분리
- 존재하지 않는 group/view는 fail-fast
- Playwright browser E2E에서 14개 부위 전수 PASS
- A2 최종 닫기 조건 충족: 사용자 실기기 Preview 확인 완료 — 2026-09-28


### Anatomy UX Baseline Gate — v11.14 LOCKED

- [x] v11.14 Precision Anatomy 코드 정본 SHA 확인: `e6dc0492a4d16d0536e15db3f6162b8ec57ee757`
- [x] 근육 상세 헤더 유지
- [x] 가로 탭 5개 유지: 기본정보 / 해부도해 / 초음파 / 임상 / 심화·학습
- [x] 세로형 학습목차 카드 제거
- [x] 근육 클릭 즉시 기본정보 탭 활성 + Origin/Insertion/Function/Nerve/Blood supply/촉지/임상 핵심/초음파 핵심 표시
- [x] 탭 선택 → 같은 근육 상세 화면에서 콘텐츠만 교체
- [x] anatomy deep 화면/history 계층 없음
- [x] selected tab active 상태 표시
- [x] browser back → 현재 부위 근육 목록 복귀
- [x] 실제 browser E2E 추가
- [x] 실제 Preview 사용자 시각 확인 — 2026-09-28


### v11.45 v11.14 anatomy contract lock — COMPLETE / USER DEVICE PREVIEW PASS
- v11.14 기준 SHA: `e6dc0492a4d16d0536e15db3f6162b8ec57ee757`
- anatomy 계층은 **부위 → 근육 목록 → 근육 상세** 3단계만 독립 화면
- 근육 클릭 즉시 **기본정보** 활성
- 동일 화면에 Origin / Insertion / Function / Nerve / Blood supply / 촉지 / 임상 중요점 / 초음파 핵심 즉시 표시
- 가로 탭 5개를 v11.14 고정 DOM으로 복원: 기본정보 / 해부도해 / 초음파 / 임상 / 심화·학습
- 탭 클릭은 새 화면/history를 만들지 않고 같은 근육 상세 화면 콘텐츠만 교체
- 별도 anatomy deep screen / 세로형 학습목차 없음
- Navigation 3.1은 screen registry와 runtime state 분리를 유지
- Global QA PASS
- Playwright 390×844 실제 브라우저: 14개 부위 전수 → 근육목록 → 첫 근육 → 각 5개 탭 전수 전환 → 실제 browser back 2단계 검증
- runtime error 0
- 사용자 실기기 Preview 확인 완료 — 2026-09-28
- A2 COMPLETE. 다음 작업선은 A5 임상 모듈.

### v11.46 · A5 Clinical Drilldown 3.1 — AUTOMATED PASS / LIVE PREVIEW PASS / USER VERIFY PENDING
- 기존 10개 임상 모듈 전체 세로 누적 화면을 계층형 navigation으로 교체
- 흐름: 임상 모듈 10개 → 감별진단/진찰법/초음파 View → 세부 항목 목록 → 단일 상세
- 기존 148개 진찰검사, 10개 모듈 감별 데이터, 131개 초음파 View Stable ID를 source-of-truth로 유지
- 감별 상세: 후보별 지지 단서 / 반대·제한 단서 / Red flag 경계
- 진찰 상세: 목적 / 방법 / 양성 기준 / 해석 / 한계·흔한 오류 / Stable ID
- 초음파 상세: 환자 자세 / Probe 위치·방향 / Landmark / 정상 확인 / Pitfall / Stable ID / 기존 검수 media
- 기존 근육 기반 Clinical Learning Flow에서 임상 단계로 직접 진입할 때도 동일 A5 hierarchy 사용
- browser/Android history: 상세 → 목록 → 학습항목 → 임상 모듈
- Global QA PASS
- Chromium Runtime E2E: 10개 임상 모듈 × 감별/진찰/초음파 → 첫 항목 상세 → browser back 전수 PASS
- Cloudflare Branch Preview 배포 PASS
- 라이브 Preview 경추 → 진찰법 → Spurling 검사, 경추 → 초음파 → SCM·경장근 횡단면 직접 클릭 PASS
- 사용자 실기기 Preview 승인 전 A5 COMPLETE 처리 금지
- A5는 사용자 `다음 작업 진행` 지시로 2026-09-28 다음 단계 진입 승인. 별도 A5 실기기 시각 PASS로 오기하지 않음

### v11.48 · A6 Ultrasound Drilldown 3.1 — AUTOMATED PASS / USER VERIFY PENDING
- 독립 top-level `초음파` 탭 추가
- 기존 해부학 v11.14 내부 `초음파` 가로탭은 변경하지 않음
- 기존 A5 임상 모듈의 초음파 경로도 변경하지 않음
- 계층: 10개 부위/구조 목차 → 해당 부위 canonical view 목록 → 단일 view 상세
- 각 부위 카드에 canonical view 수와 연결 target structure 수/요약 표시
- 상세는 A5와 동일한 canonical ultrasound renderer를 공유하여 source of truth 중복 방지
- 상세 필드: 환자 자세 / Probe 위치·방향 / Landmark / 정상 확인 / Pitfall / Stable ID / 기존 검수 media
- 10개 부위 canonical view 총합 131 유지
- browser history: view 상세 → 해당 부위 view 목록 → 초음파 부위/구조 목차
- Global QA / Stage 15~23A static QA PASS
- Playwright Runtime E2E: 10개 부위 전수, 각 첫 view 상세, 필수필드, browser back, 총 131 view PASS
- Cloudflare Preview 배포 PASS
- TinyFish 미사용. 자동 browser 검증은 GitHub Actions Playwright만 사용
- 2026-09-28 사용자 `진행해` 지시로 A6 다음 단계 진입 승인. 별도 A6 실기기 시각 PASS로 오기하지 않음
- A7은 자동 QA/Preview 배포 완료 후 사용자 시각 확인 또는 명시적 다음 단계 진행 승인 전까지 COMPLETE 처리 금지

### v11.49 · A7 Quiz Drilldown 3.1 — AUTOMATED PASS / USER VERIFY PENDING
- 기존 단일 `quizArea` 덮어쓰기 구조를 공통 drill navigation으로 분리
- 계층: 모드/부위 선택(setup) → 문제 세션(session) → 결과/오답(result)
- setup에는 부위 / 문제유형 / 문제방향 + 일반/오답/오늘복습 + 10개 임상모듈 시작점을 유지
- session에는 현재 문제·4개 선택지·즉시 피드백·다음 문제만 표시
- result에는 세션 점수·정답률·이번 오답 근육 목록·재학습 action을 별도 표시
- 기존 `mskQuizProgressV2` / `mskQuizProgressV1` 학습기록 호환 유지
- 기존 weighted wrong/due selection 및 spaced-review nextDue 계산 유지
- 10개 임상모듈 퀴즈도 모두 동일 A7 session renderer/state로 통합
- 근육 집중 10문제도 동일 A7 session으로 통합
- result는 terminal state로 current history를 replace하여 browser back이 설정 화면으로 복귀
- Global QA / Stage 15~23A static QA PASS
- Playwright Runtime E2E: 일반 경추 퀴즈 실제 전 문항 응답 → 결과 → browser back PASS
- Playwright Runtime E2E: 경추 임상 10문제 → 공통 session 진입 → browser back PASS
- Cloudflare Preview 배포 PASS
- TinyFish 미사용
- 사용자 Preview 승인 또는 다음 단계 진행 승인 전 A7 COMPLETE 처리 금지

### v11.50 · A8 Oral Viva Drilldown 3.1 — AUTOMATED PASS / USER VERIFY PENDING
- 기존 한 화면 Oral을 `setup → session → result` 3개 독립 drill screen으로 분리
- setup: 부위 / 시험관 수준 / 질문 분야 / 음성 선택
- session: 현재 질문 / 자유답변 / 마이크 / 질문 다시 듣기 / 채점·교정 / 즉시 교정질문 / 꼬리질문
- result: 정답·부분정답·보완 필요 요약 + 취약 질문 분야 + 다시 볼 근육
- 기존 `mskOralProgressV2` 학습기록 구조 보존
- 기존 friend / colleague / senior / master 시험관 말투와 채점 threshold 보존
- 기존 SpeechRecognition / TTS / 직접입력 fallback 보존
- 질문별 grade/score를 세션 메모리에 기록해 결과화면 약점 집계에 사용
- result는 terminal history replace 처리하여 browser back이 Oral 설정으로 복귀
- 근육 직접 진입 `startOralForMuscle(m001)`은 흉쇄유돌근 집중 Viva 문맥 유지
- Global QA / Stage 15~23A static QA PASS
- Playwright: 첫 문제 의도적 오답 → 즉시 교정질문 → 나머지 정답 → 결과·약점 화면 PASS
- Playwright: 결과 → browser back → setup PASS
- Playwright: m001 직접 Viva → fixed muscle context PASS
- Cloudflare Preview 배포 PASS
- TinyFish 미사용
- 사용자 Preview 승인 또는 다음 단계 진행 승인 전 A8 COMPLETE 처리 금지
- 2026-09-28 사용자 `다음 작업 진행해` 지시로 A8 다음 단계 진입 승인. 별도 A8 실기기 시각 PASS로 오기하지 않음

### v11.51 · A9 Personal Learning Drilldown 3.1 — AUTOMATED PASS / USER VERIFY PENDING
- 기존 한 화면 4패널 구조를 `내 학습 목차 → 개별 기록 화면`으로 분리
- root에는 학습한 근육 / 즐겨찾기 / 취약 근육 / 오늘 복습 요약 숫자와 4개 목차만 표시
- 독립 화면 4개: 최근 본 항목 / 즐겨찾기 / 오답·약점 자동 모음 / 부위별 학습지표
- 최근 본 항목은 기존 저장 한도 30개까지 표시
- 즐겨찾기는 기존 저장 한도 100개까지 표시
- 오답·약점은 Quiz 오답 + Oral 보완 + 오늘 복습을 기존 combinedWeakness 로직으로 유지
- 부위별 학습지표는 기존 Quiz·Oral 기반 regionMasteryRows 계산을 그대로 사용
- `mskPersonalLearningV1` / `mskQuizProgressV2` / `mskOralProgressV2` 저장구조 변경 없음
- 학습기록 JSON 내보내기/가져오기 schema `lys-muscle-learning-v1` 그대로 유지
- browser back: 최근/즐겨찾기/약점/mastery → 내 학습 목차
- Global QA / Stage 15~23A static QA PASS
- Playwright: 4개 목차 실제 클릭 → 각 독립 화면 데이터 확인 → browser back 전수 PASS
- Cloudflare Preview 배포 PASS
- TinyFish 미사용
- 사용자 Preview 승인 또는 다음 단계 진행 승인 전 A9 COMPLETE 처리 금지
- 2026-09-28 사용자 `진행해` 지시로 A9 다음 단계 진입 승인. 별도 A9 실기기 시각 PASS로 오기하지 않음

### v11.52 · A10 Home Search Navigation Lock — AUTOMATED PASS / USER VERIFY PENDING
- 홈 검색 출발 상태에 검색어 / 항목필터 / 스크롤 위치를 저장
- 검색 결과 클릭 시 중간 계층 history를 쌓지 않고 정식 상세 목적지 하나만 push
- 근육 검색 → v11.14 해부학 개별 근육 상세
- 증상 검색 → 해당 증상 학습목차 화면
- 진찰검사 검색 → A5 해당 진찰검사 단일 상세
- 감별개념 검색 → A5 해당 감별군 상세에서 해당 Stable ID 표시
- 초음파 View 검색 → A6 독립 초음파 단일 상세
- 해부학 부위 검색 → 해당 부위 근육 목록
- 별도 상세화면이 없는 건/신경/관절/점액낭/인대/근막은 관련 canonical 근육 상세로 연결
- browser back 1회로 검색 전 홈으로 복귀하며 검색어와 필터를 그대로 복원
- 홈의 주요 증상 바로가기 5개도 동일 direct-route contract 사용
- 기존 Stable ID 검색 순위와 즐겨찾기/최근기록 로직 보존
- Global QA / Stage 15~23A static QA PASS
- Playwright 실제 검색 전수: m001 / sx01 / ct082 / d089 / usv074 목적지 + history 1-entry + one-back 복귀 PASS
- Cloudflare Preview 배포 PASS
- TinyFish 미사용
- 2026-09-28 사용자 `진행해` 지시로 A10 다음 단계 진입 승인. 별도 A10 실기기 시각 PASS로 오기하지 않음
- Stage 23B 시작 승인 완료

### v11.47 · A5 Clinical Direct Route Lock — AUTOMATED PASS / LIVE PREVIEW PASS / USER VERIFY PENDING
- A5 Runtime E2E 상세 계약 강화: 10개 모듈의 감별/진찰/초음파 첫 상세에서 필수 필드 전수 확인
- 감별 상세: 지지 단서 / 반대·제한 단서 / Red flag
- 진찰 상세: 목적 / 방법 / 양성 기준 / 해석 / 한계·흔한 오류 / Stable ID
- 초음파 상세: 환자 자세 / Probe 위치·방향 / Landmark / 정상 확인 / Pitfall / Stable ID
- 통합검색의 clinical_test / diagnosis_concept / ultrasound_view는 관련 근육 proxy를 거치지 않고 Stable ID 자체로 A5 상세에 직접 진입
- 초기 데이터 로딩 타이밍에도 direct route가 실패하지 않도록 미로드 모듈을 보장 로딩 후 재해석
- 실제 browser E2E: ct082 / d089 / usv074 검색 직접 진입 PASS
- 근육 m001 → 임상 흐름 계속 → A5 단일 상세 + muscle_id 문맥 유지 PASS
- Global QA run 36376511768 SUCCESS
- Cloudflare Preview 배포 SUCCESS
- 라이브 Preview에서 ct082 / d089 / usv074 직접 검색·진입 검수 PASS
- A5는 사용자 실기기 승인 전까지 USER PREVIEW VERIFY PENDING 유지
