# LYS Ortho Muscle Atlas — Next Upgrade Roadmap


## ORTHOPEDIC_DISEASE_TRAUMA_MODULE — Claude 24권 native 흡수 / ACTIVE 2026-10-08

상태: **ACTIVE / SHOULDER 2/2 NATIVE / MAIN FROZEN**

- 24권 원본 inventory 유지. `odt001 Shoulder Disease`와 `odt002 Shoulder Trauma`가 모두 10개 장 native Preview로 동작한다.
- Shoulder Trauma 원본은 604,728 bytes / SHA-256 `47b0b42a12f7d1e509d17e8ef8cc97a8ffb27d1930ba08e32b37073589d4d2ef`로 잠근다.
- 외부 Artifact/iframe/`/_blob` 의존성을 만들지 않는다.
- 기존 근육·Physical Examination·Ultrasound Stable ID와 교차연결하고 환자 Disease Rehab는 덮어쓰지 않는다.
- 그림은 provenance/license를 보존하되 low-resolution/base64/제3자 자료를 canonical asset으로 자동 승격하지 않는다.
- 음성 MP4 미포함은 fail-closed migration pending으로 유지한다.\n- `scripts/disease-trauma-native-qa.mjs`를 24권 공통 gate로 사용해 native status↔content 일치, SHA/bytes, chapter/ref/figure 무결성, Stable-ID cross-link, 외부 그림 license, unsafe Claude URL 0을 자동 검사한다.
- Shoulder Trauma는 source citation 10개에 더해 2025–2026 **핵심 선택적 evidence refresh**를 적용한다. 특히 first-dislocation stabilization, ER-vs-IR immobilization, traumatic cuff timing, proximal humerus fracture, clavicle CPG, AC injury를 재검증하며 전체 canonical review는 별도 gate로 남긴다.
- 순서: **shoulder 2권 사용자 Preview 검수 → odt003 Elbow Disease → odt004 Elbow Trauma → elbow 2권 정교화 → 나머지 20권 batch migration**.


기준일: 2026-10-02  
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

## Deployment Safety Baseline — QPU 경량 통합 / 2026-10-01

상태: **DEV COMPLETE / CI PASS — LIGHTWEIGHT GATE 2/2 COMPLETE (2026-10-02) / server-side ruleset admin action optional**

목적:
- H3Y Ledger의 복잡한 DB migration/recovery 체계를 복제하지 않고, 정적 의료교육 PWA인 Muscle Atlas의 실제 위험에 맞는 상위 배포 Gate를 둔다.
- 기존 `preview/development`, `main` Production freeze, Global QA, Cloudflare Pages Preview, PWA/Service Worker QA, Runtime E2E를 재사용한다.
- 새 workflow를 여러 개 늘리지 않고 **기존 Global QA + 1개의 경량 deploy-safety preflight/gate**를 목표로 한다.

정본 branch 계약:
- `main` = Production.
- `preview/development` = 유일한 장기 개발 정본.
- Production 승격은 사용자(의장) 명시 승인 전까지 금지한다.
- Cloudflare commit-hash URL은 exact deployment 검증용 immutable Preview이며, 설치 PWA 주소로 사용하지 않는다.
- 설치/사용자 검수용 개발 주소는 `https://preview-development.muscle-atlas-chatgpt.pages.dev`로 유지한다.

현재 확인된 기준점:
- `preview/development` HEAD: `be207b0c530504653f64dd3f9ff801e3917b0824`
- `main` HEAD: `4ba8740ca6655ab1d4bebca84b26e39290c61bf7`
- preview HEAD의 GitHub checks: Global QA PASS / Runtime Navigation E2E PASS / Cloudflare Pages PASS.
- Cloudflare check가 preview HEAD `be207b0...`에 exact deployment `https://7260d23b.muscle-atlas-chatgpt.pages.dev`와 branch alias를 연결하고 있음.
- stable Preview와 exact deployment는 현재 `v11.83`; Cloudflare Production과 GitHub Pages fallback은 모두 `v11.10`으로 서로 일치하며 Preview와의 차이는 의도된 Production freeze다.

경량 상위 Gate 목표 흐름:
`Preflight → 수정 → Global QA → exact SHA Preview → URL/PWA smoke → 실기기 visual QA → 사용자 승인 → Production`

필수 경량 항목:
1. **PASS** — main=Production / preview-development=개발 정본 문서 계약.
2. **PARTIAL** — Cloudflare Pages project read-only preflight. GitHub Cloudflare check로 project/deploy 연결은 확인 가능하나, Dashboard의 production branch/build settings를 자동 read-only 검증하는 단일 gate는 아직 없음.
3. **PASS (evidence exists) / PARTIAL (gate missing)** — 실제 Cloudflare deployment가 GitHub commit SHA에 연결되는 증거는 Cloudflare GitHub check에 존재하나, 상위 gate가 이를 자동 비교해 fail-close하지는 않음.
4. **PARTIAL** — stable branch Preview URL smoke는 실제 브라우저/수동 검증 중이나, exact immutable URL + stable alias를 같은 SHA 기준으로 자동 smoke하는 상위 gate는 없음.
5. **PASS** — manifest/service-worker/cache/auto-update 정적 QA와 real-device/offline QA가 이미 Global QA에 포함됨.
6. **PARTIAL** — Cloudflare Production과 GitHub Pages fallback drift는 현재 버전 비교상 일치하지만 자동 drift 검사 없음.
7. **PARTIAL** — 모바일/PC visual QA는 Runtime E2E + 사용자 실기기 Preview 확인 원칙이 있으나 배포 gate의 명시적 checklist artifact로 묶여 있지 않음.
8. **PARTIAL** — 사용자 승인 없이는 main 승격 금지라는 강한 문서 규칙은 있으나 GitHub server-side ruleset은 현재 확인된 rulesets 목록 기준 비어 있으며, classic branch protection은 integration 권한상 read-only 확인 불가. 따라서 기술적 promotion guard는 강화 필요.

구현 원칙:
- Stage 23B 콘텐츠 작업을 중단하는 인프라 대공사 금지.
- 기존 `.github/workflows/global-qa.yml`을 중심으로 재사용.
- 가능하면 새 workflow 0개, 최대 1개의 경량 promotion/preflight entry만 허용.
- exact SHA 검증은 Cloudflare GitHub check의 `head_sha` + immutable Preview URL 증거를 우선 활용하고, 필요 시 Cloudflare build-time commit metadata를 추가한다.
- Production promotion은 `preview/development`의 승인된 exact SHA가 Global QA/E2E/Cloudflare Preview smoke를 모두 통과하고 사용자 승인 표식이 있을 때만 진행한다.
- GitHub Pages는 fallback으로 유지하되 Cloudflare Production과 version/build drift를 검사한다.

