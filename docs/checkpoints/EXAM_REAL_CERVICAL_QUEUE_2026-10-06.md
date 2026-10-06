# EXAM-REAL cervical queue — 2026-10-06

Preview release: `v12.03 · Cervical Exam Wave 2`

This checkpoint is the current execution order for cervical Physical Examination realistic assets.
It does not override explicit user approval/rejection commands.

## Registry snapshot
- Cervical profiles: 17 total.
- Canonical APPROVED: **9** — ct082, ct084, ct090, ct093, ct094, ct095, ct096, ct097, ct098.
- Connected user-review candidates: **1** — ct083 Candidate 2.
- ct085 Candidate 1 is materialized, byte-verified and connected to Preview; user approval is pending.
- Remaining generation-ready briefs: **2** — ct086 → ct087. Current ct085 task is now at user-review handoff.
- User-approved exact-binary recovery: **1** — ct089.
- Historical candidate metadata without connected app binary: ct091, ct092.

## Locked approved — do not regenerate
- ct082 Spurling — APPROVED
- ct084 ULNT1 — APPROVED
- ct090 Tandem gait — APPROVED
- ct093 Greater occipital nerve assessment — APPROVED
- ct094 Extension-rotation local pain provocation — APPROVED
- ct095 CCFT — APPROVED
- ct096 Neck flexor endurance — APPROVED
- ct097 Cervical extensor activation — APPROVED
- ct098 Integrated cervical red-flag screen — APPROVED

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

## Active user-review candidate
3. **ct085 Shoulder abduction relief**
   - Candidate 1 generated/internal review PASS on 2026-10-06.
   - gen_id: `6582ec89-607d-4ce7-bd9a-f7358f9683ff`.
   - source PNG SHA-256: `0990827c298c5c7471a74e0159700ba820059ad9c953b6855efcae2a4d871a1e`.
   - local 600x900 WebP SHA-256: `05a46466fdc930d2f70d44e1db8ab4bd6e18130296e9a91b2193cbd65fd71cce`.
   - Preview WebP: `./assets/physical-exam-realistic/candidates/ct085-shoulder-abduction-relief-gen-6582ec89-preview.webp`.
   - 240x360 / 9,936 bytes / SHA-256 `83c67093c1573746655b6921bf109b62ed16473422f7fac19168cfb70a1cb46e`.
   - local Git blob SHA-1 = GitHub blob SHA: `95624edb2711997d3bcbff4759402d9cc6d8c3c4`.
   - internal gates PASS; user Preview PENDING.
   - **Do not regenerate or canonical-promote ct085 until explicit user approval.**

## Generation-ready after blocker clears
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
