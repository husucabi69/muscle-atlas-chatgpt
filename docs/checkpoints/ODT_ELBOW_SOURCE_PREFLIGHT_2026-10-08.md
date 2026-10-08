# ODT Elbow Source Preflight — 2026-10-08

Status: **SOURCE VERIFIED / NATIVE MIGRATION NOT STARTED**

Purpose: lock the next two Disease/Trauma source files before native migration so later work does not re-identify or confuse source artifacts.

## odt003 — Elbow Disease

- source filename: `클로드_질환외상_03권_팔꿈치_질환.html`
- archive path: `1_강의페이지/03_질환외상/클로드_질환외상_03권_팔꿈치_질환.html`
- source bytes: **398,420**
- SHA-256: `641f9fbb92a5a725793fdab2f0584380901653fc76724c718d23a306b5c27d33`
- source sections: **12** (0–11)
- source img tags: **6**
- Wikimedia source links: **6**
- source contains Claude audio runtime reference: **yes** (`/_blob` 1, artifact link present)
- native policy: do not migrate the Claude runtime URL/audio blob; preserve audio as fail-closed pending unless independent media bytes are available.

Chapter inventory:
0. big picture / ROM / red flags
1. lateral epicondylitis
2. medial epicondylitis
3. cubital tunnel syndrome
4. radial tunnel / PIN
5. olecranon bursitis
6. elbow arthritis / stiffness
7. pediatric & throwing elbow
8. distal biceps / median nerve
9. infection / crystal / tumor / referred pain
10. outpatient workflow
11. references

## odt004 — Elbow Trauma

- source filename: `클로드_질환외상_04권_팔꿈치_외상.html`
- archive path: `1_강의페이지/03_질환외상/클로드_질환외상_04권_팔꿈치_외상.html`
- source bytes: **572,507**
- SHA-256: `026934ff318c8a74f2f155fdc3ded997a440bd1b17913d5096933e332bee0bff`
- source sections: **11** (0–10)
- source img tags: **6**
- Wikimedia source links: **6**
- source contains Claude audio runtime reference: **yes** (`/_blob` 1, artifact link present)
- native policy: same fail-closed audio and provenance rules as odt001/odt002.

Chapter inventory:
0. big picture / neurovascular / fat pad / child-vs-adult
1. simple elbow dislocation
2. terrible triad / complex instability
3. radial head fracture
4. olecranon fracture
5. adult distal humerus fracture
6. distal biceps rupture
7. pediatric elbow trauma
8. rare dangerous injury / complications
9. outpatient workflow
10. references

## Migration gate

Before either source becomes `NATIVE_PREVIEW`:
1. re-check source SHA/bytes against this checkpoint;
2. structure chapters without Claude Artifact/iframe/`/_blob` runtime dependency;
3. preserve source image provenance/license but do not promote embedded base64 images as canonical assets;
4. refresh treatment-sensitive claims against current guideline/systematic-review evidence;
5. connect only to existing valid Stable IDs;
6. pass `scripts/disease-trauma-native-qa.mjs`, Global QA, Runtime E2E, and exact-SHA Cloudflare Preview.
