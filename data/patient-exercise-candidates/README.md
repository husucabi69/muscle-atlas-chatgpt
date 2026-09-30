# Stage 23B realistic exercise candidate checkpoints

This directory stores recoverable candidate metadata before a generated image binary is materialized into the repository.

Rules:
- The canonical movement contract remains `data/patient-exercise-realistic-assets-v1.json` (`generation_brief`).
- A sidecar with `CANDIDATE_GENERATED` is **not** approval and must not populate `composite_url`.
- Promotion requires repository WebP materialization, three-axis review (`clinical_content`, `visual_pose`, `embedded_text`), mobile Preview, and A4/print review.
- Rejected `gen_id` values in the canonical registry must never be revived.
- Production/main remains frozen until explicit user approval.

Current queue after px007 candidate checkpoint:
1. Materialize/review px007 when binary transfer is available.
2. Generate px008 from its locked hip-abduction brief; do not reuse rejected `f3e1b777-ec4c-4018-b702-77f61a0d4cda`.
3. Generate corrected px009 squat; never use an absolute knee-behind-toes rule and do not invent dose/depth numbers.
4. Generate px010 bridge from canonical `side_supine` brief; curated render text must not override canonical view/start/end/motion/support.
5. Continue px011→px018 in Stable-ID order.
