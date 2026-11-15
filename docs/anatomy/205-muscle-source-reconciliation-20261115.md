# LYSOS 205-muscle source-of-truth reconciliation — 2026-11-15 KST

Status: SOURCE RECONCILED / CONTENT PRESENCE VERIFIED / CLINICAL REVIEW NOT COMPLETE

## Root cause
Earlier work checked only `data/muscles-v1.json` (183 records) and `index.html` embedded fallback (183 records), then incorrectly inferred 22 canonical O/I/F/N records were absent. **That inference was wrong.**

`index.html` function `hydrateKnowledgeCore()` fetches `data/knowledge-core-v1.json` and replaces the embedded muscle list. This runtime source contains **205** records, `m001` through `m205`, each with nonempty origin, insertion, function and innervation text. The last 22 records are real, not reconstructed from illustration captions.

## Evidence checked in repository
| Source | Muscle records | Role |
|---|---:|---|
| `data/knowledge-core-v1.json` | 205 | Actual runtime canonical Knowledge Core |
| `data/muscles-v1.json` | 183 | Legacy export / offline fallback |
| `index.html` embedded `const muscles` | 183 | Legacy fallback, replaced on successful Knowledge Core load |
| `data/muscle-illustration-audit-v1.json` | 205 illustration audit entries | Separate representative image review, not clinical content approval |
| `data/m184-m205-recovery-inventory-v1.json` | 22 names | Emergency identity-only fallback, **not** canonical runtime data |

- Verified 183 legacy records mirror the runtime Knowledge Core across nine text fields: 183 × 9 = **1,647 exact field comparisons** (zero differences at time of audit).
- Verified the 22 recovered names match their actual Knowledge Core names (zero differences).
- Verified 205 runtime O/I/F/N fields are nonempty. **This is a presence check, not an independent anatomical accuracy review.**
- No actual Node CI or Galaxy hardware PASS is asserted until logs and real-device observations are available.

## Patient-safety discovery and action
A copied elbow flexion/extension MMT sentence was used for 41 records. Three have elbow flexion/extension as a relevant action (m080, m081, m091); **38** others had a misleading or anatomically unrelated examination instruction. The 38 original strings are preserved in `data/mmt-safety-hold-v1.json`, and the active content is replaced by a clinical hold in:
1. `data/knowledge-core-v1.json` — actual runtime;
2. `data/muscles-v1.json` — legacy export;
3. `index.html` embedded fallback — offline PWA.

Oral Viva question generation now excludes held MMT instructions. Seven additional possible muscle-specific MMT isolation problems are tracked in `data/mmt-specialist-review-backlog-v1.json` and require specialist review; they are **not** automatically called clinically wrong.

## Guardrails
- Never infer runtime coverage solely from the 183-record export.
- Never promote an illustration audit PASS to clinical anatomy PASS.
- Never treat a held MMT safety notice as a validated test.
- Do not invent missing data or claim original 3D mesh, rig, human authorship or CROS filing.
- Keep main/production frozen until explicit approval.

## Automated checks authored (execution unverified)
- `scripts/test-knowledge-core-legacy-sync.mjs`
- `scripts/test-mmt-safety-gate.mjs`
- `scripts/test-canonical-muscle-resolver.mjs`
- `scripts/test-anatomy-coverage-page.mjs`
- `scripts/canonical-muscle-coverage-audit.mjs`
- `.github/workflows/anatomy-canonical-check.yml`

## Next actionable gate
Run Node tests in an actual checkout or GitHub Actions, inspect failures, validate deployed Preview and Galaxy behavior, request specialist review of the seven MMT candidates, then return to m009 anatomically verified editable 3D Master production.
