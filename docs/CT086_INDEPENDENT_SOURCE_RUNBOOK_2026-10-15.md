# EXAM-REAL-001 / ct086 — 독립 원본(비-Runway) 확보부터 Preview 후보까지

기준일: 2026-10-15 / 개발 브랜치 `preview/development` / status `PIPELINE_CODE_READY; ACTUAL_ART_PENDING`

## 현재 실제 상태

ct086 실사형 검사용 새 파일은 **아직 존재하지 않는다**. 의장님이 명시적으로 금지한 Runway 서비스는 생성·조회·전송·기존 자산 재사용을 포함하여 **호출 금지**다. 과거 Runway Candidate 5는 비용과 출처 기록만 남는다. 앱은 검증된 Stable-ID 도해와 경추 회전 ROM의 교과서식 서술을 계속 표시한다. 기존 ct085 승인 도해와 87강 HTML을 변경하지 않는다.

## 새 원본 준비

가장 먼저 독자적인 원본 PNG를 인간의 창작적 의사결정·수정이 있는 방식으로 제작하거나, 라이선스와 재이용범위가 명확한 별도 비-Runway 원본을 확보한다. 실사형 교육목표: 같은 성인 여성 환자/여성 검사자 세 패널, 능동 경추 좌우회전, 어깨·몸통 고정, 검사자 강제 끝범위 조작 금지, 2:3 최소 1024×1536, 정확히 세 한국어 짧은 제목, 수치/붉은 통증 중첩/장문 금지. 출처와 인체 정확성을 **실제 원본을 보고** 확인해야 한다. 새 유료 서비스·라이선스 비용이 들면 의장님 사전 승인이 필요하다. 온라인 원본 이미지/교과서 도판 무단 복제 금지.

## 실제 실행 순서

1. 독립적으로 제작된 로컬 PNG 파일을 별도 보존한다. 서비스명·저작권자·사용범위·인간 창작 및 교정 기록을 `husucabi69/muscle-atlas-ip-vault` 증빙 저장소에 유지한다. CROS 회원가입은 의장님이 **이미 완료했다고 말씀하셨으며**, 공식 작품등록과는 구별한다.
2. GitHub 저장소가 체크아웃된 **신뢰된 개발환경**에서 `node scripts/ct086-independent-hd-import.mjs <local-original.png>` 실행. 입력은 **로컬 파일만** 허용하고, 어떠한 외부 API에도 접속하지 않는다. 실행이 성공하면 원본 PNG를 바이트 그대로 보존하고 2K WebP를 만들며, 실제 픽셀 크기·SHA-256·Git blob·손실 계측을 출력한다. 결과의 `disposition`은 반드시 `LOCAL_BINARY_STAGED_RIGHTS_AND_MEDICAL_REVIEW_REQUIRED`로 유지된다.
3. `docs/templates/CT086_INDEPENDENT_ORIGIN_TEMPLATE.json`과 `docs/templates/CT086_INDEPENDENT_VISUAL_AUDIT_TEMPLATE.json`을 복사해 실제 출처·권리와 임상 시각검수 결과를 작성한다. 템플릿의 기본 `PENDING/NOT_PERFORMED/null`을 임의 PASS로 바꾸는 행위 금지. 원본 작업단계·인간 교정·원본/화면 이미지가 동일한지·3패널 해부학·능동 운동·각도·금지 그래픽을 직접 확인한다.
4. `node scripts/ct086-independent-artwork-gate.mjs <registry.json> <candidate.json> <actual-audit.json> <actual-origin.json> <new-staging-registry.json>`로 기존 registry 원본은 건드리지 않고 **새 등록 후보 파일**만 출력한다. 과거 Candidate 5 이력은 `historical_restricted_provider_render_task`에 보존하되 새 후보의 이미지는 그 자산과 무관해야 한다.
5. 학술 담당자가 현물 PNG/WebP와 사람의 진찰 정확성·저작권/기여 증빙을 확인하고 필요하면 교정한다. 정확한 파일 바이트와 감사기록이 일치하는 경우에 한해 개발 브랜치에서 새로운 후보만 Preview 연결한다. `CANDIDATE_GENERATED_USER_PREVIEW_PENDING` 상태가 되어도 **아직 의장님 승인/정본 승격 아님**.
6. 의장님이 앱의 `홈 → 임상 모듈 → 경추 → Physical Examination → 경추 회전 ROM 평가`에서 크고 읽기 쉬운 실제 새 그림을 열어 확인한 뒤 최종 승인 여부를 결정한다. 검증 전에 기존 교육 도해를 숨기지 않는다. Production/main 무단 변경 금지.

## Gate 책임과 한계

- `scripts/ct086-independent-hd-import.mjs`: 로컬 PNG 실물 바이트/CRC/원본 최소해상도/2:3·저해상도 차단, PNG→WebP 실픽셀 품질 평가. 제공자 접속 0회.
- `scripts/ct086-independent-artwork-gate.mjs`: 새 ID/파일명·별도 원본/Preview hash/bytes·검수 시각·출처/권리/인간 편집기록·모든 해부학 계약 축·후보 등록 상태를 검증. 오래된 공급자의 원본은 기록만 보존. 실제 인체 해부학·법적 저작권의 진정성을 코드가 자동 증명한다고 주장하지 않는다.
- `scripts/physical-exam-preview-visibility-qa.mjs`: 금지된 이전 공급자 후보와 독립원본 검증 실패 후보의 앱 표시 차단. 위조 메타데이터가 통과하지 못하도록 GitHub Actions는 실제 정적 파일 바이트 검증을 필수로 유지.
- `scripts/ct086-independent-artwork-gate-qa.mjs`는 과거 승인 ct085 PNG/WebP를 **임시 테스트 픽셀로만** 사용한다. 다른 검사 도해를 ct086으로 재사용했다는 의미가 전혀 아니다.
- 저작권 `COPYRIGHT-GATE-0~5`와 Stage 23C 이전 `ANATOMY-MASTER-3D-001`, `ANATOMY-IP-2D-001`, `ANATOMY-3D-VIEWER-001`, `ANATOMY-LAYER-001`, `MOTION-ANIM-001` 잠금은 변경하지 않는다.

## 이번 단계 완료 정의

코드·오프라인 fixture QA와 Preview 앱의 **독립 소스만 허용하는 안전 게이트**를 갖춘 상태만 `PIPELINE_CODE_READY`로 보고한다. 실사형 원본이 없으면 여전히 `ACTUAL_ART_PENDING`, 독립 원본·임상/저작권 검수·사용자 Preview 승인이 실제 이루어져야 `USER_APPROVED`로 판정한다. 외부 이미지 서비스를 임의 호출하거나 예산을 쓰지 않는다.
