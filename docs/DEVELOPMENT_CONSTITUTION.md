# DEVELOPMENT CONSTITUTION — 이윤석정형외과 근육

Status: **CANONICAL / HIGHEST-PRIORITY DEVELOPMENT RULE**
Effective: 2026-09-27

이 문서는 이 프로젝트의 개발 정본이다. 다른 로드맵·메모·작업지시와 충돌하면 이 문서를 우선한다.

## 1. 개발 철학 — 임시방편 금지

다음 방식은 금지한다.

- 핫픽스만으로 눈앞의 증상만 가리는 수정
- 핫패치
- 임기응변
- 임시방편
- 주먹구구식 수정
- 특정 화면 하나만 통과하도록 조건문을 덧대는 수정
- 원인 규명 없이 CSS/DOM/timeout을 덧붙여 현상만 사라지게 하는 수정
- 자동 QA 문구만 맞추고 실제 런타임 구조는 그대로 두는 수정
- 같은 역할을 하는 navigation/state/render 로직을 여러 곳에 중복 추가하는 수정

버그가 보이면 **증상 → 재현 → 원인 → 공통 구조 → 회귀방지 테스트 → 전체 QA → 실제 Preview 확인** 순서로 해결한다.

## 2. Root-cause first

모든 회귀는 다음 순서로 처리한다.

1. 하위 로드맵 작업을 즉시 멈춘다.
2. 문제가 발생한 이전 milestone을 **REOPENED**로 돌린다.
3. 사용자가 관찰한 정확한 재현 경로를 문서화한다.
4. 실패를 재현하는 테스트를 먼저 만든다.
5. 단일 증상이 아니라 공통 원인을 찾는다.
6. 공통 abstraction/state/render 계약에서 수정한다.
7. 관련 모든 경로를 다시 검사한다.
8. 자동 QA PASS 후 실제 Preview에서 사람이 확인한다.
9. 실제 확인 전에는 완료로 되돌리지 않는다.

## 3. 확장 가능한 구조 우선

- 화면 상태는 명시적 state로 관리한다.
- 동일 기능의 source of truth는 하나만 둔다.
- navigation과 data rendering을 분리한다.
- view 전환은 공통 state machine/router 계약을 사용한다.
- DOM hide/show를 개별 함수마다 임의로 조작하지 않는다.
- 데이터 선택 함수는 가능한 한 pure selector로 분리한다.
- 각 계층 화면은 입력 state → render output이 명확해야 한다.
- Stable ID와 기존 학습기록 호환성을 유지한다.
- 향후 탭·부위·근육·임상 모듈이 늘어나도 동일 패턴으로 확장 가능해야 한다.

## 3A. 검증된 UX 기준선 보존

- 이미 사용자가 좋다고 확인한 화면 레이아웃은 명시적 재설계 지시가 없는 한 보존한다.
- navigation 계층화는 기존 정보구조·시각 레이아웃을 임의로 재설계하는 허가가 아니다.
- 화면 이동 방식을 바꿀 때는 기존 content layout과 control vocabulary를 가능한 한 유지한다.
- 해부학 개별 근육 상세의 시각 기준선은 **v11.14 · Stage 17 Precision Anatomy**이다.
- 해부학 기준선의 핵심 control은 **기본정보 / 해부도해 / 초음파 / 임상 / 심화·학습** 가로 탭 5개다.
- 계층화는 `해부학 부위 → 근육 목록 → 근육 상세`까지만 독립 화면으로 적용한다. 근육 상세 내부의 5개 탭은 **v11.14처럼 같은 상세 화면 안에서 내용만 교체**하며 별도 deep 화면/history 계층을 만들지 않는다.
- 큰 세로 카드형 목차로 대체하지 않는다.
- 기준선 변경은 사용자 명시 승인 후 roadmap에 기록한다.

## 4. 회귀 방지 Gate

정적 문자열 검사는 보조수단일 뿐 완료조건이 아니다.

각 핵심 사용자 흐름에는 다음 검증이 필요하다.

- 실제 DOM에 항목이 생성되는지
- target view가 실제 visible 상태인지
- 이전 view가 숨겨지는지
- 항목 수가 canonical data와 일치하는지
- 클릭 후 예외가 발생하지 않는지
- browser/Android back이 올바른 상위 단계로 돌아가는지
- 화면 전환 후 scroll 위치가 정상인지
- 실제 Preview에서 사용자가 확인 가능한지

가능하면 **실제 click 기반 browser/E2E test**를 구축한다. 정적 grep QA만으로 navigation 완료를 선언하지 않는다.

