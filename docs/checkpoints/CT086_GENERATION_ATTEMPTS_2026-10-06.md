# CT086 Generation Attempts Checkpoint — 2026-10-06

Stable ID: `ct086`  
Test: 경추 회전 ROM 평가 / Cervical rotation range-of-motion assessment  
Generation brief: `2026-10-06-ct086-v1`  
Current disposition: **NO USER-FACING CANDIDATE YET**

## Frozen acceptance contract

A Preview candidate must satisfy all of the following:
- high-resolution portrait source, minimum 1024×1536;
- active cervical rotation only;
- trunk and shoulders fixed;
- no forceful passive end-range rotation;
- locked casting: female patient + female examiner, same identities across panels;
- examiner visible as observer;
- only three short Korean panel headers;
- no degree value or numeric cutoff;
- no red pain glow/heatmap;
- neutral short arc/guide arrows for movement/limitation;
- no infographic teaching paragraphs inside the artwork.

Detailed textbook interpretation belongs in app HTML, not inside the image.

## Internal attempts — all rejected before Preview

### Candidate 1
- gen_id: `ac5296c2-767c-47ce-82d0-c7a4315e6ce4`
- source: `/mnt/data/a_tall_infographic_in_a_clinical_medical_instructi.png`
- dimensions: 1024×1536
- SHA-256: `850f48f06bf2482f0d1868eba785cf0b3d1695e4d850a26fbd263af77b82d03a`
- FAIL: male patient, examiner absent, long embedded copy, numeric 70–90° text, red overlay.

### Candidate 2
- gen_id: `dfb7d375-f43e-493e-a5e3-724c7ede503b`
- source: `/mnt/data/a_clean_instructional_medical_infographic_poster_w.png`
- dimensions: 1024×1536
- SHA-256: `01292202ae05a2ecc1492f2b58e96cc40d6cb9b2f714a2ff2cf298c5f1a4bfdf`
- FAIL: male patient, examiner absent in main scenes, long embedded copy, explicit 60° text, red overlay.

### Candidate 3
- gen_id: `b5857649-e764-49b5-903a-613fb0b00cef`
- source: `/mnt/data/a_clean_clinical_instructional_infographic_collage.png`
- dimensions: 1024×1536
- SHA-256: `1846c9515cd8941a0bc5c3b503fca555805ff9f5146b4fb643e4d8951dada062`
- FAIL: male patient, long copy, red overlay, examiner not consistently present across panels.

### Candidate 4
- gen_id: `67a9abcc-9800-4e2f-9faf-b3d512d1afc8`
- source: `/mnt/data/a_large_instructional_medical_infographic_poster_i.png`
- dimensions: 1024×1536
- SHA-256: `f58bae585b9063b9664b328cf58b35b63f2a71914e1ffb639e917b53fc78f271`
- FAIL: male patient, examiner absent from main scenes, infographic copy, explicit 60° text.

None of these four attempts was connected to `preview_candidate`, and none should be presented to the user as a valid review candidate.

## Root-cause mitigation completed

`scripts/build-physical-exam-realistic-prompt.mjs` now exports `buildPhysicalExamImageOnlyPrompt()`.

This visual-only payload intentionally omits the textbook diagnostic prose and instead carries only:
- panel structure;
- patient setup;
- active maneuver;
- visual finding;
- overlay constraints;
- hard text limit;
- high-resolution output requirement;
- locked casting.

Regression QA verifies that the ct086 image-only payload:
- excludes clinical interpretation prose;
- carries female/female casting;
- forbids infographic copy and degree symbols.

## Next required action

Generate a fresh Candidate 5 using the image-only visual payload.  
Do not connect any candidate to Preview unless all frozen acceptance axes pass.  
Do not advance to ct087 before ct086 has a valid connected candidate.  
Do not touch ct088 Hoffmann; it remains deferred.

## Candidate 5 structured generation contract — 2026-10-07

Candidate 5 is not generated/connected yet.

The previous prose-heavy image prompt is no longer the accepted generation path for ct086. The registry now carries machine-readable contract:

- `generation_brief.image_render_contract.contract_version = 2026-10-07-ct086-v2`
- `required_render_mode = IMAGE_ONLY_STRUCTURED_CONTRACT`
- portrait minimum 1024×1536
- female patient + female examiner
- same identities across all panels
- examiner visible in every panel
- active cervical rotation only
- trunk and shoulders fixed
- exactly three allowed Korean headers
- no numeric angle/cutoff or degree symbol
- no red pain overlay
- no infographic copy

New gates:
1. `scripts/physical-exam-candidate-preflight.mjs` — evaluates the human visual audit against the structured contract.
2. `scripts/physical-exam-preview-connect.mjs` — refuses registry Preview connection unless the visual preflight passes and binary identity metadata are valid.
3. Both QA scripts are wired into Global QA.

The detailed ct086 clinical interpretation was expanded to textbook prose and remains in app HTML only. It now cites the 2026 independent cervical radiculopathy cluster validation, the 2026 systematic review/meta-analysis, and CROM/active-ROM measurement reliability reviews. The runtime now exposes test `evidence_refs` as clickable source links in a dedicated **근거** section.

Next required action remains: generate a fresh Candidate 5 using only the structured image-only render contract, perform visual audit, save the exact HD binary, verify SHA-256/Git blob identity, and connect it through the guarded Preview connector. Do not advance to ct087 before this succeeds.
