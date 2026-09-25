# Stage 11 — Global Integration QA

완료일: 2026-09-25
상태: AUTOMATED QA PASS — GitHub Actions verified
릴리스: v9.1

## 결과
- Canonical muscles: 205
- Anatomy regions: 14
- O/I/F/N canonical fields: 820/820
- Oral Viva base canonical checks: 820/820 PASS
- Oral Viva master integrated checks: 205/205 PASS
- Patient Education assignments: 205/205
- Evidence tiers: A 58 / B 57 / C 90
- Patient Education profiles: 19
- Evidence sources: 11
- Clinical modules: Stage 1–10 PASS
- Clinical tests: 148
- Clinical quiz questions: 294
- Ultrasound views: 131/131
- Media metadata incomplete: 0
- Embedded reusable actual ultrasound media: 5
- Reference-only/link-only actual ultrasound references: 126
- Generated B-mode substitutes: 0
- Relationships: 1,789
- Orphan relationships: 0
- Type mismatches: 0
- Duplicate relation IDs: 0
- Duplicate relation edges: 0
- Cross-entity Stable ID collisions: 0
- Relationship endpoint type corrections performed: 20 (`symptom` → `symptom_pattern`)
- Lumbar clinical quiz namespace corrected: `lq001–030` → `lsq001–030`; global quiz ID duplicates 0
- JavaScript syntax: PASS
- PWA configuration: PASS
- PHI boundary: PASS
- Automated regression script: `scripts/global-qa.mjs`
- GitHub Actions gate: `.github/workflows/global-qa.yml`

## License correction performed in Stage 11
Earlier modules mixed true license names with phrases such as "PMC canonical reference" or "Open access canonical reference".
Stage 11 normalizes this:
1. Embedded/local reuse is allowed only when explicit reusable terms are recorded.
2. Publication figures without confidently asserted redistribution terms are link-only.
3. The app does not infer reuse rights from PMC/open-access hosting alone.
4. CC BY-NC-ND or otherwise restrictive material remains canonical-link/reference use unless its exact terms permit the contemplated reuse.
5. No generated ultrasound substitutes are used.

## Remaining manual verification
Android installed-PWA physical check:
- launch from installed app icon
- verify address bar is absent
- verify display is fullscreen/standalone
- do not clear Chrome/app data merely for testing

This is a physical-device verification only; automated PWA manifest/service-worker checks passed.

## Stage 12 handoff
Next: OrthoOS read-only integration preparation.
- keep Muscle Atlas an independent repository/runtime/database
- define versioned Integration Contract
- expose only general medical knowledge entities
- no PHI/patient/encounter storage in Atlas
- no inference of laterality or unperformed tests
- downstream OrthoOS consumes knowledge read-only


## CI 검증
- PR #18 Global QA 재실행: PASS
- 검증 run: 36100690448
- 검증 head SHA: d6337ec5b0f5b27b9a042f85f10eedf8f5b79eec
- 초기 FAIL 원인: PHI scan의 파일경로에 `data/` prefix가 빠진 QA-script path bug
- 데이터/Knowledge Core/임상모듈 실패는 아니었으며 경로 수정 후 동일 QA 전체 SUCCESS


## 2026-09-25 Follow-up QA — Oral Viva + Offline Symptom Cache
상태: FIXED / CI gate added

### 발견된 문제
1. Oral Viva의 기존 canonical-keyword grader가 복수 부착부/복수 기능 중 일부만 말한 답을 완전정답으로 승격할 수 있었다.
   - 예: 흉쇄유돌근 정지에서 유양돌기만 답하고 상항선을 누락한 경우.
2. 짧은 해부학 용어가 긴 합성어 안에 포함되면 오탐 가능성이 있었다.
   - 예: '미골'을 말하지 않았는데 '항문미골인대' 내부 substring으로 인식.
3. PWA service worker cache에 symptom-groups는 있으나 symptoms-v1.json이 빠져 있어 offline symptom-detail completeness가 보장되지 않았다.

### 수정
- Oral Viva friend/teacher/senior/master completeness threshold 상향.
- comma/semicolon-separated canonical elements를 개별 scoring component로 처리.
- 짧은 해부학 토큰은 token-level match를 사용.
- 전자와/극상와/내측상과의 '와/과'를 조사로 잘못 제거하지 않도록 tokenizer 수정.
- symptoms-v1.json을 service-worker CORE cache에 추가.
- scripts/global-qa.mjs에 영구 regression gate 추가:
  - canonical self-answer 820/820 correct
  - partial-component overgrade 0
  - hardened threshold/token guard 존재
  - symptoms-v1.json cache 포함

### 수동 전수 재검사
- canonical O/I/F/N self-answer: 820/820 PASS
- multi-component answer cases reviewed: 247
- partial answer promoted to correct: 0
- empty-answer false positive: 0
- patient education assignment: 205/205 PASS
- ultrasound/media audit: 131/131 PASS
- clinical examinations: 148/148 PASS
- clinical quizzes: 294/294 PASS
- diagnosis concepts: 140/140 PASS
- clinical findings: 128/128 PASS
- differential groups: 64 PASS
- global entity-ID collision: 0
- orphan relationship: 0
- relationship endpoint type mismatch: 0
