# 이윤석정형외과 근육 — Android TWA shell

이 디렉터리는 기존 PWA를 변경하지 않고 Google Play용 Android Trusted Web Activity(TWA) shell만 제공한다.

## 고정값
- Application ID (provisional): `kr.co.lysortho.muscle`
- targetSdk / compileSdk: 36
- Android Gradle Plugin: 9.4.0
- Gradle CI runtime: 9.6.0
- JDK: 17
- Android Browser Helper: 2.7.3
- AndroidX Browser: 1.10.0
- Launch URL: `https://husucabi69.github.io/muscle-atlas-chatgpt/?source=twa`

## 현재 의도
1. PWA와 임상 knowledge payload는 그대로 유지한다.
2. Android native layer에는 환자정보, API key, 광고 SDK, 분석 SDK를 넣지 않는다.
3. CI에서는 unsigned release AAB를 빌드해 구조/호환성을 검증한다.
4. 실제 Play 제출용 signing/upload key는 repository에 저장하지 않는다.

## 아직 BLOCKED인 최종 TWA verification
현재 웹 origin은 `https://husucabi69.github.io` 이다. Digital Asset Links는 origin root인
`https://husucabi69.github.io/.well-known/assetlinks.json`
에서 제공되어야 한다.

최종 verification에는 다음이 모두 필요하다.
- Play Console에서 최종 package ID 확정
- Play App Signing certificate SHA-256 fingerprint 확보
- 위 fingerprint를 사용한 root `assetlinks.json` 배포
- 실제 Android 기기에서 toolbar 없는 TWA launch 확인

이 프로젝트 repo 내부의 `/muscle-atlas-chatgpt/.well-known/`만으로는 root 검증을 충족하지 않는다.
