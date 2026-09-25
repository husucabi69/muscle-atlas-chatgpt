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
