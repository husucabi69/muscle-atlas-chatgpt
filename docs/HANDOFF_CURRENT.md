# CURRENT OVERRIDE — 2026-10-07 ct086 Candidate 5 pipeline + textbook/evidence UI checkpoint

## CURRENT OVERRIDE — 2026-10-08 ORTHOPEDIC_DISEASE_TRAUMA_MODULE shoulder pair native

- New workline: **ORTHOPEDIC_DISEASE_TRAUMA_MODULE**.
- User archive: `클로드_정형외과_강의실_모든작업물.zip`.
- 24 Disease/Trauma standalone HTML sources are inventoried; Claude runtime/TinyFish is not a production dependency.
- `odt001 Shoulder Disease`: native Preview, 10 chapters, source SHA locked.
- `odt002 Shoulder Trauma`: native Preview, 10 chapters, source SHA-256 `47b0b42a12f7d1e509d17e8ef8cc97a8ffb27d1930ba08e32b37073589d4d2ef`, 10 visual provenance records, 17 references.
- Shoulder Trauma evidence refresh adds 2025–2026 evidence for first anterior dislocation stabilization, IR-vs-ER immobilization, traumatic cuff repair timing, elderly proximal humerus fracture, clavicle CPG, and AC injury.
- Material corrections: routine external-rotation brace is not presented as superior; young high-risk first dislocation may reasonably discuss early Bankart repair; traumatic cuff repair timing is not hard-coded to one universal cutoff.
- Audio MP4 was not included; audio remains **MIGRATION_PENDING** and broken `/_blob` playback is forbidden.
- Third-party/Claude figures remain provenance-only until license/HD/IP gates pass.
- Existing patient Disease Rehab, EXAM-REAL ct086, and ct088 DEFERRED states remain separate and unchanged.
- Production `main` remains frozen.
- Next after shoulder-pair Preview review: migrate `odt003 Elbow Disease` and `odt004 Elbow Trauma` with the same source-lock/evidence-refresh/cross-link contract.


> This block is authoritative for the current ct086 workline.

- ct085 remains USER APPROVED / canonical APPROVED / HD_CANONICAL. Do not regenerate.
- ct086 remains the only next permitted image-generation target; no user-facing realistic candidate is connected yet.
- Candidates 1–4 remain REJECTED_INTERNAL_NOT_FOR_PREVIEW.
- Candidate 5 must use structured image-only render contract `2026-10-07-ct086-v2`; generation permission now reports `required_render_mode = IMAGE_ONLY_STRUCTURED_CONTRACT`.
- Candidate 5 hard requirements: portrait >=1024x1536; female patient; female examiner visible in every panel; same identities; active cervical rotation only; trunk/shoulders fixed; exactly three allowed Korean headers; no angle/cutoff; no red pain overlay; no infographic copy.
- `scripts/physical-exam-candidate-preflight.mjs` and its Global QA step reject visual-contract violations before registry connection.
- `scripts/physical-exam-preview-connect.mjs` and its Global QA step refuse Preview connection unless preflight passes and candidate binary identity metadata are valid.
- ct086 textbook narrative expanded to ~4.4k Korean characters. Evidence refs now include 2026 radiculopathy cluster validation, 2026 systematic review/meta-analysis, 2010 cervical ROM measurement review, and 2017 neck-pain active-ROM reliability review.
- Physical Examination runtime now renders a dedicated clickable **근거** section from `evidence_refs`; ct086 has human-readable evidence labels and E2E coverage for all four source URLs.
- Preview release metadata: `v12.06 · CT086 Textbook + Evidence`.
- KST reporting rule is canon-locked and QA-locked: every final development report ends with `한국시간 YYYY-MM-DD HH:MM:SS KST`.
- Latest verified pre-final CI checkpoint had Global QA + runtime Playwright E2E PASS; deploy exact-SHA failure on an intermediate commit was caused by HEAD advancing during consecutive commits. Final HEAD must be rechecked after this handoff commit settles.
- ct087 remains OUT_OF_ORDER until ct086 has a valid connected Preview candidate.
- ct088 Hoffmann remains INCOMPLETE_DEFERRED_MUST_REVISIT.
- Production `main` remains frozen.

Next required action:
1. recheck final HEAD CI/Cloudflare;
2. generate ct086 Candidate 5 only through the structured image-only contract in a binary-capable session;
3. perform visual audit and candidate preflight;
4. materialize exact HD binary, SHA-256/Git blob verify;
5. connect through guarded Preview connector;
6. run Global QA + Playwright + Cloudflare Preview;
7. present app path/link and textbook interpretation for user review; user approval remains PENDING.

# CURRENT OVERRIDE — 2026-10-07 ct086 Candidate 5 structured render/connection gate

> This block is authoritative for the current ct086 workline.

- ct085 remains USER APPROVED / canonical APPROVED / HD_CANONICAL. Do not regenerate.
- ct086 remains the only next permitted generation target; Candidates 1–4 remain internal REJECT and are not user-facing.
- Candidate 5 render contract is now machine-readable at `generation_brief.image_render_contract.contract_version = 2026-10-07-ct086-v2`.
- Candidate 5 hard requirements: 1024x1536 minimum, female patient, female examiner, same identities across panels, examiner visible in every panel, active rotation only, trunk/shoulders fixed, exactly three allowed Korean headers, no degree/cutoff, no red pain overlay, no infographic copy.
- New `scripts/physical-exam-candidate-preflight.mjs` rejects a candidate before registry connection if any required visual axis fails.
- New `scripts/physical-exam-preview-connect.mjs` refuses Preview connection unless preflight passes and source/preview hashes, Git blob identity, dimensions and candidate asset path metadata are valid.
- Global QA now includes both candidate-preflight and guarded-Preview-connector QA.
- Detailed textbook interpretation remains app HTML only and must not be fed into the image render payload.
- ct087 remains OUT_OF_ORDER until ct086 has a valid connected candidate.
- ct088 Hoffmann remains INCOMPLETE_DEFERRED_MUST_REVISIT.
- Final development reports must end with an explicit `한국시간 YYYY-MM-DD HH:MM:SS KST` line.
- Production main remains frozen.

# CURRENT OVERRIDE — 2026-10-07 Stage 23B independent QA wiring checkpoint

> This block records the latest independent Stage 23B work completed while ct086 binary-capable image generation remains the visual mainline.

- Active visual workline remains **ct086 Cervical rotation ROM**. Candidates 1–4 remain internally rejected and must not be connected to Preview.
- ct085 remains USER APPROVED / canonical APPROVED / HD_CANONICAL. Do not regenerate.
- IP provenance vocabulary is now aligned: `PATIENT_EXERCISE_REALISTIC` and `PHYSICAL_EXAM_REALISTIC` are accepted by `scripts/ip-provenance-qa.mjs`, matching `data/ip-provenance-v1.json`.
- Global QA now explicitly runs `scripts/disease-rehab-roadmap-contract-qa.mjs` after the existing disease-rehab roadmap/content integrity checks.
- No Production/main promotion was performed.
- Next safe independent work if ct086 binary-capable generation is unavailable: verify Global QA for the two commits above, then continue Stage 23B registry/print/mobile/IP consistency work without generating duplicate image candidates.
- When a binary-capable generation session is available, resume ct086 Candidate 5 from the frozen image-only contract; do not weaken the HARD FAIL criteria.

# CURRENT OVERRIDE — 2026-10-06 ct086 generation retry after four internal rejects

