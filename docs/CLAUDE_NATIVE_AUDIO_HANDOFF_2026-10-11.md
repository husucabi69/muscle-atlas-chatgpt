# 이윤석정형외과 근육 — Claude 원본 음성 1권 시범 이식 / 새 채팅 인계 정본
최종 정리: 2026-10-11 KST. 프로젝트 담당자는 의장님께 일반인도 이해할 수 있는 쉬운 한국어로 먼저 보고한다.

## 0. 반드시 읽고 시작
- GitHub: `husucabi69/muscle-atlas-chatgpt`, 개발 브랜치 `preview/development`, Production `main`. 의장님 명시적 승인 없이는 main 변경 절대 금지.
- 새 채팅에서는 반드시 먼저 `AGENTS.md`를 읽고 **최신 HEAD/Actions/Cloudflare Preview**를 재검증한다. 이 인계문에 적힌 SHA를 최신 HEAD로 단정하지 않는다.
- 사용자의 새 `진행해` 지시 전 자동 GitHub 수정 금지. 이번 개발 완료/다음 채팅 인계만으로 자동 재개하지 않는다.
- **실측 수동작업 25~30분 → 30~35분은 저장·검증·보고만 → 시작 후 35분 이내 최종보고까지 전송. 35분 HARD STOP 최우선.** 중단은 `USER_STOP_OVERRIDE`.
- 보고 형식 큰 제목 `① 뭘 했나`, `② 앞으로 뭘 할 건가`만 사용. 각 항목은 기술설명/쉬운설명/실제 앱 변화. PASS/FAIL/PARTIAL/BLOCKED, 실측 KST 시작·종료·보고·총 작업시간·규칙 준수 표시. 마지막 줄 `한국시간 YYYY-MM-DD HH:MM:SS KST`.
- TinyFish는 AGENTS.md 규정대로 기본 사용 금지/예외 사전 고지·동의. 예약·구매·유료 Runway 생성 금지(명시 승인 없으면).
- 화면 품질 하락/원문 축약·삭제/설명 허술화 금지. 오히려 원문을 100% 보존하면서 근거 확인된 **설명형 학술 해설**을 보강. 기존 승인 v11.14 근육 상세 UI, 이미지, 학술 원본·문제은행을 훼손하지 않는다.

## 1. 사용자 새 결정 — 2026-10-11
- 의장님은 **2026-10-13 화요일**에 Claude로부터 87강 전체 원본 음성 파일을 다운로드하여 업로드할 예정. 이를 받아 무상 **기존 녹음 이식**을 순차적으로 진행한다.
- 그 전에는 이미 구글 드라이브에서 확보된 Claude 근육학 제1권 `어깨·견갑대`의 원본 녹음 **1부·2부**로 앱 내 음성 재생을 우선 실제 시험한다.
- 원래 제작된 음성을 사용하는 것과 **Runway Niki로 87강을 새로 합성하는 사업은 별개**. Niki 유료 음성 재생성 계획은 **무기한 보류** 상태, 비용 지출 금지.
- 프리뷰 검수에는 매회 아래 링크를 명시해야 한다:
  `https://preview-development.muscle-atlas-chatgpt.pages.dev/`
- 의장님이 앱 화면/음성 품질을 승인하기 전에는 Production 승격이나 다른 강의의 일괄 변환을 진행하지 않는다.

## 2. 원본 강의 및 음성 정본
- 원본 Claude HTML 강의 총 **87개**는 저장·등록 완료. Native 이식 대상으로 시범 선정한 카탈로그 #3은 **근육학 01권 어깨·견갑대**.
- 이 강의의 원본 HTML은 1,104,600바이트, SHA-256:
  `c3a3eb7166004597a47d1e91dc31a0e41cb7131e863cd776b4c31bbe4b694821`.
