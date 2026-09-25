# Cervical Stage 7 Completion

완료일: 2026-09-25
상태: COMPLETE — full regression PASS

## 범위
- 기존 canonical muscles 205 유지
- 기존 cervical muscle records 33개(r001) 전부 유지
- 신규 Nerves 6: n030–n035
  - C5 / C6 / C7 / C8 cervical roots
  - Greater occipital nerve
  - Superficial cervical plexus sensory branches
- 신규 Joints 3: j016–j018
  - atlanto-occipital / atlantoaxial / cervical zygapophyseal complex
- 신규 Ligaments 2: lig017–lig018
  - transverse ligament of atlas / alar ligament
- Cervical/scapular symptom pathways 7: sx04, sx05, sx39–sx43
- 신규 Clinical findings 14: f071–f084
- 신규 Clinical tests 17: ct082–ct098
- 신규 Ultrasound views 14: usv074–usv087
- 신규 Diagnosis concepts 12: d088–d099
- Differential groups 7: dg039–dg045
- Cervical clinical quiz 30
- Actual ultrasound canonical source coverage 14/14
- Knowledge Core relationships total 1,171
- 경추 Stage에서는 임상적으로 별도 Stable ID가 필요한 신규 tendon/bursa가 없어 기존 collection을 그대로 유지

## 근거 업데이트
- Spurling: 2025 systematic review/meta-analysis의 높은 specificity / 제한적 sensitivity 취지를 반영. 단독 확진검사로 사용하지 않음.
- Cervical radiculopathy physical tests: 2026 systematic review의 낮은 certainty와 test combination 임상추론 원칙 반영.
- ULNT1: 표준화된 sequence 및 structural differentiation 원칙 반영.
- DCM: 2024 systematic review의 hyperreflexia / Tromner / Babinski / clonus 등 임상 sign의 역할과, 단일 sign 음성으로 DCM을 배제하지 않는 원칙 반영.
- Cervicogenic headache: cervical flexion-rotation test를 보조 검사로 사용하며 primary headache / red flag를 배제하지 않는 원칙 반영.

## 핵심 임상 안전 원칙
- Spurling, distraction, ULNT, shoulder-abduction relief, ROM은 조합·병력·neurological examination으로 해석한다.
- Myotome/dermatome/reflex 하나만으로 cervical root level을 확정하지 않는다.
- Progressive hand clumsiness, gait imbalance, UMN signs, sphincter change는 routine mechanical-neck-pain pathway보다 DCM MRI/전문의 평가를 우선한다.
- Hoffmann 하나로 DCM을 확정하거나 음성 Hoffmann으로 DCM을 배제하지 않는다.
- Greater occipital nerve ultrasound size나 tenderness 하나로 occipital neuralgia를 확정하지 않는다.
- Cervical muscle thickness/CSA asymmetry는 impairment 정보이며 통증 원인을 단독 확정하지 않는다.
- Upper cervical ultrasound에서는 vertebral artery와 spinal canal proximity를 명시하고 무분별한 intervention guidance로 사용하지 않는다.
- 실제 초음파만 사용하며 생성형 B-mode 대체를 금지한다.
- 환자정보/PHI, laterality 자동 추정, 시행하지 않은 검사 자동 기록을 금지한다.

## 최종 회귀검사
- Schema 1.0.0 / dataset 2026.09.25-f: PASS
- JavaScript syntax: PASS
- Muscle records 205 유지: PASS
- Symptom patterns 43 / sg002 cervical-scapular pathways 7: PASS
- Tendons 44 / Nerves 35 / Joints 18 / Bursae 13 / Ligaments 18 / Fasciae 1: PASS
- Findings 84 / Clinical tests 98 / Diagnoses 99 / Ultrasound views 87: PASS
- Stage 7: clinical tests 17 / US 14 / diagnoses 12 / findings 14 / differential groups 7: PASS
- Stage 7 quiz 30, 4-option integrity: PASS
- Actual ultrasound reference audit 14/14, unverified 0: PASS
- Stable ID duplicate 0: PASS
- Orphan relationship 0: PASS
- Relationship total 1,171: PASS
- Shoulder Stage 1: PASS
- Elbow Stage 2: PASS
- Wrist-Hand Stage 3: PASS
- Hip-Pelvis Stage 4: PASS
- Knee-Thigh Stage 5: PASS
- Leg-Ankle-Foot Stage 6: PASS
- PWA id/start_url/scope/fullscreen + standalone fallback: PASS
- Stage 7 offline cache entries 5/5: PASS
- PHI boundary scan: PASS

## 실제 초음파 정본 출처
- Cervical spinal ultrasonography route map: https://pmc.ncbi.nlm.nih.gov/articles/PMC10444723/
- Cervical paraspinal muscle sonography: https://pmc.ncbi.nlm.nih.gov/articles/PMC11051048/
- Cervical flexor/extensor muscle ultrasound: https://pmc.ncbi.nlm.nih.gov/articles/PMC7093927/
- C5-C7 nerve-root sonography: https://pmc.ncbi.nlm.nih.gov/articles/PMC5491566/
- Brachial plexus/root sonographic mapping: https://pmc.ncbi.nlm.nih.gov/articles/PMC7973677/
- Greater occipital nerve ultrasound: https://pmc.ncbi.nlm.nih.gov/articles/PMC8628157/

## 다음
Stage 8 — 흉추·등·흉곽. Erector/multifidus, scapulothoracic, intercostal/respiratory relations를 동일 completion gate로 확장.
