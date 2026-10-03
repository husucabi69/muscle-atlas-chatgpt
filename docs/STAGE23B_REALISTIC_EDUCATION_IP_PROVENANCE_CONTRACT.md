# Stage 23B IP provenance family contract — realistic education assets

Status: DESIGN LOCK / IMPLEMENTATION PENDING

This contract closes the provenance-model gap identified during Stage 23B without claiming copyright registration or changing any asset approval state.

## Required new work families

### PATIENT_EXERCISE_REALISTIC
Original realistic patient-exercise education illustration set.

Stable identity: patient exercise profile ID (`pxNNN`).

Minimum evidence before HUMAN_REVIEWED:
- exact profile ID and generation brief revision;
- generator/tool identity and generation ID when available;
- raw candidate or recoverable source reference;
- human-directed clinical corrections and rejected-candidate rationale;
- final candidate review for clinical content, visual pose, and embedded text;
- third-party reference/license state;
- final file path and SHA-256 once materialized.

A raw AI generation is never the final copyrighted deliverable merely because it exists. The registry must preserve the user's/human editor's creative selection, correction, composition, text, and final approval contributions.

### PHYSICAL_EXAM_REALISTIC
Original realistic physical-examination education illustration set.

Stable identity: clinical test ID (`ctNNN`).

Minimum evidence before HUMAN_REVIEWED:
- exact clinical test ID and locked generation brief;
- source clinical-fact references separated from visual-expression sources;
- generator/tool identity and generation ID when available;
- human corrections to pose, examiner hand placement, force direction, embedded text, and panel composition;
- six review gates including user Preview disposition;
- binary path + SHA-256 before canonical approval;
- explicit lifecycle distinction between user visual approval and canonical binary approval.

## Registration-readiness rules

Neither family may reach REGISTRATION_READY solely from AI generation metadata. Registration-ready evidence requires final human approval, independently created or properly licensed third-party inputs, source/final file evidence, and SHA-256 for final files. Public repository records must not contain private legal identity documents, signatures, home addresses, or other private registration paperwork.

## Integration plan

1. Extend `data/ip-provenance-v1.json` work-family vocabulary with these two family IDs.
2. Extend `scripts/ip-provenance-qa.mjs` allowed family set.
3. Add asset records only when an exact canonical/reviewed asset can be linked without inventing provenance.
4. Add deterministic cross-checks from px/ct Stable IDs to provenance records as the records are populated.
5. Keep this work subordinate to Stage 23B binary/materialization blockers and do not alter Production.

This document is a structural contract only. It does not assert that any work has been registered with a copyright authority.