- 근육학 1권 원문 **19개 section, 표 49개, figure/img 18개, 음성용 학습구간 671개** 보존. 추가 설명형 임상 해설 5개. 원본 HTML 그대로의 바이트를 보존하고 새 Native DOM에 복제·해시 검증.
- 원본 HTML 내부 `window.__AUD__` JSON에 **MP4 1부·2부 상대경로와 671개 원문 구간 [part,start,end] 타임코드가 이미 존재**함. 다시 합성하거나 문장 길이를 추정할 필요 없다. 구간 동기화에 활용.
- Google Drive `클로드 음성강의/2_음성/01_근육학`에서 실제 원본 MP4 발견. 폴더 ID `1grQ0hGkl6Nhwj4hfhufPOjLt66zxDQux`.
- 1부: `클로드_근육학_01권_어깨·견갑대_1부.mp4` / Drive ID `1gJ5rmtdluB0NxU6JmGDYC71QJpHq0TVH` / 17,183,339바이트 / SHA-256 `f32fd6b9e1cc3bfa376c40cfc151893e4f30e47be3e803e69eb1364560146ede` / AAC 24kHz mono / 4,490.598초.
- 2부: `클로드_근육학_01권_어깨·견갑대_2부.mp4` / Drive ID `1wk6ha_q3xGBNMkUGCrk7O421akOpGEXG` / 7,719,745바이트 / SHA-256 `165aea41a03ed624cfc537ab1a0110f4ef67a4da7f204794b580ba59181ad4c1` / AAC 24kHz mono / 2,047.270초.
- 두 MP4 합계 **24,903,084바이트**, 6,537.868초(108분 57.868초). 원본 SHA·용량 확인 PASS, `ffmpeg -xerror` 전 구간 디코딩 두 파일 PASS. Chromium의 실제 MP4 파일 선택 → play → 0.35초 이상 타임라인 진행 **두 부 모두 PASS**(브라우저의 독립 로컬 HTML 테스트). 이를 **Preview 앱 실제 Android 검수 완료로 오인하지 말 것**.
- 드라이브 `2_음성` 분야별 9개 폴더 조사에서 **원본 MP4 파일 73개, 총 679,988,394바이트** 발견(2026-10-10). 한 강의가 여러 MP4로 나뉠 수 있으므로 **73파일 ≠ 73강**. 아직 전 87강 모든 음성 확보 확정 아님.

## 3. 현재 구현 방식 (Preview v12.26 / source-only, Cloudflare 원본 자동호스팅 아님)
- `scripts/claude-native-muscle-recorded-audio-v1.js`: Claude 학술 원본 `window.__AUD__` 671타임코드를 파싱. 원본 두 MP4를 휴대전화 파일 선택기로 직접 지정하고 **각 원본 파일명·바이트 수·SHA-256 대조 후에만** `URL.createObjectURL(file)`로 인앱 `<audio controls>` 재생. 서버 업로드 없음.
- 1부/2부 선택, 이전/다음 문단, 0.85~1.5배속, 1부 종료 시 파일이 존재하면 2부 자동 연결, 타임코드에 따른 원문 671개 구간 강조/스크롤, 문단 터치 시 해당 녹음 위치로 이동, 하단 일시정지·정지 패널.
- `scripts/claude-native-muscle-v1.js`이 원본 서식 Shadow DOM 옆에 원본 녹음 플레이어를 앱 UI로 추가함. 19장·49표·18그림·671구간의 **표시·텍스트 손실 금지**.
- `scripts/claude-native-muscle-audio-v1.js`는 원본 MP4 없는 경우 무료 한국어 기기 TTS 보조로 남김. 두 음성이 동시에 재생되지 않도록 시작/전환 시 상호 일시정지. Runway 신규 결제 없음.
- `scripts/claude-native-muscle-recorded-audio-qa.mjs` 671 타임코드/원본 두 경로/해시 락 테스트; CI global-qa 연결. `scripts/claude-original-all-lectures-e2e.mjs`도 녹음 파일 선택 UI 존재·잘못된 MP4 거부 회귀 검사 추가.
- 최신 CI 상태는 새 채팅에서 직접 조회. 인계 작성 중 실행 결과를 최신 결과로 보장하지 않는다. 최종 통합 테스트 PASS 확인 전에는 `PARTIAL` 보고.

## 4. 지금 직접 Preview에서 검증할 순서
1. 모바일에서 구글 드라이브의 위 1부·2부 MP4를 다운로드(원본 파일명 변경하지 않기).
2. `https://preview-development.muscle-atlas-chatgpt.pages.dev/` 접속.
3. 홈 → **학술 강의실 → 근육학 → 근육학 01권 어깨·견갑대 → 우리 앱 통합 강의**.
4. `Claude 원본 여성 강사 음성` → **원본 MP4 1부·2부 선택**(함께 또는 순차 선택). SHA-256 검증 PASS 표시 확인.
5. ▶1부/▶2부, 일시정지, 0.85~1.5배속, 이어 듣기, 장·문단 클릭, 현재 문단 강조, 1부에서 2부 자동 전환 확인.
6. `원본 그대로 비교` 버튼으로 영상·표·설명·음성과 UI가 원본보다 나빠지지 않았는지 확인. 실제 Samsung/Android에서 소리·배속/버튼 안정성 검증 별도.
7. 파일 선택이 번거로운 이 방식은 **임시 시범**으로, 새로고침하면 브라우저 보안상 파일 재선택 필요. 사용자 휴대폰에 내려받은 원본 MP4를 웹서버로 전송하지 않는다.

