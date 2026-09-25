# Google Play Submission Pack — 이윤석정형외과 근육

기준일: 2026-09-25  
상태: **PREPARED_NOT_SUBMITTED**

## 1. 현재 기술 상태
- Stage 13 Android TWA shell은 main에 병합 완료.
- current stable main: `233d959ff4d5b91037fe2e62901ce2e632454cb6`
- targetSdk / compileSdk: 36
- main exact SHA Global QA: `36119496794` SUCCESS
- main exact SHA Android TWA QA: `36119496821` SUCCESS
- main exact SHA Pages: `36119495814` SUCCESS
- unsigned release AAB artifact 생성 확인.
- Android native `RECORD_AUDIO` permission 없음.
- 광고 SDK / 분석 SDK / native patient data store 없음.

## 2. Store listing 정본 초안
기계 판독용 정본은 `data/play-store-submission-v1.json`이다.

앱 이름:
`이윤석정형외과 근육`

간단한 설명:
`근육 해부학·임상·초음파 Oral Viva와 환자 운동·스트레칭 교육`

전체 설명은 JSON의 `store_listing.full_description`을 사용한다.

Google Play 현재 한도:
- 앱 이름 30자
- 간단한 설명 80자
- 전체 설명 4,000자

## 3. Health Apps declaration 사전판정
현재 기능 기준 선택 후보:
- Medical Reference and Education
- Physical Therapy and Rehabilitation

현재 기능 기준 선택하지 않는 항목:
- Clinical Decision Support
- Medical Device Apps
- Healthcare Services and Management
- Medication and Treatment Management
- Diseases and Conditions Management

이유: Atlas는 환자/Encounter 문맥을 받지 않는 일반 지식·교육 계층이며 환자별 확정진단이나 개인 맞춤 치료 결정을 자동 생성하지 않는다.

## 4. 필수 의료 고지
스토어 전체 설명에는 다음 의미가 반드시 유지되어야 한다.
- 의료기기가 아니다.
- 어떠한 의학적 상태도 진단·처치·치료·예방하지 않는다.
- 의학적 조언·진단·치료는 의료전문가와 상담한다.

## 5. Data Safety — 현재 확정 가능한 것
확정:
- 계정 생성 요구 없음.
- 광고 SDK 없음.
- 분석 SDK 없음.
- TWA native layer는 RECORD_AUDIO permission을 요청하지 않음.
- 학습/오답 기록은 browser localStorage에 저장될 수 있음.
- Atlas 자체 서버로 학습기록을 업로드하는 구현 없음.

아직 확정하면 안 되는 것:
- "사용자 데이터를 전혀 수집하지 않는다"는 최종 응답.

이유:
Oral Viva의 Web SpeechRecognition은 브라우저/OS 음성인식 제공자가 off-device network processing을 사용할 수 있다. 최종 제출 전 실제 Android TWA/Chrome에서 audio와 transcript의 처리 경로를 확인한다.

제품 선택지는 두 가지다.
- 음성입력 유지: 실기기 검증 후 필요한 audio/transcript 항목을 정확히 신고.
- Play release에서 음성입력을 비활성화: 제품 책임자가 이 trade-off를 선택한 경우에만 수행하고 전체 회귀검사.

## 6. Developer account gate
Google의 2026-09-30 시행 예정 Play Console Requirements를 기준으로 health 분야는 organization 등록 준비가 필요하다.

따라서 제출 전:
- Play Console organization account
- D-U-N-S / 조직 신원확인
- developer/contact email 및 phone verification
- 필요한 경우 organization website verification
을 완료한다.

## 7. Graphic assets
- Play app icon: 512×512, 32-bit PNG, 최대 1,024KB
- feature graphic: 1024×500, JPEG 또는 alpha 없는 24-bit PNG
- screenshots: 최소 2장, 각 변 320~3840px, 긴 변은 짧은 변의 2배 초과 금지
- 추천 노출을 위해 phone screenshot 4장 이상, portrait 9:16 / 1080×1920 이상 권장

## 8. 현재 외부 BLOCKER
- Play Console 실제 계정/조직 확인
- 최종 package ID 확정
- signing/upload key 및 Play App Signing SHA-256 fingerprint
- origin-root `/.well-known/assetlinks.json`
- physical Android TWA 검증
- SpeechRecognition Data Safety 최종 판정
- 최종 screenshot / feature graphic
- content rating / declaration / 실제 제출

## 9. Digital Asset Links
현재 origin:
`https://husucabi69.github.io`

필요:
`https://husucabi69.github.io/.well-known/assetlinks.json`

현재 `husucabi69/husucabi69.github.io` 사용자 사이트 repo는 연결상 확인되지 않았다.
따라서 project repo의 `/muscle-atlas-chatgpt/.well-known/`에 파일을 두는 것으로는 해결하지 않는다.

실제 signing fingerprint를 얻기 전 placeholder assetlinks를 public 배포하지 않는다.

## 10. 공식 근거
- Target API: https://support.google.com/googleplay/android-developer/answer/11926878
- Health declaration: https://support.google.com/googleplay/android-developer/answer/14738291
- Health content/services: https://support.google.com/googleplay/android-developer/answer/16679511
- Data Safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Store listing: https://support.google.com/googleplay/android-developer/answer/9859152
- Preview assets: https://support.google.com/googleplay/android-developer/answer/9866151
- Play Console requirements: https://support.google.com/googleplay/android-developer/answer/10788890