명시적 NOT NEEDED:
- D1 migration/recovery
- R2 evidence restore
- 금융 transaction rollback
- broker capability gate
- 서버 DB snapshot/restore orchestration
- 현재 정적 PWA에 존재하지 않는 사용자계정/환자데이터용 복구 체계

강화 Profile 전환 조건:
- 서버 DB 도입
- 로그인/사용자계정 도입
- 환자데이터/PHI 저장
- 서버측 쓰기 API 또는 동기화 데이터 도입
위 조건 중 하나라도 생기면 본 경량 baseline을 재검토하고 강화 Profile로 승격한다.

예상 작업 회차:
- **1회차 완료 / PASS — 2026-10-02:** `scripts/deploy-safety-gate.mjs` + 기존 `.github/workflows/global-qa.yml`의 단일 `deploy-safety-gate` job으로 exact SHA/Cloudflare check/immutable Preview/stable branch alias/PWA smoke를 묶었다.
  - 검증 SHA: `e0ee6667a31fb517d60f5d7dc655b8f75ece59a9`
  - Cloudflare immutable Preview: `https://c0ee4408.muscle-atlas-chatgpt.pages.dev`
  - stable Preview: `https://preview-development.muscle-atlas-chatgpt.pages.dev`
  - Global QA PASS / Runtime E2E PASS / Deploy Safety Gate **24/24 PASS**
  - exact Preview와 stable Preview의 `app-version.js`가 checked-out SHA의 v11.90 release metadata와 일치함을 자동 확인
  - home / manifest / service worker HTTP 200 + PWA start_url/scope + canonical install-origin 계약 확인
  - CI evidence artifact를 SHA별로 14일 보존
- **2회차 완료 / PASS — 2026-10-02:** 같은 `deploy-safety-gate`에 Cloudflare Production↔GitHub Pages fallback release drift 검사를 추가하고, `DEPLOY_GATE_MODE=promotion` fail-closed preflight를 구현했다.
  - 검증 SHA: `ea5b83fd34db7c2588bf23ff07e553ff812d7b91`
  - exact Preview: `https://cd1ae3e0.muscle-atlas-chatgpt.pages.dev`
  - stable Preview: `https://preview-development.muscle-atlas-chatgpt.pages.dev`
  - Cloudflare Production = GitHub Pages fallback = `v11.10 · Cloudflare Preview Ready` / drift 0
  - preview HEAD exact SHA 확인 / main HEAD evidence 기록
  - Deploy Safety Gate **32/32 PASS**
  - Promotion mode는 `PROMOTION_APPROVED_BY_USER=YES`가 없으면 FAIL하며, 승격 대상 SHA의 Global QA / Runtime E2E / Deploy Safety / Cloudflare Pages 성공을 재확인한다.
  - 상세 계약: `docs/PRODUCTION_PROMOTION_GUARD.md`
- GitHub server-side ruleset/branch protection 생성은 현재 연결 App에 Administration 권한이 없어 자동 적용하지 못한다. 관리자 설정이 가능해지면 main direct push 제한 + required checks를 추가하는 것이 권장되지만, 현재 운영 계약상 사용자 승인 없는 main 변경은 계속 금지한다.

삽입 위치:
- 현재 Stage 23B 임상검사/콘텐츠 배치를 멈추지 않는다.
- **현재 EXAM-001 배치의 자연스러운 체크포인트 뒤**, Stage 23B-Disease Rehab 및 Stage 23C로 넘어가기 전 1~2개의 짧은 경량 작업으로 삽입한다.
- Stage 23C의 실기기 검증은 이 baseline의 URL/PWA/visual QA를 최종 재확인하는 release gate로 사용한다.

### 저작권 등록·증빙 LOCK — 2026-10-02
- 저작권 등록은 개발 종료 후 생각하는 부가업무가 아니라 자체 IP 제작 workflow에 포함한다.
- AI-only raw output은 등록 전략의 핵심 자산으로 보지 않는다. 인간의 해부학 교정·구도·레이어·라벨·overlay·편집·가필을 남겨 등록 가능한 인간 창작기여를 증빙한다.
- 첫 등록 실행 시점은 **경추–견갑대 ANATOMY-IP 파일럿 사용자 승인 직후**로 고정한다.
- 등록 전 한국저작권위원회에 작품 분류와 생성형 AI 활용 기재방법을 확인한다.
- 상세 정본: `docs/COPYRIGHT_REGISTRATION_STRATEGY.md`

## Anatomy IP / 3D / Layer / Motion / Copyright — 정식 개발 트랙 LOCK / 2026-10-02

상태: **LOCKED / MUST DEVELOP / COPYRIGHT-FIRST / STAGE 23C ENTRY BLOCKER**  
상세 계약: `docs/ANATOMY_IP_3D_MOTION_CONTRACT.md`  
저작권 정본: `docs/COPYRIGHT_REGISTRATION_STRATEGY.md`

이 트랙은 Idea가 아니다. **Stage 23C 이전 mandatory pilot**이며, 목표는 단순한 해부학 그림 추가가 아니라 Muscle Atlas가 자체 보유하는 고급 해부학 IP 제작 파이프라인을 만드는 것이다.

### 최종 품질 목표
- Grant / Netter / Gray / Thieme급 교본에서 기대하는 구조 정확도·깊이감·교육성을 목표로 한다.
- 단, 특정 교본의 도판·구도·선·색·mesh를 복제·트레이싱·near-copy하지 않는다.
- 해부학적 사실은 다수 reference로 검증하고, **시각표현은 Muscle Atlas가 독립 제작**한다.
- 생성형 AI는 concept/render assistant로 사용할 수 있으나 AI raw output 자체를 최종 자체 저작물로 승인하지 않는다.

### 핵심 Architecture — Master First
정본 제작 흐름은 다음으로 고정한다.

**해부학 사실 정본 → 자체 3D Canonical Master → 2D 교본판 / 3D Rotation / Layer Transparency / Muscle Action Animation 파생 → IP evidence → 저작권 등록**

