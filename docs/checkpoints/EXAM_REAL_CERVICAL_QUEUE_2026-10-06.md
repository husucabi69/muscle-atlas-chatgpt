# CURRENT QUEUE OVERRIDE — 2026-10-07 ct086 Candidate 5 structured gate

- ct085 = APPROVED / HD_CANONICAL.
- ct086 = next and only generation target.
- ct086 Candidates 1–4 = REJECTED_INTERNAL_NOT_FOR_PREVIEW.
- Candidate 5 must use render contract `2026-10-07-ct086-v2`.
- Candidate 5 cannot enter Preview unless the machine preflight passes every locked axis and the guarded connector verifies asset identity metadata.
- ct087 = OUT_OF_ORDER until ct086 has a valid connected candidate.
- ct088 = DEFERRED / mandatory revisit later.
- Production main = frozen.

# CURRENT QUEUE OVERRIDE — 2026-10-06 23:28 KST

- ct085 = APPROVED / HD_CANONICAL 1024x1536.
- ct086 remains the only next generation-ready target.
- ct086 Candidates 1–4 were all rejected internally before Preview; no user-facing candidate exists.
- Rejection causes repeated across attempts: locked female/female casting not honored; examiner omitted in main scenes; long infographic text rendered inside artwork; numeric degree/cutoff text appeared; red symptom/pain overlay appeared.
- Root-cause mitigation: visual rendering is now separated from textbook narrative with `buildPhysicalExamImageOnlyPrompt()`; detailed clinical interpretation remains in app HTML only.
- Do not weaken the frozen ct086 visual contract to fit a generated image.
- ct087 remains OUT_OF_ORDER until ct086 has a valid connected Preview candidate.
- ct088 Hoffmann remains DEFERRED / mandatory revisit later.

# EXAM-REAL cervical queue — 2026-10-06

Preview release: `v12.05 · HD Exam + Textbook Interpretation`

This checkpoint is the current execution order for cervical Physical Examination realistic assets.
It does not override explicit user approval/rejection commands.

## Registry snapshot
- Cervical profiles: 17 total.
- Canonical APPROVED: **10** — ct082, ct084, **ct085 HD**, ct090, ct093, ct094, ct095, ct096, ct097, ct098.
- Connected user-review candidates: **1** — ct083 Candidate 2.
- ct085 latest user-approved asset is canonical HD: 1024x1536 / 122,218 bytes / SHA-256 `a9d7e97588283739117a1e36d74994b8604c66e37d01b3ed4749cdd7d9fb7de2`.
- Remaining generation-ready briefs: **2** — ct086 → ct087.
- Existing approved raster HD migration backlog: **ct082, ct084, ct095, ct096, ct097, ct098**.
- User-approved exact-binary recovery: **1** — ct089.
- Historical candidate metadata without connected app binary: ct091, ct092.

## Locked approved / HD migration policy
- ct082 Spurling — APPROVED · HD_UPGRADE_REQUIRED
- ct084 ULNT1 — APPROVED · HD_UPGRADE_REQUIRED
- ct085 Shoulder abduction relief — APPROVED · **HD_CANONICAL 1024x1536**
- ct090 Tandem gait — APPROVED · VECTOR_EXEMPT
- ct093 Greater occipital nerve assessment — APPROVED · VECTOR_EXEMPT
- ct094 Extension-rotation local pain provocation — APPROVED · VECTOR_EXEMPT
- ct095 CCFT — APPROVED · HD_UPGRADE_REQUIRED
- ct096 Neck flexor endurance — APPROVED · HD_UPGRADE_REQUIRED
- ct097 Cervical extensor activation — APPROVED · HD_UPGRADE_REQUIRED
- ct098 Integrated cervical red-flag screen — APPROVED · HD_UPGRADE_REQUIRED

## Active user-review candidate
1. **ct083 Cervical distraction**
   - Candidate 2 is already connected to Preview.
   - Internal gates PASS.
   - User Preview PENDING.
   - Do not regenerate unless user rejects/corrects it.

