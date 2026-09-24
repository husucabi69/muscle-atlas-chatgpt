# DEVELOPMENT PRINCIPLES

- Source of truth: this GitHub repository.
- Deploy: GitHub Pages from main/root.
- PWA updates: bump service-worker cache on meaningful releases.
- Data-first architecture: anatomy/symptom/quiz/media data should be reusable independently from UI.
- Future integration target: LYS OrthoOS AI-EMR.
- Privacy boundary: patient/PHI data remains in OrthoOS; this repository contains general medical knowledge only.
- Stable identifiers: keep existing muscle IDs and introduce stable IDs for symptoms, nerves, regions and media.
- Medical content: distinguish established anatomy from clinical interpretation; verify high-risk procedural content before release.
- Imaging: real ultrasound only; do not fabricate substitute images.
- Licensing: keep source/license metadata for externally sourced anatomy and ultrasound assets.
- Update workflow: edit -> regression check -> deploy -> verify Pages -> installed PWA receives update.
