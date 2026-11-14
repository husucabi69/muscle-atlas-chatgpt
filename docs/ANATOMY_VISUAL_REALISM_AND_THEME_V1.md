# LYSOS Anatomy Visual Realism & Dual Light Theme — implementation contract
Date: 2026-11-15 KST
Branch: preview/development
Status: APPROVED REQUIREMENTS / IMPLEMENTATION PENDING

## User decision
- Preserve the current brand-colored light appearance as **Light**.
- Add a white-dominant **White** appearance, default preference White.
- Both modes retain the same clinical content, stable IDs, routing, PWA/offline behavior, and accessibility.
- No cartoon, schematic, toy-like or oversimplified anatomy is acceptable as a final 2D/3D/layer/motion deliverable.
- Clinical realism means anatomically faithful **medical illustration**, not an unverified AI image presented as a real patient or validated anatomy.
- No unreviewed visual candidates promoted into canonical medical content.

## Theme architecture
- CSS semantic tokens for page, panel, border, text, muted, action, focus, selection, depth and anatomical canvas.
- html[data-lys-theme="white"|"light"] scoped token overrides; no broad replacement of legacy CSS without regression audit.
- Preference persisted locally, with a safe fallback; preserve contrast and Android PWA viewport.
- A visible accessible theme selector; do not change navigation, learning records, source material or Service Worker caches without versioned QA.
- Initial White palette: #FFFFFF canvas, #F6F8FA panel, #DCE3EA border, #172534 text, #516273 muted, #245B82 accent. Exact final palette subject to Preview visual approval.
- Light must be sampled from the actual existing app, not approximated from a mockup.

## Canonical visual pipeline — mandatory
ANATOMY-KNOWLEDGE-001 -> IP-EVIDENCE-001 -> ANATOMY-MASTER-3D-001 -> ANATOMY-IP-2D-001 -> ANATOMY-3D-VIEWER-001 -> ANATOMY-LAYER-001 -> MOTION-ANIM-001 -> CROS filing gates.
First muscle: Splenius capitis (두판상근). Pilot region: cervical/scapular, then five additional named muscles in existing contract.
Single editable 3D master drives high-resolution 2D plates, rotation, real geometric layer transparency and skeletal/muscle rig animation. Separate AI stills are not a substitute for a consistent model.
Anatomical QA: origin/insertion/course, attachments, neurovascular adjacency, depth ordering, laterality, function/rotation direction, joint pivots, distortion and labels.
Rendering QA: detailed musculotendinous geometry, realistic fiber orientation and surface/material shading, bone landmarks, consistent lighting, non-cartoon proportions; 2D expert and learner plate remain anatomically accurate.
Clinical review and user visual approval required before publication.

## Safety, IP and deployment gates
- No tracing/near-copy of Claude/Netter/Gray/Thieme plates. Reference facts only.
- No unlicensed meshes, unreviewed AI raw output or falsely claimed human copyright.
- Record human creative decisions, editable master, hashes, revisions, AI tools and references during production.
- Runway prohibited; no paid substitute without user approval.
- Claude second-edition import HOLD, ct086 candidate unapproved, ct088 HOLD.
- Keep Production/main frozen. Implement on preview/development only after full ROADMAP-FIRST review and focused CI; require Galaxy/PC real-device QA and explicit promotion approval.
- CROS COPYRIGHT-GATE-0 through 5 retained.

## Immediate implementation sequence
1. Audit current CSS specificity, theme tokens, header controls, manifest and cache strategy.
2. Implement accessible White/Light switch in Preview with non-destructive defaults and storage.
3. Run CSS, navigation, mobile width, PWA offline/update and visual regression checks; user reviews Galaxy.
4. Build Splenius capitis fact specification + evidence ledger, then editable 3D master.
5. Derive high-resolution 2D plate, then viewer, layer and motion with separate review gates.

This document is a requirement lock, **not** evidence of implemented themes or completed medical illustration.
