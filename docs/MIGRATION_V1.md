# MSK Knowledge v1 Migration Plan

## 현재 상태
- index.html에 근육/증상 데이터가 embedded fallback으로 존재
- data/muscles-v1.json, symptoms-v1.json, media-v1.json 분리본 존재

## 전환 원칙
전면 재작성하지 않는다. 외부 Knowledge Core를 우선 읽고 실패 시 기존 embedded 데이터를 fallback으로 사용한다.

## 단계
1. knowledge-core-v1.json을 생성한다.
2. 앱 시작 시 외부 core를 비동기 로드한다.
3. 성공 시 muscles/symptoms/relationships를 external core 기준으로 hydrate한다.
4. 기존 embedded 데이터는 offline/failure fallback으로 당분간 유지한다.
5. 안정화 후 embedded 지식의 범위를 축소한다.
6. 향후 anatomy / examination / ultrasound / rehab / quiz / media를 별도 versioned dataset으로 나눈다.

## 호환성
기존 muscle id m001~m183, symptom id sx01~sx20을 유지하여 현재 UI, 퀴즈 기록, deep link가 깨지지 않게 한다.
