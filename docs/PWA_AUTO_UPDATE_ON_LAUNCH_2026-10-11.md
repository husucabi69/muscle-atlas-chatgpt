# 이윤석정형외과 근육 — 실행 시 자동 갱신 PWA 계약 (Preview v12.33)

작성일: 2026-10-11 KST. 설치형 PWA가 휴대전화 홈화면에서 실행될 때, 사용자의 별도 '업데이트 확인' 조작 없이 최신 Preview 버전을 확인·전환하도록 한다.

## 작동 원리 — 최초 실행 / 다시 열기
1. 설치 주소는 **https://preview-development.muscle-atlas-chatgpt.pages.dev/** 처럼 고정된 **브랜치 Preview**다. `https://<8자 SHA>.muscle-atlas-chatgpt.pages.dev` 형식 배포고정 주소는 영원히 그 버전에 고정되므로 이 주소를 PWA로 설치하면 자동 갱신을 약속할 수 없다.
2. 앱은 열릴 때 `navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'})`, `registration.update()`를 실행한다. 브라우저/네트워크가 허용하는 경우 `app-version.js`의 최신 빌드번호도 no-store로 읽어 오래된 페이지와 새 배포를 대조한다. 수시 포커스/복귀/연결회복 때에도 15초 중복 확인 제한을 지킨다(연결회복은 강제).
3. Service Worker는 **앱 index.html 네비게이션, 모든 앱 JS/CSS 및 데이터 JSON을 온라인에서는 network-first**로 받는다. 이전 버전의 스크립트가 잠깐 제공돼 서로 다른 UI/로직을 섞는 문제를 예방한다. 오프라인에서는 저장된 검증 캐시가 사용된다. Claude 학술 원본 HTML은 별도 byte+SHA-256 검사 관문을 반드시 통과해야 하며, 원본 MP4 Range 요청은 캐시 우회한다.
4. 새로운 SW가 설치되면 `SKIP_WAITING`→`clients.claim()`으로 진행하고, 컨트롤러/네트워크 build의 **정확한 버전**을 대조한다. 신규 SW 활성화 전에 이미 최신 HTML을 보고 있다면 이전 SW 버전을 최신보다 우선하지 않아 **다운그레이드 없음**. 이전 문서 버전으로 영구 reload 횟수를 막는 결함 대신 **신규 목표 빌드별 60초 루프 방지**를 사용한다.
5. 앱 홈 화면에서 새 배포를 확인하면 **자동으로 한 번 새로고침**한다. 강의 듣기·환자교육 등 홈이 아닌 화면에서 업데이트 발견 시 **현재 작업은 강제 재시작하지 않고 보류**, 홈으로 이동하면 사용자 재확인 버튼 없이 자동 적용한다. 입력 중인 양식, 모달, 오프라인 상태는 안전 정책에 따라 재시작하지 않는다.
6. 저장된 학습 진도(localStorage/IndexedDB 등)를 삭제하지 않는다. 기존 v11.14 해부학 5탭, 기존 앱 기능, Claude 87개 원본과 Production/main을 유지한다.

## 정밀한 사용자 표현
- **가능:** 온라인에서 설치된 안정 Preview PWA를 열면 새 버전 여부를 자동으로 확인하고 업데이트가 있을 때 안전하게 적용. 수동 버튼 불필요. 새 앱이 완전히 백그라운드에 종료된 상태에서는 플랫폼이 '앱을 열기' 전까지 서비스를 계속 실행하지 않는다는 한계가 있다.
- **불가능한 약속:** 네트워크가 없는데도 최신 클라우드 버전을 받는다; Chrome/Android가 강제 종료해도 무조건 업데이트된다; 실제 휴대전화의 업데이트 동작을 Playwright만으로 인증한다; 고정 배포번호 주소에 설치된 PWA가 자동으로 이동한다.
- **실기기 PENDING:** 삼성 Android Chrome 홈 아이콘 설치 → v12.33 안정 Preview 실행 → 새 SHA 배포 후 강제 종료 없이 재실행/복귀 → 업데이트 확인, 저장 기록, 소리, 오프라인/복귀, 동일한 아이콘 유지 검수.

## 코드 및 QA
- 앱 lifecycle/다운그레이드·이중 재시작 차단: `index.html`.
- 온라인 자산 freshness/offline fallback: `sw.js`.
- 단위 보증: `scripts/auto-update-qa.mjs`, `scripts/real-device-offline-qa.mjs`.
- 브라우저 자체 Service Worker 업데이트 실험: `scripts/pwa-auto-launch-update-e2e.mjs` (독립 포트의 동일 URL에서 old→new 배포, 홈 자동갱신, 최신 JS, 컨트롤러 최신화, 학습 중 보류·홈 자동 적용 검증).
- 실제 Preview hash/브라우저/Android 상태는 GitHub Actions/Cloudflare 실제 결과 확인 전에는 PASS로 표시하지 않는다.
