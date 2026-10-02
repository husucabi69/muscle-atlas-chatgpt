# Stage 23B active-stage guard — 2026-10-03 KST

## Purpose

Prevent scheduled or parallel work from skipping the user-locked mainline while `preview/development` is being advanced by other tasks.

## Verified start state

- Verified `preview/development` exact HEAD at this checkpoint: `18d19b4044dd27a7f4a0616956986790fcdb8dbb`.
- Latest Global QA for that exact HEAD: run `37043776590`, conclusion `success`.
- Active mainline remains **Stage 23B patient-exercise realistic assets**. Production/main remains frozen until explicit user promotion approval.
- Repository canonical patient-exercise realistic binaries currently present: `px001.webp` through `px006.webp` only.

## Source-of-truth correction

`data/patient-exercise-realistic-assets-v1.json` is authoritative for per-profile state. Historical prose in `docs/HANDOFF_CURRENT.md` contains mutually inconsistent px007 snapshots and must not override the manifest.

At this checkpoint the manifest records:

- px007: prior reviewed gen_id `8c940201-f1c0-4440-832d-83972f8efbb8` retained only in lost-candidate history; canonical binary absent; recovery state `EXACT_BINARY_UNRECOVERABLE`; next action is locked-brief regeneration **only in a user-visible/manual session or another environment that can immediately materialize the generated binary**. Do not create another gen-id-only candidate in scheduled development.
- px008–px011: reviewed `CANDIDATE_GENERATED / BINARY_HANDOFF_BLOCKED` candidates. Do not regenerate merely to obtain a file. Recover/materialize the exact candidate binary first when available.
- px012–px018: do not generate while an earlier binary handoff/recovery item remains unresolved.

## Roadmap order guard

The required order is:

1. Stage 23B realistic patient-exercise set: materialize/connect/verify all 18 profiles, including mobile and A4 behavior.
2. Stage 23B-Disease Rehab.
3. Stage 23C.
4. Stage 24.

Physical-exam realistic work such as ct083 may coexist on the branch from parallel/manual work, but scheduled development must not treat that as permission to move the Active Stage past Stage 23B.

## Scheduled-work rule while binary generation/materialization is unavailable

Do not idle and do not generate additional image-only checkpoints. Continue only Stage 23B work that is independent of unavailable binaries: registry integrity, binary handoff safety, mobile/A4 fallback behavior, print guards, regression coverage, and handoff/checkpoint consistency.

Before every write, re-read the live `preview/development` HEAD. If it moved since the run started, rebase the intended change conceptually onto the new exact HEAD or stop rather than creating a conflicting commit.