2D와 3D를 서로 독립적으로 만들지 않는다.  
가능한 모든 최종 시각자산은 동일 Stable ID와 동일한 자체 3D Master에서 파생하여 origin/insertion/course/depth/action의 일관성을 유지한다.

### ANATOMY-KNOWLEDGE-001 — 해부학 사실 정본
- 각 근육 Stable ID별 origin / insertion / course / fiber direction / superficial-deep relation / adjacent bone·muscle / bilateral·unilateral action을 구조화한다.
- 사실 검증 reference와 시각표현 reference를 분리한다.
- 첫 파일럿: **경추–견갑대**.
- 첫 mandatory muscle: **Splenius capitis / 두판상근**.

### IP-EVIDENCE-001 — 저작권 증빙 즉시 시작
- 해부학 작업을 시작하는 날부터 `data/ip-asset-registry-v1.json` + `docs/ip-evidence/`를 함께 운영한다.
- stable_id / author-editor / creation date / reference facts / AI-tool usage / human anatomy correction / modeling decision / camera-composition / color-material-lighting / labels-overlay / before-after / master hash / Git SHA / review / user approval을 기록한다.
- evidence를 개발 종료 후 소급 작성하는 것은 금지한다.

### ANATOMY-MASTER-3D-001 — 자체 3D Canonical Master
- 전체 own-asset pipeline의 중심 원본.
- bones / landmarks / muscle body / tendon-aponeurosis / adjacent layer / origin-insertion anchor / left-right / neutral pose / action rig metadata를 포함한다.
- 자체 mesh를 기본으로 한다.
- 특정 외부 교본 mesh의 복제·형태 추종을 금지한다.
- glTF/GLB export + editable master를 모두 보존한다.

### ANATOMY-IP-2D-001 — 고해상도 2D 교본판
- 별도 AI 그림으로 새로 만드는 것이 아니라 3D Master에서 파생 후 사람이 교육용으로 편집한다.
- whole-muscle view / 대표 camera / origin-insertion-course / 주변 뼈 / depth cue / label on-off.
- camera, crop, shading, palette, label, callout을 인간이 결정·교정한다.
- 모바일 / PC / A4-HD를 모두 고려한다.

### IP-REG-001 Filing 1 — 첫 저작권 등록
- **Splenius capitis 3D Master + Master-derived 2D 교본판의 첫 완성 저작물 세트가 사용자 승인된 직후** 실행한다.
- 등록 직전 한국저작권위원회의 최신 작품분류·AI 활용 기재방법을 다시 확인한다.
- 단순 AI raw output은 filing master로 사용하지 않는다.
- **MANDATORY USER ACTION GATE:** ANATOMY-KNOWLEDGE 시작 직전, 첫 3D Master reviewable 시점, Filing 1 준비 시점, 사용자 승인 직후, 3D/Layer/Motion 완성 시점, Stage 23C PASS 직후마다 사용자가 먼저 묻지 않아도 저작권 준비·신청 필요사항을 반드시 보고한다.
- 사용자는 미리 CROS 회원가입/인증서를 준비할 수 있으나, 완성 전 raw/candidate를 서둘러 등록하지 않는다.
- Filing 1 직전에는 저작자·저작재산권자·개인/법인 귀속·외주/공동기여 여부를 사용자에게 확인한 뒤 진행한다.
- 상세 사용자 행동표: `docs/COPYRIGHT_REGISTRATION_STRATEGY.md`.

### ANATOMY-3D-VIEWER-001 — 3D Rotation
- 동일 Canonical Master를 실제 앱에서 rotate / zoom / reset.
- anterior / posterior / lateral quick view.
- muscle on/off / bone on/off / selected muscle highlight / label on-off.
- 모바일 touch + PC mouse.

### ANATOMY-LAYER-001 — 표층→심층 투명화
- skin / superficial / intermediate / deep / bone hierarchy.
- opacity slider.
- muscle group on/off.
- selected muscle isolation.
- 동일 3D Master의 실제 layer hierarchy를 제어한다.

### MOTION-ANIM-001 — Muscle Action Animation
첫 mandatory animation: **Splenius capitis**
- neutral
- bilateral contraction → cervical extension
- unilateral contraction → ipsilateral rotation
- unilateral contraction → ipsilateral lateral flexion
- contraction highlight
- motion arrows
- start / mid / end
- replay / pause
- 동일 3D Master rig에서 파생한다.

### 경추–견갑대 필수 Pilot
1. Splenius capitis / 두판상근
2. Levator scapulae / 견갑거근
3. Trapezius / 승모근
4. Sternocleidomastoid / 흉쇄유돌근
5. Scalenes / 사각근군
6. Suboccipital muscles / 후두하근군

두판상근 하나에서 **Knowledge → 3D Master → 2D → Rotation → Layer → Motion → Copyright evidence/filing** 전체 pipeline을 먼저 검증한 뒤 나머지 5개 근육으로 확장한다.

### Stage 23C 진입 Gate
다음을 모두 만족하기 전 Stage 23C COMPLETE 진입 금지:
- 경추–견갑대 own 3D Master pilot
- Master-derived 2D plate
- 3D rotation
- layer transparency
- muscle isolation
- Splenius capitis action animation
- IP evidence package
- Filing 1 준비 또는 실행 상태 명확화
- 전문의 anatomy review
- mobile / PC Preview QA
- 사용자 Preview 승인
- 특정 외부 교본 near-copy 0

### 전체 canonical 선후관계
**EXAM-001 148/148 COMPLETE  
→ Deployment Safety 2/2 COMPLETE  
→ EXAM-REAL-001 경추 실사형 pilot [현재 ACTIVE]  
→ Stage 23B Patient Exercise 실사형 잔여  
→ Stage 23B-Disease Rehab  
→ ANATOMY-KNOWLEDGE-001  
→ IP-EVIDENCE-001 시작  
→ ANATOMY-MASTER-3D-001 (Splenius capitis)  
→ ANATOMY-IP-2D-001  
→ IP-REG-001 Filing 1  
→ ANATOMY-3D-VIEWER-001  
→ ANATOMY-LAYER-001  
→ MOTION-ANIM-001  
→ 경추–견갑대 6-muscle pilot 확장  
→ IP-REG Filing 2/3  
→ Stage 23C Integrated Real Device & Visual Gate  
→ Stage 24 Google Play Production  
→ 205-muscle own-asset expansion evergreen**

자체 해부학 IP는 외부 representative anatomy refresh보다 상위의 정식 제품 개발선이다. 파일럿 후 205 canonical muscles로 확장하며 무기한 backlog로 보내지 않는다.

