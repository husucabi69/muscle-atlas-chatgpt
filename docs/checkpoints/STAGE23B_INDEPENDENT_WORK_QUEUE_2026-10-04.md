# Stage 23B independent-work queue — binary/CI blocked sessions

Updated: 2026-10-04 KST

Purpose: keep scheduled development productive when image binary handoff, Cloudflare, or a CI lane is blocked. This queue does not change roadmap priority.

## P0 — restore trustworthy QA
- Reconcile `scripts/physical-exam-realistic-assets-qa.mjs` with the explicit EXAM-REAL lifecycle contract. Do not mutate ct088/ct089 truth merely to satisfy stale assertions.
- Wire `scripts/exam-real-lifecycle-qa.mjs` into Global QA after reconciliation.
- Re-run full Global QA; deploy-safety/Cloudflare verification remains gated on both Global QA and runtime E2E.

## P1 — Stage 23B patient-exercise binary continuity
- px007: do not regenerate. Use the recovered reviewed binary described in HANDOFF; byte-safe repository materialization is the exact next binary action.
- Until px007 is canonical, do not generate px012+.
- When binary transfer is unavailable, audit the 18-profile mobile/A4 fallback contract and registry consistency instead.
- Reconcile stale px007 manifest/roadmap state only through a late-binary-recovery transition that preserves the prior unrecoverable audit history.

## P2 — IP provenance, safe without image generation
- Implement the two work families defined in `docs/STAGE23B_REALISTIC_EDUCATION_IP_PROVENANCE_CONTRACT.md`.
- Extend provenance QA before adding registration-ready claims.
- Add exact Stable-ID asset records only when source/final evidence is known; never invent hashes, dates, authorship facts, or registration status.

## P3 — Disease Rehab preparation, subordinate to Stage 23B illustration mainline
Current coverage matrix has 11 target regions: six SEEDED and five PENDING.
Safe independent work is registry/schema/QA scaffolding for the five pending regions:
- cervical — nonspecific mechanical neck pain
- wrist_hand — carpal tunnel syndrome or de Quervain tenosynovitis
- lumbar_sacral — nonspecific chronic low back pain
- thoracic_back — mechanical thoracic pain with red-flag-first structure
- abdominal_core — rectus diastasis with hernia differential first

Do not finalize uncertain medical dosing or progression numbers during autonomous runs. Evidence-backed content remains required before patient-facing approval.

## Hard invariants
- Production/main frozen without explicit user promotion approval.
- v11.14 five-tab muscle-detail UX unchanged.
- Stable IDs and replaceable registry/asset slots preserved.
- No repeated image generation when binary handoff is blocked.
