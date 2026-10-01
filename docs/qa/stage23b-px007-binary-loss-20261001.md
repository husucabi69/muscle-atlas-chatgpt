# Stage 23B px007 binary-loss recovery audit — 2026-10-01

## Scope
Profile: px007 — 손가락 벌림  
Lost candidate gen_id: `8c940201-f1c0-4440-832d-83972f8efbb8`

## Recorded facts
- Candidate checkpoint: `data/patient-exercise-candidates/px007-20261001.json`
- Checkpoint state: `CONVERSATION_GENERATED_NOT_YET_REPOSITORY_MATERIALIZED`
- Manifest `candidate_asset_path`: null
- Manifest `binary_receipt`: absent
- Canonical asset `assets/patient-exercise-realistic/px007.webp`: absent
- Alternate repository paths checked during recovery: no px007 WebP/PNG binary found.
- The prior clinical/visual/text review is preserved only as historical review of the lost candidate; it must not be transferred to a newly generated image.

## Resolution
The exact reviewed candidate binary cannot be recovered from the recorded repository handoff state. Keeping the pipeline permanently blocked would create a false dead-end, while silently reusing the old gen_id would create false provenance.

Therefore px007 transitions to:
- `PENDING_REGENERATION`
- gate: `BINARY_LOSS_CONFIRMED_REGENERATION_ALLOWED`
- old gen_id/checkpoint/review preserved in `lost_candidate_history`
- active gen_id/checkpoint/review cleared
- new image must be generated from the locked brief, receive a new gen_id, materialize as a repository WebP, then pass fresh clinical_content / visual_pose / embedded_text review.

## Safety
- Production/main remains untouched.
- Rejected old fist-clenching candidate remains forbidden.
- No later profile may jump ahead of px007 in the mainline selector.
