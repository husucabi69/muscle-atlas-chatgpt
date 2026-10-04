# EXAM-REAL sprint current state — 2026-10-04

## Purpose
Freeze the cleaned development line after the approved-realistic rendering fix and remove stale queue/version metadata before accelerating the next Physical Examination assets.

## Current truth
- Canonical Physical Examination tests: 148/148 Stable-ID schematics remain available.
- Approved realistic assets locked: ct082 Spurling, ct090 Tandem gait, ct093 greater occipital nerve palpation, ct094 extension-rotation.
- User-approved but repository binary transfer pending: ct089 Babinski/clonus.
- User-preview queue: ct083 Cervical distraction, ct084 ULNT1, ct091 10-second grip-release, ct092 Cervical flexion-rotation.
- Mandatory deferred backlog: ct088 Hoffmann; must be revisited, not dropped.
- Next fresh generation task: ct095 Craniocervical flexion test.
- Production/main remains frozen.

## Queue rule
Do not regenerate a candidate that already passed internal clinical/visual review merely because its old lifecycle status says PENDING_GENERATION. Once a reviewed candidate binary exists, move it to CANDIDATE_GENERATED_USER_PREVIEW_PENDING and wait for user visual review.

## Version label rule
The visible app version must describe the product stage, not one temporary candidate. v12.02 uses “Physical Exam Realistic Preview”; candidate-specific names belong in the individual exam card/history, not the global header.

## Immediate order
1. Surface ct083/ct084/ct092 reviewed candidates for user preview without duplicate generation.
2. Generate ct095 as the next genuinely new pilot asset.
3. Materialize/hash-lock ct089 approved binaries when exact approved sources are available.
4. Revisit ct088 Hoffmann with its locked hand/finger mechanics after the current queue is cleared.
5. Keep approved assets and Stable-ID fallback protected by automated QA.
