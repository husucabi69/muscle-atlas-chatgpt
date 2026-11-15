# LYSOS — Orthopedic specialist review queue (2026-11-15 KST)
Status: AWAITING HUMAN CLINICAL REVIEW. Do not interpret AI drafts as approved clinical protocols.

## A. High-priority clinical data safety
**A1 — m009 splenius capitis**
- Current runtime O/I/F/N is present in `data/knowledge-core-v1.json`.
- MMT: old unrelated elbow-extension wording has been quarantined in all 3 data layers. Proposed review direction only: resisted cervical extension/ipsilateral rotation with awareness of synergists and pain, **not** a validated isolated MRC 0–5 test.
- Innervation: canonical “주로 C3-C4” conflicts with NCBI/Elsevier C2–C3 and broader descriptions in some muscle-testing sources. Specialist to approve level wording or explicit variation note.
- Arterial supply: independent sources emphasize occipital and deep cervical branches; canonical includes ascending cervical/vertebral muscular branches. Specialist to review specificity.
- Sources and links: `docs/anatomy/splenius-capitis-knowledge-v1.md`. User Claude OS cervical textbook (`클로드_근육학_08권_경추.html`, section s5) also checked: describes C3–C5 and resisted ipsilateral rotation/extension; do not mistake this for validated isolated MRC grading.
- Sign-off fields: [ ] O/I [ ] function/laterality [ ] nerve [ ] vascular [ ] MMT safety [ ] 3D attachment landmarks. No boxes checked yet.

**A2 — 38 copied elbow-MMT instructions**
- Ledger: `data/mmt-safety-hold-v1.json`.
- All 38 held in runtime/legacy/offline PWA and excluded from Oral Viva exam generation.
- Human clinical review required before restoring an MMT protocol. Prioritize cervical, lumbar and lower-limb regions with direct patient-facing relevance.

## B. Seven additional muscle-specific MMT candidates
Source: `data/mmt-specialist-review-backlog-v1.json`.
- m051 폐쇄내근, m052 상쌍자근, m053 하쌍자근: neutral hip abduction test may fail to represent external rotation and cannot isolate these deep muscles.
- m054 폐쇄외근: resisted adduction is weak secondary action, not a validated isolated test.
- m076 상완이두근-단두: shoulder adduction test does not isolate primary elbow flexion/supination contribution.
- m082 주근: generic abduction test is likely inconsistent with elbow extension/stabilization.
- m127 봉공근: hip abduction alone is insufficient to isolate multi-action sartorius.
**Status:** review candidates, not yet suppressed or called conclusively incorrect.

## C. Anatomy 3D Master release gates
1. Human specialist verifies mastoid process, lateral superior nuchal line, nuchal ligament and C7–T3/T4 attachments.
2. Review fiber direction and anatomical depth against cross-sectional MRI/dissection sources.
3. Record patient left/right and neutral anatomical pose in editable source.
4. Review original mesh, tendon transitions, layer transparency and motion before deriving 2D plates.
5. Record genuine human creative contributions and IP ownership before CROS filing.
6. Galaxy real-device QA is separate from automated code checks.

## Decisions requested of the chair
- Approve/revise m009 nerve-level wording and MMT disclaimer after reviewing the cited references.
- Prioritize the seven additional MMT candidates for safety hold or specialist-written replacement.
- Approve any original 3D geometry only after visual and anatomical inspection, not based on source-code existence.