> This block is authoritative for the current ct086 workline.

- ct085 remains USER APPROVED / canonical APPROVED / HD_CANONICAL at 1024x1536. Do not regenerate.
- ct086 remains the **only next permitted generation target**. No user-facing Preview candidate exists yet.
- Four 1024x1536 raw ct086 generations were created in the current session and all were **rejected internally before Preview**:
  - Candidate 1 gen_id `ac5296c2-767c-47ce-82d0-c7a4315e6ce4` — wrong model assignment, no examiner, long embedded copy, numeric angle text, red overlay.
  - Candidate 2 gen_id `dfb7d375-f43e-493e-a5e3-724c7ede503b` — repeated wrong model/no examiner, long copy, explicit 60° text, red overlay.
  - Candidate 3 gen_id `b5857649-e764-49b5-903a-613fb0b00cef` — wrong patient model, long copy, red overlay, examiner not consistently present.
  - Candidate 4 gen_id `67a9abcc-9800-4e2f-9faf-b3d512d1afc8` — wrong patient/no examiner in main scenes, infographic copy, explicit 60° text.
- None of Candidates 1–4 is connected to `preview_candidate`; none is eligible for user approval.
- Root-cause fix implemented: `buildPhysicalExamImageOnlyPrompt()` now separates visual generation from textbook clinical prose. It explicitly bans infographic layouts, bullet cards, references, diagnoses, all extra copy, degree symbols and numeric cutoffs, while preserving the locked panel structure and casting.
- ct086 frozen prompt has a HARD FAIL section. Current locked visual target remains: female patient + female examiner, same identities across panels, active left/right cervical rotation, trunk/shoulders fixed, neutral short arc/guide arrows only, three short Korean panel headers only, minimum 1024x1536.
- Do not weaken the frozen contract to fit a generated image. A wrong candidate stays rejected.
- ct087 remains blocked OUT_OF_ORDER until ct086 has a valid connected candidate.
- ct088 Hoffmann remains `INCOMPLETE_DEFERRED_MUST_REVISIT` and must not be regenerated now.
- Production `main` remains frozen.

# CURRENT OVERRIDE — 2026-10-06 ct085 HD canonical approved + textbook interpretation + HD migration queue

> This block is authoritative for the current handoff and supersedes older ct085 Candidate 1 wording below.

- ct085 Shoulder abduction relief latest high-resolution illustration is **USER APPROVED and canonical APPROVED**.
- Canonical asset: `./assets/physical-exam-realistic/approved/ct085-shoulder-abduction-relief-gen-1db0cd0f-approved-hd.webp`.
- Approved gen_id: `1db0cd0f-8b06-4d13-acf2-072ee5de3351`.
- Canonical WebP: **1024x1536 / 122,218 bytes**.
- SHA-256: `a9d7e97588283739117a1e36d74994b8604c66e37d01b3ed4749cdd7d9fb7de2`.
- Git blob SHA-1: `685beeb1c4b52a36514db4ab76ce7e11f2688176`.
- Exact source-to-GitHub base64 was compared end-to-end and matched.
- Earlier manually staged ct085 chunk files were found to be non-contiguous and were deleted **before any materialization trigger**; no corrupt binary became canonical.
- HD policy is locked: new raster canonical illustrations use high-resolution source assets (portrait minimum 1024x1536, landscape minimum 1536x1024); thumbnail-size derivatives are not canonical.
- Existing low-resolution approved raster migration queue: **ct082, ct084, ct095, ct096, ct097, ct098 = HD_UPGRADE_REQUIRED**.
- Resolution-independent approved vector assets: **ct090, ct093, ct094 = VECTOR_EXEMPT**.
- Physical Examination textbook narrative field `interpretation_detail.textbook_interpretation_narrative` is active; ct085/ct086/ct087 have detailed prose.
- Next active fresh generation target: **ct086 Cervical rotation ROM**; ct087 follows.
- ct088 Hoffmann remains **INCOMPLETE_DEFERRED_MUST_REVISIT**.
- Production `main` remains frozen.
- Manual governance remains 25~30 min development / 30~35 min wrap-up only / 35 min HARD STOP.

# CURRENT OVERRIDE — 2026-10-06 ct085 Candidate 1 Preview connected + 3-layer reporting locked

> This block is authoritative for the current handoff.

- ct085 Shoulder abduction relief Candidate 1 is now connected to app Preview with an exact byte-verified WebP.
- Candidate gen_id: `6582ec89-607d-4ce7-bd9a-f7358f9683ff`.
- Raw source PNG: 1024x1536 / SHA-256 `0990827c298c5c7471a74e0159700ba820059ad9c953b6855efcae2a4d871a1e`.
- Preview asset: `./assets/physical-exam-realistic/candidates/ct085-shoulder-abduction-relief-gen-6582ec89-preview.webp`.
- Preview derivative: 240x360 / 9,936 bytes / SHA-256 `83c67093c1573746655b6921bf109b62ed16473422f7fac19168cfb70a1cb46e`.
- Local Git blob SHA-1 and GitHub create_blob SHA matched exactly: `95624edb2711997d3bcbff4759402d9cc6d8c3c4`.
- Internal clinical/visual/text gates: PASS. User Preview: **PENDING**.
- Do not regenerate ct085 and do not promote it to canonical APPROVED without explicit user approval.
- Preview release: `v12.04 · CT085 Preview Candidate 1` / cache key `20261006-stage23-76`.
- ct086 is next generation-ready after the ct085 review handoff; ct087 follows.
- ct088 Hoffmann remains **INCOMPLETE_DEFERRED_MUST_REVISIT**.
- Production `main` remains frozen.
- Reporting canon amended: every final work item must contain **코딩 전문가 설명 → 쉬운 설명 → 실제 앱 사용 시 변화**, and the next-work section must use the same three-layer explanation.
- Manual governance remains 25~30 min development / 30~35 min wrap-up only / 35 min HARD STOP.

# CURRENT OVERRIDE — 2026-10-06 ct088 user-deferred incomplete

> This block is authoritative for the current handoff and supersedes the earlier ct088 restoration block below.

- User explicitly marked ct088 Hoffmann **incomplete and deferred** on 2026-10-06.
- ct088 status: `INCOMPLETE_DEFERRED_MUST_REVISIT`.
- Candidate 13 is preserved only as audit history; it is not exposed as the active Preview candidate.
- Unresolved visual requirement for later revisit:
  - panel 3: examiner-controlled middle-finger DIP palmward flexion + rebound-up arrow;
  - panel 4: examiner grip remains on middle finger while thumb/index involuntary flexion is shown.
- Do not regenerate ct088 now.
- Active development line continues **ct085 → ct086 → ct087**.
- ct083 Candidate 2 remains user Preview PENDING.
- ct084/ct096/ct097/ct098 remain APPROVED and locked.
- Production `main` remains frozen.
- Manual development governance: 25~30 min actual development / 30~35 min wrap-up only / 35 min HARD STOP.

## 2026-10-06 cervical wave 2 implementation update

- Preview release: `v12.03 · Cervical Exam Wave 2` / cache key `20261006-stage23-75`.
- ct088 Hoffmann: **USER-DEFERRED INCOMPLETE**; no realistic candidate is exposed. App shows a Korean deferred-status note and keeps the existing Stable-ID schematic fallback.
- ct085 is the only next generation target.
- Generation permission gate now blocks:
  - ct088 while user-deferred,
  - duplicate generation of user-review candidates,
  - regeneration of approved assets,
  - ct086/ct087 from skipping ahead of ct085,
  - image generation when binary materialization is unavailable.
