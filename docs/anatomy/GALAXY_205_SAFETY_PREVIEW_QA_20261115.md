# Galaxy / PC real-device acceptance checklist — Anatomy 205 safety Preview
Date: 2026-11-15 KST
Build target: v12.78-preview
Status: **NOT YET TESTED ON REAL DEVICE / PREVIEW DEPLOYMENT NOT CONFIRMED**

## Preconditions
- Test **preview/development only** after confirmed Cloudflare Preview deployment; production/main must remain untouched.
- Use installed Galaxy PWA and a PC browser; record device model, browser version, time, URL and screenshots.
- Never upload patient images or PHI.

## Galaxy acceptance sequence (manual)
1. Open preview app and verify visible build version **v12.78-preview**. If old, check update prompt / Service Worker cache before assuming deployment.
2. Open **205개 근육 데이터 검증실** from main landing page.
3. Verify summary **205 identifiers / 205 with O/I/F/N / 0 without / 38 MMT holds** when the actual Knowledge Core loads. The page must identify **실제 Knowledge Core**, not fallback.
4. Search `m009` / `두판상근`; open its detail button. Confirm origin C7–T3/T4 and nuchal ligament, mastoid/superior nuchal line insertion, bilateral extension, ipsilateral rotation, and MMT safety hold notice.
5. Filter **근력검사 보류** and verify **38** entries; check `m005`, `m009`, `m129`, `m181`. No copied elbow-resistance instruction should appear as a valid test.
6. Enter Oral Viva on `m009` and confirm held MMT does not become a question or answer key. Other valid anatomy/functional prompts may remain.
7. While online, let the new Service Worker finish installing and activate only when safe. Switch to airplane mode, reopen the coverage screen, verify 205/205/0/38 from cached core. If only 183/22 appears, record **FALLBACK_USED** rather than PASS.
8. Reconnect, reload, and confirm version and Knowledge Core source. Verify touch scrolling, search, filter, details, browser Back and PWA return to home.
9. Repeat on PC Chrome/Edge for search/filter/details and version/cache status.

## Failure reporting
Record exact step, observed count/status, screenshot, device/browser, and time. Never mark unperformed steps PASS. If >=5 unresolved real-device checks accumulate, halt new feature work but continue fixes for confirmed defects.

## Expected data boundaries
- Presence of O/I/F/N in 205 records does not mean anatomical correctness approved.
- 38 MMT safety holds are intentionally unresolved pending specialist review.
- No original 3D Master, GLB, anatomical animation or CROS filing is completed by this feature.
- Do not promote to production until explicit chair approval and all required gates.
