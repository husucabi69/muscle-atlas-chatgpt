# EXAM-REAL-001 / ct086 — 검수 전용 큰 화면 및 H3Y 프로토콜 이식
기준: 2026-10-17 KST
상태: `PHOTO-LIKE_DRAFT_REVIEW_ROOM / NOT_APPROVED / STAGE_23B_ACTIVE`
실사용 경로: LYSOS 앱 → 임상 모듈 → 경추 → Physical Examination → ct086 → **검수 전용 큰 화면에서 3장면 확인**
독립 접근: `/ct086-review.html`

## 이번 코드 작업의 범위
- 기존 ImageGen 원본 및 편집된 1024×1536 합성 3장면 PNG를 **재생성하지 않고** 동일 바이너리/동일 SHA로 사용한다. 화면 CSS background-position으로 중립, 좌우 능동회전, 제한·보상 3개의 패널을 크게 보여준다.
- 각 패널은 검사 목적, 기존 그림에 대해 인간이 반드시 확인할 정확성 체크리스트를 제공한다. 좌우·중립 자세, 어깨/몸통 보상, 인물 일관성, 검사자 손, 화살표·내장문구 등은 **미검수**라고만 표시한다.
- 모바일 390px 및 PC 1280px에서 실제 PNG 로딩·3단계 구조·가로 넘침·승인금지 배지·유효한 원본 링크를 E2E 확인. 앱 홈의 공식 검사 도해와 임상 서술은 그대로 유지한다.
- **임상 정본 승인이나 인간 저작권 창작기여 증빙은 이번 범위에 포함하지 않는다.** 완성품으로 표시하지 않고 환자교육 최종 이미지로 사용하지 않는다. 구조적인 CSS 분할은 원본의 오류를 실제로 고치지 않는다.
- Runway 웹/앱/API·원본 조회·이식 호출 0, 유료 대체 도구 0. 기존 approved ct085, HOLD ct088, Claude 87강 및 2판 HOLD, Production/main은 불변.
- `H3Y DEVELOPMENT EXECUTION PROTOCOL v1.0` 최신 의장님 지시를 `AGENTS.md`/개발헌법/원칙/MASTER/NEXT/HANDOFF/Preview 정책에 **기존 35분 종료 규칙보다 앞에** 선언. 35분 필수 진행보고·필요시 50분 연장·50분 절대 HARD STOP. 새 QA도 검사한다.

## 실제 코드
- `ct086-review.html` — 한 화면에 3단계씩 비교할 수 있는 독립 의료 검수실.
- `index.html` — ct086 미승인 보류 안내 바로 다음에 검수실 바로가기.
- `scripts/ct086-review-workspace-qa.mjs` — 원본 바이너리 SHA/픽셀·정본 미승인·의학 안전/문구 회귀.
- `scripts/ct086-review-workspace-e2e.mjs` — 390px/1280px 실제 브라우저 렌더·PNG HTTP 접근·스크린샷.
- `scripts/h3y-execution-protocol-qa.mjs` — 최신 프로토콜 전수 문서 우선순위 및 안전 gate 회귀.
- `.github/workflows/global-qa.yml` — 기존 Global QA에 3단계만 추가. 하나의 브랜치 Push 원칙.

## 검수 대기 사항
- 실제 동일 환자·검사자 여부와 척추 움직임을 전문의가 평가.
- 머리 회전의 방향, 화살표, 보상 표현, 잘못 삽입된 문구 교정.
- 네이티브 고해상도 원본/3패널 only-label contract 확보. 소스 이미지가 낮은 해상도에서 확대된 문제를 CSS 표시만으로 해결했다고 주장 금지.
- 사람의 구체적인 창작·의료교정 이력 및 라이선스 기록, 원본 IP 증빙.
- 의장님 Preview 수락 → 그 이후에만 canonical 후보 연결.
- Stage 23B Disease Rehab → ANATOMY-KNOWLEDGE/IP-EVIDENCE → ANATOMY-MASTER-3D(두판상근) → 2D → Layer/Motion → COPYRIGHT-GATE-0~5 → Stage 23C 기존 공식 순서 유지.