- Deterministic work queue reporter: `scripts/list-physical-exam-work-queue.mjs`.
- Active generation order: **ct085 → ct086 → ct087**.
- Frozen generation brief versions:
  - ct085: `2026-10-06-ct085-v1`
  - ct086: `2026-10-06-ct086-v1`
  - ct087: `2026-10-06-ct087-v1`
- Frozen prompt packets:
  - `docs/render-requests/CT085_SHOULDER_ABDUCTION_RELIEF_PROMPT_LOCK.md`
  - `docs/render-requests/CT086_CERVICAL_ROTATION_ROM_PROMPT_LOCK.md`
  - `docs/render-requests/CT087_C5_T1_NEUROLOGIC_SCREEN_PROMPT_LOCK.md`
- 2026 evidence nuance locked:
  - ct085 classic active hand-overhead relief sign is distinct from the 2026 validation study's modified passive shoulder abduction test;
  - ct086 <60° remains a CPR cluster component, not a universal standalone abnormal cutoff;
  - ct087 keeps radiculopathy localization separate from UMN/myelopathy patterns.
- Runtime E2E now covers ct085/ct086/ct087 teaching pages before realistic image generation.
- Production `main` remains frozen.


# HISTORICAL — 2026-10-06 ct088 Candidate 13 restoration (SUPERSEDED BY USER DEFERRAL)

> This block supersedes the older statement that no valid ct088 candidate exists.

- ct088 Hoffmann Candidate 13 has been re-audited directly from the repository asset and restored as the active user Preview target.
- Active asset: `./assets/physical-exam-realistic/candidates/ct088-hoffmann-gen-64db8f81-derived-4panel.svg`
- Candidate 13 gen_id: `64db8f81-b5e0-460a-8b41-046895643b0b`
- Internal visual/clinical audit: PASS.
- User Preview: PENDING.
- Do **not** regenerate ct088 while Candidate 13 awaits user review.
- Do **not** promote ct088 to APPROVED until explicit user approval.
- ct084, ct096, ct097, ct098 remain APPROVED and locked.
- Production `main` remains frozen.
- Manual development governance remains: 25~30 min actual work, 30~35 min wrap-up only, 35 min HARD STOP.

## 2026-10-06 cervical registry snapshot / recovery result

- Cervical EXAM-REAL profiles: 17 total.
- APPROVED canonical: 9 — ct082, ct084, ct090, ct093, ct094, ct095, ct096, ct097, ct098.
- Connected user-review candidates: ct083 Candidate 2 only; ct088 is user-deferred incomplete.
- Active generation-ready queue: ct085 → ct086 → ct087.
- ct089 is user-approved but exact approved binaries remain unrecovered; preserve the locked source hashes and do not substitute a new visual as the old approved original.
- ct091 and ct092 exact historical source filenames were searched in conversation/Library and current runtime on 2026-10-06; no exact file was recovered. Their historical metadata remains preserved and no false canonical asset has been declared.
- Current execution queue: `docs/checkpoints/EXAM_REAL_CERVICAL_QUEUE_2026-10-06.md`.

## 2026-10-06 cervical pilot wave 2 activation

- Active pilot `PILOT_CERVICAL_01` now includes ct085, ct086 and ct087 in addition to the original cervical pilot items.
- ct085/ct086/ct087 are explicitly bound to the pilot batch; the official prompt builder can now select them.
- Prompt builder now respects each test's own `panel_structure` instead of forcing every test into a 3-panel template.
- Expected generation order: **ct085 → ct086 → ct087**.
- ct087 may use a 4-panel layout because motor / sensory / reflex / pattern interpretation must remain distinct.
- ct083 and ct092 are review/recovery queues; ct088 is a mandatory deferred backlog item and is not active now.
- Approved assets remain regeneration-locked.
- Production `main` remains frozen.

## 2026-10-06 cervical EXAM-REAL development checkpoint

- Canonical execution queue: `docs/checkpoints/EXAM_REAL_CERVICAL_QUEUE_2026-10-06.md`.
- ct088 is now user-deferred incomplete; Candidate 13 remains audit history only.
- ct085 Shoulder abduction relief: clinical teaching PASS, realistic generation brief READY.
- ct086 Cervical rotation ROM: clinical teaching PASS, realistic generation brief READY; ~60° is not treated as a universal diagnostic cutoff.
- ct087 C5–T1 neurologic screen: clinical teaching PASS, realistic generation brief READY; motor/sensory/reflex integration and root overlap cautions locked.
- New CI contract: `scripts/cervical-exam-content-qa.mjs` protects ct085–ct088 content/lifecycle and the ct088 Candidate 13 binary hash.
- ct089 remains user-approved binary-transfer recovery backlog.
- ct091/ct092 remain binary/recovery/review backlog.
- Production `main` remains frozen.

# HISTORICAL OVERRIDE — 2026-10-05 20:46+ KST — SUPERSEDED BY 2026-10-06 TOP BLOCK

> Historical audit only. The 2026-10-06 ct088 restoration block at the top of this file is authoritative. Entries below may contain superseded lifecycle wording.

- Manual development: **25~30 min actual work**.
- Minute 30: no new feature / structure / asset generation.
- Minute 30~35: save, QA, HANDOFF/canonical update, final-report preparation only.
- Minute 35: **HARD STOP**.
- Final report timing fields: **work start / work end / report time / total actual work time / explicit compliance check**.
- Report headings: **① 뭘 했나 / ② 앞으로 뭘 할 건가** only.
- ct084: APPROVED.
- ct096: APPROVED.
- ct097: APPROVED.
- ct098: APPROVED.
- ct088: `INCOMPLETE_DEFERRED_MUST_REVISIT`; no valid Hoffmann candidate exists. Wrong generated images are rejected and must never be promoted.
- Production `main`: frozen.
## 2026-10-05 development governance timing/reporting lock

- Latest user rule overrides older manual timing notes.
- Manual development actual work: **25~30 minutes**.
- At 30 minutes: stop starting new features, new assets, or structural changes.
- 30~35 minutes: save, verify, update HANDOFF/canonical docs, and prepare final report only.
- 35 minutes: **absolute HARD STOP**, even if CI/Cloudflare is still running.
- Final report must include measured KST values for: work start time, work end time, report time, total actual work time, and explicit timing-rule compliance.
- User-facing major headings remain exactly two: `① 뭘 했나` and `② 앞으로 뭘 할 건가`.
- Policy is locked in `AGENTS.md`, `docs/DEVELOPMENT_CONSTITUTION.md`, `docs/DEVELOPMENT_PRINCIPLES.md`, and CI contract `scripts/development-governance-policy-qa.mjs`.

## 2026-10-05 ct098 approval clarification

- User reconfirmed that reviewed items are approved.
- ct098 status: APPROVED.
- Canonical asset: `./assets/physical-exam-realistic/approved/ct098-cervical-red-flag-gen-4be8f319-approved.webp`.
- Canonical SHA-256: `ad4be0f893673d5ce291b799fd88929598d55b7a5289d060b1e57c4a429bf89c`.
- ct084, ct096, ct097, ct098 are APPROVED and locked.
- ct088 Hoffmann is NOT approved because the later generated images were clinically the wrong examination and were never connected to the app. Its mandatory backlog remains active.
- Production main remains frozen.
## 2026-10-05 EXAM-REAL ct096 user approval locked

