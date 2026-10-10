# Claude 87강 — Preview 실사용 검증 정본
**작성:** 2026-10-09 · Preview 개발선만 해당. Production/main 승격 승인 아님.

## 상태 분리 (PASS 오용 금지)

| 대상 | 범위 | 완료 기준 |
|---|---|---|
| 원본 이식 | 87/87 HTML 파일 및 manifest | SHA-256 원본 동일성 검증 |
| 원본 파일 실제 배포 | 정확한 GitHub SHA에 해당하는 Cloudflare Preview 87/87 URL | HTTP 200, 바이트 수 및 SHA-256 원본 동일 |
| 앱 화면에서 강의 진입 | 10개 분야 87강 전체 | Chromium 휴대폰 너비 390px에서 분야→목록→강의→iframe 원본 로딩→뒤로 이동 통과 |
| 데스크톱 표본 | 분야별 대표 강의 10건 | Chromium 1280px에서 동일 경로 통과 |
| 브라우저 뒤로 가기 | 모바일 대표 1건 | iframe 이동 후 브라우저 Back으로 강의 목록 복귀 |
| 원본 미디어 | 78강 '음성 있음' | 파일 존재→원본 크기/해시→R2 스트리밍 및 재생 검증 후에만 READY |
| 원본에 음성 없음 | 9강 | '원본에 음성 파일 없음' 명확히 표시, 재생 대기/완료로 오기하지 않음 |
| 인터랙션 전체 | 원본 강의 내 퀴즈·채점·내비게이션·SVG | 별도 기능별 검증. 기본 로딩 PASS와 구분 |
| 실제 Android/PWA | 실기기 확대·가로/세로·오프라인·앱 전환·오디오 | 실기기 직접 검수 후에만 완료 선언 |

## 자동검증 및 증거

1. `scripts/claude-library-runtime-qa.mjs`: manifest/원본 파일 SHA와 경로 검증.
2. `scripts/claude-original-all-lectures-e2e.mjs`: **실제 Chromium**으로 87강 모바일 경로 및 10강 데스크톱 표본 검증. 로컬 서버 실행은 `runtime-navigation-e2e`, Cloudflare **정확한 배포 SHA** 실행은 `deploy-safety-gate` 작업에서 진행한다.
3. `scripts/claude-live-original-fidelity-qa.mjs`: 해당 SHA의 Cloudflare Preview 87강 파일을 다운로드하여 각 원본의 byte count/SHA-256과 대조. 누락 1건이라도 FAIL.
4. 클라우드 검증의 사전조건: `scripts/deploy-safety-gate.mjs`가 정확한 커밋과 Cloudflare 배포 상태/Preview URL/버전을 대조하여 PASS.
5. Actions 증빙: `claude-all-lectures-e2e-<SHA>`, `claude-live-preview-e2e-<SHA>`, `deploy-safety-evidence-<SHA>` (각 14일 보관). JSON 보고서의 `remotePreviewVerified` 및 `physicalAndroidVerified`, `originalMp4PlaybackVerified` 필드를 반드시 구분한다.
6. 원본 HTML은 절대 테스트를 위해 수정하거나 요약하지 않는다.

## 판정 원칙

- CI 검사 **스크립트를 작성했다는 사실은 CI PASS가 아니다**. 해당 커밋 GitHub Actions run의 종료 결과를 조회해야 PASS 판정한다.
- Chromium 휴대폰 뷰포트 통과는 물리적 Android 단말 실사용 검증과 다르다.
- 이미지/JS 오류, 내부 목차·검색, 자동채점, 음성 MP4의 최종 사용자 경험은 별도 시험 완료 전 **PARTIAL 또는 미검증**이다.
- 화면 폭 초과는 E2E JSON `knownHorizontalOverflows`에 기록하며 발견만으로 해결 완료라고 기록하지 않는다.
- R2 미연결·음성 미업로드 상황에서 '음성 재생 가능'이라고 표시하지 않는다.
- 시간 제한: 의장님 수동 개발은 최종보고 포함 시작 후 35분 HARD STOP. CI 장기 실행 결과를 기다리며 제한을 초과하지 않는다.

## 검수 위치

**Cloudflare Preview**: https://preview-development.muscle-atlas-chatgpt.pages.dev

홈 → 상단 **학술 강의실** → **분야 선택** → **강의 선택** → 'Claude 원본 HTML 자체호스팅' 확인 → **학술 강의실 전체**로 복귀.

개발 기본 정책: Production/main은 의장님 명시적 승인 전까지 절대 변경하지 않는다.

## 외부 검증 도구 사용 기록 및 정책 교정 — 2026-10-09

