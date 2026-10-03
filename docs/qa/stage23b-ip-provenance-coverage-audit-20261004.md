# Stage 23B IP provenance coverage audit — 2026-10-04

Status: OPEN STRUCTURAL GAP

## Scope
Independent Stage 23B audit while patient-exercise binary handoff is blocked.

## Finding
`data/ip-provenance-v1.json` currently defines work families for ANATOMY_2D, ANATOMY_3D, MUSCLE_ACTION_ANIMATION, and SOFTWARE_INTERACTION, but has no work family or asset records for the current AI-assisted patient-exercise realistic illustrations or EXAM-REAL physical-examination illustrations.

This does not invalidate runtime assets, but it means the public provenance registry and copyright-evidence exporter cannot yet represent the visual families currently being produced.

## Required structural follow-up
1. Extend the provenance schema/policy with visual work families for patient-exercise education and physical-examination education.
2. Register only repository-materialized, human-reviewed assets; never treat a raw AI generation as registration-ready.
3. Preserve Stable ID, generator/gen_id where applicable, human creative decisions, source/final file references, SHA-256, third-party/license state, and final human approval.
4. Keep legal identity and private registration documents outside the public repository.
5. Add regression QA proving the two new work families are accepted and unresolved/binary-blocked candidates cannot become REGISTRATION_READY.
6. Do not change Production/main.

## Current blocker relationship
px007 remains the first Stage 23B patient-exercise binary handoff. This audit does not authorize regeneration or skipping that queue.
