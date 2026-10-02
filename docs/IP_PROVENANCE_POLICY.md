# Muscle Atlas IP / Copyright Provenance Policy

Status: CANONICAL SUPPORT POLICY  
Effective: 2026-10-02  
Scope: future self-produced 2D anatomy, 3D anatomy, layered/transparency assets, muscle-action animations, and related original software/UI assets.

## 1. Purpose

This repository must preserve enough provenance to show how a final original asset was created, who made the human creative decisions, what AI assistance was used, what external references or third-party assets were involved, and which exact binary/version is the final work.

This is an internal evidence ledger. It is not a government copyright registration form and does not by itself create or guarantee copyright.

## 2. Human-directed AI-assisted rule

For an asset intended to be treated as an original project work:

- a human creator must make the material creative decisions;
- anatomy, camera/view, composition, layer visibility, color/material, pose, motion, timing, educational emphasis, corrections, selection, editing, and final approval should be documented as applicable;
- AI may assist generation or transformation, but AI output alone must not be described as human-authored;
- prompts alone are not sufficient evidence of human authorship;
- iterative human revision, selection, editing, combination, modeling, rigging, animation, retopology, texture work, or other concrete creative work should be recorded;
- do not trace or closely reproduce a modern copyrighted atlas illustration unless there is an explicit license permitting that use.

## 3. Third-party material

Every third-party element must be either:

- public domain;
- project-owned;
- independently created;
- or covered by a license that permits the intended commercial use and derivative use.

An asset cannot become REGISTRATION_READY while an unresolved third-party asset or unknown license remains.

External references used only to verify anatomical facts should be recorded separately from visual source assets.

## 4. Public-repository privacy rule

This repository is public.

Do not store:
- home address;
- resident registration number;
- private phone/email;
- signatures/seals;
- copyright-registration certificates;
- private contracts;
- private account identifiers.

Use a stable public owner code such as `LYS_IP_OWNER`. Legal identity, signed forms, certificates, and private contracts are stored outside the public repository.

## 5. Canonical registry

Machine registry:
- `data/ip-provenance-v1.json`

Machine schema:
- `data/ip-provenance-v1.schema.json`

QA:
- `scripts/ip-provenance-qa.mjs`

Registration evidence exporter:
- `scripts/export-ip-registration-package.mjs`

The registry is the canonical public metadata ledger for original project IP assets.

## 6. Required lifecycle

Recommended status flow:

`DRAFT → HUMAN_REVIEWED → REGISTRATION_READY → REGISTERED`

Optional terminal status:
`RETIRED`

Before REGISTRATION_READY, the record must contain:
- stable asset ID;
- work family and work type;
- title/version;
- creation date;
- creator role;
- human-contribution summary;
- AI-assistance disclosure;
- external-reference provenance;
- third-party asset/license status;
- source-file references;
- final-file references;
- SHA-256 for every final file;
- final human approval.

REGISTERED additionally requires a registration record/reference. The public repository may contain the registration number, but private certificates remain outside the repository.

## 7. Work families

Initial families:
- `ANATOMY_2D` — original 2D muscle/anatomy illustrations;
- `ANATOMY_3D` — original meshes, textures/materials, rigs and layered anatomy models;
- `MUSCLE_ACTION_ANIMATION` — original action/motion animation assets;
- `SOFTWARE_INTERACTION` — original viewer, transparency/layer behavior, rotation and animation-control software/UI where appropriate.

## 8. Registration package export

Run:

`node scripts/export-ip-registration-package.mjs <asset_id|all> [output_dir]`

The exporter creates an evidence manifest for eligible assets. It does not submit anything to the Korean Copyright Commission and it does not replace official forms.

The export contains:
- asset metadata;
- human creative contribution narrative;
- AI assistance disclosure;
- references and third-party/license statement;
- source/final file inventory;
- final SHA-256 identifiers;
- creation/final-approval dates;
- registration status.

If a referenced local final file exists, the exporter verifies its SHA-256 before producing the package.

## 9. Release gate

Any future self-produced 2D/3D/animation asset intended as a project-owned flagship IP asset must enter this provenance registry before it is declared final.

Global QA must fail when a REGISTRATION_READY/REGISTERED record is incomplete or when its third-party licensing state is unresolved.
