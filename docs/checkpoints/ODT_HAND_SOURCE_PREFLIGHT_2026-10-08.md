# ODT Hand Source Preflight — 2026-10-08

Status: **SOURCE VERIFIED / NATIVE MIGRATION NOT STARTED**

Purpose: lock the next Disease/Trauma source pair before native migration.

## odt007 — Hand Disease

- source filename: `클로드_질환외상_07권_손_질환.html`
- archive path: `1_강의페이지/03_질환외상/클로드_질환외상_07권_손_질환.html`
- source bytes: **809,708**
- SHA-256: `405d2638444c83b174900907949957a90dc38cae587c6949748e0bfb37cf86dd`
- source sections: **10** (0–9)
- source img tags: **7**
- source direct DOI references: **8**
- Claude Artifact runtime reference present; `/_blob` audio reference present.
- native policy: no Claude Artifact/iframe/`/_blob` dependency; audio remains fail-closed until independent media bytes exist.

Chapter inventory:
0. big picture — triggering / stiffness / swelling / mass
1. trigger finger
2. thumb CMC osteoarthritis
3. hand osteoarthritis
4. Dupuytren contracture
5. hand infection
6. hand tumors
7. systemic disease in the hand
8. outpatient workflow
9. references

Source-image provenance:
- Trigger finger photograph — Wikimedia Commons, RCraig09, CC BY-SA 4.0.
- Thumb CMC OA X-ray — Wikimedia Commons, Jmarchn, CC BY-SA 3.0.
- Heberden nodes — Wikimedia Commons, PhilipPirrip, CC BY 4.0.
- Myxoid cyst — Wikimedia Commons, CC BY-SA 3.0; author field blank in source HTML, so author/license page must be rechecked before promotion.
- Dupuytren contracture — Wikimedia Commons, MikkTooming, CC BY-SA 4.0.
- Acute paronychia — Wikimedia Commons, Mohammad2018, CC BY-SA 4.0.
- Rheumatoid arthritis hand deformity — Wikimedia Commons, source-author string in HTML, CC0.
- No embedded/base64 source image may be promoted to canonical app art without the existing HD/IP gate.

Source DOI set:
- `10.5435/00124635-200703000-00006`
- `10.2106/00004623-200407000-00013`
- `10.1136/ard.2003.015438`
- `10.1002/14651858.CD004631.pub4`
- `10.7326/M17-1430`
- `10.1016/S0140-6736(19)32489-4`
- `10.1056/NEJMoa0810866`
- `10.1097/PRS.0b013e31823aea95`

## odt008 — Hand Trauma

- source filename: `클로드_질환외상_08권_손_외상.html`
- archive path: `1_강의페이지/03_질환외상/클로드_질환외상_08권_손_외상.html`
- source bytes: **666,191**
- SHA-256: `6fc0e3cf590547cee0316efe9f50a3fa068ff0b8eeac6a3046cb1ef0536989bd`
- source sections: **12** (0–11)
- source img tags: **8**
- source direct DOI references: **3** plus textbook-standard block
- Claude Artifact runtime reference present; `/_blob` audio reference present.
- native policy: same fail-closed audio and provenance rules as odt001–odt006.

Chapter inventory:
0. big picture — rotation / tenodesis / true lateral
1. mallet finger
2. central slip injury / boutonniere
3. PIP dislocation / volar plate injury
4. jersey finger / FDP avulsion
5. thumb UCL injury / skier's thumb
6. metacarpal fracture
7. phalanx fracture / pediatric digit fracture
8. flexor and extensor tendon injury
9. fingertip / nail bed / high-pressure injection
10. outpatient workflow
11. references