## Mandatory deferred backlog
- **ct088 Hoffmann sign**
  - User explicitly marked it incomplete and deferred on 2026-10-06.
  - Candidate 13 is audit history only and is not an active Preview target.
  - Panel 3 must later be corrected to show examiner-controlled middle-finger DIP palmward flexion plus rebound-up arrow.
  - Panel 4 must keep examiner grip on the middle finger while thumb/index involuntary flexion is shown.
  - Do not regenerate now; revisit after the active ct085 → ct086 → ct087 development line.

## ct085 completed
- **ct085 Shoulder abduction relief — USER APPROVED / canonical APPROVED / HD_CANONICAL**
- gen_id: `1db0cd0f-8b06-4d13-acf2-072ee5de3351`
- canonical: `./assets/physical-exam-realistic/approved/ct085-shoulder-abduction-relief-gen-1db0cd0f-approved-hd.webp`
- 1024x1536 / 122,218 bytes
- SHA-256: `a9d7e97588283739117a1e36d74994b8604c66e37d01b3ed4749cdd7d9fb7de2`
- Git blob SHA-1: `685beeb1c4b52a36514db4ab76ce7e11f2688176`
- Do not regenerate without a new explicit user replacement request.

## Generation-ready next
4. **ct086 Cervical rotation ROM**
   - Clinical teaching expanded 2026-10-06.
   - Historical ~60° value explicitly kept as cluster context, not universal cutoff.
   - Generation brief locked: `2026-10-06-ct086-v1`.
   - Frozen packet: `docs/render-requests/CT086_CERVICAL_ROTATION_ROM_PROMPT_LOCK.md`.
5. **ct087 C5–T1 neurologic screen**
   - Motor/sensory/reflex integration expanded 2026-10-06.
   - Root overlap and myelopathy differentiation locked.
   - Generation brief locked: `2026-10-06-ct087-v1`.
   - Frozen packet: `docs/render-requests/CT087_C5_T1_NEUROLOGIC_SCREEN_PROMPT_LOCK.md`.

## Binary/recovery backlog
6. **ct089 Babinski/clonus**
   - User approval already PASS.
   - Approved Babinski source SHA-256: `efefc0fcde07756f620a38e7e024260f6b01c6199a680d57ba6fadfa5e9474d6`.
   - Approved ankle-clonus source SHA-256: `c97854a065fe1fc04e29de00cf9c1a94c569bd48625a6f83daf8a9cfe670c2a4`.
   - 2026-10-06 recovery check: neither historical `/mnt/data` source exists in the current runtime; conversation/Library title search also did not recover the exact files.
   - Exact approved binary/derivative still must be recovered and hash-verified.
   - Do not invent a replacement and call it the approved original.
7. **ct091 10-second grip-release**
   - Clinical content PASS.
   - Earlier Candidate 1 exists only as historical generation metadata; app binary not connected.
   - 2026-10-06 recovery check: exact historical filename/title search in conversation/Library returned no match, and the current runtime contains no matching source file.
   - Recover exact binary if it becomes available; otherwise create a fresh independent candidate with user review.
8. **ct092 Cervical flexion-rotation**
   - Clinical content PASS.
   - Earlier Candidate 1 passed internal review but app binary is not connected.
   - 2026-10-06 recovery check: exact historical filename/title search in conversation/Library returned no match, and the current runtime contains no matching source file.
   - Recover exact binary if it becomes available; otherwise create a fresh independent candidate with user review.

## Execution rules
- A generated/internal-PASS candidate with `binary_handoff.blocks_generation_queue=true` blocks all later image generation until exact binary recovery and Preview connection.
- Approved assets are immutable unless user explicitly requests replacement.
- A user-review PENDING candidate is not APPROVED.
- Wrong-subject generations are rejected and never reused under another Stable ID.
- Production `main` remains frozen until explicit user approval for production promotion.
