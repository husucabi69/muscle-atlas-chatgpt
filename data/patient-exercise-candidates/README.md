# Stage 23B realistic exercise candidate checkpoints

This directory stores candidate provenance/review metadata before a generated image binary is materialized into the repository.

Rules:
- The canonical movement contract remains `data/patient-exercise-realistic-assets-v1.json` (`generation_brief`).
- A sidecar with `CANDIDATE_GENERATED` is **not** approval and must not populate `composite_url`.
- A reviewed candidate with no repository binary uses `BINARY_HANDOFF_BLOCKED`; do not regenerate it merely to create a file.
- Promotion requires the exact reviewed binary to be materialized as the canonical WebP, strict WebP integrity validation, repository-file three-axis review (`clinical_content`, `visual_pose`, `embedded_text`), mobile Preview, and the A4/print gate.
- Binary handoff must match **profile ID + exact gen_id + checkpoint identity**. A mismatched file must be rejected.
- Once a WebP is materialized, record byte size, dimensions, and **SHA-256** in `binary_integrity` so the exact binary remains auditable.
- Rejected `gen_id` values in the canonical registry must never be revived.
- Production/main remains frozen until explicit user approval.

Current reviewed-binary handoff queue (2026-10-01):
1. px007 손가락 벌림 — recover/materialize exact gen_id `8c940201-f1c0-4440-832d-83972f8efbb8`.
2. px008 고관절 외전 — exact gen_id `685daf50-8620-4930-9c3d-ac26f655ece3`.
3. px009 교정 스쿼트 — exact gen_id `36ee6b3a-234e-4f79-8fac-0a38e37f8e15`; knee-toe absolute-prohibition cue remains forbidden.
4. px010 브리지 — exact gen_id `fcf6cc70-ea55-4285-ad2b-c61981ce219c`; repository binary must be rechecked for embedded text.
5. px011 뒤꿈치 들기 — exact gen_id `f24f0f85-1d0e-4a91-a71d-a15c6255431a`.

Use `node scripts/list-realistic-binary-handoff-queue.mjs` to print the live queue.
When an exact binary becomes available, use:
`node scripts/materialize-reviewed-realistic-binary.mjs pxNNN /path/to/exact.webp <exact-gen_id>`
This command verifies the blocked profile, exact gen_id, checkpoint identity, WebP structure, and SHA-256 before canonical placement/registration. The repository file must then be visually re-reviewed before canonical ingest.

If the exact px007 binary cannot be accessed in the current execution environment:
- keep the blocker,
- do **not** create additional gen_id-only image candidates,
- continue independent Stage 23B QA/registry/mobile/A4/print/handoff work instead.
