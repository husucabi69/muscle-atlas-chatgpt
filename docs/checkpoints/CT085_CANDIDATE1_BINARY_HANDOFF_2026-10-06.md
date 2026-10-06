# CT085 Candidate 1 binary handoff checkpoint — 2026-10-06

Stable ID: ct085
Test: Shoulder abduction relief test
Generation brief version: 2026-10-06-ct085-v1
Candidate: 1
Candidate gen_id: 6582ec89-607d-4ce7-bd9a-f7358f9683ff

## Internal review
- clinical_content: PASS
- visual_pose: PASS
- examiner_hand_position: PASS
- force_direction: PASS
- embedded_text: PASS
- user_preview: PENDING

Clinical lock:
- classic active shoulder-abduction relief sign;
- patient actively places the same symptomatic hand/forearm overhead;
- examiner does not passively force elevation;
- familiar radicular arm symptom overlay decreases;
- do not substitute the 2026 modified passive shoulder abduction test.

## Exact source receipt
- source_session_path: /mnt/data/a_vertical_triptych_comic_style_instructional_medi.png
- source_dimensions: 1024x1536
- source_png_sha256: 0990827c298c5c7471a74e0159700ba820059ad9c953b6855efcae2a4d871a1e
- local_preview_path: /mnt/data/ct085-shoulder-abduction-relief-gen-6582ec89-preview.webp
- local_preview_dimensions: 600x900
- local_preview_bytes: 71776
- local_preview_webp_sha256: 05a46466fdc930d2f70d44e1db8ab4bd6e18130296e9a91b2193cbd65fd71cce

## Gate
State: MATERIALIZED_VERIFIED_PREVIEW_CONNECTED

The generated candidate passed internal content/pose/text review and its exact derivative is now materialized in the repository.

Repository Preview derivative:
- path: `./assets/physical-exam-realistic/candidates/ct085-shoulder-abduction-relief-gen-6582ec89-preview.webp`
- dimensions: 320x480
- bytes: 19,100
- SHA-256: `3b52e18a9c9e9a1fe1a9e4ab0d4804b43c35f0209fb2d25e4915832645bd04fb`
- Git blob SHA: `7553121c0c06d6a5dd5536cf057d93a164af16c1`

Current gate:
1. do not regenerate ct085;
2. keep Stable-ID schematic fallback visible;
3. user Preview approval remains required;
4. do not promote ct085 to canonical APPROVED without explicit user approval;
5. ct086 is the next generation-ready item for the next task.
