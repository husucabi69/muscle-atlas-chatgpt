# Preview Development Policy

> **HIGHEST PRIORITY — SUPER-LOCK 2026-10-11:** time AND actual final-report delivery deadlines override feature completion, QA/deploy waits and roadmap scope. Manual development 25~30분; wrap 30~35분; report first at minute 33; 35분 HARD STOP includes the **final response actually sent**. Record real KST start/end/report, show PASS/FAIL or 미계측 for each gate, user `USER_STOP_OVERRIDE` immediately. For scheduled automation apply its separate deadline, keeping real measurement/report supremacy.

This is the long-lived development line for 이윤석정형외과 근육.

- Branch: `preview/development`
- Production: `main` stays frozen during active development
- All new work accumulates here
- Cloudflare Branch Preview is the review surface
- Each meaningful batch is visually reviewed before more work continues
- Approved batches remain in Preview and are not promoted individually
- Final Production promotion happens only after all planned development is complete and the chairman explicitly approves it
- Manual development on this branch follows the canonical timing rule: **25~30 minutes actual development, 30~35 minutes wrap-up only, 35 minute HARD STOP**, with measured start/end/report times in the final report.
- **HIGHEST PRIORITY — LOCKED 2026-10-09:** time compliance takes precedence over feature completion and deployment. Count the **final report delivery** in the 35-minute HARD STOP; no new work after 30 minutes, prepare handoff/report by minute 33, leave unfinished work PARTIAL/BLOCKED. Real KST timestamps are mandatory; user stop overrides immediately.
