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

## Exact-original HTML expansion — 2026-10-09 / Preview

- **Six original Disease/Trauma lectures** are now self-hosted directly from Drive HTML in `claude-library/1_강의페이지/03_질환외상/`. The original contents, styles, buttons, figures, embedded script/audio UI and relative media links remain byte-identical; no native-summary re-authoring.
- Lecture 28, Shoulder Disease: Drive `1n_21CEYrri6rw0LqeyqZER7PeihnounD`, 366718 bytes, SHA-256 `d1a77bdf96328193aa9a5ce6bbeaa6c5dd76ec98fbd5a4d94a66c4427de9a5fe`.
- Lecture 29, Shoulder Trauma: Drive `1_LgGCYaJGL_jBQZPHo8hQwwEizzZ5ptD`, 604766 bytes, SHA-256 `e8b5b8dce8a1ebfb7c02cf62495515787f10597e83fd5c2ac28747ec6488d4b1`.
- Lecture 30, Elbow Disease: Drive `1RPvoJe6Mga8OslVutO7CU1BWR8xr2xvM`, 398461 bytes, SHA-256 `b36ffb364a763f25d5055be3bfb211029183637dfc0bc904204fd1b50a86164d`.
- Lecture 31, Elbow Trauma: Drive `1FKnUrTQc8Z4Mb3rC5Br0GFJcJusvwCb7`, 572548 bytes, SHA-256 `890b804c6319860a728bff047a6904f2887d8f563e7bd8fb158bd403b60531a2`.
- Lecture 32, Wrist Disease: Drive `1YyzgbOlfGogsnhie9slvmjzrvs26JioR`, 508134 bytes, SHA-256 `8b55d687e9fd7b17cc59448bfbed09dfb629e45d66e0e741fce97bb4c9d6e012`.
- Lecture 33, Wrist Trauma: Drive `1KOjt3F-GaJe4SkWSv8WGKiw7qQnCUrhd`, 592896 bytes, SHA-256 `f78b2f7c9b8dd55b15767951b625bcf631e15b0cb32d13c484accf1dabe94955`.
- Original media keys in manifest match each relative `../../2_음성/03_질환외상/*.mp4` link. **Only lecture 28 has verified Drive MP4 bytes/hash**; lectures 29–33 have `audio_source_verification: DRIVE_MP4_IDENTITY_PENDING`. All six continue `SELF_HOSTED_HTML_MEDIA_PENDING` until private R2 objects and byte-range/audio playback are verified; do not claim audio Ready.
- Generic QA checks every self-hosted HTML against `source_bytes`, `source_sha256`, original Artifact fallback and unchanged MP4 logical path; specific immutable source locks cover 28–33. Browser E2E opens each of the six, verifies iframe content, pending media, fallback, and browser back.
- Next original HTML sync starts at lecture **34 / Disease-Trauma 07 Hand Disease**, but R2 audio pilot and source-identity verification remain mandatory before media READY. New lectures must enter the same manifest-driven path, not hard-coded replacement UI.

## Deployment incident and routing correction — 2026-10-08

- Real HTTP Preview probe detected **HTTP 200 app index HTML for a .mp4 path**. This meant Cloudflare Pages deployed static files but **did not invoke** the newly added filesystem `functions/` route. Prior mock unit tests and base deploy smoke were insufficient; the new `scripts/claude-live-media-probe.mjs` intentionally fails this condition and blocks the deploy safety gate.
- Cloudflare Pages documents Advanced Mode `_worker.js`, which bypasses filesystem-Functions compilation and uses `env.ASSETS.fetch(request)` for every non-media/static route. Preview branch now includes `_worker.js`, importing the original private R2 media handler and routing only `/claude-library/2_음성/*.mp4` to it.
- `scripts/claude-r2-proxy-qa.mjs` also tests the Advanced Mode handler while ensuring unchanged static/PWA routes still go through `ASSETS`.
- Real live route proof is **not yet PASS** until the latest exact-SHA GitHub Actions deploy-safety job shows the MP4 path returns fail-closed HTTP 503 with no R2 binding, 404 with empty R2 bucket, or correct 206 and full-source SHA-256 once uploaded. **HTTP 200 HTML is FAIL**.
- If Advanced Mode does not activate, check Cloudflare Pages project Build Command `exit 0`, project root/output folder and Functions mode in the authenticated Dashboard (official documentation recommends non-empty `exit 0` command for static sites wishing to use Pages Functions). Do not infer settings from a static deploy success.
- No authenticated R2 binding, bucket creation or MP4 upload has been performed. Production is frozen.