- User explicitly approved ct096 together with the previously reviewed ct084/ct097 set.
- ct096 status: APPROVED.
- Canonical asset: `./assets/physical-exam-realistic/approved/ct096-neck-flexor-endurance-gen-a49d9c8f-approved.webp`.
- Canonical SHA-256: `2c5429a9d15de304c80d94e3a3426fa241ebc034e721d8fbda286485c1eddaf4`.
- Do not regenerate or replace ct096 without a new explicit user request.
- ct084 and ct097 remain APPROVED.
- ct098 remains user Preview PENDING.
- ct088 Hoffmann remains mandatory revisit and is the next active EXAM-REAL item.
- Production main remains frozen.

## 2026-10-05 EXAM-REAL ct097 user approval locked

- User explicitly approved ct097 Candidate 1.
- ct097 status: APPROVED.
- Canonical asset: `./assets/physical-exam-realistic/approved/ct097-cervical-extensor-gen-27e0f01a-approved.webp`.
- Canonical SHA-256: `e6ff0b3b2cd593bad4aea743557c099cdcb1ea71e684e1cd59531aedc8ed5dbf`.
- Do not regenerate or replace ct097 without a new explicit user request.
- ct084 remains APPROVED.
- ct096 remains user Preview PENDING.
- ct098 remains user Preview PENDING.
- ct088 Hoffmann remains mandatory revisit.
- Production main remains frozen.

## 2026-10-05 EXAM-REAL ct098 Candidate 1 prepared

- ct098 Integrated cervical red-flag screen is the next EXAM-REAL item after ct097.
- Clinical safety correction locked: this is not a provocative special test. Workflow is history/risk context -> objective neurologic screen -> appropriate escalation.
- Red-flag lists have low guideline agreement; single nonspecific findings do not confirm serious pathology. Blunt trauma should use validated decision rules such as Canadian C-Spine Rule when applicable.
- Suspected vascular pathology is not screened by forceful/end-range cervical rotation or extension provocation.
- Candidate 1 gen_id: `4be8f319-96ca-498a-878d-174f114c5f79`.
- App Preview candidate: `./assets/physical-exam-realistic/candidates/ct098-cervical-red-flag-gen-4be8f319-preview.webp`.
- Internal clinical/visual QA: PASS. User Preview remains PENDING.
- ct096 and ct097 remain user Preview PENDING; ct084 remains APPROVED; ct088 Hoffmann remains mandatory revisit.
- Production main remains frozen.

## 2026-10-05 EXAM-REAL ct097 Candidate 1 prepared

- ct097 cervical extensor layer activation assessment is the next EXAM-REAL item after ct096.
- Clinical correction locked: surface palpation is an adjunct for posterior muscle coordination; deep semispinalis/multifidus are not selectively identified by fingers. Use C4 posterior extensor ultrasound (usv075) when true layer differentiation is needed.
- Candidate 1 gen_id: `27e0f01a-280b-4f82-ab2c-0722c003dc86`.
- App Preview candidate: `./assets/physical-exam-realistic/candidates/ct097-cervical-extensor-gen-27e0f01a-preview.webp`.
- Internal clinical/visual QA: PASS. User Preview remains PENDING.
- ct096 remains user Preview PENDING; ct084 remains APPROVED; ct088 Hoffmann remains mandatory revisit.
- Production main remains frozen.

## 2026-10-05 EXAM-REAL ct096 Candidate 1 prepared

- ct084 ULNT1 remains APPROVED and canonical; do not regenerate or roll back.
- ct096 Neck flexor endurance test Candidate 1 generated with gen_id `a49d9c8f-4890-4062-b247-24b212bcd900`.
- Candidate shows: supine/light chin tuck start; low controlled head lift while maintaining chin tuck; posture breakdown/high head lift with superficial neck compensation.
- Internal clinical/visual QA: PASS.
- App Preview candidate path: `./assets/physical-exam-realistic/candidates/ct096-neck-flexor-endurance-gen-a49d9c8f-preview.webp`.
- ct096 user Preview remains PENDING. Do not set APPROVED and do not merge to main without explicit user approval.
- ct083 remains user Preview PENDING. ct088 Hoffmann remains mandatory deferred backlog and must not be deleted.
- Production main remains frozen.

## 2026-10-05 ct084 ULNT1 fully approved and uploaded to app

- Final source: `a_clean_clinical_instructional_triptych_image_in.png`, 1024x1536, SHA-256 `0ffc8fdba0f93285323c758324339634d205be04afcc94fe75648bdfa6c75d9b`, gen_id `495a39af-8ae8-44a2-be97-428edca53770`.
- Canonical app asset: `assets/physical-exam-realistic/approved/ct084-ulnt1-gen-495a39af-approved.webp`, 600x900, SHA-256 `ff8300701e20668f61918fe57a4e36fb0b126cf0219d4baca523e955cfdef424`.
- Registry: APPROVED / user_preview PASS / blockers 0 / composite_url connected.
- Do not regenerate ct084. Clinical lock: no routine shoulder extension; upper-limb sequence first; contralateral cervical side flexion last as structural differentiation.
- App cache/version bumped to `2026.10.05-stage23.74`.
- Next active work: ct096 Neck flexor endurance test. Clinical brief already evidence-locked and generation-ready.
- ct083 remains user-preview PENDING; ct088 Hoffmann remains mandatory deferred backlog.
- Production `main` stays frozen until explicit promotion approval.

## 2026-10-05 ct084 latest generated image approved

- User explicitly approved the latest generated ULNT1 3-panel image.
- Exact source: `a_clean_clinical_instructional_poster_photographic.png`, 1536x1024, SHA-256 `8acca2ec69a0d12c1bc078b2dbb36f9286ddb9d44d2eaa648202271bc9e01509`, gen_id `7b639e82-ef95-4045-93b9-3d1121b344d6`.
- This supersedes all previous ct084 visual variants. Do not regenerate ct084.
- Binary transfer into the repository is still pending, so canonical `composite_url` remains intentionally unset.
- Next active task: ct096 Neck flexor endurance realistic 3-panel candidate.

## 2026-10-05 ct084 FINAL user approval — exact generated source locked

- User explicitly approved the final generated ULNT1 3-panel image after the hand-position corrections.
- Exact source: `3단계_팔_신경_검사_안내.png`, 1024x1536, SHA-256 `8a708874a227ea712bc9ffa625f130018c2c21df060f46e9b8719e68c8420322`, gen_id `3cc5780d-bfb2-4583-8c4a-4604896a5a21`.
- This supersedes every earlier ct084 Candidate 2 / temporary approval image. Do not regenerate ct084.
- Registry intentionally remains `USER_APPROVED_ASSETS_BINARY_TRANSFER_PENDING` until the exact approved bytes are transferred to GitHub. This prevents an older image from being rendered as canonical.
- Continue independent next work with ct096 Neck flexor endurance test.
- Production main remains frozen.

## 2026-10-05 ct084 exact uploaded final approved — binary transfer pending

- User explicitly approved the uploaded file `1791172601057.png` as the final ct084 ULNT1 illustration.
- Exact source lock: 1024x1536 PNG, SHA-256 `a89e832b66f673a1c5367173103149fb207a3185dfd4376f5bc99e1ab865e078`.
- This exact upload supersedes the earlier 240x360 Candidate 2. Do not leave the old image canonical and do not regenerate ct084.
- Registry is intentionally `USER_APPROVED_ASSETS_BINARY_TRANSFER_PENDING` with `composite_url=null` until the exact uploaded PNG bytes are transferred into GitHub. This prevents the wrong older image from being shown as approved.
- Clinical wording remains locked: upper-limb sequence first, familiar symptom check, contralateral cervical side flexion last as structural differentiation.
- Independent next work continues with ct096 Neck flexor endurance test.
- Production main remains frozen.