## 2026-10-01 사용자 실기기 피드백 · 개발정본 LOCK

아래 항목은 **아이디어 메모가 아니라 구현 계약**이다. 후속 개발에서 임의 삭제·축소·우회하지 않는다. 현재 Active Stage의 선후관계는 유지하되, 아래 항목을 완료 Gate에 반영한다.

### A. 환자 운동·스트레칭 실사 이미지 표시 품질
- 320×400px mobile-preview 이미지는 PC에서 너무 크게 확대해 흐려지지 않게 하고, 반대로 원본 320px 고정으로 지나치게 작게 보이지도 않게 한다.
- 현재 저해상도 Preview의 데스크톱 목표 폭은 **400 CSS px**, 원본 대비 최대 **1.25× soft-upscale**로 고정한다.
- 모바일에서는 viewport에 맞춰 자동 축소한다.
- 고해상도 승인 이미지가 들어오면 데스크톱 최대 720px / 72vh 상한을 적용한다.
- 320×400 저해상도 자산은 A4 인쇄에 사용하지 않고, A4-HD 승인 전까지 선명한 fallback을 사용한다.
- 표시 크기 변경은 반드시 실제 PC와 모바일 Preview에서 사용자 시각검수를 거친다.

### B. 정형외과 전문의 수준 Quiz
- 전문의 Case 모드에서는 O/I/F/N 단순 암기형과 답이 지나치게 뻔한 문항을 제외한다.
- 실제 진료형 **임상 증례 문제를 다수** 포함하고, 같은 증상군/감별군의 가까운 진단을 distractor로 사용한다.
- 자동출제 세션은 최소 20 / 40 / 80 / 120문제를 지원하고, 충분한 임상 데이터가 쌓이면 pool을 계속 확장한다.
- 정답 후 단순 정오만 표시하지 않고 지지 소견, 반대·제한 소견, red flag, 다음 임상 판단 포인트를 해설한다.
- 실제 전문의 시험 기출은 **공식 공개가 확인된 원문만** 연결한다. 비공식 복원문제·유료 문제은행을 무단 복제해 “실제 기출”로 표시하지 않는다.
- 공식 전문의 시험 출제범위·참고문헌·시행계획은 source registry로 유지한다.

### C. 감별진단 상세
- 감별 후보 각각은 클릭 가능한 독립 상세 패널로 제공한다.
- 모든 10개 임상영역의 diagnosis concept에 대해 최종적으로 **정의 / 병태생리 / 병력 / 진찰 / 검사·영상 / 치료원칙 / red flag / 흔한 함정 / 가까운 감별**을 교과서급으로 제공한다.
- 경추 d088–d099 12개는 1차본 완료. 나머지 9개 영역도 동일 스키마로 확장한다.
- “지지 단서”와 “반대·제한 단서”는 항상 남기고, 단일 검사나 영상소견을 확진처럼 표현하지 않는다.

### C2. 실사형 교육 일러스트 공통 스타일 LOCK — 2026-10-02
- **환자교육용 스트레칭·강화운동과 Physical Examination 둘 다** 최종 자산은 실제 사람처럼 보이는 실사형 의료교육 일러스트를 사용한다.
- 환자교육 운동은 문틀 스트레칭·경추 스트레칭 등 현재 승인 실사형 스타일을 기준으로 한다.
- Physical Examination도 별도의 단순 막대/개념형 최종그림으로 끝내지 않고, **실사형 환자 + 실사형 검사자 + 손 위치/힘 방향/양성소견 overlay** 구조로 최종 승격한다.
- 현재 EXAM-001의 Stable-ID 도해는 자세·손 위치·힘 방향을 전수 구조화하는 baseline이며, 이를 최종 실사형 완성품이라고 표시하지 않는다.
- 최종 Physical Examination illustration은 모바일/PC에서 실제 강의자료로 바로 쓸 수 있는 품질을 목표로 한다.
- 상세 정본: `docs/REALISTIC_HUMAN_ILLUSTRATION_STYLE_CONTRACT.md`

#### C2-HD. 고해상도 canonical 승격 LOCK — 2026-10-06
- 모든 신규 raster 실사형 교육 일러스트는 세로형 최소 **1024×1536 px**, 가로형 최소 **1536×1024 px**의 실제 고해상도 원본을 canonical/Preview 주 이미지로 사용한다.
- 240×360 / 320×480 / 600×900 파생본은 thumbnail/cache 용도로만 허용한다. 단순 pixel upscaling은 HD 완료로 인정하지 않는다.
- ct085 Shoulder abduction relief는 **1024×1536 HD_CANONICAL** 완료.
- 기존 저해상도 승인 raster **ct082, ct084, ct095, ct096, ct097, ct098**은 `HD_UPGRADE_REQUIRED`로 잠그고 실제 고해상도 품질로 재제작·사용자 검수 후 교체한다.
- ct090, ct093, ct094는 SVG vector이므로 `VECTOR_EXEMPT`.
- 현재 실행 순서: **ct086 HD 생성 → ct087 HD 생성 → 기존 6개 저해상도 raster HD migration → ct088 Hoffmann deferred revisit**.
- Physical Examination 해석은 각 항목에 `textbook_interpretation_narrative` 교과서형 연결 서술을 제공하며, 새로 건드리는 항목부터 강제하고 전 148개를 순차 보강한다.

