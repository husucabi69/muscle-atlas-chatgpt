# CT086 Candidate 5 — Render provenance / clinical visual audit

- The image generation task succeeded on 2026-10-14. Its original task is `00886834-ff19-4655-9000-6941f580664d` in the connected Runway workspace.
- Source prompt and credit ledger are saved in `CT086_CANDIDATE5_PROVENANCE_2026-10-14.json`; never embed signed asset JWTs in GitHub.
- The separate `CT086_CANDIDATE5_VISUAL_AUDIT_PENDING_2026-10-14.json` intentionally has **NO visual review PASS**. Its dummy/missing values should be rejected by `evaluatePhysicalExamCandidate()`.
- Inspect the source image for female patient/female examiner in ALL 3 panels, same identities and outfits, active head rotation with fixed trunk/shoulders, only three allowed Korean headings, no degree symbols or red-pain overlays, accurate anatomy. Confirm minimum 1024×1536 from real bytes.
- Save exact PNG source and HD WebP derivative inside `assets/physical-exam-realistic/candidates/`, verify SHA-256/bytes/Git SHA1, then call guarded Preview connector after preflight. Until then **do not modify ct086 registry to Candidate Ready or APPROVED**, retain canonical schematic.
- ct085 existing approved artwork is not a model to silently reuse as the ct086 asset. The binary used in the connector QA is a temporary fixture only.
- New work may continue on the ct086 verified image only; ct087 is still blocked and ct088 Hoffmann deferred.

## 2026-10-14 — Candidate 5 exact binary transfer runbook (NOT YET DONE)

**Do not generate a replacement.** Runway task `00886834-ff19-4655-9000-6941f580664d` already generated one image; registry `inflight_render_task` blocks duplicative paid generation until verified recovery or explicit rejection.

1. Retrieve the original 2K output from the Runway task (avoid committing signed URLs/JWTs). Store unchanged in `assets/physical-exam-realistic/candidates/ct086-rotation-rom-candidate5-source.png`. Inspect real pixel width/height, original bytes and SHA-256; Runway's 2K label alone is not a pixel audit.
2. Create an equally high-resolution WebP derivative at `assets/physical-exam-realistic/candidates/ct086-rotation-rom-candidate5-hd.webp`. No 320×480/600×900 thumbnail or pixel enlargement counts as HD.
3. Inspect the actual image clinically: consistent adult female patient and female examiner in **all three panels**, head-only ACTIVE rotation while shoulders/trunk remain still, examiner observation (no passive end-range), exactly three Korean headings, no numeric cutoff/degree symbol, no red pain glow, accurate anatomy. Complete `CT086_CANDIDATE5_VISUAL_AUDIT_PENDING_2026-10-14.json` using observed facts, NOT optimistic guesses.
4. Run `node scripts/physical-exam-candidate-preflight.mjs data/physical-exam-realistic-assets-v1.json ct086 <actual-audit.json>`. Any failure -> reject, do not enter Preview.
5. Set `candidate_no=5`, actual `source_asset_path`, `source_sha256`, `preview_asset_path`, `preview_webp_sha256`, `preview_bytes`, `git_blob_sha1`, `dimensions` from files. Then run `node scripts/physical-exam-preview-connect.mjs <registry> ct086 <candidate.json> <actual-audit.json> <output-registry>`. It checks **real** on-disk source/Preview binaries, bytes, pixel resolution, SHA256 and Git blob SHA1.
6. User must explicitly PASS the connected Preview before approval; until then preserve EXAM-001 schematic fallback. If explicitly rejected, reset in-flight task only in dedicated audited change.
7. Preserve task's full prompt, clinical human edits, exact binary and QA evidence for copyright documentation; AI generation alone is not proof of registrable human creative contribution.
