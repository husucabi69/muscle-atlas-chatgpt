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
