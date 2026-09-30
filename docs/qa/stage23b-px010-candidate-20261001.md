# Stage 23B px010 candidate checkpoint

- Stable ID: `px010`
- Exercise: bridge
- Candidate gen_id: `3446296d-1e03-4371-a729-b511f25b9841`
- Source: image generation from the canonical locked px010 bridge brief.
- Status: `CANDIDATE_GENERATED_REVIEW_HOLD_BINARY_PENDING`

## Three-part review

### clinical_content — HOLD
- Correctly uses a supine start with knees flexed, feet supported, and pelvis lifted by gluteal/posterior-chain effort.
- Correctly warns against lumbar overextension, knee collapse, and heel lift.
- The phrase implying a strict straight line from shoulder to knee is too rigid for a general patient-facing target and must not become a canonical cue.
- No invented repetition/set/time dosage is required.

### visual_pose — PASS
- Start, lift, and controlled return are clearly separated.
- Common compensations are visually separated.
- The exercise is bridge, not the previously erroneous side-lying render interpretation.

### embedded_text — HOLD
- Korean text is readable at source resolution.
- Replace the rigid straight-line cue with a tolerant cue such as: `몸통-골반-허벅지가 자연스럽게 이어지는 편안한 범위까지만 들어 올립니다.`
- Avoid unsupported numeric dosage.

## Approval gate

Do **not** mark the manifest `APPROVED` and do not ingest this candidate as the canonical WebP. A corrected px010 candidate must first pass clinical_content, visual_pose, and embedded_text review; then the exact generated binary must be recoverably materialized, ingested through `scripts/ingest-realistic-exercise-asset.mjs`, and verified in mobile Preview. A4-HD approval remains a separate visual gate.

## Next exact mainline item

1. Generate one corrected px010 bridge candidate from the locked brief, changing only the rigid straight-line patient cue to a tolerant natural-alignment cue.
2. If binary materialization remains unavailable, checkpoint the corrected candidate and continue independently to `px011` heel raise rather than waiting.
3. Do not regenerate px007-px009; their checkpoints already exist.
4. Never modify `main` without explicit user promotion approval.
