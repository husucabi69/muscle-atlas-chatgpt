# Abdominal Wall / Core Stage 10 Completion

완료일: 2026-09-25
상태: COMPLETE — full QA PASS

## 범위
- canonical muscles 205 유지
- 복벽 canonical muscles:
  - m179 Rectus abdominis
  - m180 Pyramidalis (variable)
  - m181 External oblique
  - m182 Internal oblique
  - m183 Transversus abdominis
- 신규 Nerves 4: n044–n047
  - thoracoabdominal nerves T7-T11
  - iliohypogastric nerve
  - ilioinguinal nerve
  - anterior cutaneous branches of thoracoabdominal nerves
- 신규 Ligament 1: lig026 inguinal ligament
- 신규 Fasciae 4: fsc003–fsc006
  - linea alba
  - rectus sheath
  - transversalis fascia
  - linea semilunaris / Spigelian fascia
- 신규 symptom group sg010
- 신규 symptom pathways 6: sx57–sx62
- 신규 Clinical findings 14: f115–f128
- 신규 Clinical tests 16: ct133–ct148
- 신규 Ultrasound views 15: usv117–usv131
- 신규 Diagnosis concepts 14: d127–d140
- Differential groups 6: dg059–dg064
- Abdominal/Core clinical quiz 30
- Actual ultrasound canonical source coverage 15/15
- Knowledge Core relationships total 1,789

## 주요 임상 원칙
- Carnett test는 chronic localized abdominal-wall pain에서 유용하지만 acute abdominal pain 또는 visceral disease를 단독으로 배제하지 않는다.
- ACNES는 작은 국소 압통점, sensory change, Carnett 등 임상 pattern을 중심으로 판단하며 nerve visualization 하나로 확정하지 않는다.
- Rectus diastasis는 linea-alba widening이며 true focal fascial hernia defect와 구분한다.
- Inter-recti distance는 측정 위치와 rest/contraction protocol을 함께 기록하고 단일 cutoff를 자동진단으로 사용하지 않는다.
- EHS guideline에 따라 physiotherapy를 고려할 수 있으나 특정 단일 exercise regimen의 우월성은 확립되지 않았다.
- Dynamic hernia US는 rest + adequate Valsalva + 필요 시 standing을 사용하고 defect/content/inferior epigastric-vessel relation을 확인한다.
- Inadequate Valsalva는 false negative를 만들 수 있으며 asymptomatic posterior-wall bulging도 있을 수 있다.
- Painful irreducible hernia, bowel obstruction signs, systemic compromise는 routine exercise보다 urgent surgical/emergency evaluation을 우선한다.
- Acute severe/diffuse abdominal pain, peritoneal signs, GI bleeding, persistent vomiting, syncope/hemodynamic instability 등 visceral red flag는 MSK abdominal-wall pathway보다 우선한다.
- 실제 초음파만 사용하며 생성형 B-mode 대체를 금지한다.
- PHI 저장, laterality 자동추정, 미시행검사 자동기록을 금지한다.

## Patient Education 업데이트
- patient-exercise-library dataset: 2026.09.25-c
- total muscle assignments: 205/205
- abdominal wall m179/m181/m182/m183: evidence tier B
- px018 복벽 motor-control + 점진적 몸통 부하 추가
- 2021 LBP CPG + 2021 EHS rectus-diastasis guideline을 분리해 근거로 사용
- 복벽 근육별 'stretching'은 직접 임상근거가 약하면 별도 validated treatment처럼 만들지 않음
- exercise evidence distribution: A 58 / B 57 / C 90

## 실제 초음파 정본 출처
- Abdominal wall sonography pictorial review: https://pmc.ncbi.nlm.nih.gov/articles/PMC7441131/
- Abdominal muscle rest/contraction and IRD ultrasound: https://pmc.ncbi.nlm.nih.gov/articles/PMC10044981/
- Inguinal hernia ultrasound: https://pmc.ncbi.nlm.nih.gov/articles/PMC9262670/
- Dynamic athletic-groin/inguinal posterior wall ultrasound: https://pmc.ncbi.nlm.nih.gov/articles/PMC11941212/
- Spigelian hernia sonography: https://pmc.ncbi.nlm.nih.gov/articles/PMC4582530/
- Ilioinguinal/iliohypogastric nerve ultrasound: https://pmc.ncbi.nlm.nih.gov/articles/PMC13463367/

## QA
- Schema 1.0.0 / dataset 2026.09.25-i: PASS
- JavaScript syntax: PASS
- muscles 205: PASS
- symptom groups 10 / symptom patterns 62: PASS
- tendons 44 / nerves 47 / joints 24 / bursae 15 / ligaments 26 / fasciae 6: PASS
- findings 128 / tests 148 / diagnosis concepts 140 / US views 131: PASS
- Stage 10 exams 16 / US 15 / diagnoses 14 / findings 14 / differential 6: PASS
- Stage 10 quiz 30: PASS
- actual ultrasound 15/15, unverified 0: PASS
- Stable ID duplicate 0: PASS
- orphan relationship 0: PASS
- relationship total 1,789: PASS
- Oral Viva preserved: PASS
- Patient Education 205/205: PASS
- Patient Education invalid profile/source refs 0: PASS
- PWA identity/fullscreen/offline cache: PASS
- PHI boundary: PASS
- Stage 1–9 individual clinical module JSON files untouched by diff: PASS

## 다음
Stage 11 — 전신 통합 QA.
- 205 canonical muscle completeness
- Origin/Insertion/Function/Nerve 전수 audit
- Oral Viva 205-muscle coverage and grading audit
- Patient Education 205-muscle evidence/source audit
- Clinical module Stage 1–10 regression
- Actual ultrasound/license audit
- Stable ID/orphan/global relationship audit
- mobile/PWA/quiz regression
