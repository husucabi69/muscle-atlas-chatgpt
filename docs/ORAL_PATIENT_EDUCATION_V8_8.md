# v8.8 Oral Viva + Patient Education Learning Layers

완료일: 2026-09-25
상태: FOUNDATION COMPLETE — regression PASS

## 1. Oral Viva
- canonical 205 muscles를 직접 사용
- Origin / Insertion / Function / Nerve 동적 출제
- 친구 / 선생님 / 선배 / 대가 4단계
- 친구: 기능/신경 중심 1항목
- 선생님: O/I/F/N 단일항목
- 선배: 2항목 연결 설명
- 대가: O/I/F/N 통합 설명
- SpeechRecognition 지원 Android Chrome/PWA: 음성 답변
- 미지원/실패 시 textarea 직접 입력 fallback
- SpeechSynthesis로 질문 및 교정 feedback 읽기
- local canonical-keyword grading
  - 맞았습니다
  - 부분 정답입니다
  - 틀렸습니다
- 빠진 핵심 + canonical 정답을 즉시 제시
- 학습기록은 localStorage만 사용
- 외부 AI/API 전송 없음
- muscle detail → 해당 근육 Oral Viva 바로 진입

### 현재 한계
정적 PWA에서 API key를 노출하지 않기 위해 서버 LLM semantic grader를 사용하지 않는다.
따라서 표현이 크게 달라지는 자유서술 답변은 canonical 핵심어 기반 채점이 우선이며,
향후 안전한 server-side semantic grader contract가 생기면 optional로 확장한다.

## 2. Patient Education Exercise Library
파일: data/patient-exercise-library-v1.json
dataset_version: 2026.09.25-b

- canonical muscles 205/205 assignment
- 근거 A: 62
- 근거 B: 53
- 근거 C: 90
- exercise profiles: 18
- evidence sources: 10
- 부위 → 근육 → stretching/mobility → strengthening/motor-control 계층
- muscle detail → 환자교육 바로 진입
- 근거 source 링크 제공
- 적용범위와 근거 한계 표시
- 일반 stop/reassessment red flags 표시

### Evidence policy
A — 직접 CPG/RCT 또는 질환·근육군에 강한 임상근거
B — 부위/근육군 CPG를 해당 근육과 임상적으로 타당하게 연결
C — 개별근 직접 임상근거 제한. 교육용 또는 개별 단독 protocol 미확립.

### 중요한 원칙
- 205개에 모두 '검증된 단독 운동'이 있다고 가장하지 않는다.
- 작은 심부근, 설골근, 일부 골반저/회음근 등 직접 isolated protocol 근거가 약한 근육은 미확립으로 표시한다.
- 질환 기반 CPG 근거를 해부학적 개별근 효과로 과장하지 않는다.
- 수술 후/급성 파열/진행성 신경학적 이상/심폐 red flag는 개별 프로토콜·진료가 우선이다.

## 주요 근거축
- Neck Pain CPG Revision 2017
- Rotator Cuff Tendinopathy CPG 2025
- Lateral Elbow Pain CPG 2022
- Gluteal Tendinopathy education+exercise RCT 2018
- Patellofemoral Pain CPG 2019
- Achilles Tendinopathy CPG Revision 2024
- Lateral Ankle Sprain CPG Revision 2021
- Plantar Heel Pain CPG Revision 2023
- Low Back Pain CPG Revision 2021

## QA
- JavaScript syntax: PASS
- Oral tab/section/function wiring: PASS
- Patient education tab/section/function wiring: PASS
- Muscle-detail deep links: PASS
- Canonical muscles 205 unchanged: PASS
- Patient exercise assignment 205 / unique 205: PASS
- missing muscle assignment 0: PASS
- unknown muscle assignment 0: PASS
- invalid exercise profile reference 0: PASS
- invalid evidence-source reference 0: PASS
- every muscle has a patient-education outcome: PASS
- PWA id/start_url/scope/fullscreen unchanged: PASS
- patient exercise JSON offline cache: PASS
- PHI boundary: PASS
- Stage 1–8 clinical module JSON files untouched: PASS

## 다음
Stage 9 — 요추·천추 개발을 계속한다.
