# Google Play Release Plan — 이윤석정형외과 근육

기준일: 2026-09-25  
상태: Stage 13 Android TWA shell COMPLETE / Play Console submission NOT YET DONE

## 완료
- PWA 유지
- Trusted Web Activity Android shell
- provisional package ID: `kr.co.lysortho.muscle`
- targetSdk / compileSdk 36
- Android Browser Helper 2.7.3
- AndroidX Browser 1.10.0
- JDK 17 / AGP 9.4.0 / Gradle CI 9.6.0
- HTTPS-only Android shell
- native RECORD_AUDIO permission 없음
- PR 및 main에서 Android App Bundle(AAB) release build PASS
- main exact SHA `233d959ff4d5b91037fe2e62901ce2e632454cb6`
- Global QA `36119496794` SUCCESS
- Android TWA QA `36119496821` SUCCESS
- Pages `36119495814` SUCCESS
- 공개 `privacy.html`
- patient/clinical disclaimer
- PHI boundary
- 광고 SDK 없음
- 계정 필수 아님

## 현재 핵심 BLOCKER

### 1. Digital Asset Links
현재 launch origin:
`https://husucabi69.github.io`

TWA 검증 파일은 반드시 origin root:
`https://husucabi69.github.io/.well-known/assetlinks.json`
에서 제공되어야 한다.

project repo 내부 `/muscle-atlas-chatgpt/.well-known/`만으로는 해결되지 않는다.

최종 해결:
- root를 제어하는 user-site/custom-domain/Cloudflare origin 확보
- Play App Signing SHA-256 fingerprint 확보
- 실제 fingerprint로 최종 assetlinks 배포

placeholder fingerprint는 public 배포하지 않는다.

### 2. Play Console / signing
아직 필요:
- organization developer account/verification
- 최종 package ID 확정
- upload key / Play App Signing
- signing certificate SHA-256 fingerprint
- 실제 Play app 생성 및 AAB upload

### 3. Policy forms
아직 필요:
- Health Apps declaration
- Data safety (Play Console Data Safety)
- content rating
- support contact
- store listing 제출

Health Apps 사전판정:
- Medical Reference and Education
- Physical Therapy and Rehabilitation

현재 범위에서는 Clinical Decision Support 또는 Medical Device Apps로 홍보하지 않는다.

### 4. Data Safety voice gate
localStorage 학습기록은 Atlas 서버로 전송되지 않는다.
그러나 Web SpeechRecognition은 브라우저/OS provider의 network processing을 사용할 수 있다.

따라서 실제 Android/TWA에서 audio/transcript off-device 처리를 확인하기 전 전체 앱을 "no user data collected"로 최종 신고하지 않는다.

### 5. Store assets / device QA
아직 필요:
- 512×512 Play icon 최종검수
- 1024×500 feature graphic
- phone screenshots
- physical Android internal testing
- toolbar-less TWA verification
- Oral Viva microphone/text fallback
- print/external-link/offline/update regression

## 다음 실행 순서
1. Play Console organization account 준비 및 app/package ID 확정
2. Play App Signing certificate fingerprint 확보
3. root assetlinks 제공 origin 확정
4. Digital Asset Links PASS
5. physical Android internal test
6. Data Safety voice classification 확정
7. screenshots/feature graphic
8. Health Apps / Data Safety / content rating 제출
9. internal test
10. review submission

## 상세 제출 패키지
- `docs/PLAY_STORE_SUBMISSION_PACK_2026-09-25.md`
- `data/play-store-submission-v1.json`