## 2026-10-05 ct096 next EXAM-REAL task locked

- ct084 ULNT1 is user-approved and locked; contralateral cervical side flexion is explicitly the final structural-differentiation step.
- Next fresh cervical realistic task: ct096 Neck flexor endurance test.
- ct096 clinical content and render brief are evidence-locked before image generation. Required visual distinction: maintain chin tuck + very low head lift, not a sit-up/high neck flexion.
- No universal disease-positive seconds cutoff is allowed in the image. Normative values are context only because variability/measurement error are large.
- Production main remains frozen.

## 2026-10-05 ct084 user approval and final-sequence lock

- User explicitly approved ct084 ULNT1 Candidate 2: PASS.
- Canonical Preview asset is now `assets/physical-exam-realistic/approved/ct084-ulnt1-gen-b9b9cbc2-approved.webp` using the verified intact historical binary.
- Final teaching wording is locked: the upper-limb sequence is completed first; familiar symptoms are checked; **contralateral cervical side flexion is performed last** as structural differentiation.
- Routine shoulder extension is not a core ULNT1 step.
- ct083 remains user-preview PENDING because no explicit PASS was given for ct083.
- Production main remains frozen.

## 2026-10-05 ct084 standardized ULNT1 protocol lock

- User asked whether shoulder extension is required and whether the neck must side-bend away from the tested arm.
- Evidence review: the 2023 systematic review proposed ULTT1/ULNT1 standard sequence as shoulder stabilization in abduction → wrist/finger extension → forearm supination → shoulder external rotation → elbow extension → cervical side-bending structural differentiation.
- Routine glenohumeral shoulder extension is not a core step in that proposed standardized sequence. Do not confuse shoulder extension with shoulder external rotation or scapular stabilization.
- Contralateral cervical lateral flexion is explicitly retained as structural differentiation after familiar symptoms are reproduced; the same symptom should change to support neural mechanosensitivity.
- App copy, EXAM-REAL generation brief, schematic preset and E2E were aligned to the same rule.
- Reporting contract changed: user-facing reports use only ① 뭘 했나 ② 앞으로 뭘 할 건가, and every technical block must be followed by plain-language explanation + app navigation + exact app copy + expanded study note + measured timing.
- Production main remains frozen.

## 2026-10-05 EXAM-REAL ct092 teaching prepared

- Independent roadmap work continued while ct083/ct084 user visual approvals remain pending.
- ct092 Cervical flexion-rotation test teaching now includes patient-level explanation, standard protocol, impairment pattern, differentials, red flags, next steps and diagnostic weight.
- ct092 Candidate 1 history remains internally passed but its exact review binary is not materialized in the repository. Do not fabricate user approval or substitute a new unrelated asset.
- Production main remains frozen.

## 2026-10-05 EXAM-REAL ct091 teaching prepared

- ct084 binary repair is complete; user visual approval remains pending.
- Independent next work: ct091 10-second grip-and-release teaching has been expanded for patient / trainee / clinician use without promoting any unreviewed image.
- ct091 Candidate 1 remains the only visual review source recorded in history; exact binary is not currently materialized in the repository, so do not fabricate approval or regenerate while recovery remains possible.
- Production main remains frozen.

## 2026-10-05 ct084 mobile blank-image root-cause repair

- User device screenshots proved ct084 Candidate 2 rendered as a blank card and its direct WebP showed only a thin top strip.
- Byte-level root cause: the 480x720 overwrite had only 7,500 bytes while its RIFF header declared 33,510 bytes. The repository binary was truncated; CSS and Cloudflare were not the primary cause.
- Restored the exact known-good Candidate 2 blob from commit d8ebae5: 240x360, complete RIFF, SHA-256 e9d4f309f214a0a5633dc7309965fedc7f417729b2a4d4206bdfb72828a6f5e7.
- ct084 remains user-preview PENDING. No approval is inferred from the screenshot.
- Global QA now checks RIFF-declared byte length for realistic candidate and approved WebP files so this failure cannot silently pass again.
- Production main remains frozen.

## 2026-10-05 EXAM-REAL progression override — ct084 review prepared

- User instructed `다음 작업 진행해` after ct083 review package. This authorizes advancing development work but is **not recorded as ct083 visual PASS**; ct083 remains user-preview PENDING and non-canonical.
- ct084 Upper Limb Neurodynamic Test 1(ULNT1) Candidate 2 is now the active review-preparation target. Do not regenerate; its reviewed binary already exists in the repository.
- ct084 clinical teaching was expanded for three audiences: plain-language patient explanation, trainee protocol/structural differentiation, clinician differential/limitations/next tests, with 2023 and 2026 diagnostic-accuracy evidence.
- Production main remains frozen.

## 2026-10-05 EXAM-REAL current line — ct095 closed, ct083 review active

- ct095 Craniocervical Flexion Test(CCFT): user PASS recorded, approved WebP materialized, registry APPROVED, detailed patient/trainee/clinician explanation connected. Do not regenerate unless the user explicitly reopens it.
- Current next user-review target: **ct083 Cervical distraction Candidate 2** (gen_id 5b72a5e1-f27e-4e64-8494-055c702922d3).
- ct083 reviewed candidate binary already exists in the repository at assets/physical-exam-realistic/candidates/ct083-cervical-distraction-gen-5b72a5e1-preview.webp; internal clinical/visual/hand/force/text gates PASS, user Preview remains PENDING.
- Do **not** regenerate ct083. Surface the existing Candidate 2 with the full teaching block and wait for explicit PASS/revision.
- ct084 remains next after ct083 review. ct091/ct092 retain their existing reviewed histories; do not repeat the wrong-subject ct090 generation regression.
- ct088 Hoffmann remains mandatory deferred backlog and must not be dropped.
- Production main stays frozen until explicit user promotion approval.

## 2026-10-04 Physical Examination report-with-image lock

- Every Physical Examination image-generation or image-correction report must include the clinical teaching block directly below the image/result.
- Required items: ① 시행 방법 ② 검사 목적/의미 ③ 양성 소견과 해석 ④ 무엇을 진단/의심할 수 있는지 ⑤ 무엇을 배제할 수 없는지 ⑥ 주요 감별진단 ⑦ 추가로 시행할 검사/영상 ⑧ 주의점·한계 ⑨ 근거 출처.
- Image-only reporting is prohibited.
- Medical abbreviations must be written with the full term beside them.
- User visual markings remain the highest-priority spatial constraint for local image correction.

## 2026-10-04 abbreviation display lock

- 사용자 노출 의학 약어는 단독 사용 금지. 약어 옆에 풀네임을 병기한다.
- 예: 퇴행성 경추척수병증(Degenerative Cervical Myelopathy, DCM), 상위운동신경원(Upper Motor Neuron, UMN), 자기공명영상(Magnetic Resonance Imaging, MRI), 근위지절간관절(Proximal Interphalangeal Joint, PIP), 원위지절간관절(Distal Interphalangeal Joint, DIP).
- 새 콘텐츠와 수정 콘텐츠부터 강제 적용한다.

## 2026-10-04 visual correction lock — Babinski regression prevention

