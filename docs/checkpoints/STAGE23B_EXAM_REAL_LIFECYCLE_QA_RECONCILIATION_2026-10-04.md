# Stage 23B / EXAM-REAL lifecycle QA reconciliation — 2026-10-04

## Scope
This checkpoint records a structural QA mismatch discovered after user review states were added to the realistic physical-examination asset registry. It does not promote Production and does not approve any new visual asset.

## Root cause
`scripts/physical-exam-realistic-assets-qa.mjs` still assumes that every review gate is only `PENDING | PASS | FAIL`, and that every non-approved pilot profile must remain `PENDING_GENERATION | PREVIEW_CANDIDATE_READY` with `user_preview != PASS`.

The live registry now has two legitimate non-canonical states:
- `ct088 = INCOMPLETE_DEFERRED_BY_USER_2026_10_04`, with `review.user_preview = DEFERRED`.
- `ct089 = USER_APPROVED_ASSETS_BINARY_TRANSFER_PENDING`, with `review.user_preview = PASS` but no approved binary and no composite URL.

Therefore the old QA produces three false failures:
1. six review gates reject `DEFERRED`;
2. pilot-state check rejects the two new lifecycle states;
3. false-approval check mistakes user visual approval pending binary transfer for canonical approval.

## Required structural fix
Do not rewrite registry truth to satisfy the old QA. Update the old registry QA to recognize the lifecycle contract already covered by `scripts/exam-real-lifecycle-qa.mjs`:
- allow `DEFERRED` only as a review outcome for an explicitly deferred lifecycle;
- recognize the two new non-canonical statuses;
- define canonical approval by `status=APPROVED + approved_asset + composite_url + user_preview=PASS`;
- keep user-approved/binary-pending assets non-canonical until binary transfer and hash verification complete.

Also wire `scripts/exam-real-lifecycle-qa.mjs` into Global QA immediately after the legacy physical-exam realistic registry QA once the stale assertions are reconciled.

## Stage 23B continuity while binary work is blocked
Patient exercise mainline remains Stage 23B. Do not regenerate px007. HANDOFF records the recovered px007 binary and exact next action as byte-safe materialization. If repository binary transfer is unavailable, continue independent registry/mobile/A4/print/IP work.

## IP provenance gap
`data/ip-provenance-v1.json` currently defines only ANATOMY_2D, ANATOMY_3D, MUSCLE_ACTION_ANIMATION, and SOFTWARE_INTERACTION, with zero asset records. Patient-exercise realistic and physical-exam realistic families therefore still need explicit provenance coverage before registration-readiness claims. This is a roadmap support task, not permission to preempt Stage 23B.

## Safety
Production/main remains frozen. v11.14 five-tab anatomy UX and Stable-ID registries are unchanged.
