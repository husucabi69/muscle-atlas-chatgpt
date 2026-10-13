# CT086 Candidate 5 — Render provenance / clinical visual audit

- The image generation task succeeded on 2026-10-14. Its original task is `00886834-ff19-4655-9000-6941f580664d` in the connected Runway workspace.
- Source prompt and credit ledger are saved in `CT086_CANDIDATE5_PROVENANCE_2026-10-14.json`; never embed signed asset JWTs in GitHub.
- The separate `CT086_CANDIDATE5_VISUAL_AUDIT_PENDING_2026-10-14.json` intentionally has **NO visual review PASS**. Its dummy/missing values should be rejected by `evaluatePhysicalExamCandidate()`.
- Inspect the source image for female patient/female examiner in ALL 3 panels, same identities and outfits, active head rotation with fixed trunk/shoulders, only three allowed Korean headings, no degree symbols or red-pain overlays, accurate anatomy. Confirm minimum 1024×1536 from real bytes.
- Save exact PNG source and HD WebP derivative inside `assets/physical-exam-realistic/candidates/`, verify SHA-256/bytes/Git SHA1, then call guarded Preview connector after preflight. Until then **do not modify ct086 registry to Candidate Ready or APPROVED**, retain canonical schematic.
- ct085 existing approved artwork is not a model to silently reuse as the ct086 asset. The binary used in the connector QA is a temporary fixture only.
- New work may continue on the ct086 verified image only; ct087 is still blocked and ct088 Hoffmann deferred.
