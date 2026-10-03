# Physical Examination Interpretation Contract

기준일: 2026-10-03
상태: LOCKED / MUST FOLLOW
적용범위: 모든 Physical Examination Stable ID

## 목적

이학적 검사는 '어떻게 하는가'만으로 완성되지 않는다.
각 검사마다 임상적 의미, 양성 소견의 해석, 감별진단, 한계, 다음 판단을 함께 제공해야 한다.

## 필수 해석 필드

각 검사에는 가능한 한 다음 항목을 구조화한다.

1. what_it_assesses
   - 실제로 무엇을 평가하는가
   - 예: 구조적 손상, 불안정성, 신경조직 기계민감도, 운동조절, 근력, 통증 유발 등

2. positive_meaning
   - '양성'이 실제로 의미하는 임상적 변화
   - 평소 증상 재현 여부, 구조적 감별 반응, laxity/end point 등
   - 단순 통증·당김과 구분

3. raises_suspicion_for
   - 양성일 때 가능성이 올라가는 질환/상태
   - 단독 확진처럼 표현 금지

4. important_differentials
   - 반드시 비교해야 할 경쟁 진단
   - root vs plexus vs peripheral nerve, tendon vs joint, instability vs pain inhibition 등 검사 성격에 맞게 작성

5. what_it_cannot_rule_out
   - 음성이라고 안전하게 배제할 수 없는 질환
   - 민감도/특이도/LR 근거가 있으면 함께 설명
   - '배제'라는 표현은 충분한 근거가 있을 때만 사용

6. next_clinical_steps
   - 결과에 따라 다음에 확인할 병력, 신경학적 진찰, 다른 이학검사, 영상, EMG/NCS, 전원/응급평가

7. diagnostic_weight
   - 가능하면 sensitivity, specificity, likelihood ratio, 근거 확실성
   - 연구 간 이질성이 크면 그대로 표시

8. interpretation_bottom_line
   - 임상의가 기억해야 할 한 문단 핵심

## 안전 원칙

- 하나의 이학검사로 질환을 확진·배제한다고 과장하지 않는다.
- 검사 정확도는 검사법, 양성기준, 대상군, reference standard에 따라 달라질 수 있다.
- Red flag, 진행성 근력저하, 척수병증, 골절·감염·종양 의심 시 반복 유발검사보다 적절한 다음 단계 평가를 우선한다.
- 구조적 감별(structural differentiation)이 필요한 neurodynamic test에서는 단순 stretch discomfort를 양성으로 기록하지 않는다.

## UI 원칙

상세페이지에서 시행 순서 다음에 반드시 별도의
'임상 해석 · 이 검사를 어떻게 읽을 것인가'
블록을 표시한다.

최종 사용자 화면의 우선순위:
검사 목적 → 시작 자세 → 검사자 위치/손 위치 → 시행 순서 → 양성 기준 → 임상 해석 → 한계/오류 → 감별진단/다음 단계.

## ct084 pilot

ct084 ULNT1부터 본 계약을 실제 UI에 적용한다.
향후 EXAM-REAL 제작 시 각 Stable ID의 이미지 생성 전 interpretation_detail을 함께 잠근다.