- 모든 Physical Examination / 환자교육 실사형 시각교정은 **해부학 landmark → 사용자 마킹 → 지정 영역만 국소 수정 → 원본/수정본 대조** 순서로 처리한다.
- 화면 좌우를 medial/lateral로 추정하지 않는다. 해부학 방향을 먼저 구조명으로 잠근다.
- 사용자가 이미지 위에 직접 그린 선·원·화살표·동그라미는 최우선 spatial constraint다. 문장 prompt로 다시 해석해 위치를 바꾸지 않는다.
- 사용자가 `이 부분만`, `동그라미 친 그림만`, `우측 아래 좌측 작은 그림만`처럼 영역을 지정하면 **그 영역 외 픽셀/구도/텍스트/인물/화살표를 재생성하지 않는다**.
- 수정 후 원본과 수정본을 대조해 요청 영역만 바뀌었는지 확인한 뒤에만 PASS 후보로 올린다.
- 회귀 기준 예시: Babinski stimulation path는 `lateral heel → lateral plantar border → fifth-toe side`. 화면 좌우가 아니라 이 해부학 landmark로 판정한다.
- 정본 상세 규칙: `docs/REALISTIC_HUMAN_ILLUSTRATION_STYLE_CONTRACT.md §9`.

## 2026-10-03 manual checkpoint — direct review links + model casting

- Manual development time rule: target 25 minutes; at 25 minutes start wrap-up only; hard stop at 30 minutes.
- After each reviewable EXAM-REAL / patient-education asset is deployed, report a direct item-detail Preview link rather than only the app home URL.
- Clinical deep-link query contract: `?page=clinical&module=<module>&topic=exam&item=<ctNNN>`.
- Final user-facing teaching screens should remove/hide development-only wording such as Preview candidate, approval pending, canonical/fallback status, internal PASS/FAIL and gen_id. Preserve those records in GitHub/IP Vault instead.
- Human model casting is now governed by `docs/REALISTIC_HUMAN_MODEL_CASTING_CONTRACT.md`.
- New EXAM-REAL assets from ct084 use deterministic balanced patient/examiner male/female-presenting combinations; existing ct082/ct083 are grandfathered unless regenerated for another reason.
- New patient-exercise realistic generations use the same stable-ID balanced patient-presentation rule. Existing approved/reviewed assets are not regenerated merely to satisfy casting.
- Current EXAM-REAL user-review target remains ct083 Candidate 2. Do not advance to ct084 before ct083 user approval or requested revision.

## 2026-10-01 manual checkpoint — px007 source recovered

- px007 exact reviewed source image was recovered from the user's personal Library as `손가락 벌림 운동 안내 포스터.png` (1536×1024).
- Visual re-check: fingers together → finger spread, wrist neutral/forearm supported, fist closure/wrist bend/unsupported hand shown only as errors; no invented dose numbers.
- A mobile portrait derivative was created from that exact source without changing the clinical motion: `px007-mobile.webp` (520×942) and preserved in personal Library folder `/MuscleAtlasRecovery/`.
- Direct large-base64 GitHub transfer truncated once. The bad repository file was immediately deleted before any manifest/runtime connection; patient screen remained unchanged.
- Do not regenerate px007. Next exact task is safe binary transfer of the preserved `px007-mobile.webp` using chunked/staged transfer or another byte-safe path, then repository re-open/visual check → three-part review confirmation → ingest.
- px008–px011 remain blocked behind px007 binary handoff. No further image generation until px007 is materialized.
- A4 runtime E2E was expanded to check all 18 actionable profiles; approved mobile-only assets must hide in print and safe SVG fallback must remain visible until A4-HD is available.

## 2026-10-01 morning manual checkpoint — binary handoff safety

- px001–px006 remain approved mobile Preview realistic assets.
- px007–px011 are reviewed candidates whose actual generated image binaries are not available in the repository; they stay `CANDIDATE_GENERATED / BINARY_HANDOFF_BLOCKED` and off the patient screen.
- exact recovery order starts at px007. Do not regenerate px007–px011 merely to create files.
- recovered binaries must pass profile ID + exact gen_id + checkpoint identity + WebP integrity + SHA-256 verification through `scripts/materialize-reviewed-realistic-binary.mjs`, then the repository file must be re-reviewed for clinical content, visual pose, and embedded text before ingest.
- mobile runtime and A4 print tests explicitly keep `BINARY_HANDOFF_BLOCKED` candidates on the safe SVG fallback.
- px012–px018 remain `PENDING_GENERATION`; their locked briefs now have automated patient-safety checks. Do not generate them while the earlier binary handoff remains blocked.
- generation permission is now code-enforced: if an earlier profile is `BINARY_HANDOFF_BLOCKED`, later `PENDING_GENERATION` profiles are denied new image generation. The gate uses stable px001–px018 ordering and its Global QA is PASS.
- Global QA is PASS on the current workline through the new handoff safety checks; runtime-navigation E2E may still be running at the manual hard-stop and must be checked first next session if not complete.
- Production/main remains frozen.
- exact next task: recover/materialize px007 gen_id `8c940201-f1c0-4440-832d-83972f8efbb8` if that exact binary becomes accessible. If not accessible, preserve the blocker and continue only independent Stage 23B QA/registry/mobile/A4/print work.

# Muscle Atlas Current Handoff

Updated: 2026-09-29 KST

This document is the canonical handoff checkpoint for continuing development of **이윤석정형외과 근육**.

## 1. Repository / branch / release safety

- Repository: `husucabi69/muscle-atlas-chatgpt`
- Development branch: `preview/development`
- Production branch: `main`
- Production frozen SHA: `4ba8740ca6655ab1d4bebca84b26e39290c61bf7`
- **Never change or promote `main` without explicit user approval.**
- Latest verified baseline before the current research-queue checkpoint: `13950a56bf531a97eb68cd25f3d051e5e79e5919` — canonical handoff commit, Global QA run `36566509370` PASS.
- Latest roadmap-governance checkpoint before this handoff refresh: `af7b6846394e3bef86e4e5b61f7724d59685ec4c` — latest user instruction fixed manual 15-minute target / 20-minute HARD STOP and roadmap-first idea triage.
- Current Preview app version is read from `app-version.js`; live sessions must re-check it because scheduled development can advance the version.
- Embedded run/SHA notes are only checkpoints. Because 00:00~08:00 scheduled work can advance the branch, every session must query the live latest HEAD and latest QA/Preview state before editing.

## 2. User communication contract

Always explain to a non-developer first.

Every progress/final report must be:
1. **뭘 했나**
2. **어떻게 됐나 — PASS / FAIL / BLOCKED**
3. **앞으로 뭘 할 건가**

Technical SHA / workflow / file names come after the easy explanation.

Manual chat work:
- **target 25 minutes**
- at 25 minutes, start wrap-up only; do not start a new feature/asset/structural change
- **hard ceiling 30 minutes**
- from 25 to 30 minutes, only save / validate / commit / HANDOFF / check already-running QA or Preview
- at 30 minutes, HARD STOP even if CI/Cloudflare is still running; save a safe checkpoint and let the next turn check the result

Scheduled overnight work:
- every day **00:00 through 08:00 KST, every hour**
- target about 45 minutes of real development per run
- 45–50 minutes is wrap-up only
- hard stop at 50 minutes even if CI is still running
- every run must re-check latest HEAD and previous results before editing to avoid duplicate/conflicting work

## 3. Highest development rules

