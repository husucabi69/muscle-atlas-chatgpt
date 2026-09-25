# Leg / Ankle / Foot Stage 6 Completion

완료일: 2026-09-25
상태: COMPLETE — full regression PASS

## 범위
- 기존 canonical muscles 205 유지
- 신규 Tendons 11: t034–t044
- 신규 Nerves 8: n022–n029
- 신규 Joints 4: j012–j015
- 신규 Bursae 3: b011–b013
- 신규 Ligaments 7: lig010–lig016
- 신규 Fascia 1: fsc001 plantar fascia
- Leg/Ankle/Foot symptom pathways 9: sx16–sx20, sx35–sx38
- 신규 Clinical findings 15: f056–f070
- 신규 Clinical tests 17: ct065–ct081
- 신규 Ultrasound views 18: usv056–usv073
- 신규 Diagnosis concepts 18: d070–d087
- Differential groups 9: dg030–dg038
- Leg/Ankle/Foot clinical quiz 30
- Actual ultrasound canonical source coverage 18/18
- Knowledge Core relationships total 982

## 핵심 임상 안전 원칙
- Acute calf pain은 근육 strain과 DVT/PE red flag를 구분한다.
- Achilles rupture는 Thompson, gap/function, ultrasound 등 임상 맥락을 통합한다.
- ATFL/CFL 및 syndesmosis 검사는 단일 양성 소견으로 rupture/grade를 확정하지 않는다.
- Peroneal instability는 정적 영상보다 dynamic ultrasound의 장점을 활용한다.
- Posterior tibial tendon dysfunction은 정렬·heel-rise·건 소견을 통합한다.
- Plantar fascia thickness cutoff 하나를 확진 기준으로 사용하지 않는다.
- Tarsal tunnel은 Tinel, nerve/branch sonoanatomy, electrodiagnostic/원인 병변을 함께 해석한다.
- Morton neuroma와 intermetatarsal bursitis는 신경 연속성, DTML과 위치, compressibility를 동적으로 구분한다.
- Ottawa ankle/foot rule은 방사선 촬영 필요성 선별 규칙이지 영상 없는 골절 확정검사가 아니다.
- 실제 초음파 원문만 사용하며 생성형 B-mode 대체를 금지한다.
- 환자정보/PHI, laterality 자동 추정, 시행하지 않은 검사 자동 기록을 금지한다.

## 최종 회귀검사
- Schema 1.0.0 / dataset 2026.09.25-e: PASS
- fascia entity collection 추가: PASS
- JavaScript syntax: PASS
- Muscle records 205 유지: PASS
- Symptom patterns 38 / Stage 6 pathways 9: PASS
- Tendons 44 / Nerves 29 / Joints 15 / Bursae 13 / Ligaments 16 / Fasciae 1: PASS
- Findings 70 / Clinical tests 81 / Diagnoses 87 / Ultrasound views 73: PASS
- Stage 6 clinical tests 17 / US views 18 / diagnoses 18 / findings 15 / differential groups 9: PASS
- Stage 6 quiz 30, 4-option integrity: PASS
- Actual ultrasound reference audit 18/18, unverified 0: PASS
- Stable ID duplicate 0: PASS
- Orphan relationship 0: PASS
- Relationship total 982: PASS
- Stage 1–5 module source files untouched: PASS
- PWA id/start_url/scope/fullscreen + standalone fallback: PASS
- Stage 6 offline cache entries 5/5: PASS
- PHI boundary scan: PASS

## 다음
Stage 7 — 경추. Deep flexors, SCM/scalenes, suboccipital, posterior muscles, nerve-root relations를 동일 completion gate로 확장.