### Reporting principle
- 모든 작업 보고는 **비개발자·일반인이 들어도 이해되는 쉬운 일상말**을 먼저 사용한다.
- 사용자가 개발 코드를 읽지 않아도 현재 상황을 바로 이해할 수 있게 설명한다.
- `QA FAIL`, `manifest`, `ingest`, `runtime E2E`, `SHA`처럼 개발자에게 익숙한 말은 보고의 중심으로 쓰지 않는다.
- 예: `QA FAIL`이라고만 쓰지 말고 먼저 `검사 기준이 예전 상태로 남아 있어 틀렸다고 나온 상태`처럼 설명한다.
- 기술용어가 꼭 필요하면 쉬운 설명을 먼저 한 뒤 괄호나 맨 끝의 증빙으로 짧게 붙인다.
- 보고 본문은 코드·파일명·내부 변수명보다 **무엇이 좋아졌는지 / 무엇이 막혔는지 / 다음에 무엇을 할지**를 중심으로 쓴다.
- 사용자 보고의 큰 제목은 최신 사용자 지시에 따라 **딱 2개만** 사용한다.
  1. **① 뭘 했나** — 이번 작업에서 실제로 한 일과 PASS / FAIL / BLOCKED 결과를 함께 설명
  2. **② 앞으로 뭘 할 건가** — 바로 다음 작업선
- 별도의 “어떻게 됐나” 큰 제목은 만들지 않는다. 결과 상태는 ① 뭘 했나 안에서 쉬운 말로 설명한다.
- SHA, run ID, 브랜치, QA 결과 같은 기술정보는 위 쉬운 설명 뒤에 증빙으로 붙인다.
- 모든 작업 보고 말미에는 반드시 아래 실제 계측값을 포함한다.
  1. **작업 시작시간** — 실제 개발을 시작한 한국시간
  2. **작업 종료시간** — 실제 개발·검증·저장을 끝낸 한국시간
  3. **보고시간** — 최종 작업 보고를 보내는 한국시간
  4. **총 실제 작업시간** — 실제 시작부터 실제 종료까지의 계측 경과시간
  5. **작업시간 규칙 준수 여부** — `실제 개발 25~30분 / 30~35분 마무리 / 35분 HARD STOP` 각각 PASS/FAIL 확인
- **지시수령시간**도 확인 가능한 경우 함께 기록하되, 위 5개 핵심 항목을 대신할 수 없다.
- 시간은 추정하거나 반올림하거나 부풀리지 않고 실제 계측값만 기록한다.
- 사용자가 별도로 요구하지 않는 한 복잡한 내부 구현 설명부터 시작하지 않는다.

### Browser QA tooling
- 이 프로젝트의 자동 browser click 검증은 **GitHub Actions Playwright E2E**를 정본으로 사용한다.
- **TinyFish는 사용하지 않는다.** 채팅 UI에 별도 실행/지갑 카드가 노출되어 사용자 검수 흐름을 방해하기 때문이다.
- Preview 최종 시각 판정은 사용자의 실제 기기 확인을 기준으로 한다.

## 5. 작업 시간 단위

사용자가 `진행해`, `다음 작업`, `시작해`라고 지시한 **수동 개발 한 작업 묶음**은 다음을 강제한다.

- **실제 개발시간: 25~30분**
- 25분 전에 현재 작업이 닫히면 손을 놓거나 조기 보고하지 않는다. 로드맵 순서를 깨지 않는 같은 개발선의 다음 독립 작업, QA, 회귀검사, 정본화, 문서·asset integrity 검증을 이어서 수행하여 **최소 25분**을 확보한다.
- 첫 작업이 막혀도 대기하지 않는다. 같은 blocker를 해소하는 도구·QA·독립 준비작업으로 전환한다.
- **30분이 되면 새 기능, 새 구조변경, 새 이미지/asset 생성, 범위 확장을 시작하지 않는다.**
- **30~35분은 마무리 구간**이다. 이 구간에는 저장, 커밋, QA/CI 상태 확인, HANDOFF·정본 갱신, 안전 체크포인트, 최종보고 준비만 수행한다.
- **35분에는 무조건 HARD STOP**한다. GitHub Actions·Cloudflare·외부 배포가 진행 중이어도 기다리기 위해 35분을 넘기지 않는다.
- 35분 시점에 검증이 진행 중이면 현재 exact HEAD, 진행 중 run, PASS/FAIL/BLOCKED 상태, 다음 첫 작업을 남기고 보고한다.
- 예약 자동개발의 별도 45~50분 규칙은 해당 예약 프롬프트를 따른다. 이 25~35분 규칙은 수동 개발에 적용한다.
- 멈추기 전에 반드시 체크포인트를 만든다.
- 체크포인트에는 아래를 남긴다.
  - 지금까지 한 작업
  - PASS / FAIL / BLOCKED
  - 정확한 현재 작업지점
  - 남은 원인/의존성
  - 다음 첫 작업