## 5. 반드시 구분할 잔여 과제
- **아직 Cloudflare R2 음성 자동전송/호스팅은 미구현.** 배포의 `CLAUDE_MEDIA_R2` 바인딩 연결되지 않았고 현재 오디오 경로는 HTTP 503 `Audio storage not connected`를 반환할 수 있다. 사용자가 파일을 수동 선택하지 않아도 곧바로 원본 음성이 재생되는 기능 **미완료**.
- R2 Storage에는 실제 원본 MP4를 안전하게 올리고 Manifest의 원본 SHA/바이트 수 확인 후 Pages Function `functions/claude-library/2_음성/[[path]].js`로 HTTP 200/206 Range 스트리밍해야 한다. 무료 저장 한도·트래픽 확인, Cloudflare 계정 권한·바인딩 확보 필요. 자동 R2 업로드 전에는 정상 작동 주장 금지.
- 브라우저 Global QA 성공도 실제 기기/음질·전체 87강 완료를 뜻하지 않는다. CI에서 Cloudflare Preview exact SHA/branch alias 테스트, installed-PWA, 원본 87/87·10개 분야 E2E 확인 후 화면 검사.
- 문단 강조 정확성은 `window.__AUD__.t` 671개 타임코드를 기반으로 함. 손으로 임의 재구성하거나 설명을 축약하지 않는다.
- 87개 원문 전체 이식은 아직 미완료. **현재 Native 완전통합 시범은 카탈로그 #3 한 개**; 나머지 86개는 원본 페이지 방식.
- 기존 모바일 넘침 15건 및 Physical Examination 실사형·환자 운동 해설 등 기존 로드맵은 보존.

## 6. 2026-10-13 화요일 원본 87강 음성 수령 후 계획
1. 사용자가 올린 ZIP/폴더/개별 원본 파일을 **원본 이름·경로·크기·SHA256 기준** 인벤토리화. 원본 87강과 MP4 파일 수는 1:1 보장되지 않으므로 **누락/중복/여러 부**를 명확히 표시.
2. 기존 Drive에서 찾은 73 MP4와 대조해 실제 추가·변경·중복을 검출. ZIP이나 MP4의 바이너리를 소스텍스트로 재생성하지 않는다. 저작권과 기존 임상 학술 근거 표시 보존.
3. 우선 근육학 1권의 두 원본 MP4를 R2에 올릴 수 있는 방식·권한 확보 → manifest/range streaming/원본 SHA 검증 → 설치형 Android Preview에서 **파일 선택 없는 재생** 실물 확인.
4. 음성 동기화 원문 `__AUD__.t` 존재 유무를 강의별 확인. 없으면 구조/구간별 수동·반자동 매핑 QA가 필요하며, 없는 타임코드를 만들어졌다고 주장하지 않는다.
5. 공통 Native 강의 엔진 설계 및 강의 유형별 파서/컨트롤 확대. 87개 모두 원문 100%/도표/그림/해설 훼손 금지, **설명형 내용은 검증된 보강만 추가**, 과학적 근거 오류 검수.
6. 매 소수 강의 배치마다 **Preview URL 사용자 검수 → 승인을 받은 후 다음 배치**, main/Production 승격은 마지막 별도 승인 뒤에만.

## 7. 다음 작업 시작 후 우선 확인
1. `AGENTS.md` 읽기 → `preview/development` 최신 HEAD 및 Actions 최근 성공/실패, Cloudflare Pages Preview 최신 빌드 식별.
2. `scripts/claude-native-muscle-recorded-audio-v1.js` 및 `scripts/claude-native-muscle-recorded-audio-qa.mjs` 검사. 파서가 실제 `window.__AUD__` JSON을 올바르게 읽는지 Node/브라우저 QA 확인.
3. 기존 Google Drive 원본 1·2부 파일은 Drive IDs로 검색, 17,183,339 + 7,719,745바이트, 각 SHA-256이 일치하는지 실측.
4. 인앱 Preview 브라우저/Android 검수 후 발견된 오류만 수정. Niki 유료 음성 생성 금지. R2 미설정이면 `BLOCKED`를 명시하고 대체로 local-file 재생 테스트를 계속.

## 8. 이번 회차 참고 증빙 (HEAD가 아닌 과거 체크포인트)
- 2026-10-10 기존 Preview v12.25/HEAD `64a9643b3b94a0c33e3dbd3e19ef7ada403ad04b`, Global QA+Preview SUCCESS.
- 2026-10-11 v12.26 새 소스 `scripts/claude-native-muscle-recorded-audio-v1.js` 도입.
- 2026-10-11 E2E/타임코드 QA 보완, 음성 강조가 원본 Shadow DOM에 보이도록 수정.
- 시범 원본 MP4 두 파일 실제 AAC 디코드 및 Chromium headless 오디오 시간 전진 확인 PASS. **실물 Android Preview 원본 재생은 미검증**.
- 코드/원본은 GitHub Preview 브랜치에 저장. 위 SHA를 최신으로 단정하지 말고 반드시 GitHub를 재조회.

마지막 지침: **기존 강의를 단순 링크시키거나 축약하지 말 것. 실제 소리와 671개 강조가 나오도록 구현할 것. 원본 87강 + 이미지/표/서술 완전 보존, 설명은 보강. 모든 보고에 프리뷰 링크와 실측 시간을 포함.**
