# LYSOS Muscle Atlas — First Edition (preservation candidate)

**Scope:** limited first-edition release candidate, not a 3D or clinical approval release.
**Immutable source snapshot:** branch `archive/lysos-pre-freeze-20261118`, commit `47106afd2939dbb2394b3d17fc67ed165e4fa7cb`.
**Working candidate:** `release/lysos-first-complete-20261118`, derived from the snapshot. Production `main` is unchanged.

## Keep and operate

1. Original 205-muscle Knowledge Core (205 identifiers; 205 populated origin/insertion/function/innervation records). The historical 183-record fallback is deliberately retained.
2. Original academic HTML/audio references, ultrasound, clinical-learning content, quizzes and patient education; existing approved assets and source credits remain in place, not regenerated.
3. 38 clinically unsafe copied elbow-MMT instructions remain quarantined in all three copies. Seven additional MMT records stay pending specialist review.
4. App main entry (`index.html`), searchable 205-muscle evidence room (`anatomy-coverage.html`), and new first-edition integrity entry (`first-release.html`).
5. Offline PWA precaches the first-edition entry, original canonical Knowledge Core and 205-muscle evidence room. Installed-device behavior is a separate acceptance gate.

## Deliberately excluded from first edition

- Original editable 3D master, new 2D derivations and 3D motion generation. Those are **not** finished and overlap with separately owned Anatomy Studio work.
- CROS registration: prep/evidence may exist but a registered copyright certificate has not been verified.
- Full 205-muscle clinician signoff. O/I/F/N nonempty is **not** an anatomy quality PASS.
- More novel modules, new paid dependencies, app-store production launch or unsolicited production migration.
- Importing new Claude OS material: preserve existing exact sources, postpone new conversion and publication until provenance is reviewed.

## Preservation safety

Do not delete or rewrite the archive snapshot. The following Git blob SHAs are pinned, compared at build time and intentionally unchanged:

- `data/knowledge-core-v1.json`: `d6ef1c6c2a9ca97900ff97cdf8d6a9d975c553b3`
- `data/muscles-v1.json`: `278f2f153f582d6ae28f94cc05a12e7cca5832a6`
- `data/mmt-safety-hold-v1.json`: `149fdfb565f71d21133f4f9270e885dae0a65c9d`

`scripts/first-release-qa.mjs` fails closed on changed source blobs or mismatched safety state. New entry screen only **reads** the existing canonical data; it does not export or rewrite records.

## Acceptance gates

**Automated:** original SHA/205/38/7 integrity, original 183 fallback parity, 205 search and 38-hold filter in real Chromium mobile/desktop, 10-tab app shell and no JS exceptions, static PWA cache contract.

**Human review before public production:** Galaxy/PC actual installed PWA, cold-start offline, live navigation accessibility, source-image licenses, clinically relevant nerve/vessel and all seven pending MMT reviews. No production merge without explicit owner approval.

**Fallback:** use archived branch or existing untouched `main` rather than deleting originals. The first edition is a safe academic-content baseline for an eventual single home within the official orthopedic website.