Primary constitution: `docs/DEVELOPMENT_CONSTITUTION.md`

Do not hotfix around root causes.

Order:
`root cause → structural fix → focused regression → needed full regression → Preview verify`

Do not use TinyFish. Browser QA source of truth is GitHub Actions Playwright plus actual user-device Preview checks.

Roadmap governance:
- New ideas never preempt the current Active Stage merely because they are attractive.
- First preserve them in the Idea Register, assess importance/dependency, then place them in roadmap order.
- Only regression, patient-safety/data-loss risk, Production contamination, or a current release blocker may jump the queue.
- Representative anatomy, actual ultrasound, muscle rehab, and disease rehab remain evergreen Stable-ID/registry/asset-slot content that can be added or replaced later without redesigning the app.

## 4. Anatomy UX contract — LOCKED

Visual/interaction baseline:
- `v11.14 · Stage 17 Precision Anatomy`
- baseline SHA: `e6dc0492a4d16d0536e15db3f6162b8ec57ee757`

Navigation:
`해부학 부위 → 근육 목록 → 근육 상세`

Inside muscle detail, preserve the same-screen five horizontal tabs:
`기본정보 | 해부도해 | 초음파 | 임상 | 심화·학습`

Do not create extra deep-history screens inside those five tabs.

Basic information must immediately expose O/I/F/N plus blood supply, palpation, clinical and ultrasound essentials.

## 5. Stage 23A / Stage 23B status

Stage 23A:
- CLOSED / USER PROCEED AUTHORIZED
- A5 Clinical, A6 Ultrasound, A7 Quiz, A8 Oral, A9 Personal Learning, A10 Home/Search all closed by explicit user progression
- do not retroactively claim device visual PASS where only progression was authorized

Stage 23B:
- **ACTIVE**
- user-approved final patient-exercise visual style = realistic human / photo-realistic clinical patient-education illustration
- not stick figure, not abstract SVG final, not chibi/fantasy
- one composite should clearly show `1 · 시작` and `2 · 끝`, same person, movement direction, support/fixation, common-error cue
- white clinical background, Korean labels, mobile-readable, A4 printable
- registry: `data/patient-exercise-realistic-assets-v1.json`
- current realistic asset status at handoff:
  - px001–px006 = `APPROVED` mobile Preview assets. px006 corrupt WebP was rebuilt from the original image, fixed numeric dose text removed, three-part review passed, and canonical ingest completed. A4-HD remains pending.
  - px007–px011 = `CANDIDATE_GENERATED / BINARY_HANDOFF_BLOCKED`. Their current candidate pose/content reviews were completed in scheduled development, but the exact generated image binaries were not materialized to the repository. They remain off the patient screen and must not be regenerated merely to create files.
  - px007 exact reviewed candidate = fingers together → finger abduction/spread, wrist neutral/forearm supported, no fist closure or arbitrary resistance.
  - px009 exact reviewed candidate = corrected squat with knee-foot direction alignment; the unsafe “knee must never pass toes” absolute cue is removed.
  - px012–px018 = `PENDING_GENERATION`, but generation is blocked by px007 binary handoff until earlier reviewed binaries are resolved.
  - canonical binary handoff queue is stable-ID ordered: px007 → px008 → px009 → px010 → px011.
  - px001–px018 all now have locked generation briefs; fixed time/repetition/set/angle numbers must not be invented unless supported by the source registry.
  - v11.65 adds a print-quality guard: while an approved realistic asset is still marked `MOBILE_PREVIEW_APPROVED_A4_HD_PENDING`, screen/mobile uses the realistic WebP but A4 print uses the sharp SVG fallback plus an explanatory note
- runtime E2E was structurally updated to validate realistic images while retaining hidden SVG fallback; a literal-newline syntax regression was corrected in `dc0d1e763effce157f2605fc3be83bcc509ff3f0`
- px007–px018 now all have locked `generation_brief` fields (pose, motion, support, common error, and no-invented-dosage policy).
- px007 old fist-closing candidate is rejected and retained only in audit history. Current state is `PENDING_GENERATION`; the next image must show fingers together → finger abduction/spread with wrist neutral and no arbitrary resistance.
- px008 old candidate recovery is closed: no reusable binary exists in known storage, so the correct next action after px007 is fresh generation from the locked brief.
- px009 old candidate is retired; the corrected locked brief/render request forbids the knee-toe absolute cue before any new approval.
- materialization pipeline now exists: `scripts/ingest-realistic-exercise-asset.mjs`
  - accepts only `CANDIDATE_GENERATED` profiles with **three-part candidate review PASS**: `clinical_content / visual_pose / embedded_text`
  - rejects unresolved `approval_blockers`, incomplete/failed candidate review, gen_id mismatch, non-WebP, undersized or non-portrait assets
  - writes `assets/patient-exercise-realistic/pxNNN.webp`
  - updates the manifest to `APPROVED` with stored resolution and A4 quality gate
  - high resolution alone does **not** grant A4 approval; `A4_HD_APPROVED` requires an explicit visual-review flag and minimum 1240x1754 dimensions
  - CI coverage: `scripts/realistic-asset-ingest-qa.mjs`
- canonical prompt builder now exists: `scripts/build-realistic-exercise-prompt.mjs`
  - compiles the locked style + pose/motion/support/common-error brief + unresolved blocker instructions into one reproducible generation prompt
  - px007 and px009 blocker language is automatically carried into regeneration instructions
  - CI coverage: `scripts/realistic-generation-prompt-qa.mjs`
- manifest-derived task selector now exists: `scripts/next-realistic-exercise-task.mjs`
  - it reads the existing manifest as the only source of truth and derives the next action instead of maintaining a duplicate queue
  - blocked candidates → `REGENERATE_FROM_LOCKED_BRIEF`
  - clean candidate with no stored binary → `OBTAIN_BINARY_AND_PREVIEW_REVIEW`
  - stored candidate binary with review pending → `PREVIEW_REVIEW_CANDIDATE`
  - stored candidate binary with clinical/pose/text review all PASS → `INGEST_REVIEWED_CANDIDATE`
  - pending profiles with locked briefs → `GENERATE_FROM_LOCKED_BRIEF`
  - A4-HD upgrades are deferred until the mobile realistic set is complete
  - CI coverage: `scripts/next-realistic-exercise-task-qa.mjs`
- overnight 2026-10-01 scheduled work produced reviewed candidates for px007–px011, but their actual binaries were not repository-materialized. The manifest now records them as `CANDIDATE_GENERATED / BINARY_HANDOFF_BLOCKED` so they must not be regenerated merely to create a file.
- next exact mainline item: **px007 / OBTAIN_BINARY_AND_PREVIEW_REVIEW**. Recover/materialize exact gen_id `8c940201-f1c0-4440-832d-83972f8efbb8`, verify checkpoint identity + WebP integrity + SHA-256, then re-review the repository file. If the exact binary is unavailable, keep the blocker and continue independent Stage 23B work instead of generating px012+ candidates.
- 2026-10-01 morning manual hardening after overnight review:
  - latest overnight px007–px011 reviewed candidates remain off-screen until exact binaries are recovered
  - binary registration now verifies profile ID + exact gen_id + checkpoint identity before accepting a recovered file
  - strict WebP inspection now records SHA-256 in addition to byte size and dimensions
  - runtime E2E explicitly rejects any `BINARY_HANDOFF_BLOCKED` candidate that becomes visible
  - `scripts/list-realistic-binary-handoff-queue.mjs` prints the live recovery order and exact gen_ids
  - `scripts/materialize-reviewed-realistic-binary.mjs` performs exact gen_id/checkpoint/WebP/SHA-256 verification and canonical registration when a reviewed binary becomes available
