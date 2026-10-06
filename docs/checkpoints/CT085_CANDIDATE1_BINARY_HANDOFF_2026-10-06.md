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

The generated candidate passed internal content/pose/text review and the repository Preview derivative is now byte-verified and materialized.

Repository Preview derivative:
- path: `./assets/physical-exam-realistic/candidates/ct085-shoulder-abduction-relief-gen-6582ec89-preview.webp`
- dimensions: 240x360
- bytes: 9,936
- SHA-256: `83c67093c1573746655b6921bf109b62ed16473422f7fac19168cfb70a1cb46e`
- Git blob SHA-1: `95624edb2711997d3bcbff4759402d9cc6d8c3c4`
- local Git blob SHA-1 matched the GitHub-created blob SHA before tree insertion.

Current gate:
1. do not regenerate ct085;
2. keep the Stable-ID schematic fallback visible;
3. user Preview approval remains required;
4. do not promote ct085 to canonical APPROVED without explicit user approval;
5. ct086 is the next generation-ready item after this review handoff.