## Private R2 playback bridge — 2026-10-08 / Preview only

- GitHub Preview contains `functions/claude-library/2_음성/[[path]].js`, serving the unchanged relative original-HTML media path from a private R2 bucket.
- Required Cloudflare Pages **Preview environment** R2 binding name: `CLAUDE_MEDIA_R2`. R2 bucket name: `muscle-atlas-claude-media`. Do not expose the bucket via public R2.dev or a public bucket domain.
- The Function reads `/data/claude-library-manifest-v1.json` using the Pages `ASSETS` binding. It returns objects only when their key is exactly listed in `r2_object_key` or `r2_object_keys`. Adding a lecture requires a manifest/source update before its media can be fetched.
- GET and HEAD are the only supported methods. Byte-range GET/HEAD, `206 Partial Content`, `Content-Range`, and `416 Range Not Satisfiable` are implemented for seek/pause/speed controls. No upload/write/DELETE endpoint is exposed.
- `sw.js` explicitly bypasses `/claude-library/2_음성/*.mp4`, preventing PWA caching from serving wrong partial-content fragments.
- `scripts/claude-r2-proxy-qa.mjs` runs in Global QA with mock R2: manifest whitelist, path traversal blocking, full GET, range variants, HEAD, malformed/out-of-bounds range, missing bucket, missing object, and service-worker bypass.
- UI marks `SELF_HOSTED_HTML_MEDIA_PENDING` as **음성 연결 대기**. Never claim actual playback works until a real MP4 has been uploaded and full/Range/interactive player tests pass.
- **Current operational blocker:** no authenticated Cloudflare R2 write/binding session. The Function is staged as code, but no R2 object or binding has been created/verified in this session. CI simulation does not prove live R2 playback.

### R2 operator checklist — first real MP4

1. Sign in to Cloudflare independently (never provide passwords to the chat). Confirm or create **private** R2 bucket `muscle-atlas-claude-media`.
2. Upload the exact MP4 from Drive ID `1sP66rCVNFCdfZB0IswULPsVGyk-ap0Ev` to object key `2_음성/03_질환외상/클로드_질환외상_01권_어깨_질환.mp4`.
3. Before declaring success, compare bytes `14629413` and SHA-256 `2662e3f37daf7daef28c97b1141f18489baf64ad2c82a4bc5a1c79a87eae3538` against the source (R2 ETag alone is **not** a SHA-256 verifier).
4. Cloudflare Workers & Pages → `muscle-atlas-chatgpt` → Settings → Bindings → **Preview** R2 bucket: variable `CLAUDE_MEDIA_R2` → bucket `muscle-atlas-claude-media`. Deploy Preview again after binding.
5. Test original URL on the exact Preview origin:
   `/claude-library/2_음성/03_질환외상/클로드_질환외상_01권_어깨_질환.mp4`.
   A `GET` with `Range: bytes=0-1023` must return **206** and `Content-Range: bytes 0-1023/14629413`. `HEAD` must report `Accept-Ranges: bytes`. Verify real MP4 bytes and hash separately, not just HTTP 200.
6. In the same Preview, open **질환·외상 → 01 · 어깨 질환**. Verify play/pause, `이 장 듣기`, seek, speed, chapter tracking, and browser back on desktop/mobile; record exact SHA and Preview URL.
7. Only after actual verification, update manifest media READY evidence and advance to full 24-volume sync. Never touch `main` without user authorization.

Cloudflare reference: https://developers.cloudflare.com/pages/functions/bindings/ and https://developers.cloudflare.com/r2/api/workers/workers-api-reference/.

## User-facing policy

The previous ODT native-summary data may remain as an internal/archive dataset for provenance and comparison, but it is not the primary user-facing Disease/Trauma experience.
