# Stage 23 — Real Device & Offline Quality Gate

상태: Preview 실기기 검수용 정본  
목표: **critical FAIL 0 / data loss 0 / update regression 0**

## 원칙

- 자동 CI PASS는 실제 기기 PASS를 대신하지 않는다.
- 앱 내부 **실기기·오프라인 품질 점검**에서 자동 항목을 먼저 확인한다.
- 아래 수동 항목은 사람이 해당 환경에서 직접 실행한 경우에만 PASS로 기록한다.
- 학습기록 검수 중 `localStorage.clear()`를 사용하지 않는다.
- 환자정보, 진료기록, 음성 원문을 QA 기록에 저장하지 않는다.

## Chrome / 설치 PWA / TWA 차이

| 항목 | Chrome 브라우저 | 설치 PWA | Android TWA |
|---|---|---|---|
| 주소창/브라우저 UI | 보임 | 독립창, fullscreen 계약 | Digital Asset Links 검증 성공 시 toolbar-less |
| 시작 URL | 일반 웹 URL | `?source=pwa` | `?source=twa` |
| Service Worker | 지원, 첫 진입은 controller 없을 수 있음 | 지원, 설치 후 오프라인 핵심 | 웹 origin의 Service Worker 사용 |
| 자동 업데이트 | registration.update + skipWaiting | 동일 | 동일한 웹 업데이트 경로 |
| 오프라인 cold start | 브라우저 캐시 상태에 따라 검수 | 핵심 검수 대상 | 설치본에서도 동일 검수 필요 |
| Oral 마이크 | 브라우저 권한 | 브라우저/PWA 권한 | native RECORD_AUDIO 없이 웹 권한 |
| Human-voice TTS | 기기 SpeechSynthesis | 동일 | Android WebView/Chrome 제공 음성 |
| 공유 | Web Share 또는 clipboard fallback | Android 공유창 기대 | Android 공유창 기대 |
| 인쇄 | 브라우저 인쇄 | 시스템/브라우저 인쇄 | 지원 여부 실제 기기 확인 |
| toolbar-less 보장 | 해당 없음 | 해당 없음 | Play signing fingerprint + root assetlinks 필요 |

## 실기기 수동 Gate

### 1. 홈 아이콘 / fullscreen
1. Chrome에서 Preview를 연다.
2. PWA 설치가 가능한지 확인한다.
3. 홈 아이콘이 정상 표시되는지 확인한다.
4. 설치 PWA를 열어 주소창 없이 fullscreen으로 실행되는지 확인한다.

### 2. 자동 update
1. 설치 PWA를 연 상태에서 새 Preview 버전이 배포된 경우 **업데이트 확인**을 누른다.
2. 새 worker가 설치/활성화되고 한 번만 reload 되는지 확인한다.
3. Quiz/Oral/즐겨찾기/최근 본 기록이 유지되는지 확인한다.

### 3. offline cold start / online recovery
1. 온라인 상태에서 앱을 한 번 완전히 연다.
2. 앱 내부 자동점검에서 **오프라인 core cache 완전성 PASS**를 확인한다.
3. 비행기모드를 켠다.
4. 앱을 task switcher에서 완전히 종료한다.
5. 다시 실행해 홈, 해부학 부위, 퀴즈, 환자교육 기본 데이터가 열리는지 확인한다.
6. 네트워크를 다시 켠다.
7. 앱이 오류 없이 온라인 상태로 복귀하고 업데이트 확인이 동작하는지 확인한다.

### 4. Oral microphone + Human-voice TTS + fallback
1. Oral 테스트를 시작한다.
2. 질문/피드백 음성이 실제로 들리는지 확인한다.
3. **말하기** 버튼으로 한국어 답변이 텍스트로 들어오는지 확인한다.
4. 마이크를 거부하거나 음성인식이 불가능한 상황에서도 직접입력으로 계속 가능한지 확인한다.
5. TTS가 불가능한 상황에서도 화면 질문/피드백으로 계속 가능한지 확인한다.

### 5. 환자교육 print/share
1. 환자 운동·스트레칭에서 임의 근육 하나를 연다.
2. **이 운동표 인쇄**로 미리보기에서 잘림/겹침이 없는지 확인한다.
3. **공유**를 눌러 Android 공유창이 열리는지 확인한다.
4. Web Share 미지원 환경에서는 clipboard fallback 메시지가 나타나는지 확인한다.
5. 공유 텍스트에 환자 이름/차트번호/진료내용이 없는지 확인한다.

### 6. 해부학 / 대표도해 / 초음파
1. 해부학 부위 → 근육 → 상세 → 뒤로가기가 정상인지 확인한다.
2. 대표 근육 도해가 있는 근육을 열어 깨진 이미지/레이아웃이 없는지 확인한다.
3. 초음파 임상 흐름에서 canonical view로 이동하는지 확인한다.
4. 131 view 데이터가 자동점검 PASS인지 확인한다.

### 7. Quiz / Oral history persistence
1. Quiz 1문제 이상, Oral 1문제 이상을 수행한다.
2. 앱을 완전히 종료 후 재실행한다.
3. 누적 Quiz 기록, Oral 약점, 내 학습 dashboard가 유지되는지 확인한다.
4. 업데이트 후에도 같은 기록이 유지되는지 확인한다.

### 8. 화면회전 / 작은화면 / 큰글자
1. 세로와 가로 방향을 각각 확인한다.
2. 작은 Android 화면에서 탭/버튼/카드가 root viewport 밖으로 밀리지 않는지 확인한다.
3. Android 시스템 글자 크기를 크게 설정하고 재실행한다.
4. 버튼 텍스트, 퀴즈 선택지, Oral 답변창, 임상 카드가 겹치거나 잘리지 않는지 확인한다.

### 9. TWA
최종 Play signing 전에는 BLOCKED로 유지한다.

필수 조건:
- 최종 package ID 확정
- Play App Signing SHA-256 fingerprint 확보
- `https://husucabi69.github.io/.well-known/assetlinks.json` 배포
- 설치 Android 기기에서 toolbar-less launch 확인

프로젝트 하위 경로의 `/muscle-atlas-chatgpt/.well-known/`만으로는 origin root 검증을 대체할 수 없다.

## Stage 23 완료 판정

Stage 23은 아래가 모두 충족될 때만 COMPLETE로 바꾼다.

- CI Stage 23 static gate PASS
- 앱 내부 자동점검 critical FAIL 0
- 수동 Gate에서 실제 대상 환경 항목 PASS
- offline cold start PASS
- update 후 학습기록 data loss 0
- update regression 0
- 실제 Preview 화면 사용자 확인
- TWA toolbar-less 항목은 Play signing/DAL이 준비될 때까지 명시적으로 BLOCKED로 남길 수 있으나, Stage 24 Production Release 전에는 반드시 해소한다.
