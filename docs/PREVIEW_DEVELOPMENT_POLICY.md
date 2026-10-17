# Preview Development Policy

## H3Y DEVELOPMENT EXECUTION PROTOCOL v1.0 — 2026-10-17 최신 의장님 지시 / 우선 적용
- 의장님 새 공통 운영지시: **기본 35분, 최대 50분**. 0분 시작·목표 보고, 15분 상태점검, 30분 종료/연장 판단, **35분 완료 여부 무관 필수 진행보고**, 필요하면 그 후 50분까지 자율 연장, **50분 절대 HARD STOP 및 최종보고**. 35분 보고 없는 무음 연장 금지. 보고 전송을 실제로 보장할 수 없는 도구/채팅 지연은 실측과 함께 정직히 알린다. 
- **최신 지시 우선:** 아래 역사적 2026-10-11 `35분 HARD STOP`, `25~30분 개발` 하한, `30분부터 모든 신규 수정 금지`, `2개 큰 제목만` 규칙은 이 새 운영시간·보고구조와 충돌하는 범위에서 **SUPERSEDED / 역사적 기록**이다. 거기에 등장하는 `최상위` 문구는 최신 의장님 명시 지시를 취소하지 않는다.
- 세 단계 보고: `① 무엇을 했나 → ② 어떻게 되었나 → ③ 앞으로 무엇을 할 건가` + 🟢/🟡/🔴/🔵 상태판, 실제 KST 시간·작업 근거. 사용자 `중지`는 즉시 `USER_STOP_OVERRIDE`; Runway 사용금지, Production/main 보호, ct086 이미지 승인 Gate, Claude 2판 HOLD, 3D/Layer/Motion/CROS 필수순서와 비용 절감은 그대로 유지.
- 상세 정본: `docs/H3Y_DEVELOPMENT_EXECUTION_PROTOCOL_V1.md`. 개발 전 `ROADMAP-FIRST` 전체 문서 숙독과 GitHub HEAD 대조 의무.


> **HIGHEST PRIORITY — SUPER-LOCK 2026-10-11:** time AND actual final-report delivery deadlines override feature completion, QA/deploy waits and roadmap scope. Manual development 25~30분; wrap 30~35분; report first at minute 33; 35분 HARD STOP includes the **final response actually sent** (35분 내 최종보고 전송). Record real KST start/end/report, show PASS/FAIL or 미계측 for each gate, user `USER_STOP_OVERRIDE` immediately. For scheduled automation apply its separate deadline, keeping real measurement/report supremacy.

This is the long-lived development line for 이윤석정형외과 근육.

- Branch: `preview/development`
- Production: `main` stays frozen during active development
- All new work accumulates here
- Cloudflare Branch Preview is the review surface
- Each meaningful batch is visually reviewed before more work continues
- Approved batches remain in Preview and are not promoted individually
- Final Production promotion happens only after all planned development is complete and the chairman explicitly approves it
- Manual development on this branch follows the canonical timing rule: **25~30 minutes actual development, 30~35 minutes wrap-up only, 35 minute HARD STOP**, with measured start/end/report times in the final report.
- **HIGHEST PRIORITY — LOCKED 2026-10-09:** time compliance takes precedence over feature completion and deployment. Count the **final report delivery** in the 35-minute HARD STOP; no new work after 30 minutes, prepare handoff/report by minute 33, leave unfinished work PARTIAL/BLOCKED. Real KST timestamps are mandatory; user stop overrides immediately.