### D. 진찰검사 상세 + 일러스트
- **2026-10-01 Batch 1 완료:** 어깨 canonical 11개(ct001–ct011)를 Stable ID 맞춤 도해로 교체했다. Jobe/Full can의 엄지 방향, painful arc 능동 거상, ER lag 지지 해제, lift-off 후면, belly-press 팔꿈치 보상, bear-hug 저항, Speed/Yergason 저항 방향, Neer 견갑 고정, Hawkins-Kennedy 90/90 내회전을 개별 preset으로 분리했다.
- 검사별 preset은 `data/clinical-exam-illustration-presets-v1.json`에서 관리하며, 각 항목에 환자 자세 좌표, 검사자 손 위치, 힘/움직임 방향, 양성 marker, 흔한 시행 오류를 Stable ID로 연결한다.
- 어깨 11개는 전용 정적 QA + 390px 모바일 runtime E2E를 완료 Gate로 사용한다.
- **2026-10-01 Batch 2 완료:** 팔꿈치·전완 canonical 10개(ct012–ct021)를 Stable ID 맞춤 도해로 추가했다. Cozen/Mill/Maudsley의 외측상과 부하 방향, 내측 굴곡-회내 저항, 주관 Tinel·압박-굴곡, distal biceps Hook/Biceps squeeze, Moving valgus stress, 저항성 삼두 신전을 각각 분리했다.
- **2026-10-01 Batch 3 완료:** 손목·손 canonical 14개(ct022–ct035)를 Stable ID 맞춤 도해로 추가했다. True Finkelstein/WHAT, Phalen/손목터널 Tinel/Durkan, Guyon관 Tinel/Froment/Wartenberg, 척측 fovea/DRUJ ballottement/ECU synergy, Thumb CMC grind/pressure-shear, Watson scaphoid shift를 각각 분리했다.
- **2026-10-01 Batch 4 완료:** 고관절·골반 canonical 14개(ct036–ct049)를 Stable ID 맞춤 도해로 추가했다. 대전자 촉진/저항성 외전/30초 한발서기/Trendelenburg, 저항성 외회전 되돌림·내회전, FADIR/FABER/Stinchfield/좌위 저항성 굴곡, Active·seated piriformis, Puranen-Orava, modified bent-knee stretch를 각각 분리했다.
- 고관절·골반부터 하지를 제대로 표현하기 위해 검사 도해 renderer에 **hip–knee–ankle 하위사지 pose schema**와 기립/앙와위/측와위/좌위 body mode를 추가했다. 상지 preset과 동일 renderer 안에서 Stable ID별로 분기하며 기존 어깨·팔꿈치·손목 도해는 보존한다.
- **2026-10-02 Batch 5 완료:** 무릎·대퇴 canonical 15개(ct050–ct064)를 Stable ID 맞춤 도해로 추가했다. 스쿼트/스텝다운 patellofemoral 부하, patellar tilt·mobility/apprehension, SLR-extensor lag, 저항성 신전, 슬개건·대퇴사두건 촉진, 0°/30° valgus·30° varus stress, 거위발, 원위 햄스트링, ITB 외측 대퇴과, Foucher sign을 각각 분리했다.
- 무릎 stress test에서는 외반/내반 힘 방향과 검사자 손 위치를 표시하고, 급성 통증에서 과도한 provocation을 피하도록 common-error safety를 유지한다.
- **2026-10-02 Batch 6 완료:** 하퇴·발목·발 canonical 17개(ct065–ct081)를 Stable ID 맞춤 도해로 추가했다. Thompson/Achilles 촉진/single-leg heel-rise/calf strain, ankle anterior drawer/talar tilt, syndesmosis squeeze/external rotation stress, peroneal·posterior tibial·tibialis anterior 기능검사, Windlass/plantar fascia insertion, tarsal tunnel Tinel, Mulder, 1st MTP-sesamoid, Ottawa ankle/foot rule을 각각 분리했다.
- 발목·발 검사의 교육성을 높이기 위해 하지 pose renderer를 **ankle → foot → toe landmark**까지 확장해 족저굴곡/배굴·내번/외번·제1 MTP 배굴과 전족부 압박 방향을 직접 표현한다.
- 급성 Achilles rupture, syndesmosis injury, fracture screening, DVT/PE red flag처럼 안전성이 중요한 항목은 과도한 provocation보다 영상/추가평가 우선 원칙을 common-error에 유지한다.
- **2026-10-02 Batch 7 완료:** 경추 canonical 17개(ct082–ct098)를 Stable ID 맞춤도해로 추가했다. Spurling/distraction/ULNT1/shoulder abduction relief/rotation ROM, C5–T1 neurologic screen, Hoffmann/Babinski-clonus/tandem gait/grip-release, flexion-rotation/GON provocation/extension-rotation, CCFT/neck flexor endurance/extensor activation, integrated red-flag screen을 각각 분리했다.
- 경추 검사부터는 head–neck 전용 pose renderer를 추가해 회전·측굴·신전·견인·상지 신경가동성·상부운동신경원 선별을 기존 상지/하지 도해와 분리해 표현한다.
- DCM/red-flag 검사는 강한 도발보다 신경학적 이상 확인과 영상·전문의 평가 우선을 시각적으로 유지한다.
- **2026-10-02 Batch 8 완료:** 흉추·등·흉곽 canonical 16개(ct099–ct114)를 Stable ID 맞춤도해로 추가했다. thoracic rotation/extension-rotation, rib spring/CTJ palpation, deep-inspiration/intercostal sensory mapping, neurologic red flag, wall push-up/serratus punch/scapular assistance/retraction/snapping scapula, paraspinal endurance/intercostal load/diaphragmatic breathing, integrated thoracic red-flag screen을 각각 분리했다.
- 흉추·흉곽 전용 renderer를 추가해 thoracic spine line, rib cage, scapula, upper-limb position을 같은 3-step 교육도해 안에서 표현한다.
- 흉통·호흡곤란·골절·척수성 red flag는 강한 MSK provocation보다 심폐/영상/전문의 평가 우선으로 유지한다.
- **2026-10-02 Batch 9 완료:** 요추·천추 canonical 18개(ct115–ct132)를 Stable ID 맞춤도해로 추가했다. lumbar active ROM/repeated movement, SLR/crossed SLR/slump/femoral stretch, L2–S1 neurologic screen/heel-toe walk, lumbar extension-rotation, SI distraction/thigh thrust/compression/sacral thrust/Gaenslen/cluster, multifidus activation, superior cluneal nerve, cauda equina red-flag screen을 각각 분리했다.
- 요추·천추 전용 renderer를 추가해 lumbar spine, sacrum, pelvis와 필요한 하지 위치를 같은 교육도해에서 표현한다.
- SLR·slump는 hamstring stretch와 neural symptom을 구분하고, CES/red flag에서는 반복운동·강한 provocation보다 urgent MRI/전문의·응급평가를 우선하도록 유지한다.
- **2026-10-02 Batch 10 완료:** 복벽·코어 canonical 16개(ct133–ct148)를 Stable ID 맞춤도해로 추가했다. Carnett, localized trigger/sensory mapping, Valsalva/cough impulse, rectus diastasis/IRD ultrasound, ADIM/TrA ultrasound, resisted rectus/EO/IO, athletic groin sit-up, dynamic inguinal US, abdominal-wall hematoma/tear screen, hernia complication red flag, visceral/peritoneal red flag를 각각 분리했다.
- 복벽·코어 전용 renderer를 추가해 rectus/linea alba/umbilicus/groin landmark와 복압·curl-up·rotation·dynamic US를 같은 3-step 교육도해에서 표현한다.
- **EXAM-001 baseline은 148/148 COMPLETE.** 모든 canonical Physical Examination에 Stable-ID custom schematic, 검사자 손 위치/힘 방향/양성 판단/시행 오류 metadata가 존재한다.
- **EXAM-REAL-001 착수:** `data/physical-exam-realistic-assets-v1.json`에 148개 전수 realistic asset slot을 생성했다. 모든 항목은 기존 EXAM-001 schematic을 fallback으로 유지하며, clinical content / visual pose / examiner hand / force direction / embedded text / user Preview 6개 gate를 통과하기 전 교체 금지.
- 첫 실사형 pilot은 경추 6개 **ct082 Spurling / ct083 distraction / ct084 ULNT1 / ct088 Hoffmann / ct092 flexion-rotation / ct095 CCFT**로 고정한다. 각 후보는 새 gen_id와 인간 교정·저작권 evidence를 남긴다.
- **2026-10-02 EXAM-REAL generation gate 준비 완료:** `scripts/build-physical-exam-realistic-prompt.mjs`가 active pilot 밖의 검사 생성을 차단하고, 같은 환자·검사자 3-panel / 정확한 손 위치 / force direction / 보수적 진단 표현 / 저작권·human-edit evidence를 프롬프트에 강제한다. `scripts/physical-exam-realistic-prompt-qa.mjs`를 Global QA에 연결했다.
- **2026-10-02 ct082 Candidate 1 생성·검수 완료:** gen_id `7d4e6df1-19d5-4439-9fe4-41ce23d27f8f`. 임상내용/검사자 손/축성 압박 방향은 PASS했으나, 세로형 composite 미준수·회전 성분 시인성 부족·짧은 한국어 라벨 원칙 위반으로 `visual_pose`와 `embedded_text`는 FAIL.
- **2026-10-02 ct082 Candidate 2 생성·검수 완료:** gen_id `2bbacf3a-f954-4b86-9d5e-a952b89eeca8`. 세로형 3-panel, 실사형 환자/검사자, 축성 압박, 상지 방사통/저림 overlay는 개선되었으나, 증상측 회전 성분의 시인성이 아직 부족하고 이미지 내부 장문 설명·영문 병기가 과다해 `visual_pose`와 `embedded_text`는 다시 FAIL. 2025 meta-analysis와 2026 update systematic review의 근거 제한을 반영해 단독 확진 표현은 금지한다. Preview에는 Candidate 2만 최신 후보로 표시하고 기존 EXAM-001 schematic은 그대로 유지한다. 다음 EXAM-REAL 작업은 **ct082 Candidate 3**이며, 이미지 내부 상세 설명을 앱 HTML로 분리하고 패널 번호·최소 한국어 라벨·방향 overlay만 남긴다.
- 다음 시각 품질 단계는 **EXAM-REAL-001**이다. 현재 148/148 schematic은 구조·검사법 정확성 baseline으로 보존하고, 정본 스타일 계약에 따라 **실사형 환자 + 실사형 검사자 + 손 위치/힘 방향/양성 overlay**로 순차 승격한다.
- **148개 canonical clinical test 전부**를 단순 한두 줄 설명으로 끝내지 않는다.
- 각 검사는 목적, 환자 시작자세, 검사자 위치·손 위치/힘 방향, 시행 순서, 양성 기준, 해석, 한계·거짓양성/흔한 오류, 연결 구조, 연결 감별진단을 제공한다.
- 각 검사 상세에는 **시작자세 → 시행 → 양성 판단**을 이해할 수 있는 교육용 일러스트를 제공한다.
- 현재 1차 구현의 공통 개념도는 임시 baseline이며, 실제 관절 위치·검사자 손 위치·힘 방향을 정확히 보여주는 **검사별 고정밀 도해**로 순차 교체한다.
- 환자에게 위험한 강한 provocation을 그림이 과장하지 않도록 하고, red flag/safety 검사에서는 “검사 반복”보다 적절한 영상·전원 판단을 우선 표현한다.