- Stage 23B realistic asset handoff is now safer:
  - strict WebP structure/integrity inspector rejects truncated or malformed files before approval
  - candidate registration helper only moves a valid binary into Preview review state
  - canonical render requests for px007–px010 are stored in `data/patient-exercise-render-requests-v1.json`
  - px008 hip abduction, px009 squat safety correction, and px010 bridge specs are ready for the next image-production sequence
- existing SVG remains migration fallback only, not final

## 6. Mandatory disease rehabilitation stage

`Stage 23B-Disease Rehab` is mandatory and blocks Stage 23C.

Registry:
`data/patient-rehab-disease-roadmap-v1.json`

Patient path target:
`환자교육 → 질환별 재활 → 해부학 부위 → 대표 질환 → 재활 프로그램`

Per-disease patient module must include:
- easy disease explanation
- who it is for / contraindications / red flags
- stretching
- strengthening
- lifestyle/activity modification
- common mistakes
- progression/phase when evidence supports it
- return/reassessment criteria
- evidence sources + last reviewed
- realistic exercise illustrations when needed
- mobile presentation + A4/PDF print

User specifically requested that disease modules may also use realistic illustrations when useful.

Examples explicitly preserved:
- adhesive capsulitis / 오십견
- rotator cuff / supraspinatus tendinopathy or tear
- supraspinatus-related stretching and strengthening
- osteoarthritis / degenerative joint disease
- user phrases `퇴행성 통증 증후군` and `연골 낭종` remain terminology-review items until normalized

## 7. Extensible content architecture

The app must remain continuously expandable.

Future user instructions such as:
- “이 질환 추가”
- “이 근육 운동 추가”
- “이 재활교육 추가”
- “이 초음파/X-ray/해부학 사진으로 교체”

must be handled without breaking existing routes by using:
- Stable IDs
- registry-driven content
- replaceable asset slots
- explicit source/license/last-reviewed metadata

Better anatomy, ultrasound, X-ray, rehab, or video assets may replace weaker current assets later.

## 8. Current anatomy representative-view quality track

User explicitly requires **whole-muscle representative anatomy views**, not merely any available picture.

Representative-view rule:
- prefer the view that shows overall belly/course/origin-insertion relationship and key landmarks
- axial/transverse/cross-section images are **not** acceptable as primary representative views when a whole-muscle view exists

Confirmed corrections already completed:
- m011 두반극근: old Gray384 C6 cross-section → `Gray389 Semispinalis capitis.png` posterior whole-course view
- m003 중사각근: old Gray384 C6 cross-section → `Gray385 - Scalenus medius muscle.png` lateral whole-course view
- automated QA now rejects Gray384 cross-section assets as representatives

Current audit ledgers:
- `data/muscle-illustration-audit-v1.json`
- `data/media-v1.json`
- `data/atlas-media-gap-audit-v1.json`
- QA: `scripts/muscle-illustration-audit-qa.mjs`
- QA: `scripts/atlas-media-gap-qa.mjs`

Latest state at the handoff baseline:
- canonical muscles: 205
- source gaps remaining: **18**
- manual visual re-audit candidates: **0**
- previously there were 28 gaps and 17 manual re-audit candidates; later work reduced these
- m056 Puborectalis was most recently updated to `Pelvic Muscles (Female Inferior).png`
- current baseline HEAD commit message: `QA: update required puborectalis representative asset`

Research order for those 18 is now explicitly stored in `data/atlas-media-gap-audit-v1.json`:
- **P1:** m120–m122 palmar interossei, m132 articularis genus, m137 adductor magnus hamstring part, m193 scalenus minimus, m197 spinalis cervicis, m205 articularis cubiti
- **P2:** m025–m028 thoracic deep segmental muscles and m039–m043 lumbar deep segmental muscles
- **P3:** m171 variable opponens digiti minimi of foot
- Each queue item has a stop rule so weak/group-level/cross-section substitutes are not promoted just to close the gap.
- m137 now has a documented public-domain research lead (Gerrish 1902 Fig.356 plus Gray whole-adductor plates) but remains a source gap because the hamstring/ischiocondylar part is not directly separated.

Remaining 18 anatomy source gaps:
- m025 흉다열근
- m026 흉회선근
- m027 흉극간근
- m028 흉횡돌기간근
- m039 요최장근
- m040 요극근
- m041 요다열근
- m042 요회선근
- m043 요극간근
- m120 제1수장골간근
- m121 제2수장골간근
- m122 제3수장골간근
- m132 무릎관절근
- m137 대내전근-햄스트링부
- m171 발 소지대립근(가변)
- m193 최소사각근
- m197 경극근
- m205 주관절근(articularis cubiti / subanconeus)

Do not fill a gap just to reach 205/205.
Only promote an asset when part-specific identity and reuse terms are sufficiently clear.
If no suitable reusable public representative exists, keep an explicit source-gap decision.

## 9. Ultrasound media status

Canonical ultrasound view source coverage:
- 131 / 131 actual-ultrasound source references
- unverified canonical source: 0

But direct in-app reusable visual coverage remains limited:
- embedded/reusable actual ultrasound: 5
- link-only actual-ultrasound reference: 126

Therefore “source exists” is not the same as “representative ultrasound is directly visible inside the app.”

Ongoing media-refresh objective:
- search academic / society / university / hospital / high-quality public educational sources
- verify it is actual ultrasound, not generated B-mode
- verify exact source/Figure/license/reuse conditions
- promote only when the new source is clearly better educationally and legally reusable
- otherwise preserve canonical link-only reference

Ultrasound/media searching must not stop the main development line.

## 10. Immediate next-work order

At the start of every new session:
1. fetch exact latest `preview/development` HEAD
2. check latest Global QA / runtime / Cloudflare status
3. compare with this handoff because overnight scheduled work may have changed the branch
4. read the current Active Stage and next incomplete item in MASTER/NEXT roadmap
5. do not repeat completed work or let a new idea silently reorder the roadmap

For the **first manual session after the 00:00~08:00 hourly scheduled runs**, the above live-state check is mandatory before any edit.

Main development line — follow this order:
1. **Stage 23B realistic patient-exercise illustrations** — complete/connect the 18 approved realistic two-panel assets and mobile/A4 QA
2. **Stage 23B-Disease Rehab** — representative disease-based patient rehabilitation education
3. **Stage 23C** — integrated real-device / offline / visual gate
4. **Stage 24** — Google Play Production release only after explicit user approval

Evergreen media/content refresh — preserve and continue, but **do not preempt the main line** unless it becomes a regression/safety/release blocker:
- 18 remaining anatomy source gaps
- better representative anatomy replacements
- reusable actual-ultrasound image/video promotion from the 126 link-only references
- future user-requested muscle-specific exercises and disease-rehab additions
- keep Stable IDs and registry/asset slots so additions/replacements do not require navigation redesign
- when an anatomy candidate is uncertain, keep the explicit gap rather than force a weak image
- keep relevant audit ledgers synchronized and run focused QA when refresh work is actually performed
3. build Stage 23B-Disease Rehab
4. Stage 23C real-device integrated gate
5. only after explicit user approval, Stage 24 Production promotion

## 11. Production rule

**main stays frozen.**
No merge, promotion, production deployment, or release submission without explicit user instruction.
