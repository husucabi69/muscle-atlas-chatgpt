# EXAM-REAL cervical queue — 2026-10-06

This checkpoint is the current execution order for cervical Physical Examination realistic assets.
It does not override explicit user approval/rejection commands.

## Registry snapshot
- Cervical profiles: 17 total.
- Canonical APPROVED: **9** — ct082, ct084, ct090, ct093, ct094, ct095, ct096, ct097, ct098.
- Connected user-review candidates: **1** — ct083 Candidate 2.
- Generation-ready in active pilot: **3** — ct085 → ct086 → ct087.
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

## Generation-ready next
3. **ct085 Shoulder abduction relief**
   - Clinical teaching expanded 2026-10-06.
   - Generation brief locked.
4. **ct086 Cervical rotation ROM**
   - Clinical teaching expanded 2026-10-06.
   - Historical ~60° value explicitly kept as cluster context, not universal cutoff.
   - Generation brief locked.
5. **ct087 C5–T1 neurologic screen**
   - Motor/sensory/reflex integration expanded 2026-10-06.
   - Root overlap and myelopathy differentiation locked.
   - Generation brief locked.

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
- Approved assets are immutable unless user explicitly requests replacement.
- A user-review PENDING candidate is not APPROVED.
- Wrong-subject generations are rejected and never reused under another Stable ID.
- Production `main` remains frozen until explicit user approval for production promotion.
