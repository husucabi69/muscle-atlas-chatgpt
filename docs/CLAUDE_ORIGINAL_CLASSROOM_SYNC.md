# Claude Original Classroom — Drive → App Sync Contract

Status: **ACTIVE / PREVIEW / PRODUCTION FROZEN**
Date: 2026-10-08

## Goal

Run Claude-authored lecture pages in the Muscle Atlas with the original HTML presentation preserved. Do not summarize or re-author the lecture into simplified cards.

## Source of truth

- Google Sheet: `클로드_근육학앱 연결 목록 (강의 76개)`
- Spreadsheet ID: `1U2a6punp1zt9V4vE-N4wUpL8ziivFbSpnmiWWggk-Z0`
- The sheet defines lecture number, series, title, original HTML path, Claude Artifact fallback, and audio presence.
- Original HTML and MP4 files remain in Google Drive as authoring/source storage.
- Production runtime must not depend on an authenticated Drive session.

## Runtime

1. **HTML:** copied byte-for-byte from Drive into `claude-library/<source_path>`.
2. **Images/UI:** remain inside the original HTML; no card-summary rewrite.
3. **Audio:** large MP4 is stored in Cloudflare R2, preserving the relative logical path under `2_음성/...`.
4. **Claude Artifact:** fallback only; not the primary runtime.
5. **Manifest:** `data/claude-library-manifest-v1.json` controls menu discovery and hosting status.

## Expansion rule

A new Claude lecture does not require a new hand-coded screen.

`new/updated Drive HTML + MP4 → update source sheet → sync original bytes → update manifest → QA → Preview`

The app renders matching series dynamically from the manifest. Therefore adding a new row to a supported series can appear without changing the UI code after sync. QA uses the current 76 lectures as a minimum baseline, not a maximum; future rows are allowed as long as IDs/paths remain unique and source identity checks pass.

## Fail-closed states

- `SOURCE_VERIFIED_SYNC_PENDING`: source row exists; self-host copy not yet synced.
- `SELF_HOSTED_HTML_MEDIA_PENDING`: original HTML is self-hosted; audio is not yet available from R2.
- `SELF_HOSTED_HTML_MEDIA_READY`: original HTML and mapped R2 audio are both verified.
- Never mark READY without exact source identity and successful media fetch.

## Pilot

Lecture 28 — `질환외상 01권 어깨 질환`

- HTML Drive ID: `1n_21CEYrri6rw0LqeyqZER7PeihnounD`
- HTML bytes: `366718`
- HTML SHA-256: `d1a77bdf96328193aa9a5ce6bbeaa6c5dd76ec98fbd5a4d94a66c4427de9a5fe`
- MP4 Drive ID: `1sP66rCVNFCdfZB0IswULPsVGyk-ap0Ev`
- MP4 bytes: `14629413`
- MP4 SHA-256: `2662e3f37daf7daef28c97b1141f18489baf64ad2c82a4bc5a1c79a87eae3538`
- MP4: AAC audio-only, 1780.982 seconds.
- R2 status: **PENDING** until authenticated R2 write path is restored.

## User-facing policy

The previous ODT native-summary data may remain as an internal/archive dataset for provenance and comparison, but it is not the primary user-facing Disease/Trauma experience.
