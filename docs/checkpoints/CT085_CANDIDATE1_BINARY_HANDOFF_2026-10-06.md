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
State: BINARY_HANDOFF_BLOCKED

The generated candidate passed internal content/pose/text review, but the exact binary has not yet been materialized into the repository. Therefore:
1. do not regenerate ct085;
2. do not create a false Preview path;
3. do not advance to ct086/ct087;
4. recover the exact Candidate 1 binary first;
5. SHA-verify the recovered bytes;
6. connect the verified derivative as ct085 preview_candidate;
7. run full QA and then request user Preview approval.