### E. 설치 앱 업데이트 채널
- Cloudflare의 commit-hash 배포주소(예: `97babaac.muscle-atlas-chatgpt.pages.dev`)는 **고정 시각검수본**이며 앱 설치 주소로 사용하지 않는다.
- 개발 중 설치 PWA의 정본 주소는 **`https://preview-development.muscle-atlas-chatgpt.pages.dev`** 로 고정한다.
- commit-hash 주소에서는 설치 버튼을 막고 “최신 Preview 앱 열기”로 안정 branch alias로 이동시킨다.
- commit-hash 주소의 service worker가 자기 자신을 “최신”이라고 오판하지 않도록 해당 origin에서는 자동업데이트 엔진을 시작하지 않는다.
- 기존에 commit-hash 주소에서 설치한 PWA는 origin 자체가 고정되어 새 코드를 받을 수 없으므로 **1회 삭제 후 안정 Preview 주소에서 재설치**가 필요하다.
- Stage 23C에서는 PC/Android 설치 앱에서 branch alias 기준으로 `old version → 새 commit → 업데이트 확인 → controllerchange → 최신 버전 표시` 실제 E2E를 필수 검증한다.
- Production `main`은 사용자 명시 승인 전까지 계속 동결하며, Preview와 Production 버전이 다를 수 있음을 UI/보고에서 구분한다.

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
| UPD-003 | Cloudflare commit-hash Preview 설치 시 영구 고정되는 문제 방지: 설치 차단 + 안정 branch alias 이동 + 실기기 update E2E | Release blocker | Stage 15 + Cloudflare Preview | **PATCHED / Stage 23C USER E2E REQUIRED** |
| EXAM-001 | 148개 진찰검사 전부 교과서급 상세 설명 + 시작/시행/양성 일러스트 + 구조·감별 연결 | Release blocker | A5 clinical stable IDs | **BASELINE COMPLETE · 148/148 custom Stable-ID schematics across all 10 regions / next EXAM-REAL-001** |
| EXAM-REAL-001 | Physical Examination 148개를 실사형 환자·검사자 일러스트 + 손 위치/힘 방향/양성 overlay로 최종 승격 | Release blocker / visual quality | EXAM-001 baseline + realistic asset pipeline | **IN PROGRESS · ct082 candidate 2 Preview 기록 / visual_pose+embedded_text FAIL / next = ct082 candidate 3** |
| DIFF-001 | 10개 임상영역 감별후보 전부 클릭형 교과서급 상세 설명 | Release blocker | A5 differential stable IDs | **IN PROGRESS · cervical 12 COMPLETE / 9 regions pending** |
| QUIZ-BOARD-001 | 전문의 수준 임상 Case 자동출제: 쉬운 O/I/F/N 제외, 가까운 감별 distractor, 20/40/80/120 세션 | High | 10 clinical differential modules | **IMPLEMENTED BASELINE / CONTENT EXPANSION ONGOING** |
| QUIZ-BOARD-002 | 실제 전문의 기출은 공식 공개원문만 연결하고 공식 범위·참고문헌 registry 유지 | High | source/license audit | **IMPLEMENTED POLICY / ONGOING SOURCE CHECK** |
| IMG-DISPLAY-001 | 320×400 Preview 실사 이미지는 PC 400px·최대 1.25×, 고해상도는 720px cap, A4 low-res 금지 | High | Stage 23B realistic asset pipeline | **IMPLEMENTED / USER VISUAL VERIFY PENDING** |
| QA-001 | 실제 Android에서 offline cold start / mic / TTS / 큰글자 / 회전 / print-share 확인 | Release blocker | Stage 23A + 23B | **Stage 23C** |
| VID-001 | 초음파 상세에 최고품질 검수 YouTube 영상 링크/임베드 추가 | High | Stage 23A navigation shell | **Stage 23B/Media layer** |
| VID-002 | 환자교육 운동·스트레칭에 고품질 YouTube 환자교육 영상 링크/임베드 추가 | High | Stage 23A + exercise profile mapping | **Stage 23B** |
| VID-003 | 영상 출처·채널·언어·duration·last_verified·embed 가능 여부·교육목적을 metadata로 관리하고 broken-link audit | High | VID-001/002 | **Stage 23B QA** |
| VID-004 | 영어 영상에 한국어 접근성 레이어 추가: YouTube 한국어 자막 우선 + 앱내 한국어 핵심해설/타임스탬프 | High | VID-001/002 | **Stage 23B Media UX** |
| VID-005 | CC BY/Public Domain/명시적 허가 영상에 한해 한국어 번역자막 및 선택적 TTS 더빙 지원 | Medium | license/permission audit | **Stage 23B Media UX** |
| ARCH-001 | 대표 해부도해·실제 초음파·근육별 운동·질환별 재활을 코드 재설계 없이 계속 추가·교체할 수 있는 Stable ID + registry + asset slot 확장 계약 유지 | Release blocker | 기존 Stable ID/registry | **EVERGREEN ARCHITECTURE / MUST PRESERVE** |
| ANATOMY-IP-001 | 교과서급 자체 2D 근육도해를 독립 창작 자산으로 제작하고 대표도해 slot을 자체 IP로 전환 | Strategic / Mandatory | ARCH-001 + anatomy Stable ID | **LOCKED / MUST DEVELOP · Stage 23B-Anatomy IP Pilot before Stage 23C** |
| IP-REG-001 | 자체 2D/실사형 검사·운동/3D/Motion/앱 코드의 인간 창작기여 증빙과 한국저작권위원회 등록 실행 | Strategic / Legal | ANATOMY-IP + realistic asset pipeline | **LOCKED · evidence now / first filing after Anatomy IP pilot** |
| ANATOMY-3D-001 | 회전·줌·레이어/투명도·근육 highlight를 지원하는 3D 해부학 뷰어 | Strategic / Mandatory | ANATOMY-IP-001 + model provenance | **LOCKED / MUST DEVELOP · Stage 23B-3D Pilot before Stage 23C** |
| MOTION-ANIM-001 | 근육 작용을 실제 관절 움직임으로 보여주는 기능 애니메이션; 첫 파일럿 두판상근 | Strategic / Mandatory | ANATOMY-IP-001 + ANATOMY-3D-001 + canonical Function | **LOCKED / MUST DEVELOP · Stage 23B-Motion Pilot before Stage 23C** |
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

