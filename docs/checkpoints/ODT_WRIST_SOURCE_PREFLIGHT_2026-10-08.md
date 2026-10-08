# ODT Wrist Source Preflight — 2026-10-08

Status: **SOURCE VERIFIED / NATIVE MIGRATION NOT STARTED**

Purpose: lock the next Disease/Trauma source pair before native migration.

## odt005 — Wrist Disease

- source filename: `클로드_질환외상_05권_손목_질환.html`
- archive path: `1_강의페이지/03_질환외상/클로드_질환외상_05권_손목_질환.html`
- source bytes: **508,096**
- SHA-256: `2c75d909bbbb671ea4e3017a7d5557beb68521a041f50f8867d6c3a7a319479d`
- source sections: **11** (0–10)
- source img tags: **6**
- source numbered figures: **8** (includes 2 Claude-authored schematics)
- source references: **8 verified papers + textbook standard block**
- source contains Claude Artifact/audio runtime dependency: **yes** (the same Artifact target appears in multiple HTML link/text forms; `/_blob` audio runtime reference present)
- native policy: do not migrate Claude Artifact or `/_blob`; audio stays fail-closed until independent media bytes exist.

Chapter inventory:
0. pain map — radial/ulnar/dorsal/volar wrist
1. carpal tunnel syndrome
2. de Quervain tenosynovitis
3. ganglion cyst
4. ulnar wrist pain — TFCC / ulnar impaction
5. Kienböck disease
6. wrist arthritis
7. other tendon disorders
8. infection / crystal / tumor / referred pain
9. outpatient workflow
10. references

Important figure provenance:
- Fig 1 carpal tunnel cross-section — Wikimedia Commons / OpenStax / CC BY 3.0
- Fig 2 sensory-distribution schematic — Claude-authored, human-redraw required before canonical own asset
- Fig 3 thenar atrophy — Wikimedia Commons / attribution
- Fig 4 Finkelstein variant — Wikimedia Commons / public domain
- Fig 5 dorsal ganglion — Wikimedia Commons / CC BY-SA 3.0
- Fig 6 ulnar variance schematic — Claude-authored, human-redraw required before canonical own asset
- Fig 7 Kienböck X-ray — Wikimedia Commons / CC BY-SA 4.0
- Fig 8 SLAC progression — Wikimedia Commons; exact license/source-page metadata must be re-extracted during migration before promotion.

## odt006 — Wrist Trauma

- source filename: `클로드_질환외상_06권_손목_외상.html`
- archive path: `1_강의페이지/03_질환외상/클로드_질환외상_06권_손목_외상.html`
- source bytes: **592,858**
- SHA-256: `f420b236d54e47a32275f888da9db62afa9ad705357ebe978ee75db825ff001d`
- source sections: **11** (0–10)
- source img tags: **6**
- source numbered figures: **6** (includes 1 Claude-authored alignment schematic and paired source images in Fig 5)
- source references: **7 verified papers + textbook standard block**
- source contains Claude Artifact/audio runtime dependency: **yes** (the same Artifact target appears in multiple HTML link/text forms; `/_blob` audio runtime reference present)
- native policy: same fail-closed audio and provenance rules as odt001–odt004.

Chapter inventory:
0. age / three-view X-ray / median nerve
1. distal radius fracture
2. scaphoid fracture
3. scapholunate ligament injury
4. perilunate dislocation
5. TFCC tear / DRUJ instability
6. other carpal fractures
7. pediatric wrist trauma
8. rare dangerous injury / complications
9. outpatient workflow
10. references

Treatment-sensitive evidence-refresh targets for migration:
- distal radius fracture: age/function-based operative thresholds and current distal-radius guideline evidence;
- scaphoid waist fracture: SWIFFT-era surgery-versus-cast evidence;
- pediatric torus fracture: FORCE trial / minimal immobilization;
- perilunate dislocation: emergency reduction + median-nerve risk;
- acute carpal tunnel syndrome and compartment-risk pathways.

## Migration gate

Before either source becomes `NATIVE_PREVIEW`:
1. re-check source SHA/bytes against this checkpoint;
2. structure chapters without Claude Artifact/iframe/`/_blob` dependency;
3. preserve source image provenance/license; do not promote embedded/base64 source images as canonical assets;
4. perform selective evidence refresh for treatment-sensitive claims and keep remaining topics canonical-review-pending;
5. connect only to existing valid Stable IDs;
6. pass `scripts/disease-trauma-native-qa.mjs`, Global QA, Runtime E2E, and exact-SHA Cloudflare Preview.

## Existing Stable-ID cross-link map

Use these existing IDs during odt005/006 migration; do not invent a new ID merely to make a link.

### Disease-side direct links

- Carpal tunnel syndrome: `d029`; Physical Examination `ct024 Phalen`, `ct025 carpal Tinel`, `ct026 Durkan`; Ultrasound `usv022 median nerve SAX`, `usv023 median nerve longitudinal/dynamic`.
- De Quervain: `d027`; Physical Examination `ct022 True Finkelstein`, `ct023 WHAT`; Ultrasound `usv018 first/second extensor compartments`; relevant muscles `m098 APL`, `m099 EPB`.
- TFCC/DRUJ: `d032`; Physical Examination `ct030 ulnar fovea`, `ct031 DRUJ ballottement`; Ultrasound `usv021 TFCC`.
- ECU tendinopathy/instability: `d033`; Physical Examination `ct032 ECU synergy`; Ultrasound `usv019 3rd–6th extensor compartments`; muscle `m096 ECU`.
- FCR tendinopathy: `d034`; muscle `m084 FCR`.
- Scapholunate ligament injury: `d037`; Physical Examination `ct035 Watson`; Ultrasound `usv020 scapholunate ligament`.
- Guyon canal neuropathy: `d030`; Physical Examination `ct027–ct029`; Ultrasound `usv024`.
- Thumb CMC OA: `d035`; Physical Examination `ct033–ct034`.
- Trigger digit: `d036`; Ultrasound `usv025–usv028`.

### Trauma-side ID gaps to preserve

The current canonical wrist/hand diagnosis registry does **not** contain dedicated diagnosis concept IDs for:
- distal radius fracture,
- scaphoid fracture,
- perilunate dislocation,
- most other carpal fractures,
- pediatric torus/growth-plate fractures,
- acute traumatic carpal tunnel syndrome as a separate concept.

Do not alias these fractures to an unrelated existing diagnosis concept just to create a link. During odt006 migration:
1. use valid examination/ultrasound cross-links where clinically applicable;
2. leave diagnosis link absent when no matching Stable ID exists;
3. if a dedicated diagnosis concept is later required, add it through the canonical diagnosis registry workflow and global integrity gate first.
