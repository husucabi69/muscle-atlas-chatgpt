# ANATOMY-KNOWLEDGE-001 — 두판상근 (Splenius capitis)
Status: DRAFT / SPECIALIST REVIEW REQUIRED / NOT AN APPROVED MODEL
Date: 2026-11-15 KST
Parent: docs/ANATOMY_IP_3D_MOTION_CONTRACT.md
Stable ID: **m009** — verified against `data/muscles-v1.json` on `preview/development` (2026-11-15).

## 1. Anatomical facts — provisional, cross-reference required
- Korean: 두판상근; Latin: musculus splenius capitis; English: splenius capitis.
- Region: posterior cervical musculature; deep to trapezius and sternocleidomastoid in relevant portions, superficial to deeper intrinsic cervical muscles.
- Origin (typical): inferior half of ligamentum nuchae and spinous processes of approximately C7–T3/T4, with variation across references.
- Insertion (typical): mastoid process of temporal bone and lateral part of superior nuchal line of occipital bone.
- Fiber direction: superolateral from lower posterior midline to ipsilateral posterolateral skull; broad oblique muscle sheet.
- Innervation: posterior (dorsal) rami of cervical spinal nerves (segmental attribution requires verification).
- Blood supply: regional branches including occipital and deep cervical arteries; confirm exact anatomy and relevant variations.
- Bilateral action: extend head and cervical spine.
- Unilateral action: rotate and laterally flex head/neck to the same side; do not invert left/right in animation.
- Variants: origin extent, aponeurotic attachments and muscular blending require specialist review; do not present an arbitrary mesh as normal variation.
- Clinical caution: movement is synergistic and not an isolated pure single-joint action; animation should not imply a precise normal ROM.

## 2. Modeling anatomy contract
- First establish actual skull, mastoid, occipital superior nuchal line, cervical/thoracic spinous landmarks and ligamentum nuchae; no floating attachments.
- Separate left/right muscle volumes, tendinous/aponeurotic areas and correct superolateral fiber direction.
- Include depth context: trapezius and sternocleidomastoid where relevant; semispinalis capitis and adjacent posterior cervical muscles; verify intersections rather than assuming fixed layer order across the whole neck.
- Anchors: origin region and insertion region, not single arbitrary points. Coordinate convention, physical scale and neutral pose must be explicitly specified before mesh construction.
- Motion: bilateral extension; left-only ipsilateral left rotation/lateral flexion; right-only ipsilateral right rotation/lateral flexion. Anatomical axes and rig pivots need specialist validation.
- 2D, 3D, transparency and motion must all derive from one editable master. No AI still or placeholder geometry may be labeled finished clinical illustration.

## 3. Independent verification matrix (all pending)
| Check | Required evidence | State |
| --- | --- | --- |
| O/I attachments | At least two independently checked authoritative anatomy references | PENDING |
| Fiber course and depth | Cross-sectional/dissection-based factual references | PENDING |
| Dorsal rami and vascular adjacency | Anatomical references, level-specific uncertainty documented | PENDING |
| Bilateral and unilateral actions | Functional anatomy references | PENDING |
| Canonical Stable ID and O/I/F/N source | `data/muscles-v1.json` entry `m009` located and transcribed; external verification remains outstanding | PARTIAL |
| Human clinical review | Orthopedic specialist recorded sign-off | PENDING |
| Human modeling authorship | Editable model, decisions and revision history | PENDING |

Reference candidates for *fact checking*, not copied illustrations: standard clinical anatomy texts and peer-reviewed anatomical literature. Exact edition/page/URL and independently checked claims must be added before the clinical gate. No source was independently verified in this document.

## 3A. Canonical data reconciliation — 2026-11-15
Existing `data/muscles-v1.json` entry `m009`:
- Origin: 항인대 하반, C7-T3/4 극돌기.
- Insertion: 유양돌기, 상항선 외측 1/3.
- Function: 양측 신전; 편측 동측 회전·측굴.
- Nerve: 경신경 후지(주로 C3-C4), **level-specific attribution unverified**.
- Blood: 상행경동맥·심경동맥·후두/척추동맥의 근육가지 — **vessel naming and attribution require independent clinical review before reuse**.
- **Existing MMT field contains an apparent copy/paste error:** "주관절의 주신전 방향에 반대 저항" describes elbow extension, not cervical muscle testing. This is a documented clinical-content defect; do not use it to build motion or examination guidance. Existing production data is left unchanged pending review.
- Existing anatomy media for `m009` is a third-party historical illustration; it must not be used as the texture, tracing basis or original 3D IP master.
- Exact references and anatomical review remain pending. This is reconciliation, **not** clinical approval.

## 4. Acceptance criteria for first editable 3D master
1. Reproducible source project plus glTF/GLB export, same anatomy and stable ID.
2. Independently created bone/muscle topology with no unknown-license mesh.
3. O/I attachments and left/right/depth pass specialist review.
4. Full 360-degree rotation without floating anchors, penetration or misleading distortion.
5. High-resolution 2D plate and layered opacity derived from this master.
6. Motion direction, origin/insertion, camera and labels reviewed on Galaxy and PC.
7. Hashes, source provenance, author/editor and human creative decisions recorded during creation.

## 5. Current blocker and next action
Do not start clinical-quality mesh modeling until canonical Stable ID, independently verified references and human-review checkpoints are established. A generic parametric ribbon is insufficient to meet the user-approved photorealistic quality gate.