### 5.1 시간 계측·보고 강제 규칙

- 작업 시작 시 실제 KST를 계측한다.
- 작업 종료 시 실제 KST를 다시 계측한다.
- 보고 직전 실제 KST를 다시 계측한다.
- 최종보고 말미에는 **작업 시작시간 / 작업 종료시간 / 보고시간 / 총 실제 작업시간 / 작업시간 규칙 준수 여부**를 빠뜨리지 않는다.
- 준수 여부는 최소한 다음 세 항목을 각각 판정한다.
  - 실제 개발 25~30분: PASS / FAIL
  - 30~35분 마무리 규칙: PASS / FAIL
  - 35분 HARD STOP: PASS / FAIL
- 추정시간을 실제 측정값처럼 쓰는 것을 금지한다.

## 5A. 야간 예약작업 이후 오전 첫 수동 작업 시작 절차

근육 앱 자동개발은 한국시간 **00:00~08:00 매 정시** 실행되는 것을 전제로 한다.

오전 첫 수동 개발은 구현부터 시작하지 않는다. 먼저 아래를 순서대로 확인한다.

1. `preview/development` 최신 exact HEAD
2. 00:00~08:00 예약작업이 만든 최신 commit과 직전 체크포인트
3. 진행 중이거나 직전에 끝난 GitHub Actions / Cloudflare Preview 결과
4. 정본 ROADMAP의 현재 Active Stage와 다음 미완료 항목
5. 야간 작업과 수동 작업의 중복·충돌 가능성
6. Idea Register에 새로 들어온 항목과 우선순위 변경 여부

위 확인이 끝난 뒤 **정본 로드맵의 다음 미완료 한 작업**만 선택해 시작한다. 야간 예약작업이 개발선을 앞당겼다면 그 최신 지점에서 이어받고, 이미 끝난 작업을 반복하지 않는다.

## 6. 중간 보고

장시간 무응답 금지.

작업 중 중요한 단계마다 짧게 보고한다.

- 무엇을 확인했는지
- 무엇이 원인 후보인지
- 무엇을 수정했는지
- QA 결과
- 다음 단계

도구 실행 중에도 논리적 경계마다 진행상태를 전달한다.

## 6A. Stage 23B 생성 이미지 바이너리 인계 규칙

- 실사형 운동 이미지는 **생성(gen_id 확보)만으로 완료가 아니다.**
- 생성한 후보를 계속 사용할 의도가 있으면 가능한 같은 작업 회차 안에서 실제 image binary를 파일로 확보하고, WebP 무결성 검사 후 canonical asset slot에 materialize한다.
- 실제 파일을 저장소로 옮기지 못했지만 후보가 임상내용·자세·내장문구 검수를 통과했다면 해당 profile은 `CANDIDATE_GENERATED / BINARY_HANDOFF_BLOCKED`로 기록한다.
- `BINARY_HANDOFF_BLOCKED` 후보는 **재생성하지 않는다.** exact gen_id/checkpoint의 binary 회수를 먼저 시도한다.
- exact binary가 회수되면 수작업으로 manifest/asset을 따로 고치지 말고 `scripts/materialize-reviewed-realistic-binary.mjs`를 우선 사용한다. 이 경로는 profile ID + exact gen_id + checkpoint identity + WebP 무결성 + SHA-256을 확인한 뒤 canonical asset에 등록한다.
- 현재 회수 대기 순서는 `scripts/list-realistic-binary-handoff-queue.mjs`로 확인한다. 회수된 repository binary는 기존 사전검수 결과만 믿지 말고 파일 자체를 `clinical_content / visual_pose / embedded_text` 3중 검수한 뒤 ingest한다.
- 한 profile이 `BINARY_HANDOFF_BLOCKED`인 동안 다음 profile의 새 이미지를 계속 생성해 gen_id-only 후보를 쌓는 것을 금지한다.
- binary handoff가 현재 실행환경에서 불가능하면 이미지 생성은 멈추고, 같은 Stage 23B 안의 코드·QA·registry·mobile/A4 print·문서·회귀검사처럼 독립 가능한 작업으로 전환한다.
- repository WebP가 없으면 `APPROVED` 승격 금지. 실제 binary integrity PASS + 임상내용/자세/내장문구 3중 검수 + canonical ingest를 모두 통과해야 한다.
- rejected candidate와 reviewed-but-unmaterialized candidate를 혼동하지 않는다. rejected candidate는 재사용 금지 감사기록이고, reviewed candidate는 exact binary 회수 대상이다.
- 이 규칙은 수동 작업과 예약 자동개발 모두에 동일하게 적용한다.

