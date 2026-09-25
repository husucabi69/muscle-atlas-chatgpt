# Thoracic / Back / Chest Wall Stage 8 Completion

완료일: 2026-09-25
상태: COMPLETE — full regression PASS

## 범위
- 기존 canonical muscles 205 유지
- Thoracic region r002 muscles 17개 유지
- Scapular girdle r004 muscles 9개 유지
- 신규 Nerves 2: n036–n037
  - intercostal nerve
  - thoracic dorsal ramus
- 신규 Joints 4: j019–j022
  - thoracic zygapophyseal joint complex
  - costotransverse joint
  - costovertebral joint
  - scapulothoracic articulation (functional articulation)
- 신규 Bursae 2: b014–b015
  - supraserratus / infraserratus scapulothoracic bursal planes
- 신규 Ligaments 3: lig019–lig021
- 신규 symptom group sg008 — 흉추·등·흉곽
- 신규 symptom pathways 6: sx44–sx49
- 신규 Clinical findings 14: f085–f098
- 신규 Clinical tests 16: ct099–ct114
- 신규 Ultrasound views 14: usv088–usv101
- 신규 Diagnosis concepts 13: d100–d112
- Differential groups 6: dg046–dg051
- Thoracic clinical quiz 30
- Actual ultrasound canonical source coverage 14/14
- Knowledge Core relationships total 1,374

## 핵심 임상 안전 원칙
- Thoracic pain은 peripheral MSK pain보다 serious pathology differential을 넓게 유지한다.
- 2024 ACR thoracic-back-pain guidance에 따라 uncomplicated acute pain은 routine immediate imaging 대상이 아니지만 trauma/osteoporosis, cancer/infection/immunosuppression, myelopathy/progressive neurologic deficit 등은 조기 영상평가를 고려한다.
- Thoracic radiculopathy는 band-like chest/abdominal pain 또는 paresthesia pattern을 보일 수 있으나 dermatomal mapping 하나로 확정하지 않는다.
- Costotransverse joint pain은 focal paravertebral pain, respiratory/mechanical provocation, US effusion/ligament findings를 통합한다.
- Rib spring / extension-rotation / palpation은 후보를 좁히는 자료이며 단독 확진검사가 아니다.
- Scapular assistance/retraction/wall push-up은 scapulothoracic contribution을 평가하며 특정 신경/근육 병변을 단독 확정하지 않는다.
- Painful snapping은 movement와 symptom의 temporal concordance를 확인한다.
- Intercostal nerve 자체가 US에서 항상 직접 보이는 것은 아니므로 rib inferior margin과 intercostal vessel을 landmark로 활용한다.
- Diaphragm/intercostal ultrasound 수치는 position, respiratory effort, protocol에 의존하며 일반 MSK diagnosis cutoff로 자동 전용하지 않는다.
- 실제 초음파만 사용하며 생성형 B-mode 대체를 금지한다.
- 환자정보/PHI, laterality 자동 추정, 시행하지 않은 검사 자동 기록을 금지한다.

## 최종 QA
- Schema 1.0.0 / dataset 2026.09.25-g: PASS
- JavaScript syntax: PASS
- Muscle records 205 유지: PASS
- Symptom groups 8 / symptom patterns 49: PASS
- Tendons 44 / Nerves 37 / Joints 22 / Bursae 15 / Ligaments 21 / Fasciae 1: PASS
- Findings 98 / Clinical tests 114 / Diagnoses 112 / Ultrasound views 101: PASS
- Stage 8: exams 16 / US 14 / diagnoses 13 / findings 14 / differential groups 6: PASS
- Stage 8 quiz 30, 4-option/answer/reference integrity: PASS
- Actual ultrasound reference audit 14/14, unverified 0: PASS
- Stable ID duplicate 0: PASS
- Orphan relationship 0: PASS
- Relationship total 1,374: PASS
- sg008 pathways 6: PASS
- PWA id/start_url/scope/fullscreen + standalone fallback: PASS
- Stage 8 offline cache 5/5: PASS
- PHI boundary scan: PASS
- Diff audit: Stage 1–7 module source JSON files untouched: PASS

## 주요 실제 초음파 정본 출처
- Thoracic paraspinal muscle sonography: https://pmc.ncbi.nlm.nih.gov/articles/PMC11051048/
- Thoracic facet / CTJ / intercostal / serratus / pectoral sonoanatomy: https://pmc.ncbi.nlm.nih.gov/articles/PMC9273134/
- Costotransverse joint ultrasound: https://pmc.ncbi.nlm.nih.gov/articles/PMC9148345/
- Diaphragm ultrasound: https://pmc.ncbi.nlm.nih.gov/articles/PMC11276413/
- Respiratory intercostal ultrasound: https://pmc.ncbi.nlm.nih.gov/articles/PMC12747832/

## 다음
Stage 9 — 요추·천추. Multifidus/erector/QL/iliopsoas, lumbosacral nerve relations, SI-region examination, actual ultrasound, differential, quiz를 동일 completion gate로 확장.