상태: **REGRESSION PATCHED 2026-10-01 — stable Preview install origin contract added / USER REINSTALL + REAL DEVICE E2E PENDING**  
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
- px007의 잘못된 주먹쥐기 후보와 px009의 무릎-발끝 절대금기 후보는 재사용 금지 audit 기록으로 보존하고, 현재 작업 상태는 교정된 locked brief 기반 새 생성으로 정규화한다.
- px001은 2026-09-30 고정 숫자 제거 → 3중 검수 → canonical ingest까지 완료해 mobile Preview `APPROVED`로 복귀했다.
- px001–px006은 2026-09-30 안전 문구 교정·파일 무결성 복구·3중 검수·canonical ingest까지 완료해 mobile Preview `APPROVED` 상태다.
- px007은 새 손가락 벌림 그림 생성 대기이며, px008·px009의 과거 gen_id-only 후보는 알려진 저장소에서 binary 복구 불가를 확인해 폐기/감사기록으로 이동했다. px008 고관절 외전과 px009 교정 스쿼트는 fresh generation 대상으로 정리됐다.
- 2026-10-01 야간 예약작업에서 px007–px011의 교정 후보가 생성·검수됐지만 실제 image binary는 저장소에 materialize되지 않았다. 따라서 해당 후보는 재생성 대상이 아니라 `BINARY_HANDOFF_BLOCKED` 후보로 관리한다.
- px007 exact binary recovery를 재확인한 결과 checkpoint 자체가 `CONVERSATION_GENERATED_NOT_YET_REPOSITORY_MATERIALIZED`였고, manifest에 candidate path/receipt가 없으며 canonical repository WebP도 존재하지 않아 **기존 gen_id의 정확한 binary는 복구 불가로 확정**했다.
- px007의 기존 gen_id `8c940201-f1c0-4440-832d-83972f8efbb8`, checkpoint, 3중 검수 기록은 `lost_candidate_history`와 binary-loss audit에 보존했다. 새 후보에 기존 검수를 승계하지 않는다.
- manifest-derived selector의 현재 첫 작업은 **px007 / REGENERATE_FROM_LOCKED_BRIEF**다. 새 생성은 반드시 새 gen_id → repository WebP materialization → 새 clinical_content / visual_pose / embedded_text 3중 검수 순서를 거친다.
- px008~px011은 여전히 exact binary handoff 대기 상태이며, px012+는 이 앞선 blocker를 건너뛰지 않는다.
- blocker가 있는 후보가 runtime에서 실사 이미지로 노출되면 E2E FAIL 처리한다.
- 2026-09-30 asset 안전장치 강화:
  - `scripts/inspect-realistic-webp.mjs`가 RIFF/WebP 구조, 선언 파일크기, chunk truncation, 실제 해상도를 검사한다.
  - `scripts/realistic-webp-integrity-qa.mjs`가 승인된 실사형 WebP 전부를 검사한다.
  - `scripts/register-realistic-candidate.mjs`가 새 후보 파일을 정상 WebP로 확인한 뒤에만 3중 검수 대기 상태로 등록한다.
  - px007~px010 canonical render request는 `data/patient-exercise-render-requests-v1.json`에 준비되어 있다.
  - px009는 “무릎이 발끝보다 앞으로 나가면 안 된다”는 절대금기 문구를 금지한 상태로만 제작·승인한다.