## 7. 완료 정의

`DONE`은 아래를 모두 만족해야 한다.

- root cause 설명 가능
- architecture contract 반영
- regression test 추가
- 기존 전체 QA PASS
- 새 기능/버그 전용 QA PASS
- 실제 Preview 런타임 확인
- 사용자가 요구한 경우 사용자 시각 확인
- Production은 별도 명시 승인 전까지 미승격

정적 QA만 PASS한 상태는 `AUTOMATED PASS`이며 실제 화면 PASS와 동일하지 않다.

## 7A. 질환별 환자 재활교육 정본 원칙

Stage 23B부터 환자교육은 근육별 운동만으로 완료 처리하지 않는다.

- 각 해부학 영역의 **대표 정형외과 질환**을 질환 단위로 구조화한다.
- 질환별 환자교육에는 최소한 아래를 포함한다.
  - 쉬운 질환 설명
  - 적응증 / 운동 금기 / red flag
  - 스트레칭
  - 강화운동
  - 생활습관·활동조절
  - 흔한 실수
  - 재진/평가 필요 기준
  - 근거 출처와 최종 검토일
  - 사용자 승인 실사형 환자교육 일러스트
  - 모바일 화면과 A4 인쇄
- 최신 CPG, systematic review, 고품질 RCT를 우선 근거로 사용한다.
- 수술 후 재활, 급성 손상, 파열 크기/불안정성/신경학적 결손처럼 경로가 달라지는 상태는 일반 보존적 재활과 분리한다.
- 근거가 불충분한 반복횟수·기간·가동범위를 임의로 만들어 넣지 않는다.
- 환자교육은 진단을 대신하지 않으며, 진단 미확정 또는 red flag가 있으면 운동보다 평가/진료 안내를 우선한다.
- **Stage 23B-Disease Rehab Gate가 끝나기 전 Stage 23C로 이동하지 않는다.**
- 사용자 아이디어 원문에 있는 질환명은 삭제하지 않는다. 표준 의학용어가 불명확하면 `terminology_review_pending`으로 보존한 뒤 구현 전 정규화한다.

## 8. 아이디어 보존

새 아이디어는 즉시 구현하지 않는다.

- Idea Register에 기록
- 중요도와 선후관계 평가
- 현재 작업선보다 뒤가 맞으면 queued/deferred
- 좋은 아이디어는 삭제하지 않음
- superseded도 이유와 대체 항목을 남김
- 새 아이디어가 좋아 보여도 현재 Active Stage를 임의로 중단시키지 않는다.
- **예외적으로 즉시 선행할 수 있는 것은 회귀버그, 환자안전·데이터손실 위험, Production 오염 위험, 현재 release gate를 막는 blocker뿐이다.**
- 대표 해부도해·실제 초음파·운동·질환 재활 같은 콘텐츠 추가/교체 요구는 Stable ID/registry/asset slot 방식으로 보존·배치하고, 로드맵상 순서가 되었을 때 구현한다.

## 9. Production 규칙

- 모든 개발은 `preview/development`
- `main`은 사용자 명시 승인 전까지 동결
- Preview에서 충분히 검증
- Production 승격은 별도 명시 승인 후에만 실행

## 10. 현재 회귀 처리 정본

2026-09-27 사용자 실기기 관찰:

> 홈 → 해부학 위치 찾기 → 경추/상지/견갑대 등 해부학 부위 선택 → 다음 화면이 흰 화면으로 보이고 근육 목록이 표시되지 않음.

판정:
- Stage 23A A2는 **REOPENED**
- A5 이후 작업은 보류
- 정적 QA가 실제 클릭/visibility/runtime 오류를 잡지 못한 것이 프로세스 결함
- 증상만 가리는 hotfix 금지
- 공통 drill navigation과 runtime test 구조부터 재검증

복구 완료조건:
1. 정확한 원인 규명
2. 실제 클릭 기반 재현 테스트 추가
3. 모든 해부학 부위에서 근육 목록 visible
4. 근육 수가 canonical data와 일치
5. 근육 클릭 → v11.14 근육 상세 visible + 기본정보 탭 즉시 활성 + O/I/F/N 등 기본정보 즉시 표시
6. back/history 정상
7. 전체 Stage 15~23A QA PASS
8. Preview 실제 화면 확인