Source-image provenance:
- Mallet Finger Injury — Wikimedia Commons, Clappstar, CC BY-SA 4.0.
- Mallet finger mechanism — Wikimedia Commons, original Davplast/adapted HLHJ, CC BY-SA 4.0.
- Mallet finger with fracture fragment — Wikimedia Commons, Bobjgalindo, CC BY-SA 4.0.
- Boutonnière deformity — Wikimedia Commons, Alborz Fallah, CC BY-SA 3.0.
- Skier's thumb — Wikimedia Commons, Fluffy89502, CC BY-SA 4.0.
- Fifth metacarpal neck fracture — Wikimedia Commons, Hellerhoff, CC BY-SA 4.0.
- Bennett fracture — Wikimedia Commons, Pavel Ševela, CC BY-SA 4.0.
- Subungual hematoma — Wikimedia Commons, Callaleo, CC BY-SA 4.0.

Source DOI set:
- `10.1016/j.apmr.2010.10.035`
- `10.1177/1753193414560119`
- `10.1053/jhsu.1999.1166`

## Existing Stable-ID cross-link map

Directly reusable disease-side IDs:
- Trigger finger / trigger thumb: `d036`; ultrasound `usv025–usv028`.
- Thumb CMC OA: `d035`; examination `ct033 CMC grind`, `ct034 pressure-shear`.
- Digital collateral ligament injury: `d038`; ultrasound `usv029`.
- Hand intrinsic muscles available as `m102–m122` for anatomy cross-links where clinically appropriate.

Canonical gaps that must **not** be aliased to an unrelated diagnosis merely to create a link:
- hand osteoarthritis outside thumb CMC,
- Dupuytren contracture,
- hand infection / pyogenic flexor tenosynovitis,
- hand tumors,
- mallet finger,
- central slip injury / boutonniere,
- PIP dislocation / volar-plate injury,
- jersey finger,
- thumb UCL injury as its own diagnosis concept,
- metacarpal / phalanx / pediatric fractures,
- flexor/extensor tendon laceration,
- fingertip/nail-bed injury,
- high-pressure injection injury.

If a dedicated diagnosis concept becomes necessary, create it through the canonical diagnosis registry workflow first rather than overloading `d038` or another near-match.

## Selective evidence-refresh preflight

These are migration targets, not proof that odt007/008 is fully canonical-reviewed.

- Trigger finger — 2026 systematic review, PMID 41352303:
  - corticosteroid injection remains a major first-line option, but steroid type/dose evidence is heterogeneous and should not be reduced to one universal injection recipe.
- Thumb CMC osteoarthritis — 2024 network meta-analysis, PMID 39560669:
  - multimodal care/hand exercise had important short-term pain benefit; rigid CMC-MCP splint showed medium-term pain/function benefit.
  - do not present injection or surgery as automatic first-line therapy.
- Dupuytren disease — 2025 individual-patient-data meta-analysis, PMID 40391547:
  - limited fasciectomy, needle fasciotomy and collagenase all correct contracture; recurrence occurs earlier after PNF/CCH than limited fasciectomy, while treatment morbidity differs.
  - 2024/2025 reviews note substantial bias/heterogeneity in comparative CCH-vs-PNF RCT evidence.
- Mallet finger — systematic review/meta-analysis, PMID 36625383:
  - no high-level evidence shows surgery is universally superior to orthosis; instability/subluxation/large fragment and compliance still matter.
- Thumb UCL injury — 2025 systematic review/meta-analysis, PMID 40327019:
  - surgical outcomes are generally favorable; acute repairable lesions and chronic irreparable reconstructions are different populations, and an exact universal time cutoff for surgery is not established.
- Hand infection/high-pressure injection:
  - migration must retain emergency red-flag logic and avoid false reassurance from small wounds; full canonical review remains mandatory because time-to-debridement/antibiotic details are treatment-sensitive.

## Migration gate

Before odt007 or odt008 becomes `NATIVE_PREVIEW`:
1. re-check source SHA/bytes against this checkpoint;
2. preserve all source chapters but rewrite treatment-sensitive claims against current evidence;
3. preserve figure provenance/license and keep non-own images source-link-only;
4. connect only to valid existing Stable IDs and explicitly preserve diagnosis-ID gaps;
5. keep audio fail-closed;
6. pass `scripts/disease-trauma-native-qa.mjs`, Global QA, Runtime E2E, exact-SHA Cloudflare Preview and Production-freeze checks.
