# Google Play Release Plan — 이윤석정형외과 근육

기준일: 2026-09-25

## 결론
현재 PWA는 Google Play에 게시 가능하다. 권장 방식은 Trusted Web Activity(TWA) + Android App Bundle(AAB)이다.

## 2026 필수조건
- new apps / updates: target Android 16, API 36+
- new Play apps: Android App Bundle(AAB)
- Health apps declaration 제출
- 공개 웹 URL의 Privacy Policy 필요
- 의료·재활 기능/정보의 정확한 health feature declaration 필요
- 앱이 의료기기가 아니라면 이를 store listing/in-app에 명확히 표시하고 개인 진단 대체처럼 표현하지 않는다.

## 권장 packaging
1. 현재 PWA를 유지한다.
2. Bubblewrap/android-browser-helper 기반 TWA shell을 만든다.
3. package id는 Play Console 생성 전 최종 확정한다. provisional: kr.co.lysortho.muscle
4. targetSdk 36 이상.
5. signing/upload key 생성 후 Play App Signing 사용.
6. Digital Asset Links 검증.
7. AAB 생성 → internal testing → closed/open testing → production.

## 중요한 현재 hosting 이슈
현재 start URL은 https://husucabi69.github.io/muscle-atlas-chatgpt/ 이다.
TWA full-screen 검증용 assetlinks.json은 origin root:
https://husucabi69.github.io/.well-known/assetlinks.json
에 있어야 한다.

프로젝트 repo의 /muscle-atlas-chatgpt/.well-known/ 경로만으로는 root asset-link requirement를 충족하지 못한다.
따라서 다음 중 하나가 필요하다.
- husucabi69.github.io 사용자 사이트 repo에서 root /.well-known/assetlinks.json 제공
- 또는 Atlas를 직접 제어 가능한 custom domain/Cloudflare Pages origin으로 옮겨 root assetlinks 제공

## 준비된 항목
- PWA manifest
- fullscreen/standalone fallback
- 192/512 icons
- 공개 privacy.html
- patient/clinical disclaimer
- PHI를 Atlas에 저장하지 않는 boundary
- no ad SDK / no account requirement

## 아직 필요한 항목
- Google Play Console developer account
- 최종 Android package ID
- signing key / Play App Signing fingerprint
- assetlinks.json final fingerprint
- targetSdk 36 TWA project + AAB build
- store listing: short/full description, screenshots, 512 icon, 1024x500 feature graphic
- Health apps declaration (Medical reference/education + Physical therapy/rehabilitation 범위 검토)
- Data safety form
- content rating
- internal testing on physical Android devices
- Play review submission

## Release gate
AAB를 production에 올리기 전에:
- PWA exact preview PASS
- TWA Digital Asset Links PASS
- Android 16/API36 build PASS
- microphone permission/disclosure PASS
- privacy-policy URL PASS
- offline/update/service-worker PASS
- physical-device Oral Viva/print/external-link test PASS
- Health Apps declaration/store listing wording review PASS


## 2026-09-25 Google 공식 정책 재검증
공식 Google Play 문서 기준으로 아래 항목을 재확인했다.
- 2026-08-31부터 신규 앱/앱 업데이트: Android 16 / API 36 이상 필요
- 신규 Google Play 앱: Android App Bundle(AAB) 게시
- Health apps declaration: 모든 게시 앱이 작성해야 하며 이 앱은 기능상 아래 범위를 우선 검토
  - Medical Reference and Education
  - Physical Therapy and Rehabilitation
- 현재 앱은 환자별 진단·치료 결정을 자동 생성하지 않으므로 Clinical Decision Support로 표현하거나 홍보하지 않는다. 향후 기능이 바뀌면 재평가한다.
- 비의료기기 건강·의료 앱은 store listing 및 app 내에 '의료기기가 아니며 의학적 상태를 진단·처치·치료·예방하지 않는다'는 취지의 명확한 고지와 의료전문가 상담 안내가 필요하다.
- 모든 앱은 Play Console Data safety section과 공개 Privacy Policy를 정확히 유지해야 한다.

공식 근거:
- https://support.google.com/googleplay/android-developer/answer/11926878
- https://developer.android.com/guide/app-bundle
- https://support.google.com/googleplay/android-developer/answer/14738291
- https://support.google.com/googleplay/android-developer/answer/16679511
- https://support.google.com/googleplay/android-developer/answer/10144311

## Data Safety 사전판정 주의
- localStorage 퀴즈/오답 기록은 현재 별도 Atlas 서버로 전송하지 않는다.
- Oral Viva의 Web SpeechRecognition은 브라우저/운영체제/음성인식 제공자의 네트워크 서비스를 사용할 수 있다.
- 따라서 AAB 제출 직전 실제 TWA/Android 동작을 기준으로 microphone/audio 및 변환 텍스트의 off-device 전송 여부를 다시 확인하고 Data safety form에 보수적으로 반영한다.
- 환자 이름·진료기록·민감 건강정보를 Oral 답변에 넣지 말라는 앱 내 고지를 유지한다.