### 표시 품질 checkpoint — 2026-10-01
- 사용자 PC·앱 실화면 피드백에서 320×400급 mobile-preview WebP가 CSS `width:100%`로 큰 화면에서 과대 확대되어 흐릿하게 보이는 문제가 먼저 확인됐다.
- 이후 원본 320px 고정으로 바꾸었더니 PC에서는 반대로 너무 작다는 사용자 실화면 피드백이 확인됐다.
- 따라서 최신 정본은 **320×400 mobile-preview → 데스크톱 목표 400 CSS px / 원본 대비 최대 1.25× soft-upscale**로 고정한다. 1.25×를 넘는 확대는 금지한다.
- 모바일에서는 viewport보다 크면 자동 축소한다.
- 향후 고해상도 자산은 데스크톱 화면에서 과도하게 커지지 않도록 720px 표시 상한과 72vh 높이 상한을 둔다.
- Stage 23B browser E2E는 저해상도 Preview에서 `renderedWidth <= naturalWidth × 1.25`, desktop 400px cap, 너무 작지 않은 하한을 검사한다.
- 이 수정은 현재 Active Stage 23B의 시각 품질 결함 수정으로 처리하며, px007 binary handoff → px012+ 제작 순서를 바꾸지 않는다.
- px001–px006 저장소 WebP를 전수 확인한 결과 모두 **320×400px** 모바일 미리보기 자산이다. A4-HD로 오인하지 않도록 asset gate를 유지한다.
- UI 배지에 **모바일 미리보기**를 명시하고, 실제 WebP 해상도와 manifest의 `preview_resolution`이 일치하는지 전수 검사하는 `realistic-display-fidelity-qa.mjs`를 Global QA에 유지한다.
- 저해상도 mobile-preview는 A4 인쇄에 사용하지 않는다. A4-HD 조건을 통과한 별도 고해상도 asset만 인쇄용으로 승격한다.

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

### 전문의 학습 품질 확장 checkpoint — 2026-10-01
- 사용자의 실제 PC Preview 피드백에 따라 320×400 모바일 미리보기 실사 그림은 원본 1.25배를 넘지 않는 **400 CSS px**를 데스크톱 기본 목표로 조정했다. 기존의 지나친 확대와 이후의 지나친 축소 사이에서 가독성과 선명도를 균형화한다.
- Quiz에 **전문의 Case 자동출제**를 추가했다. O/I/F/N 단순암기 문제와 답이 지나치게 뻔한 기존 임상문항을 이 모드에서 사용하지 않고, 10개 임상영역 64개 감별군·200개 이상 후보 데이터를 조합해 가까운 감별진단끼리 경쟁하는 증례형 문항 pool을 만든다.
- 세션 문제 수는 20 / 40 / 80 / 120을 지원하고 매 세션 무작위 출제한다. 각 문항은 정답 후 핵심 지지소견·단독 확정 금지소견을 해설한다.
- 실제 전문의 시험 기출문제는 공식 공개가 확인된 원문만 연결한다. 2026 전문의 구술범위·참고문헌·시행계획과 2016 공개 전공의 평가시험을 공식 source registry로 관리하며, 비공식·유료 기출의 무단 복제는 하지 않는다.
- 감별 후보 card를 클릭형 상세 패널로 바꾸고, 경추 d088–d099 12개 진단은 정의/병태생리/병력/진찰/영상/치료/red flag/함정의 **교과서급 상세 1차본**을 연결했다.
- 나머지 9개 임상영역도 같은 상세 스키마로 순차 확장한다. 이 확장은 현재 Stage 23B px007 실사 이미지 mainline을 가로채지 않는 병렬 콘텐츠 트랙으로 관리한다.

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

## EXAM-REAL-001 cervical wave 2 checkpoint — 2026-10-06

Preview release for this checkpoint: `v12.03 · Cervical Exam Wave 2`

- ct083: Candidate 2 internal PASS / user Preview PENDING.
- ct088: **USER-DEFERRED INCOMPLETE / mandatory revisit later**. Candidate 13 is audit history only and is not an active Preview target. Do not regenerate now.
- ct085 → ct086 → ct087: clinical teaching and realistic generation briefs locked; all three are inside the active cervical pilot in that order.
  - ct085 brief `2026-10-06-ct085-v1` / frozen prompt packet ready.
  - ct086 brief `2026-10-06-ct086-v1` / frozen prompt packet ready.
  - ct087 brief `2026-10-06-ct087-v1` / frozen prompt packet ready.
- ct089: user-approved exact-binary recovery backlog; preserve approved source hashes and do not substitute a new image as if it were the approved original.
- ct091/ct092: clinical content preserved; exact binary recovery or fresh independently reviewed candidate still required before canonical promotion.
- ct084/ct090/ct093/ct094/ct095/ct096/ct097/ct098: approved assets locked; no regeneration without explicit user request.
- CI contracts now protect ct085–ct089 content/lifecycle, explicitly block ct088 while user-deferred, and prevent out-of-order or duplicate Physical Examination generation.
- Production `main` remains frozen.

# 현재 바로 시작할 순서

**EXAM-001 148/148 COMPLETE → 경량 Deployment Safety Gate 2/2 COMPLETE → EXAM-REAL-001 경추 실사형 pilot → Stage 23B 실사형 운동 일러스트 잔여 제작/검수 → Stage 23B-Disease Rehab → Stage 23B-Anatomy IP Pilot + IP-REG Filing 1 → Stage 23B-3D Anatomy Pilot → Stage 23B-Motion Animation Pilot → Stage 23C → Stage 24**

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