- 목적: 이번 개발 회차의 Cloudflare Preview release와 GitHub Actions 상태를 **읽기 전용**으로 확인.
- 자체 수단 선행: GitHub connector로 최신 branch/manifest/CI 정본을 읽음. 연결된 GitHub tool은 push-run 리스트 조회에 제한이 있었고 자체 실행 환경의 네트워크 DNS가 실패. 자체 Playwright E2E는 CI 작업으로 설정함.
- 예외 사용 1회: **TinyFish Fetch** (브라우저 Agent 아님). 대상: `https://preview-development.muscle-atlas-chatgpt.pages.dev/app-version.js` 및 `https://github.com/husucabi69/muscle-atlas-chatgpt/actions`; **호출 1회 / 총 URL 2개**.
- 비용: 지갑 조회 당시 Fetch 단가 **$0 / URL**, 예상 및 해당 유형의 과금 **$0**. Wallet auto-reload 상태 `unconfigured`; 자동충전 설정을 조작하지 않음.
- 관측: Preview의 `2026.10.09-stage23.90` / `v12.18` 응답 확인. GitHub 공개 Actions 페이지는 최신 해당 commit Global QA를 `In progress`로 노출. 이는 개별 작업 PASS나 최종 결과의 증거가 아님.
- **위반 사실:** `docs/MASTER_ROADMAP.md`의 더 엄격한 TinyFish 규칙은 **단순 공개 페이지 읽기 및 GitHub/Cloudflare 상태 확인 사유 사용 자체를 금지**한다. 사용자는 사전에 자체 수단 제한·대상·단가를 설명받았지만, 호출 당시 더 엄격한 규칙을 확인하지 못하고 조회한 절차 위반을 즉시 사용자에게 알림. 다음 회차부터 이 목적의 TinyFish Fetch도 **사용하지 않는다**. 도구 추가 호출 없음.
- 실제 Preview 전수 브라우저 점검 및 물리적 Android 검증은 별도 CI·실기기 증거 없이는 완료 선언하지 않는다.

## Android 사용자 실사용 회귀 — 2026-10-09 23:31 KST (Release Blocker)

**의장님 제보:** Android Preview v12.18에서 학술 분야를 누르면 같은 화면 아래쪽에 2단 목록이 갱신되어 찾아 내려야 했고, 강의를 누른 다음 iframe 내부에 `원본 강의 확인 필요`라는 Service Worker 생성 503 오류 페이지가 표시됨. 네트워크 아이콘은 5G. 이 상태를 87강 실사용 완료라고 판정하면 안 됨.

**독립 화면 필수 구조:** `학술 강의실(10개 분야)` → `선택 분야의 강의 목록만` → `우리 앱에 저장한 실제 원본 HTML 1강만`. 선택 즉시 상위 목록은 숨기고 현재 새 화면 최상단에 보여야 함. 2단/3단 화면 상단의 `← 전체 학술 분야` / `← 강의 목록으로`, Android Back 동일 경로를 제공. 목차 밑에 결과를 덧붙이는 UI는 영구 금지.

**원본 검증 정책:** 자체호스팅 manifest 87건과 실제 렌더링 성공을 구분. iframe이 "원본 강의 확인 필요"라는 SW 실패 문서이면 원본을 읽었다고 표시하지 않고 내부 원본 로딩 실패 및 재동기화 버튼 제공. 외부 Claude Artifact URL은 선택적으로 실패한 경우만 보조적 경로이며 내부 강의의 대체 구현이라고 주장하지 않는다. 원본 HTML 바이트는 그대로 유지한다.

**수정 적용:** 독립 category drill, 하단 중복 24강 목록 숨김, Android scroll reset, 브라우저 뒤로가기 3단 보강, Service Worker 네트워크 최신 manifest 재검증 + 검증 실패 코드 노출, iframe onload 실체 확인 및 재시도 버튼, 활성 Service Worker 상태의 로컬·정확한 Cloudflare Preview E2E 2강 추가, 로컬·live 87강 전수 browser E2E에서 503 문서 검출.

**완료 판정:** 위 수정 코드가 GitHub에 있다는 것만으로 PASS 아님. 새 commit의 GitHub Actions Global QA / Runtime E2E / Deploy Safety Gate와 실제 Cloudflare 배포 완료 및 의장님의 Android 화면 검증이 필요함. 실제 모바일 전체 87강과 음성 재생 검증은 여전히 별도 미완료 상태.

**도구 원칙:** 이 장애 회차는 GitHub 공식 커넥터와 기존 자체 QA 스크립트만 사용하며 TinyFish 호출은 수행하지 않음. Production/main 미변경.

## Android/PWA Claude original redirect correction — 2026-10-10 / Preview v12.22

**User-facing scope:** Only the installed PWA lecture navigation. All 87 Claude original HTML files and the approved 3-screen layout are unchanged. Runway Niki narration redesign remains on hold; no billing/audio generation.

**Failure evidence:** Exact-SHA Cloudflare Preview's unmodified originals work in the ordinary browser, but installed Service Worker navigation returned `ORIGINAL_HTTP_0`. Cloudflare Pages canonicalizes `/lecture.html` to `/lecture`; browser navigation FetchEvent Requests may have `redirect: manual`, yielding a masked `opaqueredirect` with status 0 rather than actual HTML when code uses `fetch(event.request)`.

**Patch:** `sw.js` now fetches canonical HTML by same-origin GET URL, explicitly following redirects. It still validates exact manifest source byte count and SHA-256 before caching. A followed response is reconstructed for `navigate` before answering `respondWith` so that Chromium does not reject a redirected response. The release cache key advances to `20261010-stage23-94` to migrate prior installed-PWA cache state.

**Regression:** `scripts/claude-original-source-integrity-sw-qa.mjs` now simulates both opaque HTTP 0 navigation and followed redirects, while preserving poison cache rejection, offline exact-source fallback and manifest identity. The previous commit's Global QA recorded **17/17 source-integrity checks PASS**. New release's exact-SHA Cloudflare/installed-PWA E2E must pass independently before the bug is called resolved.

**Acceptance:** Global QA PASS + Runtime E2E PASS + Deploy Safety Gate PASS + installed-PWA Claude representative lectures across 10 academic fields PASS + real Android user check. Do not report real Android or original MP4 audio as verified until tested.
