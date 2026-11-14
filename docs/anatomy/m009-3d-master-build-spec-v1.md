# m009 Splenius capitis — 3D master build specification v0.1
Status: PRE-MODEL ENGINEERING SPEC / NO CLINICAL MODEL APPROVED
Branch: preview/development
Stable ID: m009
Date: 2026-11-15 KST

## Input integrity
- Canonical source: data/muscles-v1.json, `m009`.
- IP provenance: data/ip-asset-registry-v1.json.
- Read-only gate: `node scripts/m009-pre-model-gate.mjs`.
- Dataset presently has **183** entries, not the 205 previously assumed; do not claim 205 validated records.
- `m009.mmt` has elbow-extension wording. It is flagged and must not be reproduced in clinical content or 3D motion instructions until specialist correction.

## Spatial convention and anatomical coordinate system
- World coordinates: meters; +X patient left, +Y cranial, +Z anterior. Posterior view camera looks toward +Z; display orientation must be checked on actual renderer.
- Neutral anatomical reference pose; skull and C1–T4 osseous landmarks are mandatory, not optional approximations.
- Left and right are patient anatomical laterality, never screen left/right.
- All anchors defined relative to named, independently reviewed bone surface regions; avoid guessed numeric coordinates.
- Skull/cervical motion parent transforms and muscle deformation are separate; model must not translate the mastoid attachment independently from skull motion.

## Scene graph (design, not an implemented mesh)
```
m009_scene
  anatomy_reference
    occipital_bone
    temporal_bone_left / temporal_bone_right
    cervical_vertebrae_C1_C7
    thoracic_vertebrae_T1_T4
    nuchal_ligament
  muscles
    m009_left
      origin_aponeurosis_left
      muscle_belly_left
      insertion_tendon_left
    m009_right
      origin_aponeurosis_right
      muscle_belly_right
      insertion_tendon_right
  context
    trapezius
    sternocleidomastoid
    semispinalis_capitis
  annotations
    m009_origin_region_left/right
    m009_insertion_region_left/right
    laterality_marker
  rig
    skull_neck_pivot
    cervical_motion_chain
    m009_left_deformation
    m009_right_deformation
```

## Shape and depth constraints
1. Muscle belly is a tapered oblique musculotendinous sheet, not a cylinder or straight ribbon.
2. Fibers run from lower posterior midline superolaterally to the ipsilateral mastoid/superior nuchal line attachment.
3. The two sides must be independently addressable and mirror only where anatomical symmetry is appropriate.
4. Depth relations vary by location: do not hardcode a single global layer index for every neighboring muscle.
5. Preserve attachment regions through rotation and rig motion; avoid intersection with skull and vertebral bone surfaces.
6. Explicitly record which surfaces were independently modeled, imported under license, or left absent.

## Model authoring acceptance gates
- G0: independent O/I/F/N source verification, canonical ID and specialist review.
- G1: original editable bone/landmark meshes; measured or evidence-backed proportions and coordinates.
- G2: original left/right muscle geometry, fiber course, tendon attachments and realistic surface materials.
- G3: reviewer-approved topology and layer relationships, no unlicensed third-party mesh.
- G4: exported GLB/glTF plus SHA-256 and matching editable source SHA-256.
- G5: actual 360-degree viewer, mobile touch, depth opacity, derived 2D and motion QA.
- G6: human creative contributions, camera/composition/material choices and user approval logged.

**No fabricated geometry or stock anatomy images are allowed to pass G1–G6.** This file is an executable-development target specification, not a completed 3D asset.

## Human decisions required before filing
- User approved the planned designation of human author/editor, but actual creative decisions must be logged when made.
- Legal name and individual/corporate rights owner remain pending.
- CROS submission requires finished human-authored asset and evidence; no filing has occurred.
